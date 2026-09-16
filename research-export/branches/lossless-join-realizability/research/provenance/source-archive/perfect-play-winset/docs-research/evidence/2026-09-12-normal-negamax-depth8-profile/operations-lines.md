# Sampled source locations inside each operation

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

Derived from the existing depth-8 profile; no test rerun. Function self/inclusive times are sample-based aggregate estimates. Line counts are raw V8 position ticks, aggregated across appearances of the same function. They have no per-line timestamps, so no per-line milliseconds are invented. Optimization/inlining and call-site mapping can affect attribution. Links and excerpts refer to the profiled working-tree source.

## ownTransitionSlot64 — [quotient-slot64-residual-pool-v2.mjs:568](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:568>)

Self estimate: 1154.5 ms; including callees: 4143.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:581](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:581>) | 129 | reducedBits.fill(0); |
| [quotient-slot64-residual-pool-v2.mjs:592](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:592>) | 68 | const target = vocabulary.reduce[termId * vocabulary.cellCount + cell]; |
| [quotient-slot64-residual-pool-v2.mjs:614](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:614>) | 40 | let active = reducedBits[word] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:618](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:618>) | 39 | const start = strictSupersetStarts[termId]; |
| [quotient-slot64-residual-pool-v2.mjs:584](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:584>) | 37 | for (let word = 0; word < WORDS_PER_CLASS; word += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:588](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:588>) | 31 | if (active !== 0) affected = true; |
| [quotient-slot64-residual-pool-v2.mjs:574](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:574>) | 29 | if ((((singletonLo[id] & bitLo) >>> 0) !== 0) \|\| (((singletonHi[id] & bitHi) >>> 0) !== 0)) { |
| [quotient-slot64-residual-pool-v2.mjs:622](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:622>) | 26 | const mask = strictSupersetWordMask[entry]; |
| [quotient-slot64-residual-pool-v2.mjs:586](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:586>) | 25 | let active = (input & containsMasks[containsBase + word]) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:613](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:613>) | 25 | for (let word = 0; word < WORDS_PER_CLASS; word += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:601](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:601>) | 24 | reducedBits[target >>> 5] \|= 1 << (target & 31); |
| [quotient-slot64-residual-pool-v2.mjs:621](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:621>) | 24 | const targetWord = strictSupersetWordIndex[entry]; |
| [quotient-slot64-residual-pool-v2.mjs:620](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:620>) | 22 | for (let entry = start; entry < end; entry += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:615](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:615>) | 21 | while (active !== 0) { |
| [quotient-slot64-residual-pool-v2.mjs:591](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:591>) | 20 | if (termId >= vocabulary.count) throw new Error(\`slot64 own transition saw out-of-vocabulary term ${termId}\`); |
| [quotient-slot64-residual-pool-v2.mjs:612](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:612>) | 20 | for (let word = 0; word < WORDS_PER_CLASS; word += 1) resultBits[word] = (resultBits[word] \| reducedBits[word]) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:623](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:623>) | 18 | resultBits[targetWord] = (resultBits[targetWord] & ~mask) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:587](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:587>) | 17 | resultBits[word] = (input & ~containsMasks[containsBase + word]) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:631](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:631>) | 14 | const result = internBits(resultBits, id); |
| [quotient-slot64-residual-pool-v2.mjs:617](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:617>) | 10 | if (termId >= vocabulary.count) throw new Error(\`slot64 normalization saw out-of-vocabulary term ${termId}\`); |
| [quotient-slot64-residual-pool-v2.mjs:624](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:624>) | 10 | metrics.supersetWordProbes += 1; |
| [quotient-slot64-residual-pool-v2.mjs:585](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:585>) | 9 | const input = inputBits[word] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:590](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:590>) | 9 | const termId = (word << 5) + 31 - Math.clz32(active & -active); |
| [quotient-slot64-residual-pool-v2.mjs:571](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:571>) | 7 | const cached = cacheGet(ownTransitions, id, cell, true); |
| [quotient-slot64-residual-pool-v2.mjs:589](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:589>) | 7 | while (active !== 0) { |
| [quotient-slot64-residual-pool-v2.mjs:575](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:575>) | 5 | cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN); |
| [quotient-slot64-residual-pool-v2.mjs:619](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:619>) | 5 | const end = strictSupersetStarts[termId + 1]; |
| [quotient-slot64-residual-pool-v2.mjs:625](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:625>) | 5 | metrics.supersetWordClears += 1; |
| [quotient-slot64-residual-pool-v2.mjs:632](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:632>) | 5 | cacheSet(ownTransitions, id, cell, result); |
| [quotient-slot64-residual-pool-v2.mjs:573](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:573>) | 4 | metrics.ownTransitionMisses += 1; |
| [quotient-slot64-residual-pool-v2.mjs:593](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:593>) | 4 | if (target === vocabulary.terminal) { |
| [quotient-slot64-residual-pool-v2.mjs:616](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:616>) | 4 | const termId = (word << 5) + 31 - Math.clz32(active & -active); |
| [quotient-slot64-residual-pool-v2.mjs:572](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:572>) | 3 | if (cached !== CLASS_UNKNOWN) { metrics.ownTransitionHits += 1; return cached; } |
| [quotient-slot64-residual-pool-v2.mjs:602](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:602>) | 2 | metrics.reducedTerms += 1; |
| [quotient-slot64-residual-pool-v2.mjs:603](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:603>) | 2 | active = (active & (active - 1)) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:606](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:606>) | 2 | if (!affected) { |
| [quotient-slot64-residual-pool-v2.mjs:598](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:598>) | 1 | if (!Number.isInteger(target) \|\| target < 0 \|\| target >= vocabulary.count) { |
| [quotient-slot64-residual-pool-v2.mjs:627](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:627>) | 1 | active = (active & (active - 1)) >>> 0; |

## blockTransitionSlot64Direct — [quotient-slot64-residual-pool-v2.mjs:636](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:636>)

Self estimate: 927.0 ms; including callees: 1808.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:682](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:682>) | 123 | const existingId = classHashSlots[hashSlot]; |
| [quotient-slot64-residual-pool-v2.mjs:655](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:655>) | 89 | const input0 = slotPools[slotIndex].words[parentBase] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:647](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:647>) | 75 | const parentChunk = classSlotIds[slotIndex][id]; |
| [quotient-slot64-residual-pool-v2.mjs:684](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:684>) | 51 | if (classHashes[existingId] === hash && classEquals(existingId, chunkIds)) { |
| [quotient-slot64-residual-pool-v2.mjs:646](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:646>) | 27 | for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:664](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:664>) | 21 | chunkIds[slotIndex] = slotPools[slotIndex].intern(resultBits, word); |
| [quotient-slot64-residual-pool-v2.mjs:648](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:648>) | 16 | chunkIds[slotIndex] = parentChunk; |
| [quotient-slot64-residual-pool-v2.mjs:661](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:661>) | 16 | removedTerms += popcount32(input0 ^ next0) + popcount32(input1 ^ next1); |
| [quotient-slot64-residual-pool-v2.mjs:651](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:651>) | 14 | const mask1 = containsMasks[containsBase + word + 1] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:656](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:656>) | 13 | const input1 = slotPools[slotIndex].words[parentBase + 1] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:650](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:650>) | 12 | const mask0 = containsMasks[containsBase + word] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:659](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:659>) | 11 | if (next0 === input0 && next1 === input1) continue; |
| [quotient-slot64-residual-pool-v2.mjs:654](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:654>) | 10 | const parentBase = parentChunk * CHUNK_WORDS; |
| [quotient-slot64-residual-pool-v2.mjs:677](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:677>) | 10 | if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash(); |
| [quotient-slot64-residual-pool-v2.mjs:687](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:687>) | 10 | return existingId; |
| [quotient-slot64-residual-pool-v2.mjs:662](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:662>) | 9 | resultBits[word] = next0; |
| [quotient-slot64-residual-pool-v2.mjs:666](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:666>) | 7 | changedSlots += 1; |
| [quotient-slot64-residual-pool-v2.mjs:689](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:689>) | 7 | hashSlot = (hashSlot + 1) & hashMask; |
| [quotient-slot64-residual-pool-v2.mjs:665](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:665>) | 6 | metrics.chunkInterns += 1; |
| [quotient-slot64-residual-pool-v2.mjs:657](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:657>) | 5 | const next0 = (input0 & ~mask0) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:658](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:658>) | 5 | const next1 = (input1 & ~mask1) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:675](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:675>) | 5 | metrics.internLookups += 1; |
| [quotient-slot64-residual-pool-v2.mjs:686](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:686>) | 5 | cacheSet(blockTransitions, id, cell, existingId); |
| [quotient-slot64-residual-pool-v2.mjs:652](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:652>) | 4 | if ((mask0 \| mask1) === 0) continue; |
| [quotient-slot64-residual-pool-v2.mjs:676](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:676>) | 4 | metrics.parentChunkReuses += CHUNKS_PER_CLASS - changedSlots; |
| [quotient-slot64-residual-pool-v2.mjs:639](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:639>) | 3 | const cached = cacheGet(blockTransitions, id, cell, false); |
| [quotient-slot64-residual-pool-v2.mjs:640](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:640>) | 3 | if (cached !== CLASS_UNKNOWN) { metrics.blockTransitionHits += 1; return cached; } |
| [quotient-slot64-residual-pool-v2.mjs:636](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:636>) | 2 | pool.blockTransition = function blockTransitionSlot64Direct(id, cell) { |
| [quotient-slot64-residual-pool-v2.mjs:663](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:663>) | 2 | resultBits[word + 1] = next1; |
| [quotient-slot64-residual-pool-v2.mjs:669](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:669>) | 2 | if (changedSlots === 0) { |
| [quotient-slot64-residual-pool-v2.mjs:679](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:679>) | 2 | const hashMask = classHashSlots.length - 1; |
| [quotient-slot64-residual-pool-v2.mjs:706](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:706>) | 2 | classHashSlots[hashSlot] = result; |
| [quotient-slot64-residual-pool-v2.mjs:643](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:643>) | 1 | const containsBase = cell * WORDS_PER_CLASS; |
| [quotient-slot64-residual-pool-v2.mjs:678](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:678>) | 1 | const hash = hashChunkTuple(chunkIds); |
| [quotient-slot64-residual-pool-v2.mjs:680](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:680>) | 1 | let hashSlot = hash & hashMask; |
| [quotient-slot64-residual-pool-v2.mjs:683](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:683>) | 1 | if (existingId === -1) break; |
| [quotient-slot64-residual-pool-v2.mjs:693](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:693>) | 1 | for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) ensureReferenceWidth(slotIndex, chunkIds[slotIndex]); |
| [quotient-slot64-residual-pool-v2.mjs:696](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:696>) | 1 | const count = classTermCounts[id] - removedTerms; |
| [quotient-slot64-residual-pool-v2.mjs:700](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:700>) | 1 | classTermCounts[result] = count; |
| [quotient-slot64-residual-pool-v2.mjs:704](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:704>) | 1 | singletonLo[result] = (singletonLo[id] & ~bitLo) >>> 0; |

## intern — [quotient-slot64-residual-pool-v2.mjs:122](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:122>)

Self estimate: 875.2 ms; including callees: 1672.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:130](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:130>) | 341 | const id = this.hashSlots[slot]; |
| [quotient-slot64-residual-pool-v2.mjs:132](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:132>) | 62 | if (this.equals(id, source, offset)) { |
| [quotient-slot64-residual-pool-v2.mjs:125](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:125>) | 32 | if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this._growHash(); |
| [quotient-slot64-residual-pool-v2.mjs:124](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:124>) | 22 | this.metrics.lookups += 1; |
| [quotient-slot64-residual-pool-v2.mjs:131](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:131>) | 16 | if (id === -1) break; |
| [quotient-slot64-residual-pool-v2.mjs:122](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:122>) | 15 | intern(source, offset) { |
| [quotient-slot64-residual-pool-v2.mjs:127](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:127>) | 12 | const mask = this.hashSlots.length - 1; |
| [quotient-slot64-residual-pool-v2.mjs:133](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:133>) | 11 | this.metrics.hits += 1; |
| [quotient-slot64-residual-pool-v2.mjs:123](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:123>) | 9 | assertWordSource(source, offset, 'slot64 chunk source'); |
| [quotient-slot64-residual-pool-v2.mjs:128](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:128>) | 6 | let slot = hash & mask; |
| [quotient-slot64-residual-pool-v2.mjs:134](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:134>) | 5 | return id; |
| [quotient-slot64-residual-pool-v2.mjs:136](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:136>) | 5 | slot = (slot + 1) & mask; |
| [quotient-slot64-residual-pool-v2.mjs:126](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:126>) | 3 | const hash = hashWords2(source, offset); |
| [quotient-slot64-residual-pool-v2.mjs:129](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:129>) | 2 | while (true) { |

## internBits — [quotient-slot64-residual-pool-v2.mjs:421](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:421>)

Self estimate: 821.7 ms; including callees: 2528.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:449](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:449>) | 130 | const id = classHashSlots[slot]; |
| [quotient-slot64-residual-pool-v2.mjs:451](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:451>) | 100 | if (classHashes[id] === hash && classEquals(id, chunkIds)) { |
| [quotient-slot64-residual-pool-v2.mjs:429](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:429>) | 84 | const parentChunk = classSlotIds[slot][parentId]; |
| [quotient-slot64-residual-pool-v2.mjs:437](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:437>) | 58 | chunkIds[slot] = slotPools[slot].intern(bits, offset); |
| [quotient-slot64-residual-pool-v2.mjs:430](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:430>) | 45 | if (slotPools[slot].equals(parentChunk, bits, offset)) { |
| [quotient-slot64-residual-pool-v2.mjs:426](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:426>) | 12 | for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:431](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:431>) | 12 | chunkIds[slot] = parentChunk; |
| [quotient-slot64-residual-pool-v2.mjs:432](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:432>) | 9 | metrics.parentChunkReuses += 1; |
| [quotient-slot64-residual-pool-v2.mjs:444](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:444>) | 8 | if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash(); |
| [quotient-slot64-residual-pool-v2.mjs:428](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:428>) | 7 | if (parentId >= 0) { |
| [quotient-slot64-residual-pool-v2.mjs:425](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:425>) | 6 | let sameAsParent = parentId >= 0; |
| [quotient-slot64-residual-pool-v2.mjs:438](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:438>) | 6 | metrics.chunkInterns += 1; |
| [quotient-slot64-residual-pool-v2.mjs:423](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:423>) | 5 | if (parentId !== -1) assertClassId(parentId); |
| [quotient-slot64-residual-pool-v2.mjs:421](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:421>) | 4 | function internBits(bits, parentId = -1) { |
| [quotient-slot64-residual-pool-v2.mjs:440](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:440>) | 3 | if (sameAsParent) { |
| [quotient-slot64-residual-pool-v2.mjs:446](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:446>) | 3 | const mask = classHashSlots.length - 1; |
| [quotient-slot64-residual-pool-v2.mjs:447](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:447>) | 3 | let slot = hash & mask; |
| [quotient-slot64-residual-pool-v2.mjs:450](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:450>) | 3 | if (id === -1) break; |
| [quotient-slot64-residual-pool-v2.mjs:455](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:455>) | 3 | slot = (slot + 1) & mask; |
| [quotient-slot64-residual-pool-v2.mjs:445](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:445>) | 2 | const hash = hashChunkTuple(chunkIds); |
| [quotient-slot64-residual-pool-v2.mjs:452](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:452>) | 2 | metrics.internHits += 1; |
| [quotient-slot64-residual-pool-v2.mjs:424](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:424>) | 1 | metrics.internLookups += 1; |
| [quotient-slot64-residual-pool-v2.mjs:427](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:427>) | 1 | const offset = slot * CHUNK_WORDS; |
| [quotient-slot64-residual-pool-v2.mjs:458](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:458>) | 1 | if (classCount >= UINT32_MAX) throw new RangeError('slot64 residual class ID domain exhausted'); |
| [quotient-slot64-residual-pool-v2.mjs:460](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:460>) | 1 | ensureClassCapacity(classCount + 1); |
| [quotient-slot64-residual-pool-v2.mjs:462](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:462>) | 1 | for (let chunk = 0; chunk < CHUNKS_PER_CLASS; chunk += 1) classSlotIds[chunk][id] = chunkIds[chunk]; |
| [quotient-slot64-residual-pool-v2.mjs:463](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:463>) | 1 | classHashes[id] = hash; |

## stableDescriptorHandle — [quotient-semantic-shared-tt.mjs:528](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:528>)

Self estimate: 638.7 ms; including callees: 658.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:529](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:529>) | 361 | const stateBefore = Atomics.load(status, slot); |
| [quotient-semantic-shared-tt.mjs:531](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:531>) | 20 | const generationBefore = Atomics.load(generation, slot); |
| [quotient-semantic-shared-tt.mjs:530](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:530>) | 11 | if (stateBefore !== SLOT_READY && stateBefore !== SLOT_PROOF_WRITING) return -1; |
| [quotient-semantic-shared-tt.mjs:533](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:533>) | 3 | if (hashLo[slot] !== descriptor.hash.lo \|\| hashHi[slot] !== descriptor.hash.hi) return -1; |
| [quotient-semantic-shared-tt.mjs:542](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:542>) | 3 | return encodeHandle(slot, generationBefore); |
| [quotient-semantic-shared-tt.mjs:538](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:538>) | 1 | const generationAfter = Atomics.load(generation, slot); |

## equals — [quotient-slot64-residual-pool-v2.mjs:99](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:99>)

Self estimate: 572.6 ms; including callees: 763.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:103](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:103>) | 297 | return this.words[base] === (source[offset] >>> 0) |
| [quotient-slot64-residual-pool-v2.mjs:104](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:104>) | 39 | && this.words[base + 1] === (source[offset + 1] >>> 0); |
| [quotient-slot64-residual-pool-v2.mjs:101](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:101>) | 14 | assertWordSource(source, offset, 'slot64 chunk source'); |
| [quotient-slot64-residual-pool-v2.mjs:102](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:102>) | 11 | const base = id * CHUNK_WORDS; |

## tacticalCode — [quotient-native-negamax-support-layout-kernel.mjs:688](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:688>)

Self estimate: 520.3 ms; including callees: 857.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:699](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:699>) | 243 | for (const column of centerOrder) { |
| [quotient-native-negamax-support-layout-kernel.mjs:707](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:707>) | 21 | if (classes.hasSingletonAt(ownClass, lo, hi)) return TACTICAL_IMMEDIATE_BASE + column; |
| [quotient-native-negamax-support-layout-kernel.mjs:703](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:703>) | 11 | const lo = bitLo[landingCell]; |
| [quotient-native-negamax-support-layout-kernel.mjs:704](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:704>) | 11 | const hi = bitHi[landingCell]; |
| [quotient-native-negamax-support-layout-kernel.mjs:689](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:689>) | 10 | const supportIndex = supportIndexAt(stateId); |
| [quotient-native-negamax-support-layout-kernel.mjs:692](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:692>) | 5 | if (classes.isEmpty(p0Class) && classes.isEmpty(p1Class)) return TACTICAL_DRAW; |
| [quotient-native-negamax-support-layout-kernel.mjs:690](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:690>) | 4 | const p0Class = states.p0Class[stateId]; |
| [quotient-native-negamax-support-layout-kernel.mjs:714](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:714>) | 4 | if (legal === 0) return TACTICAL_DRAW; |
| [quotient-native-negamax-support-layout-kernel.mjs:702](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:702>) | 3 | legal += 1; |
| [quotient-native-negamax-support-layout-kernel.mjs:708](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:708>) | 3 | if (classes.hasSingletonAt(opponentClass, lo, hi)) { |
| [quotient-native-negamax-support-layout-kernel.mjs:709](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:709>) | 3 | threats += 1; |
| [quotient-native-negamax-support-layout-kernel.mjs:688](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:688>) | 2 | function tacticalCode(stateId) { |
| [quotient-native-negamax-support-layout-kernel.mjs:701](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:701>) | 2 | if (landingCell === 0xff) continue; |
| [quotient-native-negamax-support-layout-kernel.mjs:695](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:695>) | 1 | const opponentClass = mover === 0 ? p1Class : p0Class; |
| [quotient-native-negamax-support-layout-kernel.mjs:710](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:710>) | 1 | if (forced < 0) forced = column; |
| [quotient-native-negamax-support-layout-kernel.mjs:713](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:713>) | 1 | if (threats > 1) return TACTICAL_LOSS; |

## intern — [quotient-native-negamax-support-layout-kernel.mjs:514](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:514>)

Self estimate: 484.5 ms; including callees: 555.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:524](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:524>) | 147 | const id = this.hashSlots[slot]; |
| [quotient-native-negamax-support-layout-kernel.mjs:526](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:526>) | 80 | if (this.support[id] === supportIndex |
| [quotient-native-negamax-support-layout-kernel.mjs:527](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:527>) | 29 | && this.p0Class[id] === p0Class |
| [quotient-native-negamax-support-layout-kernel.mjs:528](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:528>) | 14 | && this.p1Class[id] === p1Class) { |
| [quotient-native-negamax-support-layout-kernel.mjs:519](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:519>) | 8 | if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this._growHash(); |
| [quotient-native-negamax-support-layout-kernel.mjs:525](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:525>) | 6 | if (id === -1) break; |
| [quotient-native-negamax-support-layout-kernel.mjs:515](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:515>) | 3 | assertSupportIndex(supportIndex, this.#supportCapacity); |
| [quotient-native-negamax-support-layout-kernel.mjs:518](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:518>) | 3 | this.metrics.internLookups += 1; |
| [quotient-native-negamax-support-layout-kernel.mjs:532](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:532>) | 3 | slot = (slot + 1) & mask; |
| [quotient-native-negamax-support-layout-kernel.mjs:521](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:521>) | 2 | const mask = this.hashSlots.length - 1; |
| [quotient-native-negamax-support-layout-kernel.mjs:523](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:523>) | 2 | while (true) { |
| [quotient-native-negamax-support-layout-kernel.mjs:529](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:529>) | 2 | this.metrics.internHits += 1; |
| [quotient-native-negamax-support-layout-kernel.mjs:535](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:535>) | 1 | this._ensureStateCapacity(id + 1); |

## classEquals — [quotient-slot64-residual-pool-v2.mjs:367](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:367>)

Self estimate: 331.9 ms; including callees: 339.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:371](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:371>) | 184 | if (classSlotIds[slot][id] !== ids[slot]) return false; |
| [quotient-slot64-residual-pool-v2.mjs:370](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:370>) | 21 | for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:367](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:367>) | 1 | function classEquals(id, ids) { |
| [quotient-slot64-residual-pool-v2.mjs:369](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:369>) | 1 | if (!(ids instanceof Uint32Array) \|\| ids.length !== CHUNKS_PER_CLASS) throw new TypeError(\`slot64 class tuple must be Uint32Array(${CHUNKS_PER_CLASS})\`); |

## assertWordSource — [quotient-slot64-residual-pool-v2.mjs:63](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:63>)

Self estimate: 271.1 ms; including callees: 271.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:64](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:64>) | 89 | if (!(source instanceof Uint32Array)) throw new TypeError(\`${label} must be Uint32Array\`); |
| [quotient-slot64-residual-pool-v2.mjs:65](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:65>) | 77 | if (!Number.isInteger(offset) \|\| offset < 0 \|\| offset + CHUNK_WORDS > source.length) { |

## searchNode — [quotient-negamax-engine.mjs:370](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:370>)

Self estimate: 243.9 ms; including callees: 10674.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:497](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:497>) | 17 | for (let index = 0; index < moveCount; index += 1) { |
| [quotient-negamax-engine.mjs:433](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:433>) | 13 | if (horizon !== null && rank >= horizon.rankLimit) { |
| [quotient-negamax-engine.mjs:389](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:389>) | 12 | const structuralNarrowed = frontierBoundsFor(port, stateId, proofLower, proofUpper, proofSnapshot); |
| [quotient-negamax-engine.mjs:380](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:380>) | 8 | if (horizon !== null && rank > horizon.maxReachedRank) horizon.maxReachedRank = rank; |
| [quotient-negamax-engine.mjs:498](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:498>) | 8 | const column = moveStack[base + index]; |
| [quotient-negamax-engine.mjs:504](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:504>) | 8 | const childScore = searchNode(child, -beta, -alpha, rank + 1); |
| [quotient-negamax-engine.mjs:381](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:381>) | 6 | const key = proof.probe(stateId); |
| [quotient-negamax-engine.mjs:387](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:387>) | 6 | const proofLowerCut = proofLower >= beta; |
| [quotient-negamax-engine.mjs:505](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:505>) | 6 | if (childScore === null) { |
| [quotient-negamax-engine.mjs:382](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:382>) | 5 | const proofSnapshot = proof.read(key); |
| [quotient-negamax-engine.mjs:390](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:390>) | 5 | const lower = proofSnapshot[0]; |
| [quotient-negamax-engine.mjs:503](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:503>) | 5 | advanceFrontier(stateId, column, rank); |
| [quotient-negamax-engine.mjs:370](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:370>) | 4 | function searchNode(startStateId, startAlpha, startBeta, startRank) { |
| [quotient-negamax-engine.mjs:388](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:388>) | 4 | const proofUpperCut = proofUpper <= alpha; |
| [quotient-negamax-engine.mjs:441](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:441>) | 4 | beta = Math.min(beta, upper); |
| [quotient-negamax-engine.mjs:379](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:379>) | 3 | metrics.calls += 1; |
| [quotient-negamax-engine.mjs:391](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:391>) | 3 | const upper = proofSnapshot[1]; |
| [quotient-negamax-engine.mjs:413](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:413>) | 3 | assertTacticalCode(tactical, columns); |
| [quotient-negamax-engine.mjs:426](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:426>) | 3 | if (tactical === TACTICAL_DRAW) { |
| [quotient-negamax-engine.mjs:434](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:434>) | 3 | horizon.leaves += 1; |
| [quotient-negamax-engine.mjs:466](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:466>) | 3 | const moveCount = prepareMoves(stateId, proofHint, -1, rank); |
| [quotient-negamax-engine.mjs:520](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:520>) | 3 | if (alpha >= beta) { |
| [quotient-negamax-engine.mjs:383](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:383>) | 2 | const proofLower = proofSnapshot[0]; |
| [quotient-negamax-engine.mjs:414](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:414>) | 2 | if (tactical >= TACTICAL_IMMEDIATE_BASE) { |
| [quotient-negamax-engine.mjs:499](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:499>) | 2 | const child = requireLegalTransition(transition(stateId, column), stateId, column); |
| [quotient-negamax-engine.mjs:386](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:386>) | 1 | const proofExact = proofLower === proofUpper; |
| [quotient-negamax-engine.mjs:399](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:399>) | 1 | return sign * lower; |
| [quotient-negamax-engine.mjs:401](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:401>) | 1 | if (lower >= beta) { |
| [quotient-negamax-engine.mjs:418](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:418>) | 1 | return sign; |
| [quotient-negamax-engine.mjs:420](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:420>) | 1 | if (tactical === TACTICAL_LOSS) { |
| [quotient-negamax-engine.mjs:435](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:435>) | 1 | return null; |
| [quotient-negamax-engine.mjs:440](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:440>) | 1 | alpha = Math.max(alpha, lower); |
| [quotient-negamax-engine.mjs:442](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:442>) | 1 | const forcedColumn = tacticalForcedColumn(tactical, columns); |
| [quotient-negamax-engine.mjs:447](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:447>) | 1 | const child = requireLegalTransition(transition(stateId, forcedColumn), stateId, forcedColumn); |
| [quotient-negamax-engine.mjs:527](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:527>) | 1 | if (unresolved && alpha < beta) { |
| [quotient-negamax-engine.mjs:532](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:532>) | 1 | return sign * value; |

## hotStateDescriptor — [quotient-local-semantic-descriptor.mjs:206](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:206>)

Self estimate: 226.2 ms; including callees: 895.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:215](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:215>) | 64 | hashSemanticQuotientDescriptorPartsUnchecked( |
| [quotient-local-semantic-descriptor.mjs:217](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:217>) | 47 | classHashLo[p0ClassId], |
| [quotient-local-semantic-descriptor.mjs:218](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:218>) | 16 | classHashHi[p0ClassId], |
| [quotient-local-semantic-descriptor.mjs:207](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:207>) | 5 | readStateParts(stateId); |
| [quotient-local-semantic-descriptor.mjs:227](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:227>) | 3 | metrics.stateBuilds += 1; |
| [quotient-local-semantic-descriptor.mjs:212](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:212>) | 2 | if (p0Length + p1Length > MAX_DESCRIPTOR_LENGTH) { |
| [quotient-local-semantic-descriptor.mjs:219](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:219>) | 2 | classHashLo[p1ClassId], |
| [quotient-local-semantic-descriptor.mjs:228](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:228>) | 2 | metrics.transientStateDescriptorUses += 1; |
| [quotient-local-semantic-descriptor.mjs:216](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:216>) | 1 | transientStateDescriptor.supportIndex, |
| [quotient-local-semantic-descriptor.mjs:220](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:220>) | 1 | classHashHi[p1ClassId], |
| [quotient-local-semantic-descriptor.mjs:226](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:226>) | 1 | transientStateDescriptor.p1Length = p1Length; |

## advanceInto — [quotient-live-line-move-order.mjs:118](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:118>)

Self estimate: 193.2 ms; including callees: 229.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-live-line-move-order.mjs:128](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:128>) | 58 | const overlapping = source.buffer === target.buffer && sourceStart < targetEnd && targetStart < sourceEnd; |
| [quotient-live-line-move-order.mjs:135](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:135>) | 28 | target[targetOffset + index] = source[sourceOffset + index]; |
| [quotient-live-line-move-order.mjs:145](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:145>) | 15 | target[targetOffset + at] = (target[targetOffset + at] & ~profile.through[throughBase + word]) >>> 0; |
| [quotient-live-line-move-order.mjs:125](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:125>) | 4 | const targetStart = target.byteOffset / 4 + targetOffset; |
| [quotient-live-line-move-order.mjs:134](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:134>) | 3 | for (let index = 0; index < profile.stateWords; index += 1) { |
| [quotient-live-line-move-order.mjs:119](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:119>) | 2 | assertPlayer(mover, 'mover'); |
| [quotient-live-line-move-order.mjs:144](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:144>) | 2 | const at = blockedBase + word; |
| [quotient-live-line-move-order.mjs:118](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:118>) | 1 | function advanceInto(source, sourceOffset, mover, cell, target, targetOffset) { |
| [quotient-live-line-move-order.mjs:121](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:121>) | 1 | assertWordRange(source, sourceOffset, profile.stateWords, 'live-line source'); |
| [quotient-live-line-move-order.mjs:124](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:124>) | 1 | const sourceStart = source.byteOffset / 4 + sourceOffset; |
| [quotient-live-line-move-order.mjs:126](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:126>) | 1 | const sourceEnd = sourceStart + profile.stateWords; |
| [quotient-live-line-move-order.mjs:143](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:143>) | 1 | for (let word = 0; word < words; word += 1) { |

## pool.hasSingletonAt — [quotient-slot64-residual-pool-v2.mjs:511](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:511>)

Self estimate: 171.3 ms; including callees: 200.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:515](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:515>) | 90 | return (((singletonLo[id] & (bitLo >>> 0)) >>> 0) !== 0) \|\| (((singletonHi[id] & (bitHi >>> 0)) >>> 0) !== 0); |
| [quotient-slot64-residual-pool-v2.mjs:513](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:513>) | 17 | assertMask(bitLo); |

## loadClassBits — [quotient-slot64-residual-pool-v2.mjs:390](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:390>)

Self estimate: 167.8 ms; including callees: 360.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:394](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:394>) | 77 | const chunkId = classSlotIds[slot][id]; |
| [quotient-slot64-residual-pool-v2.mjs:395](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:395>) | 26 | slotPools[slot].copyTo(chunkId, target, slot * CHUNK_WORDS); |
| [quotient-slot64-residual-pool-v2.mjs:393](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:393>) | 2 | for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) { |

## mix32 — [quotient-slot64-residual-pool-v2.mjs:22](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:22>)

Self estimate: 158.8 ms; including callees: 158.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:24](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:24>) | 22 | x ^= x >>> 16; |
| [quotient-slot64-residual-pool-v2.mjs:28](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:28>) | 22 | x ^= x >>> 16; |
| [quotient-slot64-residual-pool-v2.mjs:26](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:26>) | 21 | x ^= x >>> 15; |
| [quotient-slot64-residual-pool-v2.mjs:27](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:27>) | 20 | x = Math.imul(x, 0x846ca68b) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:25](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:25>) | 16 | x = Math.imul(x, 0x7feb352d) >>> 0; |

## copyTo — [quotient-slot64-residual-pool-v2.mjs:150](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:150>)

Self estimate: 157.9 ms; including callees: 192.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:154](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:154>) | 68 | target[offset] = this.words[base]; |
| [quotient-slot64-residual-pool-v2.mjs:155](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:155>) | 18 | target[offset + 1] = this.words[base + 1]; |
| [quotient-slot64-residual-pool-v2.mjs:153](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:153>) | 7 | const base = id * CHUNK_WORDS; |
| [quotient-slot64-residual-pool-v2.mjs:152](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:152>) | 6 | assertWordSource(target, offset, 'slot64 chunk target'); |

## hashChunkTuple — [quotient-slot64-residual-pool-v2.mjs:39](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:39>)

Self estimate: 152.6 ms; including callees: 210.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:42](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:42>) | 48 | hash = Math.imul(hash ^ mix32((ids[index] + 1) >>> 0), 0x01000193) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:44](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:44>) | 24 | return mix32(hash ^ ids.length); |
| [quotient-slot64-residual-pool-v2.mjs:41](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:41>) | 23 | for (let index = 0; index < ids.length; index += 1) { |

## advance — [quotient-native-negamax-support-layout-kernel.mjs:643](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:643>)

Self estimate: 142.9 ms; including callees: 6751.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:664](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:664>) | 20 | const ownNext = classes.ownTransition(ownClass, landingCell, bitLo[landingCell], bitHi[landingCell]); |
| [quotient-native-negamax-support-layout-kernel.mjs:673](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:673>) | 18 | const opponentNext = classes.blockTransition(opponentClass, landingCell, bitLo[landingCell], bitHi[landingCell]); |
| [quotient-native-negamax-support-layout-kernel.mjs:651](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:651>) | 10 | transitionMetrics.edgeCacheMisses += 1; |
| [quotient-native-negamax-support-layout-kernel.mjs:677](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:677>) | 7 | const childSupport = supportAccess.childAt(supportIndex, column); |
| [quotient-native-negamax-support-layout-kernel.mjs:652](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:652>) | 6 | const supportIndex = states.support[stateId]; |
| [quotient-native-negamax-support-layout-kernel.mjs:678](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:678>) | 5 | if (!Number.isInteger(childSupport) \|\| childSupport < 0 \|\| childSupport >= support.itemCapacity) { |
| [quotient-native-negamax-support-layout-kernel.mjs:661](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:661>) | 4 | const p1Class = states.p1Class[stateId]; |
| [quotient-native-negamax-support-layout-kernel.mjs:674](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:674>) | 4 | if (!Number.isInteger(opponentNext) \|\| opponentNext < 0 \|\| opponentNext >= classes.size) { |
| [quotient-native-negamax-support-layout-kernel.mjs:643](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:643>) | 3 | function advance(stateId, column) { |
| [quotient-native-negamax-support-layout-kernel.mjs:645](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:645>) | 3 | if (!Number.isInteger(column) \|\| column < 0 \|\| column >= columns) return QN_ILLEGAL; |
| [quotient-native-negamax-support-layout-kernel.mjs:660](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:660>) | 3 | const p0Class = states.p0Class[stateId]; |
| [quotient-native-negamax-support-layout-kernel.mjs:683](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:683>) | 3 | : states.intern(childSupport, opponentNext, ownNext); |
| [quotient-native-negamax-support-layout-kernel.mjs:682](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:682>) | 2 | ? states.intern(childSupport, ownNext, opponentNext) |
| [quotient-native-negamax-support-layout-kernel.mjs:681](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:681>) | 1 | const childId = mover === 0 |
| [quotient-native-negamax-support-layout-kernel.mjs:685](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:685>) | 1 | return childId; |

## probe — [quotient-semantic-shared-tt.mjs:545](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:545>)

Self estimate: 138.1 ms; including callees: 867.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:550](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:550>) | 32 | for (let lane = 0; lane < arena.associativity; lane += 1) { |
| [quotient-semantic-shared-tt.mjs:561](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:561>) | 27 | return -1; |
| [quotient-semantic-shared-tt.mjs:546](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:546>) | 9 | const descriptor = assertDescriptor(inputDescriptor); |
| [quotient-semantic-shared-tt.mjs:559](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:559>) | 8 | metrics.probeMisses += 1; |
| [quotient-semantic-shared-tt.mjs:553](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:553>) | 5 | if (handle >= 0) { |
| [quotient-semantic-shared-tt.mjs:560](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:560>) | 3 | if (scanned > metrics.maxBucketScan) metrics.maxBucketScan = scanned; |
| [quotient-semantic-shared-tt.mjs:545](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:545>) | 1 | function probe(inputDescriptor) { |
| [quotient-semantic-shared-tt.mjs:551](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:551>) | 1 | scanned += 1; |
| [quotient-semantic-shared-tt.mjs:552](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:552>) | 1 | const handle = stableDescriptorHandle(base + lane, descriptor); |

## landingAt — [quotient-native-negamax-support-layout-kernel.mjs:178](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:178>)

Self estimate: 137.2 ms; including callees: 171.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:181](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:181>) | 43 | const height = (descriptors[supportIndex] >>> columnShift[column]) & heightMask; |
| [quotient-native-negamax-support-layout-kernel.mjs:182](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:182>) | 19 | return height >= rows ? 0xff : height * columns + column; |
| [quotient-native-negamax-support-layout-kernel.mjs:179](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:179>) | 15 | assertSupportIndex(supportIndex, itemCapacity); |
| [quotient-native-negamax-support-layout-kernel.mjs:180](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:180>) | 9 | assertSupportColumn(column, columns); |

## mix32 — [quotient-semantic-identity.mjs:4](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:4>)

Self estimate: 128.9 ms; including callees: 128.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-identity.mjs:9](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:9>) | 23 | x = Math.imul(x, 0x846ca68b) >>> 0; |
| [quotient-semantic-identity.mjs:7](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:7>) | 18 | x = Math.imul(x, 0x7feb352d) >>> 0; |
| [quotient-semantic-identity.mjs:6](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:6>) | 17 | x ^= x >>> 16; |
| [quotient-semantic-identity.mjs:10](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:10>) | 16 | x ^= x >>> 16; |
| [quotient-semantic-identity.mjs:8](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:8>) | 10 | x ^= x >>> 15; |

## slot64TermCount — [quotient-slot64-residual-pool-v2.mjs:518](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:518>)

Self estimate: 120.3 ms; including callees: 120.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:521](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:521>) | 70 | return classTermCounts[id]; |
| [quotient-slot64-residual-pool-v2.mjs:520](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:520>) | 3 | metrics.termCountReads += 1; |

## writeHash — [quotient-semantic-identity.mjs:77](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:77>)

Self estimate: 108.6 ms; including callees: 108.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-identity.mjs:79](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:79>) | 54 | if (typeof target !== 'object' \|\| Array.isArray(target) \|\| Object.isFrozen(target)) { |
| [quotient-semantic-identity.mjs:82](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:82>) | 8 | target.lo = lo; |
| [quotient-semantic-identity.mjs:84](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:84>) | 4 | if (target.lo !== lo \|\| target.hi !== hi) throw new Error('semantic hash target rejected hash assignment'); |
| [quotient-semantic-identity.mjs:83](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:83>) | 2 | target.hi = hi; |

## slot64WriteTermIds — [quotient-slot64-residual-pool-v2.mjs:524](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:524>)

Self estimate: 87.7 ms; including callees: 88.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:537](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:537>) | 20 | let active = slotPools[slot].words[base + localWord] >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:535](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:535>) | 6 | for (let localWord = 0; localWord < CHUNK_WORDS; localWord += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:541](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:541>) | 6 | const termId = (wordIndex << 5) + 31 - Math.clz32(active & -active); |
| [quotient-slot64-residual-pool-v2.mjs:542](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:542>) | 5 | if (termId >= vocabulary.count) throw new Error(\`slot64 class ${id} contains out-of-vocabulary term ${termId}\`); |
| [quotient-slot64-residual-pool-v2.mjs:543](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:543>) | 5 | target[out++] = termId; |
| [quotient-slot64-residual-pool-v2.mjs:533](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:533>) | 4 | const chunkId = classSlotIds[slot][id]; |
| [quotient-slot64-residual-pool-v2.mjs:538](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:538>) | 4 | while (active !== 0) { |
| [quotient-slot64-residual-pool-v2.mjs:548](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:548>) | 2 | if (out - offset !== count) throw new Error(\`slot64 class ${id} term write drift: expected ${count}, wrote ${out - offset}\`); |
| [quotient-slot64-residual-pool-v2.mjs:526](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:526>) | 1 | if (!(target instanceof Uint16Array)) throw new TypeError('slot64 term target must be Uint16Array'); |
| [quotient-slot64-residual-pool-v2.mjs:532](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:532>) | 1 | for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) { |
| [quotient-slot64-residual-pool-v2.mjs:534](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:534>) | 1 | const base = chunkId * CHUNK_WORDS; |

## hashWords2 — [quotient-slot64-residual-pool-v2.mjs:32](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:32>)

Self estimate: 75.9 ms; including callees: 176.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:34](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:34>) | 24 | hash = Math.imul(hash ^ mix32(words[offset]), 0x01000193) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:35](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:35>) | 20 | hash = Math.imul(hash ^ mix32(words[offset + 1]), 0x01000193) >>> 0; |
| [quotient-slot64-residual-pool-v2.mjs:36](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:36>) | 3 | return mix32(hash ^ CHUNK_WORDS); |

## assertClassId — [quotient-slot64-residual-pool-v2.mjs:302](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:302>)

Self estimate: 72.0 ms; including callees: 72.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:303](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:303>) | 44 | if (!Number.isInteger(id) \|\| id < 0 \|\| id >= classCount) { |

## prepareMoves — [quotient-negamax-engine.mjs:315](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:315>)

Self estimate: 64.0 ms; including callees: 221.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:340](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:340>) | 7 | if (frontierComesBefore(previousScore, previousColumn, score, column, proofBest)) break; |
| [quotient-negamax-engine.mjs:345](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:345>) | 7 | moveScores[base + at] = score; |
| [quotient-negamax-engine.mjs:330](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:330>) | 5 | if (!legalAt(stateId, column)) continue; |
| [quotient-negamax-engine.mjs:337](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:337>) | 4 | while (at > 0) { |
| [quotient-negamax-engine.mjs:338](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:338>) | 3 | const previousScore = moveScores[base + at - 1]; |
| [quotient-negamax-engine.mjs:339](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:339>) | 3 | const previousColumn = moveStack[base + at - 1]; |
| [quotient-negamax-engine.mjs:316](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:316>) | 2 | const base = rank * columns; |
| [quotient-negamax-engine.mjs:332](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:332>) | 2 | const score = assertFrontierScore( |
| [quotient-negamax-engine.mjs:342](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:342>) | 2 | moveStack[base + at] = previousColumn; |
| [quotient-negamax-engine.mjs:349](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:349>) | 2 | metrics.frontierOrderedNodes += 1; |
| [quotient-negamax-engine.mjs:343](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:343>) | 1 | at -= 1; |
| [quotient-negamax-engine.mjs:346](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:346>) | 1 | moveStack[base + at] = column; |
| [quotient-negamax-engine.mjs:347](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:347>) | 1 | count += 1; |
| [quotient-negamax-engine.mjs:350](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:350>) | 1 | return count; |

## assertDescriptor — [quotient-semantic-shared-tt.mjs:139](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:139>)

Self estimate: 61.6 ms; including callees: 65.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:140](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:140>) | 26 | if (!descriptor \|\| typeof descriptor !== 'object' \|\| !descriptor.hash) { |
| [quotient-semantic-shared-tt.mjs:149](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:149>) | 5 | if (!Number.isInteger(hi) \|\| hi < 0 \|\| hi > UINT32_MAX) throw new RangeError('semantic TT descriptor hash.hi is invalid'); |
| [quotient-semantic-shared-tt.mjs:151](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:151>) | 3 | const p1Count = semanticQuotientP1Length(descriptor); |
| [quotient-semantic-shared-tt.mjs:146](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:146>) | 1 | const lo = descriptor.hash.lo; |
| [quotient-semantic-shared-tt.mjs:148](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:148>) | 1 | if (!Number.isInteger(lo) \|\| lo < 0 \|\| lo > UINT32_MAX) throw new RangeError('semantic TT descriptor hash.lo is invalid'); |
| [quotient-semantic-shared-tt.mjs:150](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:150>) | 1 | const p0Count = semanticQuotientP0Length(descriptor); |
| [quotient-semantic-shared-tt.mjs:152](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:152>) | 1 | if (p0Count + p1Count > UINT16_MAX) throw new RangeError('semantic TT combined descriptor exceeds Uint16 slot capacity'); |

## ensureClassMetadata — [quotient-local-semantic-descriptor.mjs:150](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:150>)

Self estimate: 61.1 ms; including callees: 441.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:155](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:155>) | 13 | if ((classHashReady[word] & bit) !== 0) { |
| [quotient-local-semantic-descriptor.mjs:151](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:151>) | 9 | const length = termCount(classId); |
| [quotient-local-semantic-descriptor.mjs:150](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:150>) | 5 | function ensureClassMetadata(classId) { |
| [quotient-local-semantic-descriptor.mjs:156](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:156>) | 4 | metrics.classHits += 1; |
| [quotient-local-semantic-descriptor.mjs:152](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:152>) | 3 | ensureClassCapacity(classId + 1); |
| [quotient-local-semantic-descriptor.mjs:166](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:166>) | 2 | return length; |
| [quotient-local-semantic-descriptor.mjs:154](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:154>) | 1 | const bit = 1 << (classId & 31); |

## rankAt — [quotient-native-negamax-support-layout-kernel.mjs:174](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:174>)

Self estimate: 60.5 ms; including callees: 64.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:176](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:176>) | 36 | return (descriptors[supportIndex] >>> rankShift) & rankMask; |
| [quotient-native-negamax-support-layout-kernel.mjs:175](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:175>) | 2 | assertSupportIndex(supportIndex, itemCapacity); |

## _assertId — [quotient-slot64-residual-pool-v2.mjs:82](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:82>)

Self estimate: 58.3 ms; including callees: 58.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:83](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:83>) | 35 | if (!Number.isInteger(id) \|\| id < 0 \|\| id >= this.count) { |

## foldTermIds — [quotient-semantic-identity.mjs:68](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:68>)

Self estimate: 54.2 ms; including callees: 137.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-identity.mjs:71](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:71>) | 15 | hash = Math.imul(hash ^ ((ids[index] + 1) >>> 0), multiplier) >>> 0; |
| [quotient-semantic-identity.mjs:74](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:74>) | 7 | return mix32(hash ^ length); |
| [quotient-semantic-identity.mjs:70](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:70>) | 6 | for (let index = 0; index < length; index += 1) { |
| [quotient-semantic-identity.mjs:72](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:72>) | 6 | hash = mix32(hash ^ index); |
| [quotient-semantic-identity.mjs:69](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:69>) | 1 | let hash = seed >>> 0; |

## assertStateId — [quotient-online-semantic-search-lib.mjs:41](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:41>)

Self estimate: 50.0 ms; including callees: 50.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:43](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:43>) | 18 | if (!Number.isSafeInteger(stateId) \|\| stateId < 0 \|\| stateId >= states.count) { |
| [quotient-online-semantic-search-lib.mjs:42](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:42>) | 6 | if (!Number.isSafeInteger(states.count) \|\| states.count < 1) throw new Error(\`online semantic state count is invalid: ${states.count}\`); |
| [quotient-online-semantic-search-lib.mjs:41](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:41>) | 4 | function assertStateId(stateId) { |
| [quotient-online-semantic-search-lib.mjs:46](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:46>) | 2 | return stateId; |

## childAt — [quotient-native-negamax-support-layout-kernel.mjs:184](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:184>)

Self estimate: 48.4 ms; including callees: 54.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:187](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:187>) | 17 | if (((descriptors[supportIndex] >>> columnShift[column]) & heightMask) >= rows) return BSFP_INVALID_ITEM_U32; |
| [quotient-native-negamax-support-layout-kernel.mjs:188](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:188>) | 10 | return supportIndex + weights[column]; |
| [quotient-native-negamax-support-layout-kernel.mjs:184](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:184>) | 2 | childAt(supportIndex, column) { |
| [quotient-native-negamax-support-layout-kernel.mjs:185](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:185>) | 2 | assertSupportIndex(supportIndex, itemCapacity); |

## read — [quotient-negamax-engine.mjs:73](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:73>)

Self estimate: 47.4 ms; including callees: 74.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:78](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:78>) | 13 | if (!Number.isSafeInteger(hint) \|\| hint < -1 \|\| hint >= columns) { |
| [quotient-negamax-engine.mjs:74](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:74>) | 11 | if (key < 0) { snapshot[0] = -1; snapshot[1] = 1; snapshot[2] = -1; } |
| [quotient-negamax-engine.mjs:76](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:76>) | 4 | assertWdlInterval(snapshot[0], snapshot[1], 'proof read interval'); |
| [quotient-negamax-engine.mjs:77](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:77>) | 1 | const hint = snapshot[2]; |
| [quotient-negamax-engine.mjs:81](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:81>) | 1 | return snapshot; |

## readStateParts — [quotient-local-semantic-descriptor.mjs:188](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:188>)

Self estimate: 45.5 ms; including callees: 498.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:190](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:190>) | 7 | const supportIndex = kernel.states.support[stateId]; |
| [quotient-local-semantic-descriptor.mjs:192](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:192>) | 6 | const p1ClassId = kernel.states.p1Class[stateId]; |
| [quotient-local-semantic-descriptor.mjs:196](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:196>) | 6 | const p0Length = ensureClassMetadata(p0ClassId); |
| [quotient-local-semantic-descriptor.mjs:197](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:197>) | 4 | const p1Length = ensureClassMetadata(p1ClassId); |
| [quotient-local-semantic-descriptor.mjs:191](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:191>) | 2 | const p0ClassId = kernel.states.p0Class[stateId]; |
| [quotient-local-semantic-descriptor.mjs:200](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:200>) | 1 | transientStateDescriptor.p0ClassId = p0ClassId; |
| [quotient-local-semantic-descriptor.mjs:201](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:201>) | 1 | transientStateDescriptor.p1ClassId = p1ClassId; |
| [quotient-local-semantic-descriptor.mjs:203](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:203>) | 1 | transientStateDescriptor.p1Length = p1Length; |
| [quotient-local-semantic-descriptor.mjs:204](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:204>) | 1 | } |

## popcount32 — [quotient-slot64-residual-pool-v2.mjs:47](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:47>)

Self estimate: 42.9 ms; including callees: 42.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:51](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:51>) | 17 | return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; |
| [quotient-slot64-residual-pool-v2.mjs:49](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:49>) | 6 | x -= (x >>> 1) & 0x55555555; |
| [quotient-slot64-residual-pool-v2.mjs:50](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:50>) | 5 | x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); |

## assertWordRange — [quotient-live-line-move-order.mjs:52](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:52>)

Self estimate: 41.0 ms; including callees: 41.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-live-line-move-order.mjs:54](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:54>) | 15 | if (!Number.isInteger(offset) \|\| offset < 0 \|\| offset + length > array.length) { |
| [quotient-live-line-move-order.mjs:53](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:53>) | 11 | if (!(array instanceof Uint32Array)) throw new TypeError(\`${label} must be Uint32Array\`); |

## assertWdlInterval — [quotient-negamax-domain-contract.mjs:29](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:29>)

Self estimate: 39.6 ms; including callees: 39.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:30](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:30>) | 16 | if (!Number.isInteger(lower) \|\| lower < WDL_MIN \|\| lower > WDL_MAX) assertWdlValue(lower, \`${label} lower\`); |
| [quotient-negamax-domain-contract.mjs:31](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:31>) | 9 | if (!Number.isInteger(upper) \|\| upper < WDL_MIN \|\| upper > WDL_MAX) assertWdlValue(upper, \`${label} upper\`); |

## checkedTransition — [quotient-negamax-engine.mjs:147](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:147>)

Self estimate: 36.1 ms; including callees: 6909.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:148](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:148>) | 11 | const child = assertTransitionResult(port.transition(stateId, column), stateId, column); |
| [quotient-negamax-engine.mjs:150](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:150>) | 8 | const parentRank = assertRank(port.rankAt(stateId), port.cellCount, stateId); |
| [quotient-negamax-engine.mjs:147](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:147>) | 1 | function checkedTransition(port, stateId, column) { |
| [quotient-negamax-engine.mjs:149](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:149>) | 1 | if (child >= 0) { |

## frontierBoundsFor — [quotient-negamax-engine.mjs:114](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:114>)

Self estimate: 33.3 ms; including callees: 164.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:115](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:115>) | 18 | if (typeof port.frontierBoundCode !== 'function') return false; |
| [quotient-negamax-engine.mjs:116](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:116>) | 3 | return applyFrontierBoundCode(port.frontierBoundCode(stateId), lower, upper, target); |

## cacheGet — [quotient-slot64-residual-pool-v2.mjs:477](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:477>)

Self estimate: 31.8 ms; including callees: 46.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:477](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:477>) | 10 | function cacheGet(cache, id, cell, own) { |
| [quotient-slot64-residual-pool-v2.mjs:481](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:481>) | 5 | if (own) metrics.outOfPrefixOwn += 1; |
| [quotient-slot64-residual-pool-v2.mjs:482](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:482>) | 2 | else metrics.outOfPrefixBlock += 1; |
| [quotient-slot64-residual-pool-v2.mjs:489](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:489>) | 2 | return value; |
| [quotient-slot64-residual-pool-v2.mjs:480](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:480>) | 1 | if (id >= prefixClasses) { |

## assertMask — [quotient-slot64-residual-pool-v2.mjs:9](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:9>)

Self estimate: 31.5 ms; including callees: 31.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:10](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:10>) | 18 | if (!Number.isInteger(value) \|\| value < 0 \|\| value > UINT32_MAX) throw new RangeError('slot64 masks must be Uint32 values'); |

## assertSupportColumn — [quotient-native-negamax-support-layout-kernel.mjs:252](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:252>)

Self estimate: 29.8 ms; including callees: 29.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:253](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:253>) | 19 | if (!Number.isInteger(column) \|\| column < 0 \|\| column >= columns) throw new RangeError(\`support column ${column} outside 0..${columns - 1}\`); |

## frontierBoundCode — [quotient-native-negamax-slot64-residual-kernel.mjs:29](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:29>)

Self estimate: 27.8 ms; including callees: 68.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-slot64-residual-kernel.mjs:42](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:42>) | 4 | return FRONTIER_BOUND_NONE; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:29](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:29>) | 2 | function frontierBoundCode(stateId) { |
| [quotient-native-negamax-slot64-residual-kernel.mjs:30](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:30>) | 2 | const supportIndex = substrate.states.support[stateId]; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:33](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:33>) | 2 | const p1Class = substrate.states.p1Class[stateId]; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:35](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:35>) | 2 | const opponentClass = mover === 0 ? p1Class : p0Class; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:39](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:39>) | 2 | if (moverNoWin && opponentEmpty) return FRONTIER_BOUND_DRAW; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:41](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:41>) | 2 | if (opponentEmpty) return FRONTIER_BOUND_OPPONENT_NO_WIN; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:34](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:34>) | 1 | const ownClass = mover === 0 ? p0Class : p1Class; |
| [quotient-native-negamax-slot64-residual-kernel.mjs:40](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs:40>) | 1 | if (moverNoWin) return FRONTIER_BOUND_MOVER_NO_WIN; |

## advanceFrontier — [quotient-negamax-engine.mjs:302](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:302>)

Self estimate: 27.2 ms; including callees: 293.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:305](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:305>) | 12 | frontierOrder.advanceInto( |
| [quotient-negamax-engine.mjs:302](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:302>) | 3 | function advanceFrontier(stateId, column, rank) { |
| [quotient-negamax-engine.mjs:307](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:307>) | 1 | rank * frontierWords, |

## hashSemanticQuotientDescriptorPartsUnchecked — [quotient-semantic-identity.mjs:95](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:95>)

Self estimate: 27.1 ms; including callees: 175.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-identity.mjs:95](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:95>) | 8 | export function hashSemanticQuotientDescriptorPartsUnchecked( |
| [quotient-semantic-identity.mjs:110](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:110>) | 3 | hi = mix32(hi ^ p1HashHi ^ Math.imul((p1Length + 5) >>> 0, 0x165667b1)); |
| [quotient-semantic-identity.mjs:105](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:105>) | 2 | let lo = mix32((supportIndex + 0x9e3779b9) >>> 0); |
| [quotient-semantic-identity.mjs:106](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:106>) | 2 | lo = mix32(lo ^ p0HashLo ^ Math.imul((p0Length + 1) >>> 0, 0x85ebca6b)); |
| [quotient-semantic-identity.mjs:107](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:107>) | 1 | lo = mix32(lo ^ p1HashLo ^ Math.imul((p1Length + 1) >>> 0, 0xc2b2ae35)); |
| [quotient-semantic-identity.mjs:109](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:109>) | 1 | hi = mix32(hi ^ p0HashHi ^ Math.imul((p0Length + 3) >>> 0, 0x27d4eb2d)); |
| [quotient-semantic-identity.mjs:111](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:111>) | 1 | return writeHash(target, lo, hi); |

## rankAt — [quotient-online-semantic-search-lib.mjs:153](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:153>)

Self estimate: 26.9 ms; including callees: 87.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:155](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:155>) | 10 | const rank = supportAccess.rankAt(states.support[stateId]); |
| [quotient-online-semantic-search-lib.mjs:154](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:154>) | 6 | assertStateId(stateId); |
| [quotient-online-semantic-search-lib.mjs:156](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:156>) | 1 | if (!Number.isSafeInteger(rank) \|\| rank < 0 \|\| rank > cellCount) throw new Error(\`online semantic rank drifted: ${rank}\`); |

## mix32 — [quotient-native-negamax-support-layout-kernel.mjs:73](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:73>)

Self estimate: 25.0 ms; including callees: 25.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:77](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:77>) | 5 | x ^= x >>> 15; |
| [quotient-native-negamax-support-layout-kernel.mjs:79](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:79>) | 5 | x ^= x >>> 16; |
| [quotient-native-negamax-support-layout-kernel.mjs:75](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:75>) | 3 | x ^= x >>> 16; |
| [quotient-native-negamax-support-layout-kernel.mjs:76](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:76>) | 2 | x = Math.imul(x, 0x7feb352d) >>> 0; |
| [quotient-native-negamax-support-layout-kernel.mjs:78](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:78>) | 1 | x = Math.imul(x, 0x846ca68b) >>> 0; |

## valueAtStack — [quotient-live-line-move-order.mjs:177](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:177>)

Self estimate: 24.9 ms; including callees: 53.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-live-line-move-order.mjs:186](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:186>) | 11 | value += popcount32(stack[playerBase + word] & profile.through[throughBase + word]); |
| [quotient-live-line-move-order.mjs:183](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:183>) | 2 | const throughBase = cell * words; |
| [quotient-live-line-move-order.mjs:178](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:178>) | 1 | assertWordRange(stack, stateOffset, profile.stateWords, 'live-line stack'); |
| [quotient-live-line-move-order.mjs:182](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:182>) | 1 | const playerBase = stateOffset + player * words; |

## #assertClass — [quotient-native-negamax-support-layout-kernel.mjs:561](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:561>)

Self estimate: 23.6 ms; including callees: 25.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:562](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:562>) | 15 | if (!Number.isInteger(id) \|\| id < 0 \|\| id >= this.#classes.size \|\| id > 0xffffffff) throw new RangeError(\`invalid quotient residual class ${id}\`); |

## assertSupportIndex — [quotient-native-negamax-support-layout-kernel.mjs:248](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:248>)

Self estimate: 22.9 ms; including callees: 22.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:249](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:249>) | 14 | if (!Number.isInteger(index) \|\| index < 0 \|\| index >= capacity) throw new RangeError(\`support index ${index} outside 0..${capacity - 1}\`); |

## assertFrontierScore — [quotient-negamax-engine.mjs:195](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:195>)

Self estimate: 21.9 ms; including callees: 21.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:196](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:196>) | 14 | if (!Number.isSafeInteger(score) \|\| score < 0 \|\| score > MAX_FRONTIER_SCORE) { |

## transition — [quotient-online-semantic-search-lib.mjs:176](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:176>)

Self estimate: 21.5 ms; including callees: 6783.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:179](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:179>) | 5 | const child = kernel.advance(stateId, column); |
| [quotient-online-semantic-search-lib.mjs:176](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:176>) | 3 | function transition(stateId, column) { |
| [quotient-online-semantic-search-lib.mjs:180](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:180>) | 2 | if (!Number.isSafeInteger(child) \|\| child < QN_ILLEGAL) throw new Error(\`online semantic transition returned invalid child ${child}\`); |
| [quotient-online-semantic-search-lib.mjs:182](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:182>) | 1 | return child; |

## tacticalCode — [quotient-online-semantic-search-lib.mjs:185](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:185>)

Self estimate: 21.3 ms; including callees: 895.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:187](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:187>) | 8 | const code = kernel.tacticalCode(stateId); |
| [quotient-online-semantic-search-lib.mjs:188](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:188>) | 6 | assertTacticalCode(code, columns); |

## assertProofReadTarget — [quotient-negamax-domain-contract.mjs:109](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:109>)

Self estimate: 20.9 ms; including callees: 20.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:110](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:110>) | 13 | if (!(target instanceof Float64Array) \|\| target.length !== 3) { |

## popcount32 — [quotient-live-line-move-order.mjs:35](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:35>)

Self estimate: 19.4 ms; including callees: 19.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-live-line-move-order.mjs:37](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:37>) | 4 | x -= (x >>> 1) & 0x55555555; |
| [quotient-live-line-move-order.mjs:38](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:38>) | 4 | x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); |
| [quotient-live-line-move-order.mjs:39](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:39>) | 4 | return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; |

## assertCell — [quotient-slot64-residual-pool-v2.mjs:309](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:309>)

Self estimate: 19.2 ms; including callees: 19.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:310](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:310>) | 12 | if (!Number.isInteger(cell) \|\| cell < 0 \|\| cell >= vocabulary.cellCount) { |

## cacheSet — [quotient-slot64-residual-pool-v2.mjs:492](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:492>)

Self estimate: 17.4 ms; including callees: 25.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:495](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:495>) | 6 | if (value !== CLASS_TERMINAL_WIN && (!Number.isInteger(value) \|\| value < 0 \|\| value >= classCount)) { |
| [quotient-slot64-residual-pool-v2.mjs:492](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:492>) | 3 | function cacheSet(cache, id, cell, value) { |
| [quotient-slot64-residual-pool-v2.mjs:498](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:498>) | 1 | if (id >= prefixClasses) return; |
| [quotient-slot64-residual-pool-v2.mjs:501](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:501>) | 1 | } |

## assertTacticalColumns — [quotient-negamax-domain-contract.mjs:45](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:45>)

Self estimate: 17.3 ms; including callees: 17.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:47](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:47>) | 11 | if (columns < 1 \|\| columns > TACTICAL_IMMEDIATE_BASE) { |

## landingForLegalMove — [quotient-negamax-engine.mjs:294](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:294>)

Self estimate: 16.7 ms; including callees: 90.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:295](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:295>) | 6 | const landingCell = landingCellAt(stateId, column); |
| [quotient-negamax-engine.mjs:296](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:296>) | 5 | if (!Number.isSafeInteger(landingCell) \|\| landingCell < 0 \|\| landingCell >= cellCount) { |

## probeHandle — [quotient-online-semantic-search-lib.mjs:79](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:79>)

Self estimate: 15.5 ms; including callees: 1802.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:81](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:81>) | 7 | return rememberHandle(stateId, tt.probe(descriptor(stateId))); |
| [quotient-online-semantic-search-lib.mjs:80](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:80>) | 3 | identityMetrics.ttProbes += 1; |

## setEdge — [quotient-native-negamax-support-layout-kernel.mjs:554](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:554>)

Self estimate: 15.1 ms; including callees: 15.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:556](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:556>) | 7 | if (target !== QN_ILLEGAL && target !== QN_TERMINAL_WIN |
| [quotient-native-negamax-support-layout-kernel.mjs:558](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:558>) | 2 | if (this.edges) this.edges[id * this.columns + column] = target; |

## landingCellAt — [quotient-online-semantic-search-lib.mjs:166](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:166>)

Self estimate: 14.7 ms; including callees: 75.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:166](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:166>) | 3 | function landingCellAt(stateId, column) { |
| [quotient-online-semantic-search-lib.mjs:169](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:169>) | 2 | const landing = supportAccess.landingAt(states.support[stateId], column); |
| [quotient-online-semantic-search-lib.mjs:170](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:170>) | 2 | if (landing !== 0xff && (!Number.isSafeInteger(landing) \|\| landing < 0 \|\| landing >= cellCount)) { |
| [quotient-online-semantic-search-lib.mjs:173](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:173>) | 1 | return landing; |

## assertBits — [quotient-slot64-residual-pool-v2.mjs:326](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:326>)

Self estimate: 14.5 ms; including callees: 14.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:327](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:327>) | 9 | if (!(bits instanceof Uint32Array) \|\| bits.length !== WORDS_PER_CLASS) { |

## ensureReferenceWidth — [quotient-slot64-residual-pool-v2.mjs:332](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:332>)

Self estimate: 14.2 ms; including callees: 14.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:336](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:336>) | 9 | if (current.BYTES_PER_ELEMENT >= Type.BYTES_PER_ELEMENT) return; |

## transition — [quotient-negamax-engine.mjs:275](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:275>)

Self estimate: 14.1 ms; including callees: 6925.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:277](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:277>) | 6 | return checkedTransition(port, stateId, column); |
| [quotient-negamax-engine.mjs:276](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:276>) | 3 | metrics.transitionsRequested += 1; |

## termCount — [quotient-local-semantic-descriptor.mjs:125](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:125>)

Self estimate: 13.8 ms; including callees: 151.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:128](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:128>) | 4 | if (!Number.isInteger(count) \|\| count < 0 \|\| count > MAX_DESCRIPTOR_LENGTH \|\| count > vocabularyCount) { |
| [quotient-local-semantic-descriptor.mjs:131](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:131>) | 3 | return count; |
| [quotient-local-semantic-descriptor.mjs:125](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:125>) | 2 | function termCount(classId) { |

## assertColumn — [quotient-online-semantic-search-lib.mjs:49](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:49>)

Self estimate: 13.2 ms; including callees: 13.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:50](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:50>) | 7 | if (!Number.isSafeInteger(column) \|\| column < 0 \|\| column >= columns) { |

## assertStateId — [quotient-native-negamax-support-layout-kernel.mjs:618](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:618>)

Self estimate: 12.9 ms; including callees: 12.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:619](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:619>) | 8 | if (!Number.isInteger(stateId) \|\| stateId < 0 \|\| stateId >= states.count) { |

## assertClassId — [quotient-local-semantic-descriptor.mjs:89](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:89>)

Self estimate: 12.7 ms; including callees: 19.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:91](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:91>) | 4 | if (!Number.isInteger(size) \|\| size < 0) throw new Error(\`residual class pool reported invalid size ${size}\`); |
| [quotient-local-semantic-descriptor.mjs:92](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:92>) | 3 | if (!Number.isInteger(classId) \|\| classId < 0 \|\| classId >= size) { |
| [quotient-local-semantic-descriptor.mjs:89](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:89>) | 1 | function assertClassId(classId) { |

## get — [quotient-slot64-residual-pool-v2.mjs:503](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:503>)

Self estimate: 12.6 ms; including callees: 12.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:503](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:503>) | 7 | Object.defineProperty(pool, 'size', { configurable: true, get: () => classCount }); |

## assertCellBits — [quotient-slot64-residual-pool-v2.mjs:316](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:316>)

Self estimate: 12.5 ms; including callees: 48.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:323](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:323>) | 5 | if (bitLo !== expectedLo \|\| bitHi !== expectedHi) throw new Error('slot64 cell-mask mismatch'); |
| [quotient-slot64-residual-pool-v2.mjs:318](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:318>) | 1 | assertMask(bitLo); |
| [quotient-slot64-residual-pool-v2.mjs:320](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:320>) | 1 | const bit = (1 << (cell & 31)) >>> 0; |

## everyTermInMask — [quotient-slot64-residual-pool-v2.mjs:715](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:715>)

Self estimate: 11.4 ms; including callees: 11.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:717](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:717>) | 2 | if (!(allowed instanceof Uint32Array) \|\| allowed.length !== WORDS_PER_CLASS) { |
| [quotient-slot64-residual-pool-v2.mjs:721](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:721>) | 2 | const chunk = classSlotIds[slot][id]; |
| [quotient-slot64-residual-pool-v2.mjs:722](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:722>) | 2 | const words = slotPools[slot].words; |
| [quotient-slot64-residual-pool-v2.mjs:723](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:723>) | 1 | if ((words[chunk * 2] & ~allowed[slot * 2]) !== 0 |

## assertHandle — [quotient-online-semantic-search-lib.mjs:62](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:62>)

Self estimate: 11.3 ms; including callees: 11.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:63](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:63>) | 4 | if (!Number.isSafeInteger(handle)) throw new Error(\`${label} returned non-integer handle ${handle}\`); |
| [quotient-online-semantic-search-lib.mjs:64](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:64>) | 2 | if (allowMiss && handle === -1) return handle; |
| [quotient-online-semantic-search-lib.mjs:66](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:66>) | 1 | throw new Error(\`${label} returned malformed generation handle ${handle}\`); |

## rememberHandle — [quotient-online-semantic-search-lib.mjs:71](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:71>)

Self estimate: 11.2 ms; including callees: 25.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:74](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:74>) | 4 | cachedStateId = stateId; |
| [quotient-online-semantic-search-lib.mjs:75](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:75>) | 3 | cachedHandle = handle; |

## assertStateId — [quotient-local-semantic-descriptor.mjs:98](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:98>)

Self estimate: 11.2 ms; including callees: 11.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:101](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:101>) | 5 | if (!Number.isInteger(stateId) \|\| stateId < 0 \|\| stateId >= count) { |
| [quotient-local-semantic-descriptor.mjs:100](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:100>) | 2 | if (!Number.isInteger(count) \|\| count < 1) throw new Error(\`quotient state pool reported invalid count ${count}\`); |

## assertTacticalCode — [quotient-negamax-domain-contract.mjs:71](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:71>)

Self estimate: 11.1 ms; including callees: 33.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:74](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:74>) | 6 | if (code === TACTICAL_NONE \|\| code === TACTICAL_DRAW \|\| code === TACTICAL_LOSS) return code; |
| [quotient-negamax-domain-contract.mjs:71](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:71>) | 1 | export function assertTacticalCode(code, columns) { |

## hasEvenColumnRemainders — [quotient-native-negamax-support-layout-kernel.mjs:168](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:168>)

Self estimate: 11.1 ms; including callees: 11.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:170](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:170>) | 6 | return (descriptors[supportIndex] & heightParityMask) === pairedHeightParity; |

## supportIndexAt — [quotient-native-negamax-support-layout-kernel.mjs:624](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:624>)

Self estimate: 9.6 ms; including callees: 12.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:626](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:626>) | 6 | return states.support[stateId]; |

## applyFrontierBoundCode — [quotient-negamax-domain-contract.mjs:83](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:83>)

Self estimate: 8.4 ms; including callees: 48.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:86](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:86>) | 2 | assertWdlInterval(lower, upper, 'stored proof interval'); |
| [quotient-negamax-domain-contract.mjs:89](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:89>) | 2 | if (code === FRONTIER_BOUND_NONE) { target[0] = lower; target[1] = upper; return false; } |
| [quotient-negamax-domain-contract.mjs:84](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:84>) | 1 | assertProofReadTarget(target); |

## frontierBoundCode — [quotient-online-semantic-search-lib.mjs:192](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:192>)

Self estimate: 7.8 ms; including callees: 82.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:194](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:194>) | 5 | return kernel.frontierBoundCode?.(stateId) ?? 0; |

## ensureClassCapacity — [quotient-slot64-residual-pool-v2.mjs:343](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:343>)

Self estimate: 7.6 ms; including callees: 7.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:350](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:350>) | 2 | const target = new Type(next); |
| [quotient-slot64-residual-pool-v2.mjs:345](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:345>) | 1 | if (required <= classCapacity) return; |
| [quotient-slot64-residual-pool-v2.mjs:356](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:356>) | 1 | const lo = new Uint32Array(next); lo.set(singletonLo); |
| [quotient-slot64-residual-pool-v2.mjs:357](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:357>) | 1 | const hi = new Uint32Array(next); hi.set(singletonHi); |

## edgeAt — [quotient-native-negamax-support-layout-kernel.mjs:549](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:549>)

Self estimate: 7.6 ms; including callees: 10.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:551](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:551>) | 5 | return this.edges ? this.edges[id * this.columns + column] : QN_EDGE_UNKNOWN; |

## frontierComesBefore — [quotient-negamax-engine.mjs:202](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:202>)

Self estimate: 7.5 ms; including callees: 7.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:203](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:203>) | 3 | if (leftScore !== rightScore) return leftScore > rightScore; |
| [quotient-negamax-engine.mjs:206](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:206>) | 2 | if (leftProof !== rightProof) return leftProof; |

## assertTransitionResult — [quotient-negamax-engine.mjs:125](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:125>)

Self estimate: 7.4 ms; including callees: 7.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:126](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:126>) | 5 | if (!Number.isSafeInteger(result) \|\| result < QN_ILLEGAL) { |

## writeClassTerms — [quotient-local-semantic-descriptor.mjs:134](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:134>)

Self estimate: 7.3 ms; including callees: 96.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:139](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:139>) | 3 | throw new RangeError(\`semantic term target cannot hold class ${classId} length ${expectedLength} at offset ${offset}\`); |
| [quotient-local-semantic-descriptor.mjs:138](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:138>) | 1 | \|\| offset + expectedLength > target.length) { |
| [quotient-local-semantic-descriptor.mjs:145](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:145>) | 1 | metrics.directTermWrites += 1; |

## bucketBase — [quotient-semantic-shared-tt.mjs:312](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:312>)

Self estimate: 6.6 ms; including callees: 6.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:313](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:313>) | 4 | return (descriptor.hash.lo & bucketMask) * arena.associativity; |

## computeClassMetadata — [quotient-slot64-residual-pool-v2.mjs:399](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:399>)

Self estimate: 5.6 ms; including callees: 12.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:405](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:405>) | 2 | count += popcount32(bits[word]); |
| [quotient-slot64-residual-pool-v2.mjs:418](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:418>) | 1 | singletonHi[classId] = hi; |

## _growHash — [quotient-native-negamax-support-layout-kernel.mjs:499](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:499>)

Self estimate: 5.2 ms; including callees: 8.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:507](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:507>) | 2 | while (next[slot] !== -1) slot = (slot + 1) & mask; |
| [quotient-native-negamax-support-layout-kernel.mjs:506](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:506>) | 1 | let slot = hashStateTriple(this.support[id], this.p0Class[id], this.p1Class[id]) & mask; |

## ensureClassCapacity — [quotient-local-semantic-descriptor.mjs:107](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:107>)

Self estimate: 5.0 ms; including callees: 5.0 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-local-semantic-descriptor.mjs:109](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:109>) | 2 | if (required <= classCapacity) return; |
| [quotient-local-semantic-descriptor.mjs:108](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-local-semantic-descriptor.mjs:108>) | 1 | if (!Number.isInteger(required) \|\| required < 1) throw new RangeError(\`invalid semantic class capacity request ${required}\`); |

## isLegal — [quotient-online-semantic-search-lib.mjs:160](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:160>)

Self estimate: 4.8 ms; including callees: 16.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:163](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:163>) | 3 | return supportAccess.landingAt(states.support[stateId], column) !== 0xff; |

## assertInteger — [quotient-negamax-domain-contract.mjs:17](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:17>)

Self estimate: 4.8 ms; including callees: 4.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:18](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:18>) | 3 | if (!Number.isInteger(value)) throw new TypeError(\`${label} must be an integer, got ${value}\`); |

## descriptorEquals — [quotient-semantic-shared-tt.mjs:374](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:374>)

Self estimate: 4.7 ms; including callees: 19.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:382](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:382>) | 2 | return termsEqual(termChunkHead[slot], expected, total); |
| [quotient-semantic-shared-tt.mjs:379](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:379>) | 1 | if (p0Length[slot] !== p0Count \|\| p1Length[slot] !== p1Count) return false; |

## installDescriptor — [quotient-semantic-shared-tt.mjs:474](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:474>)

Self estimate: 4.7 ms; including callees: 8.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:504](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:504>) | 1 | hashLo[slot] = descriptor.hash.lo; |
| [quotient-semantic-shared-tt.mjs:511](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:511>) | 1 | Atomics.store(records, slot, INITIAL_SEARCH_RECORD); |
| [quotient-semantic-shared-tt.mjs:524](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:524>) | 1 | Atomics.notify(status, slot); |

## assertPlayer — [quotient-live-line-move-order.mjs:42](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:42>)

Self estimate: 4.7 ms; including callees: 4.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-live-line-move-order.mjs:43](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs:43>) | 3 | if (player !== 0 && player !== 1) throw new RangeError(\`${label} must be 0 or 1\`); |

## chunkCapacity — [quotient-semantic-shared-tt.mjs:348](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:348>)

Self estimate: 4.5 ms; including callees: 4.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:352](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:352>) | 3 | return terms[start + 2]; |

## (anonymous) — [quotient-negamax-engine.mjs:162](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:162>)

Self estimate: 4.5 ms; including callees: 20.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:165](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:165>) | 2 | if (typeof legal !== 'boolean') throw new TypeError(\`isLegal(${stateId}, ${column}) must return boolean\`); |
| [quotient-negamax-engine.mjs:163](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:163>) | 1 | if (!Number.isSafeInteger(column) \|\| column < 0 \|\| column >= columns) return false; |

## moverNoWin — [quotient-paired-response-closure.mjs:38](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-paired-response-closure.mjs:38>)

Self estimate: 4.2 ms; including callees: 26.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-paired-response-closure.mjs:40](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-paired-response-closure.mjs:40>) | 2 | && classes.everyTermInMask(moverClass, covered); |
| [quotient-paired-response-closure.mjs:39](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-paired-response-closure.mjs:39>) | 1 | return supportAccess.hasEvenColumnRemainders(supportIndex) |

## hashStateTriple — [quotient-native-negamax-support-layout-kernel.mjs:92](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:92>)

Self estimate: 4.2 ms; including callees: 29.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:93](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:93>) | 1 | let hash = mix32(supportIndex + 0x9e3779b9); |
| [quotient-native-negamax-support-layout-kernel.mjs:94](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:94>) | 1 | hash = mix32(hash ^ Math.imul((p0Class + 1) >>> 0, 0x85ebca6b)); |
| [quotient-native-negamax-support-layout-kernel.mjs:95](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:95>) | 1 | hash = mix32(hash ^ Math.imul((p1Class + 1) >>> 0, 0xc2b2ae35)); |

## pool.isEmpty — [quotient-slot64-residual-pool-v2.mjs:510](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:510>)

Self estimate: 3.2 ms; including callees: 11.3 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:510](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:510>) | 2 | pool.isEmpty = (id) => assertClassId(id) === emptyClass; |

## #assertEdgeAddress — [quotient-native-negamax-support-layout-kernel.mjs:565](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:565>)

Self estimate: 3.2 ms; including callees: 3.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:567](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:567>) | 2 | assertSupportColumn(column, this.columns); |

## load — [quotient-packed-proof-store.mjs:99](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-packed-proof-store.mjs:99>)

Self estimate: 3.2 ms; including callees: 3.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-packed-proof-store.mjs:112](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-packed-proof-store.mjs:112>) | 1 | const record = Atomics.load(records, slot); |
| [quotient-packed-proof-store.mjs:116](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-packed-proof-store.mjs:116>) | 1 | if (stateAfter === ready \|\| stateAfter === proofWriting) return assertSearchRecord(record); |

## assertKey — [quotient-negamax-engine.mjs:55](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:55>)

Self estimate: 3.1 ms; including callees: 3.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:57](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:57>) | 2 | if (!Number.isSafeInteger(key) \|\| key < minimum) throw new Error(\`${label} returned invalid proof key ${key}\`); |

## growClassHash — [quotient-slot64-residual-pool-v2.mjs:376](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:376>)

Self estimate: 3.1 ms; including callees: 3.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-slot64-residual-pool-v2.mjs:379](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:379>) | 1 | next.fill(-1); |
| [quotient-slot64-residual-pool-v2.mjs:384](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool-v2.mjs:384>) | 1 | next[slot] = id; |

## _ensureStateCapacity — [quotient-native-negamax-support-layout-kernel.mjs:474](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:474>)

Self estimate: 1.9 ms; including callees: 3.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:474](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:474>) | 1 | _ensureStateCapacity(required) { |

## semanticQuotientP1Length — [quotient-semantic-identity.mjs:237](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:237>)

Self estimate: 1.9 ms; including callees: 3.4 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-identity.mjs:243](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:243>) | 1 | return assertUint16Length(descriptor.p1Length, 'semantic p1 length'); |

## tacticalForcedColumn — [quotient-negamax-domain-contract.mjs:66](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:66>)

Self estimate: 1.8 ms; including callees: 1.8 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-domain-contract.mjs:67](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs:67>) | 1 | assertTacticalColumns(columns); |

## ensureHandle — [quotient-online-semantic-search-lib.mjs:84](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:84>)

Self estimate: 1.7 ms; including callees: 12.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:86](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:86>) | 1 | const handle = assertHandle(tt.ensure(descriptor(stateId)), 'semantic TT ensure', false); |

## requireLegalTransition — [quotient-negamax-engine.mjs:132](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:132>)

Self estimate: 1.6 ms; including callees: 7.9 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:133](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:133>) | 1 | assertTransitionResult(result, stateId, column); |

## currentHandle — [quotient-online-semantic-search-lib.mjs:90](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:90>)

Self estimate: 1.6 ms; including callees: 2.7 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:92](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:92>) | 1 | if (cachedStateId === stateId && cachedHandle >= 0) { |

## probe — [quotient-negamax-engine.mjs:61](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:61>)

Self estimate: 1.6 ms; including callees: 1809.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:64](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:64>) | 1 | return key; |

## proofKey — [quotient-online-semantic-search-lib.mjs:204](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:204>)

Self estimate: 1.6 ms; including callees: 1804.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-online-semantic-search-lib.mjs:206](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-online-semantic-search-lib.mjs:206>) | 1 | return handle < 0 ? -1 : stateId; |

## nextGeneration — [quotient-semantic-shared-tt.mjs:459](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:459>)

Self estimate: 1.6 ms; including callees: 1.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:460](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:460>) | 1 | const current = Atomics.load(generation, slot); |

## assertUint16Length — [quotient-semantic-identity.mjs:21](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:21>)

Self estimate: 1.6 ms; including callees: 1.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-identity.mjs:22](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-identity.mjs:22>) | 1 | if (!Number.isInteger(value) \|\| value < 0 \|\| value > UINT16_MAX) { |

## assertRank — [quotient-negamax-engine.mjs:140](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:140>)

Self estimate: 1.6 ms; including callees: 1.6 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-engine.mjs:141](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-engine.mjs:141>) | 1 | if (!Number.isSafeInteger(rank) \|\| rank < 0 \|\| rank > cellCount) { |

## copy — [quotient-native-negamax-support-layout-kernel.mjs:477](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:477>)

Self estimate: 1.5 ms; including callees: 1.5 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-native-negamax-support-layout-kernel.mjs:478](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs:478>) | 1 | const target = new Type(nextCapacity); |

## addSharedCounter — [quotient-semantic-shared-tt.mjs:398](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:398>)

Self estimate: 1.2 ms; including callees: 1.2 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:406](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:406>) | 1 | if (Atomics.compareExchange(meta, index, current, next) === current) return next; |

## assertSearchRecord — [quotient-negamax-search-record.mjs:24](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-search-record.mjs:24>)

Self estimate: 1.1 ms; including callees: 1.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-negamax-search-record.mjs:25](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-negamax-search-record.mjs:25>) | 1 | if (!Number.isInteger(record) \|\| record < 0 \|\| record > 0x7f) { |

## isCurrent — [quotient-packed-proof-store.mjs:84](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-packed-proof-store.mjs:84>)

Self estimate: 1.1 ms; including callees: 1.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-packed-proof-store.mjs:89](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-packed-proof-store.mjs:89>) | 1 | const state = Atomics.load(status, slot); |

## acquireBucket — [quotient-semantic-shared-tt.mjs:446](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:446>)

Self estimate: 0.1 ms; including callees: 0.1 ms.

| Source location | Position ticks | Code |
|---|---:|---|
| [quotient-semantic-shared-tt.mjs:448](<C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/connect4-frontier-audit/research/semantic-quotient/state-identity-unification/src/quotient-semantic-shared-tt.mjs:448>) | 1 | while (Atomics.compareExchange(bucketLocks, bucket, 0, 1) !== 0) { |

