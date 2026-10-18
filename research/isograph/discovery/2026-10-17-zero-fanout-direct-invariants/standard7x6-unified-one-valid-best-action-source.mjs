// Type-safe original q=(h,R0,R1) source proof union for ONE Level2 BEST move.
// Exact guarded WIN, DRAW and LOSS sub-provers already independently frozen
// and true standard7x6-validated. NO game WDL values computed here.
// At most ONE strategically forced future q lane in the win-ladder
// certificate; static matching/duals remain original q proof witnesses.
// docs/research/2026-10-17-unified-one-certified-best-action-source-protocol.md
import {createSingleForcedThreatLadder} from './standard7x6-source-single-forced-threat-ladder.mjs';
import {createRootNoForceWinSingleDrawWitness} from './standard7x6-one-action-root-noforce-win-draw-certificate.mjs';
import {createOriginalSourceInevitableLossBest} from './standard7x6-inevitable-loss-source-dual-packing.mjs';
import {createPairDefenseDualOverloadLoss} from './standard7x6-pair-defense-plus-dual-overload-source.mjs';
export function createUnifiedOneValidBestActionSource({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original gravity Connect-K');
 const geometry={width:W,height:H,connect:K},
  winning=createSingleForcedThreatLadder(geometry),
  draw=createRootNoForceWinSingleDrawWitness(geometry),
  lossExtinct=createOriginalSourceInevitableLossBest(geometry),
  lossAdaptive=createPairDefenseDualOverloadLoss(geometry);
 function compute(q,{
  maxWinSourceMaskTests=300000,
  drawMaxOperations=4000,drawMaxMs=8,drawMaxStaticPairings=400,
  dualDenominators=[1,2,3,4,6,8,12],
  pairMaxOperations=4000,pairMaxMs=12,pairMaxStaticStates=1200
 }={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(n=>!Number.isInteger(n)||n<0||n>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('legal original normalized nonterminal source q required');
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,legal=q.h.flatMap((h,c)=>h<H?[c+1]:[]);
  if(n>=W*H||!legal.length)throw Error('requires original first-win-stopped nonterminal q');
  const stats={rootRank:n,mover:p,originalLegalLiteralLabels:legal,
   sourceWinLadderConstructedQCount:0,sourceLadderProofDepth:0,
   sourceWinStaticMoveScans:0,sourceForcedLadderSelectedLaneFanout:0,
   originalSourceDrawStaticPairingOps:0,
   originalSourceLossDualWeightAttempts:0,
   originalSourceAdaptiveLossMatchingStates:0,
   sourceAlternativeFutureGameWDLEvaluations:0,
   sourceGameStrategicFanoutMax:0,
   subTheoremsInvoked:[],sourceBudgetIncomplete:0};
  const outcome=(p===0?1:-1);
  function emit(tier,action,kind,proof,V,full=null){
   if(!legal.includes(action)||![-1,0,1].includes(V)||
      V!==(tier==='WIN'?outcome:tier==='LOSS'?-outcome:0))
     throw Error('source proof has invalid legal best action / outcome');
   if(full!==null&&(tier!=='LOSS'||full.join(',')!==legal.join(',')))
    throw Error('only unconditional exact all-loss certificate may emit all equally best labels');
   return {status:'VALID_CONTINUATION',type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION',
    opponentModel:'PERFECT',board:{W,H,K},mover:p,ordinaryRootValueP0Relative:V,
    bestOutcomeTier:tier,selectedOriginalLiteralColumn:action,
    proofKind:kind,sourceProof:proof,
    completeLevel2SetKnown:full!==null,
    allBestOriginalLiteralLabels:full,
    sourceGameValuesIndependentlyEvaluated:0,
    statistics:stats};
  }
  // WIN: direct response-cover or one strategically forced opponent lane.
  let win;
  try{win=winning.compute(q,{maxSourceTests:maxWinSourceMaskTests});}
  catch(e){
   if(!String(e.message).includes('original source algebra structural operation guard exceeded'))
    throw e;
   stats.sourceBudgetIncomplete++;
   win={status:'INCOMPLETE',reason:'WIN_SOURCE_STATIC_OPERATION_BUDGET'};
  }
  stats.subTheoremsInvoked.push({kind:'WIN_DIRECT_OR_SINGLE_FORCED_LANE',
    status:win.status,reason:win.reason});
  stats.sourceWinLadderConstructedQCount=win.statistics?.sourceQStatesMaterializedAlongOneLane??0;
  stats.sourceLadderProofDepth=win.sourceForcedReplyRounds??0;
  stats.sourceWinStaticMoveScans=win.statistics?.sourceOriginalCurrentActionScans??0;
  stats.sourceForcedLadderSelectedLaneFanout=win.statistics?.sourceStrategicContinuationLaneFanoutMax??0;
  stats.sourceGameStrategicFanoutMax=Math.max(stats.sourceGameStrategicFanoutMax,
    stats.sourceForcedLadderSelectedLaneFanout);
  if(win.status==='VALID_CONTINUATION')
   return emit('WIN',win.selectedOriginalLiteralColumn,
    'ONE_FORCED_LANE_TO_GRAVITY_RESPONSE_COVER',win.certificate,outcome);
  // DRAW: root universal no forced p WIN AND single source a guarantees
  // nonloss. This is exact best even if other root action WDL unknown.
  let d;
  try{d=draw.compute(q,{maxOperations:drawMaxOperations,maxMs:drawMaxMs,
    maxStaticPairings:drawMaxStaticPairings});}
  catch(e){if(!String(e.message).includes('SOURCE_')&&!String(e.message).includes('budget'))throw e;
    stats.sourceBudgetIncomplete++;d={status:'INCOMPLETE',reason:'DRAW_SOURCE_WORK_BUDGET'};}
  stats.subTheoremsInvoked.push({kind:'ROOT_NO_FORCED_WIN_PLUS_ONE_NONLOSS_DRAW',
    status:d.status,reason:d.reason});
  stats.originalSourceDrawStaticPairingOps=(d.statistics?.staticGlobalPairingWork??0)+
   (d.statistics?.coReleaseGlobalOriginalProofWork??0)+
   (d.statistics?.staticPostActionPairProofWork??0);
  stats.sourceBudgetIncomplete+=d.statistics?.sourceProofTimeBudgetIncomplete??0;
  if(d.status==='VALID_CONTINUATION')
   return emit('DRAW',d.selectedOriginalLiteralColumn,
     'ORIGINAL_ROOT_WIN_EXCLUSION_AND_SINGLE_ACTION_NONLOSS',d,0);
  // LOSS old: no own original K line AND opponent overload alone forces
  // opponent first win, so ALL first mover original actions tied loss.
  const oldLoss=lossExtinct.compute(q,{denominators:dualDenominators});
  stats.subTheoremsInvoked.push({kind:'EXTINCT_OWN_WINLINE_AND_OPPONENT_HYPEREDGE_OVERLOAD',
    status:oldLoss.status,reason:oldLoss.reason});
  stats.originalSourceLossDualWeightAttempts+=
   oldLoss.statistics?.staticOriginalFractionalPackingWitnessAttempts??0;
  if(oldLoss.status==='VALID_CONTINUATION')
   return emit('LOSS',oldLoss.selectedOriginalLiteralColumn,
    'EXTINCT_OWN_WINLINES_OPPONENT_DUAL_FORCE_LOSS',oldLoss,-outcome,
    oldLoss.allOriginalLiteralLegalBestMoves);
  // LOSS new: owner R_p may still survive, but o has uniform co-release
  // mate response protecting against all p winlines AND strict dual.
  const pairedLoss=lossAdaptive.compute(q,{
    maxOperations:pairMaxOperations,maxMs:pairMaxMs,
    maxStaticWitnessStates:pairMaxStaticStates,
    denominators:dualDenominators});
  stats.subTheoremsInvoked.push({kind:'UNIFORM_OPPONENT_MATE_RESPONSES_PLUS_STRICT_OPPONENT_WINLINE_DUAL',
    status:pairedLoss.status,reason:pairedLoss.reason});
  stats.originalSourceLossDualWeightAttempts+=
   pairedLoss.statistics?.staticDualWeightVectorsExamined??0;
  stats.originalSourceAdaptiveLossMatchingStates=
   pairedLoss.statistics?.staticPairPartitionsVisited??0;
  stats.sourceBudgetIncomplete+=pairedLoss.statistics?.sourcePairingBudgetIncomplete??0;
  if(pairedLoss.status==='VALID_CONTINUATION')
   return emit('LOSS',pairedLoss.selectedOriginalLiteralColumn,
    'LIVE_OWN_WINLINES_DEFENDER_SAFE_PAIRING_PLUS_DUAL_FORCE_LOSS',pairedLoss,-outcome,
    pairedLoss.allOriginalLiteralEquallyBestLosingMoves);
  return {status:'INCOMPLETE',type:'NO_UNIVERSALLY_APPLICABLE_SOURCE_BEST_ACTION_THEOREM',
   opponentModel:'PERFECT',mover:p,
   selectedOriginalLiteralColumn:null,exactRootValueP0Relative:null,
   sourceProvenBestMove:false,completeLevel2SetKnown:false,
   fullUnrestrictedGameValueNotInferred:true,
   sourceGameValuesIndependentlyEvaluated:0,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
