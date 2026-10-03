// CPCX protected-residual forced normalization.
//
// Deterministic composition only:
//   exact FORCED_RESPONSE
//     -> exact forced event
//     -> protected residual stutter / support advance / owner contraction
//     -> repeat until the first non-forced boundary.
//
// No free legal choice is introduced. The theorem fails closed if an opponent
// forced event occupies a protected target or if the deterministic boundary
// gives the opponent a first-win certificate.

import {
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-residual-forced-normalization.v0_1',
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

function sameCells(a,b){
  if(a.length!==b.length)return false;
  const x=[...a].sort((u,v)=>u-v),
    y=[...b].sort((u,v)=>u-v);
  return x.every((v,i)=>v===y[i]);
}

function supportDebt(residual){
  return residual.events.reduce((n,e)=>n+e.supportDistance,0);
}

function supportVector(residual){
  const m=new Map(residual.events.map(e=>[e.cell,e.supportDistance]));
  return residual.missingCells.map(cell=>m.get(cell));
}

function firstWin(controller,source,detail={}){
  return {
    schema:'connect4.cpcx.protected-residual-forced-normalization.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:controller,
    controller,
    source,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function certifyCpcxProtectedResidualForcedNormalization(position,{
  protectedResidual,
  maxSteps=position?.geometry?.cellCount-position?.rank,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');
  if(!Number.isInteger(maxSteps)||maxSteps<1)
    throw new RangeError('maxSteps');

  const controller=protectedResidual.player,opponent=controller^1,
    source=live(position,controller,protectedResidual.lineId);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');

  const sourceImmediate=classifyCpcxImmediate(position);
  if(sourceImmediate.kind!=='FORCED_RESPONSE')
    return fail('SOURCE_NOT_FORCED_RESPONSE',{
      boundary:sourceImmediate,
    });

  let current=position,currentResidual=source;
  const steps=[];

  for(let i=0;i<maxSteps;i++){
    const immediate=classifyCpcxImmediate(current);
    if(immediate.kind!=='FORCED_RESPONSE')break;

    const eventCell=immediate.cell,eventOwner=current.mover,
      beforeResidual=currentResidual,
      beforeDebt=supportDebt(beforeResidual),
      beforeMissing=[...beforeResidual.missingCells];

    if(beforeResidual.missingCells.includes(eventCell)){
      if(eventOwner!==controller)return fail(
        'OPPONENT_KILLS_PROTECTED_RESIDUAL',{
          eventCell,
          eventOwner,
          steps,
        }
      );

      const carrier=createCpcxResidualCarrier(current,[beforeResidual]),
        chain=compileCpcxResidualEventChain(carrier,[{
          cell:eventCell,
          owner:eventOwner,
        }]),
        effect=chain.steps[0],
        child=applyCpcxForcedEvent(current,eventCell);

      if(child.terminal){
        if(child.terminal.player!==controller)return fail(
          'OPPONENT_TERMINAL_DURING_NORMALIZATION',{
            eventCell,
            terminal:child.terminal,
            steps,
          }
        );
        return firstWin(controller,'FORCED_TARGET_COMPLETION',{
          eventCell,
          terminal:child.terminal,
          steps:[...steps,{
            index:i,
            cell:eventCell,
            owner:eventOwner,
            kind:'RESIDUAL_COMPLETION',
          }],
          rankDelta:child.rank-position.rank,
        });
      }

      const after=live(child,controller,beforeResidual.lineId);
      if(!after)return fail('PROTECTED_RESIDUAL_LOST_AFTER_CONTRACTION',{
        eventCell,steps,
      });
      const removed=beforeResidual.missingCells.filter(cell=>
        !after.missingCells.includes(cell)
      );
      if(removed.length!==1||removed[0]!==eventCell||
         after.missingCount!==beforeResidual.missingCount-1)
        return fail('PROTECTED_CONTRACTION_MISMATCH',{
          eventCell,
          beforeMissing,
          afterMissing:[...after.missingCells],
        });
      const contracted=effect.contracted.some(x=>
        x.player===controller&&x.acquiredCell===eventCell
      );
      if(!contracted)return fail('COFACTOR_CONTRACTION_NOT_RECORDED',{
        eventCell,effect,
      });

      steps.push({
        index:i,
        cell:eventCell,
        owner:eventOwner,
        kind:'RESIDUAL_CONTRACTION',
        beforeMissing,
        afterMissing:[...after.missingCells],
        beforeDebt,
        afterDebt:supportDebt(after),
      });
      current=child;
      currentResidual=after;
      continue;
    }

    const transition=certifyCpcxProtectedResidualSupportTransition(current,{
      protectedResidual:beforeResidual,
      eventCell,
    });
    if(transition.kind==='TERMINAL_EVENT'){
      if(transition.terminal?.player!==controller)return fail(
        'OPPONENT_TERMINAL_DURING_NORMALIZATION',{
          eventCell,
          terminal:transition.terminal,
          steps,
        }
      );
      return firstWin(controller,'FORCED_EXTERNAL_TERMINAL',{
        eventCell,
        terminal:transition.terminal,
        steps,
        rankDelta:1,
      });
    }
    if(!transition.exact||
       transition.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
      return fail('PROTECTED_SUPPORT_TRANSITION_FAILED',{
        eventCell,
        transition,
        steps,
      });

    const child=applyCpcxForcedEvent(current,eventCell),
      after=live(child,controller,beforeResidual.lineId);
    if(!after)return fail('PROTECTED_RESIDUAL_LOST_AFTER_SUPPORT_EVENT',{
      eventCell,steps,
    });
    if(!sameCells(after.missingCells,beforeResidual.missingCells))
      return fail('PROTECTED_MISSING_SET_CHANGED',{
        eventCell,
        beforeMissing,
        afterMissing:[...after.missingCells],
      });

    steps.push({
      index:i,
      cell:eventCell,
      owner:eventOwner,
      kind:transition.supportDebtDelta<0
        ?'SUPPORT_ADVANCE'
        :'SUPPORT_STUTTER',
      beforeMissing,
      afterMissing:[...after.missingCells],
      beforeDebt,
      afterDebt:supportDebt(after),
      supportDebtDelta:transition.supportDebtDelta,
      touchedTargetCells:[...transition.touchedTargetCells],
    });
    current=child;
    currentResidual=after;
  }

  const boundary=classifyCpcxImmediate(current);
  if(boundary.kind==='FORCED_RESPONSE')
    return fail('FORCED_NORMALIZATION_STEP_BOUND_EXHAUSTED',{
      maxSteps,steps,
    });

  if(boundary.kind==='IMMEDIATE_TERMINAL_AVAILABLE'){
    if(current.mover===controller)return firstWin(
      controller,'NORMALIZED_CONTROLLER_IMMEDIATE_TERMINAL',{
        boundary,
        steps,
        rankDelta:current.rank-position.rank,
      }
    );
    return fail('OPPONENT_IMMEDIATE_TERMINAL_AFTER_NORMALIZATION',{
      boundary,steps,
    });
  }

  if(boundary.kind==='FORCED_LOSS_OVERLOAD'){
    if(boundary.opponent===controller)return firstWin(
      controller,'NORMALIZED_OPPONENT_RESPONSE_OVERLOAD',{
        boundary,
        steps,
        rankDelta:current.rank-position.rank,
      }
    );
    return fail('CONTROLLER_RESPONSE_OVERLOAD_AFTER_NORMALIZATION',{
      boundary,steps,
    });
  }

  if(boundary.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('UNSUPPORTED_NORMALIZATION_BOUNDARY',{
      boundary,steps,
    });

  const finalResidual=live(
    current,controller,currentResidual.lineId
  );
  if(!finalResidual)return fail(
    'PROTECTED_RESIDUAL_NOT_LIVE_AT_OPEN_BOUNDARY',{steps}
  );

  const sourceDebt=supportDebt(source),
    finalDebt=supportDebt(finalResidual);
  if(finalDebt>sourceDebt)return fail(
    'PROTECTED_SUPPORT_DEBT_INCREASED',{
      sourceDebt,finalDebt,steps,
    }
  );
  if(finalResidual.missingCount>source.missingCount)return fail(
    'PROTECTED_CARDINALITY_INCREASED',{
      sourceMissingCount:source.missingCount,
      finalMissingCount:finalResidual.missingCount,
      steps,
    }
  );

  return {
    schema:'connect4.cpcx.protected-residual-forced-normalization.v0_1',
    kind:'PROTECTED_RESIDUAL_FORCED_NORMALIZATION',
    exact:true,
    controller,
    opponent,
    sourceRank:position.rank,
    finalRank:current.rank,
    rankDelta:current.rank-position.rank,
    sourceLineId:source.lineId,
    sourceLineLabel:source.lineLabel,
    sourceMissingCells:[...source.missingCells],
    finalMissingCells:[...finalResidual.missingCells],
    sourceMissingCount:source.missingCount,
    finalMissingCount:finalResidual.missingCount,
    sourceSupportVector:supportVector(source),
    finalSupportVector:supportVector(finalResidual),
    sourceSupportDebt:sourceDebt,
    finalSupportDebt:finalDebt,
    supportDebtDelta:finalDebt-sourceDebt,
    steps,
    boundary,
    finalPosition:current,
    residualCardinalityNonincreasing:true,
    supportDebtNonincreasing:true,
    firstWinGuardPassed:true,
    proofRule:'only unique forced responses are applied; each nonterminal event either preserves the protected residual under exact support transport or contracts it by a controller-owned protected target; opponent target occupation and opponent first-terminal boundaries fail closed',
    complexity:'O(forcedStepCount * (liveLineCount + K)); K<=4 and forcedStepCount is bounded by remaining physical capacity',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
