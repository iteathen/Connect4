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
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  composeCpcxForcingMacro,
  runCpcxFirstWinCertificate,
} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  source=buildCpcxPosition('444444776566',{geometry:g});

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
function residual(position,player,lineLabel){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  )??null;
}
function residualSummary(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    orientation:r.orientation,
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
if(!p||p.mover!==1)throw new Error('short invalid');

// Chosen structural path:
// P1 B3 escape; P0 B4 support; P1 B5 block; P0 C2 transfer;
// P1 F4 gap trigger; P0 A3 shared-discharge action; P1 E2 support;
// P0 E3 response; forced P1 E4 target block.
for(const s of ['B3','B4','B5','C2','F4','A3','E2','E3']){
  p=applyCpcxForcedEvent(p,cellByLabel(s));
  if(p.terminal)throw new Error(`${s} terminal`);
}
const closed=closeCpcxForcedResponses(p);
if(closed.kind!=='OPEN')throw new Error('expected open forced closure');
p=closed.position;
if(p.mover!==0)throw new Error('expected P0 after E4 block');

const three=residual(p,0,'A3-A4-A5-A6');
if(!three||three.missingCount!==3)
  throw new Error('A vertical three-stage residual missing');

const a4=cellByLabel('A4'),
  setup=applyCpcxForcedEvent(p,a4);
if(setup.terminal)throw new Error('A4 unexpectedly terminal');

const immediate=classifyCpcxImmediate(setup),
  demands=findCpcxVerticalTwoStageObligations(setup,{player:0}),
  demand=demands.find(d=>
    label(d.lowerCell)==='A5'&&label(d.upperCell)==='A6'
  );
if(!demand)throw new Error('A5/A6 two-stage demand missing');

const certificate=certifyCpcxVerticalTwoStage(setup,demand),
  progress=classifyCpcxProgress(setup,{player:0}),
  composed=progress.kind==='CERTIFIED_FORCING_MACRO'
    ?composeCpcxForcingMacro(setup,progress)
    :null,
  firstWin=runCpcxFirstWinCertificate(setup,{attacker:0});

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13.vertical-three-stage-setup.v0_1',
  sourceAfterTargetBlock:{
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    residual:residualSummary(three),
  },
  setup:{
    cell:'A4',
    rank:setup.rank,
    mover:setup.mover,
    support:Array.from(setup.heights),
    immediate:{
      kind:immediate.kind,
      winningCells:(immediate.winningCells??[]).map(label),
      threatCells:(immediate.threatCells??immediate.opponentThreatCells??[]).map(label),
      forcedCell:Number.isInteger(immediate.cell)?label(immediate.cell):null,
    },
    twoStage:{
      residual:residualSummary(demand.obligation),
      certificateKind:certificate.kind,
      exact:certificate.exact??false,
      lower:label(demand.lowerCell),
      upper:label(demand.upperCell),
      nonpreemptFrontier:(certificate.nonpreemptFrontier??[]).map(label),
      risks:(certificate.risks??[]).map(x=>({
        kind:x.kind,
        defenderMove:Number.isInteger(x.defenderMove)?label(x.defenderMove):null,
        targetCell:Number.isInteger(x.targetCell)?label(x.targetCell):null,
      })),
    },
    progress:progressSummary(progress),
    composed:composed?{
      kind:composed.kind,
      exact:composed.exact??false,
      seam:composed.seam??null,
      player:composed.player??null,
      nextMover:composed.nextMover??null,
      rank:composed.rank??null,
      guaranteedResidualCount:composed.guaranteedResiduals?.length??null,
      opponentEarliestTerminalLowerBound:
        composed.firstWinFacts?.opponentEarliestTerminalLowerBound??null,
    }:null,
    firstWin:{
      kind:firstWin.kind,
      exact:firstWin.exact??false,
      player:firstWin.player??null,
      seam:firstWin.seam??null,
      traceLength:firstWin.trace?.length??0,
    },
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    oneControllerSetupOnly:true,
    existingVerticalTwoStageOnly:true,
    noReplyEnumeration:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
  },
},null,2));
