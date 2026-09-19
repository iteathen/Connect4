import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { captureProcess } from '../solver-performance.mjs';
const root=path.resolve(import.meta.dirname,'../..');
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
test('observed IsoMax executes the native path and reports completed root WDL',async t=>{
  const r=await fixture(t,['tools/isomax-performance-child.mjs','3,0,3,0,3,0,3'],5000);
  assert.equal(r.exitCode,0);assert.equal(r.lastRecord.phase,'complete');assert.equal(r.lastRecord.rootWdl,1);
  assert.equal(r.lastRecord.metrics.nodes,1);assert.ok(r.lastRecord.memory.rss>0);
});
