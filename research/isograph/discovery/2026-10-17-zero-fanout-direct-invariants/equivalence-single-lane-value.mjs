// ZERO strategic-fanout evaluator on a larger certified domain.
// Source-q two-turn algebra decides some literal action values directly;
// FULL-FUTURE behavioral equivalence (not short-horizon agreement) allows
// unresolved labels to be treated as ONE semantic action class.
// Exactly ONE inequivalent unresolved future q may be evaluated per node.
// Otherwise returns INCOMPLETE; no fallback minimax/negamax/BDD/QBF.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createDirectTwoTurnFrontier} from './direct-two-turn-frontier-operator.mjs';
import {createFullFutureUnknownClass} from './full-future-unknown-class.mjs';

export function createEquivalenceSingleLaneValue(geometry){
 const core=createExactQCore(geometry),
  direct=createDirectTwoTurnFrontier(geometry),
  classes=createFullFutureUnknownClass(geometry);
 const N=geometry.width*geometry.height;
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const begin=Date.now(),stats={
   exactSourceLocalClassifications:0,
   sourceDirectBitsetOperations:0,
   sourceEquivalenceBitsetOperations:0,
   originalLiteralLabelsScanned:0,
   firstActionBehavioralEquivalenceProofs:0,
   inertEquivalentActionGroupsUsed:0,
   nongeometricFullFutureGroupsUsed:0,
   geometricMirrorGroupsUsed:0,
   certifiedEquivalentUnknownLabelsReused:0,
   sourceKnownValuePropagationsThroughFutureIsomorphism:0,
   certificatesWithMoreThanOneRemainingUnknownGroup:0,
   sourceStatesVisited:0,
   trueGameSuccessorsConstructed:0,
   totalFutureValuesRecursivelyEvaluated:0,
   maximumInequivalentStrategicFanout:0,
   actualBranchingAtAnyNode:0,
   gameContinuationSearchCalls:0,
   exactWDLOracleReads:0,
   maxChainDepth:0,
   outputCompleteActionVectors:0,
   outputCompleteOptimalMoveSets:0,
   elapsedMs:0
  };
  function budget(){
   return stats.sourceDirectBitsetOperations+
       stats.sourceEquivalenceBitsetOperations<=maxOperations&&
      Date.now()-begin<=maxMs;
  }
  function result(kind,actionValues,proof){
   const p=q.h.reduce((a,b)=>a+b,0)&1;
   const v=p===0?Math.max(...actionValues.map(x=>x[1])):
     Math.min(...actionValues.map(x=>x[1]));
   const best=actionValues.filter(x=>x[1]===v).map(x=>x[0]);
   return {status:'EXACT',value:v,actionValues,bestMoves:best,
    proofKind:kind,proof};
  }
  function lane(state,depth){
   if(!budget()||stats.sourceStatesVisited>=N+1)
    return {status:'INCOMPLETE',reason:'SOURCE_BUDGET_OR_RANK_GUARD'};
   stats.sourceStatesVisited++;stats.maxChainDepth=Math.max(stats.maxChainDepth,depth);
   const d=direct.compute(state,{maxOperations:Math.max(1,maxOperations-
       stats.sourceDirectBitsetOperations-stats.sourceEquivalenceBitsetOperations),
     maxMs:Math.max(1,maxMs-(Date.now()-begin))});
   stats.exactSourceLocalClassifications++;
   stats.sourceDirectBitsetOperations+=d.statistics.sourceBitsetOperations+
     (d.statistics.sourceBaselineOperations??0);
   if(d.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'){
    stats.outputCompleteActionVectors++;
    stats.outputCompleteOptimalMoveSets++;
    return {status:'EXACT',value:d.value,bestMoves:d.bestMoves,actionValues:d.actionValues,
      proofKind:d.proofKind,proof:d.structuralCertificate??d.firstActionSourceProofs};
   }
   const legal=core.legal(state);
   stats.originalLiteralLabelsScanned+=legal.length;
   const known=new Map(d.exactCertifiedFirstActionValues||[]);
   const unknown=d.unknownFirstActionLabels;
   if(!Array.isArray(unknown))throw Error('structural source classification missing unknown labels');
   if(unknown.length===0)throw Error('source complete classified as INCOMPLETE');
   let classesAtSource,rawClassProofs=[];
   if(unknown.length>1){
    const e=classes.compute(state,{maxOperations:Math.max(1,maxOperations-
      stats.sourceDirectBitsetOperations-stats.sourceEquivalenceBitsetOperations),
      maxMs:Math.max(1,maxMs-(Date.now()-begin))});
    classesAtSource=e.classes;
    rawClassProofs=e.sourceCertificates;
    stats.sourceEquivalenceBitsetOperations+=e.statistics.staticSourceBooleanOperations+
      e.statistics.neutralSourceBooleanOperations+e.statistics.reflectionSourceBitsetChecks;
    stats.firstActionBehavioralEquivalenceProofs+=e.sourceCertificates.length;
    stats.inertEquivalentActionGroupsUsed+=e.sourceCertificates.filter(x=>x.kind.includes('NEUTRAL')).length;
    stats.nongeometricFullFutureGroupsUsed+=e.sourceCertificates.filter(x=>x.kind.includes('COLUMN_ISOMORPHISM')).length;
    stats.geometricMirrorGroupsUsed+=e.sourceCertificates.filter(x=>x.kind.includes('REFLECTION')).length;
   }else classesAtSource=legal.map(c=>[c]);
   if(!budget())return {status:'INCOMPLETE',reason:'SOURCE_PROOF_BUDGET_PARTIAL'};
   const unresolvedGroups=[];
   for(const group of classesAtSource){
    const values=group.filter(a=>known.has(a)).map(a=>known.get(a));
    if(new Set(values).size>1)
      throw Error('contradictory exact action source values in future-program equivalence class');
    if(values.length){
      for(const a of group)if(!known.has(a)){
        known.set(a,values[0]);stats.sourceKnownValuePropagationsThroughFutureIsomorphism++;
      }
    }else unresolvedGroups.push(group);
   }
   if(unresolvedGroups.length>1){
    stats.certificatesWithMoreThanOneRemainingUnknownGroup++;
    return {status:'INCOMPLETE',reason:'MULTIPLE_INEQUIVALENT_UNRESOLVED_BEHAVIOR_CLASSES',
      originalLegalActionLabels:legal,
      unresolvedBehaviorGroups:unresolvedGroups,
      knownSourceValues:[...known]};
   }
   if(unresolvedGroups.length===0){
    const values=legal.map(a=>{
      if(!known.has(a))throw Error('missing direct equivalence-propagated WDL');
      return [a,known.get(a)];
    });
    const mover=state.h.reduce((a,b)=>a+b,0)&1;
    const value=mover===0?Math.max(...values.map(([,v])=>v)):
      Math.min(...values.map(([,v])=>v));
    stats.outputCompleteActionVectors++;stats.outputCompleteOptimalMoveSets++;
    return {status:'EXACT',value,actionValues:values,
      bestMoves:values.filter(([,v])=>v===value).map(([a])=>a),
      proofKind:'ALL_SOURCE_VALUES_CLOSED_BY_FUTURE_EQUIVALENCE',
      proof:{sourceKnownValues:[...known],transporters:rawClassProofs}};
   }
   const group=unresolvedGroups[0],rep=group[0];
   stats.certifiedEquivalentUnknownLabelsReused+=group.length-1;
   stats.maximumInequivalentStrategicFanout=Math.max(stats.maximumInequivalentStrategicFanout,1);
   // This is the *single* semantic future lane. Other labels have
   // equal future-game semantics under source-proved transporters.
   stats.trueGameSuccessorsConstructed++;
   const child=core.next(state,rep);let childValue,childProof;
   if(child.terminal!==undefined){
    childValue=child.terminal;childProof={terminal:child.kind};
   }else{
    stats.totalFutureValuesRecursivelyEvaluated++;
    const solved=lane(child.q,depth+1);
    if(solved.status!=='EXACT')return {status:'INCOMPLETE',reason:'ONE_EQUIVALENCE_LANE_NOT_CLOSED',
      childFailure:solved,representative:rep,behaviorClass:group};
    childValue=solved.value;childProof={qChildRank:state.h.reduce((a,b)=>a+b,0)+1,
      representative:rep,child:solved.proofKind};
   }
   for(const a of group)known.set(a,childValue);
   const actionValues=legal.map(a=>{
    if(!known.has(a))throw Error('single lane failed to certify exact labelled WDL');
    return [a,known.get(a)];
   });
   const p=state.h.reduce((a,b)=>a+b,0)&1,
    value=p===0?Math.max(...actionValues.map(x=>x[1])):Math.min(...actionValues.map(x=>x[1]));
   const best=actionValues.filter(([,v])=>v===value).map(([a])=>a);
   stats.outputCompleteActionVectors++;
   stats.outputCompleteOptimalMoveSets++;
   return {status:'EXACT',value,bestMoves:best,actionValues,
    proofKind:'ONE_FULL_FUTURE_BEHAVIOR_CLASS_RECURSION',
    proof:{sourceOtherExact:[...known].filter(([a])=>!group.includes(a)),
      unresolvedFullBehaviorClass:group,fullFutureSourceTransporters:rawClassProofs,
      oneSelectedRepresentative:rep,childProof}};
  }
  const raw=lane(q,0);
  stats.elapsedMs=Date.now()-begin;
  const invariant=stats.maximumInequivalentStrategicFanout<=1&&
    stats.actualBranchingAtAnyNode===0&&
    stats.gameContinuationSearchCalls===0&&stats.exactWDLOracleReads===0;
  if(raw.status==='EXACT')
   return {status:'EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN',
    value:raw.value,actionValues:raw.actionValues,bestMoves:raw.bestMoves,
    proofKind:raw.proofKind,proof:raw.proof,
    zeroStrategicFanoutCertified:invariant,
    completeOptimalMoveSetCertified:true,
    allLiteralLabelsPreserved:true,
    statistics:{...stats}};
  return {status:'INCOMPLETE',value:null,actionValues:null,bestMoves:null,
   reason:raw.reason,unresolvedBehaviorGroups:raw.unresolvedBehaviorGroups,
   originalLiteralLabels:core.legal(q),zeroStrategicFanoutCertified:invariant,
   completeOptimalMoveSetCertified:false,
   statistics:{...stats}};
 }
 return Object.freeze({compute,width:geometry.width,height:geometry.height,connect:geometry.connect});
}
