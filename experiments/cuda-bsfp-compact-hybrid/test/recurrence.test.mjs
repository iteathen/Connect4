import assert from 'node:assert/strict';
import test from 'node:test';
import { cofactorUpward, cofactorDownward, readCompactHybridOptions, solveCompactHybrid, reflectPacked42, reflectSupportIndex, partitionIntersection } from '../run.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';
import { createReferenceReducer, createFrontierObserver } from '../qualification.mjs';
import { normalizeMinimalOwnershipAntichain, normalizeMaximalOwnershipAntichain } from '../../../components/bsfp/ownership-antichain-solver.mjs';

test('oversized intersections tile the complete Cartesian domain exactly once', () => {
  const left = Array.from({ length: 31 }, (_, i) => i);
  const right = Array.from({ length: 17 }, (_, i) => i + 100);
  for (const limits of [{ leftCapacity: 3, rightCapacity: 5, candidateCapacity: 7 }, { leftCapacity: 9, rightCapacity: 2, candidateCapacity: 19 }]) {
    const pairs = new Set();
    for (const tile of partitionIntersection(left, right, limits)) {
      assert(tile.left.length <= limits.leftCapacity);
      assert(tile.right.length <= limits.rightCapacity);
      assert(tile.left.length * tile.right.length <= limits.candidateCapacity);
      for (const a of tile.left) for (const b of tile.right) { const key = a + ':' + b; assert(!pairs.has(key)); pairs.add(key); }
    }
    assert.equal(pairs.size, left.length * right.length);
  }
});

test('actual P2 bounded-tile merges match every frontier for both polarities', async () => {
  for (const geometry of [{ columns: 4, rows: 3, connect: 3 }, { columns: 4, rows: 4, connect: 3 }]) {
    const observer = createFrontierObserver(geometry);
    const reducer = createReferenceReducer();
    const reduce = reducer.reduce;
    reducer.limits = { leftCapacity: 3, rightCapacity: 5, candidateCapacity: 7 };
    const directions = new Set();
    reducer.reduce = async jobs => {
      for (const job of jobs) {
        assert(job.left.length <= 3 && job.right.length <= 5 && job.left.length * job.right.length <= 7);
        directions.add(job.direction);
      }
      return reduce(jobs);
    };
    const result = await solveCompactHybrid(geometry, readCompactHybridOptions({}), reducer, { onFrontier: observer.onFrontier, progress: false });
    assert(result.metrics.tiledIntersections > 0);
    assert(result.metrics.intersectionTiles > result.metrics.tiledIntersections);
    assert.equal(observer.finish().comparedSupports, result.supportSkeletons);
    assert.deepEqual([...directions].sort(), [0, 1]);
  }
});

test('P2 cofactors agree with valuation substitution, including bits 31, 32 and 41', () => {
  const cells = [0, 3, 31, 32, 41];
  const masks = Array.from({ length: 32 }, (_, bits) => cells.reduce((m, cell, i) => m | ((bits & (1 << i)) ? 1n << BigInt(cell) : 0n), 0n));
  for (let sample = 0; sample < 32; sample++) {
    const input = masks.filter((_, i) => ((i * 13 + sample * 7) % 19) < 7);
    for (const upward of [true, false]) {
      const frontier = (upward ? normalizeMinimalOwnershipAntichain : normalizeMaximalOwnershipAntichain)(input);
      const accepts = (values, x) => values.some(m => upward ? (m & x) === m : (m & x) === x);
      for (const cell of cells) for (const mover of [0, 1]) {
        const bit = 1n << BigInt(cell);
        const actual = (upward ? cofactorUpward : cofactorDownward)(frontier.map(Number), cell, mover).map(BigInt);
        for (const mask of masks) {
          const parent = mask & ~bit;
          assert.equal(accepts(actual, parent), accepts(frontier, mover === 0 ? parent | bit : parent),
            `sample=${sample} cell=${cell} mover=${mover} upward=${upward}`);
        }
      }
    }
  }
});

for (const geometry of [
  { columns: 4, rows: 3, connect: 3 },
  { columns: 4, rows: 4, connect: 4 },
  { columns: 5, rows: 3, connect: 4 },
  { columns: 4, rows: 4, connect: 3 },
  { columns: 4, rows: 5, connect: 4 },
]) {
  test(`actual P2 recurrence matches every reference frontier: ${JSON.stringify(geometry)}`, async () => {
    for (const supportShardSize of [1, 17, 256]) for (const reflection of [false, true]) for (const cofactorPreservation of [false, true]) {
      const observer = createFrontierObserver(geometry);
      const reducer = createReferenceReducer();
      const result = await solveCompactHybrid(geometry, { ...readCompactHybridOptions({}), supportShardSize, reflection, cofactorPreservation }, reducer, {
        onFrontier: observer.onFrontier, progress: false,
      });
      assert.equal(result.rootWdl, observer.reference.rootWdl);
      assert.equal(observer.finish().comparedSupports, result.supportSkeletons);
      const fixed = (geometry.rows + 1) ** Math.ceil(geometry.columns / 2);
      assert.equal(result.metrics.processedSupports, reflection ? (result.supportSkeletons + fixed) / 2 : result.supportSkeletons);
      assert.equal(reducer.snapshotStats().closed, true);
    }
  });
}

test('P2 closes its reducer on failure without publishing partial frontiers', async () => {
  const reducer = createReferenceReducer();
  reducer.reduce = async () => { throw new Error('qualification failure'); };
  await assert.rejects(solveCompactHybrid({ columns: 4, rows: 3, connect: 3 }, readCompactHybridOptions({}), reducer, { progress: false }), /qualification failure/);
  assert.equal(reducer.snapshotStats().closed, true);
});

test('packed reflection is an involution across the u32 seam and support orientation', () => {
  const geometry = { columns: 7, rows: 6, connect: 4 };
  const support = createBsfpSupportLatticeProfile(geometry);
  for (let cell = 0; cell < 42; cell++) {
    const reflected = reflectPacked42(2 ** cell, 7);
    const target = Math.floor(cell / 7) * 7 + 6 - cell % 7;
    assert.equal(reflected, 2 ** target);
    assert.equal(reflectPacked42(reflected, 7), 2 ** cell);
  }
  for (let index = 0; index < support.itemCapacity; index += 101) {
    const mirrored = reflectSupportIndex(index, support);
    assert.deepEqual([...support.decodeHeights(mirrored)], [...support.decodeHeights(index)].reverse());
    assert.equal(reflectSupportIndex(mirrored, support), index);
  }
});
