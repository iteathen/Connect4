// CPCX protected-residual support transition.
//
// A current legal event outside one protected residual's missing-cell set cannot
// change its cofactor identity. Gravity changes support distance only for
// missing targets in the event column. This module packages that exact
// one-event transition with first-win stopping and the event-phase gauge.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';
import {compareCpcxEventPhaseGauge} from './cpcx-event-phase-gauge.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-residual-support-transition.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function currentFrontier(position,cell){
  const {column,row}=cpcxCell(position.geometry,cell);
  return row===position.heights[column]&&
    row<position.geometry.rows&&
    position.owner[cell]===-1;
}

function findLive(position,residual){
  if(!residual||!Number.isInteger(residual.lineId)||
     (residual.player!==0&&residual.player!==1))
    throw new TypeError('protectedResidual');
  return scanCpcxObligations(position).find(o=>
    o.player===residual.player&&o.lineId===residual.lineId
  )??null;
}

function supportVector(residual){
  const byCell=new Map(residual.events.map(e=>[e.cell,e.supportDistance]));
  return residual.missingCells.map(cell=>byCell.get(cell));
}

function sameArray(a,b){
  return a.length===b.length&&a.every((x,i)=>x===b[i]);
}

export function certifyCpcxProtectedResidualSupportTransition(position,{
  protectedResidual,
  eventCell,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!Number.isInteger(eventCell))throw new TypeError('eventCell');

  const live=findLive(position,protectedResidual);
  if(!live)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(!currentFrontier(position,eventCell))
    return fail('EVENT_NOT_CURRENT_FRONTIER');

  if(live.missingCells.includes(eventCell))
    return fail('EVENT_OCCUPIES_PROTECTED_TARGET',{eventCell});

  const eventMeta=cpcxCell(position.geometry,eventCell),
    beforeSupport=supportVector(live),
    beforeDebt=beforeSupport.reduce((a,b)=>a+b,0),
    touchedIndices=[];

  for(let i=0;i<live.missingCells.length;i++){
    const target=cpcxCell(position.geometry,live.missingCells[i]);
    if(target.column===eventMeta.column)touchedIndices.push(i);
  }

  const child=applyCpcxForcedEvent(position,eventCell);
  if(child.terminal)return {
    schema:'connect4.cpcx.protected-residual-support-transition.v0_1',
    kind:'TERMINAL_EVENT',
    exact:true,
    eventCell,
    eventOwner:position.mover,
    terminal:child.terminal,
    nonterminalTransition:false,
    firstWinStopping:true,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  const after=findLive(child,live);
  if(!after)return fail('PROTECTED_RESIDUAL_NOT_LIVE_AFTER_EVENT');

  if(!sameArray(after.missingCells,live.missingCells))
    return fail('PROTECTED_MISSING_SET_CHANGED',{
      before:[...live.missingCells],
      after:[...after.missingCells],
    });

  const afterSupport=supportVector(after),
    expected=beforeSupport.map((x,i)=>
      touchedIndices.includes(i)?x-1:x
    );
  if(!sameArray(afterSupport,expected))
    return fail('SUPPORT_TRANSITION_MISMATCH',{
      beforeSupport,
      afterSupport,
      expected,
      touchedIndices,
    });

  const carrier=createCpcxResidualCarrier(position,[live]),
    chain=compileCpcxResidualEventChain(carrier,[{
      cell:eventCell,
      owner:position.mover,
    }]);
  if(chain.residuals.length!==1||
     chain.steps[0].killed.length||
     chain.steps[0].contracted.length||
     chain.steps[0].completions.length)
    return fail('RESIDUAL_COFACTOR_CHANGED');

  const remaining=chain.residuals[0];
  if(remaining.player!==live.player||
     remaining.lineId!==live.lineId||
     !sameArray(remaining.missingCells,live.missingCells))
    return fail('RESIDUAL_COFACTOR_IDENTITY_MISMATCH');

  const phase=compareCpcxEventPhaseGauge(
    position,child,live.missingCells
  );
  if(!phase.exact)return fail('EVENT_PHASE_GAUGE_FAILED',{phase});

  const afterDebt=afterSupport.reduce((a,b)=>a+b,0),
    expectedDelta=-touchedIndices.length;
  if(afterDebt-beforeDebt!==expectedDelta)
    return fail('SUPPORT_DEBT_DELTA_MISMATCH',{
      beforeDebt,afterDebt,expectedDelta,
    });

  return {
    schema:'connect4.cpcx.protected-residual-support-transition.v0_1',
    kind:'PROTECTED_RESIDUAL_SUPPORT_TRANSITION',
    exact:true,
    player:live.player,
    lineId:live.lineId,
    lineLabel:live.lineLabel,
    eventCell,
    eventOwner:position.mover,
    eventColumn:eventMeta.column,
    missingCells:[...live.missingCells],
    beforeSupport,
    afterSupport,
    beforeDebt,
    afterDebt,
    supportDebtDelta:afterDebt-beforeDebt,
    touchedTargetCount:touchedIndices.length,
    touchedTargetCells:touchedIndices.map(i=>live.missingCells[i]),
    supportStateStutter:touchedIndices.length===0,
    residualCofactorUnchanged:true,
    relativeEventPhaseInvariant:phase.relativePhaseInvariant,
    projectedOwnerInvariant:phase.projectedOwnerInvariant,
    globalEventPhaseFlip:phase.globalFlip,
    firstWinStopping:true,
    proofRule:'non-target event leaves the protected residual cofactor unchanged; only missing targets in the event column lose one support unit; untouched empty targets retain their relative phase and zero-reservation owner gauge',
    complexity:'O(liveLineCount + K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
