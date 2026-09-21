import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxSolver } from '../solver.mjs';
import { IsoMaxSurplusBranchManager } from '../execution/surplus-manager.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';
import { CENTER_ORDER } from '../move-order.mjs';
import { nativeFrontierCode } from '../frontier.mjs';
import {
  CTRL_WORK_NEXT,
  OCC_RETIRED,
  WORK_EXACT,
  WORK_RUNNING,
  allocateOccurrence,
  allocateWork,
  claimHighest,
  createSurplusPool,
  enqueueWork,
  openSurplusPool,
  releaseOccurrence,
  releaseWork,
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

function qConvergenceFixture(){
  // Reflection-invariant 32-ply legal position selected from a deterministic
  // search specifically because the root is an ordinary branch
  // (nativeFrontierCode === 0). Mirror children 0 and 6 are therefore both
  // exposed to reconciliation instead of being bypassed by a native
  // exact/forced shortcut.
  const moves=[
    6,6,0,0, 2,1,4,5, 3,2,3,4, 6,3,0,3,
    5,0,1,6, 2,6,4,0, 1,1,5,5, 2,2,4,4,
  ];
  const solver=new IsoMaxSolver(),state=solver.createState(moves);
  assert.equal(state.isTerminal(),false);
  assert.equal(nativeFrontierCode(state),0,
    'q convergence fixture must reach the ordinary branch-distribution boundary');
  assert.equal(state.canPlay(2),true);
  assert.equal(state.canPlay(4),true);

  state.applyUnchecked(2);
  const left=Array.from(state.gameplayKey());
  state.undo();
  state.applyUnchecked(4);
  const right=Array.from(state.gameplayKey());
  state.undo();
  assert.deepEqual(left,right,'mirror child occurrences must share exact q_r');

  return {moves,columns:[2,4],expected:new IsoMaxSolver().solveMoves(moves)};
}

test('surplus helper work arena reuses one slot only after terminal reconciliation', () => {
  const descriptor=createSurplusPool({
    workerCount:1,workCapacity:1,occurrenceCapacity:2,queueCapacity:4,publicationCapacity:4,
  });
  const shared=openSurplusPool(descriptor);
  const scratch=new Int32Array(2);
  let priorGeneration=0;
  for(let iteration=0;iteration<64;iteration++){
    const slot=allocateWork(shared,scratch);
    assert.equal(slot,0);
    const generation=scratch[1];
    assert.ok(generation>priorGeneration);
    priorGeneration=generation;

    assert.equal(releaseWork(shared,slot,generation),false,
      'live WRITING work cannot be recycled');
    Atomics.store(shared.workState,slot,WORK_EXACT);
    assert.equal(releaseWork(shared,slot,generation),true);
    assert.equal(releaseWork(shared,slot,generation),false,
      'released generation cannot be reclaimed twice');
  }
});

test('stale READY ticket cannot claim a recycled work-slot generation', () => {
  const descriptor=createSurplusPool({
    workerCount:1,workCapacity:1,occurrenceCapacity:2,queueCapacity:8,publicationCapacity:8,
  });
  const shared=openSurplusPool(descriptor);
  const alloc=new Int32Array(2),claim=new Int32Array(4);

  const first=allocateWork(shared,alloc),firstGeneration=alloc[1];
  assert.equal(first,0);
  Atomics.store(shared.workState,first,2); // WORK_READY
  assert.equal(enqueueWork(shared,first,firstGeneration,4),true);

  // Retire/recycle without consuming the old queue ticket.
  Atomics.store(shared.workState,first,WORK_EXACT);
  assert.equal(releaseWork(shared,first,firstGeneration),true);

  const second=allocateWork(shared,alloc),secondGeneration=alloc[1];
  assert.equal(second,0);
  assert.notEqual(secondGeneration,firstGeneration);
  Atomics.store(shared.workState,second,2); // WORK_READY
  assert.equal(enqueueWork(shared,second,secondGeneration,6),true);

  assert.equal(claimHighest(shared,0,claim),true);
  assert.equal(claim[0],second);
  assert.equal(claim[1],secondGeneration);
  assert.equal(claim[3],6);
});

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

    // Leader references are part of occurrence identity and must not survive
    // generation reuse.
    Atomics.store(shared.occLeader,slot,slot);
    Atomics.store(shared.occLeaderGeneration,slot,generation);
    Atomics.store(shared.occNeeded,slot,0);
    Atomics.store(shared.occState,slot,OCC_RETIRED);
    assert.equal(releaseOccurrence(shared,slot,generation),true);
    assert.equal(Atomics.load(shared.occLeader,slot),-1);
    assert.equal(Atomics.load(shared.occLeaderGeneration,slot),-1);
    // A stale generation can never reclaim the newly reusable slot.
    assert.equal(releaseOccurrence(shared,slot,generation),false);
  }
});

test('one-worker surplus profile degenerates to native recursive DFS',
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
      assert.equal(worker.occurrencesPublished,0,
        'single worker must not globalize branch occurrences nobody can consume');
      assert.equal(worker.localReclaims,0,
        'single worker has no published surplus to reclaim');
      assert.ok(worker.unpublishedLocal>0,
        'single worker must keep non-primary siblings in native local recursion');
      assert.equal(worker.demandReservations,0,
        'single worker cannot reserve external demand');
      assert.equal(worker.surplusRemote,0,'single worker cannot claim a remote surplus helper');
      assert.equal(worker.helperReplayApplies,0,'single worker must not replay helper work');
      assert.equal(worker.helperWaits,0,'single worker must not wait for a helper');
      assert.equal(worker.workClaims,1,
        'branching must not force the single worker to end its current continuation and claim new roots');
      assert.equal(actual.metrics.maxActiveWork,1,
        'one worker permits only one executable canonical subtree');
      assert.equal(actual.metrics.qHighWater,1,
        'single worker must retain only the external canonical root globally');
      assert.equal(worker.pathReplayApplies,moves.length,
        'single-worker execution should replay only the external root, not every decision frontier');
    }finally{await manager.close();}
  });

test('surplus helpers steal alternatives while the current worker keeps local recursion',
  {timeout:20000}, async () => {
    // Lifecycle control, not the hard-root economics test. Use a deterministic
    // branchy late root that completes quickly while still giving an idle
    // second worker real surplus to steal. Historical hard roots remain in
    // surplus-comparison.mjs and are mandatory before promotion.
    const {moves,expected}=branchyFixture(0x1025b,32);
    let claims=0,branches=0;
    const manager=new IsoMaxSurplusBranchManager({
      workers:2,maxQ:65536,workCapacity:65536,occurrenceCapacity:131072,
      queueCapacity:131072,publicationCapacity:131072,
      helperGraceMs:25,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    try{
      const actual=await manager.solveMoves(moves,{timeoutMs:10000});
      assert.equal(actual.value,expected.value);
      assert.equal(actual.move,expected.move);
      claims+=actual.metrics.worker.workClaims;
      branches+=actual.metrics.worker.branches;
      assert.ok(branches>0,
        'corrected profile must expose genuine branch opportunities; worker='+
        JSON.stringify(actual.metrics.worker)+' reconciler='+JSON.stringify(actual.metrics));
      assert.ok(claims>=2,
        'an available helper must claim globally exposed surplus work; worker='+
        JSON.stringify(actual.metrics.worker)+' reconciler='+JSON.stringify(actual.metrics));
      assert.ok(actual.metrics.worker.demandReservations>0,
        'surplus publication must be backed by explicit idle-worker demand');
      assert.ok(actual.metrics.worker.surplusRemote>0,
        'a non-root surplus opportunity must be claimed as helper work');
      assert.ok(actual.metrics.worker.helperReplayApplies>0,
        'remote helper execution must report its physical replay cost');
      assert.ok(actual.metrics.maxActiveWork<=2,
        'two-worker execution population must remain bounded by worker capacity');
      assert.ok(actual.metrics.worker.pathReplayApplies < actual.metrics.worker.branches * moves.length,
        'helper stealing must not imply full-root replay at every branch');
      assert.ok(Number.isFinite(actual.resultReadyMs)&&Number.isFinite(actual.cleanupMs));
      assert.ok(actual.elapsedMs>=actual.resultReadyMs);
    }finally{await manager.close();}
  });

test('surplus reconciler merges physically distinct child occurrences with the same q_r',
  {timeout:20000}, async () => {
    const {moves,columns,expected}=qConvergenceFixture();
    assert.notEqual(columns[0],columns[1]);
    const manager=new IsoMaxSurplusBranchManager({
      workers:3,maxQ:65536,workCapacity:65536,occurrenceCapacity:131072,
      queueCapacity:131072,publicationCapacity:131072,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    try{
      const actual=await manager.solveMoves(moves,{timeoutMs:10000});
      assert.equal(actual.value,expected.value);
      assert.equal(actual.move,expected.move);
      // qReuses increments only while linkOccurrence() interns a physical
      // occurrence into an already-existing full exact q_r. Depending on
      // scheduling, that reused q may still be running (duplicate carrier) or
      // already exact (immediate exact broadcast), so duplicate-carrier counts
      // are not a deterministic requirement of successful reconciliation.
      assert.ok((actual.metrics.qReuses??0)>0,
        'reconciler must merge a physical occurrence into an existing exact q_r');
    }finally{await manager.close();}
  });

test('surplus worker death requeues live canonical work without changing exact root',
  {timeout:45000}, async () => {
    const moves=Array.from('717657616532237625',character=>Number(character)-1);
    const expected=new IsoMaxSolver().solveMoves(moves);
    const manager=new IsoMaxSurplusBranchManager({
      workers:2,maxQ:131072,workCapacity:131072,occurrenceCapacity:262144,
      queueCapacity:262144,publicationCapacity:262144,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    let killed=false;
    try{
      const actual=await manager.solveMoves(moves,{
        timeoutMs:30000,
        progressIntervalMs:100,
        onProgress:()=>{
          if(killed||!manager.session)return;
          const shared=manager.session.shared;
          const allocated=Math.min(shared.workCapacity,Atomics.load(shared.control,CTRL_WORK_NEXT));
          for(let slot=0;slot<allocated;slot++){
            if(Atomics.load(shared.workState,slot)!==WORK_RUNNING)continue;
            const workerId=Atomics.load(shared.workWorker,slot);
            if(workerId<0||!manager.workers[workerId])continue;
            killed=true;
            void manager.workers[workerId].terminate();
            break;
          }
        },
      });
      assert.equal(killed,true,'test must terminate an active surplus evaluator');
      assert.equal(actual.value,expected.value);
      assert.equal(actual.move,expected.move);
      assert.ok((actual.metrics.workerDeathRequeues??0)>0,
        'dead active work must be requeued from portable replay');

      // The dead Worker object must not remain reusable host state. A second
      // solve on the same manager respawns the missing evaluator and preserves
      // exact semantics.
      const second=await manager.solveMoves(moves,{timeoutMs:30000});
      assert.equal(second.value,expected.value);
      assert.equal(second.move,expected.move);
      assert.equal(manager.workers.filter(Boolean).length,2);
    }finally{await manager.close();}
  });

test('surplus timeout fails closed promptly', {timeout:10000}, async () => {
  const hard=Array.from('717657616532237625',character=>Number(character)-1);
  const manager=new IsoMaxSurplusBranchManager({
    workers:1,maxQ:4096,workCapacity:4096,occurrenceCapacity:8192,
    queueCapacity:8192,publicationCapacity:8192,
  });
  const started=performance.now();
  try{
    await assert.rejects(manager.solveMoves(hard,{timeoutMs:1}),/ISOMAX_TIMEOUT/);
    assert.ok(performance.now()-started<5000,'1ms timeout must not strand worker/reconciler lifecycle');
  }finally{await manager.close();}
});

test('surplus pre-abort fails closed promptly', {timeout:10000}, async () => {
  const hard=Array.from('717657616532237625',character=>Number(character)-1);
  const manager=new IsoMaxSurplusBranchManager({
    workers:1,maxQ:4096,workCapacity:4096,occurrenceCapacity:8192,
    queueCapacity:8192,publicationCapacity:8192,
  });
  const controller=new AbortController();controller.abort();
  const started=performance.now();
  try{
    await assert.rejects(
      manager.solveMoves(hard,{timeoutMs:5000,signal:controller.signal}),
      /ISOMAX_ABORTED|SURPLUS_ABORTED/,
    );
    assert.ok(performance.now()-started<5000,'pre-abort must not strand session startup or cleanup');
  }finally{await manager.close();}
});

test('surplus bounded occurrence capacity fails closed', {timeout:10000}, async () => {
  const {moves}=branchyFixture(0x1025a,34);
  const manager=new IsoMaxSurplusBranchManager({
    workers:2,maxQ:64,workCapacity:64,occurrenceCapacity:1,
    queueCapacity:64,publicationCapacity:64,
  });
  try{
    await assert.rejects(
      manager.solveMoves(moves,{timeoutMs:5000}),
      /ISOMAX_SURPLUS_OCCURRENCE_CAPACITY/,
    );
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
