#!/usr/bin/env node
// Qualification of exact horizontal-reflection support-orbit WDL interval.
// Input q must be invariant under reflection: support AND both residuals.
// Candidate construction uses only source q geometry; no searched policies,
// solved game labels or q descendants enter the symbolic compiler.
//
// Independent q-only WDL checks and unquotiented baseline performed
// only AFTER candidate support-orbit formulas have been constructed.

import {createBoundedSupportIntervalBDDSolver as createReflected,OwnerBDDBudgetError}
 from './reflected-bounded-support-interval-bdd.mjs';
import {createBoundedSupportIntervalBDDSolver as createOrdinary}
 from './bounded-support-interval-bdd.mjs';
import {createExactQCore} from './exact-q-core.mjs';

const DEFAULT={maxNodes:60000,maxApplyVisits:300000,
 maxSupports:10000,gcEverySupports:64,gcNodeHighWater:40000};
const TESTS=[
 {cfg:{width:4,height:3,connect:3},history:'',depth:12,expectReference:true},
 {cfg:{width:4,height:4,connect:4},history:'',depth:16,expectReference:true},
 {cfg:{width:4,height:3,connect:3},history:'1243',depth:8,expectReference:true},
 {cfg:{width:4,height:4,connect:4},history:'1243',depth:12,expectReference:true}
],CANONICAL='44444';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function source(cfg,seq){
 const core=createExactQCore(cfg);let q=core.createEmpty();
 for(const character of seq){
  const e=core.next(q,Number(character)-1);
  if(e.terminal!==undefined)throw Error('invalid source history '+seq);
  q=e.q;
 }return {core,q};
}
function compile(kind,cfg,q,depth){
 const factory=kind==='reflected'?createReflected:createOrdinary;
 const solver=factory(cfg,q,{...DEFAULT,maxDepth:depth,
  reflectionQuotient:kind==='reflected',
  deadlineAt:Date.now()+15000});
 const start=Date.now();
 try{
  const output=solver.compile();
  return {status:'COMPILED',bounds:solver.decodeSourceRoot(output),
   supportStats:solver.stats(),elapsedMs:Date.now()-start};
 }catch(e){
  return {status:e instanceof OwnerBDDBudgetError?
     'PARTIAL_BDD_BUDGET':'FAIL',
   error:String(e),metrics:e.detail??solver.stats(),elapsedMs:Date.now()-start};
 }
}
export function runReflectedIntervalQualification(){
 const cases=[];
 for(const t of TESTS){
  const {core,q}=source(t.cfg,t.history);
  const c=compile('reflected',t.cfg,q,t.depth);
  const result={board:t.cfg,history:t.history,depth:t.depth,...c};
  if(c.status==='COMPILED'){
   const exact=core.solve(q,{maxStates:200000,maxTransitions:800000,
     deadlineAt:Date.now()+30000});
   result.independent={answer:exact.answer,states:exact.stats.uniqueStates};
   const intervals=c.bounds.actionIntervals,
    expected=exact.answer.actionValues;
   result.exactAgreement=c.bounds.exactValue===exact.answer.value&&
    same(c.bounds.completeBestMoves,exact.answer.bestMoves)&&
    intervals.every((a,i)=>a.column===expected[i][0]&&
      a.exact&&a.lower===expected[i][1]);
   if(!result.exactAgreement)result.status='FAIL';
  }
  cases.push(result);
 }
 const std={cfg:{width:7,height:6,connect:4}};
 const {q}=source(std.cfg,CANONICAL),depths=[];
 for(const depth of [9,10,11]){
  const result=compile('reflected',std.cfg,q,depth);
  depths.push({depth,...result});
 }
 if(depths[0].status==='COMPILED'){
  const nonreflected=compile('ordinary',std.cfg,q,9);
  depths[0].unquotientedValidation={
   status:nonreflected.status,
   identicalFullActionInterval:nonreflected.status==='COMPILED'&&
      same(depths[0].bounds.actionIntervals,nonreflected.bounds.actionIntervals)&&
      depths[0].bounds.lower===nonreflected.bounds.lower&&
      depths[0].bounds.upper===nonreflected.bounds.upper,
   rawSupports:nonreflected.supportStats?.supportsBuilt,
   ordinaryBDDPeak:nonreflected.supportStats?.peakNodesBeforeGC
  };
 }
 // Exact, independent structural negative control: symmetric support
 // alone does NOT guarantee source residual/action mirror congruence.
 const asym=source({width:4,height:3,connect:3},'1234'),asymH=asym.q.h;
 let rejected=null;
 try{
  const wrong=createReflected({width:4,height:3,connect:3},asym.q,
   {...DEFAULT,maxDepth:8,reflectionQuotient:true,deadlineAt:Date.now()+15000});
  wrong.compile();rejected=false;
 }catch(e){rejected=/requires exact invariant source/.test(String(e));}
 const asymGuard={history:'1234',support:asymH,
  symmetricSupport:asymH.every((x,i)=>x===asymH[asymH.length-1-i]),
  asymmetricResidualsDetected:rejected};
 const failed=cases.some(c=>c.status==='FAIL'||c.exactAgreement!==true)||
   depths[0].status!=='COMPILED'||depths[1].status!=='COMPILED'||
   !depths[0].unquotientedValidation?.identicalFullActionInterval||
   !asymGuard.asymmetricResidualsDetected||depths[2].status==='FAIL';
 return {
  schema:'connect4.reflected-bounded-Bellman-source-q-interval.v0_1',
  date:'2026-10-16',
  status:failed?'FAIL':depths[2].status==='PARTIAL_BDD_BUDGET'?'PASS_WITH_DEPTH11_BUDGET_BOUNDARY':'PASS',
  budgets:{...DEFAULT,compilationMs:15000},cases,
  standard7x6:{history:CANONICAL,depths},
  invalidSourceGuard:asymGuard,
  candidateGameTreeSearchUsed:false,
  mirroredVariableSubstitution:'ordered Shannon ITE under exact source reflection',
  sourceValueOracleInputs:0,
  globalBranchEliminationProved:false
 };
}
if(process.argv[1]?.endsWith('reflected-bounded-support-interval-control.mjs')){
 const z=runReflectedIntervalQualification();
 console.log(JSON.stringify(z,null,2));
 if(z.status==='FAIL')process.exitCode=1;
}
