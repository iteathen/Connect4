// FROZEN BEFORE PHYSICAL WDL/V4/reference evaluation. Reuse the first
// 24 distinct ORIGINAL q=(h,R0,R1) source-positive SUPPORT-MIRROR-only
// positions frozen in 56,541-root former ES corpus comparison.
// Pure source: (a) original vertical support-mirror no mover FIRST WIN,
// (b) opponent original fractional packing overload for mover LOSS,
// OR (c) a separate original co-release first-action nonloss interval for
// DRAW-best. Otherwise unknown. Existing first-touch SOURCE only for
// same-q domain comparison, never a game-WDL oracle.
// Original theorem frozen in:
// docs/research/2026-10-18-support-mirror-no-win-plus-static-first-action-tier-closure.md
import {createOriginalSupportMirrorVerticalPairNoFirstWinV2} from './standard7x6-source-support-mirror-vertical-pair-firstwin-veto-v2.mjs';
import {createSourceFractionalTransversal} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-fractional-transversal.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from '../2026-10-17-zero-fanout-direct-invariants/co-release-after-first-move-nonloss-bounds.mjs';
import {createSourceFirstTouchGateBlockerNoWin} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-first-touch-gate-blocker-no-win.mjs';
export function evaluateFrozenFirst24SupportMirrorSourceTiers(frozenPacket){
 if(frozenPacket?.stats?.newSourcePositiveUniqueQCount<24 ||
   frozenPacket?.stats?.sourceQCompared!==56407||
   !Array.isArray(frozenPacket.sourceNewVsOldPositiveQWitnesses)||
   frozenPacket.sourceNewVsOldPositiveQWitnesses.length!==24)
  throw Error('requires FROZEN first24 source-positive original q from old ES marginal corpus');
 const geom={width:7,height:6,connect:4},N=42,
  mirror=createOriginalSupportMirrorVerticalPairNoFirstWinV2(geom),
  touch=createSourceFirstTouchGateBlockerNoWin(geom),
  dual=createSourceFractionalTransversal(geom),
  nonloss=createCoReleaseAfterFirstMoveNonlossBounds(geom);
 const stats={genuineSourcePreviouslyFrozenQ:24,
  sourceMirrorNoWinConfirmed:0,priorFirstTouchAlsoNoWin:0,
  priorFirstTouchStillIncomplete:0,
  sourceOpposingFractionalOverloadForcedMoverLoss:0,
  sourceOneActionDrawBestProved:0,
  sourceNoWdlTierProved:0,
  sourceLevel2BestOutsidePriorFirstTouchNoWin:0,
  sourceAlternativeGameWdlQueries:0,
  sourceFutureGameStatesConstructed:0,
  sourceOpponentPolicyGameTreesEnumerated:0,
  sourceStaticNonlossResourceIncomplete:0};
 const cases=[];
 for(const input of frozenPacket.sourceNewVsOldPositiveQWitnesses){
  const q={h:input.sourceObservedOriginalQHeights.slice(),
   R0:input.originalR0Hex.map(BigInt),
   R1:input.originalR1Hex.map(BigInt)};
  const n=q.h.reduce((a,b)=>a+b,0),p=n&1,o=1-p,
   legal=q.h.flatMap((z,c)=>z<6?[c+1]:[]);
  if(n!==input.rootPly||p!==input.originalMover||legal.length<1)
   throw Error('frozen owner-tagged original current source q identity incompatible');
  const proof=mirror.compute(q),old=touch.compute(q);
  if(proof.status!=='CERTIFIED_ORIGINAL_CURRENT_MOVER_CANNOT_FORCE_FIRST_WIN_SUPPORT_MIRROR_PLUS_ES')
   throw Error('SOURCE frozen first24 no-win witness is no longer covered');
  stats.sourceMirrorNoWinConfirmed++;
  if(old.status==='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')stats.priorFirstTouchAlsoNoWin++;
  else stats.priorFirstTouchStillIncomplete++;
  const d=dual.prove({h:q.h,R:[q.R0,q.R1]},o);
  let sourceAction=null,one=null,scalar=null,kind='INCOMPLETE_NO_INDEPENDENT_WDL_TIER';
  if(d.status==='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN'){
   const D=d.witness.denominator;
   if(d.attacker!==o||d.opponent!==p||
     d.opponentTotalTurns!==Math.ceil((N-n)/2)||
     d.witness.sumNumerator<=Math.ceil((N-n)/2)*D)
    throw Error('bad source full-future responder fractional packing/capacity check');
   sourceAction=legal[0];scalar=o===0?1:-1;kind='SOURCE_CERTIFIED_ALL_MOVER_ACTIONS_LOSE';
   stats.sourceOpposingFractionalOverloadForcedMoverLoss++;
  }
  const a=nonloss.compute(q,{
   maxOperations:60000,maxMs:10000,maxStaticPairings:10000});
  if(a.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL')
   stats.sourceStaticNonlossResourceIncomplete++;
  const vals=a.status==='COMPLETE_SOURCE_ACTION_WDL_BOUNDS'?a.firstActionValueIntervals:
    a.status==='SOURCE_CERTIFICATE_BUDGET_PARTIAL'?a.verifiedPrefixIntervals:[];
  let chosen=null,interval=null,indProof=null;
  for(const t of vals){
   if(!legal.includes(t.literalColumn+1))
    throw Error('original nonloss source returned nonlegal literal');
   if((p===0&&t.lower>=0)||(p===1&&t.upper<=0)){
    chosen=t.literalColumn+1;interval=[t.lower,t.upper];
    indProof=a.sourceCertificates?.find(z=>z.literalColumn===t.literalColumn)??null;
    break;
   }
  }
  if(chosen!==null&&kind==='SOURCE_CERTIFIED_ALL_MOVER_ACTIONS_LOSE')
   throw Error('SOURCE CONTRADICTION: responder all-current LOSS and one mover DRAW-or-better first action');
  if(chosen!==null){
   sourceAction=chosen;scalar=0;kind='SOURCE_CERTIFIED_ONE_DRAW_BEST_ORIGINAL_FIRST_ACTION';
   one=indProof;stats.sourceOneActionDrawBestProved++;
  }
  if(sourceAction===null)stats.sourceNoWdlTierProved++;
  if(sourceAction!==null && old.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')
   stats.sourceLevel2BestOutsidePriorFirstTouchNoWin++;
  cases.push({originalSourceQ:{
    h:q.h,R0:q.R0.map(z=>'0x'+z.toString(16)),R1:q.R1.map(z=>'0x'+z.toString(16))
   },originalRootPly:n,originalCurrentMover:p,legalOriginalColumns:legal,
   sourceOldExposedESStatus:input.priorStatus,
   sourceNewMirrorClassBCount:proof.classBOriginalOppositeSupportLineFirstWinPreemptedCount,
   sourceNewRootNoMoverFirstWin:true,
   sourcePriorFirstTouchStatus:old.status,
   sourceOriginalOpponentDualStatus:d.status,
   sourceOriginalOneActionNonlossBoundStatus:a.status,
   sourceSourceOnlyWDLClass:kind,
   sourceSelectedOriginalBestColumn:sourceAction,
   sourceExactP0RelativeRootWDLIfTierProved:scalar,
   sourceOneActionNonlossFirstActionInterval:interval,
   sourceIndependentOneActionProof:one,
   sourceFutureGameWDLQueries:0});
 }
 return {schema:'connect4.original7x6.first24_support_mirror_new_no_win_plus_existing_wdl_tier_source_only_v0_1',
  date:'2026-10-18',status:'FROZEN_SOURCE_CANDIDATES_PRE_PHYSICAL_WDL_AND_V4',
  frozenInputSourceMarginal:'research/isograph/discovery/2026-10-18-obligation-debt/STANDARD7X6_SUPPORT_MIRROR_VS_OLD_EXPOSED_ES_SAME_56541Q_SOURCE_ONLY_MARGINAL_0_1.json',
  theorem:'docs/research/2026-10-18-support-mirror-no-win-plus-static-first-action-tier-closure.md',
  stats,cases,
  noSourceFutureGameWDLQueries:true,
  canonicalOriginal44444BestActionStill:'INCOMPLETE'};
}
