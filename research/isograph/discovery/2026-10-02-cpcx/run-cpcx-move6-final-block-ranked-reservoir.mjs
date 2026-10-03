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
import {
  canonicalizeCpcxExactReflection,
  reflectCpcxCell,
} from './cpcx-control-quotient.mjs';
import {
  certifyCpcxTruncatedTargetReservoir,
  analyzeCpcxTruncatedTargetReservoirCoverage,
} from './cpcx-reservoir.mjs';
import {
  certifyCpcxReservoirCoverageGapRcic,
  certifyCpcxReservoirAttachmentRcic,
} from './cpcx-reservoir-gap-rcic.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

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
function pairCandidates(position){
  const rows=[];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==0||o.missingCount!==2)continue;
    const events=o.missingCells.map(cell=>{
      const {column,row}=cpcxCell(g,cell);
      return {
        cell,
        column,
        row,
        distance:row-position.heights[column],
      };
    });
    const playable=events.filter(x=>x.distance===0);
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
  return rows.sort((a,b)=>
    a.targetDistance-b.targetDistance||
    a.orientation.localeCompare(b.orientation)||
    a.lineId-b.lineId||
    a.setupCell-b.setupCell
  );
}
function existing(position){
  if(position.terminal)return {
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:position.terminal.player,
    seam:null,
    source:'TERMINAL',
  };
  const c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:c.kind,
    exact:c.exact,
    player:c.player??null,
    seam:c.seam??null,
    source:c.trace?.[0]?.progress?.source??c.trace?.[0]?.progress?.kind??null,
    traceLength:c.trace?.length??0,
  };
}
function exactCertificate(position,targetCell){
  const base=existing(position);
  if(base.kind==='CERTIFIED_FIRST_WIN'&&base.player===0)return {
    route:'EXISTING_CPCX',
    certificate:base,
  };
  const ordinary=certifyCpcxTruncatedTargetReservoir(
    position,{attacker:0,targetCell}
  );
  if(ordinary.kind==='CERTIFIED_FIRST_WIN')return {
    route:'TRUNCATED_TARGET_RESERVOIR',
    certificate:{
      kind:ordinary.kind,
      exact:ordinary.exact,
      player:ordinary.player,
      target:ordinary.target?.label??null,
    },
  };

  const coverage=analyzeCpcxTruncatedTargetReservoirCoverage(
    position,{attacker:0,targetCell}
  );
  if(coverage.kind!=='TRUNCATED_TARGET_STATIC_COVERAGE_GAP')return {
    route:'NO_CERTIFICATE',
    certificate:{
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:coverage.kind,
    },
    coverage,
  };

  const lex=certifyCpcxReservoirCoverageGapRcic(
      position,{attacker:0,targetCell,maxNodes:4096}
    ),
    finite=certifyCpcxReservoirAttachmentRcic(
      position,{attacker:0,targetCell,maxNodes:8192}
    );
  if(finite.kind==='CERTIFIED_FIRST_WIN')return {
    route:'FINITE_RESERVOIR_ATTACHMENT_RCIC',
    certificate:{
      kind:finite.kind,
      exact:finite.exact,
      player:finite.player,
      rootGap:finite.rootGap,
      rootReservoirRank:finite.rootReservoirRank,
      nodeCount:finite.nodeCount,
      reservoirRanks:finite.reservoirRanks,
    },
    coverage,
    lex:{
      kind:lex.kind,player:lex.player??null,seam:lex.seam??null,
      rootGap:lex.rootGap??null,nodeCount:lex.nodeCount??null,
    },
  };
  if(lex.kind==='CERTIFIED_FIRST_WIN')return {
    route:'LEXICOGRAPHIC_COVERAGE_RCIC',
    certificate:{
      kind:lex.kind,
      exact:lex.exact,
      player:lex.player,
      rootGap:lex.rootGap,
      nodeCount:lex.nodeCount,
      measures:lex.measures,
    },
    coverage,
    finite:{
      kind:finite.kind,player:finite.player??null,seam:finite.seam??null,
      rootGap:finite.rootGap??null,
      rootReservoirRank:finite.rootReservoirRank??null,
      nodeCount:finite.nodeCount??null,
    },
  };
  return {
    route:'NO_CERTIFICATE',
    certificate:{
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'RANKED_RESERVOIR_ROUTES_UNRESOLVED',
    },
    coverage,
    lex:{
      kind:lex.kind,player:lex.player??null,seam:lex.seam??null,
      rootGap:lex.rootGap??null,nodeCount:lex.nodeCount??null,
      unresolvedNodeCount:lex.unresolvedNodeCount??null,
    },
    finite:{
      kind:finite.kind,player:finite.player??null,seam:finite.seam??null,
      rootGap:finite.rootGap??null,
      rootReservoirRank:finite.rootReservoirRank??null,
      nodeCount:finite.nodeCount??null,
      unresolvedNodeCount:finite.unresolvedNodeCount??null,
    },
  };
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
for(const row of classes.values()){
  const position=row.position,
    pairs=pairCandidates(position),
    pair=pairs[0]??null;
  if(!pair){
    rows.push({
      sources:row.sources,
      rank:position.rank,
      support:Array.from(position.heights),
      pair:null,
      result:{route:'NO_PAIR_CANDIDATE',certificate:{kind:'NO_CERTIFICATE',exact:false}},
    });
    continue;
  }
  const afterSetup=applyCpcxForcedEvent(position,pair.setupCell),
    canonicalTarget=pair.targetCell,
    result=afterSetup.terminal
      ?{
        route:'TERMINAL_ON_PAIR_SETUP',
        certificate:{
          kind:'CERTIFIED_FIRST_WIN',
          exact:true,
          player:afterSetup.terminal.player,
        },
      }
      :exactCertificate(afterSetup,canonicalTarget);
  rows.push({
    sources:row.sources,
    rank:position.rank,
    support:Array.from(position.heights),
    pair:{
      lineId:pair.lineId,
      lineLabel:pair.lineLabel,
      orientation:pair.orientation,
      distances:pair.distances,
      setupCell:label(pair.setupCell),
      targetCell:label(pair.targetCell),
      targetDistance:pair.targetDistance,
    },
    afterSetup:{
      rank:afterSetup.rank,
      mover:afterSetup.mover,
      support:Array.from(afterSetup.heights),
    },
    result,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.final-block-ranked-reservoir.v0_1',
  root:'44444',
  exactReflectionClassCount:rows.length,
  rows,
  summary:{
    routeCounts:rows.reduce((m,x)=>
      (m[x.result.route]=(m[x.result.route]??0)+1,m),{}
    ),
    certifiedClassCount:rows.filter(x=>
      x.result.certificate?.kind==='CERTIFIED_FIRST_WIN'&&
      x.result.certificate?.player===0
    ).length,
    allFinalBlockClassesCertified:rows.every(x=>
      x.result.certificate?.kind==='CERTIFIED_FIRST_WIN'&&
      x.result.certificate?.player===0
    ),
  },
  premises:{
    standardBoard:'7x6',
    exactReflectionQuotient:true,
    pairSelection:'mechanical P0 two-piece residual with exactly one playable endpoint, minimum latent support distance then orientation/line id',
    proofRoutesOnly:[
      'existing exact CPCX first-win',
      'qualified truncated target reservoir',
      'candidate lexicographic coverage RCIC',
      'candidate finite-reservoir attachment RCIC',
    ],
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));
