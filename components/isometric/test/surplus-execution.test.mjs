import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxSolver } from '../solver.mjs';
import { IsoMaxSurplusBranchManager } from '../execution/surplus-manager.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';
import { CENTER_ORDER } from '../move-order.mjs';
import {
  OCC_RETIRED,
  allocateOccurrence,
  createSurplusPool,
  openSurplusPool,
  releaseOccurrence,
} from '../execution/surplus-pool.mjs';

class BranchProbe {
  constructor(){this.branches=0;this.multiChild=0;}
  solveChildren(solver,state,maximizing,lower,upper,promoted){
    this.branches++;
    const columns=[];
    if(promoted>=0&&state.canPlay(promoted))columns.push(promoted);
    for(const column of CENTER_ORDER)if(column!==promoted&&state.canPlay(column))columns.push(column);
    let best=maximizing?-1:1,evaluated=0;
    for(const column of columns){
      state.applyUnchecked(column);solver.metrics.recursiveChildren++;
      let value;try{value=solver.solveNode(state);}finally{state.undo();}
      evaluated++;
      if(maximizing){if(value>best)best=value;if(best>=upper)break;}
      else {if(value<best)best=value;if(best<=lower)break;}
    }
    if(evaluated>1)this.multiChild++;
    return best;
  }
}

function branchyFixture(seed,ply=34){
  for(const {moves} of makeCorpus({seed,ply,count:64})){
    const solver=new IsoMaxSolver(),probe=new BranchProbe();
    solver.branchDistributor=probe;
    const value=solver.solveValue(solver.createState(moves)).value;
    if(probe.branches>0&&probe.multiChild>0){
      const expected=new IsoMaxSolver().solveMoves(moves);
      assert.equal(value,expected.value);
      return {moves,expected};
    }
  }
  throw new Error('failed to find branchy IsoMax fixture');
}

test('surplus occurrence arena reuses one slot only under a new generation', () => {
  const descriptor=createSurplusPool({
    workerCount:1,workCapacity:4,occurrenceCapacity:1,queueCapacity:4,publicationCapacity:4,
  });
  const shared=openSurplusPool(descriptor);
  const solver=new IsoMaxSolver();
  const state=solver.createState();
  const scratch=new Int32Array(1);
  let priorGeneration=0;

  for(let iteration=0;iteration<64;iteration++){
    const slot=allocateOccurrence(shared,0,-1,0,state,3,1,0,scratch);
    assert.equal(slot,0);
    const generation=Atomics.load(shared.occGeneration,slot);
    assert.ok(generation>priorGeneration);
    priorGeneration=generation;

    // Live occurrences are never reusable.
    assert.equal(releaseOccurrence(shared,slot,generation),false);

    Atomics.store(shared.occNeeded,slot,0);
    Atomics.store(shared.occState,slot,OCC_RETIRED);
    assert.equal(releaseOccurrence(shared,slot,generation),true);
    // A stale generation can never reclaim the newly reusable slot.
    assert.equal(releaseOccurrence(shared,slot,generation),false);
  }
});

test('one-worker surplus profile preserves one native continuation across published branches',
  {timeout:30000}, async () => {
    const {moves,expected}=branchyFixture(0x1025a);
    const manager=new IsoMaxSurplusBranchManager({
      workers:1,maxQ:65536,workCapacity:65536,occurrenceCapacity:131072,
      queueCapacity:131072,publicationCapacity:131072,
      workerClassReserve:524288,workerEntryReserve:1048576,
    });
    try{
      const actual=await manager.solveMoves(moves,{timeoutMs:15000});
      assert.equal(actual.value,expected.value);
      assert.equal(actual.move,expected.move);
      assert.equal(actual.scheduler.architecture,'surplus-opportunity-pull');

      const worker=actual.metrics.worker;
      assert.ok(worker.branches>0,'fixture must exercise genuine branches');
      assert.ok(worker.occurrencesPublished>0,'surplus alternatives must become globally visible');
      assert.ok(worker.localReclaims>0,'single worker must reclaim un-stolen surplus locally');
      assert.equal(worker.surplusRemote,0,'single worker cannot turn its own surplus into remote dependencies');
      assert.equal(worker.helperWaits,0,'single worker must not wait for a helper');
      assert.equal(worker.workClaims,1,
        'branching must not force the single worker to end its current continuation and claim new roots');
      assert.equal(actual.metrics.maxActiveWork,1,
        'one worker permits only one executable canonical subtree despite broader visibility');
      assert.equal(worker.pathReplayApplies,moves.length,
        'single-worker execution should replay only the external root, not every decision frontier');
    }finally{await manager.close();}
  });

test('surplus helpers steal alternatives while the current worker keeps local recursion',
  {timeout:45000}, async () => {
    // Historical expensive root: long enough that the idle helper has a real
    // opportunity to claim published surplus while the primary continuation
    // remains inside native recursion.
    const moves=Array.from('717657616532237625',character=>Number(character)-1);
    const expected=new IsoMaxSolver().solveMoves(moves);
    let claims=0,branches=0;
    const manager=new IsoMaxSurplusBranchManager({
      workers:2,maxQ:131072,workCapacity:131072,occurrenceCapacity:262144,
      queueCapacity:262144,publicationCapacity:262144,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    try{
      const actual=await manager.solveMoves(moves,{timeoutMs:15000});
      assert.equal(actual.value,expected.value);
      assert.equal(actual.move,expected.move);
      claims+=actual.metrics.worker.workClaims;
      branches+=actual.metrics.worker.branches;
      assert.ok(branches>0,'corrected profile must expose genuine branch opportunities');
      assert.ok(claims>=2,'an available helper must claim globally exposed surplus work');
      assert.ok(actual.metrics.maxActiveWork<=2,
        'two-worker execution population must remain bounded by worker capacity');
      assert.ok(actual.metrics.worker.pathReplayApplies < actual.metrics.worker.branches * moves.length,
        'helper stealing must not imply full-root replay at every branch');
    }finally{await manager.close();}
  });

test('surplus profile preserves q_r mirror action transport through physical root selection',
  {timeout:30000}, async () => {
    const moves=makeCorpus({seed:0x1025c,ply:32,count:1})[0].moves;
    const mirror=moves.map(column=>6-column);
    const manager=new IsoMaxSurplusBranchManager({
      workers:2,maxQ:65536,workCapacity:65536,occurrenceCapacity:131072,
      queueCapacity:131072,publicationCapacity:131072,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    try{
      for(const root of [moves,mirror]){
        const expected=new IsoMaxSolver().solveMoves(root);
        const actual=await manager.solveMoves(root,{timeoutMs:15000});
        assert.equal(actual.value,expected.value);
        assert.equal(actual.move,expected.move);
      }
    }finally{await manager.close();}
  });
