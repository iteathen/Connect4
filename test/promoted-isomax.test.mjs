import test from 'node:test';import assert from 'node:assert/strict';
import {solve7x6} from '../components/isometric/solve.mjs';
test('public IsoMax default selects four promoted workers without hot diagnostic counters',async()=>{
 const r=await solve7x6([0,1,0,1,0,1,0],{sharedCacheCapacity:256,localCacheCapacity:256,supportBasisPlanBudgetBytes:0});
 assert.equal(r.status,'EXACT');assert.equal(r.rootWdl,1);assert.equal(r.move,-1);
 assert.equal(r.workersUsed,4);assert.equal(r.workersExited,4);assert.equal(r.cleanup,true);
 assert.equal(r.nodeCounts,null);assert.equal(r.winnerMetrics,null);
});
