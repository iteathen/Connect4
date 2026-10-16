#!/usr/bin/env node
// Bounded qualification of an exact *symbolic* rank/support transformer.
// Candidate compilation reads geometric residual shapes only, never solved
// values or concrete q states; a separate physical winner scan is the oracle.
import {performance} from 'node:perf_hooks';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';
import {createSymbolicResidualCircuit,SymbolicCircuitBudgetError}
  from './symbolic-residual-circuit.mjs';

const CASES=[
  {board:{width:4,height:3,connect:3},support:[2,2,1,2]},
  {board:{width:4,height:3,connect:3},support:[1,1,1,1]},
  {board:{width:4,height:4,connect:4},support:[3,3,2,2]},
  {board:{width:4,height:3,connect:3},support:[0,0,0,0]}
];
const MAX_CIRCUIT_NODES=60000,MAX_SUB_VISITS=300000,MAX_COMPILE_MS=15000;
const MAX_PHYSICAL_PREFIX_STATES=200000,MAX_PHYSICAL_PREFIX_EDGES=800000;
const MAX_PHYSICAL_MS=30000,MAX_ABSTRACT_SAMPLES=128;
const RANDOM_SEED=0x4c2a3027;
let random=RANDOM_SEED;
function word(){random^=random<<13;random^=random>>>17;random^=random<<5;return random>>>0;}
function randint(n){
 const limit=Math.floor(0x100000000/n)*n;let x;do{x=word();}while(x>=limit);
 return x%n;
}
function bit(W,c,r){return 1n<<BigInt(r*W+c);}
function subset(a,b){return (a&b)===a;}
function popcount(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function minAntichain(xs){
 const sorted=[...new Set(xs.map(String))].map(BigInt).sort((a,b)=>popcount(a)-popcount(b)||(a<b?-1:a>b?1:0));
 const out=[];
 for(const x of sorted)if(!out.some(y=>subset(y,x)))out.push(x);
 return out;
}
function makePhysicalReference(cfg,target,deadlineAt){
 const {width:W,height:H,connect:K}=cfg,dirs=[[1,0],[0,1],[1,1],[1,-1]];
 const stats={prefixStates:0,prefixTransitions:0,physicalSuffixCalls:0,
   physicalSuffixUniqueStates:0,physicalSuffixTransitions:0,physicalSuffixCacheHits:0};
 function empty(){return {h:Array(W).fill(0),p0:0n,p1:0n,rank:0,sequence:''};}
 function legal(s){return s.h.flatMap((x,c)=>x<H?[c]:[]);}
 const stateKey=s=>s.p0.toString(16)+':'+s.p1.toString(16);
 function mine(s,c,r,who){
  return c>=0&&c<W&&r>=0&&r<H&&
    ((who===0?s.p0:s.p1)&bit(W,c,r))!==0n;
 }
 function move(s,c){
  if(s.h[c]>=H)throw Error('illegal physical move');
  const who=s.rank&1,row=s.h[c],stone=bit(W,c,row),h=s.h.slice();h[c]++;
  const child={h,p0:who===0?s.p0|stone:s.p0,p1:who===1?s.p1|stone:s.p1,
    rank:s.rank+1,sequence:s.sequence+String(c+1)};
  for(const [dx,dy] of dirs){
   let line=1;
   for(const sign of [-1,1])for(let k=1;k<K;k++){
    if(!mine(child,c+sign*k*dx,row+sign*k*dy,who))break;
    line++;
   }
   if(line>=K)return {terminal:who===0?1:-1,child};
  }
  return child.rank===W*H?{terminal:0,child}:{child};
 }
 function generate(){
  const visited=new Set(),atTarget=[];
  function visit(s){
   const key=stateKey(s);
   if(visited.has(key))return;
   if(visited.size>=MAX_PHYSICAL_PREFIX_STATES||stats.prefixTransitions>=MAX_PHYSICAL_PREFIX_EDGES||
       Date.now()>=deadlineAt)
    throw new CoreBudgetError('physical prefix fixture budget',{...stats});
   visited.add(key);stats.prefixStates++;
   if(s.rank===target.reduce((a,b)=>a+b,0)){
    if(!s.h.every((n,i)=>n===target[i]))throw Error('prefix support logic error');
    atTarget.push(s);return;
   }
   for(const c of legal(s)){
    if(s.h[c]>=target[c])continue;
    const edge=move(s,c);stats.prefixTransitions++;
    if(edge.terminal===undefined)visit(edge.child);
   }
  }
  visit(empty());return atTarget;
 }
 const memo=new Map();
 function solve(s){
  stats.physicalSuffixCalls++;
  const k=stateKey(s);
  if(memo.has(k)){stats.physicalSuffixCacheHits++;return memo.get(k);}
  if(memo.size>=MAX_PHYSICAL_PREFIX_STATES||Date.now()>=deadlineAt)
    throw new CoreBudgetError('physical suffix budget',{...stats});
  stats.physicalSuffixUniqueStates++;
  const moves=legal(s),p=s.rank&1;
  if(moves.length===0){const result={value:0,bestMoves:[],actionValues:[]};memo.set(k,result);return result;}
  const av=[];let best=p===0?-Infinity:Infinity;
  for(const c of moves){
   const edge=move(s,c);stats.physicalSuffixTransitions++;
   const v=edge.terminal===undefined?solve(edge.child).value:edge.terminal;
   best=p===0?Math.max(best,v):Math.min(best,v);
   av.push([c,v]);
  }
  const result={value:best,bestMoves:av.filter(x=>x[1]===best).map(x=>x[0]),actionValues:av};
  memo.set(k,result);return result;
 }
 return {generate,solve,stats};
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function shapesForSupport(core,h){
 let occupied=0n;
 for(let c=0;c<h.length;c++)for(let row=0;row<h[c];row++)occupied|=core.bit(c,row);
 return [...new Set(core.lines.map(line=>String(line&~occupied)))]
   .filter(s=>s!=='0').map(BigInt);
}
export function runCircuitControl(){
 const output={schema:'connect4.symbolic-branch-circuit-control.v0_1',
  date:'2026-10-16',result:'PASS',seed:'0x'+RANDOM_SEED.toString(16),
  intendedScope:'one symbolic Boolean threshold circuit per support; do not claim eliminated branching cost',
  compileBudgets:{maxNodes:MAX_CIRCUIT_NODES,maxSubstitutionVisits:MAX_SUB_VISITS,
    maxCompileMs:MAX_COMPILE_MS},
  cases:[],oracleQueries:0};
 for(const {board,support} of CASES){
  const result={board,support,status:'UNSTARTED'};
  const t=performance.now();
  try{
   const core=createExactQCore(board);
   const symbolic=createSymbolicResidualCircuit(board,{
    maxNodes:MAX_CIRCUIT_NODES,maxSubstitutionVisits:MAX_SUB_VISITS,
    deadlineAt:Date.now()+MAX_COMPILE_MS
   });
   let compiled;
   try{compiled=symbolic.compile(support);}
   catch(e){
    if(!(e instanceof SymbolicCircuitBudgetError))throw e;
    result.status='COMPILE_BUDGET_EXHAUSTED';
    result.compileBudgetReason=e.message;
    result.partialStats=e.details;
    result.compilationMs=+(performance.now()-t).toFixed(3);
    output.cases.push(result);continue;
   }
   result.compilationMs=+(performance.now()-t).toFixed(3);
   result.circuit= symbolic.stats();
   result.liveCircuit=symbolic.liveGraphMetrics(compiled);
   result.inputShapeCount=symbolic.sourceInfo(support).shapeCount;
   const physic=makePhysicalReference(board,support,Date.now()+MAX_PHYSICAL_MS);
   const physStart=performance.now(),positions=physic.generate();
   const qMemo=new Map(),seenQ=new Set(),metric={gateVisits:0};
   let checked=0,qNewStates=0,qRecursiveCalls=0,qTransitions=0,ties=0;
   let firstMismatch=null;
   let qReferenceMs=0,physicalSuffixMs=0,symbolicEvaluationMs=0;
   const valueStart=performance.now();
   for(const s of positions){
    const q=core.fromPhysical(s),key=core.key(q);
    const tq=performance.now();
    const root=core.solve(q,{
       sharedMemo:qMemo,maxStates:MAX_PHYSICAL_PREFIX_STATES,
       maxTransitions:MAX_PHYSICAL_PREFIX_EDGES,deadlineAt:Date.now()+MAX_PHYSICAL_MS
     });
    qReferenceMs+=performance.now()-tq;
    const tp=performance.now(),expected=physic.solve(s);
    physicalSuffixMs+=performance.now()-tp;
    const ts=performance.now(),actual=symbolic.decode(compiled,q,{metric});
    symbolicEvaluationMs+=performance.now()-ts;
    if(!same(root.answer,expected)||!same(actual,expected)){
      firstMismatch={sequence:s.sequence,support:s.h,canonicalKey:key,
       physical:expected,recursiveQ:root.answer,symbolic:actual};break;
    }
    qNewStates+=root.stats.uniqueStates;
    qRecursiveCalls+=root.stats.recursiveCalls;
    qTransitions+=root.stats.transitions;
    ties+=Number(actual.bestMoves.length>1);
    checked++;seenQ.add(key);
   }
   result.valueCheckMs=+(performance.now()-valueStart).toFixed(3);
   if(firstMismatch){result.status='FAIL';result.counterexample=firstMismatch;}
   else{
    const shapes=shapesForSupport(core,support);
    let abstractSamples=0,abstractMismatches=0;
    for(let k=0;k<MAX_ABSTRACT_SAMPLES;k++){
      const rs=()=>minAntichain(shapes.filter(()=>randint(2)===1));
      const q={h:support.slice(),R0:rs(),R1:rs()};
      const tq=performance.now();
      const solved=core.solve(q,{sharedMemo:qMemo,maxStates:MAX_PHYSICAL_PREFIX_STATES,
        maxTransitions:MAX_PHYSICAL_PREFIX_EDGES,deadlineAt:Date.now()+MAX_PHYSICAL_MS});
      qReferenceMs+=performance.now()-tq;
      const ts=performance.now(),decoded=symbolic.decode(compiled,q,{metric});
      symbolicEvaluationMs+=performance.now()-ts;
      qNewStates+=solved.stats.uniqueStates;qRecursiveCalls+=solved.stats.recursiveCalls;
      qTransitions+=solved.stats.transitions;
      abstractSamples++;
      if(!same(solved.answer,decoded)){
        abstractMismatches++;firstMismatch={abstractQ:{h:q.h,R0:q.R0.map(String),R1:q.R1.map(String)},recursiveQ:solved.answer,symbolic:decoded};
        break;
      }
    }
    result.abstractChecks={samples:abstractSamples,mismatches:abstractMismatches,
      qualification:'abstract shapes from geometry, may not be physically realizable'};
    result.status=abstractMismatches?'FAIL':'PASS';
    if(abstractMismatches)result.counterexample=firstMismatch;
   }
   result.cost={qReferenceMs:+qReferenceMs.toFixed(3),
     independentPhysicalSuffixMs:+physicalSuffixMs.toFixed(3),
     symbolicEvaluationMs:+symbolicEvaluationMs.toFixed(3),
     physicalAndAbstractQueries:checked+(result.abstractChecks?.samples??0)};
   result.coverage={physicalPositionsChecked:checked,distinctQPositions:seenQ.size,
     physicalFixturePrefixStates:physic.stats.prefixStates,
     physicalFixturePrefixEdges:physic.stats.prefixTransitions,
     physicalSuffixStatesSolved:physic.stats.physicalSuffixUniqueStates,
     physicalSuffixEdges:physic.stats.physicalSuffixTransitions,
     qReferenceNewStates:qNewStates,qReferenceRecursiveCalls:qRecursiveCalls,
     qReferenceTransitions:qTransitions,
     physicalPositionsWithMultipleBestMoves:ties,
     symbolicRecursiveQValueCalls:0,
     symbolicGateEvaluations:metric.gateVisits,
     symbolicGateVisitsPerPosition:checked?+(metric.gateVisits/(checked+(result.abstractChecks?.samples??0))).toFixed(3):null,
     mismatches:firstMismatch?1:0};
   result.fixtureGenerationMs=+(performance.now()-physStart).toFixed(3);
  }catch(e){
   result.status=e instanceof CoreBudgetError?'RUNTIME_BUDGET_EXHAUSTED':'FAIL';
   result.error=String(e);result.metrics=e.metrics??null;
  }
  result.totalMs=+(performance.now()-t).toFixed(3);
  output.cases.push(result);
 }
 if(output.cases.some(x=>x.status==='FAIL'))output.result='FAIL';
 else if(output.cases.some(x=>x.status!=='PASS'))output.result='PARTIAL';
 output.exactGameCoreUnchanged=true;
 output.branchEliminationEstablished=false;
 output.circuitHasAlternatingAndOrGates=true;
 output.rootFullBoardCompiled=false;
 return output;
}
if(process.argv[1]?.endsWith('symbolic-circuit-control.mjs')){
 const result=runCircuitControl();console.log(JSON.stringify(result,null,2));
 if(result.result==='FAIL')process.exitCode=1;
}
