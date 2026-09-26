import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const four=read('workers-4-full.json'),eight=read('../20260926-worker-scaling/workers-8.json');
const repeats=[four.cases[0],read('workers-4-2.json').cases[0],read('workers-4-3.json').cases[0]];
assert.equal(four.cases.length,4);assert.equal(four.jsminsys,eight.jsminsys);assert.equal(four.solverSourceSha,eight.sha);
assert.equal(four.sourceDirty,false);
for(const k of ['timeoutMs','sharedCacheCapacity','localCacheCapacity','sharedSampleMask','cpcFrontierResponse','cpcProjectedAdvisory'])assert.equal(four.config[k],eight.config[k]);
for(const c of [...four.cases,...repeats]){
  assert.equal(c.cleanup,true);assert.equal(c.workersExited,4);assert.equal(c.countsValid,true);
  assert.equal(c.benchmarkNodeCounts.length,4);assert.equal(c.totalNodesVisited,c.benchmarkNodeCounts.reduce((a,b)=>a+b,0));
  assert.equal(c.errors.length,0);
  if(c.status==='EXACT'){assert.equal(c.oracleMatched,true);assert.equal(c.winnerCountMatches,true);}
  else{assert.equal(c.status,'TIMEOUT');assert.equal(c.errorCode,102);assert.equal(c.rootWdl,null);assert.ok(c.wallMs>=120000&&c.wallMs<125000);}
}
for(const c of repeats){assert.equal(c.status,'EXACT');assert.equal(c.rootWdl,1);assert.equal(c.move,3);}
const hash=name=>createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex');
const hook='../20260926-worker-scaling/node-counter-hook.mjs';
const oldManifest=read('../20260926-worker-scaling/artifact-hashes.json');
assert.equal(hash(hook),oldManifest.find(x=>x.name==='node-counter-hook.mjs').sha256);
const total=r=>{const nodes=r.cases.reduce((a,c)=>a+c.totalNodesVisited,0),wallMs=r.cases.reduce((a,c)=>a+c.wallMs,0),cycles=r.cases.reduce((a,c)=>a+BigInt(c.cpuCycles),0n);return {nodes,wallMs,cycles:cycles.toString(),nps:nodes*1000/wallMs,cpn:Number(cycles)/nodes};};
const totals4=total(four),totals8=total(eight),median=[...repeats].sort((a,b)=>a.wallMs-b.wallMs)[1].wallMs;
const fmt=n=>n.toLocaleString('en-US'),label=c=>c.input||'Empty board';
const rows=four.cases.map((c,i)=>`| ${label(c)} | ${c.status==='EXACT'?'EXACT +1':'TIMEOUT'} | ${(c.wallMs/1000).toFixed(3)} | ${fmt(c.totalNodesVisited)} | ${(c.nodesPerSecond/1e6).toFixed(3)} | ${c.cyclesPerNode.toFixed(1)} |`).join('\n');
const comparisons=four.cases.map((c,i)=>{const e=eight.cases[i];return `| ${label(c)} | ${(c.nodesPerSecond/1e6).toFixed(3)} | ${(e.nodesPerSecond/1e6).toFixed(3)} | ${(e.nodesPerSecond/c.nodesPerSecond).toFixed(3)}x | ${c.cyclesPerNode.toFixed(1)} | ${e.cyclesPerNode.toFixed(1)} | +${((e.cyclesPerNode/c.cyclesPerNode-1)*100).toFixed(1)}% |`;}).join('\n');
const repeatRows=repeats.map((c,i)=>`| ${i+1} | ${(c.wallMs/1000).toFixed(4)} | ${fmt(c.totalNodesVisited)} | ${(Number(c.cpuCycles)/1e9).toFixed(3)} | ${c.cyclesPerNode.toFixed(1)} | ${c.winner} | ${fmt(c.winnerMetrics.nodes)} |`).join('\n');
const perWorker=four.cases.map(c=>`| ${label(c)} | ${c.benchmarkNodeCounts.map(fmt).join(' | ')} |`).join('\n');
const text=`# Four-worker follow-up with matched node instrumentation

Four workers solved the first Fhourstones input and reached clean 120-second timeouts on the other three. All three independent solved-control samples returned WDL +1, move 3, with clean teardown. Median control wall time was ${(median/1000).toFixed(4)} seconds.

## Provenance and controlled settings

- Execution checkout: ${four.sha} (publication-only descendant of tested solver source).
- Solver source: ${four.solverSourceSha}; no production-code change since the prior eight-worker run.
- JSMinSys: ${four.jsminsys}.
- Host: ${four.cpu}, ${four.logicalCpus} logical CPUs; Node ${four.node}; V8 ${four.v8}; Windows x64.
- Full run: ${four.started} to ${four.finished}.
- Identical counter preload: ../20260926-worker-scaling/node-counter-hook.mjs, SHA-256 ${hash(hook)}.
- Identical cache capacities 65,536 local/shared, sharedSampleMask 7, CPC-only mode, optional frontier-response/projected-advisory disabled, unchanged 120,000ms timeout.

The prior eight-worker run and this run use the same benchmark-only redirection of existing node counters into single-writer shared slots. Final counts are read after workers join. This removes the previous instrumentation mismatch; it does not measure instrumentation overhead or establish a randomized paired scaling qualification. The eight-worker data remain one earlier sample per input.

## Four-worker full run

| Input | Result | Wall seconds | Total node visits | Million visits/sec | CPU cycles/visit |
|---|---|---:|---:|---:|---:|
${rows}

Full-run totals, excluding the two extra controls: ${fmt(totals4.nodes)} visits, ${(totals4.wallMs/1000).toFixed(3)} wall seconds, ${totals4.cycles} process cycles. Weighted averages: ${(totals4.nps/1e6).toFixed(3)} million visits/sec and ${totals4.cpn.toFixed(1)} cycles/visit.

## Matched-instrumentation comparison with earlier eight-worker run

| Input | Four-worker M visits/sec | Eight-worker M visits/sec | Throughput ratio | Four-worker cycles/visit | Eight-worker cycles/visit | Eight-worker cycle premium |
|---|---:|---:|---:|---:|---:|---:|
${comparisons}

Across the full workload, eight workers delivered ${(totals8.nps/totals4.nps).toFixed(3)}x aggregate visit throughput at ${(Number(totals8.cycles)/Number(totals4.cycles)).toFixed(3)}x process cycles. Its weighted cycles/visit were ${((totals8.cpn/totals4.cpn-1)*100).toFixed(1)}% higher. Both counts solved the same one input; none of the hard/empty timeouts measure time remaining to a proof.

Eight-worker first-input wall time was ${(eight.cases[0].wallMs/1000).toFixed(4)} seconds, versus the four-worker median ${(median/1000).toFixed(4)} seconds. The earlier eight-worker observation is ${((eight.cases[0].wallMs/median-1)*100).toFixed(1)}% longer and used ${(Number(eight.cases[0].cpuCycles)/Number(repeats[1].cpuCycles)).toFixed(3)}x the cycles of the median-wall four-worker sample. This is observed behavior, not a statistically established universal worker-count preference.

## Three independent solved-control samples

Sample 1 is the first input of the full run. Samples 2 and 3 ran after it in separate fresh Node processes. Each used fresh worker sessions/caches; no warmup and no retry of a failure. Scheduling/cache interaction can change which worker wins and total loser work.

| Sample | Wall seconds | All-worker visits | Billion cycles | Cycles/visit | Winner | Winner visits |
|---|---:|---:|---:|---:|---:|---:|
${repeatRows}

## Per-worker full-run visits

| Input | Worker 0 | Worker 1 | Worker 2 | Worker 3 |
|---|---:|---:|---:|---:|
${perWorker}

## Interpretation and limits

- Four workers were more economical in measured cycles per visit on every case. Eight provided more aggregate visits per second but no additional completed solution within the cap.
- These are all-worker visits, including repetitions, cache-hit visits, and forced-transit states counted by JSMinSys. They are not unique states or Fhourstones engine node counts. Higher visits/sec is not proof of proportionally faster solving.
- The counters do not attribute the cycle premium to processor placement, cache traffic, synchronization, runtime helpers, or changed node mix. Expensive repeated-q overlap and kernel-stage profiling remain separate investigations; this run does not claim those measurements.
- QueryProcessCycleTime measures cycles across the whole process, including host/runtime work. Cycles/visit uses the all-worker denominator; visits/sec uses full-operation wall time. No GHz-based estimates.
- Counter storage can affect generated code. Both compared instrumented runs share that change. The earlier uninstrumented four-worker sample is retained as separate historical evidence, not substituted into this comparison.
- Only one solved input was repeated, and the runs were not randomized/interleaved with fresh eight-worker repetitions. No confidence interval or general scaling claim is established.
- No new solve algorithm, production-file modification, bound-sharing policy, timeout increase, or full NEES qualification was performed.

## Reproduction and evidence

From the checkout with Node 26.7.0:

\`\`\`powershell
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-four-worker-controlled/run.mjs full
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-four-worker-controlled/run.mjs 2
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-four-worker-controlled/run.mjs 3
\`\`\`

Existing evidence cannot be overwritten by the driver. Use a fresh directory at the same depth for a future run. workers-4-full.json/jsonl contain the full run and 15-second progress samples; workers-4-2.json/jsonl and workers-4-3.json/jsonl contain the extra controls. Prior eight-worker records remain under ../20260926-worker-scaling/.

Validation: all six case records have four-worker cleanup, valid per-worker sums, no unexpected errors, and valid winner/oracle checks where exact. The measurement hook matches the earlier published hash. Production code and dependency revision match the prior source.
`;
writeFileSync(new URL('REPORT.md',import.meta.url),text);
const names=['run.mjs','summarize.mjs','REPORT.md','workers-4-full.json','workers-4-full.jsonl','workers-4-2.json','workers-4-2.jsonl','workers-4-3.json','workers-4-3.jsonl',hook];
writeFileSync(new URL('artifact-hashes.json',import.meta.url),JSON.stringify(names.map(name=>({name,sha256:hash(name)})),null,2)+'\n');
console.log(JSON.stringify({validation:'PASS',totals4,totals8,medianWallMs:median,report:new URL('REPORT.md',import.meta.url).pathname},null,2));
