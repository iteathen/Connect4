import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxSolver } from '../solver.mjs';
import { IsoMaxPullBranchManager } from '../execution/pull-manager.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';
import {
  CTRL_WORK_NEXT,
  WORK_DONE,
  WORK_RUNNING,
  allocateWorkSlot,
  claimHighestReady,
  createSharedWorkPool,
  markReady,
  openSharedWorkPool,
  releaseWorkSlot,
} from '../execution/shared-work-pool.mjs';

test('shared pull pool claims highest global priority and rejects stale generation tickets', () => {
  const descriptor = createSharedWorkPool({
    workCapacity:4,
    workerCount:1,
    queueCapacity:8,
    publicationCapacity:16,
  });
  const pool = openSharedWorkPool(descriptor);
  const alloc = new Int32Array(2), claim = new Int32Array(4), queue = new Int32Array(3);

  const low = allocateWorkSlot(pool, alloc), lowGeneration = alloc[1];
  assert.ok(low >= 0);
  assert.equal(markReady(pool, low, lowGeneration, 2), true);

  const high = allocateWorkSlot(pool, alloc), highGeneration = alloc[1];
  assert.ok(high >= 0);
  assert.equal(markReady(pool, high, highGeneration, 6), true);

  assert.equal(claimHighestReady(pool, 0, claim, queue), true);
  assert.equal(claim[0], high);
  assert.equal(claim[1], highGeneration);
  assert.equal(claim[3], 6);

  Atomics.store(pool.workState, high, WORK_DONE);
  assert.equal(releaseWorkSlot(pool, high, highGeneration), true);

  const reused = allocateWorkSlot(pool, alloc), reusedGeneration = alloc[1];
  assert.equal(reused, high);
  assert.notEqual(reusedGeneration, highGeneration);
  assert.equal(markReady(pool, reused, reusedGeneration, 7), true);

  assert.equal(claimHighestReady(pool, 0, claim, queue), true);
  assert.equal(claim[0], reused);
  assert.equal(claim[1], reusedGeneration);
  assert.equal(claim[3], 7);
});

test('retained decentralized pull matches serial exact WDL and root action at 1/2/4 workers',
  {timeout:60000}, async () => {
    const roots = makeCorpus({seed:0x1020c4, ply:34, count:2}).map(entry => entry.moves);
    let qReuses = 0, duplicateRetirements = 0, retainedDescents = 0, workerResets = 0;
    let crossedMultipleFrontiers = false;
    for (const moves of roots) {
      const expected = new IsoMaxSolver().solveMoves(moves);
      for (const workers of [1, 2, 4]) {
        const manager = new IsoMaxPullBranchManager({
          workers,
          maxTasks:8192,
          maxEdges:8192 * 7,
          workCapacity:2048,
          queueCapacity:4096,
          publicationCapacity:4096,
        });
        try {
          const actual = await manager.solveMoves(moves, {timeoutMs:15000});
          assert.equal(actual.value, expected.value, 'WDL mismatch workers=' + workers);
          assert.equal(actual.move, expected.move, 'root move mismatch workers=' + workers);
          assert.equal(actual.scheduler.architecture, 'retained-decentralized-pull');
          assert.ok(actual.metrics.worker.claims > 0);
          assert.ok(actual.metrics.worker.nativeStateEvaluations > 0);
          assert.ok(actual.canonicalQ > 0);
          assert.ok(actual.metrics.worker.claimsByBand.some(value => value > 0));
          qReuses += actual.metrics.qReuses ?? 0;
          duplicateRetirements += (actual.metrics.duplicateReadyCollapsed ?? 0)
            + (actual.metrics.duplicateRunningRetired ?? 0)
            + (actual.metrics.exactDuplicateCompletions ?? 0);
          retainedDescents += actual.metrics.worker.retainedDescents ?? 0;
          workerResets += (actual.metrics.duplicateWorkerResets ?? 0)
            + (actual.metrics.worker.resetRetirements ?? 0);
          if ((actual.metrics.worker.frontiers ?? 0) > (actual.metrics.worker.claims ?? 0)) {
            crossedMultipleFrontiers = true;
          }
        } finally {
          await manager.close();
        }
      }
    }
    assert.ok(qReuses > 0, 'integrated pull corpus must exercise canonical q convergence');
    assert.ok(duplicateRetirements > 0,
      'integrated pull corpus must collapse or retire at least one duplicate execution occurrence');
    assert.ok(retainedDescents > 0,
      'workers must descend retained highest-eval children without surrendering each frontier');
    assert.equal(crossedMultipleFrontiers, true,
      'at least one claimed execution must cross multiple decision frontiers');
    assert.ok(workerResets > 0,
      'TT path convergence must reset at least one redundant execution back to queue polling');
  });

test('decentralized pull solver preserves mirror transport and deterministic first win',
  {timeout:30000}, async () => {
    const root = makeCorpus({seed:0x1020c5, ply:32, count:1})[0].moves;
    const mirror = root.map(column => 6 - column);
    const manager = new IsoMaxPullBranchManager({
      workers:2,
      maxTasks:8192,
      workCapacity:2048,
      queueCapacity:4096,
      publicationCapacity:4096,
    });
    try {
      for (const moves of [root, mirror, [0,1,0,1,0,1]]) {
        const expected = new IsoMaxSolver().solveMoves(moves);
        const actual = await manager.solveMoves(moves, {timeoutMs:10000});
        assert.equal(actual.value, expected.value);
        assert.equal(actual.move, expected.move);
      }
    } finally {
      await manager.close();
    }
  });

test('decentralized pull requeues dead-worker execution and still returns exact root',
  {timeout:30000}, async () => {
    const moves = Array.from('717657616532237625', character => Number(character) - 1);
    const expected = new IsoMaxSolver().solveMoves(moves);
    const manager = new IsoMaxPullBranchManager({
      workers:2,
      maxTasks:65536,
      maxEdges:65536 * 7,
      workCapacity:8192,
      queueCapacity:16384,
      publicationCapacity:16384,
    });
    let killed = false;
    try {
      await manager.start();
      const run = manager.solveMoves(moves, {timeoutMs:20000});

      let runningWorker = -1;
      for (let spin = 0; spin < 2000 && runningWorker < 0; spin++) {
        const shared = manager.session?.shared;
        if (shared) {
          const allocated = Math.min(
            shared.workCapacity,
            Atomics.load(shared.control, CTRL_WORK_NEXT),
          );
          for (let slot = 0; slot < allocated; slot++) {
            if (Atomics.load(shared.workState, slot) !== WORK_RUNNING) continue;
            const owner = Atomics.load(shared.workWorker, slot);
            if (owner >= 0 && manager.workers[owner]) {
              runningWorker = owner;
              break;
            }
          }
        }
        if (runningWorker < 0) await new Promise(resolve => setTimeout(resolve, 1));
      }

      assert.ok(runningWorker >= 0, 'test must observe a RUNNING pull execution');
      killed = true;
      await manager.workers[runningWorker].terminate();

      const result = await run;
      assert.equal(killed, true);
      assert.equal(result.value, expected.value);
      assert.equal(result.move, expected.move);
      assert.ok((result.metrics.workerDeathRequeues ?? 0) > 0,
        'dead evaluator must cause at least one live canonical dependency to be requeued');
    } finally {
      await manager.close();
    }
  });

test('decentralized pull capacity exhaustion fails closed without manufacturing WDL',
  {timeout:10000}, async () => {
    const manager = new IsoMaxPullBranchManager({
      workers:1,
      maxTasks:64,
      maxEdges:448,
      workCapacity:1,
      executionLimit:1,
      queueCapacity:4,
      occurrenceCapacity:1,
      publicationCapacity:16,
    });
    try {
      await assert.rejects(
        manager.solveMoves([], {timeoutMs:5000}),
        /CAPACITY|failed|aborted/i,
      );
    } finally {
      await manager.close();
    }
  });
