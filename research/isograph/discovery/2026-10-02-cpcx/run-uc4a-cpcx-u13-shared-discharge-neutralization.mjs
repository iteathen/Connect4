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
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';

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
  for(let i=0;i<events.length;i++)out[position.moves.length+i]=events[i].cell%g.columns;
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
function summaryResidual(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    missingCount:r.missingCount,
    missing:r.missingCells.map(label),
    support:r.events.map(e=>e.supportDistance),
    playable:r.currentlyPlayableCells.map(label),
  };
}
function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    seam:p.seam??p.reason??null,
    macroKind:p.macro?.kind??null,
    primaryCell:Number.isInteger(p.macro?.primaryCell)?label(p.macro.primaryCell):null,
    secondaryCell:Number.isInteger(p.macro?.secondaryCell)?label(p.macro.secondaryCell):null,
    blockerCells:(p.obligation?.blockingCells??[]).map(label),
  };
}

const wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
  .find(canonicalWing);
if(!wing)throw new Error('canonical wing missing');

const t=wing.anchoredLine.triggerCells,
  r=wing.anchoredLine.requiredResponseCells,
  short=materialize(source,[
    {cell:t[0],owner:0},
    {cell:r[0],owner:1},
    {cell:t[1],owner:0},
    {cell:t[2],owner:1},
    {cell:r[1],owner:0},
  ]);
if(!short||short.mover!==1)throw new Error('one-support-short state invalid');

let p=applyCpcxForcedEvent(short,cellByLabel('B3'));
if(p.terminal||p.mover!==0)throw new Error('B3 state invalid');
p=applyCpcxForcedEvent(p,cellByLabel('B4'));
if(p.terminal||p.mover!==1)throw new Error('B4 state invalid');
p=applyCpcxForcedEvent(p,cellByLabel('B5'));
if(p.terminal||p.mover!==0)throw new Error('B5 block state invalid');
p=applyCpcxForcedEvent(p,cellByLabel('C2'));
if(p.terminal||p.mover!==1)throw new Error('C2 transfer state invalid');

const beforeF4A=residual(p,1,lineA),
  beforeF4B=residual(p,1,lineB);
if(!beforeF4A||!beforeF4B)throw new Error('expected uncovered residuals missing');
const f4=cellByLabel('F4');
if(!frontier(p).includes(f4))throw new Error('F4 not current frontier');

const afterF4=applyCpcxForcedEvent(p,f4);
if(afterF4.terminal||afterF4.mover!==0)throw new Error('F4 event invalid');

const afterF4A=residual(afterF4,1,lineA),
  afterF4B=residual(afterF4,1,lineB);
if(!afterF4A||afterF4A.missingCount!==1)throw new Error('E3 singleton not derived');

const e3=cellByLabel('E3'),
  e2=cellByLabel('E2'),
  rows=[];

for(const actionCell of frontier(afterF4)){
  const cert=certifyCpcxSupportReleaseResponseNeutralization(afterF4,{
    opponentResidual:afterF4A,
    defenderActionCell:actionCell,
  });
  const row={
    controllerAction:label(actionCell),
    certificate:{
      kind:cert.kind,
      exact:cert.exact??false,
      seam:cert.seam??null,
      trigger:cert.responseEdge?label(cert.responseEdge.triggerCell):null,
      response:cert.responseEdge?label(cert.responseEdge.responseCell):null,
    },
  };
  if(cert.kind==='SUPPORT_RELEASE_RESPONSE_EDGE'){
    const a=applyCpcxForcedEvent(afterF4,actionCell);
    if(a.terminal)throw new Error('qualified pinned action unexpectedly terminal');
    const b=applyCpcxForcedEvent(a,e2);
    if(b.terminal)throw new Error('qualified supply unexpectedly terminal');
    const c=applyCpcxForcedEvent(b,e3);
    if(c.terminal&&c.terminal.player!==0)
      throw new Error('qualified response produced opponent terminal');

    const remainingP1=scanCpcxObligations(c)
      .filter(o=>o.player===1);
    row.afterReservedResponse={
      terminal:c.terminal,
      lineA:summaryResidual(remainingP1.find(o=>o.lineLabel===lineA)??null),
      lineB:summaryResidual(remainingP1.find(o=>o.lineLabel===lineB)??null),
      bothUncoveredLinesKilled:
        !remainingP1.some(o=>o.lineLabel===lineA||o.lineLabel===lineB),
      progress:c.terminal?null:progressSummary(classifyCpcxProgress(c,{player:0})),
      support:Array.from(c.heights),
      rank:c.rank,
      mover:c.mover,
    };
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13-shared-discharge-neutralization.v0_1',
  observation:'the two U13 one-defect coverage gaps share F4 then E3; test whether one reserved E3 response discharges both',
  source:{
    rank:p.rank,
    mover:p.mover,
    lineA:summaryResidual(beforeF4A),
    lineB:summaryResidual(beforeF4B),
    f4:label(f4),
  },
  afterF4:{
    rank:afterF4.rank,
    mover:afterF4.mover,
    lineA:summaryResidual(afterF4A),
    lineB:summaryResidual(afterF4B),
    sharedDelayedCell:label(e3),
    releaseCell:label(e2),
  },
  rows,
  summary:{
    candidateActionCount:rows.length,
    certifiedNeutralizationActions:rows
      .filter(x=>x.certificate.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
      .map(x=>x.controllerAction),
    everyCertifiedActionKillsBothGapResiduals:rows
      .filter(x=>x.certificate.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
      .every(x=>x.afterReservedResponse?.bothUncoveredLinesKilled===true),
    resultingProgressKinds:[...new Set(rows
      .filter(x=>x.certificate.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
      .map(x=>x.afterReservedResponse?.progress?.kind??(
        x.afterReservedResponse?.terminal?'TERMINAL':'NONE'
      )))].sort(),
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    currentFrontierSynthesisOnly:true,
    noFutureReplyTree:true,
    noValueConclusion:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
  },
},null,2));
