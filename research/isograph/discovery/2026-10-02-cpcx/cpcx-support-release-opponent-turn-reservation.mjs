// CPCX opponent-turn support-release reservation.
//
// Exact current-player boundary:
//
//   O to move with one live O singleton target t at support distance one.
//   SUPPLY O:s -> reserved C:t
//
// EXTERNAL current O events cannot release t through this residual because s is
// the unique frontier in the target column.  No later free frontier is
// enumerated.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';

function unique(values){
  return [...new Set(values)].sort((a,b)=>a-b);
}
function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.support-release-opponent-turn-reservation.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}
function frontier(position,cell){
  const {column,row}=cpcxCell(position.geometry,cell);
  return row<position.geometry.rows&&
    row===position.heights[column]&&
    position.owner[cell]===-1;
}
function playableSingletonCells(position,player){
  return unique(scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.missingCount===1&&
      o.events[0]?.supportDistance===0
    )
    .map(o=>o.missingCells[0]));
}
function live(position,player,residual){
  if(!residual||!Number.isInteger(residual.lineId))
    throw new TypeError('ownerResidual with lineId required');
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===residual.lineId
  )??null;
}

export function certifyCpcxSupportReleaseOpponentTurnReservation(position,{
  ownerResidual,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');

  const owner=position.mover,controller=owner^1,
    residual=live(position,owner,ownerResidual);
  if(!residual)return fail('OWNER_RESIDUAL_NOT_LIVE');
  if(residual.missingCount!==1)
    return fail('RESIDUAL_NOT_SINGLETON',{missingCount:residual.missingCount});

  const targetCell=residual.missingCells[0],
    event=residual.events[0];
  if(event.supportDistance!==1)
    return fail('TARGET_SUPPORT_DISTANCE_NOT_ONE',{
      targetCell,supportDistance:event.supportDistance,
    });

  const g=position.geometry,target=cpcxCell(g,targetCell);
  if(target.row===0)return fail('NO_SUPPORT_CELL_BELOW_TARGET');
  const supportCell=targetCell-g.columns,
    support=cpcxCell(g,supportCell);
  if(
    support.column!==target.column||
    support.row!==target.row-1||
    !frontier(position,supportCell)
  )return fail('RELEASE_CELL_NOT_CURRENT_FRONTIER',{
    supportCell,targetCell,
  });

  const currentUrgent=playableSingletonCells(position,owner);
  if(currentUrgent.length)
    return fail('SOURCE_OWNER_IMMEDIATE_SINGLETON',{
      cells:currentUrgent,
    });

  const afterSupply=applyCpcxForcedEvent(position,supportCell);
  if(afterSupply.terminal)
    return fail('SUPPORT_TRIGGER_TERMINAL',{
      terminal:afterSupply.terminal,
    });

  const urgent=playableSingletonCells(afterSupply,owner);
  if(urgent.length!==1||urgent[0]!==targetCell)
    return fail('SUPPLY_RESPONSE_CAPACITY_NOT_UNIT',{
      targetCell,
      urgentCells:urgent,
      deficit:Math.max(0,urgent.length-1),
    });

  if(!frontier(afterSupply,targetCell))
    return fail('TARGET_NOT_LEGAL_BLOCK_AFTER_SUPPLY');

  const afterResponse=applyCpcxForcedEvent(afterSupply,targetCell);
  if(afterResponse.terminal)
    return fail('RESERVED_RESPONSE_TERMINAL',{
      terminal:afterResponse.terminal,
    });

  const transported=playableSingletonCells(afterResponse,owner);
  if(transported.length)
    return fail('POST_RESPONSE_OWNER_SINGLETON_TRANSPORT',{
      cells:transported,
    });

  const carrier=createCpcxResidualCarrier(position,[residual]),
    chain=compileCpcxResidualEventChain(carrier,[
      {cell:supportCell,owner},
      {cell:targetCell,owner:controller},
    ]),
    last=chain.steps[chain.steps.length-1],
    killed=last.killed.some(x=>
      x.obligationId===residual.id&&
      x.player===owner&&
      x.killingCell===targetCell&&
      x.killingOwner===controller
    );
  if(!killed||chain.residuals.length)
    return fail('RESIDUAL_NOT_KILLED_BY_RESERVED_RESPONSE',{
      residualId:residual.id,
      remainingResidualCount:chain.residuals.length,
    });

  return {
    schema:'connect4.cpcx.support-release-opponent-turn-reservation.v0_1',
    kind:'SUPPORT_RELEASE_OPPONENT_TURN_RESERVATION',
    exact:true,
    owner,
    controller,
    sourceRank:position.rank,
    residual:{
      id:residual.id,
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      targetCell,
      sourceSupportDistance:1,
    },
    responseEdge:{
      triggerCell:supportCell,
      triggerOwner:owner,
      responseCell:targetCell,
      responseOwner:controller,
      reservedResponseSlots:1,
    },
    externalClass:{
      setWise:true,
      rule:'every current owner event other than the unique target-column frontier is outside the target column and cannot release this residual',
      targetRemainsUnplayable:true,
    },
    supplyClass:{
      exact:true,
      urgentCells:[targetCell],
      responseCapacity:1,
      responseDemand:1,
      overload:false,
      residualKilled:true,
      moverAfterResponse:owner,
      transportedOwnerSingletons:[],
    },
    firstWinGuardPassed:true,
    capacityReservationRequired:true,
    proofRule:'at an exact owner-to-move boundary, a depth-one singleton has one unique supply event; external current events cannot release it, while the supply creates exactly one urgent singleton and the reserved opponent response occupies that target, kills the residual, and transports no immediate owner singleton',
    complexity:'O(liveLineCount + liveResidualCount * K); K fixed',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
