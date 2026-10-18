// PURE ORIGINAL q two-certificate Level2 best DRAW or LOSS.
 // Root source first-touch directed common-blocker policy denies mover
 // first win against perfect opponent; then either source opponent
 // fractional dual overload forces o win (all legal p moves equally
 // best LOSS) or ONE verified first-action bound guarantees p NONLOSS
 // (DRAW best). Accept sound VERIFIED PREFIX bounds when co-release
 // action source later exhausts budget: complete action set NOT required.
 // No future game WDL evaluations or q successor construction.
 // Frozen theorem docs/research/2026-10-18-first-touch-directed-blocker-plus-opponent-dual-or-one-nonloss-level2.md
import {createSourceFirstTouchGateBlockerNoWin} from './standard7x6-source-first-touch-gate-blocker-no-win.mjs';
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from './co-release-after-first-move-nonloss-bounds.mjs';
export function createSourceFirstTouchBestDrawOrLoss({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid original Connect-K source geometry');
 const geom={width:W,height:H,connect:K},N=W*H,
   guard=createSourceFirstTouchGateBlockerNoWin(geom),
   dual=createSourceFractionalTransversal(geom),
   robust=createCoReleaseAfterFirstMoveNonlossBounds(geom);
 function compute(q,{denominators=[1,2,3,4,6,8,12],
    actionMaxOperations=3500,actionMaxMs=8,actionMaxStaticPairings=400}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
   q.h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('first-win-stopped normalized source q required');
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,o=1-p,
   legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=N||!legal.length)throw Error('terminal original source not admitted');
  const stats={sourceCurrentRank:n,mover:p,
   sourceRootFirstTouchResponseMapCells:0,
   sourceRootFirstTouchSharedResponseTargets:0,
   staticSourceOpponentDualWeightAttempts:0,
   staticSourceOpponentDualLoadChecks:0,
   staticSingleActionNonlossProofOperations:0,
   staticActionIntervalsVerified:0,
   sourceFirstActionStaticProofBudgetIncomplete:0,
   sourceOutcomeClassChosenFromVerifiedPartialPrefix:false,
   sourceFutureGameStatesMaterialized:0,
   sourceIndependentStrategicGameValuesQueried:0,
   sourceAlternatingStrategyTreeBranches:0};
  const root=guard.compute(q);
  stats.sourceRootFirstTouchResponseMapCells=
    root.statistics.sourceAdaptivePolicySpecificPrecomputedResponseCount;
  stats.sourceRootFirstTouchSharedResponseTargets=
    root.statistics.sourceProducedSharedDirectedResponseTargets;
  if(root.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')
   return {status:'INCOMPLETE',reason:'SOURCE_FIRST_TOUCH_ROOT_NO_FORCE_WIN_NOT_PROVED',
    originalNoWinProof:root.status,statistics:stats};
  const packing=dual.prove({h:q.h,R:[q.R0,q.R1]},o,{denominators});
  stats.staticSourceOpponentDualWeightAttempts=packing.statistics.attemptedStaticWeightVectors;
  stats.staticSourceOpponentDualLoadChecks=packing.statistics.witnessCellIncidenceChecks;
  const T=N-n,capacity=Math.ceil(T/2);
  if(packing.status==='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN'){
   if(packing.opponent!==p||packing.attacker!==o||
      packing.opponentTotalTurns!==capacity||
      packing.witness.sumNumerator<=capacity*packing.witness.denominator)
    throw Error('original o source fractional dual not strict or wrong phase');
   return {status:'VALID_CONTINUATION',
    kind:'SOURCE_FIRST_TOUCH_UNIFORM_O_DEFENSE_PLUS_WINLINE_OVERLOAD_MOVER_LOSS',
    opponentModel:'PERFECT',currentMover:p,
    selectedOriginalLiteralColumn:legal[0],
    ordinaryRootP0RelativeWDL:o===0?1:-1,
    sourceBestOutcomeTier:'LOSS',
    completeLevel2BestSetCertified:true,allBestOriginalLiteralLabels:legal,
    sourceRootNoForcedMoverWin:root,
    sourceOpponentFirstWinDualWitness:packing.witness,
    proofAllCurrentMoverFirstActionsLose:true,
    sourceIndependentFutureGameValuesEvaluated:0,statistics:stats};
  }
  let actions;
  try{
   actions=robust.compute(q,{maxOperations:actionMaxOperations,
     maxMs:actionMaxMs,maxStaticPairings:actionMaxStaticPairings});
  }catch(e){
   if(!String(e.message).startsWith('SOURCE_PAIRING_'))throw e;
   stats.sourceFirstActionStaticProofBudgetIncomplete++;
   return {status:'INCOMPLETE',
    reason:'SOURCE_FIRST_TOUCH_NO_MOVER_WIN_BUT_ACTION_STATIC_PROOF_LIMIT',
    rootNoWinCertified:true,statistics:stats};
  }
  stats.staticSingleActionNonlossProofOperations=actions.statistics?.sourceOperations??0;
  if(!['COMPLETE_SOURCE_ACTION_WDL_BOUNDS','SOURCE_CERTIFICATE_BUDGET_PARTIAL'].includes(actions.status))
   throw Error('unexpected original source first-action bound status');
  const verified=actions.status==='COMPLETE_SOURCE_ACTION_WDL_BOUNDS'?
    actions.firstActionValueIntervals:actions.verifiedPrefixIntervals;
  if(actions.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL')
   stats.sourceFirstActionStaticProofBudgetIncomplete++;
  stats.staticActionIntervalsVerified=verified.length;
  for(const r of verified){
   const a=r.literalColumn+1;
   if(!legal.includes(a))throw Error('source verified action prefix contains nonlegal original literal');
   if((p===0&&r.lower>=0)||(p===1&&r.upper<=0)){
    const proof=actions.sourceCertificates?.find(z=>z.literalColumn===r.literalColumn)??null;
    stats.sourceOutcomeClassChosenFromVerifiedPartialPrefix=
      actions.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL';
    return {status:'VALID_CONTINUATION',
     kind:'SOURCE_FIRST_TOUCH_ROOT_NO_WIN_PLUS_ONE_PROVED_NONLOSS_ACTION_DRAW',
     opponentModel:'PERFECT',currentMover:p,
     selectedOriginalLiteralColumn:a,
     ordinaryRootP0RelativeWDL:0,sourceBestOutcomeTier:'DRAW',
     completeLevel2BestSetCertified:false,allBestOriginalLiteralLabels:null,
     sourceRootNoForcedMoverWin:root,
     sourceFirstActionVerifiedP0RelativeInterval:[r.lower,r.upper],
     sourceFirstActionProof:proof,
     selectedActionVerifiedInPartialPrefix:
       actions.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL',
     proofNoCompetingWinningFirstActionByRootInvariant:true,
     sourceIndependentFutureGameValuesEvaluated:0,statistics:stats};
   }
  }
  return {status:'INCOMPLETE',
   reason:'ROOT_NO_WIN_PROVED_BUT_NO_SELECTED_NONLOSS_OR_STRICT_O_DUAL',
   originalNoWinProof:'CERTIFIED',verifiedOriginalFirstActionPrefix:verified.map(z=>[z.literalColumn+1,z.lower,z.upper]),
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
