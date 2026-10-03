// CPCX support-release acquisition.
//
// Relative to one already-selected controller event d, a protected controller
// residual target t at support distance one yields a guarded acquisition edge:
//
//   opponent supplies s -> controller acquires t
//
// The theorem is claim-relative. EXTERNAL opponent events are preserved as a
// separate unresolved set class. No W/D/L value or eventual completion is
// inferred.

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
    schema:'connect4.cpcx.support-release-acquisition.v0_1',
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

function frontierCells(position){
  const g=position.geometry,out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row<g.rows)out.push(row*g.columns+column);
  }
  return out;
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
    throw new TypeError('controllerResidual with lineId required');
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===residual.lineId
  )??null;
}

export function certifyCpcxSupportReleaseAcquisition(position,{
  controllerResidual,
  targetCell,
  controllerActionCell,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!Number.isInteger(targetCell))throw new TypeError('targetCell');
  if(!Number.isInteger(controllerActionCell))
    throw new TypeError('controllerActionCell');

  const controller=position.mover,opponent=controller^1,
    residual=findLiveResidual(position,controllerResidual,controller);

  if(!residual)return fail('CONTROLLER_RESIDUAL_NOT_LIVE');
  if(!residual.missingCells.includes(targetCell))
    return fail('TARGET_NOT_IN_PROTECTED_RESIDUAL',{targetCell});

  const targetEvent=residual.events.find(e=>e.cell===targetCell);
  if(!targetEvent)throw new Error('target event provenance missing');
  if(targetEvent.supportDistance!==1)
    return fail('TARGET_SUPPORT_DISTANCE_NOT_ONE',{
      targetCell,
      supportDistance:targetEvent.supportDistance,
    });

  const g=position.geometry,target=cpcxCell(g,targetCell);
  if(target.row===0)return fail('NO_SUPPORT_CELL_BELOW_TARGET');

  const supportCell=targetCell-g.columns,
    support=cpcxCell(g,supportCell);
  if(support.column!==target.column||
     support.row!==target.row-1||
     !frontier(position,supportCell))
    return fail('RELEASE_CELL_NOT_CURRENT_FRONTIER',{
      supportCell,targetCell,
    });

  if(!frontier(position,controllerActionCell))
    return fail('PINNED_CONTROLLER_ACTION_NOT_CURRENT_FRONTIER');

  const action=cpcxCell(g,controllerActionCell);
  if(action.column===target.column)
    return fail('PINNED_CONTROLLER_ACTION_SUPPLIES_TARGET',{
      supportCell,targetCell,
    });
  if(residual.missingCells.includes(controllerActionCell))
    return fail('PINNED_CONTROLLER_ACTION_ALTERS_PROTECTED_RESIDUAL',{
      controllerActionCell,
    });

  const afterController=applyCpcxForcedEvent(position,controllerActionCell);
  if(afterController.terminal)
    return fail('PINNED_CONTROLLER_ACTION_TERMINAL',{
      terminal:afterController.terminal,
    });

  const targetAfterController=cpcxEventMetadata(afterController,targetCell);
  if(targetAfterController.occupied||targetAfterController.supportDistance!==1)
    return fail('PINNED_ACTION_CHANGED_TARGET_RELEASE',{
      targetCell,
      supportDistance:targetAfterController.supportDistance,
    });
  if(!frontier(afterController,supportCell))
    return fail('SUPPORT_TRIGGER_NOT_FRONTIER_AFTER_PINNED_ACTION');

  // Audit the named SUPPLY event first. If it is itself terminal, this
  // response class is rejected directly. Other already-playable opponent
  // terminals are audited immediately afterward.
  const afterSupply=applyCpcxForcedEvent(afterController,supportCell);
  if(afterSupply.terminal)
    return fail('SUPPORT_TRIGGER_TERMINAL',{
      terminal:afterSupply.terminal,
    });

  const opponentImmediate=playableSingletonCells(afterController,opponent);
  if(opponentImmediate.length)
    return fail('POST_CONTROLLER_OPPONENT_IMMEDIATE_SINGLETON',{
      cells:opponentImmediate,
    });

  const liveAfterController=findLiveResidual(
    afterController,{lineId:residual.lineId},controller
  );
  if(!liveAfterController||
     liveAfterController.missingCells.length!==residual.missingCells.length||
     !liveAfterController.missingCells.every((x,i)=>x===residual.missingCells[i]))
    return fail('PINNED_ACTION_CHANGED_PROTECTED_RESIDUAL');

  const externalFrontier=frontierCells(afterController)
      .filter(cell=>cell!==supportCell),
    missingSet=new Set(liveAfterController.missingCells),
    externalKills=externalFrontier.filter(cell=>missingSet.has(cell));
  if(externalKills.length)
    return fail('EXTERNAL_CLASS_INTERSECTS_PROTECTED_RESIDUAL',{
      cells:externalKills,
    });

  const supplyOpponentImmediate=playableSingletonCells(afterSupply,opponent);
  if(supplyOpponentImmediate.length)
    return fail('SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON',{
      cells:supplyOpponentImmediate,
    });

  if(!frontier(afterSupply,targetCell))
    return fail('TARGET_NOT_LEGAL_ACQUISITION_AFTER_SUPPLY');

  const afterAcquisition=applyCpcxForcedEvent(afterSupply,targetCell),
    controllerTerminal=
      afterAcquisition.terminal?.player===controller
        ?afterAcquisition.terminal
        :null;

  if(afterAcquisition.terminal&&!controllerTerminal)
    return fail('UNEXPECTED_NONCONTROLLER_TERMINAL',{
      terminal:afterAcquisition.terminal,
    });

  if(!controllerTerminal){
    const postOpponentImmediate=
      playableSingletonCells(afterAcquisition,opponent);
    if(postOpponentImmediate.length)
      return fail('POST_ACQUISITION_OPPONENT_SINGLETON_TRANSPORT',{
        cells:postOpponentImmediate,
      });
  }

  const carrier=createCpcxResidualCarrier(position,[residual]),
    chain=compileCpcxResidualEventChain(carrier,[
      {cell:controllerActionCell,owner:controller},
      {cell:supportCell,owner:opponent},
      {cell:targetCell,owner:controller},
    ]),
    first=chain.steps[0],second=chain.steps[1],last=chain.steps[2];

  if(first.killed.length||first.contracted.length||first.completions.length)
    return fail('PINNED_ACTION_COFACTOR_CHANGED_PROTECTED_RESIDUAL');
  if(second.killed.length||second.contracted.length||second.completions.length)
    return fail('SUPPLY_COFACTOR_CHANGED_PROTECTED_RESIDUAL');

  const contracted=last.contracted.some(x=>
      x.player===controller&&
      x.lineLabel===residual.lineLabel&&
      x.acquiredCell===targetCell
    ),
    completed=last.completions.some(x=>
      x.player===controller&&
      x.lineLabel===residual.lineLabel&&
      x.completingCell===targetCell
    );
  if(!contracted&&!completed)
    return fail('TARGET_DID_NOT_CONTRACT_PROTECTED_RESIDUAL');

  return {
    schema:'connect4.cpcx.support-release-acquisition.v0_1',
    kind:'SUPPORT_RELEASE_ACQUISITION_EDGE',
    exact:true,
    controller,
    opponent,
    sourceRank:position.rank,
    pinnedControllerEvent:{
      cell:controllerActionCell,
      column:action.column,
    },
    residual:{
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      sourceMissingCount:residual.missingCount,
      targetCell,
      sourceSupportDistance:1,
    },
    acquisitionEdge:{
      triggerCell:supportCell,
      triggerOwner:opponent,
      acquisitionCell:targetCell,
      acquisitionOwner:controller,
      rankDeltaFromPostPinnedState:2,
      moverAfterAcquisition:opponent,
      contracted,
      completed,
    },
    externalClass:{
      setWise:true,
      frontierCells:externalFrontier,
      targetRemainsUnreleased:true,
      protectedResidualDirectKillCells:[],
      rule:'every current opponent event other than the unique target-column frontier is outside the target column and outside the protected residual missing-cell set',
    },
    supplyClass:{
      exact:true,
      opponentImmediateSingletons:[],
      controllerTerminal,
      residualContracted:contracted,
      residualCompleted:completed,
      postAcquisitionOpponentSingletons:[],
    },
    firstWinGuardPassed:true,
    acquisitionAuthorized:true,
    erasureAuthorized:false,
    proofRule:'pinned controller progress leaves the protected depth-one target unreleased; an external opponent event cannot release or directly kill the protected residual; the unique supply event gives the controller the next move on the target, which exactly contracts or completes the protected residual without an intervening opponent terminal obligation',
    complexity:'O(columns + liveLineCount + K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
