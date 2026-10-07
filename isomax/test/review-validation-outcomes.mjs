// Explicit qualification CLI. Default tests never allocate the full profile.
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildCorpus,inspectHistory,solvePhysical} from './review-validation-physical-reference.mjs';

export async function validateOutcomes({mode='small',count=240,output=null,packageDirectory=null,casesFile=null}={}){
 assert.ok(['small','full12'].includes(mode),'mode small or full12 required');
 assert.ok(mode!=='full12'||typeof globalThis.gc==='function','full12 requires --expose-gc to release each closed one-shot TT before admitting the next allocation');
 const source=packageDirectory?pathToFileURL(resolve(packageDirectory,'index.mjs')):new URL('../index.mjs',import.meta.url),
  api=await import(source),runtime=new URL('./runtime/',source),
  {prepareSupportBasisPlans32}=await import(new URL('addons/rba-connect4-support-basis-plan.mjs',runtime)),
  {prepareSupportCompiledTransitions32}=await import(new URL('addons/rba-connect4-support-compiled-transition.mjs',runtime));
 let geometry=api.prepareConnect4RbaGeometry({columns:7,rows:6});
 // Share expensive immutable prepared geometry across isolated one-shot apps.
 const plans=prepareSupportBasisPlans32(geometry,2**30,true,true),compiled=prepareSupportCompiledTransitions32(geometry,plans,2**29);
 assert.ok(compiled,'admitted compiled geometry required');geometry={...geometry,supportBasisPlans:compiled};
 const generated=casesFile?JSON.parse(readFileSync(casesFile,'utf8')):buildCorpus({count:mode==='full12'?240:count});
 // Full capacity checks span every late rank and its reflection. They are
 // outcome checks; no latency comparison should be inferred from these roots.
 const roots=casesFile?generated:mode==='full12'?Array.from({length:8},(_,rank)=>generated[rank*8+rank]).flatMap(p=>[
  p,{...p,id:p.id+'-mirror',moves:p.moves.map(c=>6-c)}]):generated;
 const records=[],startUtc=new Date().toISOString();
 for(const root of roots){
  globalThis.gc?.();
  const physical=inspectHistory(root.moves); // legality only; no outcome evaluation yet
  assert.ok(root.moves.length>=32&&root.moves.length<42&&physical.winner===0,
   'physical-reference runner requires legal late nonterminal roots with at most10 empty cells');
  const options={geometry,workers:6,cacheIdentity:'partial24',supportBasisPlanBudgetBytes:0,
   supportBasisViews:true,supportClosurePlan:true,supportReflectionPlan:true,timeoutMs:30000,
   ...(mode==='full12'?{memoryProfile:'12'}:{sharedCacheCapacity:256,sharedBankCapacity:128,localCacheCapacity:256})};
  const result=await api.runLazySmpConnect4Rba32(root.moves,options);
  // Independent expected value stays in this parent only, after timed solve.
  const reference=solvePhysical(root.moves),failures=[];
  const check=(ok,claim)=>{if(!ok)failures.push(claim);};
  check(result.status==='EXACT','status EXACT');check(result.rootWdl===reference.wdl,'current-player WDL');
  // Worker result move is a physical column, with reflection undone by worker.
  check(reference.bestMoves.includes(result.move),'physical legal outcome-preserving move');
  check(result.cleanup===true&&result.workersExited===6,'six-worker cleanup');
  check(result.readyWorkers===6&&result.workersUsed===6,'six-worker readiness');
  check(result.cacheIdentity==='partial24'&&result.sharedTtBanks===2,'banked partial24');
  check(result.basisViews===true&&result.compiledTransitions===true&&result.supportTransitionPlanBytes>0,'compiled support views');
  check(result.workerAffinity?.every(w=>w.verified===true),'verified physical affinity');
  check(result.nodeCounts===null,'production accounting remains disabled');
  if(mode==='full12'){
   check(result.sharedTtPayloadBytes===12*2**30,'actual 12 GiB payload');
   check(result.sharedTtBankEntries===2**28,'actual bank boundary');
  }
  const record={id:root.id,moves:root.moves,rank:root.moves.length,mode,expectedWdl:reference.wdl,
   expectedBestMoves:reference.bestMoves,referenceNodes:reference.nodes,rootWdl:result.rootWdl,move:result.move,
   status:result.status,workers:result.workersUsed,readyWorkers:result.readyWorkers,workersExited:result.workersExited,
   cleanup:result.cleanup,cacheIdentity:result.cacheIdentity,basisViews:result.basisViews,compiledTransitions:result.compiledTransitions,
   supportTransitionPlanBytes:result.supportTransitionPlanBytes,sharedTtBanks:result.sharedTtBanks,
   sharedTtBankEntries:result.sharedTtBankEntries,sharedTtPayloadBytes:result.sharedTtPayloadBytes,
   workerAffinity:result.workerAffinity,preparedTiming:result.preparedTiming,expectedEvaluatedAfterSolve:true,failures};
  records.push(record);console.log(JSON.stringify(record));
  if(output)writeFileSync(output,JSON.stringify({startUtc,mode,records,complete:records.length===roots.length},null,2)+'\n');
 }
 const summary={event:'outcome-validation-summary',mode,cases:records.length,sourceCommit:api.profile.sourceCommit,
  ranks:[...new Set(records.map(r=>r.rank))].sort((a,b)=>a-b),wdls:[...new Set(records.map(r=>r.expectedWdl))].sort(),
  failures:records.flatMap(r=>r.failures.map(claim=>({id:r.id,claim}))),startUtc,finishedUtc:new Date().toISOString(),
  reference:'physical array board minimax; no producer imports; evaluated after each solve returns',
  limitation:'late stratified roots; no exhaustive standard7x6 proof or early-search performance claim'};
 if(output)writeFileSync(output,JSON.stringify({summary,records},null,2)+'\n');
 console.log(JSON.stringify(summary));assert.equal(summary.failures.length,0,'outcome or resource validation failed');return summary;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i+=2){
  const key={'--mode':'mode','--count':'count','--output':'output','--package':'packageDirectory','--cases':'casesFile'}[args[i]];
  assert.ok(key&&args[i+1]!==undefined,'unknown or incomplete validation argument');options[key]=key==='count'?Number(args[i+1]):args[i+1];
 }
 await validateOutcomes(options);
}
