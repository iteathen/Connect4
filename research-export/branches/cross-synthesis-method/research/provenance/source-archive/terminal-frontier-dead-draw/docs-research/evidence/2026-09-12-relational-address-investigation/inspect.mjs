import assert from 'node:assert/strict';

// Post-search analysis only. Maps, BigInts and sorting below are diagnostic
// machinery, never a proposed recursive-search implementation.
export function inspectRelationalAddresses(kernel) {
  const slots = [];
  for (const pool of kernel.classes.slotPools) {
    const keys = [], low = new Map(), folded = new Map();
    let union = 0n, foldedWitness = null, lowWitness = null;
    const words = id => [pool.words[id * 2], pool.words[id * 2 + 1]];
    for (let id = 0; id < pool.count; id++) {
      const [lo, hi] = words(id);
      const key = BigInt(lo) | (BigInt(hi) << 32n);
      keys.push(key); union |= key;
      const fold = (lo ^ hi) >>> 0;
      if (folded.has(fold) && !foldedWitness) foldedWitness = { ids: [folded.get(fold), id],
        keys: [words(folded.get(fold)), words(id)], folded: fold };
      if (low.has(lo) && !lowWitness) lowWitness = { ids: [low.get(lo), id],
        keys: [words(low.get(lo)), words(id)], low: lo };
      folded.set(fold, id); low.set(lo, id);
    }
    keys.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    for (let i = 1; i < keys.length; i++) assert.notEqual(keys[i - 1], keys[i]);
    let activeBitCount = 0;
    for (let bits = union; bits; bits &= bits - 1n) activeBitCount++;
    const prefixCounts = [];
    for (let bytes = 1; bytes <= 7; bytes++) {
      const shift = BigInt(64 - bytes * 8);
      const prefixes = new Set(keys.map(key => key >> shift));
      prefixCounts.push(prefixes.size);
    }
    // Compressed binary radix tree: one branch at each actual distinguishing bit.
    // Analyze positive lookups uniformly over distinct keys, not search frequency.
    let leafDepthSum = 0, maxLeafDepth = 0, internalNodes = 0;
    function visit(start, end, depth) {
      if (end - start === 1) { leafDepthSum += depth; maxLeafDepth = Math.max(maxLeafDepth, depth); return; }
      internalNodes++;
      let different = keys[start] ^ keys[end - 1], bit = -1n;
      while (different) { different >>= 1n; bit++; }
      assert.ok(bit >= 0n);
      const mask = 1n << bit;
      let lo = start, hi = end;
      while (lo < hi) { const mid = (lo + hi) >>> 1; if ((keys[mid] & mask) === 0n) lo = mid + 1; else hi = mid; }
      assert.ok(lo > start && lo < end);
      visit(start, lo, depth + 1); visit(lo, end, depth + 1);
    }
    visit(0, keys.length, 0);
    assert.equal(internalNodes, pool.count - 1);
    slots.push({ slot: pool.slot, chunkCount: pool.count, reservedCapacity: pool.capacity,
      activeBitCount, lowWordDistinct: low.size, xorFoldDistinct: folded.size, lowWitness, foldedWitness,
      denseAllObservedBitCombinationsIndexBytes: (4n << BigInt(activeBitCount)).toString(),
      byteRadixHighFirst: { prefixCounts, indexBytesForObservedKeys: (1 + prefixCounts.reduce((a, b) => a + b, 0)) * 256 * 4,
        positiveLookupByteSteps: 8 },
      compressedBinaryRadix: { internalNodes, uniformDistinctKeyMeanBitSteps: leafDepthSum / pool.count,
        maxBitSteps: maxLeafDepth, indexBytesAtCurrentFullCapacity: 9 * (pool.capacity - 1),
        layout: 'two Int32 child references plus one Uint8 branching-bit index per internal node; leaf references encode existing stable chunk IDs' },
      currentIndexBytes: pool.memoryStats().hashSlotBytes + pool.memoryStats().collisionLinkBytes,
      exactKeysUnique: true });
  }
  const supports = new Map(); let sameSupportWitness = null, maxStatesPerSupport = 0;
  for (let id = 0; id < kernel.states.count; id++) {
    const support = kernel.states.support[id];
    const entry = supports.get(support);
    if (entry) {
      entry.count++;
      if (!sameSupportWitness) sameSupportWitness = { support,
        states: [entry.id, id].map(stateId => ({ stateId,
          p0Class: kernel.states.p0Class[stateId], p1Class: kernel.states.p1Class[stateId] })) };
    } else supports.set(support, { id, count: 1 });
  }
  for (const entry of supports.values()) maxStatesPerSupport = Math.max(maxStatesPerSupport, entry.count);
  return { kind: 'post-search-relational-address-analysis', domain: kernel.domain,
    limitations: ['Observed depth-8 keys do not bound all reachable keys.',
      'Radix estimates are layouts and positive distinct-key step counts, not measured implementations or CPU/cache timings.',
      'Dense combination counts describe direct bitmask address space, not a claim that every combination is legal.',
      'XOR folding differs from aligned full-word XOR/OR equality.'],
    slots, states: { count: kernel.states.count, distinctSupports: supports.size, maxStatesPerSupport, sameSupportWitness },
    totals: { chunkCount: slots.reduce((s, p) => s + p.chunkCount, 0),
      currentIndexBytes: slots.reduce((s, p) => s + p.currentIndexBytes, 0),
      byteRadixObservedIndexBytes: slots.reduce((s, p) => s + p.byteRadixHighFirst.indexBytesForObservedKeys, 0),
      compressedBinaryRadixFullCapacityIndexBytes: slots.reduce((s, p) => s + p.compressedBinaryRadix.indexBytesAtCurrentFullCapacity, 0) } };
}
