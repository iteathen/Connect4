// INDEPENDENT benchmark consumer of ALREADY PROVEN source-only neutral
// equivalence, NOT the structural theorem itself. The consumer still does
// ordinary recursive q minimax on remaining representatives so its only
// research claim is actual eliminated successor VALUE calls and exact
// preservation of WDL + every tied optimal move.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createInertCapacityBisimulation} from './inert-capacity-bisimulation.mjs';

export function runInertCapacityConsumerControl({geometry={width:4,height:3,connect:3},
 maxStates=60000,maxTransitions=300000,maxMs=15000}={}){
 const begin=Date.now(),core=createExactQCore(geometry),source=createInertCapacityBisimulation(geometry),
  memo=new Map(),stats={
   schema:'connect4.inert-capacity-value-consumer-control.v0_1',geometry,
   status:'PASS',uniqueQStates:0,recursiveCalls:0,memoHits:0,
   originalLegalFirstActionLabelsEncountered:0,
   evaluatedScalarSuccessorQActions:0,
   certifiedNeutralSuccessorCallsOmitted:0,
   fullyInertGroupsWithTwoOrMoreMoves:0,
   classifierBooleanBitsetOperations:0,
   terminalWinEdges:0,terminalDrawEdges:0,
   totalEmittedLiteralActionValues:0,
   maxRecursionDepth:0,
   independentlyReferenceStates:0,independentlyReferenceTransitions:0,
   baselineFullValueChecks:0,baselineFullActionVectorChecks:0,
   baselineMissingReachableEntries:0,
   falseValueOrActionVectorResults:0,
   candidateElapsedMs:0,independentElapsedMs:0
  };
 const deadline=begin+maxMs;
 function recur(q,depth){
  stats.recursiveCalls++;stats.maxRecursionDepth=Math.max(stats.maxRecursionDepth,depth);
  const id=core.key(q);if(memo.has(id)){stats.memoHits++;return memo.get(id);}
  if(Date.now()>deadline||stats.uniqueQStates>=maxStates||
     stats.evaluatedScalarSuccessorQActions>=maxTransitions)
    throw Error('NEUTRAL_CONSUMER_BUDGET_EXHAUSTED');
  stats.uniqueQStates++;
  const actions=core.legal(q),mover=q.h.reduce((s,v)=>s+v,0)%2;
  stats.originalLegalFirstActionLabelsEncountered+=actions.length;
  if(!actions.length){
   const ans={value:0,bestMoves:[],actionValues:[]};memo.set(id,ans);return ans;
  }
  const certificate=source.compute(q,{maxOperations:300000,maxMs:15000});
  stats.classifierBooleanBitsetOperations+=certificate.statistics.operations;
  const proposed=new Map(),inert=certificate.inertLiteralColumns,
    representatives=certificate.scalarRootValueProofRepresentatives;
  if(inert.length>=2)stats.fullyInertGroupsWithTwoOrMoreMoves++;
  for(const c of representatives){
   const successor=core.next(q,c);stats.evaluatedScalarSuccessorQActions++;
   let value;
   if(successor.terminal!==undefined){
    value=successor.terminal;
    if(value===0)stats.terminalDrawEdges++;else stats.terminalWinEdges++;
   }else value=recur(successor.q,depth+1).value;
   proposed.set(c,value);
  }
  if(inert.length>1){
   const sourceValue=proposed.get(inert[0]);
   if(sourceValue===undefined)throw Error('inert representative missing scalar value');
   for(const c of inert.slice(1))proposed.set(c,sourceValue);
   stats.certifiedNeutralSuccessorCallsOmitted+=inert.length-1;
  }
  const actionValues=actions.map(c=>{
   if(!proposed.has(c))throw Error('unaccounted legal literal action '+c);
   return [c,proposed.get(c)];
  });
  stats.totalEmittedLiteralActionValues+=actionValues.length;
  const best=mover===0?Math.max(...actionValues.map(x=>x[1])):Math.min(...actionValues.map(x=>x[1]));
  const ans={value:best,actionValues,
    bestMoves:actionValues.filter(([,val])=>val===best).map(([c])=>c)};
  memo.set(id,ans);
  return ans;
 }
 let candidate;
 try{candidate=recur(core.createEmpty(),0);}
 catch(e){
  stats.status='CANDIDATE_BUDGET_PARTIAL';stats.candidateError=String(e);
  stats.candidateElapsedMs=Date.now()-begin;
  return stats;
 }
 stats.candidateElapsedMs=Date.now()-begin;
 // Independent baseline uses UNMODIFIED full branching recursive q core,
 // a fresh memo, and no candidate-classification data.
 const independentStart=Date.now(),refMemo=new Map();
 try{
  const ref=core.solve(core.createEmpty(),{maxStates,maxTransitions,
    deadlineAt:independentStart+maxMs,sharedMemo:refMemo});
  stats.independentlyReferenceStates=ref.stats.uniqueStates;
  stats.independentlyReferenceTransitions=ref.stats.transitions;
  const stringify=x=>JSON.stringify(x);
  if(stringify(candidate)!==stringify(ref.answer)){
   stats.falseValueOrActionVectorResults++;
   throw Error('root full WDL + best/action values disagree');
  }
  for(const [key,answer] of memo){
   stats.baselineFullValueChecks++;
   const refResult=refMemo.get(key);
   if(!refResult){
    stats.baselineMissingReachableEntries++;
    throw Error('independent full ref did not visit consumer state');
   }
   if(answer.value!==refResult.value){
    stats.falseValueOrActionVectorResults++;throw Error('consumer value differs at q '+key);
   }
   stats.baselineFullActionVectorChecks++;
   if(stringify(answer.actionValues)!==stringify(refResult.actionValues)||
      stringify(answer.bestMoves)!==stringify(refResult.bestMoves)){
    stats.falseValueOrActionVectorResults++;throw Error('consumer COMPLETE tied best labels wrong at q '+key);
   }
  }
  stats.originalRootValue=ref.answer.value;
  stats.exactRootOptimalMoveLabels=ref.answer.bestMoves.map(c=>c+1);
  stats.originalRootActionVector=ref.answer.actionValues.map(([c,v])=>[c+1,v]);
  stats.observedTransitionReductionPercent=+(100*(1-stats.evaluatedScalarSuccessorQActions/stats.independentlyReferenceTransitions)).toFixed(5);
  stats.observedUniqueQStateReductionPercent=+(100*(1-stats.uniqueQStates/stats.independentlyReferenceStates)).toFixed(5);
  stats.independentElapsedMs=Date.now()-independentStart;
  return stats;
 }catch(e){
  stats.status='REFERENCE_MISMATCH_OR_BUDGET_PARTIAL';
  stats.referenceError=String(e);stats.independentElapsedMs=Date.now()-independentStart;
  return stats;
 }
}
