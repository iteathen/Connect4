import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const eight=read('workers-8.json'),four=read('workers-4.json');
assert.equal(eight.cases.length,4);assert.equal(eight.config.workers,8);
assert.equal(eight.sha,four.sha);assert.equal(eight.jsminsys,four.jsminsys);
for(const c of eight.cases){
  assert.equal(c.cleanup,true);assert.equal(c.workersExited,8);assert.equal(c.countsValid,true);
  assert.equal(c.totalNodesVisited,c.benchmarkNodeCounts.reduce((a,b)=>a+b,0));
  assert.ok(c.errors.length===0);assert.ok(['EXACT','TIMEOUT'].includes(c.status));
  if(c.status==='EXACT'){assert.equal(c.oracleMatched,true);assert.equal(c.winnerCountMatches,true);}
  else{assert.equal(c.errorCode,102);assert.equal(c.rootWdl,null);assert.ok(c.wallMs>=120000&&c.wallMs<125000);}
}
const sum=k=>eight.cases.reduce((a,c)=>a+c[k],0);
const cycles=eight.cases.reduce((a,c)=>a+BigInt(c.cpuCycles),0n);
const total={nodes:sum('totalNodesVisited'),wallMs:sum('wallMs'),cpuMs:sum('cpuMs'),cpuCycles:cycles.toString()};
total.cyclesPerNode=Number(cycles)/total.nodes;total.nodesPerSecond=total.nodes*1000/total.wallMs;
const fmt=n=>n.toLocaleString('en-US'),label=c=>c.input||'Empty board';
const rows=eight.cases.map(c=>`| ${label(c)} | ${c.status==='EXACT'?'EXACT +1':'TIMEOUT'} | ${(c.wallMs/1000).toFixed(3)} | ${fmt(c.totalNodesVisited)} | ${(c.nodesPerSecond/1e6).toFixed(3)} | ${c.cyclesPerNode.toFixed(1)} | ${(Number(c.cpuCycles)/1e9).toFixed(3)} |`).join('\n');
const comparison=eight.cases.map((c,i)=>`| ${label(c)} | ${four.cases[i].status} | ${(four.cases[i].wallMs/1000).toFixed(3)} | ${c.status} | ${(c.wallMs/1000).toFixed(3)} |`).join('\n');
const perWorker=eight.cases.map(c=>`| ${label(c)} | ${c.benchmarkNodeCounts.map(fmt).join(' | ')} |`).join('\n');
const hashes=['run.mjs','run-eight.mjs','node-counter-hook.mjs','workers-4.json','workers-4.jsonl','workers-5.json','workers-5.jsonl','workers-8.json','workers-8.jsonl'].map(name=>({name,sha256:createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex')}));
writeFileSync(new URL('artifact-hashes.json',import.meta.url),JSON.stringify(hashes,null,2)+'\n');
const text=`# IsoMax local Fhourstones workload, four and eight workers

Eight workers solved 1/4 inputs; the other three reached the unchanged 120-second deadline. Every case exited all workers cleanly. This is an incomplete bounded benchmark, not a completed Fhourstones score.

- Connect4: ${eight.sha}
- JSMinSys: ${eight.jsminsys}
- CPU: ${eight.cpu}; ${eight.logicalCpus} logical CPUs
- Node: ${eight.node}; V8: ${eight.v8}; Windows x64
- Eight-worker run: ${eight.started} to ${eight.finished}
- Identical local/shared cache capacity: 65,536 entries each; shared sample mask 7; CPC frontier-response/projected-advisory disabled.
- Production Lazy SMP host and worker algorithms; benchmark-only counter storage instrumentation described below. No checked-in solver/library file changed.

## Eight-worker results

| Input | Result | Wall seconds | Total node visits | Million visits/sec | CPU cycles/visit | Total billion CPU cycles |
|---|---|---:|---:|---:|---:|---:|
${rows}

Total: **${fmt(total.nodes)} visits**, **${(total.wallMs/1000).toFixed(3)} wall seconds**, **${(total.cpuMs/1000).toFixed(3)} CPU seconds**, **${cycles} process cycles**. Weighted aggregate: **${(total.nodesPerSecond/1e6).toFixed(3)} million visits/sec**, **${total.cyclesPerNode.toFixed(1)} cycles/visit**.

The solved first input returned P0 WDL +1 and zero-based move 3 (human column 4), matching the repository's expected oracle. Its winner visited 716,450 nodes. Timeout cases produced no WDL. Error 102 is the scheduled deadline, not an unexpected runtime exception.

Peak observed process RSS: ${(Math.max(...eight.cases.map(c=>c.peakObservedRssBytes))/1048576).toFixed(2)} MiB. RSS sampled every 15 seconds and at case endpoints, so this is not an exact peak allocation measurement.

## Earlier four-worker comparison

The four-worker run used the uninstrumented production implementation. Its losing-worker and timeout node counters are unavailable. Do not infer their counts or divide process cycles by winner-only nodes. Eight-worker counter instrumentation can affect timing; this is not a controlled scaling A/B, and each configuration has only one sample per input.

| Input | Four-worker result | Four-worker seconds | Eight-worker result | Eight-worker seconds |
|---|---|---:|---|---:|
${comparison}

The five-worker run was stopped at the owner's request during the third input. Its partial evidence is retained and excluded from this comparison. One and three workers were not benchmarked.

## Measurement and scope

The Node preload hook redirects the library's existing node increments to one single-writer Float64 counter per worker, padded to separate 64-byte slots. It adds no extra per-node counter increment, atomic operation, logging, allocation, or callback. Final counters are read only after the library joins all workers. This changes counter storage/access and may affect generated code; overhead has not been separately qualified. It is not a claim of unchanged performance or full NEES certification.

Total visits sum all workers, including repeated/transposed states and deterministic forced-transit states counted by JSMinSys. These are not unique positions and do not use Fhourstones engine node accounting. Root handling and terminal cofactor returns follow the library's existing node-count semantics; they are not redefined as extra node visits.

CPU cycles are measured by Windows QueryProcessCycleTime, summed over all process threads, including runtime helpers. They are not estimated from GHz. Cycles/visit divides those cycles by all-worker visits. Visits/sec divides all-worker visits by whole-operation wall seconds, including ingress, startup, search, cleanup, and cold reporting. No nominal clock-rate conversion.

The eight-worker ordering uses index modulo seven columns, so workers 0 and 7 have the same configured order offset. This is the existing library policy, not a benchmark optimization.

## Per-worker visits

| Input | Worker 0 | Worker 1 | Worker 2 | Worker 3 | Worker 4 | Worker 5 | Worker 6 | Worker 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${perWorker}

## Validation and reproduction

Before the full run, instrumented eight-worker late-position, reflected-position, and terminal-position checks matched the independent physical oracle; winner counters matched reported winner metrics. A separate 100ms empty-root timeout check retained all eight counters and joined all workers. Full benchmark ran in a fresh Node process after those checks. No full-benchmark warmup, retry, or timeout increase.

From this checkout, use Node 26.7.0:

\`\`\`powershell
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-worker-scaling/run-eight.mjs
\`\`\`

The driver refuses to overwrite existing eight-worker evidence. For a future rerun, copy the harness files into a new qualification directory at the same depth. The original four-worker command was node --experimental-ffi docs/qualification/20260926-worker-scaling/run.mjs 4.

Raw per-case outcomes are in workers-8.json; periodic samples in workers-8.jsonl; earlier evidence in workers-4.json/jsonl and the explicitly stopped workers-5.json/jsonl. artifact-hashes.json pins these files and the measurement harnesses. Historical evidence is not overwritten.
`;
writeFileSync(new URL('REPORT.md',import.meta.url),text);
console.log(JSON.stringify({validation:'PASS',total,cases:eight.cases.map(c=>({input:label(c),status:c.status,wallMs:c.wallMs,nodes:c.totalNodesVisited,nodesPerSecond:c.nodesPerSecond,cyclesPerNode:c.cyclesPerNode})),report:new URL('REPORT.md',import.meta.url).pathname},null,2));
