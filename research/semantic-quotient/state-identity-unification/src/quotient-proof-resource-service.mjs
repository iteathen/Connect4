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

export function resetSharedProofArena(arena) {
  if (!arena || arena.kind !== 'connect4-shared-packed-proof-arena-v3'
      || !(arena.recordBuffer instanceof SharedArrayBuffer)
      || !Number.isInteger(arena.stateCount) || arena.stateCount < 1) {
    throw new TypeError('resetSharedProofArena requires a valid shared proof arena');
  }
  const records = new Uint8Array(arena.recordBuffer);
  if (records.length !== arena.stateCount) throw new Error('shared proof arena record length drifted');
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
      })
    : null;
  let resets = 0;

  function reset() {
    if (graphArena) resetSharedProofArena(graphArena);
    if (semanticArena) resetSemanticSharedTtArena(semanticArena);
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
