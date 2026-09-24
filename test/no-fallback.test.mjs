import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve7x6} from '../components/isometric/solve.mjs';

test('unresolved IsoMax positions continue through shared CPC-first q traversal',async()=>{
  const moves=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
  const r=await solve7x6(moves,{workers:2,timeoutMs:5000});
  assert.equal(r.status,'EXACT',JSON.stringify(r));
  assert.equal(r.rootWdl,1);
  assert.equal(r.cleanup,true);
  assert.ok(r.metrics.evaluations>0);
  assert.ok(r.metrics.branches>0);
  assert.ok(r.metrics.claims>0);
  assert.equal('fallbackNodes' in r.metrics,false);
  assert.equal('fallbackSelections' in r.metrics,false);
  assert.equal('frontCalls' in r.metrics,false);
  assert.equal('frontSteps' in r.metrics,false);
});

test('deadline interruption never invents WDL',async()=>{
  const r=await solve7x6([],{workers:2,timeoutMs:1});
  assert.equal(r.status,'TIMEOUT',JSON.stringify(r));
  assert.equal(r.rootWdl,null);
  assert.equal(r.move,-1);
  assert.equal(r.cleanup,true);
});

test('public IsoMax entrypoint delegates managed execution ownership to JSMinSys',()=>{
  const source=readFileSync(new URL('../components/isometric/solve.mjs',import.meta.url),'utf8');
  const host=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-host.mjs',import.meta.url),'utf8');
  const worker=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-worker.mjs',import.meta.url),'utf8');
  const manager=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-manager.mjs',import.meta.url),'utf8');
  assert.equal(source.includes('./rba/kernel.mjs'),false);
  assert.equal(source.includes('./execution/branch-manager.mjs'),false);
  assert.equal(source.includes('runManagedConnect4CpcRba32'),true);
  assert.equal(source.includes('spawnManagedFileWorker32'),false);
  assert.equal(source.includes('runRbaBranchWorkerLoop32'),false);
  assert.equal(source.includes('runRbaBranchManagerLoop32'),false);
  assert.equal(host.includes('rba-connect4-managed-worker.mjs'),true);
  assert.equal(host.includes('rba-connect4-managed-manager.mjs'),true);
  assert.equal(worker.includes('runRbaBranchWorkerLoop32'),true);
  assert.equal(manager.includes('runRbaBranchManagerLoop32'),true);
});
