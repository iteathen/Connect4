#!/usr/bin/env node
// Exact source-q anchored symbolic WDL: test GC batch scheduling ONLY.
// No game-state search or solved WDL input in the symbolic compiler.
// Independent exact-q suffix WDL checked AFTER successful candidate compile.

import {performance} from 'node:perf_hooks';
import {createSourceAnchoredOwnerBDDSolver,OwnerBDDBudgetError}
 from './source-anchored-owner-bdd.mjs';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const SEQ='43214636342357317661423762461717147';
const CONFIGS=[
 {g:{width:4,height:3,connect:3},rank:0},
 {g:{width:4,height:4,connect:4},rank:0},
 {g:{width:7,height:6,connect:4},rank:24},
 {g:{width:7,height:6,connect:4},rank:22}
];
const BUDGET={maxNodes:60000,maxApplyVisits:300000,maxSupports:10000,
 compileMs:15000,qMaxStates:200000,qMaxTransitions:800000,qMaxMs:30000,
 gcEverySupports:64,gcNodeHighWater:40000};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function one({g,rank}){
 const phys=physicalRules(g),core=createExactQCore(g);
 let s=phys.empty();
 if(rank!==0){
  for(const c of SEQ.slice(0,rank)){
   const t=phys.move(s,Number(c)-1);
   if(t.terminal!==undefined)throw Error('frozen source prefix terminal before selected rank');
   s=t.child;
  }
 }
 const initialQ=core.fromPhysical(s);
 const result={board:g,rank,support:s.h,
  futureSupports:s.h.reduce((p,h)=>p*(g.height-h+1),1),
  status:'UNSTARTED'};
 const factory=createSourceAnchoredOwnerBDDSolver(g,initialQ,{
  maxNodes:BUDGET.maxNodes,maxApplyVisits:BUDGET.maxApplyVisits,
  maxSupports:BUDGET.maxSupports,
  deadlineAt:Date.now()+BUDGET.compileMs,
  gcEverySupports:BUDGET.gcEverySupports,
  gcNodeHighWater:BUDGET.gcNodeHighWater});
 try{
  const start=performance.now(),c=factory.compile();
  result.compileMs=+(performance.now()-start).toFixed(3);
  result.candidate=factory.decodeSourceRoot(c);
  result.compiler=factory.stats();
  result.status='COMPILED';
  try{
   const t=performance.now(),reference=core.solve(initialQ,{
    maxStates:BUDGET.qMaxStates,maxTransitions:BUDGET.qMaxTransitions,
    deadlineAt:Date.now()+BUDGET.qMaxMs});
   result.validationMs=+(performance.now()-t).toFixed(3);
   result.reference=reference.answer;
   result.referenceStats=reference.stats;
   result.matchesAllLiteralActionValues=same(result.candidate,reference.answer);
   result.status=result.matchesAllLiteralActionValues?'PASS':'FAIL';
  }catch(e){
   result.status=e instanceof CoreBudgetError?'PARTIAL_Q_BUDGET':'FAIL';
   result.referenceError=String(e);
   result.referenceBudget=e.metrics??null;
  }
 }catch(e){
  result.status=e instanceof OwnerBDDBudgetError?'PARTIAL_BDD_BUDGET':'FAIL';
  result.compilerError=String(e);
  result.compilerBudget=e.detail??factory.stats();
 }
 return result;
}
export function runAnchoredGCBatchControl(){
 const cases=CONFIGS.map(one);
 return {schema:'connect4.source-anchored-bdd.gc-batch.v0_1',
  date:'2026-10-16',status:cases.some(x=>x.status==='FAIL')?'FAIL':
   cases.every(x=>x.status==='PASS')?'PASS':'PARTIAL',
  budgets:BUDGET,cases,
  semanticCandidateChanged:false,
  strategicActionAndOrFanoutStillPresent:true,
  gameStateTreeSearchInCandidate:false};
}
if(process.argv[1]?.endsWith('source-anchored-owner-bdd-gc-batch-control.mjs')){
 const result=runAnchoredGCBatchControl();
 console.log(JSON.stringify(result,null,2));
 if(result.status==='FAIL')process.exitCode=1;
}
