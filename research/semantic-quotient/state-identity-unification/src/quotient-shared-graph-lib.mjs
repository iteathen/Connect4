import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

export {
  QN_ILLEGAL as SHARED_Q_ILLEGAL,
  QN_TERMINAL_WIN as SHARED_Q_TERMINAL_WIN,
} from './quotient-negamax-domain-contract.mjs';

export {
  PROOF_LOWER_MASK as SHARED_LOWER_MASK,
  PROOF_UPPER_MASK as SHARED_UPPER_MASK,
  HINT_BEST_MOVE_MASK as SHARED_BEST_MASK,
  INITIAL_SEARCH_RECORD as SHARED_INITIAL_RECORD,
  proofLower as lowerOfSharedRecord,
  proofUpper as upperOfSharedRecord,
  bestMoveHint as bestOfSharedRecord,
  withProofLower as withSharedLower,
  withProofUpper as withSharedUpper,
  withBestMoveHint as withSharedBest,
  withProofBounds as withSharedBounds,
} from './quotient-negamax-search-record.mjs';

export {
  createSharedProofArena,
  resetSharedProofArena,
} from './quotient-proof-resource-service.mjs';

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
