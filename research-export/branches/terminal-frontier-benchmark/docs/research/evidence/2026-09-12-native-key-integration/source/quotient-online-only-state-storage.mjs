export function installOnlineOnlyStateStorage(states) {
  if (!states || typeof states.supportAt !== 'function'
      || typeof states.p0At !== 'function' || typeof states.p1At !== 'function'
      || typeof states.memoryStats !== 'function') {
    throw new TypeError('online state storage requires the quotient semantic state pool');
  }
  if ('lower' in states || 'upper' in states || 'bestMove' in states) {
    throw new Error('semantic state pool still owns local proof arrays');
  }

  const bytesPerStateAvoided = Int8Array.BYTES_PER_ELEMENT * 3;

  function stats() {
    return Object.freeze({
      kind: 'connect4-proof-separated-online-state-storage-v2',
      stateCount: states.count,
      stateCapacity: states.capacity,
      bytesPerStateAvoided,
      localProofBytesAtInstall: 0,
      localProofBytesRetained: 0,
      localProofBytesAvoided: states.capacity * bytesPerStateAvoided,
    });
  }

  return Object.freeze({ stats });
}
