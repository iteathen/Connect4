import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve7x6} from '../components/isometric/solve.mjs';

test('unresolved IsoMax positions continue only through CPC-first exact alpha-beta',async()=>{
  const moves=[1,3,2,0,4,6,1,0,2,4,5,2,2,3,1,1,1,5,1,3,2,4,6,0,4,4,6,2,0,4,3,3];
  const r=await solve7x6(moves,{workers:1,timeoutMs:5000});
  assert.equal(r.status,'EXACT',JSON.stringify(r));
  assert.equal(r.rootWdl,-1);
  assert.equal(r.cleanup,true);
  assert.ok(r.metrics.nodes>0);
  assert.ok(r.metrics.cofactors>0);
  assert.equal(r.metrics.frontCalls,0);
  assert.equal(r.metrics.frontSteps,0);
  assert.equal('fallbackNodes' in r.metrics,false);
  assert.equal('fallbackSelections' in r.metrics,false);
});

test('deadline interruption never invents WDL',async()=>{
  const r=await solve7x6([],{workers:1,timeoutMs:1});
  assert.equal(r.status,'TIMEOUT',JSON.stringify(r));
  assert.equal(r.rootWdl,null);
  assert.equal(r.move,-1);
  assert.equal(r.cleanup,true);
});

test('public IsoMax entrypoint has no legacy RBA/BranchManager execution dependency',()=>{
  const source=readFileSync(new URL('../components/isometric/solve.mjs',import.meta.url),'utf8');
  assert.equal(source.includes('./rba/kernel.mjs'),false);
  assert.equal(source.includes('./execution/branch-manager.mjs'),false);
  assert.equal(source.includes('branch-manager-host.mjs'),true);
});
