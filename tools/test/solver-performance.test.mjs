import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { captureProcess } from '../solver-performance.mjs';
import { summarizeBsfpRanks } from '../bsfp-rank-progress.mjs';
const root=path.resolve(import.meta.dirname,'../..');
test('BSFP rank report separates completed layers from active work and observed times',()=>{
  const log=[{kind:'compact-hybrid-progress',activeRank:37,completedRanks:5,elapsedMs:12000},
    {kind:'compact-hybrid-progress',activeRank:36,completedRanks:6,elapsedMs:52000},
    {kind:'compact-hybrid-progress',activeRank:36,completedRanks:6,elapsedMs:107000}].map(JSON.stringify).join('\n');
  const r=summarizeBsfpRanks(log);
  assert.deepEqual(r.completedRanks,[42,41,40,39,38,37]);
  assert.equal(r.activeRank,36);assert.equal(r.emptyCells,6);assert.equal(r.rootCompleted,false);
  assert.equal(r.observations[1].firstObservedMs,52000);assert.equal(r.observations[1].lastObservedMs,107000);
  const complete=summarizeBsfpRanks(log,{completed:true});
  assert.equal(complete.completedRanks.at(-1),0);assert.equal(complete.activeRank,null);
});
test('absent native rank evidence stays unknown',()=>{
  assert.equal(summarizeBsfpRanks('warning\n'+JSON.stringify({kind:'tensor-ab',outcome:'pass'})),null);
});
const fixture=async(t,args,timeoutMs)=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'c4-performance-'));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  return {directory,...await captureProcess({command:process.execPath,args,cwd:root,directory,timeoutMs})};
};
test('supervisor preserves progress through timeout and waits for child exit',async t=>{
  const r=await fixture(t,['-e',`console.log(JSON.stringify({kind:'isomax-performance',metrics:{nodes:17}})); setInterval(()=>{},1000)`],500);
  assert.equal(r.timedOut,true);assert.equal(r.lastRecord.metrics.nodes,17);
  assert.equal(r.cleanup,'child-process-exited');
  assert.match(fs.readFileSync(path.join(r.directory,'stdout.log'),'utf8'),/17/);
});
test('supervisor preserves nonzero exit and error text',async t=>{
  const r=await fixture(t,['-e',`console.error('controlled failure');process.exit(7)`],2000);
  assert.equal(r.exitCode,7);assert.equal(r.timedOut,false);
  assert.match(fs.readFileSync(path.join(r.directory,'stderr.log'),'utf8'),/controlled failure/);
});
test('observed IsoMax executes the native path and reports completed root WDL',
  {skip:fs.existsSync(path.join(root,'components/isometric/index.mjs'))?false:'IsoMax source belongs to solver/isometric'},async t=>{
  const r=await fixture(t,['tools/isomax-performance-child.mjs','3,0,3,0,3,0,3'],5000);
  assert.equal(r.exitCode,0);assert.equal(r.lastRecord.phase,'complete');assert.equal(r.lastRecord.rootWdl,1);
  assert.equal(r.lastRecord.metrics.nodes,1);assert.ok(r.lastRecord.memory.rss>0);
});
