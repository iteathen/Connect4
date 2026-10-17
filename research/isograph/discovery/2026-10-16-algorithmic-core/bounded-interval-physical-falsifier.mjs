#!/usr/bin/env node
// Independent last-placement physical-rule finite-horizon validator.
// The symbolic interval BDD is compiled FIRST and cannot see physical
// continuation values or searched winning policies. This explicit
// recursive physical expansion is OFFLINE FALSIFICATION ONLY.
import {performance} from 'node:perf_hooks';
import {createBoundedSupportIntervalBDDSolver,OwnerBDDBudgetError}
 from './bounded-support-interval-bdd.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const G7={width:7,height:6,connect:4},G3={width:4,height:3,connect:3};
const SEQ7='43214636342357317661423762461717147';
const PREDECLARED=[
 {g:G7,history:SEQ7.slice(0,18),depth:2},
 {g:G7,history:SEQ7.slice(0,20),depth:4},
 // Post-hoc direct physical falsifiers explicitly authorized by the
 // predeclared plan AFTER exact source-only convergence at k<=4.
 {g:G7,history:SEQ7.slice(0,16),depth:2},
 {g:G7,history:SEQ7.slice(0,14),depth:2},
 {g:G3,history:'',depth:1},
 {g:G3,history:'',depth:3},
 {g:G3,history:'',depth:5},
 {g:G3,history:'223',depth:2},
 {g:G3,history:'223',depth:3}
];
const CAPS={maxPhysicalMoves:300000,maxPhysicalMemoStates:200000,
 maxPhysicalMs:30000,maxBDDNodes:60000,maxBDDOps:300000,
 maxSupports:10000,maxSymbolicMs:15000};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function replay(phys,history){
 let s=phys.empty();
 for(const character of history){
  const out=phys.move(s,Number(character)-1);
  if(out.terminal!==undefined)throw Error('premature terminal first-win fixture');
  s=out.child;
 }
 return s;
}
function independentDirectBounded(physical,state,depth){
 const begin=Date.now(),end=begin+CAPS.maxPhysicalMs;
 let moveTransitions=0,newPhysicalStates=0,cacheHits=0;
 const memo=new Map();
 function rec(s,k){
  const key=physical.key(s)+':'+k;
  if(memo.has(key)){cacheHits++;return memo.get(key);}
  if(Date.now()>=end||moveTransitions>=CAPS.maxPhysicalMoves||
     newPhysicalStates>=CAPS.maxPhysicalMemoStates)
   throw Error('bounded direct-physical validation resource cap');
  newPhysicalStates++;
  if(k===0)return {lower:-1,upper:1,actionIntervals:[]};
  const acts=physical.legal(s),player=s.rank&1,values=[];
  let lo=player===0?-Infinity:Infinity,
      hi=player===0?-Infinity:Infinity;
  for(const c of acts){
   if(moveTransitions>=CAPS.maxPhysicalMoves||Date.now()>=end)
    throw Error('bounded direct-physical validation move/time cap');
   moveTransitions++;
   const move=physical.move(s,c);
   const child=move.terminal!==undefined?
     {lower:move.terminal,upper:move.terminal}:rec(move.child,k-1);
   values.push({column:c,lower:child.lower,upper:child.upper});
   lo=player===0?Math.max(lo,child.lower):Math.min(lo,child.lower);
   hi=player===0?Math.max(hi,child.upper):Math.min(hi,child.upper);
  }
  const result={lower:lo,upper:hi,actionIntervals:values};
  memo.set(key,result);
  return result;
 }
 const answer=rec(state,depth);
 return {root:answer,stats:{physicalMoveTransitions:moveTransitions,
  uniquePhysicalDepthStates:newPhysicalStates,physicalCacheHits:cacheHits,
  wallMs:Date.now()-begin}};
}
function one({g,history,depth}){
 const phys=physicalRules(g),core=createExactQCore(g),state=replay(phys,history),
   q=core.fromPhysical(state);
 const symbolic=createBoundedSupportIntervalBDDSolver(g,q,{
   maxNodes:CAPS.maxBDDNodes,maxApplyVisits:CAPS.maxBDDOps,
   maxSupports:CAPS.maxSupports,deadlineAt:Date.now()+CAPS.maxSymbolicMs,
   gcEverySupports:64,gcNodeHighWater:40000,maxDepth:depth
 });
 const row={board:g,history,rank:state.rank,depth,status:'UNSTARTED'};
 try{
  const start=performance.now(),f=symbolic.compile();
  row.symbolicMs=+(performance.now()-start).toFixed(3);
  row.symbolic=symbolic.decodeSourceRoot(f);
  row.symbolicStats=symbolic.stats();
  // Everything below is separate direct physical AND/OR validation.
  const actual=independentDirectBounded(phys,state,depth);
  row.directPhysical=actual;
  row.matchesWDLBounds=row.symbolic.lower===actual.root.lower&&
    row.symbolic.upper===actual.root.upper;
  row.matchesEveryActionInterval=eq(
    row.symbolic.actionIntervals.map(x=>({
      column:x.column,lower:x.lower,upper:x.upper
    })),actual.root.actionIntervals);
  row.status=row.matchesWDLBounds&&row.matchesEveryActionInterval?
    'PASS':'FAIL';
 }catch(e){
  row.status=e instanceof OwnerBDDBudgetError?'PARTIAL_BDD_BUDGET':
   /resource cap|move\/time cap/.test(String(e))?'PARTIAL_PHYSICAL_BUDGET':'FAIL';
  row.error=String(e);
 }
 return row;
}
export function runPhysicalIntervalQualification(){
 const cases=PREDECLARED.map(one);
 return {
  schema:'connect4.bounded-support-interval.direct-physical-falsifier.v0_1',
  date:'2026-10-16',
  status:cases.some(x=>x.status==='FAIL')?'FAIL':
    cases.every(x=>x.status==='PASS')?'PASS':'PARTIAL',
  caps:CAPS,
  cases,
  summary:{validated:cases.filter(x=>x.status==='PASS').length,
   firstWinMismatches:cases.filter(x=>x.status==='FAIL').length,
   totalDirectPhysicalMoveChecks:cases.reduce((a,c)=>
     a+(c.directPhysical?.stats.physicalMoveTransitions||0),0)},
  candidateInputs:'only source q residuals and support; no physical future continuation or optimal search policies',
  physicalRecursionScope:'validation ONLY, exact independent finite-horizon first-win rules'
 };
}
if(process.argv[1]?.endsWith('bounded-interval-physical-falsifier.mjs')){
 const r=runPhysicalIntervalQualification();
 console.log(JSON.stringify(r,null,2));
 if(r.status==='FAIL')process.exitCode=1;
}
