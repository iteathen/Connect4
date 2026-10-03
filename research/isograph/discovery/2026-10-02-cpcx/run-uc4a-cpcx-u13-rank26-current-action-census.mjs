import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  partitionCpcxVerticalTwoStageGuard,
} from './cpcx-two-stage.mjs';
import {
  findCpcxVerticalThreeStageObligations,
} from './cpcx-three-stage.mjs';
import {
  deriveCpcxDisjunctiveBlockObligation,
} from './cpcx-cpc2.mjs';
import {
  findCpcxTruncatedTargetReservoirCertificates,
} from './cpcx-reservoir.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

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
function immediateSummary(x){
  return {
    kind:x.kind,
    mover:x.mover??null,
    cell:Number.isInteger(x.cell)?label(x.cell):null,
    winningCells:(x.winningCells??[]).map(label),
    opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label),
  };
}
function progressSummary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    source:x.source??null,
    seam:x.seam??x.reason??null,
    macroKind:x.macro?.kind??null,
    primaryCell:Number.isInteger(x.macro?.primaryCell)
      ?label(x.macro.primaryCell):null,
    secondaryCell:Number.isInteger(x.macro?.secondaryCell)
      ?label(x.macro.secondaryCell):null,
    blockerCells:(x.obligation?.blockingCells??[]).map(label),
  };
}
function firstWinSummary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    seam:x.seam??null,
    traceLength:x.trace?.length??0,
  };
}
function cpc2Summary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    obligatedPlayer:x.obligatedPlayer??null,
    seam:x.seam??null,
    blockingCells:(x.blockingCells??[]).map(label),
    triggerCount:x.triggerCertificates?.length??0,
    unresolvedMoveCount:x.unresolvedMoves?.length??0,
  };
}
function residualSummary(position,player){
  return scanCpcxObligations(position)
    .filter(o=>o.player===player)
    .map(o=>({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      missingCount:o.missingCount,
      missing:o.missingCells.map(label),
      support:o.events.map(e=>e.supportDistance),
      playable:o.currentlyPlayableCells.map(label),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      Math.max(...a.support)-Math.max(...b.support)||
      a.lineId-b.lineId
    );
}
function verticalSummary(position){
  return findCpcxVerticalTwoStageObligations(position,{player:0})
    .map(d=>{
      const c=certifyCpcxVerticalTwoStage(position,d),
        row={
          lineId:d.obligation.lineId,
          lineLabel:d.obligation.lineLabel,
          lower:label(d.lowerCell),
          upper:label(d.upperCell),
          kind:c.kind,
          exact:c.exact??false,
          riskCount:c.risks?.length??0,
        };
      if(c.kind==='POST_LOWER_FIRST_WIN_GUARD_FAILURE'){
        const p=partitionCpcxVerticalTwoStageGuard(position,d,c);
        row.partition={
          preemptCell:label(p.preemptCell),
          safeNonpreemptFrontier:p.safeNonpreemptFrontier.map(label),
          hazardClasses:p.guardNormalizationClasses.map(h=>({
            defenderMove:label(h.defenderMove),
            targetCells:h.targetCells.map(label),
          })),
        };
      }
      return row;
    });
}

const wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
  .find(canonicalWing);
if(!wing)throw new Error('canonical wing missing');

const t=wing.anchoredLine.triggerCells,
  r=wing.anchoredLine.requiredResponseCells;
let p=materialize(source,[
  {cell:t[0],owner:0},
  {cell:r[0],owner:1},
  {cell:t[1],owner:0},
  {cell:t[2],owner:1},
  {cell:r[1],owner:0},
]);
if(!p)throw new Error('one-support-short path invalid');

for(const s of ['B3','B4','B5','C2','F4','A3','E2','E3']){
  p=applyCpcxForcedEvent(p,cellByLabel(s));
  if(p.terminal)throw new Error(`${s} terminal`);
}
const closed=closeCpcxForcedResponses(p);
if(closed.kind!=='OPEN')throw new Error('target-block normalization not open');
p=closed.position;
if(p.rank!==26||p.mover!==0)
  throw new Error(`expected rank26 P0, got ${p.rank}/${p.mover}`);

const rows=[];
for(const actionCell of frontier(p)){
  const child=applyCpcxForcedEvent(p,actionCell),
    row={
      actionCell:label(actionCell),
      actionColumn:cpcxCell(g,actionCell).column+1,
      terminal:child.terminal?{
        player:child.terminal.player,
        lineId:child.terminal.lineId,
      }:null,
      rank:child.rank,
      mover:child.mover,
      support:Array.from(child.heights),
    };
  if(!child.terminal){
    const immediate=classifyCpcxImmediate(child),
      progress=classifyCpcxProgress(child,{player:0}),
      firstWin=runCpcxFirstWinCertificate(child,{attacker:0}),
      cpc2=deriveCpcxDisjunctiveBlockObligation(child,{attacker:0}),
      reservoirs=findCpcxTruncatedTargetReservoirCertificates(
        child,{attacker:0}
      ),
      three=findCpcxVerticalThreeStageObligations(child,{player:0});

    row.immediate=immediateSummary(immediate);
    row.progress=progressSummary(progress);
    row.firstWin=firstWinSummary(firstWin);
    row.cpc2=cpc2Summary(cpc2);
    row.verticalTwoStage=verticalSummary(child);
    row.verticalThreeStage=three.map(x=>({
      lineId:x.obligation.lineId,
      lineLabel:x.obligation.lineLabel,
      setup:label(x.setupCell),
      middle:label(x.middleCell),
      upper:label(x.upperCell),
    }));
    row.reservoirCertificates=reservoirs.map(x=>({
      target:label(x.target.cell),
      lineLabel:x.target.lineLabel,
      supportDistance:x.target.supportDistance,
    }));
    row.p0Residuals=residualSummary(child,0).slice(0,16);
    row.p1Residuals=residualSummary(child,1).slice(0,16);
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13-rank26-current-action-census.v0_1',
  source:{
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    immediate:immediateSummary(classifyCpcxImmediate(p)),
    p0Residuals:residualSummary(p,0).slice(0,16),
    p1Residuals:residualSummary(p,1).slice(0,16),
  },
  rows,
  summary:{
    actionCount:rows.length,
    terminalP0Actions:rows.filter(x=>x.terminal?.player===0)
      .map(x=>x.actionCell),
    actionsWithExactFirstWin:rows.filter(x=>
      x.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&x.firstWin.player===0
    ).map(x=>x.actionCell),
    actionsWithCpc2Block:rows.filter(x=>
      x.cpc2?.kind==='DISJUNCTIVE_BLOCK_OBLIGATION'
    ).map(x=>({
      action:x.actionCell,
      blockingCells:x.cpc2.blockingCells,
    })),
    actionsWithExactVertical:rows.filter(x=>
      x.verticalTwoStage?.some(v=>v.exact)
    ).map(x=>x.actionCell),
    actionsWithThreeStageCarrier:rows.filter(x=>
      (x.verticalThreeStage?.length??0)>0
    ).map(x=>x.actionCell),
    progressKinds:Object.fromEntries(rows.map(x=>[
      x.actionCell,x.progress?.kind??(x.terminal?'TERMINAL':null)
    ])),
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    oneCurrentP0ActionOnly:true,
    currentChildStructuralClassificationOnly:true,
    noSecondReplyEnumeration:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
  },
},null,2));
