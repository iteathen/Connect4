#!/usr/bin/env node
// Offline independent falsifier of exact source-anchored BDD Bellman WDL
// INTERVAL composition. Candidate compilation is entirely symbolic.
// Full game q-only reference called AFTER every interval horizon is frozen.
//
// Validate both players to move, monotone depth refinement, exact action
// value containment, full-depth boundary and complete tied-move logic.
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createBoundedSupportIntervalBDDSolver,OwnerBDDBudgetError}
 from './bounded-support-interval-bdd.mjs';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const BUDGET={
 maxNodes:60000,maxBDDOperations:300000,maxSupports:10000,compileMs:15000,
 maxQStates:200000,maxQTransitions:800000,qReferenceMs:30000,
 gcEverySupports:64,gcNodeHighWater:40000
};
const S7={width:7,height:6,connect:4},
 S3={width:4,height:3,connect:3};
const S7DEPTH35=[1,2,3,5,7],S7DEPTH30=[2,4,6,8],
 S3EMPTY=[1,3,5,8,12],
 S3SEQUENCES=[
  {sequence:'223',depth:[1,2,3,5,9]},
  {sequence:'1112232',depth:[1,2,3,5]},
  {sequence:'112233',depth:[1,2,3]}
 ];
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function replay(cfg,sequence,physical){
 let s=physical.empty();
 for(const char of sequence){
  const edge=physical.move(s,Number(char)-1);
  if(edge.terminal!==undefined)
   return {status:'SKIPPED_INVALID_FIRST_WIN_STOPPED_FIXTURE',
    sequence,rank:s.rank+1,terminal:edge.terminal};
  s=edge.child;
 }
 return {status:'LEGAL',physicalState:s};
}
function one(cfg,sequence,depths,physical,core){
 const started=performance.now(),replayed=replay(cfg,sequence,physical);
 if(replayed.status!=='LEGAL')
  return {game:cfg,sequence,status:replayed.status,rank:replayed.rank,
   terminal:replayed.terminal};
 const state=replayed.physicalState,q=core.fromPhysical(state),
  remaining=cfg.width*cfg.height-state.rank,
  tested=depths.map(d=>Math.min(remaining,d)),
  samples=[];
 for(const k of [...new Set(tested)]){
  const v=createBoundedSupportIntervalBDDSolver(cfg,q,{
   maxNodes:BUDGET.maxNodes,
   maxApplyVisits:BUDGET.maxBDDOperations,
   maxSupports:BUDGET.maxSupports,
   deadlineAt:Date.now()+BUDGET.compileMs,
   gcEverySupports:BUDGET.gcEverySupports,
   gcNodeHighWater:BUDGET.gcNodeHighWater,
   maxDepth:k
  });
  const begin=performance.now();
  try{
   const f=v.compile();
   samples.push({depth:k,status:'COMPILED',
    bounds:v.decodeSourceRoot(f),
    supportMetrics:v.stats(),
    elapsedMs:+(performance.now()-begin).toFixed(3)});
  }catch(e){
   samples.push({depth:k,status:e instanceof OwnerBDDBudgetError?
       'PARTIAL_BDD_BUDGET':'FAIL',
     error:String(e),
     metrics:e.detail??v.stats(),
     elapsedMs:+(performance.now()-begin).toFixed(3)});
  }
 }
 let reference=null,refStatus='UNSTARTED',refErr=null;
 try{
  const t=performance.now();
  const exact=core.solve(q,{maxStates:BUDGET.maxQStates,
   maxTransitions:BUDGET.maxQTransitions,
   deadlineAt:Date.now()+BUDGET.qReferenceMs});
  reference={answer:exact.answer,metrics:exact.stats,
   elapsedMs:+(performance.now()-t).toFixed(3)};
  refStatus='COMPLETE';
 }catch(e){
  refStatus=e instanceof CoreBudgetError?'PARTIAL_Q_BUDGET':'FAIL';
  refErr=String(e);
 }
 const faults=[],sorted=samples.filter(x=>x.status==='COMPILED')
   .sort((a,b)=>a.depth-b.depth);
 const validateAt=(s)=>{
  const b=s.bounds;
  if(b.lower>b.upper)faults.push({depth:s.depth,reason:'root bounds reversed'});
  if(b.exactValue!==null&&b.exactValue!==b.lower)
   faults.push({depth:s.depth,reason:'wrong exact root value'});
  if(b.completeBestMoves!==null&&
    (b.exactValue===null||b.unresolvedActionMoves.length!==0))
   faults.push({depth:s.depth,reason:'unsafe complete best-move mask'});
  if(!reference)return;
  if(!(b.lower<=reference.answer.value&&reference.answer.value<=b.upper))
   faults.push({depth:s.depth,reason:'root interval excludes exact value'});
  for(const [i,a] of b.actionIntervals.entries()){
   const [col,v]=reference.answer.actionValues[i];
   if(col!==a.column||!(a.lower<=v&&v<=a.upper))
    faults.push({depth:s.depth,reason:'action interval excludes exact value',
     action:a,expected:reference.answer.actionValues[i]});
  }
  if(b.exactValue!==null&&b.exactValue!==reference.answer.value)
   faults.push({depth:s.depth,reason:'misclassified exact root'});
  if(b.completeBestMoves!==null&&!eq(b.completeBestMoves,reference.answer.bestMoves))
   faults.push({depth:s.depth,reason:'wrong complete certified optimal set'});
  if(b.actionIntervals.every(a=>a.exact)&&
      b.actionIntervals.some((a,i)=>a.lower!==reference.answer.actionValues[i][1]))
   faults.push({depth:s.depth,reason:'exact action inconsistent'});
  if(s.depth>=remaining&&(b.exactValue===null||
      b.actionIntervals.some(a=>!a.exact)))
   faults.push({depth:s.depth,reason:'complete horizon failed exact convergence'});
 };
 for(const s of sorted)validateAt(s);
 for(let i=1;i<sorted.length;i++){
  const prev=sorted[i-1].bounds,next=sorted[i].bounds;
  if(prev.lower>next.lower||next.upper>prev.upper)
   faults.push({depthPair:[sorted[i-1].depth,sorted[i].depth],
    reason:'root interval failed refinement'});
  for(let j=0;j<prev.actionIntervals.length;j++){
   const a=prev.actionIntervals[j],b=next.actionIntervals[j];
   if(a.column!==b.column||a.lower>b.lower||b.upper>a.upper)
    faults.push({depthPair:[sorted[i-1].depth,sorted[i].depth],
     action:j,reason:'action interval failed refinement'});
  }
 }
 return {
  game:cfg,sequence,rank:state.rank,mover:state.rank%2,
  sourceSupport:state.h,remaining,
  referenceStatus:refStatus,referenceError:refErr,
  reference,
  samples,intervalFalsifiers:faults,
  status:faults.length?'FAIL':refStatus==='FAIL'||
   samples.some(x=>x.status==='FAIL')?'FAIL':
   refStatus!=='COMPLETE'||samples.some(x=>x.status!=='COMPILED')?
    'PARTIAL':'PASS',
  elapsedMs:+(performance.now()-started).toFixed(3)
 };
}
export function runIntervalCrossHorizonQualification(frozen){
 if(!frozen||!Array.isArray(frozen.cases))throw Error('missing frozen legal suffix fixtures');
 const seeded=frozen.cases.filter(x=>x.label?.startsWith('seeded-rank35-')&&x.ply===35);
 if(seeded.length!==12)throw Error('expected twelve frozen legal rank35 positions');
 const physical7=physicalRules(S7),core7=createExactQCore(S7);
 const physical3=physicalRules(S3),core3=createExactQCore(S3);
 const results=[];
 for(const s of seeded)results.push(one(S7,s.sequence,S7DEPTH35,physical7,core7));
 for(const s of seeded.slice(0,4))
  results.push(one(S7,s.sequence.slice(0,30),S7DEPTH30,physical7,core7));
 results.push(one(S3,'',S3EMPTY,physical3,core3));
 for(const s of S3SEQUENCES)
  results.push(one(S3,s.sequence,s.depth,physical3,core3));
 const failures=results.filter(x=>x.status==='FAIL'),
  partial=results.filter(x=>x.status==='PARTIAL');
 return {
  schema:'connect4.bounded-support-interval.cross-horizon.v0_1',
  date:'2026-10-16',
  status:failures.length?'FAIL':partial.length?'PARTIAL':'PASS',
  frozenFixtureSeed:frozen.seed,
  budgets:BUDGET,
  controls:results,
  summary:{
   fixtureCount:results.length,
   qualifiedCases:results.filter(x=>x.status==='PASS').length,
   invalidTestFixtures:results.filter(x=>x.status.startsWith('SKIPPED')).length,
   budgetPartial:partial.length,
   genuineMismatches:results.reduce((v,x)=>v+(x.intervalFalsifiers?.length??0),0),
   compiledHorizonCases:results.reduce((v,x)=>v+(x.samples?.filter(s=>s.status==='COMPILED').length??0),0),
   exactRootHorizonCases:results.reduce((v,x)=>v+(x.samples?.filter(s=>s.status==='COMPILED'&&s.bounds.exactValue!==null).length??0),0),
   allActionExactHorizonCases:results.reduce((v,x)=>v+(x.samples?.filter(s=>s.status==='COMPILED'&&s.bounds.allActionIntervalsExact).length??0),0),
   totalBDDOperations:results.reduce((v,x)=>v+(x.samples?.reduce((t,s)=>t+(s.supportMetrics?
     s.supportMetrics.applyMisses+s.supportMetrics.restrictMisses+s.supportMetrics.notMisses:0),0)??0),0)
  },
  producerUsedSearchedWinningPolicies:false,
  physicalQRecursionAsIndependentValidatorOnly:true,
  arbitraryDepthPolynomialSolverProved:false
 };
}
if(process.argv[1]?.endsWith('bounded-support-interval-control.mjs')){
 const dir=dirname(fileURLToPath(import.meta.url));
 const frozen=JSON.parse(readFileSync(join(dir,'STANDARD7X6_LOCAL_FUSION_RESULTS_0_1.json'),'utf8'));
 const result=runIntervalCrossHorizonQualification(frozen);
 console.log(JSON.stringify(result,null,2));
 if(result.status==='FAIL')process.exitCode=1;
}
