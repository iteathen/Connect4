// SOURCE original q=(h,R0,R1) exact DRAW-best one-action composition.
// Freezes the owner math:
// docs/research/2026-10-18-exposed-frontier-potential-plus-one-nonloss-first-action-draw-closure.md
// 1. One deterministic vertical gravity co-release pair plus exposed
//    initial frontier Erdos-Selfridge potential <1/2 denies mover FIRST WIN;
//    no opponent dual witness is needed for this NO-WIN invariant.
// 2. An independent source-only previously frozen ORIGINAL q one-action
//    lower/upper nonloss proof bounds one original legal action at DRAW or
//    better, thereby pinning exact unrestricted root value to DRAW.
// NO alternative original q successor game objects, future scalar game WDL,
// opponent policy trees, recursive minimax or physical game successor oracle.
import {createVerticalPairExposedPotentialDualLossV2} from './standard7x6-source-vertical-pair-exposed-potential-dual-loss-v2.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from '../2026-10-17-zero-fanout-direct-invariants/co-release-after-first-move-nonloss-bounds.mjs';
export function createOriginalExposedESOneNonlossDrawBest({width:W,height:H,connect:K}){
 const geom={width:W,height:H,connect:K},
  noWin=createVerticalPairExposedPotentialDualLossV2(geom),
  oneAction=createCoReleaseAfterFirstMoveNonlossBounds(geom),
  N=W*H;
 function compute(q,{
  actionMaxOperations=20000,actionMaxMs=15000,actionMaxStaticPairings=4000
 }={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('real original nonterminal q required');
  const n=h.reduce((a,b)=>a+b,0),mover=n&1,opp=1-mover,
   legal=h.flatMap((v,c)=>v<H?[c+1]:[]);
  if(n>=N||!legal.length)throw Error('original root full');
  const stats={sourceRootOriginalRank:n,sourceOriginalCurrentMover:mover,
   originalRootViableLineCounts:[q.R0.length,q.R1.length],
   sourceESNoWinProofSuccess:false,
   sourceExposedDyadicNumerator:null,
   sourceExposedDyadicDenominator:null,
   sourceOneActionIntervalBoundsProcessed:0,
   sourceStaticCoReleaseProofOperations:0,
   sourceStaticActionProofBudgetIncomplete:false,
   sourceAlternativeFutureGameValueQueries:0,
   sourceGameQChildrenMaterialized:0,
   sourceOpponentStrategyTreesEnumerated:0};
  const nw=noWin.compute(q);
  const noMoverFirstWin=
   nw.sourceProvenNoMoverFirstWin===true ||
   nw.status==='SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL';
  stats.sourceESNoWinProofSuccess=noMoverFirstWin;
  stats.sourceExposedDyadicNumerator=nw.exactErdosSelfridgeDyadicWeightNumerator??null;
  stats.sourceExposedDyadicDenominator=nw.exactErdosSelfridgeDyadicWeightDenominator??null;
  const header={theorem:'SOURCE_EXPOSED_ERDOS_SELFRIDGE_NO_FIRST_WIN_PLUS_ONE_NONLOSS_DRAW_BEST',
   sourceOriginalRank:n,sourceOriginalCurrentMover:mover,
   rootOriginalLegalLiteralColumns:legal,
   sourceProvenMoverCannotForceWin:noMoverFirstWin,
   sourceOriginalExposedNoWinStatus:nw.status,
   selectedOriginalBestLiteralColumn:null,
   sourceRootWDLP0Relative:null,statistics:stats};
  if(!noMoverFirstWin)
   return {status:'INCOMPLETE_EXPOSED_ES_ROOT_NO_WIN_NOT_PROVED',
    reason:nw.reason??nw.status,...header};
  let a;
  try{
   a=oneAction.compute(q,{maxOperations:actionMaxOperations,
    maxMs:actionMaxMs,maxStaticPairings:actionMaxStaticPairings});
  }catch(e){
   if(!String(e?.message??e).startsWith('SOURCE_PAIRING_'))throw e;
   stats.sourceStaticActionProofBudgetIncomplete=true;
   return {status:'INCOMPLETE_ONE_ACTION_SOURCE_NONLOSS_RESOURCE',
    reason:String(e),...header};
  }
  const bound=a.status==='COMPLETE_SOURCE_ACTION_WDL_BOUNDS'?
   a.firstActionValueIntervals:
   a.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL'?a.verifiedPrefixIntervals:null;
  if(bound===null||!Array.isArray(bound))
   throw Error('nonloss source bound unexpected status');
  stats.sourceOneActionIntervalBoundsProcessed=bound.length;
  stats.sourceStaticCoReleaseProofOperations=a.statistics?.sourceOperations??0;
  if(a.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL')
   stats.sourceStaticActionProofBudgetIncomplete=true;
  for(const b of bound){
   const col=b.literalColumn+1;
   if(!legal.includes(col))throw Error('static one-action interval contains nonlegal original literal');
   const nonloss=(mover===0?b.lower>=0:b.upper<=0);
   if(!nonloss)continue;
   const proof=a.sourceCertificates?.find(x=>x.literalColumn===b.literalColumn)??null;
   if(a.status==='COMPLETE_SOURCE_ACTION_WDL_BOUNDS' && !proof)
    throw Error('missing original one-action independently verified bound proof');
   return {status:'SOURCE_CERTIFIED_ONE_ORIGINAL_DRAW_BEST_ACTION',
    sourceProvenMoverCannotForceWin:true,
    selectedOriginalBestLiteralColumn:col,
    sourceRootWDLP0Relative:0,
    sourceExactOriginalRootOutcomeTier:'DRAW',
    sourceOneActionCurrentP0RelativeInterval:[b.lower,b.upper],
    sourceOneActionIndependentStaticNonlossProof:proof,
    sourceExposedOriginalUncoveredRequirementCount:
      nw.originalMoverUncoveredOriginalGeneratorCount,
    sourceRootHybridExposedPairWitness:nw.originalPairBlocksHex,
    sourceRootProjectedExposedRequirementWitness:
      nw.originalExposedProjectedRequirementWitnesses,
    sourceNoFutureGameWDLValuesEvaluated:true,
    theorem:header.theorem,
    sourceOriginalRank:n,sourceOriginalCurrentMover:mover,
    rootOriginalLegalLiteralColumns:legal,statistics:stats};
  }
  return {status:'INCOMPLETE_NO_INDEPENDENT_ORIGINAL_NONLOSS_FIRST_ACTION',
   reason:stats.sourceStaticActionProofBudgetIncomplete?
    'ONE_ACTION_SOURCE_STATIC_BUDGET_OR_PROOF_UNKNOWN':
    'NO_VERIFIED_ACTION_WDL_INTERVAL_AT_LEAST_DRAW',
   sourceOriginalOneActionSourceBoundsChecked:bound.map(x=>({
    originalColumn:x.literalColumn+1,lower:x.lower,upper:x.upper
   })),...header};
 }
 return Object.freeze({compute});
}
