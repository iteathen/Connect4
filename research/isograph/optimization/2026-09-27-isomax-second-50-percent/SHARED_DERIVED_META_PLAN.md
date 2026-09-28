# IsoMax Phase-2 plan — derived meta word shared-key projection

Date: 2026-09-28
Status: planned exact structural experiment; no production-profile change authorized.

## Trigger

The completed shared-density sweep rejected uniform traffic reduction. Full sharing remains selected because reduced sharing lowers cycles/node but expands the completed exact tree enough to lose whole-process cycles.

The next measured operation class is therefore shared exact identity representation itself.

## Exact structural observation

For configured geometry:

```
metaOffset = columns
coordWords = ceil(lineCount / 32)
keyWords = columns + 1 + 2*coordWords
```

The q word layout is:

1. one uint32 support height per column;
2. one meta word;
3. P0 residual coordinate words;
4. P1 residual coordinate words.

Core 0.20 primitive semantics defines ordinary q by exactly:

```
SUPPORT
P0_RESIDUAL
P1_RESIDUAL
```

Rank/side are derived from support.

For every q admitted to the solver-owned exact caches:

- the q is nonterminal at cache probe/publication time;
- terminal bits in the meta word are therefore zero;
- rank is the sum of the support heights;
- consequently
  `meta = (sum support heights) << 2`.

Therefore, on the admissible shared-cache domain:

```
equal(all q words except meta) <=> equal(full q words)
```

The reverse direction is trivial. The forward direction follows because equal support implies equal rank, and nonterminality fixes the low meta bits to zero.

This applies to arbitrary configured geometry; it does not depend on 7x6 constants.

## Hash-reuse consequence

The preferred solver already computes the full-q locator hash for the private cache and reuses it for shared lookup/publication.

That hash may remain unchanged.

If two projected shared identities are equal, their omitted meta words are exactly derivable and equal, so their full q words are equal and the already-computed full-q hashes are equal. The hash remains a locator only; exact shared equality remains explicit.

No probabilistic fingerprint or weakened equality is introduced.

## Candidate

Create an isolated JSMinSys experiment from preferred solver source:

`f549dcfdd7d4d0c5ed5cd01cb3141812f1d59862`.

Candidate shared-cache representation:

- retain `keyWords` as the full q width for hash/protocol compatibility;
- add an initialization-time derived/omitted word index;
- configure it to `geometry.metaOffset` from the Lazy-SMP host;
- store the remaining `keyWords - 1` words contiguously in the shared key array;
- probe/store compare/publish both exact segments around the omitted word;
- leave the private local cache unchanged;
- leave shared values exact-only;
- leave `sharedSampleMask=0` for the preferred profile;
- preserve 4-worker topology as 1 wide + 3 deep.

For standard 7x6 this reduces the shared key from 14 stored uint32 words to 13.

At shared capacity 4,194,304 this removes exactly 16 MiB from the shared key array and one atomic key publication per successful store. A full shared hit also avoids one atomic key load. Mismatch-prefix behavior should otherwise remain structurally unchanged.

## Correctness gates

Before performance acceptance:

1. prove/configure the derived-word invariant for 4x4, 7x6 and 10x10 generated legal nonterminal q states;
2. verify projected equality iff full-q equality over those controls;
3. verify known-hash shared lookup still rejects different projected q;
4. preserve WDL/root move on exact controls;
5. keep single-worker execution forbidden.

Any public/general shared-cache use without an explicit derived-word contract must retain full-key semantics.

## Cycle-accounting gate

Any JSMinSys source change must update the cycle ledger in the same work.

The shared-cache create/probe/store ledgers must account for:

- the reduced compared/published key width;
- the split-segment loop/control work;
- changed shared allocation bytes;
- any new initialization checks/field loads.

Changed source blobs must be resealed before benchmarking.

## Benchmark

Use fixed source and matched A/B:

A — preferred full 14-word shared identity.

B — exact derived-meta projection, 13 stored shared words.

Both:

- 4 workers = 1 wide + 3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- sharedSampleMask=0;
- Node 26.7.0;
- identical search logic.

Primary exact fixture: `353335714`.

Acceptance authority: completed exact whole-process cycles, with root WDL/root move identical.

Secondary hard fixture: `35333571` at the existing 120000 ms ceiling; timeouts remain censored.

## Falsifier

Reject the projection if it fails exact identity/correctness gates or if completed exact whole-process cycles do not establish an improvement.

Do not promote from memory savings or cycles/node alone.

PR #84 remains draft/open and receives no merge authorization from this experiment.
