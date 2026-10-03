// CPCX protected residual support advance.
//
// One current controller event beneath one selected protected-residual target.
// The event must be outside the residual itself. Under exact first-win guards
// the residual missing set is preserved, selected support distance decreases by
// one, total residual support debt decreases by one, and the event-phase gauge
// is preserved.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  compareCpcxEventPhaseGauge,
} from './cpcx-event-phase-gauge.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-residual-support-advance.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function sameCells(a,b){
  if(a.length!==b.length)return false;
  const x=[...a].sort((u,v)=>u-v),y=[...b].sort((u,v)=>u-v);
  return x.every((v,i)=>v===y[i]);
}

function liveResidual(position,{lineId},player){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}

function supportMap(residual){
  return new Map(residual.events.map(e=>[e.cell,e.supportDistance]));
}

function supportDebt(residual){
  return residual.events.reduce((n,e)=>n+e.supportDistance,0);
}

export function certifyCpcxProtectedResidualSupportAdvance(position,{
  controllerResidual,
  targetCell,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!controllerResidual||!Number.isInteger(controllerResidual.lineId))
    throw new TypeError('controllerResidual with lineId required');
  if(!Number.isInteger(targetCell))throw new TypeError('targetCell');

  const controller=position.mover,opponent=controller^1,
    sourceImmediate=classifyCpcxImmediate(position);
  if(sourceImmediate.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{boundary:sourceImmediate});

  const residual=liveResidual(position,controllerResidual,controller);
  if(!residual)return fail('CONTROLLER_RESIDUAL_NOT_LIVE');
  if(!residual.missingCells.includes(targetCell))
    return fail('TARGET_NOT_IN_PROTECTED_RESIDUAL',{targetCell});

  const targetEvent=residual.events.find(e=>e.cell===targetCell);
  if(!targetEvent)throw new Error('target event provenance missing');
  if(targetEvent.supportDistance<1)
    return fail('TARGET_ALREADY_PLAYABLE',{
      targetCell,
      supportDistance:targetEvent.supportDistance,
    });

  const g=position.geometry,target=cpcxCell(g,targetCell),
    sameColumn=residual.missingCells.filter(cell=>
      cpcxCell(g,cell).column===target.column
    );
  if(sameColumn.length!==1)
    return fail('TARGET_COLUMN_HAS_MULTIPLE_MISSING_CELLS',{
      targetCell,
      sameColumnMissingCells:sameColumn,
    });

  const actionCell=position.heights[target.column]*g.columns+target.column,
    action=cpcxCell(g,actionCell);
  if(action.row>=g.rows||
     action.row>=target.row||
     position.owner[actionCell]!==-1)
    return fail('NO_LEGAL_SUPPORT_FRONTIER_BELOW_TARGET',{
      targetCell,
      actionCell,
    });
  if(residual.missingCells.includes(actionCell))
    return fail('SUPPORT_EVENT_ALTERS_PROTECTED_RESIDUAL',{
      actionCell,
      targetCell,
    });

  const child=applyCpcxForcedEvent(position,actionCell);
  if(child.terminal){
    if(child.terminal.player!==controller)
      return fail('WRONG_TERMINAL_ON_SUPPORT_ADVANCE',{
        terminal:child.terminal,
      });
    return {
      schema:'connect4.cpcx.protected-residual-support-advance.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:controller,
      controller,
      opponent,
      actionCell,
      targetCell,
      sourceLineId:residual.lineId,
      terminal:child.terminal,
      rankDelta:1,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };
  }

  const childImmediate=classifyCpcxImmediate(child);
  if(
    childImmediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&
    childImmediate.mover===opponent
  )return fail('OPPONENT_TERMINAL_AFTER_SUPPORT_ADVANCE',{
    actionCell,
    targetCell,
    boundary:childImmediate,
  });

  if(
    childImmediate.kind==='FORCED_LOSS_OVERLOAD'&&
    childImmediate.opponent===controller
  )return {
    schema:'connect4.cpcx.protected-residual-support-advance.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:controller,
    controller,
    opponent,
    actionCell,
    targetCell,
    sourceLineId:residual.lineId,
    source:'SUPPORT_ADVANCE_TO_OPPONENT_RESPONSE_OVERLOAD',
    boundary:childImmediate,
    rankDelta:1,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  const after=liveResidual(child,{lineId:residual.lineId},controller);
  if(!after)return fail('PROTECTED_RESIDUAL_NOT_LIVE_AFTER_ADVANCE');
  if(!sameCells(after.missingCells,residual.missingCells))
    return fail('PROTECTED_RESIDUAL_MISSING_SET_CHANGED',{
      before:[...residual.missingCells],
      after:[...after.missingCells],
    });

  const beforeSupport=supportMap(residual),afterSupport=supportMap(after);
  for(const cell of residual.missingCells){
    const before=beforeSupport.get(cell),afterDistance=afterSupport.get(cell),
      expected=cell===targetCell?before-1:before;
    if(afterDistance!==expected)
      return fail('SUPPORT_TRANSITION_MISMATCH',{
        cell,
        targetCell,
        before,
        after:afterDistance,
        expected,
      });
  }

  const beforeDebt=supportDebt(residual),afterDebt=supportDebt(after);
  if(afterDebt!==beforeDebt-1)
    return fail('SUPPORT_DEBT_NOT_UNIT_DECREASE',{
      beforeDebt,
      afterDebt,
    });

  const phase=compareCpcxEventPhaseGauge(
    position,child,[...residual.missingCells]
  );
  if(!phase.exact)return fail('PHASE_GAUGE_NOT_PRESERVED',{phase});

  return {
    schema:'connect4.cpcx.protected-residual-support-advance.v0_1',
    kind:'PROTECTED_RESIDUAL_SUPPORT_ADVANCE',
    exact:true,
    controller,
    opponent,
    sourceRank:position.rank,
    childRank:child.rank,
    sourceLineId:residual.lineId,
    sourceLineLabel:residual.lineLabel,
    targetCell,
    actionCell,
    targetColumn:target.column,
    missingCells:[...residual.missingCells],
    sourceSupportDistances:residual.missingCells.map(cell=>
      beforeSupport.get(cell)
    ),
    childSupportDistances:residual.missingCells.map(cell=>
      afterSupport.get(cell)
    ),
    sourceSupportDebt:beforeDebt,
    childSupportDebt:afterDebt,
    supportDebtDelta:-1,
    childImmediateBoundary:childImmediate,
    phaseGauge:{
      kind:phase.kind,
      exact:phase.exact,
      rankDelta:phase.rankDelta,
      globalFlip:phase.globalFlip,
      relativeParity:[...phase.relativeParity],
      projectedOwners:[...phase.projectedOwners],
      relativePhaseInvariant:phase.relativePhaseInvariant,
      projectedOwnerInvariant:phase.projectedOwnerInvariant,
    },
    child,
    proofRule:'controller occupies the unique current support frontier below one protected residual target; the event lies outside the residual, so exact cofactor identity is preserved while only that target support distance decreases by one; immediate opponent terminal exposure is rejected and relative event phase remains gauge-invariant',
    complexity:'O(liveLineCount + K + lineIncidence); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
