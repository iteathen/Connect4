// CPCX protected diagonal controller saturation.
//
// Deterministic composition:
//   controller highest-target descent
//   -> exact immediate classification
//   -> unique forced-response normalization when required
//   -> repeat only if normalization returns the move to the controller.
//
// No free opponent action is selected. Every controller step strictly decreases
// the protected lexicographic measure (missingCount, supportDebt); forced
// normalization may only preserve or decrease it.

import {scanCpcxObligations} from './cpcx.mjs';
import {classifyCpcxImmediate} from './cpcx-closure.mjs';
import {
  certifyCpcxProtectedDiagonalHighestTargetDescent,
} from './cpcx-highest-target-descent.mjs';
import {
  certifyCpcxProtectedDiagonalPlayableTargetFallback,
} from './cpcx-playable-target-fallback.mjs';
import {
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-diagonal-controller-saturation.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function live(position,player,lineId){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}

function supportDebt(residual){
  return residual.events.reduce((n,e)=>n+e.supportDistance,0);
}

function measure(residual){
  return [residual.missingCount,supportDebt(residual)];
}

function less(a,b){
  return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
}

function lessOrEqual(a,b){
  return less(a,b)||(a[0]===b[0]&&a[1]===b[1]);
}

function firstWin(controller,source,{
  sourceMeasure,
  trace,
  detail={},
}={}){
  return {
    schema:'connect4.cpcx.protected-diagonal-controller-saturation.v0_2',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:controller,
    controller,
    source,
    sourceMeasure,
    trace,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

function openBoundaryResult({
  position,
  residual,
  sourcePosition,
  sourceResidual,
  controller,
  opponent,
  trace,
  controllerStepCount,
  normalizationPassCount,
  forcedEventCount,
}){
  const sourceMeasure=measure(sourceResidual),
    finalMeasure=measure(residual),
    boundary=classifyCpcxImmediate(position);

  if(boundary.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('FINAL_BOUNDARY_NOT_OPEN',{
      boundary,
      sourceMeasure,
      finalMeasure,
      trace,
    });
  if(position.mover!==opponent)
    return fail('FINAL_BOUNDARY_NOT_OPPONENT_TO_MOVE',{
      mover:position.mover,
      controller,
      opponent,
      sourceMeasure,
      finalMeasure,
      trace,
    });
  if(!less(finalMeasure,sourceMeasure))
    return fail('FINAL_MEASURE_NOT_STRICTLY_DECREASED',{
      sourceMeasure,
      finalMeasure,
      trace,
    });

  return {
    schema:'connect4.cpcx.protected-diagonal-controller-saturation.v0_2',
    kind:'PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2',
    exact:true,
    controller,
    opponent,
    sourceRank:sourcePosition.rank,
    finalRank:position.rank,
    rankDelta:position.rank-sourcePosition.rank,
    sourceLineId:sourceResidual.lineId,
    sourceLineLabel:sourceResidual.lineLabel,
    sourceMeasure,
    finalMeasure,
    strictMeasureDecrease:true,
    controllerStepCount,
    normalizationPassCount,
    forcedEventCount,
    finalBoundary:boundary,
    finalPosition:position,
    finalResidual:residual,
    trace,
    proofRule:'qualified highest-target descent is used whenever exact; only the qualified playable-target fallback may replace the named poison-release failure, and every controller step strictly decreases (missingCount,supportDebt); only unique forced responses are normalized before stopping at the first exact open opponent boundary',
    complexity:'O(controllerStepCount * (liveLineCount + incidentLineCount*K) + forcedEventCount * (liveLineCount + K)); K<=4 and controllerStepCount<=sourceMissingCount+sourceSupportDebt',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function certifyCpcxProtectedDiagonalControllerSaturationV2(position,{
  protectedResidual,
  maxControllerSteps=null,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');

  const controller=protectedResidual.player,opponent=controller^1,
    sourceResidual=live(position,controller,protectedResidual.lineId);
  if(!sourceResidual)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(sourceResidual.player!==position.mover)
    return fail('CONTROLLER_NOT_TO_MOVE',{
      controller,
      mover:position.mover,
    });
  if(sourceResidual.orientation!=='D+'&&sourceResidual.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{
      orientation:sourceResidual.orientation,
    });

  const sourceMeasure=measure(sourceResidual),
    derivedBound=sourceMeasure[0]+sourceMeasure[1];
  if(maxControllerSteps===null)maxControllerSteps=Math.max(1,derivedBound);
  if(!Number.isInteger(maxControllerSteps)||maxControllerSteps<1)
    throw new RangeError('maxControllerSteps');

  let current=position,
    currentResidual=sourceResidual,
    controllerStepCount=0,
    normalizationPassCount=0,
    forcedEventCount=0;
  const trace=[];

  for(let iteration=0;iteration<maxControllerSteps;iteration++){
    if(current.mover!==controller)return fail(
      'CONTROLLER_LOOP_MOVER_MISMATCH',{
        iteration,
        mover:current.mover,
        controller,
        trace,
      }
    );

    const beforeMeasure=measure(currentResidual),
      descent=certifyCpcxProtectedDiagonalHighestTargetDescent(current,{
        protectedResidual:currentResidual,
      });
    let selected=descent,selectedSource='HIGHEST_TARGET_DESCENT';

    if(descent.kind==='CERTIFIED_FIRST_WIN')
      return firstWin(controller,'HIGHEST_TARGET_DESCENT',{
        sourceMeasure,
        trace:[...trace,{
          kind:'CONTROLLER_DESCENT_FIRST_WIN',
          iteration,
          sourceMeasure:beforeMeasure,
          certificate:descent,
        }],
        detail:{
          controllerStepCount:controllerStepCount+1,
          normalizationPassCount,
          forcedEventCount,
          certificate:descent,
        },
      });

    if(!descent.exact||
       descent.kind!=='PROTECTED_DIAGONAL_HIGHEST_TARGET_DESCENT'){
      if(descent.seam!=='HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON')
        return fail('HIGHEST_TARGET_DESCENT_FAILED',{
          iteration,
          sourceMeasure,
          currentMeasure:beforeMeasure,
          descent,
          trace,
        });

      const fallback=certifyCpcxProtectedDiagonalPlayableTargetFallback(
        current,{protectedResidual:currentResidual}
      );
      if(fallback.kind==='CERTIFIED_FIRST_WIN')
        return firstWin(controller,'PLAYABLE_TARGET_FALLBACK',{
          sourceMeasure,
          trace:[...trace,{
            kind:'CONTROLLER_FALLBACK_FIRST_WIN',
            iteration,
            sourceMeasure:beforeMeasure,
            certificate:fallback,
          }],
          detail:{
            controllerStepCount:controllerStepCount+1,
            normalizationPassCount,
            forcedEventCount,
            certificate:fallback,
          },
        });
      if(!fallback.exact||
         fallback.kind!=='PROTECTED_DIAGONAL_PLAYABLE_TARGET_FALLBACK')
        return fail('PLAYABLE_TARGET_FALLBACK_FAILED',{
          iteration,
          sourceMeasure,
          currentMeasure:beforeMeasure,
          descent,
          fallback,
          trace,
        });
      selected=fallback;
      selectedSource='PLAYABLE_TARGET_FALLBACK';
    }

    controllerStepCount+=1;
    const child=selected.child,
      childResidual=selected.childResidual,
      childMeasure=measure(childResidual);
    if(!less(childMeasure,beforeMeasure))
      return fail('CONTROLLER_STEP_MEASURE_NOT_DECREASING',{
        iteration,
        beforeMeasure,
        childMeasure,
        selectedSource,
        certificate:selected,
        trace,
      });
    if(child.mover!==opponent)
      return fail('POST_DESCENT_MOVER_MISMATCH',{
        iteration,
        mover:child.mover,
        controller,
        opponent,
        trace,
      });

    const boundary=classifyCpcxImmediate(child),
      stepRow={
        kind:selectedSource==='PLAYABLE_TARGET_FALLBACK'
          ?'CONTROLLER_PLAYABLE_TARGET_FALLBACK'
          :'CONTROLLER_DESCENT',
        iteration,
        actionCell:selected.actionCell??
          selected.acquisition?.actionCell??null,
        selectedTarget:selected.selectedTarget??
          selected.fallbackTarget??null,
        selectedMode:selected.selectedMode??
          (selectedSource==='PLAYABLE_TARGET_FALLBACK'
            ?'PLAYABLE_TARGET_FALLBACK':null),
        sourceMeasure:beforeMeasure,
        childMeasure,
        boundary,
      };
    trace.push(stepRow);

    if(boundary.kind==='NO_IMMEDIATE_OBLIGATION')
      return openBoundaryResult({
        position:child,
        residual:childResidual,
        sourcePosition:position,
        sourceResidual,
        controller,
        opponent,
        trace,
        controllerStepCount,
        normalizationPassCount,
        forcedEventCount,
      });

    if(boundary.kind==='FORCED_LOSS_OVERLOAD'){
      if(boundary.opponent!==controller)return fail(
        'POST_DESCENT_CONTROLLER_RESPONSE_OVERLOAD',{
          boundary,
          trace,
        }
      );
      return firstWin(controller,'POST_DESCENT_OPPONENT_RESPONSE_OVERLOAD',{
        sourceMeasure,
        trace,
        detail:{
          controllerStepCount,
          normalizationPassCount,
          forcedEventCount,
          boundary,
        },
      });
    }

    if(boundary.kind==='IMMEDIATE_TERMINAL_AVAILABLE'){
      if(boundary.mover===controller)
        return firstWin(controller,'POST_DESCENT_CONTROLLER_IMMEDIATE_TERMINAL',{
          sourceMeasure,
          trace,
          detail:{
            controllerStepCount,
            normalizationPassCount,
            forcedEventCount,
            boundary,
          },
        });
      return fail('POST_DESCENT_OPPONENT_IMMEDIATE_TERMINAL',{
        boundary,
        trace,
      });
    }

    if(boundary.kind!=='FORCED_RESPONSE')
      return fail('UNSUPPORTED_POST_DESCENT_BOUNDARY',{
        boundary,
        trace,
      });

    const normalized=certifyCpcxProtectedResidualForcedNormalization(child,{
      protectedResidual:childResidual,
    });
    normalizationPassCount+=1;

    if(normalized.kind==='CERTIFIED_FIRST_WIN')
      return firstWin(controller,'FORCED_NORMALIZATION',{
        sourceMeasure,
        trace:[...trace,{
          kind:'FORCED_NORMALIZATION_FIRST_WIN',
          iteration,
          certificate:normalized,
        }],
        detail:{
          controllerStepCount,
          normalizationPassCount,
          forcedEventCount:
            forcedEventCount+(normalized.steps?.length??0),
          certificate:normalized,
        },
      });

    if(!normalized.exact||
       normalized.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION')
      return fail('FORCED_NORMALIZATION_FAILED',{
        iteration,
        boundary,
        normalized,
        trace,
      });

    forcedEventCount+=normalized.steps.length;
    const finalPosition=normalized.finalPosition,
      finalResidual=live(
        finalPosition,controller,childResidual.lineId
      );
    if(!finalResidual)return fail(
      'PROTECTED_RESIDUAL_LOST_AFTER_FORCED_NORMALIZATION',{
        iteration,
        normalized,
        trace,
      }
    );

    const normalizedMeasure=measure(finalResidual);
    if(!lessOrEqual(normalizedMeasure,childMeasure))
      return fail('FORCED_NORMALIZATION_MEASURE_INCREASED',{
        iteration,
        childMeasure,
        normalizedMeasure,
        normalized,
        trace,
      });

    trace.push({
      kind:'FORCED_NORMALIZATION',
      iteration,
      stepCount:normalized.steps.length,
      steps:normalized.steps,
      sourceMeasure:childMeasure,
      finalMeasure:normalizedMeasure,
      finalMover:finalPosition.mover,
      boundary:normalized.boundary,
    });

    if(normalized.boundary?.kind!=='NO_IMMEDIATE_OBLIGATION')
      return fail('NORMALIZATION_DID_NOT_REACH_OPEN_BOUNDARY',{
        normalized,
        trace,
      });

    if(finalPosition.mover===opponent)
      return openBoundaryResult({
        position:finalPosition,
        residual:finalResidual,
        sourcePosition:position,
        sourceResidual,
        controller,
        opponent,
        trace,
        controllerStepCount,
        normalizationPassCount,
        forcedEventCount,
      });

    if(finalPosition.mover!==controller)
      return fail('NORMALIZED_MOVER_OUTSIDE_CONTROLLER_PAIR',{
        mover:finalPosition.mover,
        controller,
        opponent,
        trace,
      });

    current=finalPosition;
    currentResidual=finalResidual;
  }

  return fail('CONTROLLER_SATURATION_STEP_BOUND_EXHAUSTED',{
    maxControllerSteps,
    sourceMeasure,
    controllerStepCount,
    normalizationPassCount,
    forcedEventCount,
    trace,
  });
}
