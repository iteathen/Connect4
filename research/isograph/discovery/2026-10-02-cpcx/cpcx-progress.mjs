// CPCX nonrecursive progress classifier.
//
// The classifier reports exact locally certified progress primitives without
// selecting among nonterminal alternatives.  A list of exact macros is not a
// W/D/L proof and does not authorize choosing one as optimal.
//
// Priority:
// 1. current terminal/singleton normalization boundary;
// 2. certified pair-hub fork (terminal forcing certificate);
// 3. exact normalized vertical two-stage macros;
// 4. exact playable two-piece forcing macros;
// 5. projection-only synchronized 2..4-piece obligations;
// 6. unresolved.
//
// No recursive invocation is performed.

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

export function classifyCpcxProgress(position,{player=position.mover}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  const obligations=scanCpcxObligations(position),
    immediate=classifyCpcxImmediate(position,obligations);

  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')return {
    schema:'connect4.cpcx.progress.v0_1',
    kind:'IMMEDIATE_BOUNDARY',
    exact:true,
    player,
    immediate,
    terminalForcing:immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'||
      immediate.kind==='FORCED_LOSS_OVERLOAD',
    recursive:false,
  };

  const forks=findAndCertifyCpcxPairHubForks(position,{player});
  if(forks.length)return {
    schema:'connect4.cpcx.progress.v0_1',
    kind:'CERTIFIED_PAIR_HUB_FORKS',
    exact:true,
    player,
    terminalForcing:true,
    forks,
    recursive:false,
  };

  const vertical=[];
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player})){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    if(certificate.exact)vertical.push({demand,certificate});
  }

  const twoPiece=[];
  if(player===position.mover){
    for(const demand of findCpcxPlayableTwoPieceDemands(position,{player})){
      const certificate=certifyEitherCpcxPlayableTwoPiece(position,demand);
      if(certificate.exact)twoPiece.push({demand,certificate});
    }
  }

  if(vertical.length||twoPiece.length)return {
    schema:'connect4.cpcx.progress.v0_1',
    kind:'CERTIFIED_PROGRESS_MACROS',
    exact:true,
    player,
    terminalForcing:false,
    vertical,
    twoPiece,
    selectionAuthorized:false,
    reason:'each macro is locally exact, but CPCX has not proved that arbitrary selection among nonterminal exact progress macros preserves global W/D/L',
    recursive:false,
  };

  const projections=findCpcxSynchronizedProjectionLadders(obligations)
    .filter(x=>x.player===player);
  if(projections.length)return {
    schema:'connect4.cpcx.progress.v0_1',
    kind:'PROJECTION_ONLY',
    exact:false,
    player,
    projections,
    terminalForcing:false,
    recursive:false,
  };

  return {
    schema:'connect4.cpcx.progress.v0_1',
    kind:'UNRESOLVED',
    exact:false,
    player,
    terminalForcing:false,
    recursive:false,
  };
}
