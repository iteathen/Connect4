import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMemoryConfig} from '../tools/isomax-cycle-analysis.mjs';
test('memory campaign validates independent capacities and bounded case limits',()=>{
  const c={sharedCacheCapacity:131072,localCacheCapacity:16384,timeoutMs:30000};
  assert.deepEqual(validateMemoryConfig(c),c);
  for(const k of ['sharedCacheCapacity','localCacheCapacity'])for(const n of [0,-1,3,NaN,2097152])assert.throws(()=>validateMemoryConfig({...c,[k]:n}));
  assert.throws(()=>validateMemoryConfig({...c,timeoutMs:120001}));
});
