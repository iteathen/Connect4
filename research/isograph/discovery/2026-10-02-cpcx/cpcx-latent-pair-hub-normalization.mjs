// CPCX latent-singleton pair-hub forced-normalization handoff.
//
// Extends the qualified base theorem by one deterministic normalization seam.
// For each current defender event:
// - use the exact parent row when no immediate normalization is required;
// - accept an immediate controller terminal;
// - or follow deterministic forced singleton normalization once, require the
//   same target/hub/spoke role candidate, and invoke the qualified base theorem.
//
// This module never calls itself and never enumerates a second free defender
// frontier.

import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  auditCpcxLatentSingletonPairHubCurrentEvent,
  certifyCpcxLatentSingletonPairHubOverload,
  findCpcxLatentSingletonPairHubCandidates,
} from './cpcx-latent-pair-hub.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.latent-singleton-pair-hub-normalization.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function frontierCells(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function sameRoleCandidate(position,sourceCandidate,attacker){
  const required=new Set(sourceCandidate.spokes.map(x=>x.cell));
  return findCpcxLatentSingletonPairHubCandidates(position,{attacker})
    .find(candidate=>
      candidate.targetCell===sourceCandidate.targetCell&&
      candidate.hubCell===sourceCandidate.hubCell&&
      [...required].every(cell=>
        candidate.spokes.some(x=>x.cell===cell)
      )
    )??null;
}

function exactImmediateTerminal(afterDefender,immediate,attacker){
  if(immediate.kind!=='IMMEDIATE_TERMINAL_AVAILABLE')return null;
  const winningCell=[...(immediate.winningCells??[])].sort((a,b)=>a-b)[0];
  if(!Number.isInteger(winningCell))return null;
  const child=applyCpcxForcedEvent(afterDefender,winningCell);
  if(!child.terminal||child.terminal.player!==attacker)return null;
  return {winningCell,terminal:child.terminal};
}

function normalizationTerminalPlayer(closed){
  if(closed.kind==='CERTIFIED_FIRST_WIN')return closed.player??null;
  if(closed.kind==='TERMINAL')
    return closed.position?.terminal?.player??null;
  return null;
}

export function certifyCpcxLatentSingletonPairHubForcedNormalization(
  position,
  candidate
){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!candidate||!Number.isInteger(candidate.targetCell)||
     !Number.isInteger(candidate.hubCell))
    throw new TypeError('latent pair-hub candidate');

  const defender=position.mover,attacker=defender^1;
  if(candidate.attacker!==attacker)
    return fail('ATTACKER_ROLE_MISMATCH');

  const sourceImmediate=classifyCpcxImmediate(position);
  if(sourceImmediate.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{
      boundary:sourceImmediate,
    });

  const live=findCpcxLatentSingletonPairHubCandidates(
    position,{attacker}
  ).find(x=>
    x.targetCell===candidate.targetCell&&
    x.hubCell===candidate.hubCell&&
    x.spokes.map(y=>y.cell).join(',')===
      candidate.spokes.map(y=>y.cell).join(',')
  );
  if(!live)return fail('CANDIDATE_NOT_CURRENT_LIVE');

  const sourceRemaining=position.geometry.cellCount-position.rank,
    rows=[];

  for(const defenderCell of frontierCells(position)){
    const afterDefender=applyCpcxForcedEvent(position,defenderCell);
    if(afterDefender.terminal)return fail(
      'DEFENDER_TERMINAL_ON_CURRENT_EVENT',
      {defenderCell,terminal:afterDefender.terminal,rows}
    );

    const immediate=classifyCpcxImmediate(afterDefender),
      direct=exactImmediateTerminal(afterDefender,immediate,attacker);
    if(direct){
      rows.push({
        defenderCell,
        class:'IMMEDIATE_ATTACKER_TERMINAL',
        winningCell:direct.winningCell,
        terminal:direct.terminal,
        result:'CERTIFIED_FIRST_WIN',
      });
      continue;
    }

    if(immediate.kind==='NO_IMMEDIATE_OBLIGATION'){
      const parent=auditCpcxLatentSingletonPairHubCurrentEvent(
        position,live,defenderCell
      );
      if(!parent.exact)return fail(
        'PARENT_ROW_NOT_EXACT',
        {
          defenderCell,
          parentSeam:parent.seam??null,
          parent,
          rows,
        }
      );
      rows.push({
        defenderCell,
        class:'PARENT_PAIR_HUB_ROW',
        parent,
        result:'CERTIFIED_FIRST_WIN',
      });
      continue;
    }

    if(immediate.kind!=='FORCED_RESPONSE')return fail(
      'UNSUPPORTED_POST_DEFENDER_IMMEDIATE_CLASS',
      {defenderCell,immediate,rows}
    );

    const closed=closeCpcxForcedResponses(afterDefender),
      terminalPlayer=normalizationTerminalPlayer(closed);

    if(terminalPlayer!==null){
      if(terminalPlayer!==attacker)return fail(
        'DEFENDER_FIRST_WIN_DURING_NORMALIZATION',
        {
          defenderCell,
          player:terminalPlayer,
          normalization:closed,
          rows,
        }
      );
      rows.push({
        defenderCell,
        class:'FORCED_NORMALIZATION_TO_ATTACKER_WIN',
        normalization:closed,
        result:'CERTIFIED_FIRST_WIN',
      });
      continue;
    }

    if(closed.kind!=='OPEN')return fail(
      'FORCED_NORMALIZATION_NOT_OPEN',
      {defenderCell,normalization:closed,rows}
    );

    const normalized=closed.position;
    if(normalized.mover!==defender)return fail(
      'NORMALIZED_MOVER_NOT_DEFENDER',
      {
        defenderCell,
        expectedMover:defender,
        actualMover:normalized.mover,
        normalization:closed,
        rows,
      }
    );

    const normalizedRemaining=
      normalized.geometry.cellCount-normalized.rank;
    if(!(normalizedRemaining<sourceRemaining))return fail(
      'NORMALIZATION_DOES_NOT_DECREASE_CAPACITY',
      {
        defenderCell,
        sourceRemaining,
        normalizedRemaining,
        rows,
      }
    );

    const inherited=sameRoleCandidate(normalized,live,attacker);
    if(!inherited)return fail(
      'NORMALIZATION_LOST_PAIR_HUB_ROLE',
      {
        defenderCell,
        targetCell:live.targetCell,
        hubCell:live.hubCell,
        requiredSpokeCells:live.spokes.map(x=>x.cell),
        normalization:closed,
        rows,
      }
    );

    const base=certifyCpcxLatentSingletonPairHubOverload(
      normalized,inherited
    );
    if(!base.exact||base.kind!=='CERTIFIED_FIRST_WIN'||
       base.player!==attacker)return fail(
      'BASE_PAIR_HUB_NOT_EXACT_AFTER_NORMALIZATION',
      {
        defenderCell,
        base,
        normalization:closed,
        rows,
      }
    );

    rows.push({
      defenderCell,
      class:'FORCED_NORMALIZATION_HANDOFF',
      normalization:{
        kind:closed.kind,
        stepCount:closed.steps.length,
        steps:closed.steps.map(x=>({
          cell:x.cell,
          player:x.player,
        })),
        finalRank:normalized.rank,
        finalMover:normalized.mover,
        sourceRemainingCapacity:sourceRemaining,
        finalRemainingCapacity:normalizedRemaining,
        strictCapacityDescent:true,
      },
      inheritedCandidate:{
        targetCell:inherited.targetCell,
        hubCell:inherited.hubCell,
        spokeCells:inherited.spokes.map(x=>x.cell),
      },
      base,
      result:'CERTIFIED_FIRST_WIN',
    });
  }

  return {
    schema:'connect4.cpcx.latent-singleton-pair-hub-normalization.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    defender,
    source:'LATENT_SINGLETON_PAIR_HUB_FORCED_NORMALIZATION_HANDOFF',
    latentSingleton:{
      lineId:live.singleton.lineId,
      lineLabel:live.singleton.lineLabel,
      targetCell:live.targetCell,
      sourceSupportDistance:1,
    },
    hubCell:live.hubCell,
    spokes:live.spokes,
    currentFrontierEventCount:rows.length,
    rows,
    everyCurrentDefenderEventCertified:true,
    deterministicNormalizationOnly:true,
    parentTheoremReentryOnly:true,
    selfRecursion:false,
    complexity:'O(boardWidth * (boardCapacity * liveLineCount * K + boardWidth * liveLineCount * K)); K fixed',
    proofRule:'each current defender event is closed by the qualified parent pair-hub row, an immediate attacker terminal, or deterministic forced normalization with strict capacity descent followed by one exact parent-theorem re-entry',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function findAndCertifyCpcxLatentPairHubNormalizationHandoffs(
  position,
  {attacker=position.mover^1}={}
){
  const out=[];
  for(const candidate of findCpcxLatentSingletonPairHubCandidates(
    position,{attacker}
  )){
    const certificate=
      certifyCpcxLatentSingletonPairHubForcedNormalization(
        position,candidate
      );
    if(certificate.exact)out.push({candidate,certificate});
  }
  return out;
}
