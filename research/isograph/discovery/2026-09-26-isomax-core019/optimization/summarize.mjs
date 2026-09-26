// Cold evidence reducer; clean-* is the predeclared, uncontaminated batch.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const roots = {'45461667':3,'13333111271421':2,'13333111444444':2};
const revisions = {a:'04d37498607ace16dae33c79462ddfe1503c8a0d',b:'393b8a1ac98d13ece5109246620b072ee92878dd'};
const hashes = {a:'1c8aeade55b67410c81757cced4ba3086b454810b6ec433c7250590becf68660',b:'97ba78c84994c332d27788710e520434e0e593ed9bd81bc6edb510bd227d1cda'};
const mean = xs => xs.reduce((a,b)=>a+b,0)/xs.length;
const delta = (a,b) => 100*(b/a-1);
const rows=[];
for(const [input,move] of Object.entries(roots)) {
  const samples={a:[],b:[]};
  const blocks=[];
  for(let block=0;block<3;block++) {
    const pair={a:[],b:[]};
    for(const [i,variant] of ['a','b','b','a'].entries()) {
      const file=`clean-${input}-${block}-${i}-${variant}.json`;
      const r=JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
      assert.equal(r.sha,revisions[variant]); assert.equal(r.coordinateSha256,hashes[variant]);
      assert.equal(r.input,input); assert.equal(r.workers,4); assert.equal(r.timeoutMs,5000);
      assert.equal(r.node,'v26.7.0'); assert.equal(r.v8,'14.6.202.34-node.28');
      assert.equal(r.result.status,'EXACT'); assert.equal(r.result.rootWdl,1);
      assert.equal(r.result.move,move); assert.equal(r.result.cleanup,true);
      assert.equal(r.result.workersExited,4); assert.equal(r.result.errors.length,0);
      assert.ok(Number(r.cycles)>0); assert.ok(r.wallMs>0 && r.wallMs<5000);
      samples[variant].push(r); pair[variant].push(r);
    }
    blocks.push({block,wallChangePercent:delta(mean(pair.a.map(x=>x.wallMs)),mean(pair.b.map(x=>x.wallMs))),
      cyclesChangePercent:delta(mean(pair.a.map(x=>Number(x.cycles))),mean(pair.b.map(x=>Number(x.cycles))))});
  }
  const aggregate=xs=>({samples:xs.length,meanWallMs:mean(xs.map(x=>x.wallMs)),meanProcessCycles:mean(xs.map(x=>Number(x.cycles))),winnerNodes:xs.map(x=>x.result.winnerMetrics.nodes)});
  const baseline=aggregate(samples.a),candidate=aggregate(samples.b);
  rows.push({input,baseline,candidate,wallChangePercent:delta(baseline.meanWallMs,candidate.meanWallMs),
    cyclesChangePercent:delta(baseline.meanProcessCycles,candidate.meanProcessCycles),blocks});
}
console.log(JSON.stringify({sampleCount:36,allExpectedResults:true,revisions,coordinateSha256:hashes,
  scope:'Four-worker short solved controls; cycles sum all process threads. Winner nodes are NOT total work.',
  dirtyStatusDisposition:'Candidate raw snapshots report stale CRLF index-stat dirtiness. See C1_RESULTS.md and source-byte verification; evidence was not rewritten.',rows},null,2));
