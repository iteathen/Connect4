// ORIGINAL q SOURCE-only ODD spare safe pairing no-p-forced-win
// plus either o winline overload => mover LOSS all legal actions BEST,
// or ONE selected robust nonloss first action => mover DRAW best.
// Zero future game-value evaluation. Theorem frozen before tests:
// docs/research/2026-10-17-odd-pending-pair-plus-dual-or-one-nonloss-tier-closure.md
import {createOddSpareColCoReleaseNoWin} from './standard7x6-odd-spare-col-co-release-no-win-source.mjs';
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from './co-release-after-first-move-nonloss-bounds.mjs';
export function createOddSafePairBestDrawOrLoss({width:W,height:H,connect:K}){
 const geom={width:W,height:H,connect:K},N=W*H,
  odd=createOddSpareColCoReleaseNoWin(geom),
  dual=createSourceFractionalTransversal(geom),
  oneAction=createCoReleaseAfterFirstMoveNonlossBounds(geom);
 function compute(q,{pairMaxOperations=9000,pairMaxMs=23,pairMaxStaticStates=1200,
      actionMaxOperations=4000,actionMaxMs=8,actionMaxStaticPairings=400,
      denominators=[1,2,3,4,6,8,12]}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
      q.h.some(z=>!Number.isInteger(z)||z<0||z>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('expected exact first-win-stopped original q');
  const n=q.h.reduce((s,z)=>s+z,0),p=n&1,o=1-p,
   legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=N||!legal.length)throw Error('terminal source refused');
  const stats={sourceCurrentOriginalRank:n,mover:p,oddSafeNoForceWinCertified:false,
   oddStaticPairProofWork:0,originalDualWeightCandidatesExamined:0,
   originalDualCellLoadsVerified:0,
   perFirstActionStaticProofOperations:0,
   currentLiteralActionSourceBoundsScanned:0,
   futureGameStatesConstructed:0,
   independentlyValuedStrategicFutureGames:0,
   maxStrategicGameFanout:0,
   sourceResourceIncomplete:0};
  if((N-n)%2===0)return {status:'INCOMPLETE',reason:'ODD_SOURCE_COMPOSITION_ONLY',
   statistics:stats};
  const sourceOdd=odd.compute(q,{maxOperations:pairMaxOperations,
    maxMs:pairMaxMs,maxStaticWitnessStates:pairMaxStaticStates});
  stats.oddStaticPairProofWork=sourceOdd.statistics.sourceStaticBlockMatchingWorkOps;
  stats.sourceResourceIncomplete+=sourceOdd.statistics.sourceStaticProofResourceIncomplete;
  if(sourceOdd.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')
   return {status:'INCOMPLETE',reason:'ODD_MOVER_NO_FORCE_WIN_NOT_CERTIFIED',
    oddRootSourceStatus:sourceOdd.status,originalOddRootSourceReason:sourceOdd.reason,
    statistics:stats};
  stats.oddSafeNoForceWinCertified=true;
  const R=[q.R0,q.R1];
  const winner=dual.prove({h:q.h,R},o,{denominators});
  stats.originalDualWeightCandidatesExamined=winner.statistics.attemptedStaticWeightVectors;
  stats.originalDualCellLoadsVerified=winner.statistics.witnessCellIncidenceChecks;
  const capacity=Math.ceil((N-n)/2);
  if(winner.status==='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN'){
   if(winner.opponent!==p||winner.attacker!==o||
      winner.opponentTotalTurns!==capacity||
      winner.witness.sumNumerator<=winner.witness.denominator*capacity)
    throw Error('odd source overloaded o winline strategy capacity mismatch');
   return {status:'VALID_CONTINUATION',bestOutcomeTier:'LOSS',
    proofKind:'ODD_SAFE_ONE_PENDING_PAIR_DEFENSE_AND_OPPONENT_HYPERGRAPH_DUAL_FORCE_LOSS',
    ordinaryRootValueP0Relative:o===0?1:-1,
    selectedOriginalLiteralColumn:legal[0],
    fullLevel2SetKnown:true,allBestOriginalLiteralMoves:legal,
    oddSourceCannotForceWinProof:sourceOdd,
    opponentDualSourceWitness:winner.witness,
    sourceFutureGameValueQueries:0,statistics:stats};
  }
  // Without o-overload, a single existing original first-action
  // NONLOSS source proof plus root no-mover-win => DRAW best.
  let action;
  try{
   action=oneAction.compute(q,{maxOperations:actionMaxOperations,
     maxMs:actionMaxMs,maxStaticPairings:actionMaxStaticPairings});
  }catch(e){
   if(!String(e.message).includes('SOURCE_PAIRING_'))throw e;
   stats.sourceResourceIncomplete++;
   return {status:'INCOMPLETE',
    reason:'ODD_ROOT_PROVED_NO_MOVER_WIN_BUT_PER_ACTION_SOURCE_STATIC_BUDGET',
    oddRootSourceStatus:sourceOdd.status,statistics:stats};
  }
  stats.perFirstActionStaticProofOperations=action.statistics?.sourceOperations??0;
  if(action.status!=='COMPLETE_SOURCE_ACTION_WDL_BOUNDS'){
   stats.sourceResourceIncomplete++;
   return {status:'INCOMPLETE',
    reason:'ODD_NO_FORCE_WIN_PROVED_BUT_PER_ACTION_BOUNDS_PARTIAL',
    oddRootSourceStatus:sourceOdd.status,statistics:stats};
  }
  stats.currentLiteralActionSourceBoundsScanned=action.firstActionValueIntervals.length;
  for(const z of action.firstActionValueIntervals){
   if(!legal.includes(z.literalColumn+1))
    throw Error('co-release bound using invalid original literal action');
   if((p===0&&z.lower>=0)||(p===1&&z.upper<=0)){
    const reason=action.sourceCertificates.find(x=>x.literalColumn===z.literalColumn);
    if(!reason)throw Error('source action nonloss pairing proof missing');
    return {status:'VALID_CONTINUATION',bestOutcomeTier:'DRAW',
     proofKind:'ODD_SAFE_ONE_PENDING_PAIR_ROOT_NO_WIN_PLUS_ONE_ACTION_NONLOSS',
     ordinaryRootValueP0Relative:0,
     selectedOriginalLiteralColumn:z.literalColumn+1,
     fullLevel2SetKnown:false,allBestOriginalLiteralMoves:null,
     oddSourceCannotForceWinProof:sourceOdd,
     chosenSourceNonlossActionInterval:[z.lower,z.upper],
     chosenSourceNonlossProof:reason,
     sourceFutureGameValueQueries:0,statistics:stats};
   }
  }
  return {status:'INCOMPLETE',
   reason:'ODD_SAFE_PAIR_EXCLUDES_WIN_BUT_NEITHER_OPPONENT_OVERLOAD_NOR_DRAW_ACTION_PROVED',
   oddRootSourceStatus:sourceOdd.status,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
