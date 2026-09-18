import { estimateLocalSemanticDescriptorBytes } from './quotient-local-semantic-descriptor.mjs';
import { estimateSemanticSharedTtBytes } from './quotient-semantic-shared-tt.mjs';

function ceilPower(value) {
  let capacity = 1;
  while (BigInt(capacity) < value && capacity < 2 ** 29) capacity *= 2;
  return capacity;
}

// Initialization only. This counts a superset of legal colored positions:
// gravity-consistent support patterns times alternating-player color counts.
// Wins/unreachable move orders and semantic quotienting can only reduce it.
export function boundedPositionUpperBound(domain, requestedDepth) {
  const { columns, rows } = domain;
  if (!Number.isInteger(columns) || columns < 1 || columns > 7 || !Number.isInteger(rows) || rows < 1
      || columns * rows > 64 || !Number.isSafeInteger(requestedDepth) || requestedDepth < 1) {
    throw new RangeError('invalid bounded search geometry or depth');
  }
  const depth = Math.min(requestedDepth, columns * rows);
  let supports = Array(depth + 1).fill(0n); supports[0] = 1n;
  for (let column = 0; column < columns; column++) {
    const next = Array(depth + 1).fill(0n);
    for (let ply = 0; ply <= depth; ply++) {
      for (let height = 0; height <= rows && ply + height <= depth; height++) next[ply + height] += supports[ply];
    }
    supports = next;
  }
  let total = 0n;
  for (let ply = 0; ply <= depth; ply++) {
    let colors = 1n;
    for (let i = 1; i <= Math.floor(ply / 2); i++) colors = colors * BigInt(ply - i + 1) / BigInt(i);
    total += supports[ply] * colors;
  }
  return total;
}

export function createBoundedStoragePlan(kernel, depth, budgetBytes) {
  if (!Number.isSafeInteger(budgetBytes) || budgetBytes < 1) throw new RangeError('invalid bounded reservation budget');
  const domain = kernel.domain, vocabulary = kernel.classes.termVocabulary;
  const bound = boundedPositionUpperBound(domain, depth);
  const fullStates = Math.max(kernel.states.capacity, ceilPower(bound));
  // Every surviving requirement descends from one original winning line.
  // Per TT slot, at most L term words and L three-word chunk headers can ever
  // be allocated as its span grows monotonically to maximum length L.
  const maxDescriptorTerms = vocabulary.lineCount * 2;
  const termWordsPerEntry = Math.max(1, maxDescriptorTerms * 4);
  let entries = 8;
  const proofBudget = Math.floor(budgetBytes / 4);
  while (entries * 2 <= fullStates && entries * 2 * termWordsPerEntry <= 0x7fffffff
      && estimateSemanticSharedTtBytes(entries * 2, entries * 2 * termWordsPerEntry) <= proofBudget) entries *= 2;
  const arena = Object.freeze({ entryCapacity: entries, termCapacity: entries * termWordsPerEntry });
  const arenaBytes = estimateSemanticSharedTtBytes(arena.entryCapacity, arena.termCapacity);
  let states = fullStates;
  while (states >= kernel.states.capacity) {
    // Two player classes per state, plus an empty bootstrap class. Under a
    // capped run reserve capacity for two classes for every admitted state.
    const classes = Math.max(1024, ceilPower(bound * 2n + 1n < BigInt(states) * 2n ? bound * 2n + 1n : BigInt(states) * 2n));
    const searchStorage = Object.freeze({ states, classes, chunksPerSlot: classes });
    const kernelBytes = kernel.estimateSearchStorageBytes(searchStorage);
    const descriptorBytes = estimateLocalSemanticDescriptorBytes(states, classes, vocabulary.count);
    const estimatedBytes = kernelBytes + descriptorBytes + arenaBytes;
    if (estimatedBytes <= budgetBytes) {
      const fullBoundCovered = BigInt(states) >= bound && BigInt(classes) >= bound * 2n;
      return Object.freeze({ kind: 'board-depth-bounded-reservation-v1', domain, depth, budgetBytes,
        positionUpperBound: bound.toString(), fullBoundCovered,
        limitingResource: fullBoundCovered ? 'board-depth-bound' : 'reservation-budget-or-index-domain',
        searchStorage, arena, kernelBytes, descriptorBytes, arenaBytes, estimatedBytes,
        budgetScope: 'retained kernel, descriptor metadata/scratch and shared arena; excludes V8 heap, transient growth copies and shared-view scratch' });
    }
    states /= 2;
  }
  throw new RangeError('bounded reservation budget cannot hold minimum initialized storage');
}
