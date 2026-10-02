// CPCX one-sided first-win progress classifier.
//
// Semantic outputs:
// - CERTIFIED_FIRST_WIN(player): exact structural certificate that player gets
//   the first Connect Four under the certified local forcing theorem.
// - FORCED_NORMALIZATION: exactly one nonterminal response is forced.
// - CERTIFIED_FORCING_MACRO: one exact nonterminal progress macro selected by
//   a deterministic structural order.  No global value-preservation premise.
// - PROJECTION_ONLY: useful structural projection, not an exact force.
// - NO_CERTIFICATE: CPCX has no exact continuation at this state.
//
// NO_CERTIFICATE carries no draw/loss/value meaning.  No recursion is performed.

import {scanCpcxObligations} from './cpcx.mjs';
import {classifyCpcxImmediate,findCpcxSynchronizedProjectionLadders} from './cpcx-closure.mjs';
import {findAndCertifyCpcxPairHubForks} from './cpcx-fork.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {
  findCpcxPlayableTwoPieceDemands,
  certifyEitherCpcxPlayableTwoPiece,
} from './cpcx-two-piece.mjs';

function firstWin(player,source,certificate){
  return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player,
    source,
    certificate,
    recursive:false,
  };
}

function macroSort(a,b){
  return a.primaryCell-b.primaryCell||
    a.secondaryCell-b.secondaryCell||
    a.lineId-b.lineId||
    a.kind.localeCompare(b.kind);
}

export function classifyCpcxProgress(position,{player=position.mover}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  const obligations=scanCpcxObligations(position),
    immediate=classifyCpcxImmediate(position,obligations);

  if(immediate.kind==='ALREADY_TERMINAL')
    return firstWin(immediate.terminal.player,'ALREADY_TERMINAL',immediate);

  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE')
    return firstWin(position.mover,'IMMEDIATE_TERMINAL',immediate);

  if(immediate.kind==='FORCED_LOSS_OVERLOAD')
    return firstWin(position.mover^1,'OPPONENT_SINGLETON_OVERLOAD',immediate);

  if(immediate.kind==='FORCED_RESPONSE')return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'FORCED_NORMALIZATION',
    exact:true,
    player,
    mover:position.mover,
    cell:immediate.cell,
    immediate,
    recursive:false,
  };

  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    player,
    reason:'unrecognized immediate structural boundary',
    immediate,
    recursive:false,
  };

  const forks=findAndCertifyCpcxPairHubForks(position,{player});
  if(forks.length){
    const selected=[...forks].sort((a,b)=>
      a.candidate.hub-b.candidate.hub||
      a.certificate.kind.localeCompare(b.certificate.kind)
    )[0];
    return firstWin(player,'PAIR_HUB_FORK',selected);
  }

  const macros=[];
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player})){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    if(!certificate.exact)continue;
    if(certificate.kind==='PREEXISTING_CURRENT_TERMINAL'){
      return firstWin(position.mover,'VERTICAL_PREEXISTING_TERMINAL',{demand,certificate});
    }
    if(certificate.kind==='ATTACKER_TERMINAL_ON_LOWER'){
      return firstWin(player,'VERTICAL_TERMINAL_ON_LOWER',{demand,certificate});
    }
    if(certificate.kind!=='PREEMPT_OR_FORCED_UPPER'&&certificate.kind!=='FORCED_UPPER_RESPONSE')
      continue;
    macros.push({
      kind:'VERTICAL_TWO_STAGE',
      primaryCell:demand.lowerCell,
      secondaryCell:demand.upperCell,
      lineId:demand.obligation.lineId,
      demand,
      certificate,
    });
  }

  if(player===position.mover){
    for(const demand of findCpcxPlayableTwoPieceDemands(position,{player})){
      const certificate=certifyEitherCpcxPlayableTwoPiece(position,demand);
      if(!certificate.exact)continue;
      if(certificate.selected?.kind==='TERMINAL_ON_FIRST_CELL'){
        return firstWin(player,'TWO_PIECE_TERMINAL_ON_FIRST',{demand,certificate});
      }
      if(certificate.selected?.kind!=='FORCED_TWO_PIECE_RESPONSE')continue;
      macros.push({
        kind:'PLAYABLE_TWO_PIECE',
        primaryCell:certificate.selected.firstCell,
        secondaryCell:certificate.selected.responseCell,
        lineId:demand.obligation.lineId,
        demand,
        certificate,
      });
    }
  }

  if(macros.length){
    macros.sort(macroSort);
    const selected=macros[0];
    return {
      schema:'connect4.cpcx.progress.v0_2',
      kind:'CERTIFIED_FORCING_MACRO',
      exact:true,
      player,
      macro:selected,
      candidateCount:macros.length,
      selectionRule:'vertical two-stage and playable two-piece macros are ordered by primary cell, secondary cell, line id, then macro kind; choose the first exact macro',
      selectionAuthorized:true,
      selectionPremise:'local theorem exactness and deterministic structural order only',
      recursive:false,
    };
  }

  const projections=findCpcxSynchronizedProjectionLadders(obligations)
    .filter(x=>x.player===player);
  if(projections.length)return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'PROJECTION_ONLY',
    exact:false,
    player,
    projections,
    recursive:false,
  };

  return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    player,
    recursive:false,
  };
}
