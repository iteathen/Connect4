const BOARD_CELLS = 42;
const LOW_MASK = (1n << 32n) - 1n;

function nextXorshift32(state) {
  let x = state.value >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.value = x >>> 0;
  return state.value;
}

function randomMaskOfCardinality(state, cardinality) {
  const bits = Array.from({ length: BOARD_CELLS }, (_, index) => index);
  for (let index = 0; index < cardinality; index += 1) {
    const selected = index + (nextXorshift32(state) % (BOARD_CELLS - index));
    [bits[index], bits[selected]] = [bits[selected], bits[index]];
  }
  let mask = 0n;
  for (let index = 0; index < cardinality; index += 1) mask |= 1n << BigInt(bits[index]);
  return mask;
}

function key(mask) { return mask.toString(16).padStart(11, '0'); }

function packed(mask) {
  return Object.freeze({
    low: Number(mask & LOW_MASK) >>> 0,
    high: Number(mask >> 32n) >>> 0,
  });
}

function bitCount(mask) {
  let value = mask;
  let count = 0;
  while (value !== 0n) {
    value &= value - 1n;
    count += 1;
  }
  return count;
}

function containsSubset(mask, accepted) {
  for (const subset of accepted) if ((subset & mask) === subset) return true;
  return false;
}

function createUniqueMasks(state, count, cardinality) {
  const result = [];
  const seen = new Set();
  while (result.length < count) {
    const mask = randomMaskOfCardinality(state, cardinality);
    const id = key(mask);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(mask);
  }
  return result;
}

function createDominatedMasks(state, accepted, count, occupied) {
  const result = [];
  let sourceIndex = 0;
  while (result.length < count) {
    const source = accepted[sourceIndex % accepted.length];
    sourceIndex += 1;
    const start = nextXorshift32(state) % BOARD_CELLS;
    let emitted = false;
    for (let offset = 0; offset < BOARD_CELLS; offset += 1) {
      const bit = (start + offset) % BOARD_CELLS;
      const bitMask = 1n << BigInt(bit);
      if ((source & bitMask) !== 0n) continue;
      const candidate = source | bitMask;
      const id = key(candidate);
      if (occupied.has(id)) continue;
      occupied.add(id);
      result.push(candidate);
      emitted = true;
      break;
    }
    if (!emitted && sourceIndex > accepted.length * BOARD_CELLS * 2) throw new RangeError('unable to construct enough unique dominated masks');
  }
  return result;
}

function createUndominatedMasks(state, accepted, count, occupied) {
  const result = [];
  let attempts = 0;
  const maximumAttempts = Math.max(100_000, count * 10_000);
  while (result.length < count) {
    if (attempts++ > maximumAttempts) throw new RangeError('unable to construct enough undominated masks');
    const candidate = randomMaskOfCardinality(state, 22);
    const id = key(candidate);
    if (occupied.has(id) || containsSubset(candidate, accepted)) continue;
    occupied.add(id);
    result.push(candidate);
  }
  return result;
}

function packMasks(masks) {
  const low = new Uint32Array(masks.length);
  const high = new Uint32Array(masks.length);
  const popcount = new Uint32Array(masks.length);
  for (let index = 0; index < masks.length; index += 1) {
    const lanes = packed(masks[index]);
    low[index] = lanes.low;
    high[index] = lanes.high;
    popcount[index] = bitCount(masks[index]);
  }
  return Object.freeze({ low, high, popcount });
}

export function createMinimalDominanceFixture({ frontierCount, candidateCount, seed = 0x6d2b79f5 } = {}) {
  if (!Number.isSafeInteger(frontierCount) || frontierCount < 1) throw new RangeError('frontierCount must be a positive safe integer');
  if (!Number.isSafeInteger(candidateCount) || candidateCount < 2 || (candidateCount & 1) !== 0) throw new RangeError('candidateCount must be a positive even safe integer >= 2');
  const state = { value: seed >>> 0 };
  const accepted = createUniqueMasks(state, frontierCount, 21);
  const occupied = new Set(accepted.map(key));
  const half = candidateCount / 2;
  const dominated = createDominatedMasks(state, accepted, half, occupied);
  const undominated = createUndominatedMasks(state, accepted, half, occupied);
  const candidates = new Array(candidateCount);
  const expectedDominated = new Uint32Array(candidateCount);
  for (let index = 0; index < half; index += 1) {
    candidates[index * 2] = dominated[index];
    expectedDominated[index * 2] = 1;
    candidates[index * 2 + 1] = undominated[index];
  }

  const frontierPacked = packMasks(accepted);
  const candidatePacked = packMasks(candidates);
  const combinedMasks = [...accepted, ...candidates];
  const combinedPacked = packMasks(combinedMasks);
  const expectedFrontierKeys = Object.freeze([...accepted, ...undominated].map(key).sort());

  for (const mask of accepted) if (bitCount(mask) !== 21) throw new Error('accepted frontier cardinality drifted');
  for (let index = 0; index < candidates.length; index += 1) {
    if (bitCount(candidates[index]) !== 22) throw new Error('candidate cardinality drifted');
    const actual = containsSubset(candidates[index], accepted) ? 1 : 0;
    if (actual !== expectedDominated[index]) throw new Error(`fixture dominance mismatch at candidate ${index}`);
  }

  return Object.freeze({
    kind: 'connect4-bsfp-tensor-dominance-overflow-minimal-v0',
    boardCells: BOARD_CELLS,
    frontierCount,
    candidateCount,
    combinedCount: combinedMasks.length,
    expectedDominatedCount: half,
    expectedSurvivorCount: half,
    expectedFinalFrontierCount: frontierCount + half,
    frontierLo: frontierPacked.low,
    frontierHi: frontierPacked.high,
    frontierPopcount: frontierPacked.popcount,
    candidateLo: candidatePacked.low,
    candidateHi: candidatePacked.high,
    candidatePopcount: candidatePacked.popcount,
    combinedLo: combinedPacked.low,
    combinedHi: combinedPacked.high,
    combinedPopcount: combinedPacked.popcount,
    expectedDominated,
    expectedFrontierKeys,
    keyFromPacked(low, high) { return key((BigInt(high >>> 0) << 32n) | BigInt(low >>> 0)); },
  });
}
