import assert from 'node:assert/strict';
import { r3, prepareCase, synthesizeSupport, directRestrictPair, semanticKey } from '../../reference/research-prototypes/2026-09-10-oqs/incremental-oqs.mjs';

export function buildOqsFixtures(spec, { portable = false } = {}) {
  const prepared = prepareCase({ ...spec, selection: 'supports', supports: [] });
  let supports;
  if (spec.columns === 5 && spec.rows === 5) supports = [4426, 4743, 6351, 6465];
  else {
    let worst = 0; let width = -1;
    for (let i = 0; i < prepared.solution.support.itemCapacity; i++) {
      const f = prepared.solution.frontierAt(i);
      if (f.wins.length + f.losses.length > width) { worst = i; width = f.wins.length + f.losses.length; }
    }
    supports = [worst];
  }
  const fixtures = []; const summaries = [];
  for (const supportIndex of supports) {
    // R5 costly supports keep R6's count-only independent qualification scope.
    const oracleMode = spec.columns !== 5 || spec.rows !== 5 || supportIndex === 4426;
    const result = synthesizeSupport({ spec, prepared, supportIndex, oracleMode, validateDirect: true,
      onTransition(t) { fixtures.push({ ...t, supportIndex, oracleMode }); },
    });
    const { layerSummaries, ...summary } = result;
    summaries.push(summary);
    if (portable) break;
  }
  return { fixtures, summaries, c1SolveMs: prepared.c1SolveMs, lineOrderMs: prepared.lineOrderMs };
}

export function packOqsFixture(fixture, shape) {
  const data = Object.fromEntries(Object.entries(shape.inputSizes).map(([n, size]) => [n, new Uint32Array(size)]));
  assert(fixture.states.length <= shape.stateCapacity);
  assert(fixture.states.length * fixture.inputs.length <= shape.candidateCapacity);
  const split = (mask) => { assert(mask >= 0n && mask < 1n << 42n); return [Number(mask & 0xffff_ffffn), Number(mask >> 32n)]; };
  const put = (lo, hi, i, mask) => { [data[lo][i], data[hi][i]] = split(mask); };
  const positions = { Win: 0, Loss: 0 };
  fixture.states.forEach((state, i) => {
    put('stateXLo', 'stateXHi', i, state.xMask);
    for (const side of ['Win', 'Loss']) {
      const masks = state.pair[side === 'Win' ? 'wins' : 'losses'];
      assert(masks.length <= shape.frontierCapacity);
      assert(positions[side] + masks.length <= shape.recordCapacity);
      data[`state${side}Offsets`][i] = positions[side];
      for (const mask of masks) put(`state${side}Lo`, `state${side}Hi`, positions[side]++, mask);
      data[`state${side}Offsets`][i + 1] = positions[side];
    }
  });
  data.activeStateCount[0] = fixture.states.length;
  const fixed = r3.cellsMask(fixture.introduced);
  data.cutMeta.set([...split(fixed), ...split(fixture.nextCrossingMask), fixture.inputs.length]);
  fixture.inputs.forEach((mask, i) => put('inputP0Lo', 'inputP0Hi', i, mask));
  return data;
}

export function verifyOqsOutput(fixture, output, shape) {
  assert.equal(output.count, fixture.candidates.length);
  const unpack = (lo, hi) => BigInt(lo) | (BigInt(hi) << 32n);
  const keys = new Set();
  const setKey = (s) => `${s.xMask}|${s.pair.wins.map(String).sort().join(',')}|${s.pair.losses.map(String).sort().join(',')}`;
  fixture.candidates.forEach((expected, i) => {
    const xMask = unpack(output.candidateXLo[i], output.candidateXHi[i]);
    assert.equal(xMask, expected.xMask, `crossing candidate ${i}`);
    const pair = {};
    for (const side of ['Win', 'Loss']) {
      const name = side === 'Win' ? 'wins' : 'losses';
      const count = output[`output${side}Counts`][i];
      const masks = Array.from({ length: count }, (_, j) => unpack(output[`output${side}Lo`][i * shape.frontierCapacity + j], output[`output${side}Hi`][i * shape.frontierCapacity + j]));
      const ordered = masks.map(String).sort();
      assert.equal(new Set(ordered).size, count, `duplicate ${side} candidate ${i}`);
      assert.deepEqual(ordered, expected.pair[name].map(String).sort(), `${side} candidate ${i}`);
      // Semantic equality is set equality, not arrival order or hash equality.
      pair[name] = masks.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    }
    keys.add(setKey({ xMask, pair }));
  });
  assert.deepEqual(keys, new Set(fixture.nextStates.map(setKey)), 'next exact quotient target coverage');
}

export function highLaneFixture() {
  const bits = [31, 32, 41].map(c => 1n << BigInt(c));
  const universe = bits.reduce((a, b) => a | b, 0n);
  const states = [{ xMask: 0n, pair: { wins: [bits[0] | bits[1], bits[0] | bits[2]], losses: [bits[0], bits[1]] } }];
  const introduced = [31, 32, 41];
  const inputs = r3.enumerateAssignments(introduced);
  const candidates = inputs.map(input => ({ xMask: input & universe, pair: directRestrictPair(states[0].pair, introduced, input) }));
  return { states, introduced, inputs, nextCrossingMask: universe, candidates,
    nextStates: [...new Map(candidates.map(s => [semanticKey(s.xMask, s.pair), s])).values()] };
}
