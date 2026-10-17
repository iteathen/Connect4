#!/usr/bin/env node
// Independent source-q anchored owner-BDD validation on multiple
// rule-only standard7x6 legal suffix fixtures. Candidate build sees only
// q source h/R0/R1, never oracle values or searched optimal policies.

import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {performance} from 'node:perf_hooks';
import {createSourceAnchoredOwnerBDDSolver,OwnerBDDBudgetError}
 from './source-anchored-owner-bdd.mjs';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const G={width:7,height:6,connect:4};
const physical=physicalRules(G),exact=createExactQCore(G);
const CAPS={nodes:60000,BDDOperations:300000,supports:10000,
 compilationMs:15000,qStates:200000,qTransitions:800000,qReferenceMs:30000};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function replay(sequence){
 let state=physical.empty();
 for(const ch of sequence){
  const c=Number(ch)-1,e=physical.move(state,c);
  if(e.terminal!==undefined)
   throw Error('illegal stored validation input terminating prematurely: '+sequence);
  state=e.child;
 }
 return state;
}
function one(sequence,label){
 const started=performance.now(),state=replay(sequence),q=exact.fromPhysical(state);
 const row={label,rank:state.rank,history:sequence,support:state.h,
   futureSupportCount:state.h.reduce((n,h)=>n*(7-h),1),
   sourceRequirements:{P0:q.R0.length,P1:q.R1.length},
   status:'NOT_STARTED'};
 const builder=createSourceAnchoredOwnerBDDSolver(G,q,{
  maxNodes:CAPS.nodes,maxApplyVisits:CAPS.BDDOperations,
  maxSupports:CAPS.supports,deadlineAt:Date.now()+CAPS.compilationMs});
 try{
  const start=performance.now(),out=builder.compile();
  row.compileMs=+(performance.now()-start).toFixed(3);
  row.symbolic=builder.decodeSourceRoot(out);
  row.BDD=builder.stats();
  row.live=builder.liveOutput(out);
  row.status='COMPILED';
  try{
   const t=performance.now(),qSolve=exact.solve(q,{
    maxStates:CAPS.qStates,maxTransitions:CAPS.qTransitions,
    deadlineAt:Date.now()+CAPS.qReferenceMs});
   row.referenceMs=+(performance.now()-t).toFixed(3);
   row.independent= qSolve.answer;
   row.independentQStats=qSolve.stats;
   row.matchesWDLAndAllActions=same(row.symbolic,row.independent);
   row.status=row.matchesWDLAndAllActions?'PASS':'FAIL';
  }catch(e){
   row.status=e instanceof CoreBudgetError?'PARTIAL_REFERENCE_BUDGET':'FAIL';
   row.referenceError=String(e);row.referenceBudget=e.metrics??null;
  }
 }catch(e){
  row.status=e instanceof OwnerBDDBudgetError?'PARTIAL_BDD_BUDGET':'FAIL';
  row.compileError=String(e);row.compileBudget=e.detail??builder.stats();
 }
 row.totalMs=+(performance.now()-started).toFixed(3);
 return row;
}
export function runSourceAnchoredCrossPositionQualification(fixtures){
 if(!fixtures||!Array.isArray(fixtures.cases))
  throw Error('expected frozen valid rank35 physical fixture JSON');
 const samples=fixtures.cases.filter(c=>
  typeof c.label==='string'&&c.label.startsWith('seeded-rank35-')&&c.ply===35);
 if(samples.length!==12)throw Error('expected exactly 12 preselected rank35 fixtures');
 const controls=[];
 for(const sample of samples){
  if(sample.sequence.length!==35)throw Error('invalid frozen sequence length');
  controls.push(one(sample.sequence,'seeded-rank35-'+sample.label.split('-').at(-1)));
 }
 for(const sample of samples.slice(0,4)){
  controls.push(one(sample.sequence.slice(0,30),
    'first-four-seeded-prefix-rank30-'+sample.label.split('-').at(-1)));
 }
 return {schema:'connect4.source-anchored-bdd.multi-7x6-validation.v0_1',
  date:'2026-10-16',status:controls.some(x=>x.status==='FAIL')?'FAIL':
    controls.every(x=>x.status==='PASS')?'PASS':'PARTIAL',
  frozenFixtureSource:'STANDARD7X6_LOCAL_FUSION_RESULTS_0_1.json',
  seedFromFixture:fixtures.seed,limits:CAPS,
  controls,
  summary:{
   totalPositions:controls.length,
   exactMatches:controls.filter(x=>x.status==='PASS').length,
   partialBudget:controls.filter(x=>x.status.startsWith('PARTIAL')).length,
   mismatches:controls.filter(x=>x.status==='FAIL').length,
   rank35Compared:controls.filter(x=>x.rank===35&&x.status==='PASS').length,
   rank30Compared:controls.filter(x=>x.rank===30&&x.status==='PASS').length,
   peakNodesAcrossCompleted:Math.max(0,...controls.filter(x=>x.status==='PASS')
    .map(x=>x.BDD.peakNodesBeforeGC)),
   totalCandidateSupportEdges:controls.reduce((s,x)=>s+(x.BDD?.supportEdgeCalls||0),0),
   totalIndependentQStates:controls.reduce((s,x)=>s+(x.independentQStats?.uniqueStates||0),0)
  },
  candidatePolicySearchCalls:0,fullStandard7x6RootSolved:false,
  symbolicSupportsStillEnumerated:true};
}
if(process.argv[1]?.endsWith('source-anchored-owner-bdd-cross-position-control.mjs')){
 const here=dirname(fileURLToPath(import.meta.url)),
  source=JSON.parse(readFileSync(join(here,'STANDARD7X6_LOCAL_FUSION_RESULTS_0_1.json'),'utf8'));
 const x=runSourceAnchoredCrossPositionQualification(source);
 console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
