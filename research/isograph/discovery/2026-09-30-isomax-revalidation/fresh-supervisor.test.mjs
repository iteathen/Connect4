import test from 'node:test';
import assert from 'node:assert/strict';
import {isHeapLimitFailure,canAdvanceFresh} from './fresh-io.mjs';
test('only explicit fatal heap exhaustion marks a failing process resource-censored',()=>{
  const oom='FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory';
  assert.equal(isHeapLimitFailure(134,oom),true);
  assert.equal(isHeapLimitFailure(1,'AssertionError: scalar mismatch'),false);
  assert.equal(isHeapLimitFailure(0,oom),false);
  assert.equal(isHeapLimitFailure(1,'heap out of memory'),false);
});
test('recorded scientific stopping result overrides a later resource timeout',()=>{
  for(const resultStatus of ['BOUNDED_FRESH_NONAFFINE_FULL_OOO_QUALIFICATION','FRESH_FULL_OOO_FALSIFIER','COORDINATE_PURITY_FAILURE','UNKNOWN'])
    assert.equal(canAdvanceFresh({resultStatus,structureStatus:'STRUCTURALLY_ELIGIBLE_AWAIT_COMMITTED_SNAPSHOT',resourceStatus:'RESOURCE_CENSORED'}),false);
  assert.equal(canAdvanceFresh({resultStatus:'SCALAR_OOO_VACUOUS',resourceStatus:'RESOURCE_CENSORED'}),true);
  assert.equal(canAdvanceFresh({structureStatus:'STRUCTURALLY_VACUOUS'}),true);
  assert.equal(canAdvanceFresh({resourceStatus:'RESOURCE_CENSORED'}),true);
  assert.equal(canAdvanceFresh({resourceStatus:'FAILED'}),false);
});
