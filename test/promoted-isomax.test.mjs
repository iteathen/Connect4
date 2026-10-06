import test from 'node:test';import assert from 'node:assert/strict';
import {solve7x6} from '../components/isometric/solve.mjs';
import {discoverWorkerPlan} from '../isomax/index.mjs';
test('public IsoMax default uses discovered workers without hot diagnostic counters',async()=>{
 const plan=await discoverWorkerPlan();
 if(plan.workers<2||plan.workers>64){await assert.rejects(()=>solve7x6([]),/worker/i);return;}
 const r=await solve7x6([0,1,0,1,0,1,0],{sharedCacheCapacity:256,localCacheCapacity:256,supportBasisPlanBudgetBytes:0});
 assert.equal(r.status,'EXACT');assert.equal(r.rootWdl,1);assert.equal(r.move,-1);
 assert.equal(r.workersUsed,plan.workers);assert.equal(r.workersExited,plan.workers);assert.equal(r.cleanup,true);
 assert.equal(r.nodeCounts,null);assert.equal(r.winnerMetrics,null);
});
