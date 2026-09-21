import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxSolver } from '../solver.mjs';
import { IsoMaxBranchManager } from '../execution/branch-manager.mjs';
import { PortableQBuilder } from '../execution/portable-q.mjs';
import {
  EXEC_NONE,
  Q_EXACT_UNKNOWN,
  claimHighestQ,
  createSharedTT,
  enqueueQ,
  openSharedTT,
  probeOrInsertQ,
  recycleQIfDead,
  releaseQRef,
} from '../execution/shared-tt.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';

test('portable shared q identity converges mirrors by exact residual content', () => {
  const solver = new IsoMaxSolver();
  const moves = [1, 3, 2, 4, 2, 4, 5, 0];
  const mirror = moves.map(column => 6 - column);
  const a = solver.createState(moves);
  const b = solver.createState(mirror);
  const qa = new PortableQBuilder();
  const qb = new PortableQBuilder();
  qa.prepare(a);
  qb.prepare(b);

  assert.equal(qa.support, qb.support);
  assert.equal(qa.flags, qb.flags);
  assert.deepEqual(Array.from(qa.words), Array.from(qb.words));

  const descriptor = createSharedTT({
    qCapacity: 8,
    workerCount: 1,
    queueCapacity: 8,
    bucketCount: 16,
    edgeCapacity: 56,
  });
  const shared = openSharedTT(descriptor);
  const outA = new Int32Array(3);
  const outB = new Int32Array(3);
  probeOrInsertQ(shared, qa.words, qa.support, qa.flags, qa.replay, qa.replayLength, outA);
  probeOrInsertQ(shared, qb.words, qb.support, qb.flags, qb.replay, qb.replayLength, outB);
  assert.equal(outA[0], outB[0]);
  assert.equal(outA[1], outB[1]);
  assert.equal(outA[2], 1);
  assert.equal(outB[2], 0);
  assert.equal(Atomics.load(shared.qRefCount, outA[0]), 2);
});

test('shared q generation rejects stale queue history after exact slot reuse', () => {
  const descriptor = createSharedTT({
    qCapacity: 1,
    workerCount: 1,
    queueCapacity: 4,
    bucketCount: 2,
    edgeCapacity: 7,
  });
  const shared = openSharedTT(descriptor);
  const replay = new Uint8Array(42);
  const firstWords = new Uint32Array(40);
  const secondWords = new Uint32Array(40);
  secondWords[0] = 1;
  const first = new Int32Array(3);
  const second = new Int32Array(3);
  const claim = new Int32Array(3);
  const queueScratch = new Int32Array(2);

  probeOrInsertQ(shared, firstWords, 0, 0, replay, 0, first);
  assert.equal(enqueueQ(shared, first[0], first[1], 7), true);

  // Leave the old ticket physically in the queue while making its q generation
  // dead. This models the deliberate lazy stale-ticket policy.
  Atomics.store(shared.qExecution, first[0], EXEC_NONE);
  assert.equal(releaseQRef(shared, first[0], first[1]), 0);
  assert.equal(recycleQIfDead(shared, first[0], first[1]), true);

  probeOrInsertQ(shared, secondWords, 1, 0, replay, 0, second);
  assert.equal(second[0], first[0]);
  assert.notEqual(second[1], first[1]);
  assert.equal(enqueueQ(shared, second[0], second[1], 7), true);

  assert.equal(claimHighestQ(shared, 0, claim, queueScratch), true);
  assert.equal(claim[0], second[0]);
  assert.equal(claim[1], second[1]);
  assert.equal(Atomics.load(shared.qExact, second[0]), Q_EXACT_UNKNOWN);
});

test('shared-TT retained pull matches serial exact WDL and root witness at 1/2/4 workers',
  { timeout: 90000 }, async () => {
    const roots = makeCorpus({ seed: 0x1020c4, ply: 34, count: 2 }).map(entry => entry.moves);
    let sawFrontier = false;
    let sawSharedQ = false;

    for (const moves of roots) {
      const expected = new IsoMaxSolver().solveMoves(moves);
      for (const workers of [1, 2, 4]) {
        const manager = new IsoMaxBranchManager({
          workers,
          qCapacity: 32768,
          queueCapacity: 8192,
          branchCapacity: 2048,
          eventCapacity: 4096,
          classReserve: 262144,
          entryReserve: 524288,
        });
        try {
          const actual = await manager.solveMoves(moves, { timeoutMs: 20000 });
          assert.equal(actual.value, expected.value, 'WDL mismatch workers=' + workers);
          assert.equal(actual.move, expected.move, 'root move mismatch workers=' + workers);
          assert.equal(actual.scheduler.architecture, 'retained-decentralized-shared-tt');
          assert.ok(actual.metrics.worker.claims > 0);
          assert.ok(actual.metrics.worker.claimsByBand.some(value => value > 0));
          if (workers === 1) {
            assert.equal(actual.metrics.worker.claims, 1,
              'one worker must finish from its initial claimed root without replay claims');
            assert.equal(actual.metrics.worker.parentRemoteYields, 0,
              'one worker cannot require remote-child completion');
            assert.equal(actual.metrics.worker.branchDescriptors, 0,
              'one worker has no external parallel opportunity to publish');
            assert.equal(actual.metrics.worker.qCreated, 0,
              'one worker must not materialize branch q records');
          }
          sawFrontier ||= actual.metrics.worker.frontiers > 0;
          sawSharedQ ||= actual.metrics.worker.qCreated > 1 || actual.metrics.worker.qReused > 0;
        } finally {
          await manager.close();
        }
      }
    }

    assert.equal(sawFrontier, true, 'fixture must cross a genuine decision frontier');
    assert.equal(sawSharedQ, true, 'fixture must publish shared canonical q records');
  });

test('shared-TT root witness survives mirror transport and deterministic compression',
  { timeout: 45000 }, async () => {
    const branchRoot = makeCorpus({ seed: 0x1020c5, ply: 32, count: 1 })[0].moves;
    const roots = [
      branchRoot,
      branchRoot.map(column => 6 - column),
      [0, 3, 1, 3, 4, 3], // native forced root before deeper work
      [3, 0, 3, 0, 3, 1], // immediate-win root
      Array.from('5212714351522553524346343412', c => Number(c) - 1),
    ];
    const manager = new IsoMaxBranchManager({
      workers: 2,
      qCapacity: 32768,
      queueCapacity: 8192,
      branchCapacity: 2048,
      eventCapacity: 4096,
      classReserve: 262144,
      entryReserve: 524288,
    });
    try {
      for (const moves of roots) {
        const expected = new IsoMaxSolver().solveMoves(moves);
        const actual = await manager.solveMoves(moves, { timeoutMs: 15000 });
        assert.equal(actual.value, expected.value);
        assert.equal(actual.move, expected.move);
      }
    } finally {
      await manager.close();
    }
  });

test('dead evaluator reservations are recovered from the shared q authority',
  { timeout: 45000 }, async () => {
    const moves = Array.from('717657616532237625', c => Number(c) - 1);
    const expected = new IsoMaxSolver().solveMoves(moves);
    const manager = new IsoMaxBranchManager({
      workers: 2,
      qCapacity: 65536,
      queueCapacity: 16384,
      branchCapacity: 4096,
      eventCapacity: 8192,
      classReserve: 262144,
      entryReserve: 1048576,
    });
    try {
      await manager.start();
      const running = manager.solveMoves(moves, { timeoutMs: 30000 });

      let victim = -1;
      for (let spin = 0; spin < 3000 && victim < 0; spin++) {
        const shared = manager.session?.shared;
        if (shared) {
          const high = Math.min(shared.qCapacity, Atomics.load(shared.control, 14));
          for (let qIndex = 0; qIndex < high; qIndex++) {
            const execution = Atomics.load(shared.qExecution, qIndex);
            if (execution >= 2) {
              victim = execution - 2;
              break;
            }
          }
        }
        if (victim < 0) await new Promise(resolve => setTimeout(resolve, 1));
      }

      assert.ok(victim >= 0, 'test must observe an active shared q reservation');
      await manager.workers[victim].terminate();
      const actual = await running;
      assert.equal(actual.value, expected.value);
      assert.equal(actual.move, expected.move);
      assert.ok(actual.metrics.workerDeathRequeues >= 0);
      assert.ok(manager.workers.filter(Boolean).length === 2);
    } finally {
      await manager.close();
    }
  });

test('shared-TT capacity exhaustion fails closed instead of manufacturing WDL',
  { timeout: 10000 }, async () => {
    const manager = new IsoMaxBranchManager({
      workers: 1,
      qCapacity: 1,
      queueCapacity: 4,
      edgeCapacity: 7,
      branchCapacity: 4,
      eventCapacity: 8,
      classReserve: 65536,
      entryReserve: 131072,
    });
    try {
      await assert.rejects(
        manager.solveMoves([], { timeoutMs: 5000 }),
        /CAPACITY|failed|aborted/i,
      );
    } finally {
      await manager.close();
    }
  });
