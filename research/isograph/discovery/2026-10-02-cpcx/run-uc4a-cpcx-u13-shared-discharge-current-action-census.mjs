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
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  partitionCpcxVerticalTwoStageGuard,
} from './cpcx-two-stage.mjs';
import {
  findCpcxVerticalThreeStageObligations,
  certifyCpcxVerticalThreeStageSetup,
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
  source=buildCpcxPosition('444444776566',{geometry:g}),
  gapLine='C1-D2-E3-F4';

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
  };
}
function twoStageSummary(position){
  return findCpcxVerticalTwoStageObligations(position,{player:0})
    .map(d=>{
      const c=certifyCpcxVerticalTwoStage(position,d),row={
        lineLabel:d.obligation.lineLabel,
        lower:label(d.lowerCell),
        upper:label(d.upperCell),
        kind:c.kind,
        exact:c.exact??false,
      };
      if(c.kind==='POST_LOWER_FIRST_WIN_GUARD_FAILURE'){
        const p=partitionCpcxVerticalTwoStageGuard(position,d,c);
        row.partition={
          preemptCell:label(p.preemptCell),
          safe:p.safeNonpreemptFrontier.map(label),
          hazards:p.guardNormalizationClasses.map(h=>({
            move:label(h.defenderMove),
            targets:h.targetCells.map(label),
          })),
        };
      }
      return row;
    });
}
function threeStageSummary(position){
  return findCpcxVerticalThreeStageObligations(position,{player:0})
    .map(d=>{
      const c=certifyCpcxVerticalThreeStageSetup(position,d);
      return {
        lineLabel:d.obligation.lineLabel,
        setup:label(d.setupCell),
        middle:label(d.middleCell),
        upper:label(d.upperCell),
        kind:c.kind,
        exact:c.exact??false,
        seam:c.seam??null,
        childKind:c.childCertificate?.kind??null,
      };
    });
}
function sourceSummary(position){
  const progressP0=classifyCpcxProgress(position,{player:0}),
    progressMover=classifyCpcxProgress(position,{player:position.mover}),
    firstWinP0=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    rank:position.rank,
    mover:position.mover,
    support:Array.from(position.heights),
    immediate:immediateSummary(classifyCpcxImmediate(position)),
    p0Progress:progressSummary(progressP0),
    moverProgress:progressSummary(progressMover),
    p0FirstWin:firstWinSummary(firstWinP0),
    cpc2:cpc2Summary(deriveCpcxDisjunctiveBlockObligation(position,{attacker:0})),
    verticalTwoStage:twoStageSummary(position),
    verticalThreeStage:threeStageSummary(position),
    reservoirCertificates:findCpcxTruncatedTargetReservoirCertificates(
      position,{attacker:0}
    ).map(x=>({
      target:label(x.target.cell),
      lineLabel:x.target.lineLabel,
      supportDistance:x.target.supportDistance,
    })),
  };
}
function oneCurrentAction(position){
  if(position.mover!==0)return [];
  const rows=[];
  for(const actionCell of frontier(position)){
    const child=applyCpcxForcedEvent(position,actionCell),
      row={
        actionCell:label(actionCell),
        terminal:child.terminal?{
          player:child.terminal.player,
          lineId:child.terminal.lineId,
        }:null,
        rank:child.rank,
        mover:child.mover,
        support:Array.from(child.heights),
      };
    if(!child.terminal){
      row.immediate=immediateSummary(classifyCpcxImmediate(child));
      row.progress=progressSummary(classifyCpcxProgress(child,{player:0}));
      row.firstWin=firstWinSummary(
        runCpcxFirstWinCertificate(child,{attacker:0})
      );
      row.cpc2=cpc2Summary(
        deriveCpcxDisjunctiveBlockObligation(child,{attacker:0})
      );
      row.verticalTwoStage=twoStageSummary(child);
      row.verticalThreeStage=threeStageSummary(child);
      row.reservoirCertificates=findCpcxTruncatedTargetReservoirCertificates(
        child,{attacker:0}
      ).map(x=>({
        target:label(x.target.cell),
        lineLabel:x.target.lineLabel,
        supportDistance:x.target.supportDistance,
      }));
    }
    rows.push(row);
  }
  return rows;
}

const wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
  .find(canonicalWing);
if(!wing)throw new Error('canonical wing missing');
const t=wing.anchoredLine.triggerCells,r=wing.anchoredLine.requiredResponseCells;

let p=materialize(source,[
  {cell:t[0],owner:0},
  {cell:r[0],owner:1},
  {cell:t[1],owner:0},
  {cell:t[2],owner:1},
  {cell:r[1],owner:0},
]);
if(!p||p.mover!==1)throw new Error('one-support-short path invalid');

for(const s of ['B3','B4','B5','C2','F4']){
  p=applyCpcxForcedEvent(p,cellByLabel(s));
  if(p.terminal)throw new Error(`${s} terminal`);
}
if(p.mover!==0)throw new Error('expected P0 after F4');

const gap=residual(p,1,gapLine);
if(!gap||gap.missingCount!==1||gap.missingCells[0]!==cellByLabel('E3'))
  throw new Error('shared-discharge E3 singleton missing');

const rows=[];
for(const actionCell of frontier(p)){
  const neutral=certifyCpcxSupportReleaseResponseNeutralization(p,{
    opponentResidual:gap,
    defenderActionCell:actionCell,
  });
  if(neutral.kind!=='SUPPORT_RELEASE_RESPONSE_EDGE')continue;

  let q=applyCpcxForcedEvent(p,actionCell);
  q=applyCpcxForcedEvent(q,cellByLabel('E2'));
  q=applyCpcxForcedEvent(q,cellByLabel('E3'));
  if(q.terminal)throw new Error('reserved response unexpectedly terminal');

  const closed=closeCpcxForcedResponses(q);
  if(closed.kind!=='OPEN'){
    rows.push({
      controllerAction:label(actionCell),
      neutralizationKind:neutral.kind,
      normalization:{
        kind:closed.kind,
        player:closed.player??null,
        steps:(closed.steps??[]).map(s=>({
          cell:label(s.cell),player:s.player,
        })),
      },
      state:null,
      currentActions:[],
    });
    continue;
  }

  rows.push({
    controllerAction:label(actionCell),
    neutralizationKind:neutral.kind,
    normalization:{
      kind:closed.kind,
      steps:(closed.steps??[]).map(s=>({
        cell:label(s.cell),player:s.player,
      })),
    },
    state:sourceSummary(closed.position),
    currentActions:oneCurrentAction(closed.position),
  });
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13-shared-discharge-current-action-census.v0_1',
  observation:'all qualified U13 shared-discharge actions after exact support-release neutralization and deterministic forced closure; at most one current P0 action thereafter',
  rows,
  summary:{
    sharedDischargeActionCount:rows.length,
    normalizedStatesByAction:Object.fromEntries(rows.map(x=>[
      x.controllerAction,x.state?{
        rank:x.state.rank,
        mover:x.state.mover,
        p0Progress:x.state.p0Progress.kind,
        p0FirstWin:x.state.p0FirstWin.kind,
        verticalThreeStage:x.state.verticalThreeStage.filter(y=>y.exact)
          .map(y=>({line:y.lineLabel,setup:y.setup,kind:y.kind})),
      }:null
    ])),
    oneActionExactFirstWins:Object.fromEntries(rows.map(x=>[
      x.controllerAction,
      x.currentActions.filter(a=>
        a.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&a.firstWin.player===0
      ).map(a=>a.actionCell)
    ])),
    oneActionTerminals:Object.fromEntries(rows.map(x=>[
      x.controllerAction,
      x.currentActions.filter(a=>a.terminal?.player===0)
        .map(a=>a.actionCell)
    ])),
    oneActionThreeStage:Object.fromEntries(rows.map(x=>[
      x.controllerAction,
      x.currentActions.filter(a=>
        a.verticalThreeStage?.some(v=>v.exact)
      ).map(a=>a.actionCell)
    ])),
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    sharedDischargeActionsComeOnlyFromQualifiedNeutralization:true,
    deterministicNormalizationOnly:true,
    atMostOneCurrentP0ActionAfterNormalization:true,
    noSecondReplyEnumeration:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
  },
},null,2));
