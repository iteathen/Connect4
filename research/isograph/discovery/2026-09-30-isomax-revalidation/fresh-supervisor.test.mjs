import test from 'node:test';
import assert from 'node:assert/strict';
import {isHeapLimitFailure} from './fresh-io.mjs';
test('only explicit fatal heap exhaustion marks a failing process resource-censored',()=>{
  const oom='FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory';
  assert.equal(isHeapLimitFailure(134,oom),true);
  assert.equal(isHeapLimitFailure(1,'AssertionError: scalar mismatch'),false);
  assert.equal(isHeapLimitFailure(0,oom),false);
  assert.equal(isHeapLimitFailure(1,'heap out of memory'),false);
});
