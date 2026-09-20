// Qualification-only manager variants. The production worker/kernel is unchanged.
// Source substitutions are exact/admission-checked; retain source hashes and
// never infer machine timing from the instrumented survey variant.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { captureProcess } from '../../tools/solver-performance.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const roots = ['717657616532237625','466537327657277224','616767454664457417'];
const managerUrl = new URL('../../components/isometric/execution/branch-manager.mjs', import.meta.url);
const executorUrl = new URL('../../research/semantic-quotient/state-identity-unification/src/quotient-search-worker-executor.mjs', import.meta.url);
const emit = x => fs.writeSync(1, JSON.stringify(x) + '\n');
function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, 'candidate source admission drift: ' + before);
  return source.replace(before, after);
}
function asModule(source, url) {
  source = source.replace(/from (['"])(\.[^'"]+)\1/g, (_, q, spec) => 'from ' + JSON.stringify(new URL(spec, url).href));
  source = source.replaceAll('import.meta.url', JSON.stringify(url.href));
  return 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
}
export async function loadManagerCandidate(variant) {
  // Git checkout line endings are not candidate semantics. Admit the same
  // exact substitutions on Windows CRLF and Unix LF checkouts.
  let source = fs.readFileSync(managerUrl, 'utf8').replaceAll('\r\n', '\n');
  const sourceHash = createHash('sha256').update(source).digest('hex');
  if (variant === 'fanin') {
    // Rank admission, not merely submit(priority): with W outstanding the
    // executor often immediately dispatches and has no competing queue item.
    source = replaceOnce(source, 'for(const node of supply.leaves){',
      'supply.leaves.sort((a,b)=>b.parents.size-a.parents.size);\n          for(const node of supply.leaves){');
  } else if (variant === 'rank2' || variant === 'rank3') {
    const depth = Number(variant.at(-1));
    source = replaceOnce(source, 'supply.leaves.length+pending.size<outstandingLimit && supply.leaves.length',
      `(supply.leaves.length+pending.size<outstandingLimit || supply.leaves.some(n=>n.moves.length<moves.length+${depth})) && supply.leaves.length`);
    source = replaceOnce(source, 'expand(supply.leaves[0]);answer=rootAnswer();',
      `expand(supply.leaves.find(n=>n.moves.length<moves.length+${depth})??supply.leaves[0]);answer=rootAnswer();`);
  } else if (variant === 'affinity') {
    source = replaceOnce(source, 'const owner=build(frame.moves);',
      'const owner=build(frame.moves);owner.preferredWorkerId=message.workerId;');
    source = replaceOnce(source, 'node.edges.push({column,node:child});',
      'if(child.preferredWorkerId===undefined)child.preferredWorkerId=node.preferredWorkerId;\n        node.edges.push({column,node:child});');
    source = replaceOnce(source, "rootPly:moves.length,nodeBudget:this.taskNodes,abort:abortBuffer,needed:neededBuffer}",
      'preferredWorkerId:node.preferredWorkerId,rootPly:moves.length,nodeBudget:this.taskNodes,abort:abortBuffer,needed:neededBuffer}');
    let executor = fs.readFileSync(executorUrl, 'utf8').replaceAll('\r\n', '\n');
    executor = replaceOnce(executor, 'const slot = idle.shift();\n      try { dispatchAuthoritative',
      'const preferred = idle.findIndex(s=>s.workerIndex===queue[0].message.preferredWorkerId);\n      const slot = idle.splice(preferred<0?0:preferred,1)[0];\n      try { dispatchAuthoritative');
    source = replaceOnce(source, "'../../../research/semantic-quotient/state-identity-unification/src/quotient-search-worker-executor.mjs'",
      JSON.stringify(asModule(executor, executorUrl)));
  } else if (variant === 'survey') {
    source = replaceOnce(source, 'const outstandingLimit=this.workerCount+this.readyReserve;',
      `const observation={tasks:[],ready:[],forced:[],firstReadyAt:new Map()};
    const outstandingLimit=this.workerCount+this.readyReserve;`);
    source = replaceOnce(source, 'parents:new Set(),pending:false,needed:null,directMove:undefined',
      'parents:new Set(),pending:false,needed:null,directMove:undefined,support:state.supportCode');
    source = replaceOnce(source, 'metrics.readySamples++;', `
          const fibers=new Map();let multiParent=0,maxParents=0;
          for(const n of supply.leaves){fibers.set(n.support,(fibers.get(n.support)??0)+1);
            multiParent+=Number(n.parents.size>1);maxParents=Math.max(maxParents,n.parents.size);
            if(!observation.firstReadyAt.has(n.id))observation.firstReadyAt.set(n.id,performance.now());}
          observation.ready.push({leaves:supply.leaves.length,multiParent,maxParents,
            maxFiber:Math.max(0,...fibers.values()),fiberPairs:[...fibers.values()].reduce((s,n)=>s+n*(n-1)/2,0)});
          metrics.readySamples++;`);
    source = replaceOnce(source, 'const submit=node=>{', `const submit=node=>{
      const inspected=solver.createState(node.moves);let branches=0;
      for(let c=0;c<7;c++)branches+=Number(inspected.canPlay(c));
      const feature={jobId:node.id,rank:inspected.ply,support:inspected.supportCode,branches,
        parents:node.parents.size,ownWidth:inspected.pool.termIds(inspected.sideToMove?inspected.p1Class:inspected.p0Class).length,
        opponentWidth:inspected.pool.termIds(inspected.sideToMove?inspected.p0Class:inspected.p1Class).length};
      let chain=0,code=deriveNativeFrontierConsequence(inspected);
      while(code?.kind===CONCLUSION_FORCED_MOVE){inspected.applyUnchecked(code.cell%7);chain++;code=deriveNativeFrontierConsequence(inspected);}
      feature.forcedChain=chain;observation.tasks.push(feature);`);
    source = replaceOnce(source, "if(message.jobId!==node.id)throw new Error('worker result has wrong manager job identity');",
      `if(message.jobId!==node.id)throw new Error('worker result has wrong manager job identity');
          Object.assign(feature,{kind:message.kind,nodes:message.nodes,executionMs:message.executionMs,
            metrics:message.metrics,workerId:message.workerId,localEntriesBefore:message.localEntriesBefore,
            readyDelayMs:performance.now()-(observation.firstReadyAt.get(node.id)??performance.now())});`);
    source = replaceOnce(source, 'return {...answer,...this.lastStats,resultReadyMs,cleanup:',
      'return {...answer,...this.lastStats,resultReadyMs,observation:{tasks:observation.tasks,ready:observation.ready},cleanup:');
  } else assert.equal(variant, 'control');
  return { ...(await import(asModule(source, managerUrl))), sourceHash,
    candidateHash: createHash('sha256').update(source).digest('hex') };
}

if (process.argv[2] === 'child') {
  const variant = process.argv[3], workers = Number(process.argv[4] ?? 4);
  const { IsoMaxBranchManager, sourceHash, candidateHash } = await loadManagerCandidate(variant);
  for (const sequence of roots) {
    const manager = new IsoMaxBranchManager({ workers });
    const start = performance.now();let result;
    try { result = await manager.solveMoves(Array.from(sequence,c=>Number(c)-1),{ timeoutMs:30000 }); }
    finally { await manager.close(); }
    emit({ sequence,variant,workers,sourceHash,candidateHash,wallMs:performance.now()-start,
      maxRssBytes:process.resourceUsage().maxRSS*1024,...result });
  }
} else if (process.argv[2] === 'run') {
  const output=path.resolve(process.argv[3]),variants=process.argv[4].split(','),workers=Number(process.argv[5]??4);
  const samples=Number(process.argv[6]??3),git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
  const report={source:git('rev-parse','HEAD'),node:process.version,v8:process.versions.v8,cpu:os.cpus()[0]?.model,
    roots,variants,workers,samples,instrumented:variants.includes('survey'),runs:[]};
  fs.mkdirSync(output,{recursive:true});
  const save=()=>fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(report,null,2)+'\n',{flush:true});
  save();let decisions;
  for(let sample=0;sample<samples;sample++)for(const variant of sample%2?[...variants].reverse():variants){
    const directory=path.join(output,sample+'-'+variant);
    const captured=await captureProcess({command:process.execPath,args:['--max-old-space-size=4096',fileURLToPath(import.meta.url),'child',variant,String(workers)],cwd:root,directory,timeoutMs:120000});
    const records=fs.readFileSync(path.join(directory,'stdout.log'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    report.runs.push({sample,variant,...captured,records});save();
    assert.equal(captured.exitCode,0);assert.equal(captured.timedOut,false);assert.equal(records.length,roots.length);
    const result=records.map(r=>[r.sequence,r.value,r.move]);decisions??=result;assert.deepEqual(result,decisions);
    emit({sample,variant,wallMs:records.reduce((s,r)=>s+r.wallMs,0),nodes:records.reduce((s,r)=>s+r.metrics.nodes,0)});
  }
}
