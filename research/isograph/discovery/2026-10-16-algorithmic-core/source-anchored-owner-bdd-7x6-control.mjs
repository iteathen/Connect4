#!/usr/bin/env node
// 7x6 standard-board fixed-prefix scaling control, no 7x6 root solve.
// Symbolic producer receives only support geometry, **never** a color
// owner state or solved q value until compilation completes.
// The separate direct physical first-win and exact-q recursive
// evaluators are validation-only.

import {performance} from 'node:perf_hooks';
import {createSourceAnchoredOwnerBDDSolver,OwnerBDDBudgetError}
 from './source-anchored-owner-bdd.mjs';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const G={width:7,height:6,connect:4};
const FROZEN='43214636342357317661423762461717147';
const CANDIDATE_RANKS=[35,32,30,28,27,26,24,22];
const LIMITS={maxBDDNodes:60000,maxBDDOperations:300000,
 maxSupports:10000,maxCompileMs:15000,
 maxQStates:200000,maxQTransitions:800000,maxQTimeMs:30000};
const physical=physicalRules(G),core=createExactQCore(G);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function runStandard7x6OwnerBDDSuffix(rank){
 if(!CANDIDATE_RANKS.includes(rank))throw Error('rank not in frozen controls');
 const start=performance.now(),seq=FROZEN.slice(0,rank);
 let state=physical.empty();
 for(const letter of seq){
  const c=Number(letter)-1,edge=physical.move(state,c);
  if(edge.terminal!==undefined)
   throw Error('frozen standard7x6 prefix terminates before chosen rank '+rank);
  state=edge.child;
 }
 const supportCount=state.h.reduce((n,x)=>n*(G.height-x+1),1),
  report={schema:'connect4.source-anchored-owner-bdd.standard7x6-suffix.v0_1',
   date:'2026-10-16',rank,prefix:seq,support:state.h.slice(),
   futureSupportCount:supportCount,status:'UNSTARTED',
   candidateInputContract:'actual source q h0,R0,R1 and Connect4 geometry only, no solved values',
   candidateUsedGameTreeSearch:false,
   candidateUsesSourceQGeometryOnly:true,
   fixedBudget:LIMITS};
 const initialQ=core.fromPhysical(state);
 const builder=createSourceAnchoredOwnerBDDSolver(G,initialQ,{
  maxNodes:LIMITS.maxBDDNodes,maxApplyVisits:LIMITS.maxBDDOperations,
  maxSupports:LIMITS.maxSupports,deadlineAt:Date.now()+LIMITS.maxCompileMs,
  retainAllSupportFunctions:false});
 try{
  const at=performance.now();
  const f=builder.compile();
  report.compileMs=+(performance.now()-at).toFixed(3);
  report.compiler=builder.stats();
  report.outputLiveBDD=builder.liveOutput(f);
  // Only AFTER compile: evaluate actual ownership bits and query a
  // separate exact-q full suffix solver, with its own hard limits.
  report.candidate=builder.decodeSourceRoot(f);
  report.status='COMPILED_UNVALIDATED';
  try{
   const q=initialQ,refStart=performance.now();
   const trusted=core.solve(q,{
     maxStates:LIMITS.maxQStates,
     maxTransitions:LIMITS.maxQTransitions,
     deadlineAt:Date.now()+LIMITS.maxQTimeMs});
   report.independentQMs=+(performance.now()-refStart).toFixed(3);
   report.independentQ=trusted.answer;
   report.independentQStats=trusted.stats;
   report.actionAndValueMatch=same(report.candidate,trusted.answer);
   report.status=report.actionAndValueMatch?'PASS':'FAIL';
   if(!report.actionAndValueMatch)report.firstMismatch={
    candidate:report.candidate,reference:trusted.answer};
  }catch(e){
   report.status=e instanceof CoreBudgetError?'PARTIAL_Q_BUDGET':'FAIL';
   report.validatorError=String(e);
   report.validatorBudgetMetrics=e.metrics??null;
  }
 }catch(e){
  report.status=e instanceof OwnerBDDBudgetError?
   'PARTIAL_BDD_BUDGET':'FAIL';
  report.compilerError=String(e);
  report.compilerMetrics=e.detail??builder.stats();
 }
 report.totalMs=+(performance.now()-start).toFixed(3);
 return report;
}
if(process.argv[1]?.endsWith('owner-incidence-bdd-7x6-control.mjs')){
 const rank=Number(process.argv.find(x=>/^--rank=/.test(x))?.split('=')[1]??'35');
 const z=runStandard7x6OwnerBDDSuffix(rank);
 console.log(JSON.stringify(z,null,2));
 if(z.status==='FAIL')process.exitCode=1;
}
