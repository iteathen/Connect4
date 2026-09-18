import { INITIAL_SEARCH_RECORD } from './quotient-negamax-search-record.mjs';
import {
  createSemanticSharedTtArena,
  resetSemanticSharedTtArena,
} from './quotient-semantic-shared-tt.mjs';

export function createSharedProofArena(stateCount) {
  if (!Number.isInteger(stateCount) || stateCount < 1) {
    throw new RangeError('shared proof arena stateCount must be a positive integer');
  }
  const byteLength = Uint8Array.BYTES_PER_ELEMENT * stateCount;
  if (!Number.isSafeInteger(byteLength)) throw new RangeError(`shared proof arena byte length overflow for ${stateCount} states`);
  const recordBuffer = new SharedArrayBuffer(byteLength);
  const record = new Uint8Array(recordBuffer);
  record.fill(INITIAL_SEARCH_RECORD);
  return Object.freeze({
    kind: 'connect4-shared-packed-proof-arena-v3',
    stateCount,
    recordBuffer,
  });
}

export function assertSharedProofArena(arena) {
  arena = arena && { ...arena };
  if (!arena || arena.kind !== 'connect4-shared-packed-proof-arena-v3'
      || !(arena.recordBuffer instanceof SharedArrayBuffer)
      || arena.recordBuffer.growable
      || !Number.isSafeInteger(arena.stateCount) || arena.stateCount < 1) {
    throw new TypeError('resetSharedProofArena requires a valid shared proof arena');
  }
  const records = new Uint8Array(arena.recordBuffer);
  if (records.length !== arena.stateCount) throw new Error('shared proof arena record length drifted');
  return Object.freeze(arena);
}

export function resetSharedProofArena(arena) {
  arena = assertSharedProofArena(arena);
  const records = new Uint8Array(arena.recordBuffer);
  records.fill(INITIAL_SEARCH_RECORD);
}

export function createProofResourceService(stateCount, semanticOptions = null) {
  if (!Number.isInteger(stateCount) || stateCount < 0) {
    throw new RangeError('proof resource service stateCount must be a non-negative integer');
  }
  if (semanticOptions !== null && (typeof semanticOptions !== 'object' || Array.isArray(semanticOptions))) {
    throw new TypeError('semantic proof options must be null or an object');
  }
  const graphArena = stateCount > 0 ? createSharedProofArena(stateCount) : null;
  const semanticArena = semanticOptions
    ? createSemanticSharedTtArena({
        entryCapacity: semanticOptions.entryCapacity,
        termCapacity: semanticOptions.termCapacity,
        associativity: semanticOptions.associativity,
        domainSpec: semanticOptions.domainSpec,
      })
    : null;
  let resets = 0;

  function reset() {
    // The semantic arena performs the fallible quiescence gate before either
    // proof format is cleared. Both resets still require owner-wide quiescence.
    if (semanticArena) resetSemanticSharedTtArena(semanticArena);
    if (graphArena) resetSharedProofArena(graphArena);
    resets += 1;
  }

  return Object.freeze({
    graphArena,
    semanticArena,
    reset,
    stats: () => Object.freeze({
      resets,
      graphArenaEnabled: graphArena !== null,
      semanticTtEnabled: semanticArena !== null,
      graphStateCount: graphArena?.stateCount ?? 0,
      semanticEntryCapacity: semanticArena?.entryCapacity ?? 0,
      semanticTermCapacity: semanticArena?.termCapacity ?? 0,
    }),
  });
}
