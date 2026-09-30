import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createFreshOracle} from './fresh-oracle-adapter.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const read=f=>fs.readFileSync(path.join(here,f),'utf8').replace(/\r\n/g,'\n');
test('phase-1 inherited budget and source adaptation identities remain exact',()=>{
  const w=JSON.parse(read('FRESH_OOO_WARRANT.json')),m=JSON.parse(read('FRESH_PHASE2_ADAPTATION.json'));
  assert.equal(w.inheritedCampaign.elapsedMs,28794);assert.equal(w.inheritedCampaign.remainingAtFreezeMs,2671206);assert.equal(w.caps.campaignWallMs,2700000);
  assert.equal(w.inheritedCampaign.ledgers.reduce((n,l)=>n+l.elapsedMs,0),w.inheritedCampaign.elapsedMs);
  for(const item of w.inheritedCampaign.ledgers)assert.equal(createHash('sha256').update(fs.readFileSync(path.resolve(here,item.relativePath),'utf8').replace(/\r\n/g,'\n')).digest('hex'),item.sha256Utf8Lf);
  for(const item of m.files)assert.equal(createHash('sha256').update(read(item.file)).digest('hex'),item.phase2Sha256Utf8Lf);
  const runner=read('fresh-run.mjs');assert.ok(runner.includes('const campaignUsed=inheritedElapsed+w.candidateOrder.reduce('));assert.ok(runner.includes('w.caps.campaignWallMs-campaignUsed'));
});
test('adapted source has readable stack identity without enumeration or scalar access',()=>{
  const oracle=createFreshOracle(4,6,3,()=>{throw new Error('TEST_GUARD_BEFORE_STATE_DECODE');});
  let caught;try{oracle.row(0);}catch(error){caught=error;}
  assert.equal(caught?.message,'TEST_GUARD_BEFORE_STATE_DECODE');assert.ok(caught.stack.includes('connect4-fresh-phase2-oracle.mjs'));
});
test('replay refuses missing structural snapshot commit before enumeration or solve',()=>{
  const target=path.resolve(here,'fresh-4x6-k3');assert.ok(target.startsWith(here+path.sep));assert.equal(fs.existsSync(target),false,'Do not run this test over an existing experiment');
  try{
    const run=spawnSync(process.execPath,[path.join(here,'fresh-worker.mjs'),'replay','4x6-k3'],{env:{...process.env,FRESH_SUPERVISED:'1'},encoding:'utf8',timeout:10000});
    assert.notEqual(run.status,0);assert.match(run.stderr,/Replay requires reviewed structural snapshot commit SHA/);
    const files=fs.readdirSync(target);assert.ok(files.every(f=>f==='fresh-resource-ledger.json'));
    const record=JSON.parse(fs.readFileSync(path.join(target,'fresh-resource-ledger.json')));assert.equal(record.stage,'replay');assert.equal(record.status,'FAILED');
  }finally{
    // This uniquely named fresh directory was verified absent before the test.
    assert.equal(path.dirname(target),here);if(fs.existsSync(target))fs.rmSync(target,{recursive:true});
  }
});
