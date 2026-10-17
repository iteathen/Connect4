#!/usr/bin/env node
// Strict bounded implementation control; the candidate builder is a
// bottom-up support-DAG algebra, no q game-state solve or policy search.
//
// AFTER compiling, use separate exact recursive q and physical first-win
// rule evaluators, the earlier top-down symbolic compiler, and deterministic
// abstract residual samples to falsify value/action transports.
//
// This does not conceal strategic AND/OR fanout or establish global
// computational branch elimination.
import {performance} from 'node:perf_hooks';
import {createSupportDAGLiveCircuit,SupportDAGBudgetError}
 from './support-dag-reflection-circuit.mjs';
import {createSymbolicResidualCircuit} from './symbolic-residual-circuit.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const BOARD={width:4,height:3,connect:3};
const TARGETS=[
 {h:[2,2,1,2],reflection:false},
 {h:[1,1,1,1],reflection:true},
 {h:[0,0,0,0],reflection:true}
];
const MAX_NODES=60000,MAX_SUB=300000,MAX_SUPPORTS=10000,MAX_MS=15000;
const ABSTRACT=128,SEED=0x7a16bdbd;
let rng=SEED;
function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function bit(){return random()&1;}
const pc=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
const subset=(a,b)=>(a&b)===a;
const canon=rs=>{
 const sorted=[...new Set(rs.map(String))].map(BigInt)
   .sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0)),out=[];
 for(const x of sorted)if(!out.some(y=>subset(y,x)))out.push(x);
 return out;
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function reflectQ(q){
 const refl=m=>{
  let out=0n;
  for(let c=0;c<BOARD.width;c++)for(let row=0;row<BOARD.height;row++)
   if(m&(1n<<BigInt(row*BOARD.width+c)))
    out|=1n<<BigInt(row*BOARD.width+BOARD.width-1-c);
  return out;
 };
 return {h:q.h.slice().reverse(),
  R0:canon(q.R0.map(refl)),R1:canon(q.R1.map(refl))};
}
function sourceShapes(core,h){
 let occupied=0n;
 for(let c=0;c<h.length;c++)for(let row=0;row<h[c];row++)
  occupied|=core.bit(c,row);
 return [...new Set(core.lines.map(x=>String(x&~occupied)))]
  .filter(x=>x!=='0').map(BigInt);
}
export function runSupportDAGMirrorControl(){
 const start=performance.now(),cases=[];
 const compiled=[];
 for(const target of TARGETS){
  const options={maxNodes:MAX_NODES,maxSubstitutionVisits:MAX_SUB,
   maxSupports:MAX_SUPPORTS,deadlineAt:Date.now()+MAX_MS,
   reflectionQuotient:target.reflection,simplifyByPoset:true};
  const candidate=createSupportDAGLiveCircuit(BOARD,options);
  const begin=performance.now();
  try{
   const circuit=candidate.compile(target.h);
   const row={h:target.h,reflection:target.reflection,status:'COMPILED',
    compilationMs:+(performance.now()-begin).toFixed(3),
    stats:candidate.stats(),live:candidate.liveStats(circuit)};
   cases.push(row);compiled.push({target,candidate,circuit,row});
  }catch(e){
   const type=e instanceof SupportDAGBudgetError?'BUDGET_EXHAUSTED':'FAIL';
   cases.push({h:target.h,reflection:target.reflection,status:type,
    compilationMs:+(performance.now()-begin).toFixed(3),
    error:String(e),metrics:e.metrics??candidate.stats()});
  }
 }
 // Everything below is VALIDATION after the symbolic compilation phase.
 const core=createExactQCore(BOARD),phys=physicalRules(BOARD);
 const full=phys.solveAll({maxStates:200000,maxEdges:800000,
  deadlineAt:Date.now()+MAX_MS});
 const validation={physicalStatesInIndependentCorpus:full.states.size,
  physicallyCompared:0,abstractCompared:0,mirroredActionTransports:0,
  independentQValueCalls:0,earlierSymbolicComparisons:0,
  actionMaskMismatches:0,qValueMismatches:0,
  oldSymbolicMismatches:0,reflectionTransportMismatches:0,
  firstError:null,baselineStats:full.stats};
 const memo=new Map();
 for(const {target,candidate,circuit,row} of compiled){
  row.validation={physical:0,abstract:0,mirrors:0,errors:0};
  const previous=createSymbolicResidualCircuit(BOARD,{
    maxNodes:60000,maxSubstitutionVisits:300000,
    deadlineAt:Date.now()+MAX_MS,simplifyByPoset:true});
  const prior=previous.compile(target.h);
  const all=[...full.states.values()].filter(s=>
    s.h.every((v,i)=>v===target.h[i]));
  const shapes=sourceShapes(core,target.h);
  const abstract=[];
  for(let trial=0;trial<ABSTRACT;trial++){
   abstract.push({h:target.h.slice(),
    R0:canon(shapes.filter(()=>bit())),
    R1:canon(shapes.filter(()=>bit()))});
  }
  for(const datum of [...all,...abstract]){
   const q=datum.R0?datum:core.fromPhysical(datum);
   let reference;
   if(datum.R0){
    const r=core.solve(q,{sharedMemo:memo,maxStates:200000,
     maxTransitions:800000,deadlineAt:Date.now()+MAX_MS});
    reference=r.answer;validation.independentQValueCalls++;
   }else reference=full.memo.get(full.key(datum));
   const actual=candidate.decode(circuit,q);
   const old=previous.decode(prior,q);
   const cleanActual={value:actual.value,bestMoves:actual.bestMoves,
     actionValues:actual.actionValues};
   if(!same(cleanActual,reference)||!same(cleanActual,old)){
    row.validation.errors++;
    if(!validation.firstError)validation.firstError={
     target:target.h,abstract:!!datum.R0,
     q:{h:q.h,R0:q.R0.map(String),R1:q.R1.map(String)},
     actual:cleanActual,reference,old};
    if(cleanActual.value!==reference.value)validation.qValueMismatches++;
    else validation.actionMaskMismatches++;
    if(!same(cleanActual,old))validation.oldSymbolicMismatches++;
    break;
   }
   validation.earlierSymbolicComparisons++;
   if(datum.R0){validation.abstractCompared++;row.validation.abstract++;}
   else{validation.physicallyCompared++;row.validation.physical++;}
   if(target.reflection){
    const m=reflectQ(q);
    const mirroredResult=candidate.decode(circuit,m);
    const reflectedMoves=cleanActual.bestMoves.map(c=>BOARD.width-1-c).sort((a,b)=>a-b);
    if(cleanActual.value!==mirroredResult.value||
      !same(reflectedMoves,mirroredResult.bestMoves)){
     row.validation.errors++;validation.reflectionTransportMismatches++;
     if(!validation.firstError)
      validation.firstError={target:target.h,issue:'mirror q action transport'};
     break;
    }
    row.validation.mirrors++;validation.mirroredActionTransports++;
   }
  }
 }
 const overall=validation.firstError?'FAIL':
  cases.some(x=>x.status!=='COMPILED')?'PARTIAL':'PASS';
 return {schema:'connect4.bottom-up-support-orbit-liveness.v0_1',
  date:'2026-10-16',status:overall,cases,validation,
  compileBudgets:{maxNodes:MAX_NODES,maxSubstitutions:MAX_SUB,
    maxSupports:MAX_SUPPORTS,maxMs:MAX_MS},
  seed:'0x'+SEED.toString(16),elapsedMs:+(performance.now()-start).toFixed(3),
  candidateRanConcreteQGameTreeSearch:false,
  candidateLookedUpWinningPolicies:false,
  globalBranchEliminationEstablished:false};
}
if(process.argv[1]?.endsWith('support-dag-reflection-control.mjs')){
 const x=runSupportDAGMirrorControl();console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
