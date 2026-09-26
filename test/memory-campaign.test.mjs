import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMemoryConfig} from '../tools/isomax-cycle-analysis.mjs';
test('memory campaign validates independent capacities and bounded case limits',()=>{
  const c={sharedCacheCapacity:131072,localCacheCapacity:16384,timeoutMs:30000};
  assert.deepEqual(validateMemoryConfig(c),c);
  for(const k of ['sharedCacheCapacity','localCacheCapacity'])for(const n of [0,-1,3,NaN,4194304])assert.throws(()=>validateMemoryConfig({...c,[k]:n}));
  assert.throws(()=>validateMemoryConfig({...c,timeoutMs:300001}));
});

test('owner-authorized memory benchmark accepts a five-minute ceiling',()=>{
  assert.equal(validateMemoryConfig({sharedCacheCapacity:65536,localCacheCapacity:65536,timeoutMs:300000}).timeoutMs,300000);
});

test('owner-authorized doubled cache allocation accepts 2M entries per cache',()=>{
  const c={sharedCacheCapacity:2097152,localCacheCapacity:2097152,timeoutMs:300000};
  assert.deepEqual(validateMemoryConfig(c),c);
});
