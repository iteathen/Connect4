import { INITIAL_SEARCH_RECORD } from './quotient-negamax-search-record.mjs';
import {
  createSemanticSharedTtArena,
  resetSemanticSharedTtArena,
} from './quotient-semantic-shared-tt.mjs';

export function createSharedProofArena(stateCount) {
  const recordBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * stateCount);
  const record = new Uint8Array(recordBuffer);
  record.fill(INITIAL_SEARCH_RECORD);
  return Object.freeze({
    kind: 'connect4-shared-packed-proof-arena-v3',
    stateCount,
    recordBuffer,
  });
}

export function resetSharedProofArena(arena) {
  new Uint8Array(arena.recordBuffer).fill(INITIAL_SEARCH_RECORD);
}

export function createProofResourceService(stateCount, semanticOptions = null) {
  const graphArena = createSharedProofArena(stateCount);
  const semanticArena = semanticOptions
    ? createSemanticSharedTtArena({
        entryCapacity: semanticOptions.entryCapacity,
        termCapacity: semanticOptions.termCapacity,
      })
    : null;
  let resets = 0;

  function reset() {
    resetSharedProofArena(graphArena);
    if (semanticArena) resetSemanticSharedTtArena(semanticArena);
    resets += 1;
  }

  return Object.freeze({
    graphArena,
    semanticArena,
    reset,
    stats: () => Object.freeze({ resets, semanticTtEnabled: semanticArena !== null }),
  });
}
