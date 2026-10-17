// Independently test certified full WIN/DRAW/LOSS and ALL optimal
// move labels on every qualified exact-q full-game memo source from the
// small empty board. The candidate computes first, and its source-only
// bounds never receive any solved reference WDL inputs. Unresolved
// sources are NOT falsely counted as exact.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createCoReleaseDefensiveOptimalSetOneLane} from './co-release-defensive-one-lane-optimal-set.mjs';
import {createGuardedDefensiveOptimalSetOneLane} from './guarded-defensive-one-lane-optimal-set.mjs';
import {createCoReleaseGlobalNoWinBound} from './co-release-global-no-win-bound.mjs';
import {createSeparatedOptimalSetOneLane} from './separated-optimal-set-one-lane.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from './co-release-after-first-move-nonloss-bounds.mjs';
import {createGlobalNoWinBound} from './global-no-win-bound.mjs';

export function runCoReleaseDefensiveOneLaneControl(geometry){
 const core=createExactQCore(geometry),source=createCoReleaseDefensiveOptimalSetOneLane(geometry),
  prev=createGuardedDefensiveOptimalSetOneLane(geometry),
  perAction=createCoReleaseAfterFirstMoveNonlossBounds(geometry),
  coGlobal=createCoReleaseGlobalNoWinBound(geometry),
  global=createGlobalNoWinBound(geometry),
  exactMemo=new Map(),baseline=core.solve(core.createEmpty(),
   {sharedMemo:exactMemo,maxStates:60000,maxTransitions:300000});
 const stats={schema:'connect4.co-release-source-WDL-bounds-one-lane-control.v0_1',
  geometry,status:'PASS',sourceExactQCount:0,
  perActionFullWDLSlicesVerified:0,
  perActionDefensivePairingProofsVerified:0,
  perActionExactDrawsVerified:0,
  globalFullFutureSourceWDLInequalitiesVerified:0,
  coReleaseGlobalStaticProofsVerified:0,
  coReleaseGlobalFullFutureWDLBoundsVerified:0,
  newRootExactWithAllOptimalMoves:0,
  baselineOldRootExactWithAllOptimalMoves:0,
  newlyCertifiedRootOutcomes:0,
  returnedStrictlyInferiorActionWDLIntervalsVerified:0,
  maximumActualStrategicFanout:0,
  sourceFutureStatesRecursivelyVisited:0,
  completedRootWDLChecks:0,completedAllOptimalLabelChecks:0,
  fullActionScalarWDLChecks:0,partialActionIntervalChecks:0,
  falseCertifiedGlobalWDLBound:0,falseFirstActionBound:0,
  falseRootWDL:0,falseAllOptimalMoveSet:0,
  falseExactLiteralActionWDL:0,falseOpenActionWDLInterval:0,
  firstNewSourceWitness:null,sourceOperations:0};
 for(const [key,ref] of exactMemo){
  const [h,r0,r1]=key.split('|'),q={
   h:h.split('.').map(Number),R0:r0?r0.split(',').map(BigInt):[],
   R1:r1?r1.split(',').map(BigInt):[]};
  stats.sourceExactQCount++;
  // Source proof first. No reference values are passed to it.
  const g=global.compute(q),cg=coGlobal.compute(q),a=perAction.compute(q),got=source.compute(q);
  if(a.status!=='COMPLETE_SOURCE_ACTION_WDL_BOUNDS')
   throw Error('candidate source interval budget partial at qualified small-board q');
  stats.sourceOperations+=g.statistics.originalSourceWorkUnits+cg.statistics.sourceProofOperations+a.statistics.sourceOperations+
      got.statistics.sourceBooleanOps;
  if(got.statistics.maximumStrategicFanout>1||
     got.statistics.actualMultipleInequivalentFutureValuesPerNode!==0||
     got.statistics.gameContinuationTreeSearchCalls!==0||
     got.statistics.externalSolvedPolicyValuesRead!==0)
   throw Error('candidate used multiple inequivalent future game evaluations');
  stats.maximumActualStrategicFanout=Math.max(
   stats.maximumActualStrategicFanout,got.statistics.maximumStrategicFanout);
  stats.sourceFutureStatesRecursivelyVisited+=got.statistics.selectedSingleFutureQStatesConstructed;
  const exactValues=new Map(ref.actionValues);
  for(const p of g.firstActionValueIntervals){
   stats.globalFullFutureSourceWDLInequalitiesVerified++;
   const val=exactValues.get(p.literalColumn);
   if(val<p.lower||val>p.upper){stats.falseCertifiedGlobalWDLBound++;
     throw Error('global win-impossibility source proof contradicted by independent WDL');}
  }
  for(const p of cg.firstActionValueIntervals){
   stats.coReleaseGlobalFullFutureWDLBoundsVerified++;
   const val=exactValues.get(p.literalColumn);
   if(val<p.lower||val>p.upper)
     throw Error('source co-release global attacker no-WIN theorem false');
  }
  if(cg.fullFutureAttackerCanNeverWinCertified)
    stats.coReleaseGlobalStaticProofsVerified++;
  for(const p of a.firstActionValueIntervals){
   stats.perActionFullWDLSlicesVerified++;
   const val=exactValues.get(p.literalColumn);
   if(val<p.lower||val>p.upper){stats.falseFirstActionBound++;
     throw Error('source first-action defensive pairing or extinction false');}
   if(p.lower===p.upper&&p.lower===0)stats.perActionExactDrawsVerified++;
  }
  stats.perActionDefensivePairingProofsVerified+=a.statistics.staticPairingCertificatesFound;
  if(got.status!=='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN')continue;
  stats.newRootExactWithAllOptimalMoves++;
  if(got.value!==ref.value){stats.falseRootWDL++;throw Error('root WDL mismatch '+key);}
  stats.completedRootWDLChecks++;
  if(JSON.stringify(got.bestMoves)!==JSON.stringify(ref.bestMoves)){
   stats.falseAllOptimalMoveSet++;throw Error('incomplete or wrong tied optimal move set '+key);}
  stats.completedAllOptimalLabelChecks++;
  if(got.actionValues){
   if(JSON.stringify(got.actionValues)!==JSON.stringify(ref.actionValues)){
    stats.falseExactLiteralActionWDL++;throw Error('full exact action vector wrong '+key);}
   stats.fullActionScalarWDLChecks+=got.actionValues.length;
  }
  if(got.actionIntervals)for(const p of got.actionIntervals){
   stats.partialActionIntervalChecks++;
   const val=exactValues.get(p.literalColumn);
   if(val<p.lower||val>p.upper){stats.falseOpenActionWDLInterval++;
     throw Error('optimized source interval excludes true WDL '+key);}
   if(p.lower!==p.upper)stats.returnedStrictlyInferiorActionWDLIntervalsVerified++;
  }
  const earlier=prev.compute(q);
  if(earlier.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN')
   stats.baselineOldRootExactWithAllOptimalMoves++;
  else{
   stats.newlyCertifiedRootOutcomes++;
   if(!stats.firstNewSourceWitness)stats.firstNewSourceWitness={
    sourceHeights:q.h,sideToMove:q.h.reduce((x,y)=>x+y,0)%2,
    rootWDL:got.value,completeBestMovesOneBased:got.bestMoves.map(c=>c+1),
    proofKind:got.sourceProofKind,
    fullMoveIntervals:got.actionIntervals?.map(x=>[
      x.literalColumn+1,x.lower,x.upper])??null};
  }
 }
 return stats;
}
