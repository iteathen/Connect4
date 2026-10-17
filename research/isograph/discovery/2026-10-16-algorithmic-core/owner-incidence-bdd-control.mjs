#!/usr/bin/env node
// Exhaustive validation ONLY of the COMPLETE support-indexed owner-incidence
// ROBDD threshold/action result. Independently evaluates legal physical
// first-win-stopped games via direct last-placement contiguous-run rules
// AFTER both symbolic supports are already compiled.
//
// Candidate compilation never sees concrete states, solved values or
// discovered policies. The reference recursion and physical enumeration
// below are offline independent falsifiers, not the algorithm.

import {performance} from 'node:perf_hooks';
import {createOwnerIncidenceBDDSolver,OwnerBDDBudgetError}
 from './owner-incidence-bdd-value.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const GAMES=[
 {width:4,height:3,connect:3,name:'4x3-c3'},
 {width:4,height:4,connect:4,name:'4x4-c4'}
],MAX_BDD_NODES=60000,MAX_VISITS=300000,
 MAX_SUPPORTS=10000,MAX_COMPILER_MS=15000,
 MAX_PHYS_STATES=200000,MAX_PHYS_EDGES=800000,
 MAX_PHYSICAL_MS=30000;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const canonMasks=(m,w)=>{let result=0n;for(let c=0;c<w;c++)
 for(let row=0;row<(w===4?4:6);row++){}return result;};
function mirrorState(s,G){
 const bit=(c,r)=>1n<<BigInt(r*G.width+c);
 const out={h:s.h.slice().reverse(),p0:0n,p1:0n,rank:s.rank};
 for(let c=0;c<G.width;c++)for(let row=0;row<G.height;row++){
  const b=bit(c,row),t=bit(G.width-1-c,row);
  if(s.p0&b)out.p0|=t;
  if(s.p1&b)out.p1|=t;
 }return out;
}
function runOne(G){
 const started=performance.now(),result={board:G,status:'NOT_STARTED'};
 const solver=createOwnerIncidenceBDDSolver(G,{
  maxNodes:MAX_BDD_NODES,maxApplyVisits:MAX_VISITS,maxSupports:MAX_SUPPORTS,
  deadlineAt:Date.now()+MAX_COMPILER_MS,
  retainAllSupportFunctions:true});
 try{
  const compileAt=performance.now(),
    root=solver.compile(Array(G.width).fill(0));
  result.symbolicCompileMs=+(performance.now()-compileAt).toFixed(3);
  result.symbolicRoot=solver.decode(root,{
   h:Array(G.width).fill(0),p0:0n,p1:0n});
  result.compilerStats=solver.stats();
  result.rootLive=solver.liveOutput(root);
  // All physical and q-only recursive calculations occur AFTER the
  // exact compiled Boolean algebra exists and root values were stored.
  const reference=physicalRules(G);
  const time=performance.now();
  const truth=reference.solveAll({maxStates:MAX_PHYS_STATES,
   maxEdges:MAX_PHYS_EDGES,deadlineAt:Date.now()+MAX_PHYSICAL_MS});
  result.physicalBuildMs=+(performance.now()-time).toFixed(3);
  result.physicalRefStats=truth.stats;
  let mismatches=0,states=0,actions=0,ties=0,reflection=0,
   firstDifference=null;
  const ranks={};
  const sampleCap=128;
  for(const [k,s] of truth.states){
   const compiled=solver.getSupport(s.h);
   if(!compiled)throw Error('missing compiled source support '+s.h);
   const actual=solver.decode(compiled,s),expected=truth.memo.get(k);
   states++;actions+=actual.actionValues.length;
   ties+=Number(actual.bestMoves.length>1);
   ranks[s.rank]=(ranks[s.rank]??0)+1;
   if(!same(actual,expected)){
    mismatches++;if(!firstDifference)firstDifference={
     physicalHistory:s.sequence,
     support:s.h,physical:{p0:s.p0.toString(16),p1:s.p1.toString(16)},
     actual,expected};break;
   }
   if(reflection<sampleCap){
    const mirror=mirrorState(s,G),
      compMirror=solver.getSupport(mirror.h);
    if(!compMirror)throw Error('mirrored support missing '+mirror.h);
    const other=solver.decode(compMirror,mirror);
    const moved=actual.bestMoves.map(x=>G.width-1-x).sort((a,b)=>a-b);
    const mirrorAction=actual.actionValues
       .map(([col,v])=>[G.width-1-col,v])
       .sort((a,b)=>a[0]-b[0]);
    if(actual.value!==other.value||!same(moved,other.bestMoves)||
      !same(mirrorAction,other.actionValues)){
     mismatches++;if(!firstDifference)firstDifference={
      mirrorOf:s.sequence,support:s.h,actual,mirrored:other};
     break;
    }
    reflection++;
   }
  }
  result.coverage={physicalNonterminalStatesCompared:states,
   physicalActionValuesCompared:actions,
   statesWithMultipleWDLEqualBestMoves:ties,
   mirrorTransportedStates:reflection,
   expectedPhysicalNonterminalStates:truth.states.size,
   mismatches,firstDifference,statesByOccupiedRank:ranks};
  if(mismatches||states!==truth.states.size){result.status='FAIL';return result;}
  const independentCore=createExactQCore(G);
  const qResult=independentCore.solve(independentCore.createEmpty(),{
   maxStates:200000,maxTransitions:800000,
   deadlineAt:Date.now()+MAX_PHYSICAL_MS});
  result.independentQRoot=qResult.answer;
  result.independentQStats=qResult.stats;
  result.rootAgreementWithPhysical=same(result.symbolicRoot,truth.root);
  result.rootAgreementWithQ=same(result.symbolicRoot,qResult.answer);
  result.status=result.rootAgreementWithPhysical&&result.rootAgreementWithQ?'PASS':'FAIL';
 }catch(e){
  result.status=e instanceof OwnerBDDBudgetError?'BUDGET_EXHAUSTED':'FAIL';
  result.error=String(e);result.budgetDetails=e.detail??null;
 }
 result.totalMs=+(performance.now()-started).toFixed(3);
 return result;
}
export function runOwnerIncidenceBDDQualification(){
 const results=GAMES.map(runOne);
 return {
  schema:'connect4.owner-incidence-bdd.full-support-wdl.v0_1',
  date:'2026-10-16',
  status:results.every(x=>x.status==='PASS')?'PASS':
   results.some(x=>x.status==='FAIL')?'FAIL':'PARTIAL',
  controls:results,
  budgets:{maxBDDNodes:MAX_BDD_NODES,maxNontrivialApplyRestrictNotVisits:MAX_VISITS,
   maxSupports:MAX_SUPPORTS,compileMs:MAX_COMPILER_MS,
   physicalStates:MAX_PHYS_STATES,physicalEdges:MAX_PHYS_EDGES,physicalMs:MAX_PHYSICAL_MS},
  candidateUsedGameTreeSearch:false,
  candidateUsedSolvedOracle:false,
  candidateContainsSupportActionAndOrFanout:true,
  globalNoBranchingProved:false
 };
}
if(process.argv[1]?.endsWith('owner-incidence-bdd-control.mjs')){
 const x=runOwnerIncidenceBDDQualification();
 console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
