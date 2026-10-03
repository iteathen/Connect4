// CPCX vertical three-stage setup.
//
// Exact one-event lift:
//   current-player vertical residual with missing support profile [0,1,2]
//   -> owner takes the bottom cell
//   -> exact child reconstructs the existing vertical two-stage [0,1] class.
//
// This is a progress theorem only. It does not duplicate two-stage response
// semantics and does not infer eventual W/D/L from the existence of the ladder.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.vertical-three-stage-setup.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function sortedEvents(obligation){
  return obligation.events.slice().sort((a,b)=>a.row-b.row||a.cell-b.cell);
}

export function findCpcxVerticalThreeStageObligations(position,{
  player=position.mover,
}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  const out=[];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==player||o.orientation!=='V'||o.missingCount!==3)continue;
    const events=sortedEvents(o);
    if(events.length!==3)continue;
    const [a,b,c]=events;
    if(a.column!==b.column||a.column!==c.column)continue;
    if(b.row!==a.row+1||c.row!==b.row+1)continue;
    if(a.supportDistance!==0||
       b.supportDistance!==1||
       c.supportDistance!==2)continue;
    out.push({
      obligation:o,
      player,
      defender:player^1,
      column:a.column,
      setupCell:a.cell,
      middleCell:b.cell,
      upperCell:c.cell,
      supportProfile:[0,1,2],
    });
  }
  out.sort((a,b)=>
    a.setupCell-b.setupCell||
    a.middleCell-b.middleCell||
    a.upperCell-b.upperCell||
    a.obligation.lineId-b.obligation.lineId
  );
  return out;
}

export function certifyCpcxVerticalThreeStageSetup(position,demand){
  if(!demand?.obligation)throw new TypeError('vertical three-stage demand');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(demand.player!==position.mover)return fail('CONTROLLER_NOT_TO_MOVE');

  const live=findCpcxVerticalThreeStageObligations(position,{
    player:demand.player,
  }).find(x=>
    x.obligation.lineId===demand.obligation.lineId&&
    x.setupCell===demand.setupCell&&
    x.middleCell===demand.middleCell&&
    x.upperCell===demand.upperCell
  );
  if(!live)return fail('DEMAND_NOT_CURRENT_LIVE_THREE_STAGE');

  const pre=classifyCpcxImmediate(position);
  if(pre.kind!=='NO_IMMEDIATE_OBLIGATION')return fail(
    'SOURCE_IMMEDIATE_PRECEDENCE',
    {boundary:pre}
  );

  const controller=demand.player,defender=controller^1,
    child=applyCpcxForcedEvent(position,demand.setupCell);

  if(child.terminal){
    if(child.terminal.player!==controller)return fail(
      'WRONG_TERMINAL_ON_SETUP',
      {terminal:child.terminal}
    );
    return {
      schema:'connect4.cpcx.vertical-three-stage-setup.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:controller,
      controller,
      defender,
      setupCell:demand.setupCell,
      sourceLineId:demand.obligation.lineId,
      terminal:child.terminal,
      rankDelta:1,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };
  }

  if(child.mover!==defender)return fail('SETUP_MOVER_MISMATCH');

  const immediate=classifyCpcxImmediate(child);
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE')return fail(
    'DEFENDER_TERMINAL_AFTER_SETUP',
    {boundary:immediate}
  );
  if(immediate.kind==='FORCED_LOSS_OVERLOAD'){
    if(immediate.opponent!==controller)return fail(
      'UNEXPECTED_OVERLOAD_OWNER',
      {boundary:immediate}
    );
    return {
      schema:'connect4.cpcx.vertical-three-stage-setup.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:controller,
      controller,
      defender,
      setupCell:demand.setupCell,
      sourceLineId:demand.obligation.lineId,
      source:'SETUP_TO_OPPONENT_SINGLETON_OVERLOAD',
      boundary:immediate,
      rankDelta:1,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };
  }
  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')return fail(
    'SETUP_REQUIRES_HIGHER_PRECEDENCE_NORMALIZATION',
    {boundary:immediate}
  );

  const childDemand=findCpcxVerticalTwoStageObligations(child,{
    player:controller,
  }).find(x=>
    x.obligation.lineId===demand.obligation.lineId&&
    x.lowerCell===demand.middleCell&&
    x.upperCell===demand.upperCell
  );
  if(!childDemand)return fail('TWO_STAGE_CHILD_NOT_RECONSTRUCTED');

  const certificate=certifyCpcxVerticalTwoStage(child,childDemand);
  if(!certificate.exact||
     certificate.kind!=='PREEMPT_OR_FORCED_UPPER')
    return fail('TWO_STAGE_CHILD_NOT_EXACT',{
      childCertificate:certificate,
    });

  return {
    schema:'connect4.cpcx.vertical-three-stage-setup.v0_1',
    kind:'VERTICAL_THREE_STAGE_SETUP',
    exact:true,
    controller,
    defender,
    sourceLineId:demand.obligation.lineId,
    setupCell:demand.setupCell,
    middleCell:demand.middleCell,
    upperCell:demand.upperCell,
    child,
    childDemand,
    childCertificate:certificate,
    totalRankDeltaOptions:[2,4],
    totalRankDeltaParity:0,
    nextMover:controller,
    controlParityEquivalent:true,
    proofRule:'controller occupies the supported bottom cell of an exact [0,1,2] vertical residual; the same line contracts in the exact child to the already-qualified defender-turn [0,1] vertical two-stage class',
    complexity:'O(liveLineCount + lineIncidence); response semantics are delegated to the existing vertical two-stage theorem',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
