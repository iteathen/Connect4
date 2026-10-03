// CPCX protected diagonal playable-target fallback.
//
// Enabled only when the deterministic highest-target support advance is rejected
// because it would release an immediate opponent singleton. The fallback then
// acquires the highest-row currently playable target on the same protected
// diagonal using the already-qualified target-acquisition theorem.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  certifyCpcxProtectedDiagonalHighestTargetDescent,
} from './cpcx-highest-target-descent.mjs';
import {
  certifyCpcxProtectedResidualTargetAcquisition,
} from './cpcx-target-acquisition.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-diagonal-playable-target-fallback.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}

function measure(r){
  return [r.missingCount,supportDebt(r)];
}

function less(a,b){
  return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
}

function live(position,residual){
  return scanCpcxObligations(position).find(o=>
    o.player===residual.player&&o.lineId===residual.lineId
  )??null;
}

export function certifyCpcxProtectedDiagonalPlayableTargetFallback(position,{
  protectedResidual,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');

  const source=live(position,protectedResidual);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(source.player!==position.mover)
    return fail('CONTROLLER_NOT_TO_MOVE',{
      controller:source.player,
      mover:position.mover,
    });
  if(source.orientation!=='D+'&&source.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{orientation:source.orientation});

  const highest=certifyCpcxProtectedDiagonalHighestTargetDescent(position,{
    protectedResidual:source,
  });

  if(highest.exact)
    return fail('HIGHEST_TARGET_POLICY_ALREADY_EXACT',{
      highestKind:highest.kind,
    });
  if(highest.seam!=='HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON')
    return fail('HIGHEST_TARGET_FAILURE_NOT_POISON_RELEASE',{
      highest,
    });

  const g=position.geometry,
    playable=source.events
      .filter(e=>
        e.supportDistance===0&&
        position.heights[e.column]===e.row&&
        position.owner[e.cell]===-1
      )
      .sort((a,b)=>
        b.row-a.row||
        a.column-b.column||
        a.cell-b.cell
      );

  if(!playable.length)
    return fail('NO_PLAYABLE_PROTECTED_TARGET',{
      highest,
    });

  const selected=playable[0],
    sourceMeasure=measure(source),
    acquisition=certifyCpcxProtectedResidualTargetAcquisition(position,{
      controllerResidual:source,
      targetCell:selected.cell,
    });

  if(!acquisition.exact)
    return fail('PLAYABLE_TARGET_ACQUISITION_FAILED',{
      selectedTarget:selected.cell,
      acquisition,
      highest,
    });

  if(acquisition.kind==='CERTIFIED_FIRST_WIN')return {
    schema:'connect4.cpcx.protected-diagonal-playable-target-fallback.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:source.player,
    controller:source.player,
    opponent:source.player^1,
    source:'PLAYABLE_TARGET_FALLBACK',
    sourceLineId:source.lineId,
    sourceLineLabel:source.lineLabel,
    sourceMeasure,
    rejectedHighestTarget:highest.selectedTarget??null,
    poisonReleaseCell:highest.releasedCell??null,
    fallbackTarget:selected.cell,
    highestFailure:highest,
    acquisition,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  if(acquisition.kind!=='PROTECTED_RESIDUAL_TARGET_ACQUISITION')
    return fail('UNSUPPORTED_ACQUISITION_RESULT',{
      selectedTarget:selected.cell,
      acquisition,
      highest,
    });

  const child=acquisition.child,
    after=live(child,source);
  if(!after)return fail('FALLBACK_CHILD_RESIDUAL_NOT_LIVE',{
    selectedTarget:selected.cell,
  });

  const childMeasure=measure(after);
  if(!less(childMeasure,sourceMeasure))
    return fail('FALLBACK_MEASURE_NOT_DECREASING',{
      sourceMeasure,
      childMeasure,
    });

  return {
    schema:'connect4.cpcx.protected-diagonal-playable-target-fallback.v0_1',
    kind:'PROTECTED_DIAGONAL_PLAYABLE_TARGET_FALLBACK',
    exact:true,
    controller:source.player,
    opponent:source.player^1,
    sourceLineId:source.lineId,
    sourceLineLabel:source.lineLabel,
    sourceMeasure,
    childMeasure,
    strictMeasureDecrease:true,
    rejectedHighestTarget:highest.selectedTarget??null,
    rejectedHighestAction:highest.actionCell??null,
    poisonReleaseCell:highest.releasedCell??null,
    poisonHazards:[...(highest.hazards??[])],
    fallbackTarget:selected.cell,
    fallbackTargetRow:cpcxCell(g,selected.cell).row,
    fallbackTargetColumn:cpcxCell(g,selected.cell).column,
    highestFailure:highest,
    acquisition,
    child,
    childResidual:after,
    proofRule:'the deterministic highest hidden target is rejected only because its support move would release an opponent singleton; the highest-row already-playable target on the same protected diagonal is acquired by the qualified target-acquisition theorem, strictly decreasing missing cardinality',
    complexity:'existing highest-target audit + O(K) playable-target selection + existing target-acquisition bound; K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
