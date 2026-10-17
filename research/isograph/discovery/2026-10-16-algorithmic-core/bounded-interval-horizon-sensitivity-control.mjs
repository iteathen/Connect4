#!/usr/bin/env node
// Fixed preselected sensitivity tests of source-q anchored bounded WDL
// intervals. No q oracle or game-state search enters symbolic compilation.
// Existing solved evidence may be read only AFTER candidate outputs exist.
import {createBoundedSupportIntervalBDDSolver,OwnerBDDBudgetError}
 from './bounded-support-interval-bdd.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const G={width:7,height:6,connect:4},CASES=[
 {name:'rank20-shallower',source:'43214636342357317661',depths:[1,2,3]},
 {name:'rank10-ninth-ply',source:'4321463634',depths:[9]},
 {name:'canonical-44444-ninth-ply',source:'44444',depths:[9]}
];
const MAX={maxNodes:60000,maxApplyVisits:300000,maxSupports:10000,
 gcEverySupports:64,gcNodeHighWater:40000,maxCompileMs:15000};
const core=createExactQCore(G),physical=physicalRules(G);
export function runSensitivity(){
 const results=[];
 for(const fixed of CASES){
  let s=physical.empty();
  for(const ch of fixed.source){
   const x=physical.move(s,Number(ch)-1);
   if(x.terminal!==undefined)throw Error('preselected source was terminal');
   s=x.child;
  }
  const q=core.fromPhysical(s),rows=[];
  for(const maxDepth of fixed.depths){
   const x=createBoundedSupportIntervalBDDSolver(G,q,{
    ...MAX,maxDepth,deadlineAt:Date.now()+MAX.maxCompileMs});
   const t=Date.now();
   try{
    const c=x.compile(),result=x.decodeSourceRoot(c),stats=x.stats();
    rows.push({depth:maxDepth,status:'COMPILED',
     WDL:result,metrics:{supports:stats.supportsBuilt,
      totalFutureSupportCone:stats.supportsPlanned,
      peakNodes:stats.peakNodesBeforeGC,
      nontrivialOperations:stats.applyMisses+stats.restrictMisses+stats.notMisses,
      sourceRequirementChecks:stats.sourceResidualClauseChecks,
      GCCount:stats.gcCount,cutoffSupports:stats.intervalCutoffSupports},
     elapsedMs:Date.now()-t});
   }catch(e){
    rows.push({depth:maxDepth,status:e instanceof OwnerBDDBudgetError?
       'PARTIAL_BDD_BUDGET':'FAIL',
     error:String(e),budget:e.detail??x.stats(),elapsedMs:Date.now()-t});
   }
  }
  results.push({name:fixed.name,sourceHistory:fixed.source,
   sourceRank:s.rank,support:q.h,
   fullSupportRectangle:q.h.reduce((z,h)=>z*(7-h),1),
   rows});
 }
 return {schema:'connect4.bounded-WDL-horizon-sensitivity.v0_1',
  status:results.some(x=>x.rows.some(r=>r.status==='FAIL'))?'FAIL':
    results.some(x=>x.rows.some(r=>r.status==='PARTIAL_BDD_BUDGET'))?'PARTIAL':'PASS',
  date:'2026-10-16',bounds:MAX,
  results,candidateSearchCalls:0,candidateSolvedValueInputs:0,
  excludesSupportDepth10AtCanonicalAndRank10:true};
}
if(process.argv[1]?.endsWith('bounded-interval-horizon-sensitivity-control.mjs')){
 const x=runSensitivity();console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
