import assert from 'node:assert/strict';
import test from 'node:test';
import { cofactorUpward, cofactorDownward, readCompactHybridOptions, solveCompactHybrid } from '../run.mjs';
import { createReferenceReducer, createFrontierObserver } from '../qualification.mjs';
import { normalizeMinimalOwnershipAntichain, normalizeMaximalOwnershipAntichain } from '../../../components/bsfp/ownership-antichain-solver.mjs';

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
    for (const supportShardSize of [1, 17, 256]) {
      const observer = createFrontierObserver(geometry);
      const reducer = createReferenceReducer();
      const result = await solveCompactHybrid(geometry, { ...readCompactHybridOptions({}), supportShardSize }, reducer, {
        onFrontier: observer.onFrontier, progress: false,
      });
      assert.equal(result.rootWdl, observer.reference.rootWdl);
      assert.equal(observer.finish().comparedSupports, result.supportSkeletons);
      assert.equal(result.metrics.processedSupports, result.supportSkeletons);
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
