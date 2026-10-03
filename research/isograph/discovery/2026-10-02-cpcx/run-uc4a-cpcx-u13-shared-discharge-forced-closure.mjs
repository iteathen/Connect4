import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  applyCpcxForcedEvent,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  source=buildCpcxPosition('444444776566',{geometry:g}),
  lineA='C1-D2-E3-F4',
  lineB='D2-E3-F4-G5';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function cellByLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%g.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:g,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function canonicalWing(w){
  return w.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column)
    .sort((a,b)=>a-b).join(',')==='0,1,2'&&
    cpcxCell(g,w.anchoredLine.anchorCell).column===3;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function residual(position,player,lineLabel){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  )??null;
}
function targetResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel==='B1-C2-D3-E4'&&
    o.missingCount===1&&o.missingCells[0]===cellByLabel('E4')
  )??null;
}
function oneSummary(position){
  const target=targetResidual(position);
  if(!target)return {target:null,analysis:null,ordinary:null};
  const targetCell=target.missingCells[0],
    a=analyzeCpcxOneDefectTargetReservoir(position,{
      attacker:0,targetCell,
    }),
    ordinary=certifyCpcxTruncatedTargetReservoir(position,{
      attacker:0,targetCell,
    });
  return {
    target:{
      cell:label(targetCell),
      supportDistance:target.events[0].supportDistance,
    },
    analysis:{
      kind:a.kind,
      totalRelevantEvents:a.totalRelevantEvents??null,
      minimumUncoveredResiduals:a.minimumUncoveredResiduals??null,
      fullCoverageTemplateCount:a.fullCoverageTemplateCount??null,
    },
    ordinary:{
      kind:ordinary.kind,
      exact:ordinary.exact??false,
      player:ordinary.player??null,
      seam:ordinary.seam??null,
    },
  };
}

const wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
  .find(canonicalWing);
if(!wing)throw new Error('wing missing');
const t=wing.anchoredLine.triggerCells,r=wing.anchoredLine.requiredResponseCells;
let p=materialize(source,[
  {cell:t[0],owner:0},
  {cell:r[0],owner:1},
  {cell:t[1],owner:0},
  {cell:t[2],owner:1},
  {cell:r[1],owner:0},
]);
if(!p||p.mover!==1)throw new Error('short state invalid');
for(const s of ['B3','B4','B5','C2','F4']){
  p=applyCpcxForcedEvent(p,cellByLabel(s));
  if(p.terminal)throw new Error(`${s} terminal`);
}
if(p.mover!==0)throw new Error('expected P0 after F4');

const line=residual(p,1,lineA);
if(!line||line.missingCount!==1)throw new Error('E3 singleton missing');

const e2=cellByLabel('E2'),e3=cellByLabel('E3'),rows=[];
for(const actionCell of frontier(p)){
  const cert=certifyCpcxSupportReleaseResponseNeutralization(p,{
    opponentResidual:line,
    defenderActionCell:actionCell,
  });
  if(cert.kind!=='SUPPORT_RELEASE_RESPONSE_EDGE')continue;

  let q=applyCpcxForcedEvent(p,actionCell);
  q=applyCpcxForcedEvent(q,e2);
  q=applyCpcxForcedEvent(q,e3);
  if(q.terminal)throw new Error('reserved response unexpectedly terminal');

  const before=oneSummary(q),
    closed=closeCpcxForcedResponses(q),
    after=closed.kind==='OPEN'?oneSummary(closed.position):null,
    existing=closed.kind==='OPEN'
      ?runCpcxFirstWinCertificate(closed.position,{attacker:0})
      :null;

  rows.push({
    controllerAction:label(actionCell),
    beforeNormalization:{
      rank:q.rank,
      mover:q.mover,
      support:Array.from(q.heights),
      target:before,
      remainingGapLines:scanCpcxObligations(q)
        .filter(o=>o.player===1&&[lineA,lineB].includes(o.lineLabel))
        .map(o=>o.lineLabel),
    },
    normalization:{
      kind:closed.kind,
      player:closed.player??null,
      stepCount:closed.steps?.length??0,
      steps:(closed.steps??[]).map(s=>({
        cell:label(s.cell),
        player:s.player,
      })),
      boundary:closed.boundary?.kind??null,
    },
    afterNormalization:closed.kind==='OPEN'?{
      rank:closed.position.rank,
      mover:closed.position.mover,
      support:Array.from(closed.position.heights),
      target:after,
      existingCertificate:{
        kind:existing.kind,
        exact:existing.exact??false,
        player:existing.player??null,
        seam:existing.seam??null,
        traceLength:existing.trace?.length??0,
      },
    }:null,
  });
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13-shared-discharge-forced-closure.v0_1',
  rows,
  summary:{
    pathCount:rows.length,
    allGapLinesKilledBeforeNormalization:rows.every(r=>
      r.beforeNormalization.remainingGapLines.length===0
    ),
    normalizationKinds:[...new Set(rows.map(r=>r.normalization.kind))].sort(),
    normalizationStepCounts:[...new Set(rows.map(r=>
      r.normalization.stepCount
    ))].sort((a,b)=>a-b),
    targetMeasuresBefore:[...new Set(rows.map(r=>
      r.beforeNormalization.target.analysis?.totalRelevantEvents
    ).filter(Number.isInteger))].sort((a,b)=>a-b),
    targetMeasuresAfter:[...new Set(rows.map(r=>
      r.afterNormalization?.target.analysis?.totalRelevantEvents
    ).filter(Number.isInteger))].sort((a,b)=>a-b),
    existingFirstWinActions:rows.filter(r=>
      r.afterNormalization?.existingCertificate.kind==='CERTIFIED_FIRST_WIN'&&
      r.afterNormalization.existingCertificate.player===0
    ).map(r=>r.controllerAction),
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    onlyQualifiedNeutralizationPlusDeterministicForcedClosure:true,
    noArbitraryReplyTraversal:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
  },
},null,2));
