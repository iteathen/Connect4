// CPCX — CPC Extended research prototype.
//
// Scope:
// - standalone research code; does not import or modify production CPC;
// - standard finite-gravity Connect-K geometry, with CPCX v0.1 bounded to
//   obligations containing at most four missing cells;
// - constructs current rank-local obligation/residual structure only;
// - no recursive game traversal, solved values, or external solved-data inputs.
//
// Research direction / structural architecture / invariant-first program: Josh Oshiro.
// Prototype formalization / implementation: OpenAI ChatGPT.

const CPCX_MAX_MISSING = 4;

export function createCpcxGeometry({columns=7,rows=6,connect=4}={}){
  if(!Number.isInteger(columns)||columns<1)throw new RangeError('columns');
  if(!Number.isInteger(rows)||rows<1)throw new RangeError('rows');
  if(!Number.isInteger(connect)||connect<1||connect>Math.max(columns,rows))
    throw new RangeError('connect');

  const dirs=[
    {name:'H',dc:1,dr:0},
    {name:'V',dc:0,dr:1},
    {name:'D+',dc:1,dr:1},
    {name:'D-',dc:1,dr:-1},
  ];
  const lines=[];
  let id=0;
  for(let row=0;row<rows;row+=1)for(let column=0;column<columns;column+=1){
    for(const d of dirs){
      const cells=[];
      for(let i=0;i<connect;i+=1){
        const c=column+i*d.dc,r=row+i*d.dr;
        if(c<0||c>=columns||r<0||r>=rows){cells.length=0;break;}
        cells.push(r*columns+c);
      }
      if(cells.length===connect)lines.push({id:id++,orientation:d.name,cells});
    }
  }

  const cellLines=Array.from({length:columns*rows},()=>[]);
  for(const line of lines)for(const cell of line.cells)cellLines[cell].push(line.id);

  return Object.freeze({columns,rows,connect,cellCount:columns*rows,lines,cellLines});
}

export function parseCpcxMoves(moves,columns=7){
  if(typeof moves==='string'){
    const out=new Uint32Array(moves.length);
    for(let i=0;i<moves.length;i+=1){
      const c=moves.charCodeAt(i)-48;
      if(c<1||c>columns)throw new RangeError('move string column');
      out[i]=c-1;
    }
    return out;
  }
  if(Array.isArray(moves)||moves instanceof Uint32Array||moves instanceof Int32Array){
    const out=new Uint32Array(moves.length);
    for(let i=0;i<moves.length;i+=1){
      const c=Number(moves[i]);
      if(!Number.isInteger(c)||c<0||c>=columns)throw new RangeError('move column');
      out[i]=c;
    }
    return out;
  }
  throw new TypeError('moves must be one-based digit string or zero-based integer sequence');
}

function hasConnect(geometry,owner,player){
  for(const line of geometry.lines){
    let full=1;
    for(const cell of line.cells)if(owner[cell]!==player){full=0;break;}
    if(full)return line.id;
  }
  return -1;
}

export function buildCpcxPosition(moves,{geometry=createCpcxGeometry(),allowPostTerminal=false}={}){
  const seq=parseCpcxMoves(moves,geometry.columns),
    heights=new Uint32Array(geometry.columns),
    owner=new Int8Array(geometry.cellCount);
  owner.fill(-1);

  let terminalLine=-1,terminalPlayer=-1;
  for(let ply=0;ply<seq.length;ply+=1){
    if(terminalLine>=0&&!allowPostTerminal)throw new RangeError('moves continue after terminal');
    const column=seq[ply],row=heights[column];
    if(row>=geometry.rows)throw new RangeError('column overflow');
    const player=ply&1,cell=row*geometry.columns+column;
    owner[cell]=player;heights[column]=row+1;
    const line=hasConnect(geometry,owner,player);
    if(line>=0){terminalLine=line;terminalPlayer=player;}
  }

  return {
    geometry,
    moves:seq,
    rank:seq.length,
    mover:seq.length&1,
    heights,
    owner,
    terminal:terminalLine>=0?{player:terminalPlayer,lineId:terminalLine}:null,
  };
}

export function cpcxCell(geometry,cell){
  if(!Number.isInteger(cell)||cell<0||cell>=geometry.cellCount)throw new RangeError('cell');
  return {cell,column:cell%geometry.columns,row:Math.floor(cell/geometry.columns)};
}

export function cpcxEventMetadata(position,cell){
  const {geometry:g,heights,mover}=position,
    {column,row}=cpcxCell(g,cell),
    height=heights[column];
  if(row<height)return {
    cell,column,row,occupied:true,supportDistance:-1,eventRank:0,
    zeroReservationOwner:position.owner[cell],supportCells:[],
  };

  const supportDistance=row-height;
  let eventRank=supportDistance+1;
  for(let c=0;c<g.columns;c+=1)if(c!==column)eventRank+=g.rows-heights[c];

  const supportCells=[];
  for(let r=height;r<row;r+=1)supportCells.push(r*g.columns+column);

  return {
    cell,column,row,occupied:false,
    supportDistance,
    eventRank,
    zeroReservationOwner:mover^((eventRank-1)&1),
    supportCells,
  };
}

export function cpcxColumnProfiles(position){
  const {geometry:g,heights}=position;
  return Array.from({length:g.columns},(_,column)=>{
    const remaining=g.rows-heights[column];
    return {
      column,
      height:heights[column],
      remaining,
      neutralPairCount:remaining>>>1,
      unmatchedTopDefect:remaining&1,
      topCell:remaining?((g.rows-1)*g.columns+column):-1,
    };
  });
}

function labelCell(g,cell){
  const {column,row}=cpcxCell(g,cell);
  const col=column<26?String.fromCharCode(65+column):`C${column+1}`;
  return `${col}${row+1}`;
}

export function labelCpcxLine(geometry,line){
  const L=typeof line==='number'?geometry.lines[line]:line;
  return L.cells.map(cell=>labelCell(geometry,cell)).join('-');
}

function classifySupportShape(g,missing){
  if(missing.length<=1)return 'SINGLE';
  const c=missing[0]%g.columns;
  for(let i=1;i<missing.length;i+=1)if(missing[i]%g.columns!==c)return 'MULTI_COLUMN';
  return 'SAME_COLUMN_CHAIN';
}

export function scanCpcxObligations(position,{minMissing=1,maxMissing=CPCX_MAX_MISSING}={}){
  if(!Number.isInteger(minMissing)||minMissing<1)throw new RangeError('minMissing');
  if(!Number.isInteger(maxMissing)||maxMissing<minMissing||maxMissing>CPCX_MAX_MISSING)
    throw new RangeError('maxMissing must be between minMissing and 4');

  const {geometry:g,owner}=position,profiles=cpcxColumnProfiles(position),out=[];
  for(let player=0;player<2;player+=1){
    const opponent=player^1;
    for(const line of g.lines){
      let killed=0;
      const missing=[];
      for(const cell of line.cells){
        if(owner[cell]===opponent){killed=1;break;}
        if(owner[cell]===-1)missing.push(cell);
      }
      if(killed||missing.length<minMissing||missing.length>maxMissing)continue;

      const events=missing.map(cell=>cpcxEventMetadata(position,cell));
      const touchedColumns=[...new Set(events.map(e=>e.column))];
      out.push({
        id:`p${player}:l${line.id}`,
        player,
        lineId:line.id,
        lineLabel:labelCpcxLine(g,line),
        orientation:line.orientation,
        missingCount:missing.length,
        missingCells:missing,
        events,
        currentlyPlayableCells:events.filter(e=>e.supportDistance===0).map(e=>e.cell),
        projectedOwnerVector:events.map(e=>e.zeroReservationOwner),
        supportShape:classifySupportShape(g,missing),
        touchedColumnProfiles:touchedColumns.map(c=>profiles[c]),
        maxSupportDistance:events.reduce((m,e)=>Math.max(m,e.supportDistance),0),
        latestZeroReservationEventRank:events.reduce((m,e)=>Math.max(m,e.eventRank),0),
        status:missing.length===1&&events[0].supportDistance===0
          ?'CURRENT_SINGLETON_OBLIGATION'
          :'LATENT_MULTI_PIECE_OBLIGATION',
        proofBoundary:'zero-reservation ownership is projection metadata until response/resource/deadline guards certify it',
      });
    }
  }
  return out;
}

export function buildCpcxEventEffects(position,obligations=scanCpcxObligations(position)){
  const {geometry:g,owner}=position,effects=[];
  const byCell=Array.from({length:g.cellCount},()=>[]);
  for(const obligation of obligations)
    for(const cell of obligation.missingCells)byCell[cell].push(obligation);

  for(let cell=0;cell<g.cellCount;cell++){
    if(owner[cell]!==-1)continue;
    for(let eventOwner=0;eventOwner<2;eventOwner++){
      const contracts=[],kills=[];
      for(const obligation of byCell[cell]){
        if(obligation.player===eventOwner){
          contracts.push({
            obligationId:obligation.id,
            fromMissing:obligation.missingCount,
            toMissing:obligation.missingCount-1,
            becomesTerminal:obligation.missingCount===1,
          });
        }else{
          kills.push({obligationId:obligation.id,fromMissing:obligation.missingCount});
        }
      }
      effects.push({
        cell,
        cellLabel:labelCell(g,cell),
        owner:eventOwner,
        contracts,
        kills,
        event:cpcxEventMetadata(position,cell),
      });
    }
  }
  return effects;
}

export function contractCpcxObligation(obligation,cell){
  const at=obligation.missingCells.indexOf(cell);
  if(at<0)return null;
  const remaining=obligation.missingCells.slice(0,at).concat(obligation.missingCells.slice(at+1));
  return {
    obligationId:obligation.id,
    acquiredCell:cell,
    remainingCells:remaining,
    remainingCount:remaining.length,
    consequence:remaining.length===0?'COMPLETION':'LOWER_CARDINALITY_OBLIGATION',
    requiresSupportReevaluation:remaining.length>0,
  };
}

export function buildCpcxContractionDag(obligation){
  const cells=obligation.missingCells,k=cells.length;
  if(k<1||k>CPCX_MAX_MISSING)throw new RangeError('obligation cardinality');
  const full=(1<<k)-1,nodes=[],edges=[];
  for(let mask=1;mask<=full;mask++){
    const remaining=[];
    for(let i=0;i<k;i+=1)if(mask&(1<<i))remaining.push(cells[i]);
    nodes.push({mask,remainingCells:remaining,remainingCount:remaining.length});
    for(let i=0;i<k;i++)if(mask&(1<<i)){
      const next=mask&~(1<<i);
      edges.push({
        from:mask,
        eventCell:cells[i],
        eventOwner:obligation.player,
        kind:next?'OWNER_CONTRACTS':'OWNER_COMPLETES',
        to:next,
      });
      edges.push({
        from:mask,
        eventCell:cells[i],
        eventOwner:obligation.player^1,
        kind:'DEFENDER_KILLS',
        to:0,
      });
    }
  }
  return {
    obligationId:obligation.id,
    sourceCardinality:k,
    nodes,
    edges,
    boundary:'residual algebra only; event legality/support/deadlines must be reevaluated before composing temporal claims',
  };
}

export function summarizeCpcx(position,{maxMissing=CPCX_MAX_MISSING}={}){
  const obligations=scanCpcxObligations(position,{maxMissing});
  const byPlayer=[{1:0,2:0,3:0,4:0},{1:0,2:0,3:0,4:0}];
  for(const o of obligations)byPlayer[o.player][o.missingCount]+=1;
  return {
    schema:'connect4.cpcx.summary.v0_1',
    rank:position.rank,
    mover:position.mover,
    terminal:position.terminal,
    maxMissing,
    obligationCount:obligations.length,
    byPlayer,
    currentSingletons:obligations.filter(o=>o.status==='CURRENT_SINGLETON_OBLIGATION')
      .map(o=>({player:o.player,id:o.id,line:o.lineLabel,cell:o.missingCells[0]})),
    columns:cpcxColumnProfiles(position),
    premises:{
      recursiveGameTraversal:false,
      solvedValues:false,
      oracle:false,
      obligationCardinalityBound:4,
      productionCpcModified:false,
    },
  };
}

export function cpcxFixedCardinalityComplexity({lineCount,maxMissing=CPCX_MAX_MISSING}){
  if(!Number.isInteger(lineCount)||lineCount<0)throw new RangeError('lineCount');
  if(!Number.isInteger(maxMissing)||maxMissing<1||maxMissing>CPCX_MAX_MISSING)
    throw new RangeError('maxMissing');
  const maxResidualStatesPerLiveLine=(1<<maxMissing)-1;
  const maxOwnerEdgesPerLiveLine=maxMissing*(1<<(maxMissing-1));
  return {
    maxMissing,
    maxResidualStatesPerLiveLine,
    maxOwnerEdgesPerLiveLine,
    maxTwoPlayerResidualStates:2*lineCount*maxResidualStatesPerLiveLine,
    statement:'For CPCX v0.1 maxMissing is fixed <=4, so residual-state expansion is O(lineCount); event indexing is O(lineCount*connect).',
  };
}

export {CPCX_MAX_MISSING};
