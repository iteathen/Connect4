// CPCX protected-diagonal opponent-response descent.
//
// One current opponent frontier only. Each current event is transported through
// the protected residual, followed solely by deterministic forced normalization
// and controller saturation. No second free opponent layer is consumed.

import {
  cpcxCell,
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
  certifyCpcxProtectedResidualDiagonalTransfer,
} from './cpcx-diagonal-transfer.mjs';
import {
  certifyCpcxProtectedDiagonalAnchorPivot,
} from './cpcx-diagonal-anchor-pivot.mjs';
import {
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturation,
} from './cpcx-controller-saturation.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-diagonal-opponent-response-descent.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function frontier(position){
  const g=position.geometry,out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row<g.rows)out.push(row*g.columns+column);
  }
  return out;
}

function live(position,player,lineId){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}

function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}

function measure(position,r){
  return [
    r.missingCount,
    supportDebt(r),
    position.geometry.cellCount-position.rank,
  ];
}

function lexLess(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++){
    if(a[i]<b[i])return true;
    if(a[i]>b[i])return false;
  }
  return a.length<b.length;
}

function sameGeometry(a,b){
  return a&&b&&
    a.columns===b.columns&&
    a.rows===b.rows&&
    a.connect===b.connect;
}

function residualAfterTransfer(transfer,mode,controller){
  const target=mode==='SAME_TRACK'?transfer.transfer:transfer.pivot;
  return live(transfer.child,controller,target.lineId);
}

function closeController(position,residual){
  if(position.terminal)return position.terminal.player===residual.player
    ?{
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:residual.player,
      source:'SOURCE_TERMINAL',
    }
    :fail('OPPONENT_TERMINAL_BEFORE_CONTROLLER_CLOSURE',{
      terminal:position.terminal,
    });

  const controller=residual.player,opponent=controller^1;
  if(position.mover!==controller)
    return fail('CONTROLLER_CLOSURE_MOVER_MISMATCH',{
      mover:position.mover,
      controller,
    });

  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'){
    return {
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:controller,
      source:'CONTROLLER_IMMEDIATE_TERMINAL',
      boundary:immediate,
    };
  }
  if(immediate.kind==='FORCED_LOSS_OVERLOAD')
    return fail('CONTROLLER_FORCED_LOSS_OVERLOAD',{
      boundary:immediate,
    });

  let current=position,currentResidual=residual;
  const normalization=[];

  if(immediate.kind==='FORCED_RESPONSE'){
    const n=certifyCpcxProtectedResidualForcedNormalization(current,{
      protectedResidual:currentResidual,
    });
    if(n.kind==='CERTIFIED_FIRST_WIN'&&n.player===controller)return {
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:controller,
      source:'FORCED_NORMALIZATION',
      certificate:n,
      normalization,
    };
    if(!n.exact||n.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION')
      return fail('FORCED_NORMALIZATION_FAILED',{
        certificate:n,
      });

    normalization.push(n);
    current=n.finalPosition;
    currentResidual=live(current,controller,currentResidual.lineId);
    if(!currentResidual)
      return fail('PROTECTED_RESIDUAL_LOST_AFTER_NORMALIZATION');

    if(current.mover===opponent)return {
      kind:'OPEN_OPPONENT_BOUNDARY',
      exact:true,
      controller,
      opponent,
      finalPosition:current,
      finalResidual:currentResidual,
      normalization,
      saturation:null,
    };

    if(current.mover!==controller)
      return fail('NORMALIZED_MOVER_MISMATCH',{
        mover:current.mover,
        controller,
        opponent,
      });
  }else if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION'){
    return fail('UNSUPPORTED_CONTROLLER_IMMEDIATE_BOUNDARY',{
      boundary:immediate,
    });
  }

  const s=certifyCpcxProtectedDiagonalControllerSaturation(current,{
    protectedResidual:currentResidual,
  });
  if(s.kind==='CERTIFIED_FIRST_WIN'&&s.player===controller)return {
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:controller,
    source:'CONTROLLER_SATURATION',
    certificate:s,
    normalization,
  };
  if(!s.exact||s.kind!=='PROTECTED_DIAGONAL_CONTROLLER_SATURATION')
    return fail('CONTROLLER_SATURATION_FAILED',{
      certificate:s,
      normalization,
    });

  return {
    kind:'OPEN_OPPONENT_BOUNDARY',
    exact:true,
    controller,
    opponent,
    finalPosition:s.finalPosition,
    finalResidual:s.finalResidual,
    normalization,
    saturation:s,
  };
}

export function certifyCpcxProtectedDiagonalOpponentResponseEvent(position,{
  protectedResidual,
  eventCell,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');
  if(!Number.isInteger(eventCell))throw new TypeError('eventCell');

  const controller=protectedResidual.player,opponent=controller^1,
    source=live(position,controller,protectedResidual.lineId);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(source.orientation!=='D+'&&source.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{orientation:source.orientation});
  if(position.mover!==opponent)
    return fail('SOURCE_MOVER_NOT_OPPONENT',{
      mover:position.mover,
      controller,
      opponent,
    });
  if(!frontier(position).includes(eventCell))
    return fail('EVENT_NOT_CURRENT_FRONTIER',{eventCell});

  const sourceMeasure=measure(position,source);

  let child,childResidual,transportKind,transportDetail;

  if(source.missingCells.includes(eventCell)){
    let t=certifyCpcxProtectedResidualDiagonalTransfer(position,{
      protectedResidual:source,
      blockedCell:eventCell,
    });
    transportKind='SAME_TRACK';

    if(!t.exact||t.kind!=='PROTECTED_RESIDUAL_DIAGONAL_TRANSFER'){
      const pivot=certifyCpcxProtectedDiagonalAnchorPivot(position,{
        protectedResidual:source,
        blockedCell:eventCell,
      });
      if(!pivot.exact||
         pivot.kind!=='PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER')
        return fail('PROTECTED_TARGET_TRANSFER_FAILED',{
          eventCell,
          sameTrack:t,
          anchorPivot:pivot,
          sourceMeasure,
        });
      t=pivot;
      transportKind='ANCHOR_PIVOT';
    }

    child=t.child;
    childResidual=residualAfterTransfer(t,transportKind,controller);
    if(!childResidual)
      return fail('TRANSFER_RESIDUAL_NOT_LIVE',{
        eventCell,
        transportKind,
      });

    transportDetail=t;
  }else{
    const t=certifyCpcxProtectedResidualSupportTransition(position,{
      protectedResidual:source,
      eventCell,
    });
    if(t.kind==='TERMINAL_EVENT'){
      if(t.terminal?.player===controller)return {
        schema:'connect4.cpcx.protected-diagonal-opponent-response-event.v0_1',
        kind:'CERTIFIED_FIRST_WIN',
        exact:true,
        player:controller,
        controller,
        opponent,
        eventCell,
        sourceMeasure,
        source:'TERMINAL_ON_OPPONENT_EVENT',
        terminal:t.terminal,
        recursive:false,
        choiceEnumeration:false,
        gameTreeTraversal:false,
        solvedData:false,
        oracle:false,
      };
      return fail('OPPONENT_TERMINAL_EVENT',{
        eventCell,
        terminal:t.terminal,
        sourceMeasure,
      });
    }
    if(!t.exact||t.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
      return fail('EXTERNAL_SUPPORT_TRANSITION_FAILED',{
        eventCell,
        transition:t,
        sourceMeasure,
      });

    child=applyCpcxForcedEvent(position,eventCell);
    childResidual=live(child,controller,source.lineId);
    if(!childResidual)
      return fail('PROTECTED_RESIDUAL_LOST_AFTER_EXTERNAL_EVENT',{
        eventCell,
      });

    transportKind='SUPPORT_TRANSITION';
    transportDetail=t;
  }

  if(!sameGeometry(position.geometry,child.geometry))
    return fail('CHILD_GEOMETRY_MISMATCH');
  if(child.mover!==controller)
    return fail('POST_OPPONENT_EVENT_MOVER_MISMATCH',{
      mover:child.mover,
      controller,
    });

  const closure=closeController(child,childResidual);
  if(closure.kind==='CERTIFIED_FIRST_WIN'&&closure.player===controller)return {
    schema:'connect4.cpcx.protected-diagonal-opponent-response-event.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:controller,
    controller,
    opponent,
    eventCell,
    sourceMeasure,
    transportKind,
    transportDetail,
    closure,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
  if(!closure.exact||closure.kind!=='OPEN_OPPONENT_BOUNDARY')
    return fail('DETERMINISTIC_CONTROLLER_CLOSURE_FAILED',{
      eventCell,
      sourceMeasure,
      transportKind,
      transportDetail,
      closure,
    });

  const finalMeasure=measure(
    closure.finalPosition,closure.finalResidual
  );
  if(!lexLess(finalMeasure,sourceMeasure))
    return fail('EXTENDED_MEASURE_NOT_STRICTLY_DECREASED',{
      eventCell,
      sourceMeasure,
      finalMeasure,
      transportKind,
      closure,
    });

  return {
    schema:'connect4.cpcx.protected-diagonal-opponent-response-event.v0_1',
    kind:'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT',
    exact:true,
    controller,
    opponent,
    eventCell,
    sourceMeasure,
    finalMeasure,
    strictExtendedMeasureDecrease:true,
    transportKind,
    transportDetail,
    finalPosition:closure.finalPosition,
    finalResidual:closure.finalResidual,
    closure,
    proofRule:'one current opponent event receives exact protected support/diagonal transport; all subsequent events are unique forced normalization or deterministic controller saturation; the resulting open opponent boundary has strictly smaller (missingCount,supportDebt,remainingCapacity)',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function certifyCpcxProtectedDiagonalOpponentResponseDescent(position,{
  protectedResidual,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');

  const controller=protectedResidual.player,opponent=controller^1,
    source=live(position,controller,protectedResidual.lineId);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(source.orientation!=='D+'&&source.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{orientation:source.orientation});
  if(position.mover!==opponent)
    return fail('SOURCE_MOVER_NOT_OPPONENT',{
      mover:position.mover,
      controller,
      opponent,
    });

  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{
      boundary:immediate,
    });

  const sourceMeasure=measure(position,source),
    events=frontier(position),
    rows=events.map(eventCell=>
      certifyCpcxProtectedDiagonalOpponentResponseEvent(position,{
        protectedResidual:source,
        eventCell,
      })
    ),
    failures=rows.filter(x=>!x.exact),
    descentFailures=rows.filter(x=>
      x.kind!=='CERTIFIED_FIRST_WIN'&&
      x.strictExtendedMeasureDecrease!==true
    );

  if(failures.length||descentFailures.length)
    return fail('OPPONENT_RESPONSE_TOTALITY_FAILED',{
      sourceMeasure,
      eventCount:events.length,
      failures,
      descentFailures,
    });

  return {
    schema:'connect4.cpcx.protected-diagonal-opponent-response-descent.v0_1',
    kind:'PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT',
    exact:true,
    controller,
    opponent,
    sourceLineId:source.lineId,
    sourceLineLabel:source.lineLabel,
    sourceMeasure,
    eventCount:events.length,
    rows,
    allCurrentOpponentEventsCovered:true,
    everyEventWinsOrStrictlyDescends:true,
    proofRule:'the complete current legal opponent frontier is partitioned only by protected-target occupation versus external support event; every row closes through qualified transport, forced normalization and deterministic controller saturation to controller first win or a strictly smaller open opponent boundary',
    complexity:'O(width * poly(liveLineCount,K,remainingCapacity)); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
