// Qualification-only reference reducer and frontier observer. Never used by
// the native solver unless explicitly requested as an independent observer.
import assert from 'node:assert/strict';
import {
  normalizeMinimalOwnershipAntichain,
  normalizeMaximalOwnershipAntichain,
} from '../../components/bsfp/ownership-antichain-solver.mjs';
import { solveBsfpPacked42AntichainRootWdlRolling } from '../../components/bsfp/ownership-antichain-packed42-rolling-solver.mjs';
import { SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION as DIRECTION } from '../../components/bsfp/cuda/packed42-direction.mjs';

export function createReferenceReducer() {
  let generatedPairCandidates = 0;
  let closed = false;
  return {
    async reduce(jobs) {
      assert.equal(closed, false);
      return jobs.map(({ left, right, direction }) => {
        const minimal = direction === DIRECTION.MINIMAL;
        assert(minimal || direction === DIRECTION.MAXIMAL);
        const products = [];
        for (const a of left) for (const b of right) {
          products.push(minimal ? BigInt(a) | BigInt(b) : BigInt(a) & BigInt(b));
          generatedPairCandidates++;
        }
        return Object.freeze((minimal ? normalizeMinimalOwnershipAntichain : normalizeMaximalOwnershipAntichain)(products).map(Number));
      });
    },
    snapshotStats: () => ({ generatedPairCandidates, closed }),
    async close() { closed = true; },
  };
}

export function createFrontierObserver(geometry) {
  const expected = new Map();
  const reference = solveBsfpPacked42AntichainRootWdlRolling({
    ...geometry, onFrontier: (index, frontier) => expected.set(index, frontier),
  });
  const seen = new Set();
  const sorted = (values) => [...values].sort((a, b) => a - b);
  return {
    reference,
    onFrontier(index, frontier) {
      assert(!seen.has(index), `duplicate support ${index}`);
      seen.add(index);
      for (const side of ['wins', 'losses']) {
        assert.deepEqual(sorted(frontier[side]), sorted(expected.get(index)[side]), `support ${index} ${side}`);
      }
    },
    finish() {
      assert.equal(seen.size, expected.size, 'incomplete support observation');
      return { comparedSupports: seen.size, frontierMismatches: 0 };
    },
  };
}
