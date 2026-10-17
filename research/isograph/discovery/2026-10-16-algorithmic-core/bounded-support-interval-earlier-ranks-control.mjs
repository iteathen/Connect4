#!/usr/bin/env node
// Support-cone exact WDL interval compiler at ranks earlier than 20.
// All source sequences are fixed BEFORE solving; no candidate game-tree
// search, solved policy labels, or q descendants enter formula compilation.
// Exact recursive q reference invoked only after the bounded BDD horizons.

import {performance} from 'node:perf_hooks';
import {createBoundedSupportIntervalBDDSolver,OwnerBDDBudgetError}
 from './bounded-support-interval-bdd.mjs';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const S7={width:7,height:6,connect:4};
const FROZEN='43214636342357317661423762461717147';
const TARGETS=[
 {rank:18,seq:FROZEN.slice(0,18),depths:[2,4,6,8,10]},
 {rank:16,seq:FROZEN.slice(0,16),depths:[2,4,6,8,10]},
 {rank:14,seq:FROZEN.slice(0,14),depths:[2,4,6,8]},
 {rank:10,seq:FROZEN.slice(0,10),depths:[2,4,6,8]},
 {rank:5,seq:'44444',depths:[2,4,6,8]}
];
const LIMITS={
 maxBDDNodes:60000,maxNontrivialOperations:300000,
 maxSupports:10000,maxCompileMs:15000,
 gcEverySupports:64,gcNodeHighWater:40000,
 qMaxStates:200000,qMaxTransitions:800000,qMaxMs:30000
};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function sourcePhysical(seq,physical){
 let state=physical.empty();
 for(const text of seq){
  const edge=physical.move(state,Number(text)-1);
  if(edge.terminal!==undefined)throw Error('predeclared source was terminal: '+seq);
  state=edge.child;
 }
 return state;
}
export function runEarlierRankIntervalControl(rank){
 const t=TARGETS.find(x=>x.rank===rank);
 if(!t)throw Error('rank not predeclared');
 const physical=physicalRules(S7),core=createExactQCore(S7);
 const state=sourcePhysical(t.seq,physical),q=core.fromPhysical(state);
 const futureSupports=q.h.reduce((z,v)=>z*(7-v),1);
 const result={
  schema:'connect4.bounded-support-interval.earlier-ranks.v0_1',
  date:'2026-10-16',status:'UNSTARTED',rank,sequence:t.seq,support:q.h.slice(),
  toMove:rank%2,futureSupports,sourceResiduals:{P0:q.R0.length,P1:q.R1.length},
  intendedDepths:t.depths.slice(),budgets:LIMITS,horizon:[],
  sourceUsesOracleLabels:false,sourceUsesPolicySearch:false
 };
 for(const depth of t.depths){
  const solver=createBoundedSupportIntervalBDDSolver(S7,q,{
   maxNodes:LIMITS.maxBDDNodes,maxApplyVisits:LIMITS.maxNontrivialOperations,
   maxSupports:LIMITS.maxSupports,
   maxDepth:depth,gcEverySupports:LIMITS.gcEverySupports,
   gcNodeHighWater:LIMITS.gcNodeHighWater,
   deadlineAt:Date.now()+LIMITS.maxCompileMs
  });
  const start=performance.now();
  try{
   const f=solver.compile(),bounds=solver.decodeSourceRoot(f),
    stats=solver.stats();
   result.horizon.push({
    depth,status:'COMPILED',bounds,
    supportConeCount:stats.supportsPlanned,supportsCompleted:stats.supportsBuilt,
    allocatedBDDNodes:stats.BDDNodeCreates,
    peakBDDNodes:stats.peakNodesBeforeGC,
    finalBDDNodes:stats.finalNodes,
    nontrivialBDDOperations:stats.applyMisses+stats.restrictMisses+stats.notMisses,
    GCCount:stats.gcCount,
    sourceClauseChecks:stats.sourceResidualClauseChecks,
    wallMs:+(performance.now()-start).toFixed(3)
   });
   if(bounds.completeBestMoves!==null){
    result.stoppedReason='EXACT_VALUE_AND_ALL_OPTIMAL_ACTIONS';
    break;
   }
  }catch(e){
   result.horizon.push({
    depth,status:e instanceof OwnerBDDBudgetError?'PARTIAL_BDD_BUDGET':'FAIL',
    error:String(e),stats:e.detail??solver.stats(),
    wallMs:+(performance.now()-start).toFixed(3)
   });
   result.stoppedReason='STRICT_BOUNDED_COMPILATION_STOP';
   break;
  }
 }
 // No fully solved WDL or optimal action label has been queried by the
 // symbolic producer; independent complete q reference is validation only.
 try{
  const t0=performance.now(),ref=core.solve(q,{
   maxStates:LIMITS.qMaxStates,maxTransitions:LIMITS.qMaxTransitions,
   deadlineAt:Date.now()+LIMITS.qMaxMs});
  result.reference={status:'COMPLETE',answer:ref.answer,stats:ref.stats,
   wallMs:+(performance.now()-t0).toFixed(3)};
  const failures=[];
  for(const x of result.horizon){
   if(x.status!=='COMPILED')continue;
   const b=x.bounds;
   if(!(b.lower<=ref.answer.value&&ref.answer.value<=b.upper))
    failures.push({depth:x.depth,reason:'root interval does not contain WDL'});
   for(let j=0;j<b.actionIntervals.length;j++){
    const a=b.actionIntervals[j],rr=ref.answer.actionValues[j];
    if(a.column!==rr[0]||!(a.lower<=rr[1]&&rr[1]<=a.upper))
     failures.push({depth:x.depth,column:a.column,reason:'action interval false'});
   }
   if(b.completeBestMoves!==null&&!eq(b.completeBestMoves,ref.answer.bestMoves))
    failures.push({depth:x.depth,reason:'wrong complete best-move set'});
  }
  result.independentDisagreements=failures;
  result.status=failures.length?'FAIL':
   result.horizon.some(x=>x.status==='FAIL')?'FAIL':
   result.horizon.some(x=>x.status==='PARTIAL_BDD_BUDGET')?'PASS_REFERENCE_BOUNDED_BUILD':'PASS';
 }catch(e){
  result.reference={status:e instanceof CoreBudgetError?'PARTIAL_Q_BUDGET':'FAIL',
   error:String(e),metrics:e.metrics??null};
  result.status=result.horizon.some(x=>x.status==='FAIL')?'FAIL':'PARTIAL_REFERENCE_BUDGET';
 }
 result.earliestExactDepth=result.horizon.find(x=>x.bounds?.exactValue!==null)?.depth??null;
 result.earliestCompleteBestSetDepth=result.horizon.find(x=>x.bounds?.completeBestMoves!==null)?.depth??null;
 return result;
}
if(process.argv[1]?.endsWith('bounded-support-interval-earlier-ranks-control.mjs')){
 const arg=process.argv.find(x=>x.startsWith('--rank='));
 const rank=Number(arg?.slice('--rank='.length)??'18');
 const res=runEarlierRankIntervalControl(rank);
 console.log(JSON.stringify(res,null,2));
 if(res.status==='FAIL')process.exitCode=1;
}
