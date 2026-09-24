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
  // Worker telemetry is sampled/non-authoritative and may remain zero when DONE precedes final cold publication.
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

test('public IsoMax entrypoint uses JSMinSys branch manager, not legacy execution',()=>{
  const source=readFileSync(new URL('../components/isometric/solve.mjs',import.meta.url),'utf8');
  const worker=readFileSync(new URL('../components/isometric/jsminsys/worker.mjs',import.meta.url),'utf8');
  const manager=readFileSync(new URL('../components/isometric/jsminsys/manager-worker.mjs',import.meta.url),'utf8');
  assert.equal(source.includes('./rba/kernel.mjs'),false);
  assert.equal(source.includes('./execution/branch-manager.mjs'),false);
  assert.equal(worker.includes('runRbaBranchWorkerLoop32'),true);
  assert.equal(manager.includes('runRbaBranchManagerLoop32'),true);
});
