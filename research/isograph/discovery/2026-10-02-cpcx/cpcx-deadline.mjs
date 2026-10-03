// CPCX rank-local earliest-terminal lower envelope.
//
// This module proves only a timing lower bound:
//   player P cannot terminally complete before L physical plies.
//
// For one live residual R, each required cell at support distance d needs at
// least d+1 total placements in its column before P can occupy it.  P may place
// at most one required cell on each of P's alternating turns.  Greedily assign
// the sorted release thresholds to the earliest P-turn slots that can meet
// them.  The last assigned slot is an optimistic completion time for R.
//
// The construction is intentionally optimistic:
// - other moves may be assumed to fill support as helpfully as possible;
// - interactions between different columns are ignored except for P's one-move
//   per turn limit;
// - the opponent is assumed not to block R.
//
// Therefore the computed time is <= the true earliest completion time and is a
// sound lower bound on first-terminal timing.  It is not a win predictor.
//
// Complexity is O(number of live residual cells log K); Connect Four K=4 makes
// this constant per residual.  No legal reply tree is traversed.

import {scanCpcxObligations} from './cpcx.mjs';

function firstTurnPly(mover,player){
  return mover===player?1:2;
}

export function cpcxEarliestResidualCompletionLowerBound({
  mover,
  player,
  remainingPlies,
  supportDistances,
}){
  if((mover!==0&&mover!==1)||(player!==0&&player!==1))
    throw new RangeError('mover/player');
  if(!Number.isInteger(remainingPlies)||remainingPlies<0)
    throw new RangeError('remainingPlies');
  if(!Array.isArray(supportDistances)||!supportDistances.length)
    throw new RangeError('supportDistances');

  const releases=supportDistances.map(d=>{
    if(!Number.isInteger(d)||d<0)throw new RangeError('support distance');
    return d+1;
  }).sort((a,b)=>a-b);

  let slot=firstTurnPly(mover,player),last=null;
  for(const release of releases){
    while(slot<release)slot+=2;
    if(slot>remainingPlies)return null;
    last=slot;
    slot+=2;
  }
  return last;
}

export function lowerBoundCpcxEarliestTerminal(position,{
  player=position.mover,
}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  if(position.terminal)throw new RangeError('nonterminal position required');

  const remainingPlies=position.geometry.cellCount-position.rank,
    rows=[];

  for(const obligation of scanCpcxObligations(position)){
    if(obligation.player!==player)continue;
    const supportDistances=obligation.events.map(e=>e.supportDistance),
      lower=cpcxEarliestResidualCompletionLowerBound({
        mover:position.mover,
        player,
        remainingPlies,
        supportDistances,
      });
    rows.push({
      obligationId:obligation.id,
      lineId:obligation.lineId,
      lineLabel:obligation.lineLabel,
      missingCount:obligation.missingCount,
      supportDistances:[...supportDistances],
      lowerBoundPly:lower,
    });
  }

  const finite=rows
    .map(x=>x.lowerBoundPly)
    .filter(Number.isInteger);

  return {
    schema:'connect4.cpcx.earliest-terminal-lower-bound.v0_1',
    kind:'EARLIEST_TERMINAL_LOWER_BOUND',
    exact:true,
    player,
    mover:position.mover,
    rank:position.rank,
    lowerBoundPly:finite.length?Math.min(...finite):null,
    residualCount:rows.length,
    rows,
    proofRule:'for each residual, match support-release thresholds to the earliest alternating turns available to the player; take the minimum optimistic completion time across residuals',
    interpretation:'the player cannot terminally complete earlier than lowerBoundPly; null means no current residual can be completed within remaining physical capacity under even the optimistic release schedule',
    optimistic:true,
    firstWinAware:true,
    solvedData:false,
    oracle:false,
    recursive:false,
    gameTreeTraversal:false,
  };
}

export function lowerBoundCpcxAbstractResidualCompletion(successor,residual,{
  player=residual.player,
}={}){
  if(!successor?.exact)throw new TypeError('exact successor required');
  if(player!==0&&player!==1)throw new RangeError('player');
  if(!residual?.events?.length)throw new TypeError('residual events required');
  if(!Number.isInteger(successor.nextMover))
    throw new TypeError('successor nextMover required');

  const rankOptions=successor.rank?.options;
  if(!Array.isArray(rankOptions)||!rankOptions.length)
    throw new TypeError('successor rank options required');

  // For a lower bound across an abstract family, use the realization with the
  // most remaining physical plies and every cell's minimum support distance.
  const minRank=Math.min(...rankOptions),
    remainingPlies=successor.geometry?.cellCount
      ?successor.geometry.cellCount-minRank
      :null;

  if(remainingPlies===null)
    throw new TypeError('abstract successor geometry.cellCount required');

  return cpcxEarliestResidualCompletionLowerBound({
    mover:successor.nextMover,
    player,
    remainingPlies,
    supportDistances:residual.events.map(e=>{
      if(!Number.isInteger(e.minSupportDistance))
        throw new TypeError('minSupportDistance required');
      return e.minSupportDistance;
    }),
  });
}
