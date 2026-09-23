import test from 'node:test';
import assert from 'node:assert/strict';
import {solve7x6} from '../components/isometric/solve.mjs';
import {prepareWorker7x6} from '../components/isometric/execution/worker.mjs';
import {prepare} from '../components/isometric/rba/kernel.mjs';

test('uncovered native RBA never switches to enumeration at any worker count',async()=>{
  for(const workers of [1,2,4]){
    const r=await solve7x6([],{workers,boundaryDepth:0,timeoutMs:3000});
    assert.equal(r.status,'INCOMPLETE',JSON.stringify(r));
    assert.equal(r.errorCode,24);assert.equal(r.reason,'QUERY_UNCOVERED');
    assert.equal(r.rootWdl,null);assert.equal(r.move,-1);assert.equal(r.cleanup,true);
    assert.equal(r.metrics.claims,1);assert.equal(r.metrics.branches,0);
    assert.equal(r.metrics.continuations,0);assert.equal(r.metrics.boundaryCalls,1);
    assert.equal('fallbackNodes' in r.metrics,false);
    assert.equal('fallbackSelections' in r.metrics,false);
  }
});

test('exhausted construction budget is incomplete, never an alternate solver',async()=>{
  const r=await solve7x6([],{boundaryBudget:1,timeoutMs:3000});
  assert.equal(r.status,'INCOMPLETE',JSON.stringify(r));
  assert.equal(r.errorCode,22);assert.equal(r.reason,'BOUNDARY_INCOMPLETE');
  assert.equal(r.rootWdl,null);assert.equal(r.cleanup,true);
});

test('native worker preparation owns no fallback stack or policy switch',()=>{
  const w=prepareWorker7x6(2,1);prepare(w,{});
  for(const field of ['stack','phase','next','best','move','pending','depth','quantum','allowFallback','fallbacks','nodes']){
    assert.equal(field in w,false,field);
  }
});
