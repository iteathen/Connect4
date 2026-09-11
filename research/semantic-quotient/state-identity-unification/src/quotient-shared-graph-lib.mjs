import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

export const SHARED_Q_ILLEGAL = -2;
export const SHARED_Q_TERMINAL_WIN = -1;

export const SHARED_LOWER_MASK = 0b00000011;
export const SHARED_UPPER_MASK = 0b00001100;
export const SHARED_BEST_MASK = 0b01110000;
export const SHARED_INITIAL_RECORD = ((1 + 1) << 2) | (7 << 4);

export function lowerOfSharedRecord(record) {
  return (record & SHARED_LOWER_MASK) - 1;
}

export function upperOfSharedRecord(record) {
  return ((record & SHARED_UPPER_MASK) >>> 2) - 1;
}

export function bestOfSharedRecord(record) {
  const best = (record & SHARED_BEST_MASK) >>> 4;
  return best === 7 ? -1 : best;
}

export function withSharedLower(record, value) {
  return (record & ~SHARED_LOWER_MASK) | ((value + 1) & 3);
}

export function withSharedUpper(record, value) {
  return (record & ~SHARED_UPPER_MASK) | (((value + 1) & 3) << 2);
}

export function withSharedBest(record, best) {
  return (record & ~SHARED_BEST_MASK) | (((best < 0 ? 7 : best) & 7) << 4);
}

export function withSharedBounds(record, lower, upper) {
  return (record & ~(SHARED_LOWER_MASK | SHARED_UPPER_MASK))
    | ((lower + 1) & 3)
    | (((upper + 1) & 3) << 2);
}

export function buildSharedQuotientGraph(spec, options = {}) {
  const { kernel } = createSlot64ResidualQuotientKernel(spec, {
    cacheEdges: true,
    prefixClasses: options.prefixClasses ?? 4096,
  });

  for (let stateId = 0; stateId < kernel.states.count; stateId += 1) {
    for (let column = 0; column < spec.columns; column += 1) kernel.advance(stateId, column);
  }

  const stateCount = kernel.states.count;
  const edgeCount = stateCount * spec.columns;
  const edgeBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * edgeCount);
  const edges = new Int32Array(edgeBuffer);
  edges.set(kernel.states.edges.subarray(0, edgeCount));

  const tacticalBuffer = new SharedArrayBuffer(Int16Array.BYTES_PER_ELEMENT * stateCount);
  const tactical = new Int16Array(tacticalBuffer);
  const rankBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * stateCount);
  const ranks = new Uint8Array(rankBuffer);
  for (let stateId = 0; stateId < stateCount; stateId += 1) {
    tactical[stateId] = kernel.tacticalCode(stateId);
    ranks[stateId] = kernel.supportAccess.rankAt(kernel.states.support[stateId]);
  }

  return Object.freeze({
    kind: 'connect4-shared-precompiled-quotient-graph-v1',
    spec: Object.freeze({ ...spec }),
    rootId: kernel.rootId,
    stateCount,
    edgeCount,
    residualClassCount: kernel.classes.size,
    centerOrder: Object.freeze([...kernel.centerOrder]),
    edgeBuffer,
    tacticalBuffer,
    rankBuffer,
  });
}

export function createSharedProofArena(stateCount) {
  const recordBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * stateCount);
  const record = new Uint8Array(recordBuffer);
  record.fill(SHARED_INITIAL_RECORD);
  return Object.freeze({
    kind: 'connect4-shared-packed-proof-arena-v2',
    stateCount,
    recordBuffer,
  });
}

export function resetSharedProofArena(arena) {
  new Uint8Array(arena.recordBuffer).fill(SHARED_INITIAL_RECORD);
}
