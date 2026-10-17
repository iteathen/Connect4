#!/usr/bin/env node
// Pure source-q reflection-quotiented Boolean interval Bellman with
// PREDECLARED static variable orderings. No game-state search or
// solved winning policy enters compilation. Independent q references
// validate only completed small-board root/action results AFTER build.
import {createBoundedSupportIntervalBDDSolver as ordered}
 from './reflected-bounded-interval-variable-order.mjs';
import {createBoundedSupportIntervalBDDSolver as original}
 from './reflected-bounded-support-interval-bdd.mjs';
import {createExactQCore} from './exact-q-core.mjs';

const OPTS={maxNodes:60000,maxApplyVisits:300000,maxSupports:10000,
 gcEverySupports:64,gcNodeHighWater:40000};
const ORDERINGS=['column-major','source-residual-frequency'];
const SMALL=[
 {game:{width:4,height:3,connect:3},history:'',k:12},
 {game:{width:4,height:3,connect:3},history:'1243',k:8},
 {game:{width:4,height:4,connect:4},history:'',k:16},
 {game:{width:4,height:4,connect:4},history:'1243',k:12}
];
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function source(cfg,history){
 const core=createExactQCore(cfg);
 let q=core.createEmpty();
 for(const ch of history){
  const next=core.next(q,Number(ch)-1);
  if(next.terminal!==undefined)throw Error('frozen history terminated');
  q=next.q;
 }
 return {core,q};
}
function compute(factory,game,q,k,order){
 const solver=factory(game,q,{
  ...OPTS,reflectionQuotient:true,maxDepth:k,
  ...(order?{variableOrder:order}:{}),
  deadlineAt:Date.now()+15000});
 const t=Date.now();
 try{
  const out=solver.compile(),bounds=solver.decodeSourceRoot(out),
   stats=solver.stats();
  return {status:'COMPLETE',bounds,
   supportsCompiled:stats.supportsBuilt,
   equivalentOrdinarySupports:stats.unquotientedSupportEquivalents,
   peakBDDNodes:stats.peakNodesBeforeGC,
   nontrivialBDDOperations:stats.applyMisses+stats.restrictMisses+stats.notMisses,
   mirrorTransportCalls:stats.mirrorRenamingVisits,
   compileMs:Date.now()-t};
 }catch(e){
  const m=e.detail??solver.stats();
  return {status:'PARTIAL_BUDGET',error:String(e),
   supportsCompiled:m.supportsBuilt,supportOrbits:m.supportsPlanned,
   peakBDDNodes:m.peakNodesBeforeGC,
   nontrivialBDDOperations:m.applyMisses+m.restrictMisses+m.notMisses,
   compileMs:Date.now()-t};
 }
}
export function runStaticVariableOrderQualification(){
 const controls=[],disagreements=[];
 for(const s of SMALL){
  const {core,q}=source(s.game,s.history);
  const entries=[];
  for(const order of ORDERINGS){
   const v=compute(ordered,s.game,q,s.k,order);
   entries.push({order,...v});
  }
  // INDEPENDENT q reference only after BOTH symbolic formulas close.
  const qResult=core.solve(q,{maxStates:200000,
   maxTransitions:800000,deadlineAt:Date.now()+30000}).answer;
  for(const v of entries){
   const a=v.bounds;
   const matches=v.status==='COMPLETE'&&a.exactValue===qResult.value&&
    eq(a.completeBestMoves,qResult.bestMoves)&&
    a.actionIntervals.every((x,i)=>x.column===qResult.actionValues[i][0]&&
     x.lower===qResult.actionValues[i][1]&&x.upper===qResult.actionValues[i][1]);
   v.matchesIndependentQ=matches;
   if(!matches)disagreements.push({game:s.game,history:s.history,order:v.order});
  }
  controls.push({game:s.game,history:s.history,horizon:s.k,reference:qResult,entries});
 }
 const standardGame={width:7,height:6,connect:4},
  {q}=source(standardGame,'44444'),depths=[];
 const baseline=compute(original,standardGame,q,9,null);
 for(const order of ORDERINGS){
  const horizons=[];
  for(const k of [9,10,11]){
   const v=compute(ordered,standardGame,q,k,order);
   horizons.push({depth:k,...v});
   if(k===9&&(!eq(v.bounds?.actionIntervals,baseline.bounds?.actionIntervals)||
      v.bounds?.lower!==baseline.bounds?.lower||
      v.bounds?.upper!==baseline.bounds?.upper))
    disagreements.push({game:'44444',depth:9,order,reason:'unquotiented interval differs'});
  }
  for(let i=1;i<horizons.length;i++){
   const prev=horizons[i-1],next=horizons[i];
   if(prev.status!=='COMPLETE'||next.status!=='COMPLETE')continue;
   if(prev.bounds.lower>next.bounds.lower||next.bounds.upper>prev.bounds.upper)
    disagreements.push({game:'44444',order,reason:'WDL interval failed monotone refinement'});
   for(let j=0;j<prev.bounds.actionIntervals.length;j++){
    const a=prev.bounds.actionIntervals[j],
      b=next.bounds.actionIntervals[j];
    if(a.column!==b.column||a.lower>b.lower||b.upper>a.upper)
     disagreements.push({game:'44444',order,reason:'literal action interval failed refinement'});
   }
  }
  depths.push({order,horizons});
 }
 const freq=depths.find(x=>x.order==='source-residual-frequency').horizons;
 const status=disagreements.length||freq[2].status!=='COMPLETE'?'FAIL':
   depths.some(x=>x.horizons.some(v=>v.status==='PARTIAL_BUDGET'))?
    'PASS_WITH_FIXED_LIMIT_PARTIAL':'PASS';
 return {
  schema:'connect4.reflected-source-BDD.static-variable-order.v0_1',
  date:'2026-10-16',status,
  budget:OPTS,sourceHistory:'44444',standardGame,
  predeclaredOrders:ORDERINGS,controls,
  standard7x6:{baselineRowMajorDepth9:baseline,orderedRuns:depths},
  disagreements,
  candidateUsedSolvedWDLLabels:false,searchGeneratedPolicyInputs:false,
  standard7x6FullWDLAfter44444StillUnresolved:true,
  globalPolynomialSolverClaim:false
 };
}
if(process.argv[1]?.endsWith('reflected-interval-variable-order-control.mjs')){
 const x=runStaticVariableOrderQualification();
 console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
