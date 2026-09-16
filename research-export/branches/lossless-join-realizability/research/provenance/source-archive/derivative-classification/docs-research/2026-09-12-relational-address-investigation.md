# Relational position, direct addressing and reusable identity

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assessment and governing model

Investigated the owner's proposal to use positions already present in the
relational structure instead of rediscovering identity through hashing. Local
HEAD remains `0317c1c95eeae2e6b3e60040eed57198f4f5f9eb`; prior working-tree changes
remain intact. No production source was changed for this investigation.

AGENT_LOCAL and C4-0001/0006/0010 govern domain meaning, canonical normalized
residuals, support and separate proof ownership. The preserved
[representation discussion](2026-09-09-win-space-representation-discussion.md)
explicitly considers numeric incidence structures and prefix sharing, without
requiring a pointer-heavy graph. The [winspace results](2026-09-09-winspace-results.md)
already use goal-address XOR to recover a missing cell under count premises.
That exact address-recovery operation is different from using a compressed XOR
as the identity of an arbitrary set. That experiment's exact TT key retained
frontiers and player live masks; it still used hashing for table addressing.

## What the current representation already provides

| Surface | Existing exact address/identity | Remaining lookup work |
|---|---|---|
| Term vocabulary | Fixed term ID, hence slot and bit position | None to locate a known term; reduction uses `reduce[termId * cellCount + cell]` |
| Support | Initialization-derived support index | Direct descriptor/landing/child access; support alone does not identify both residuals |
| Known chunk | Slot owner plus stable chunk ID | Direct two-word access; no hash needed |
| Unchanged child chunk | Existing parent's slot/chunk ID | Already reused without interning |
| Changed chunk | Exact new two-word term mask in a known slot | Discover whether that content already has a canonical chunk ID |
| Residual class | Ordered tuple of slot-owned chunk IDs | Intern the tuple; current code recomputes its hash over all slots |
| Local state | Support plus P0/P1 canonical class IDs | Intern the triple; known state/column edges already bypass this |
| Shared proof state | Canonical support and P0/P1 residual content | Worker-local IDs are insufficient across workers; exact content and generation checks remain |

Files traced: `quotient-term-id-pool.mjs`,
`quotient-slot64-residual-pool-v2.mjs`,
`quotient-native-negamax-support-layout-kernel.mjs`,
`quotient-native-negamax-slot64-residual-kernel.mjs`,
`quotient-local-semantic-descriptor.mjs`, `quotient-semantic-identity.mjs`,
`quotient-semantic-shared-tt.mjs` and the bounded runner's active dependency graph.

The slot supplies position; it does not supply which subset of its terms is
present. Two aligned words already contain that subset exactly. There is no need
to add another position field. Aligned XOR/OR equality is exact:

```js
((a0 ^ b0) | (a1 ^ b1)) === 0
```

This comparison still needs a candidate's address. The existing two `===`
comparisons have the same identity meaning; changing their spelling alone has
not been shown to improve JIT output.

## Executed bounded investigation

Ran the normal empty 7-column by 6-row, connect-4 search to depth 8 with its hard
60-second child timeout. Inspection runs after search and CPU timing end. It
reads published canonical chunks/states without changing the recursive search.
Diagnostic Maps, sorting and BigInts are outside search and are not proposed hot
path machinery. Geometry comes from kernel initialization.

[Source snapshots and manifest](evidence/2026-09-12-relational-address-investigation/source-manifest.json)
freeze 19 dependency files; hashes were checked again after the child exited.
[Result](evidence/2026-09-12-relational-address-investigation/result.json) matches
the previous normal result, all search/proof/descriptor/operation counters, kernel
memory and storage-growth counters exactly. Search completed in 1947.2135 ms,
2125 CPU ms; this single run is not an optimization comparison. Root remains
unknown at the horizon. No full-root solve or trigger change occurred.

[Raw address analysis](evidence/2026-09-12-relational-address-investigation/addresses.json)
and [reproducible inspection](evidence/2026-09-12-relational-address-investigation/inspect.mjs)
show:

- 160,743 distinct chunks across ten slot dictionaries. The largest slot holds
  132,068 different exact chunks, despite all having the same slot position.
- That slot has only 51,364 distinct low words and 113,380 distinct `lo XOR hi`
  values. Neither projection is an exact address for its observed contents.
- A concrete same-slot XOR collision is `[1375775296, 36869]` versus
  `[1375774784, 37381]`: both fold to `1375746629`. Aligned full-word comparison
  distinguishes them. This falsifies the fold, not the exact relational mask.
- 221,398 states share just 6,379 support indices; one support has 69 distinct
  states. For example, support 2114 occurs with class pairs `(21,20)` and `(39,38)`.
  A support address alone cannot select the exact state.
- Existing structural reuse already bypasses 4,355,811 transitions and reuses
  5,549,664 parent chunks. These paths must not be sent back through hashing.

## Hash-free lookup layouts assessed

A fully direct mask-indexed array uses the exact mask as its address. Even the
smallest observed dictionary uses 25 distinct bit positions across its keys:
enumerating every combination would require 128 MiB of four-byte entries for
that dictionary alone. This describes the raw address space, not a claim that
all those combinations are legal. Ranking only legal/reachable combinations
would require a separately justified cheap rank or another index.

A radix structure can instead navigate those existing bit positions without a
hash. Two explicit layouts were analyzed over the observed keys:

- An eight-level high-byte-first radix with 256-entry child arrays requires
  143,417,344 index bytes (136.77 MiB) for the observed corpus, before chunk keys.
- A compressed binary radix with two Int32 children and one Uint8 distinguishing
  bit per internal node needs 23,592,870 index bytes at the current full reserved
  capacity, versus the current 15,728,640 index bytes. Uniform successful lookups
  across distinct keys take 12.29–24.59 bit decisions on average per dictionary;
  the largest dictionary averages 24.59, maximum 34. Other dictionaries reach 59.

These are exact layout/step calculations, not implemented engine benchmarks or
cache measurements. They do not reject all possible radix layouts or a future
proved structural ranking. They do not justify replacing the current index with
either assessed layout. Successful distinct-key averages also do not represent
the search's hit/miss frequency distribution.

## Reassessment and next experiment

The useful remaining opportunity is removing the second identity traversal where
the transition already owns the changed positions. Both `internBits` and
`blockTransition` assemble the result tuple, reusing unchanged slot IDs, then call
`hashChunkTuple` to walk every slot again.

A candidate is a slot-dependent XOR composition updated from the parent class:

```text
childHash = parentHash
for each changed slot:
    childHash ^= contribution(slot, oldChunkId)
    childHash ^= contribution(slot, newChunkId)
```

Slot position is already available from the transition loop; no position field
needs to be copied or reconstructed. The current sequential tuple hash is not
XOR-decomposable, so this requires a deliberately changed composition, not XORing
arbitrary values into the existing hash. Local slot-owned IDs can be used for
local class interning only. Exact tuple comparison remains authoritative. Shared
semantic fingerprints must instead use content agreed across workers.

This could remove work over unchanged positions without a transition memo or
duplicated key payload. It is not yet implemented or qualified. Assess arithmetic,
collision distribution and the existing class-hash owner before introducing
metadata. If implemented, compare against full recomputation, adversarially test
slot changes/collisions, and repeat bounded source-mapped CPU measurement. The
previously rejected chunk-transition caches remain rejected evidence.

A separate first-class-descriptor traversal still materializes term IDs into
scratch before hashing. Computing a compatible content fingerprint within the
canonical residual owner is another possible unit; it must cover all semantic
adapters consistently. Neither opportunity establishes full-root readiness.

## Cleanup

Investigation and evidence only: production hashes unchanged, child exited,
search bounds/counters unchanged. Status, next-step, research index and audit
ledger point here. No ref, protected-main, workflow or engine change occurred.
