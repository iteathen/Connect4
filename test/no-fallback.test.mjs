import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {solve7x6} from '../components/isometric/solve.mjs';

test('unresolved IsoMax positions execute through Lazy SMP only',async()=>{
  const moves=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
  const r=await solve7x6(moves,{workers:2,timeoutMs:5000});
  assert.equal(r.status,'EXACT',JSON.stringify(r));
  assert.equal(r.rootWdl,1);
  assert.equal(r.cleanup,true);
  assert.equal(r.workersUsed,2);
  assert.equal(r.workersExited,2);
  assert.ok(r.winner>=0&&r.winner<2,JSON.stringify(r));
  assert.ok(r.winnerMetrics&&r.winnerMetrics.nodes>=0,JSON.stringify(r));
  assert.ok(r.sharedCacheHits>=0);
  assert.ok(r.sharedCacheStores>=0);
  assert.equal('metrics' in r,false);
  assert.equal('workerClaims' in r,false);
  assert.equal('workerEvaluations' in r,false);
});

test('deadline interruption never invents WDL',async()=>{
  const r=await solve7x6([],{workers:2,timeoutMs:1});
  assert.equal(r.status,'TIMEOUT',JSON.stringify(r));
  assert.equal(r.rootWdl,null);
  assert.equal(r.move,-1);
  assert.equal(r.cleanup,true);
});

test('public IsoMax entrypoint delegates exclusively to JSMinSys Lazy SMP',()=>{
  const source=readFileSync(new URL('../components/isometric/solve.mjs',import.meta.url),'utf8');
  const host=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-lazy-smp-host.mjs',import.meta.url),'utf8');
  const worker=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-lazy-smp-worker.mjs',import.meta.url),'utf8');

  assert.equal(source.includes('./rba/'),false);
  assert.equal(source.includes('./execution/'),false);
  assert.equal(source.includes('runLazySmpConnect4Rba32'),true);
  assert.equal(source.includes('runManagedConnect4CpcRba32'),false);
  assert.equal(source.includes('absoluteValue'),false);
  assert.equal(source.includes('witness'),false);
  assert.equal(source.includes('...result'),false);

  assert.equal(host.includes('session.spawn('),true);
  assert.equal(host.includes('session.wait('),true);
  assert.equal(host.includes('session.close('),true);
  assert.equal(host.includes('session.state()'),true);
  assert.equal(host.includes('prepareRbaBranchManager32'),false);
  assert.equal(host.includes('rbaTtPublishSurplus32'),false);
  assert.equal(worker.includes('solveConnect4RbaAlphaBeta('),true);

  assert.equal(existsSync(new URL('../vendor/jsminsys/addons/rba-tt32.mjs',import.meta.url)),false);
  assert.equal(existsSync(new URL('../vendor/jsminsys/addons/rba-branch-manager.mjs',import.meta.url)),false);
  assert.equal(existsSync(new URL('../vendor/jsminsys/addons/rba-connect4-solver.mjs',import.meta.url)),false);
  assert.equal(existsSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-host.mjs',import.meta.url)),false);
  assert.equal(existsSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-worker.mjs',import.meta.url)),false);
  assert.equal(existsSync(new URL('../vendor/jsminsys/addons/rba-connect4-managed-manager.mjs',import.meta.url)),false);
  assert.equal(existsSync(new URL('../components/isometric/execution/',import.meta.url)),false);
  assert.equal(existsSync(new URL('../components/isometric/rba/',import.meta.url)),false);
});
