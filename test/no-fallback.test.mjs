import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {solve7x6} from '../components/isometric/solve.mjs';

test('unresolved IsoMax positions distribute surplus through managed workers',async()=>{
  const moves=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
  const r=await solve7x6(moves,{workers:2,timeoutMs:5000});
  assert.equal(r.status,'EXACT',JSON.stringify(r));
  assert.equal(r.rootWdl,1);
  assert.equal(r.cleanup,true);
  assert.ok(r.metrics.evaluations>0);
  assert.ok(r.metrics.branches>0,JSON.stringify(r));
  assert.ok(r.metrics.claims>1,JSON.stringify(r));
  assert.equal(r.metrics.alphaBetaNodes,0);
  assert.equal(r.metrics.cutoffs,0);
  assert.equal(r.workerClaims.length,2);
  assert.equal(r.workerEvaluations.length,2);
  assert.ok(r.workerClaims.every(v=>v>0),JSON.stringify(r));
  assert.ok(r.workerEvaluations.every(v=>v>0),JSON.stringify(r));
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

test('public IsoMax entrypoint delegates execution roles and lifecycle to JSMinSys',()=>{
  const source=readFileSync(new URL('../components/isometric/solve.mjs',import.meta.url),'utf8');
  const workerBase=readFileSync(new URL('../vendor/jsminsys/addons/worker.mjs',import.meta.url),'utf8');
  const managerBase=readFileSync(new URL('../vendor/jsminsys/addons/branch-manager.mjs',import.meta.url),'utf8');
  const hostBase=readFileSync(new URL('../vendor/jsminsys/addons/branch-manager-host.mjs',import.meta.url),'utf8');
  const worker=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-worker.mjs',import.meta.url),'utf8');
  const manager=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-manager.mjs',import.meta.url),'utf8');
  const host=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-host.mjs',import.meta.url),'utf8');

  assert.equal(source.includes('./rba/'),false);
  assert.equal(source.includes('./execution/'),false);
  assert.equal(source.includes('runManagedConnect4CpcRba32'),true);
  assert.equal(source.includes('absoluteValue'),false);
  assert.equal(source.includes('witness'),false);
  assert.equal(source.includes('...result'),false);
  assert.equal(host.includes('rootWdl:exact?table.exact[rootQ]-2:null'),true);
  assert.equal(host.includes('move:exact?runtime.witness[0]:-1'),true);

  assert.equal(workerBase.includes('export class Worker'),true);
  assert.equal(managerBase.includes('export class BranchManager'),true);
  assert.equal(hostBase.includes('export class ManagedThreadSession'),true);
  assert.equal(worker.includes('worker.run('),true);
  assert.equal(manager.includes('manager.run('),true);
  assert.equal(host.includes('session.spawn('),true);
  assert.equal(host.includes('session.wait('),true);
  assert.equal(host.includes('session.close('),true);
  assert.equal(host.includes('session.state()'),true);

  assert.equal(existsSync(new URL('../components/isometric/execution/',import.meta.url)),false);
  assert.equal(existsSync(new URL('../components/isometric/rba/',import.meta.url)),false);
});
