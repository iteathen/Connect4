import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  compileCpcxPostActionWingAttack,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {canonicalizeCpcxExactReflection} from './cpcx-control-quotient.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  certifyCpcxOneDefectAttachmentRcic,
} from './cpcx-one-defect-attachment-rcic.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%position.geometry.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function frontierFromHeights(heights){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function pairCandidate(position){
  const rows=[];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==0||o.missingCount!==2)continue;
    const events=o.missingCells.map(cell=>{
      const {column,row}=cpcxCell(g,cell);
      return {cell,column,row,distance:row-position.heights[column]};
    }),playable=events.filter(x=>x.distance===0);
    if(playable.length!==1)continue;
    const setup=playable[0],
      target=events.find(x=>x.cell!==setup.cell);
    rows.push({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      setupCell:setup.cell,
      targetCell:target.cell,
      targetDistance:target.distance,
      distances:events.map(x=>x.distance).sort((a,b)=>a-b),
    });
  }
  rows.sort((a,b)=>
    a.targetDistance-b.targetDistance||
    a.orientation.localeCompare(b.orientation)||
    a.lineId-b.lineId||
    a.setupCell-b.setupCell
  );
  return rows[0]??null;
}

const classes=new Map();
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const actionCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    first=verifyCpcxFixedEventScript(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
    ]);
  if(!first.legal||first.terminal)throw new Error('invalid first decision');

  for(const defenderCell of frontierFromHeights(first.finalHeights)){
    if(defenderCell===t2||defenderCell===t3)continue;
    const afterT2=materialize(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
      {cell:t2,owner:0},
    ]);
    if(!afterT2)throw new Error('invalid nonsteal prefix');
    const immediate=classifyCpcxImmediate(afterT2);
    if(immediate.kind!=='FORCED_RESPONSE'||immediate.cell!==t3)
      throw new Error('expected forced final trigger block');
    const state=applyCpcxForcedEvent(afterT2,t3);
    if(state.terminal)throw new Error('final block terminal');
    const canonical=canonicalizeCpcxExactReflection(state);
    if(!classes.has(canonical.key))classes.set(canonical.key,{
      position:canonical.position,
      sources:[],
    });
    classes.get(canonical.key).sources.push({
      sixthMove:sixthColumn+1,
      firstReply:label(defenderCell),
    });
  }
}

const rows=[];
for(const item of classes.values()){
  const pair=pairCandidate(item.position);
  if(!pair){
    rows.push({
      sources:item.sources,
      pair:null,
      result:{kind:'NO_CERTIFICATE',seam:'NO_PAIR_CANDIDATE'},
    });
    continue;
  }
  const child=applyCpcxForcedEvent(item.position,pair.setupCell),
    analysis=child.terminal?null:analyzeCpcxOneDefectTargetReservoir(
      child,{attacker:0,targetCell:pair.targetCell}
    ),
    certificate=child.terminal
      ?{
        kind:child.terminal.player===0?'CERTIFIED_FIRST_WIN':'NO_CERTIFICATE',
        exact:child.terminal.player===0,
        player:child.terminal.player,
        seam:child.terminal.player===0?null:'P1_TERMINAL_ON_SETUP',
      }
      :certifyCpcxOneDefectAttachmentRcic(child,{
        attacker:0,
        targetCell:pair.targetCell,
        maxNodes:8192,
        useCpc2Restriction:true,
      });

  rows.push({
    sources:item.sources,
    rank:item.position.rank,
    support:Array.from(item.position.heights),
    pair:{
      lineId:pair.lineId,
      lineLabel:pair.lineLabel,
      orientation:pair.orientation,
      distances:pair.distances,
      setupCell:label(pair.setupCell),
      targetCell:label(pair.targetCell),
      targetDistance:pair.targetDistance,
    },
    oneDefectAnalysis:analysis?{
      kind:analysis.kind,
      totalRelevantEvents:analysis.totalRelevantEvents??null,
      minimumUncoveredResiduals:analysis.minimumUncoveredResiduals??null,
      fullCoverageTemplateCount:analysis.fullCoverageTemplateCount??null,
      selectedDefect:analysis.selectedFullCoverageTemplate?.defect?.cellLabel??null,
    }:null,
    result:{
      kind:certificate.kind,
      exact:certificate.exact,
      player:certificate.player??null,
      seam:certificate.seam??null,
      rootGap:certificate.rootGap??null,
      rootReservoirRank:certificate.rootReservoirRank??null,
      nodeCount:certificate.nodeCount??null,
      certifiedNodeCount:certificate.certifiedNodeCount??null,
      unresolvedNodeCount:certificate.unresolvedNodeCount??null,
      reservoirRanks:certificate.reservoirRanks??null,
      cpc2RestrictionTransport:certificate.cpc2RestrictionTransport??null,
      firstUnresolved:(certificate.unresolvedNodes??[])[0]??null,
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.final-block-one-defect-attachment.v0_1',
  root:'44444',
  exactReflectionClassCount:rows.length,
  rows,
  summary:{
    classCount:rows.length,
    certifiedClassCount:rows.filter(x=>
      x.result.kind==='CERTIFIED_FIRST_WIN'&&x.result.player===0
    ).length,
    allCertified:rows.every(x=>
      x.result.kind==='CERTIFIED_FIRST_WIN'&&x.result.player===0
    ),
    seamCounts:rows.reduce((m,x)=>{
      const k=x.result.kind==='CERTIFIED_FIRST_WIN'
        ?'CERTIFIED_FIRST_WIN'
        :x.result.seam??x.result.kind;
      m[k]=(m[k]??0)+1;
      return m;
    },{}),
    analysisCounts:rows.reduce((m,x)=>{
      const k=x.oneDefectAnalysis?.kind??'NONE';
      m[k]=(m[k]??0)+1;
      return m;
    },{}),
  },
  premises:{
    standardBoard:'7x6',
    exactReflectionQuotient:true,
    pairSelection:'mechanical unique P0 two-piece residual with exactly one playable endpoint',
    proofClassCandidate:'cpcx-one-defect-attachment-rcic.mjs',
    runtimePromoted:false,
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));
