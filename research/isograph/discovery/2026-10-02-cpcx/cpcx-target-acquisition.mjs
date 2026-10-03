// CPCX protected-residual target acquisition.
//
// A current controller move on one currently playable protected target exactly
// contracts the protected residual. This is a rank-local cofactor transition,
// guarded against immediate opponent terminal precedence. It is not a value
// theorem and does not choose among alternative controller actions.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';
import {
  compareCpcxEventPhaseGauge,
} from './cpcx-event-phase-gauge.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-residual-target-acquisition.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function liveResidual(position,{lineId},player){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}

function supportDebt(residual){
  return residual.events.reduce((n,e)=>n+e.supportDistance,0);
}

export function certifyCpcxProtectedResidualTargetAcquisition(position,{
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
    sourceImmediate=classifyCpcxImmediate(position),
    sourceTargetTerminal=
      sourceImmediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&
      sourceImmediate.mover===controller&&
      sourceImmediate.winningCells.includes(targetCell);
  if(sourceImmediate.kind!=='NO_IMMEDIATE_OBLIGATION'&&!sourceTargetTerminal)
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{boundary:sourceImmediate});

  const residual=liveResidual(position,controllerResidual,controller);
  if(!residual)return fail('CONTROLLER_RESIDUAL_NOT_LIVE');
  if(!residual.missingCells.includes(targetCell))
    return fail('TARGET_NOT_IN_PROTECTED_RESIDUAL',{targetCell});

  const targetEvent=residual.events.find(e=>e.cell===targetCell);
  if(!targetEvent)throw new Error('target event provenance missing');
  if(targetEvent.supportDistance!==0)
    return fail('TARGET_NOT_CURRENTLY_PLAYABLE',{
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
  if(target.row!==position.heights[target.column]||position.owner[targetCell]!==-1)
    return fail('TARGET_NOT_CURRENT_FRONTIER',{targetCell});

  const carrier=createCpcxResidualCarrier(position,[residual]),
    chain=compileCpcxResidualEventChain(carrier,[{
      cell:targetCell,
      owner:controller,
    }]),
    effect=chain.steps[0],
    child=applyCpcxForcedEvent(position,targetCell),
    completed=effect.completions.some(x=>
      x.player===controller&&
      x.lineLabel===residual.lineLabel&&
      x.completingCell===targetCell
    );

  if(child.terminal){
    if(child.terminal.player!==controller)
      return fail('WRONG_TERMINAL_ON_TARGET_ACQUISITION',{
        terminal:child.terminal,
      });
    if(!completed)
      return fail('TERMINAL_WITHOUT_PROTECTED_COMPLETION',{
        terminal:child.terminal,
      });
    return {
      schema:'connect4.cpcx.protected-residual-target-acquisition.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:controller,
      controller,
      opponent,
      source:'PROTECTED_TARGET_COMPLETION',
      sourceLineId:residual.lineId,
      sourceLineLabel:residual.lineLabel,
      targetCell,
      actionCell:targetCell,
      sourceMissingCount:residual.missingCount,
      finalMissingCount:0,
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
  )return fail('OPPONENT_TERMINAL_AFTER_TARGET_ACQUISITION',{
    targetCell,
    boundary:childImmediate,
  });

  if(
    childImmediate.kind==='FORCED_LOSS_OVERLOAD'&&
    childImmediate.opponent===controller
  )return {
    schema:'connect4.cpcx.protected-residual-target-acquisition.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:controller,
    controller,
    opponent,
    source:'TARGET_ACQUISITION_TO_OPPONENT_RESPONSE_OVERLOAD',
    sourceLineId:residual.lineId,
    sourceLineLabel:residual.lineLabel,
    targetCell,
    actionCell:targetCell,
    sourceMissingCount:residual.missingCount,
    finalMissingCount:residual.missingCount-1,
    boundary:childImmediate,
    rankDelta:1,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  const after=liveResidual(child,{lineId:residual.lineId},controller),
    contracted=effect.contracted.some(x=>
      x.player===controller&&
      x.lineLabel===residual.lineLabel&&
      x.acquiredCell===targetCell&&
      x.fromMissing===residual.missingCount&&
      x.toMissing===residual.missingCount-1
    );
  if(!contracted)return fail('PROTECTED_COFACTOR_NOT_CONTRACTED',{
    targetCell,effect,
  });
  if(!after)return fail('PROTECTED_RESIDUAL_NOT_LIVE_AFTER_ACQUISITION');
  if(after.missingCount!==residual.missingCount-1)
    return fail('PROTECTED_CARDINALITY_NOT_UNIT_DECREASE',{
      before:residual.missingCount,
      after:after.missingCount,
    });
  const expected=residual.missingCells.filter(cell=>cell!==targetCell),
    actual=[...after.missingCells];
  if(expected.length!==actual.length||
     !expected.every((cell,i)=>cell===actual[i]))
    return fail('PROTECTED_MISSING_SET_CONTRACTION_MISMATCH',{
      expected,actual,
    });

  const beforeDebt=supportDebt(residual),afterDebt=supportDebt(after);
  if(afterDebt!==beforeDebt)
    return fail('REMAINING_SUPPORT_DEBT_CHANGED',{
      beforeDebt,afterDebt,
    });

  const phase=compareCpcxEventPhaseGauge(position,child,expected);
  if(!phase.exact)return fail('PHASE_GAUGE_NOT_PRESERVED',{phase});

  return {
    schema:'connect4.cpcx.protected-residual-target-acquisition.v0_1',
    kind:'PROTECTED_RESIDUAL_TARGET_ACQUISITION',
    exact:true,
    controller,
    opponent,
    sourceRank:position.rank,
    childRank:child.rank,
    rankDelta:1,
    sourceLineId:residual.lineId,
    sourceLineLabel:residual.lineLabel,
    targetCell,
    actionCell:targetCell,
    sourceMissingCells:[...residual.missingCells],
    childMissingCells:[...after.missingCells],
    sourceMissingCount:residual.missingCount,
    childMissingCount:after.missingCount,
    missingCountDelta:-1,
    sourceSupportDebt:beforeDebt,
    childSupportDebt:afterDebt,
    supportDebtDelta:0,
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
    proofRule:'controller occupies one currently playable protected target; exact cofactor algebra contracts the protected residual by one target, immediate opponent terminal exposure is rejected, and the remaining-target event phase is gauge-invariant',
    complexity:'O(liveLineCount + K + lineIncidence); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
