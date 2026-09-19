import assert from 'node:assert/strict';
import test from 'node:test';
import { createRbaFiber, createRbaCofactor, solveRbaWdl, subset, normalizeBoundary, intersectLowerBoundaries } from '../rba-wdl-reference.mjs';
import { normalizeResidualRequirements } from '../residual-winspace.mjs';
import { physicalControl } from '../../../experiments/bsfp-rba-reference/physical-control.mjs';
import expectedRank33 from '../../../experiments/bsfp-rba-reference/rank33-expected.json' with { type: 'json' };
import expectedLargerRank33 from '../../../experiments/bsfp-rba-reference/rank33-larger-expected.json' with { type: 'json' };
import { boundaryHash } from '../../../experiments/bsfp-rba-reference/boundary-hash.mjs';

for (const fixture of [expectedRank33, expectedLargerRank33]) test('rank-33 cone reproduces pinned boundary hashes: ' + fixture.minimumHeights, () => {
  const solved = solveRbaWdl(fixture.geometry, { minimumHeights: fixture.minimumHeights });
  assert.equal(solved.metrics.supports, fixture.supports.length);
  for (const expected of fixture.supports) {
    const actual = solved.frontierAt(expected.heights);
    for (const name of ['upper0', 'upper1', 'lowerMinus1', 'lower0']) {
      assert.deepEqual(boundaryHash(actual.fiber, actual[name]), expected[name]);
    }
  }
});

function coordinates(fiber) {
  const result = new Map();
  for (let mask = 0; mask < 2 ** fiber.shapes.length; mask++) {
    const requirements = normalizeResidualRequirements(fiber.shapes.filter((_, i) => mask & 2 ** i));
    result.set(fiber.encode(requirements), requirements);
  }
  return result;
}

test('RBA complete 4x3 WDL and all four thresholds agree with independent physical/q oracle', () => {
  const geometry = { columns: 4, rows: 3, connect: 3 };
  const reference = physicalControl(geometry);
  const result = solveRbaWdl(geometry);
  assert.equal(reference.states.size, 4659);
  assert.equal(reference.edges, 11818);
  assert.equal(result.rootWdl, reference.rootWdl);
  for (const state of reference.states.values()) {
    assert.equal(result.evaluate(state), state.value);
    const f = result.frontierAt(state.heights), mover = state.rank & 1;
    const value = mover ? -state.value : state.value;
    const a = f.fiber.encode(state.p0Requirements), b = f.fiber.encode(state.p1Requirements);
    const q = mover ? f.fiber.pack(b, a) : f.fiber.pack(a, b);
    assert.equal(f.upper0.some(g => subset(g, q)), value >= 0);
    assert.equal(f.upper1.some(g => subset(g, q)), value >= 1);
    assert.equal(f.lowerMinus1.some(g => subset(q, g)), value <= -1);
    assert.equal(f.lower0.some(g => subset(q, g)), value <= 0);
  }
});

test('all abstract 2x2 fibers independently reproduce exact generator sets and terminal cofactors', () => {
  const geometry = { columns: 2, rows: 2, connect: 2 };
  const entries = [];
  const solved = solveRbaWdl(geometry, { onSupport: e => entries.push(e) });
  const tables = new Map();
  for (const e of entries) {
    const { fiber } = e, coords = coordinates(fiber), table = new Map();
    const truths = { upper0: [], upper1: [], lowerMinus1: [], lower0: [] };
    for (const [m, own] of coords) for (const [o, opponent] of coords) {
      const values = [];
      for (let c = 0; c < 2; c++) {
        if (fiber.heights[c] === 2) continue;
        const bit = 1n << BigInt(fiber.heights[c] * 2 + c);
        if (own.includes(bit)) { values.push(1); continue; }
        const h = fiber.heights.slice(); h[c]++;
        const child = solved.frontierAt(h).fiber;
        const nextOwn = normalizeResidualRequirements(own.map(r => r & ~bit));
        const nextOpponent = normalizeResidualRequirements(opponent.filter(r => !(r & bit)));
        const childKey = child.pack(child.encode(nextOpponent), child.encode(nextOwn));
        values.push(-tables.get(h.join(',')).get(childKey));
      }
      const value = values.length ? Math.max(...values) : 0;
      const packed = fiber.pack(m, o);
      table.set(packed, value);
      if (value >= 0) truths.upper0.push(packed);
      if (value >= 1) truths.upper1.push(packed);
      if (value <= -1) truths.lowerMinus1.push(packed);
      if (value <= 0) truths.lower0.push(packed);
    }
    for (const name of Object.keys(truths)) assert.deepEqual(e[name], normalizeBoundary(truths[name], name.startsWith('lower')));
    tables.set(fiber.heights.join(','), table);
    // Test the adjunction on every coordinate, not only reachable colors.
    for (let c = 0; c < 2; c++) if (fiber.heights[c] < 2) {
      const h = fiber.heights.slice(); h[c]++;
      const child = solved.frontierAt(h).fiber;
      for (const owner of [false, true]) {
        const map = createRbaCofactor(fiber, child, c, owner);
        for (const [u] of coords) for (const [v] of coordinates(child)) {
          let image = 0n, terminal = false;
          for (let i = 0; i < fiber.shapes.length; i++) if (u & (1n << BigInt(i))) {
            if (map.images[i] === null) terminal = true;
            else image |= map.images[i];
          }
          assert.equal(!terminal && subset(image, v), subset(u, map.rightAdjoint(v)));
          if (!terminal) assert.equal(subset(v, image), map.minimalCovers(v, null, () => {}).some(g => subset(g, u)));
        }
      }
    }
  }
});

test('local skyline law preserves both factor orientations and outer restriction', () => {
  const values = Array.from({ length: 32 }, (_, i) => BigInt(i));
  for (let seed = 0; seed < 20; seed++) {
    const a = normalizeBoundary(values.filter((_, i) => (i * 7 + seed) % 11 < 4), true);
    const b = normalizeBoundary(values.filter((_, i) => (i * 3 + seed) % 13 < 5), true);
    const expected = normalizeBoundary(a.flatMap(x => b.map(y => x & y)), true);
    assert.deepEqual(intersectLowerBoundaries(a, b), expected);
    assert.deepEqual(intersectLowerBoundaries(b, a), expected);
    for (const outer of a) for (const restriction of values.filter(x => subset(x, outer))) {
      const restricted = normalizeBoundary(b.map(x => x & restriction), true);
      assert(restricted.length <= normalizeBoundary(b.map(x => x & outer), true).length);
    }
  }
});

test('RBA support, closure, and capacity rejections cannot be reported as a draw', () => {
  const geometry = { columns: 2, rows: 2, connect: 2 };
  assert.throws(() => solveRbaWdl(geometry, { maxSupports: 1 }), /RBA_SUPPORT_LIMIT/);
  assert.throws(() => solveRbaWdl(geometry, { maxCandidates: 1 }), /RBA_CANDIDATE_LIMIT/);
  assert.throws(() => solveRbaWdl(geometry, { maxFrontier: 1 }), /RBA_FRONTIER_LIMIT/);
  const fiber = createRbaFiber(geometry, [0, 0]);
  assert.throws(() => fiber.encode([0n]), /outside/);
  assert.throws(() => fiber.pack(fiber.top + 1n, 0n), /invalid/);
  assert.throws(() => createRbaCofactor(fiber, fiber, 0, true), /legal support edge/);
  const late = createRbaFiber(geometry, [1, 0]);
  const cofactor = createRbaCofactor(fiber, late, 0, true);
  assert.throws(() => cofactor.rightAdjoint(late.top + 1n), /invalid fiber upset/);
  assert.throws(() => cofactor.minimalCovers(late.top + 1n, null, () => {}), /invalid fiber upset/);
  const nonClosed = late.up.find(x => (x & (x - 1n)) !== 0n);
  assert.throws(() => late.pack(nonClosed & -nonClosed, 0n), /not an upset/);
});
