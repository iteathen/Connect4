import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

export const SHARED_Q_ILLEGAL = -2;
export const SHARED_Q_TERMINAL_WIN = -1;

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
    centerOrder: Object.freeze([...kernel.centerOrder]),
    edgeBuffer,
    tacticalBuffer,
    rankBuffer,
  });
}

export function createSharedProofArena(stateCount) {
  const lowerBuffer = new SharedArrayBuffer(Int8Array.BYTES_PER_ELEMENT * stateCount);
  const upperBuffer = new SharedArrayBuffer(Int8Array.BYTES_PER_ELEMENT * stateCount);
  const bestMoveBuffer = new SharedArrayBuffer(Int8Array.BYTES_PER_ELEMENT * stateCount);
  const lower = new Int8Array(lowerBuffer);
  const upper = new Int8Array(upperBuffer);
  const bestMove = new Int8Array(bestMoveBuffer);
  lower.fill(-1);
  upper.fill(1);
  bestMove.fill(-1);
  return Object.freeze({
    kind: 'connect4-shared-proof-arena-v1',
    stateCount,
    lowerBuffer,
    upperBuffer,
    bestMoveBuffer,
  });
}

export function resetSharedProofArena(arena) {
  new Int8Array(arena.lowerBuffer).fill(-1);
  new Int8Array(arena.upperBuffer).fill(1);
  new Int8Array(arena.bestMoveBuffer).fill(-1);
}
