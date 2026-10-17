// Strict ZERO game-semantic fanout: exact WDL + ALL optimal labels with
// bounded-interval separation of INFERIOR moves (whose exact WDL is not needed).
// Source algebra plus AT MOST ONE full-future-equivalent representative child.
// Partial order on SOURCE action labels is NOT treated as a future-game
// isomorphism: only full program equivalence can group one continued q.
// Values are exact only after EVERY legal literal interval is closed.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createDirectTwoTurnFrontier} from './direct-two-turn-frontier-operator.mjs';
import {createFullFutureUnknownClass} from './full-future-unknown-class.mjs';
import {sourceWDLOrderClosure} from './source-wdl-lattice-closure.mjs';
import {certifyOptimalSetFromSourceIntervals} from './source-optimal-set-separation.mjs';
export function createSeparatedOptimalSetOneLane(geometry){
 const core=createExactQCore(geometry),direct=createDirectTwoTurnFrontier(geometry),
  equivalence=createFullFutureUnknownClass(geometry),
  N=geometry.width*geometry.height;
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const began=Date.now();
  const stats={sourceStatesVisited:0,directSourceClassifications:0,
   sourceFullFutureOrderClassifications:0,
   sourceBooleanOps:0,
   sourceWDLBoundPropagations:0,
   sourceKnownActionValuesCertified:0,
   fullFutureEquivalenceAssignments:0,
   sourceWDLOrderExtremalLaneSelections:0,
   sourceOneUnknownClassLaneSelections:0,
   exactSourcesClosedWithoutAnyNextGameState:0,
   selectedSingleFutureQStatesConstructed:0,
   recursivelyEvaluatedFutureValues:0,
   selectedLaneWDLDidNotCloseAllRemainingLabels:0,
   sourceHasMultipleUnorderedUnknownValueClasses:0,
   maximumStrategicFanout:0,
   actualMultipleInequivalentFutureValuesPerNode:0,
   gameContinuationTreeSearchCalls:0,
   externalSolvedPolicyValuesRead:0,
   maxSemanticLaneDepth:0,
   exactRootActionVectorChecksAvailable:false,
   qualifiedExactOptimalSetsWithSomeInferiorNumericIntervalsOpen:0,
   sourceOnlyExactBestSetsWithoutFutureState:0,
   sourceBestSetSeparationChecks:0,
   elapsedMs:0};
  function budget(){return stats.sourceBooleanOps<=maxOperations&&Date.now()-began<maxMs;}
  function exact(state,values,kind,proof){
   const legal=core.legal(state),vector=legal.map(a=>{
    if(!values.has(a))throw Error('not all original literal action WDL exact');
    return [a,values.get(a)];
   });
   const mover=state.h.reduce((a,b)=>a+b,0)&1;
   const v=mover===0?Math.max(...vector.map(([,x])=>x)):
     Math.min(...vector.map(([,x])=>x));
   const best=vector.filter(([,x])=>x===v).map(([a])=>a);
   return {status:'EXACT',value:v,actionValues:vector,bestMoves:best,proofKind:kind,proof};
  }
  function lane(state,depth){
   if(!budget()||stats.sourceStatesVisited>N)return {status:'INCOMPLETE',reason:'SAFE_SOURCE_BUDGET'};
   stats.sourceStatesVisited++;
   stats.maxSemanticLaneDepth=Math.max(stats.maxSemanticLaneDepth,depth);
   const input=direct.compute(state,{maxOperations:Math.max(1,maxOperations-stats.sourceBooleanOps),
    maxMs:Math.max(1,maxMs-(Date.now()-began))});
   stats.directSourceClassifications++;
   stats.sourceBooleanOps+=input.statistics.sourceBitsetOperations+
      (input.statistics.sourceBaselineOperations??0);
   if(input.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'){
    stats.exactSourcesClosedWithoutAnyNextGameState++;
    return {status:'EXACT',value:input.value,bestMoves:input.bestMoves,
     actionValues:input.actionValues,proofKind:input.proofKind,
     proof:input.structuralCertificate??input.firstActionSourceProofs};
   }
   const legal=core.legal(state),knownPairs=input.exactCertifiedFirstActionValues||[],
     unknown=input.unknownFirstActionLabels;
   if(!Array.isArray(unknown)||unknown.length===0)
     throw Error('source incomplete without labelled uncertain actions');
   let source={classes:legal.map(a=>[a]),weakFullFutureWDLOrderEdges:[],
     statistics:{staticSourceBooleanOperations:0,neutralSourceBooleanOperations:0,
       reflectionSourceBitsetChecks:0}};
   if(unknown.length>1){
    source=equivalence.compute(state,{maxOperations:Math.max(1,maxOperations-stats.sourceBooleanOps),
      maxMs:Math.max(1,maxMs-(Date.now()-began))});
    stats.sourceFullFutureOrderClassifications++;
    stats.sourceBooleanOps+=source.statistics.staticSourceBooleanOperations+
      source.statistics.neutralSourceBooleanOperations+
      source.statistics.reflectionSourceBitsetChecks;
    stats.fullFutureEquivalenceAssignments+=legal.length-source.classes.length;
   }
   if(!budget())return {status:'INCOMPLETE',reason:'SOURCE_EQUIVALENCE_PROOF_RESOURCE_CAP'};
   const propagation=sourceWDLOrderClosure(
       legal,knownPairs,source.weakFullFutureWDLOrderEdges);
   stats.sourceWDLBoundPropagations+=propagation.statistics.boundPropagations;
   const exactAnchors=new Map(knownPairs);
   for(const interval of propagation.intervals)
    if(interval.exact)exactAnchors.set(interval.literalColumn,interval.exactValue);
   const currentPlayer=state.h.reduce((a,b)=>a+b,0)&1;
   const initialDecision=certifyOptimalSetFromSourceIntervals(
     propagation.intervals,currentPlayer);
   stats.sourceBestSetSeparationChecks++;
   if(initialDecision.status==='EXACT_ROOT_WDL_AND_COMPLETE_OPTIMAL_SET_WITH_POSSIBLE_INFERIOR_INTERVALS'){
     stats.sourceOnlyExactBestSetsWithoutFutureState++;
     if(initialDecision.inferiorActionsWhoseNumericWDLRemainsUnknown.length)
       stats.qualifiedExactOptimalSetsWithSomeInferiorNumericIntervalsOpen++;
     return {status:'EXACT',value:initialDecision.exactRootWDL,
       bestMoves:initialDecision.completeOptimalLiteralMoves,
       actionValues:propagation.allActionValuesExact?
         propagation.intervals.map(z=>[z.literalColumn,z.exactValue]):null,
       actionIntervals:propagation.intervals,
       proofKind:'SOURCE_OPTIMAL_SET_SEPARATION_WITHOUT_ALL_INFERIOR_VALUES',
       proof:{sourceExactAnchors:knownPairs,
         sourceWholeFutureWeakOrder:source.weakFullFutureWDLOrderEdges,
         provenStrictlyInferior:initialDecision.provablyInferiorLiteralMoves,
         inferiorActionsWithoutExactNumericValues:
           initialDecision.inferiorActionsWhoseNumericWDLRemainsUnknown}};
   }
   const relevantLabels=initialDecision.status==='INCOMPLETE_OPTIMAL_MEMBERSHIP'?
     new Set(initialDecision.uncertainOptimalLiteralMoves):
     new Set(propagation.intervals.filter(z=>!z.exact).map(z=>z.literalColumn));
   const unresolved=source.classes.filter(group=>
     group.some(label=>relevantLabels.has(label)));
   const idx=new Map(legal.map((x,i)=>[x,i]));
   const mover=state.h.reduce((a,b)=>a+b,0)&1;
   let pick=null;
   if(unresolved.length===1){
     pick=unresolved[0];stats.sourceOneUnknownClassLaneSelections++;
   }else{
     const candidates=unresolved.filter(group=>{
       const a=idx.get(group[0]);
       return unresolved.every(other=>{
        const b=idx.get(other[0]);
        return mover===1?
          propagation.reachability[a][b]:
          propagation.reachability[b][a];
       });
     });
     if(candidates.length){
       pick=candidates.sort((a,b)=>a[0]-b[0])[0];
       stats.sourceWDLOrderExtremalLaneSelections++;
     }
   }
   if(!pick){
    stats.sourceHasMultipleUnorderedUnknownValueClasses++;
    return {status:'INCOMPLETE',reason:'UNORDERED_INEQUIVALENT_FUTURE_ACTION_CLASSES',
      numberUnresolvedClasses:unresolved.length};
   }
   const representative=pick[0];
   stats.maximumStrategicFanout=Math.max(stats.maximumStrategicFanout,1);
   stats.selectedSingleFutureQStatesConstructed++;
   const child=core.next(state,representative);
   let value;
   if(child.terminal!==undefined)value=child.terminal;
   else {
     stats.recursivelyEvaluatedFutureValues++;
     const z=lane(child.q,depth+1);
     if(z.status!=='EXACT')return {status:'INCOMPLETE',reason:'SINGLE_SELECTED_FUTURE_NOT_CLOSED',
       representative,innerReason:z.reason};
     value=z.value;
   }
   // Source-verified full future equivalence class makes every literal
   // label in the SELECTED group equal. The other classes may have
   // different WDL, but their exact values may now follow by order
   // saturation in the three-point lattice.
   const anchors=[...exactAnchors.entries(),...pick.map(c=>[c,value])];
   const final=sourceWDLOrderClosure(legal,anchors,source.weakFullFutureWDLOrderEdges);
   stats.sourceWDLBoundPropagations+=final.statistics.boundPropagations;
   const finalDecision=certifyOptimalSetFromSourceIntervals(final.intervals,mover);
   stats.sourceBestSetSeparationChecks++;
   if(finalDecision.status!=='EXACT_ROOT_WDL_AND_COMPLETE_OPTIMAL_SET_WITH_POSSIBLE_INFERIOR_INTERVALS'){
     stats.selectedLaneWDLDidNotCloseAllRemainingLabels++;
     return {status:'INCOMPLETE',reason:'SELECTED_ONE_LANE_DOES_NOT_CERTIFY_ALL_OPTIMAL_LABEL_MEMBERSHIP',
       representative,selectedValue:value,
       rootWDLInterval:finalDecision.rootWDLInterval,
       possibleUnresolvedOptimalLabels:finalDecision.uncertainOptimalLiteralMoves};
   }
   if(finalDecision.inferiorActionsWhoseNumericWDLRemainsUnknown.length)
     stats.qualifiedExactOptimalSetsWithSomeInferiorNumericIntervalsOpen++;
   return {status:'EXACT',value:finalDecision.exactRootWDL,
     bestMoves:finalDecision.completeOptimalLiteralMoves,
     actionValues:final.allActionValuesExact?
       final.intervals.map(z=>[z.literalColumn,z.exactValue]):null,
     actionIntervals:final.intervals,
     proofKind:'ONE_LANE_EXACT_WDL_AND_ALL_OPTIMAL_SET_SEPARATED',
     proof:{representative,sourceFullFutureProgramClass:pick,
       sourceExactAnchors:knownPairs,chosenClassWDL:value,
       certifiedStrictlyInferiorLabels:finalDecision.provablyInferiorLiteralMoves,
       stillNumericallyUnknownButStrictlyInferior:
         finalDecision.inferiorActionsWhoseNumericWDLRemainsUnknown,
       fullFutureWeakOrderEdges:source.weakFullFutureWDLOrderEdges}};

  }
  const z=lane(q,0);stats.elapsedMs=Date.now()-began;
  const zero=stats.maximumStrategicFanout<=1&&
    stats.actualMultipleInequivalentFutureValuesPerNode===0&&
    stats.gameContinuationTreeSearchCalls===0&&
    stats.externalSolvedPolicyValuesRead===0;
  if(z.status==='EXACT')return {status:'EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN',
    value:z.value,actionValues:z.actionValues,actionIntervals:z.actionIntervals??null,
    bestMoves:z.bestMoves,
    sourceProofKind:z.proofKind,sourceProof:z.proof,
    zeroStrategicFanoutCertified:zero,completeOptimalMoveSetCertified:true,
    statistics:stats};
  return {status:'INCOMPLETE',value:null,actionValues:null,bestMoves:null,
   reason:z.reason,zeroStrategicFanoutCertified:zero,
   completeOptimalMoveSetCertified:false,statistics:stats};
 }
 return Object.freeze({compute,width:geometry.width,height:geometry.height,connect:geometry.connect});
}
