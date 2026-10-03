// CPCX depth-one support-release response neutralization.
//
// Relative to one already-selected controller event d, an opponent singleton
// target t at support distance one is represented as a guarded response edge:
//
//   opponent supplies s -> controller occupies t
//
// The theorem is claim-relative. It does not delete the residual globally and
// does not convert an optimistic deadline into a value label.

import {
  cpcxCell,
  cpcxEventMetadata,
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
    schema:'connect4.cpcx.support-release-response-neutralization.v0_1',
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
      o.events[0].supportDistance===0
    )
    .map(o=>o.missingCells[0]));
}

function findLiveResidual(position,residual,player){
  if(!residual||!Number.isInteger(residual.lineId))
    throw new TypeError('opponentResidual with lineId required');
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===residual.lineId
  )??null;
}

export function certifyCpcxSupportReleaseResponseNeutralization(position,{
  opponentResidual,
  defenderActionCell,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!Number.isInteger(defenderActionCell))
    throw new TypeError('defenderActionCell');

  const defender=position.mover,opponent=defender^1,
    residual=findLiveResidual(position,opponentResidual,opponent);

  if(!residual)return fail('OPPONENT_RESIDUAL_NOT_LIVE');
  if(residual.missingCount!==1)
    return fail('RESIDUAL_NOT_SINGLETON',{missingCount:residual.missingCount});

  const targetCell=residual.missingCells[0],
    targetEvent=residual.events[0];
  if(targetEvent.supportDistance!==1)
    return fail('TARGET_SUPPORT_DISTANCE_NOT_ONE',{
      targetCell,
      supportDistance:targetEvent.supportDistance,
    });

  const g=position.geometry,
    target=cpcxCell(g,targetCell);
  if(target.row===0)return fail('NO_SUPPORT_CELL_BELOW_TARGET');

  const supportCell=targetCell-g.columns,
    support=cpcxCell(g,supportCell);
  if(support.column!==target.column||
     support.row!==target.row-1||
     !frontier(position,supportCell))
    return fail('RELEASE_CELL_NOT_CURRENT_FRONTIER',{supportCell,targetCell});

  const sourceOpponentSingletons=playableSingletonCells(position,opponent);
  if(sourceOpponentSingletons.length)
    return fail('SOURCE_OPPONENT_IMMEDIATE_SINGLETON',{
      cells:sourceOpponentSingletons,
    });

  if(!frontier(position,defenderActionCell))
    return fail('PINNED_DEFENDER_ACTION_NOT_CURRENT_FRONTIER');

  const defenderAction=cpcxCell(g,defenderActionCell);
  if(defenderActionCell===supportCell||
     defenderAction.column===target.column)
    return fail('PINNED_DEFENDER_ACTION_SUPPLIES_TARGET',{
      supportCell,
      targetCell,
    });

  const afterDefender=applyCpcxForcedEvent(position,defenderActionCell);
  if(afterDefender.terminal)
    return fail('PINNED_DEFENDER_ACTION_TERMINAL',{
      terminal:afterDefender.terminal,
    });

  const targetAfterDefender=cpcxEventMetadata(afterDefender,targetCell);
  if(targetAfterDefender.occupied||targetAfterDefender.supportDistance!==1)
    return fail('PINNED_ACTION_CHANGED_TARGET_RELEASE',{
      targetCell,
      supportDistance:targetAfterDefender.supportDistance,
    });

  const afterDefenderOpponentSingletons=
    playableSingletonCells(afterDefender,opponent);
  if(afterDefenderOpponentSingletons.length)
    return fail('POST_DEFENDER_OPPONENT_IMMEDIATE_SINGLETON',{
      cells:afterDefenderOpponentSingletons,
    });

  if(!frontier(afterDefender,supportCell))
    return fail('SUPPORT_TRIGGER_NOT_FRONTIER_AFTER_PINNED_ACTION');

  // The SUPPLY class is one exact theorem-defined event. Every other legal
  // opponent event is outside target.column because supportCell is its unique
  // frontier, so the EXTERNAL class cannot release targetCell.
  const afterSupply=applyCpcxForcedEvent(afterDefender,supportCell);
  if(afterSupply.terminal)
    return fail('SUPPORT_TRIGGER_TERMINAL',{
      terminal:afterSupply.terminal,
    });

  const urgent=playableSingletonCells(afterSupply,opponent);
  if(urgent.length!==1||urgent[0]!==targetCell)
    return fail('SUPPLY_RESPONSE_CAPACITY_NOT_UNIT',{
      targetCell,
      urgentCells:urgent,
      deficit:Math.max(0,urgent.length-1),
    });

  if(!frontier(afterSupply,targetCell))
    return fail('TARGET_NOT_LEGAL_BLOCK_AFTER_SUPPLY');

  const afterBlock=applyCpcxForcedEvent(afterSupply,targetCell);
  if(afterBlock.terminal)
    return fail('BLOCK_EVENT_TERMINAL',{
      terminal:afterBlock.terminal,
    });

  const transported=playableSingletonCells(afterBlock,opponent);
  if(transported.length)
    return fail('POST_BLOCK_OPPONENT_SINGLETON_TRANSPORT',{
      cells:transported,
    });

  const carrier=createCpcxResidualCarrier(position,[residual]),
    chain=compileCpcxResidualEventChain(carrier,[
      {cell:defenderActionCell,owner:defender},
      {cell:supportCell,owner:opponent},
      {cell:targetCell,owner:defender},
    ]),
    last=chain.steps[chain.steps.length-1],
    killed=last.killed.some(x=>
      x.player===opponent&&
      x.lineLabel===residual.lineLabel&&
      x.killingCell===targetCell&&
      x.killingOwner===defender
    );
  if(!killed||chain.residuals.length)
    return fail('RESIDUAL_NOT_KILLED_BY_RESERVED_RESPONSE',{
      remainingResidualCount:chain.residuals.length,
    });

  return {
    schema:'connect4.cpcx.support-release-response-neutralization.v0_1',
    kind:'SUPPORT_RELEASE_RESPONSE_EDGE',
    exact:true,
    defender,
    opponent,
    sourceRank:position.rank,
    pinnedDefenderEvent:{
      cell:defenderActionCell,
      column:defenderAction.column,
    },
    residual:{
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      targetCell,
      sourceSupportDistance:1,
    },
    responseEdge:{
      triggerCell:supportCell,
      triggerOwner:opponent,
      responseCell:targetCell,
      responseOwner:defender,
      reservedResponseSlots:1,
      sharedResponseDedupRequired:true,
    },
    externalClass:{
      setWise:true,
      rule:'every legal opponent event other than the unique target-column frontier is outside the target column and cannot release this residual',
      targetRemainsUnplayable:true,
    },
    supplyClass:{
      exact:true,
      urgentCells:[targetCell],
      responseCapacity:1,
      responseDemand:1,
      overload:false,
      rankDeltaFromPostPinnedState:2,
      moverAfterResponse:opponent,
      residualKilled:true,
      transportedOpponentSingletons:[],
    },
    firstWinGuardPassed:true,
    directFirstTerminalErasureAuthorized:true,
    erasureScope:'relative to the pinned defender event and preserved response reservation only',
    capacityReservationRequired:true,
    proofRule:'the pinned defender event leaves the depth-one support unreleased; external opponent events cannot change the target column; the unique supply event creates exactly one urgent singleton and the reserved controller response occupies that target without transporting another immediate opponent singleton',
    complexity:'O(liveLineCount + liveResidualCount * K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
