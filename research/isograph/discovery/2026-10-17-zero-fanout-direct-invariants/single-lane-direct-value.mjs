// STRICT ZERO-STRATEGIC-FANOUT source-q evaluator, scoped to states whose
// unknown moves are reduced by SOURCE-ONLY exact WDL certificates to
// AT MOST ONE inequivalent continuation at every rank.
// Unlike minimax, it never evaluates a second speculative future; if
// >=2 unknown actions remain, it returns INCOMPLETE immediately.
// Every success returns unrestricted WDL AND ALL optimal move labels.
// No solved-game oracle, QBF, BDD or precomputed WDL table in candidate.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createDirectTwoTurnFrontier} from './direct-two-turn-frontier-operator.mjs';

export function createSingleLaneDirectValue(geometry){
 const core=createExactQCore(geometry),
  structural=createDirectTwoTurnFrontier(geometry),N=geometry.width*geometry.height;
 function compute(q,{maxOperations=300000,maxDepth=N,maxMs=15000}={}){
  const begin=Date.now(),stats={
   sourceStructuralEvaluations:0,
   totalSourceLocalBooleanOperations:0,
   gameSemanticStatesVisited:0,
   trueChildQCofactorsConstructed:0,
   strategicFutureValuesEvaluated:0,
   originalLiteralActionValuesEmitted:0,
   positionsWithTwoOrMoreUnknown:0,
   positionsWithExactlyOneUnknown:0,
   finalSourceOnlyExitCertificates:0,
   maxStrategicFanout:0,
   twoOrMoreInequivalentFutureEvaluationsAtOneNode:0,
   gameTreeBranchesConstructed:0,
   alternateFutureSearchOrOracleCalls:0,
   BDD_QBF_StrategyProjectionCalls:0,
   deepestOneLaneContinuation:0,
   noBacktracking:true,
   elapsedMs:0
  };
  function incomplete(source,status,reason){
   stats.elapsedMs=Date.now()-begin;
   return {status:'INCOMPLETE',value:null,bestMoves:null,actionValues:null,
    reason,sourceEvidence:source??null,
    zeroStrategicFanoutCertified:stats.maxStrategicFanout<=1&&
      stats.twoOrMoreInequivalentFutureEvaluationsAtOneNode===0,
    totalExactUnrestrictedWDLCertified:false,
    completeOptimalMoveSetCertified:false,
    statistics:{...stats}};
  }
  function oneLane(q,depth){
   if(Date.now()-begin>maxMs||stats.totalSourceLocalBooleanOperations>maxOperations||
      stats.gameSemanticStatesVisited>=maxDepth)
     return {status:'BUDGET_INCOMPLETE',reason:'research safety envelope'};
   stats.gameSemanticStatesVisited++;
   stats.deepestOneLaneContinuation=Math.max(stats.deepestOneLaneContinuation,depth);
   const source=structural.compute(q,{maxOperations:Math.max(1,
      maxOperations-stats.totalSourceLocalBooleanOperations),maxMs:Math.max(1,maxMs-(Date.now()-begin))});
   stats.sourceStructuralEvaluations++;
   stats.totalSourceLocalBooleanOperations+=source.statistics.sourceBitsetOperations+
       (source.statistics.sourceBaselineOperations??0);
   if(source.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'){
     stats.finalSourceOnlyExitCertificates++;
     stats.originalLiteralActionValuesEmitted+=source.actionValues.length;
     return {status:'EXACT',value:source.value,bestMoves:source.bestMoves,
       actionValues:source.actionValues,proofKind:source.proofKind,
       sourceProof:source.structuralCertificate??source.firstActionSourceProofs};
   }
   const unknown=source.unknownFirstActionLabels;
   if(!Array.isArray(unknown))throw Error('source theorem did not expose unresolved first actions');
   if(unknown.length!==1){
     if(unknown.length>=2)stats.positionsWithTwoOrMoreUnknown++;
     return {status:'INCOMPLETE',reason:'TWO_OR_MORE_INEQUIVALENT_UNRESOLVED_ACTIONS',
       sourceEvidence:{exactKnown:source.exactCertifiedFirstActionValues,unknown}};
   }
   const c=unknown[0];
   stats.positionsWithExactlyOneUnknown++;
   stats.maxStrategicFanout=Math.max(stats.maxStrategicFanout,1);
   // This is the ONE and ONLY game-semantic descendant object generated
   // at this source. All other action values are already exact source
   // algebraic facts and must NEVER be recursively evaluated.
   stats.trueChildQCofactorsConstructed++;
   const child=core.next(q,c);let childValue,childProof;
   if(child.terminal!==undefined){
     childValue=child.terminal;childProof='TERMINAL_EXACT_COFATOR';
   }else {
     stats.strategicFutureValuesEvaluated++;
     const r=oneLane(child.q,depth+1);
     if(r.status!=='EXACT')return {status:'INCOMPLETE',
       reason:'UNIQUE_STRATEGIC_LANE_NOT_YET_RESOLVED',
       sourceEvidence:{unknown:[c],known:source.exactCertifiedFirstActionValues,
         childFailure:r}};
     childValue=r.value;childProof={oneContinuedAction:c,
       successorProof:r.proofKind,childValue:r.value};
   }
   const known=new Map(source.exactCertifiedFirstActionValues);
   if(known.has(c))throw Error('source contradictory exact/unknown value label');
   known.set(c,childValue);
   const legal=core.legal(q),moves=legal.map(a=>{
     if(!known.has(a))throw Error('single lane did not recover full action vector');
     return [a,known.get(a)];
   });
   const p=q.h.reduce((sum,x)=>sum+x,0)%2;
   const best=p===0?Math.max(...moves.map(([,v])=>v)):Math.min(...moves.map(([,v])=>v));
   const opt=moves.filter(([,v])=>v===best).map(([a])=>a);
   stats.originalLiteralActionValuesEmitted+=moves.length;
   return {status:'EXACT',value:best,bestMoves:opt,actionValues:moves,
     proofKind:'UNIQUE_UNRESOLVED_STRATEGIC_CONTINUATION',
     sourceProof:{certifiedOtherActions:source.exactCertifiedFirstActionValues,
       oneUnresolvedAction:c,childProof}};
  }
  const result=oneLane(q,0);stats.elapsedMs=Date.now()-begin;
  if(result.status!=='EXACT')return incomplete(result.sourceEvidence,
    result.status,result.reason);
  return {status:'EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN',
   value:result.value,bestMoves:result.bestMoves,actionValues:result.actionValues,
   proofKind:result.proofKind,sourceProof:result.sourceProof,
   fullUnrestrictedWDLCertified:true,completeOptimalMoveSetCertified:true,
   zeroStrategicFanoutCertified:stats.maxStrategicFanout<=1&&
     stats.twoOrMoreInequivalentFutureEvaluationsAtOneNode===0,
   strategyLaneTrace:{maximumGameSemanticFanout:stats.maxStrategicFanout,
     sourceStatesVisited:stats.gameSemanticStatesVisited,
     oneFutureChildPerSourceMaximum:true,
     gameTreeBranchesConstructed:0,
     allOtherLegalActionValuesDerivedFromSourceOnly:true},
   statistics:{...stats}};
 }
 return Object.freeze({compute,width:geometry.width,height:geometry.height,connect:geometry.connect});
}
