export function installOnlineOnlyStateStorage(states) {
  if (!states || !(states.support instanceof Uint32Array)
      || !(states.p0Class instanceof Uint32Array)
      || !(states.p1Class instanceof Uint32Array)
      || !(states.hashes instanceof Uint32Array)) {
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
