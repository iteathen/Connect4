import {
  INITIAL_SEARCH_RECORD,
  assertSearchRecord,
  proofLower,
  proofUpper,
  bestMoveHint,
  withProofLower,
  withProofUpper,
  withBestMoveHint,
  withProofBounds,
} from './quotient-negamax-search-record.mjs';
import { assertWdlValue } from './quotient-negamax-domain-contract.mjs';
import { assertSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';
import { assertSharedProofArena, resetSharedProofArena } from './quotient-proof-resource-service.mjs';

function createStaticPackedProofStore(arena) {
  arena = assertSharedProofArena(arena);
  const records = new Uint8Array(arena.recordBuffer);
  const metrics = {
    reads: 0,
    publications: 0,
    retries: 0,
    staleReads: 0,
    stalePublications: 0,
    waits: 0,
  };

  function isCurrent(slot) {
    return Number.isInteger(slot) && slot >= 0 && slot < records.length;
  }

  function assertSlot(slot) {
    if (!isCurrent(slot)) throw new RangeError(`packed proof slot ${slot} is outside 0..${records.length - 1}`);
  }

  function load(slot) {
    assertSlot(slot);
    metrics.reads += 1;
    return assertSearchRecord(Atomics.load(records, slot));
  }

  function update(slot, transform) {
    assertSlot(slot);
    while (true) {
      const current = assertSearchRecord(Atomics.load(records, slot));
      const next = assertSearchRecord(transform(current));
      if (next === current) return current;
      const observed = Atomics.compareExchange(records, slot, current, next);
      if (observed === current) {
        metrics.publications += 1;
        return next;
      }
      metrics.retries += 1;
    }
  }

  function reset() {
    resetSharedProofArena(arena);
  }

  return Object.freeze({ isCurrent, load, update, reset, metrics });
}

function createSemanticPackedProofStore(arena) {
  arena = assertSemanticSharedTtArena(arena);
  const records = new Uint8Array(arena.recordBuffer);
  const status = new Int32Array(arena.statusBuffer);
  const generation = new Uint32Array(arena.generationBuffer);
  const ready = arena.slotStates.ready;
  const proofWriting = arena.slotStates.proofWriting;
  const metrics = {
    reads: 0,
    publications: 0,
    retries: 0,
    staleReads: 0,
    stalePublications: 0,
    waits: 0,
  };

  function decode(handle) {
    if (!Number.isSafeInteger(handle) || handle < arena.entryCapacity) return null;
    const slot = handle % arena.entryCapacity;
    const generationValue = Math.floor(handle / arena.entryCapacity);
    if (generationValue < 1 || generationValue > arena.generationLimit) return null;
    return { slot, generationValue };
  }

  function isCurrent(handle) {
    const decoded = decode(handle);
    if (decoded === null) return false;
    const { slot, generationValue } = decoded;
    if (Atomics.load(generation, slot) !== generationValue) return false;
    const state = Atomics.load(status, slot);
    return state === ready || state === proofWriting;
  }

  function staleRead() {
    metrics.staleReads += 1;
    return INITIAL_SEARCH_RECORD;
  }

  function load(handle) {
    metrics.reads += 1;
    const decoded = decode(handle);
    if (decoded === null) return staleRead();
    const { slot, generationValue } = decoded;

    while (true) {
      if (Atomics.load(generation, slot) !== generationValue) return staleRead();
      const state = Atomics.load(status, slot);
      if (state === proofWriting) {
        metrics.waits += 1;
        Atomics.wait(status, slot, proofWriting, 1);
        continue;
      }
      if (state !== ready) return staleRead();

      const record = Atomics.load(records, slot);
      const generationAfter = Atomics.load(generation, slot);
      const stateAfter = Atomics.load(status, slot);
      if (generationAfter !== generationValue) return staleRead();
      if (stateAfter === ready || stateAfter === proofWriting) return assertSearchRecord(record);
      return staleRead();
    }
  }

  function stalePublication() {
    metrics.stalePublications += 1;
    return null;
  }

  function update(handle, transform) {
    const decoded = decode(handle);
    if (decoded === null) return stalePublication();
    const { slot, generationValue } = decoded;

    while (true) {
      if (Atomics.load(generation, slot) !== generationValue) return stalePublication();
      const state = Atomics.load(status, slot);
      if (state === proofWriting) {
        metrics.waits +=  1;
        Atomics.wait(status, slot, proofWriting, 1);
        continue;
      }
      if (state !== ready) return stalePublication();

      const observed = Atomics.compareExchange(status, slot, ready, proofWriting);
      if (observed !== ready) {
        metrics.retries += 1;
        continue;
      }

      try {
        if (Atomics.load(generation, slot) !== generationValue) return stalePublication();
        const current = assertSearchRecord(Atomics.load(records, slot));
        const next = assertSearchRecord(transform(current));
        if (next !== current) {
          Atomics.store(records, slot, next);
          metrics.publications += 1;
        }
        return next;
      } finally {
        // The successful CAS owns this lock even if replacement completed
        // between the initial generation check and lock acquisition. Reject the
        // stale publication above, but release the generation we actually locked.
        // Descriptor replacement cannot run while we own PROOF_WRITING; reset
        // requires global quiescence and must not race any attached client.
        if (Atomics.compareExchange(status, slot, proofWriting, ready) === proofWriting) {
          Atomics.notify(status, slot);
        }
      }
    }
  }

  function reset() {
    throw new Error('semantic proof-store reset is owned by the semantic arena lifecycle');
  }

  return Object.freeze({ isCurrent, load, update, reset, metrics });
}

export function createPackedProofStore(arena) {
  if (!arena || !(arena.recordBuffer instanceof SharedArrayBuffer)) {
    throw new TypeError('packed proof store requires a proof arena');
  }
  const semantic = arena.kind === 'connect4-exact-semantic-shared-tt-v5';
  if (!semantic && arena.kind !== 'connect4-shared-packed-proof-arena-v3') {
    throw new TypeError(`unsupported packed proof arena kind: ${arena.kind}`);
  }
  const storage = semantic
    ? createSemanticPackedProofStore(arena)
    : createStaticPackedProofStore(arena);

  function assertHint(bestMoveValue) {
    if (!Number.isInteger(bestMoveValue) || bestMoveValue < -1 || bestMoveValue > 6) {
      throw new RangeError(`packed proof best-move hint must be an integer in -1..6, got ${bestMoveValue}`);
    }
  }

  function lower(handle) {
    return proofLower(storage.load(handle));
  }

  function upper(handle) {
    return proofUpper(storage.load(handle));
  }

  function bestMove(handle) {
    return bestMoveHint(storage.load(handle));
  }

  function publishExact(handle, value, bestMoveValue = -1) {
    assertWdlValue(value, 'packed exact proof');
    assertHint(bestMoveValue);
    return storage.update(handle, (record) => {
      const currentLower = proofLower(record);
      const currentUpper = proofUpper(record);
      const nextLower = Math.max(currentLower, value);
      const nextUpper = Math.min(currentUpper, value);
      if (nextLower > nextUpper) throw new Error(`contradictory exact proof publication at handle ${handle}`);
      let next = withProofBounds(record, nextLower, nextUpper);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishLower(handle, value, bestMoveValue = -1) {
    assertWdlValue(value, 'packed lower proof');
    assertHint(bestMoveValue);
    return storage.update(handle, (record) => {
      const nextLower = Math.max(proofLower(record), value);
      const currentUpper = proofUpper(record);
      if (nextLower > currentUpper) throw new Error(`contradictory lower proof publication at handle ${handle}`);
      let next = withProofLower(record, nextLower);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishUpper(handle, value, bestMoveValue = -1) {
    assertWdlValue(value, 'packed upper proof');
    assertHint(bestMoveValue);
    return storage.update(handle, (record) => {
      const currentLower = proofLower(record);
      const nextUpper = Math.min(proofUpper(record), value);
      if (currentLower > nextUpper) throw new Error(`contradictory upper proof publication at handle ${handle}`);
      let next = withProofUpper(record, nextUpper);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishHint(handle, bestMoveValue) {
    assertHint(bestMoveValue);
    if (bestMoveValue === -1) return storage.load(handle);
    return storage.update(handle, (record) => withBestMoveHint(record, bestMoveValue));
  }

  return Object.freeze({
    isCurrent: storage.isCurrent,
    lower,
    upper,
    bestMove,
    publishExact,
    publishLower,
    publishUpper,
    publishHint,
    reset: storage.reset,
    metrics: storage.metrics,
  });
}
