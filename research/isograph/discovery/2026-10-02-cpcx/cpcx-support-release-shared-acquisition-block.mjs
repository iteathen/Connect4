// CPCX support-release shared acquisition/block edge.
//
// Relative to one already-selected controller event d, a protected controller
// target t at support distance one may also be the unique opponent singleton
// released by the same support event:
//
//   C:d ; O:s ; C:t
//
// The final C:t must simultaneously acquire/complete the protected controller
// residual and kill every urgent opponent singleton on t.  External opponent
// events remain outside this named transaction.  No later free frontier is
// enumerated.

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
    schema:'connect4.cpcx.support-release-shared-acquisition-block.v0_1',
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
function playableSingletonRows(position,player){
  return scanCpcxObligations(position).filter(o=>
    o.player===player&&
    o.missingCount===1&&
    o.events[0]?.supportDistance===0
  );
}
function playableSingletonCells(position,player){
  return unique(playableSingletonRows(position,player)
    .map(o=>o.missingCells[0]));
}
function live(position,player,lineId){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}
function sameCells(a,b){
  return a.length===b.length&&a.every((x,i)=>x===b[i]);
}

export function certifyCpcxSupportReleaseSharedAcquisitionBlock(position,{
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
  if(!controllerResidual||!Number.isInteger(controllerResidual.lineId))
    throw new TypeError('controllerResidual with lineId required');

  const controller=position.mover,opponent=controller^1,
    residual=live(position,controller,controllerResidual.lineId);
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
  if(
    support.column!==target.column||
    support.row!==target.row-1||
    !frontier(position,supportCell)
  )return fail('RELEASE_CELL_NOT_CURRENT_FRONTIER',{
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

  const opponentImmediate=playableSingletonCells(afterController,opponent);
  if(opponentImmediate.length)
    return fail('POST_CONTROLLER_OPPONENT_IMMEDIATE_SINGLETON',{
      cells:opponentImmediate,
    });

  const liveAfterController=live(
    afterController,controller,residual.lineId
  );
  if(
    !liveAfterController||
    !sameCells(liveAfterController.missingCells,residual.missingCells)
  )return fail('PINNED_ACTION_CHANGED_PROTECTED_RESIDUAL');

  if(!frontier(afterController,supportCell))
    return fail('SUPPORT_TRIGGER_NOT_FRONTIER_AFTER_PINNED_ACTION');

  const externalFrontier=frontierCells(afterController)
      .filter(cell=>cell!==supportCell),
    missingSet=new Set(liveAfterController.missingCells),
    externalKills=externalFrontier.filter(cell=>missingSet.has(cell));
  if(externalKills.length)
    return fail('EXTERNAL_CLASS_INTERSECTS_PROTECTED_RESIDUAL',{
      cells:externalKills,
    });

  const afterSupply=applyCpcxForcedEvent(afterController,supportCell);
  if(afterSupply.terminal)
    return fail('SUPPORT_TRIGGER_TERMINAL',{
      terminal:afterSupply.terminal,
    });

  const protectedAfterSupply=live(
    afterSupply,controller,residual.lineId
  );
  if(
    !protectedAfterSupply||
    !sameCells(protectedAfterSupply.missingCells,residual.missingCells)
  )return fail('SUPPLY_ALTERS_PROTECTED_RESIDUAL');

  const urgentRows=playableSingletonRows(afterSupply,opponent),
    urgentCells=unique(urgentRows.map(o=>o.missingCells[0]));
  if(urgentCells.length!==1||urgentCells[0]!==targetCell)
    return fail('SHARED_URGENT_CELL_MISMATCH',{
      targetCell,
      urgentCells,
    });

  if(!frontier(afterSupply,targetCell))
    return fail('SHARED_TARGET_NOT_FRONTIER');

  const protectedCarrier=createCpcxResidualCarrier(position,[residual]),
    protectedChain=compileCpcxResidualEventChain(protectedCarrier,[
      {cell:controllerActionCell,owner:controller},
      {cell:supportCell,owner:opponent},
      {cell:targetCell,owner:controller},
    ]),
    first=protectedChain.steps[0],
    second=protectedChain.steps[1],
    last=protectedChain.steps[2];

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
    return fail('PROTECTED_RESIDUAL_NOT_ACQUIRED');

  const afterTarget=applyCpcxForcedEvent(afterSupply,targetCell);
  if(afterTarget.terminal&&afterTarget.terminal.player!==controller)
    return fail('SHARED_TARGET_NONCONTROLLER_TERMINAL',{
      terminal:afterTarget.terminal,
    });

  const urgentCarrier=createCpcxResidualCarrier(afterSupply,urgentRows),
    urgentChain=compileCpcxResidualEventChain(urgentCarrier,[
      {cell:targetCell,owner:controller},
    ]),
    urgentLast=urgentChain.steps[0],
    urgentObligationIds=urgentRows.map(o=>o.id).sort(),
    killedUrgentIds=urgentLast.killed
      .filter(x=>x.player===opponent&&x.killingCell===targetCell)
      .map(x=>x.obligationId)
      .sort();

  if(
    urgentChain.residuals.length!==0||
    urgentObligationIds.some(id=>!killedUrgentIds.includes(id))
  )return fail('OPPONENT_SHARED_SINGLETON_NOT_KILLED',{
    urgentObligationIds,
    killedUrgentIds,
    remainingResidualCount:urgentChain.residuals.length,
  });

  const postOpponentImmediate=afterTarget.terminal
    ?[]
    :playableSingletonCells(afterTarget,opponent);
  if(postOpponentImmediate.length)
    return fail('POST_SHARED_DISCHARGE_P1_SINGLETON',{
      cells:postOpponentImmediate,
    });

  return {
    schema:'connect4.cpcx.support-release-shared-acquisition-block.v0_1',
    kind:'SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE',
    exact:true,
    controller,
    opponent,
    sourceRank:position.rank,
    pinnedControllerEvent:{
      cell:controllerActionCell,
      column:action.column,
    },
    protectedResidual:{
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      sourceMissingCount:residual.missingCount,
      targetCell,
      sourceSupportDistance:1,
    },
    sharedEdge:{
      triggerCell:supportCell,
      triggerOwner:opponent,
      responseCell:targetCell,
      responseOwner:controller,
      opponentUrgentCells:urgentCells,
      opponentResidualLineIds:urgentLineIds,
      opponentResidualLineLabels:urgentRows.map(o=>o.lineLabel),
      controllerResidualContracted:contracted,
      controllerResidualCompleted:completed,
      controllerTerminal:afterTarget.terminal?.player===controller
        ?afterTarget.terminal
        :null,
      opponentResidualsKilled:true,
      postResponseOpponentSingletons:postOpponentImmediate,
    },
    externalClass:{
      setWise:true,
      frontierCells:externalFrontier,
      targetRemainsUnreleased:true,
      protectedResidualDirectKillCells:[],
      rule:'every current opponent event other than the unique target-column supply is outside the target column and outside the protected residual missing-cell set',
    },
    firstWinGuardPassed:true,
    sharedDischargeAuthorized:true,
    proofRule:'the pinned controller event preserves a depth-one protected target; the unique support supply leaves the protected residual unchanged and creates exactly one urgent opponent singleton on that same target; the already-selected controller acquisition on the target contracts or completes the protected residual while killing every opponent singleton on the target and leaves no immediate opponent singleton',
    complexity:'O(columns + liveLineCount + liveResidualCount * K); K fixed',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
