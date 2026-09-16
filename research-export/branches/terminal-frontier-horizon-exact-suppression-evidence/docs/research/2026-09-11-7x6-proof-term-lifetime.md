# Standard-7x6 proof descriptor term lifetime and slot-owned extension chunks

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT  
**Scope:** forward frontier-native exact Negamax resource lifetime; no domain, CPC, WSL-625, NDC, or proof-identity semantic change

This record follows the earlier `docs/research/2026-09-11-7x6-replacement-term-lifetime.md` append-only-incarnation finding and the later slot-span / worker-descriptor lifetime corrections. It records the next distinct failure boundary after those changes rather than replacing their evidence.

## v4 result

Standard-7x6 run `34674060855` at commit `1b9bb83f72a318c188750b421f352504048fe314` established the next concrete large-scale limiter after worker-local semantic state descriptors were made ephemeral.

The run did **not** reproduce the earlier approximately 225-second host-memory kill. It executed the solver for `855441.400302 ms` before failing exactly on the old semantic-TT descriptor term arena:

```text
semantic TT term arena exhausted: 460000025 > 460000000
```

The root remained unresolved in the win-threshold search.

Final old-v4 shared-TT evidence:

```text
entries:                 8,388,608 / 8,388,608
replacements:          153,310,210
term-span reuses:      134,966,299
term-span grows:        18,343,911
term IDs used:         459,999,998 / 460,000,000
```

Final process RSS was `15,600,738,304` bytes. The three workers reached approximately 40.1-45.5 million local quotient states, 9.59-11.11 million residual classes, 2.12-2.14 GB local typed storage, and 3.56-4.14 GB V8 heap high-water each.

The run completed 182 of 260 submitted worker tasks before the shared term-arena failure propagated; 78 queued/active tasks then failed during shutdown. Coordinator evidence at failure included 342,254,103 worker calls, 114,003,282 worker expansions, 121 incremental scout completions, 128 detached scout tasks, and 38 shared proof admissions.

## Interpretation

The earlier state-descriptor lifetime correction was real and material: the solver survived far beyond the previous host-memory failure horizon. The next hard failure was the descriptor-term lifetime policy in the old `v4` semantic proof table.

`v4` already assigned descriptor storage ownership to a physical proof slot and reused a slot span when a replacement descriptor fit. However, if a later descriptor exceeded that span, the implementation allocated a new whole contiguous span and abandoned the old span. With a full 8,388,608-entry table under heavy replacement, those historical whole-span growth events accumulated until the 460,000,000-word arena was exhausted.

This is a lifetime/ownership defect, not evidence for a larger arena. Increasing `TT_TERM_CAPACITY` would only move the same cumulative-incarnation boundary.

## v5 ownership correction

The semantic proof table now uses slot-owned extension chunks.

Each physical proof slot owns a chain of exact descriptor-term chunks. A replacement that fits the slot's existing aggregate data capacity overwrites the existing owned storage. A descriptor that exceeds current capacity appends only the missing data capacity as a new owned chunk instead of allocating a replacement whole span.

Exact descriptor equality walks the slot-owned chunk chain. Generation-bearing proof handles, stale-handle fail-closed behavior, slot publication exclusion, exact support/residual identity, and proof semantics are unchanged.

This deliberately does **not** introduce a general concurrent free list or semantic-incarnation ownership. Physical proof slots remain the storage owner.

In `v5`, `TT_TERM_CAPACITY` bounds total `Uint16` arena words, including three header words per chunk. `termIdsUsed` reports owned descriptor-data capacity, while `termArenaWordsUsed` includes descriptor data plus chunk headers. Therefore large-run comparison must use both values rather than treating the old `v4` term-ID count as byte-for-byte identical to `v5` arena accounting.

## Bounded qualification

Semantic proof replacement run `34675102224` completed successfully with exact generation/stale-handle checks and an adversarial monotone slot-growth control.

For eight physical slots whose descriptors grew from two terms through twenty terms:

```text
physical entries:             8
replacements:               144
slot growth events:         144
chunk count:                152
final descriptor data:      160 terms
term arena words:           616 / 640
chunk header words:         456
```

The important invariant is that final owned descriptor data was exactly `8 * 20 = 160` terms despite 144 replacements. Historical descriptor incarnations did not accumulate whole replacement spans.

The constrained 4x5 exact-game control remained:

```text
root W/D/L: 0
root actions: [0, 0, 0, 0]
```

Its action qualification exercised 43,387 replacements with 36,609 storage reuses and 6,778 slot growth events without changing the exact result.

Composed qualification also passed:

- dependency-aware proof run `34675126023` — success;
- idle ExploreHint run `34675132451` — success.

## Standard-7x6 v5 result

Exactly one standard-7x6 v5 measurement was admitted through qualification revision 1:

```text
workflow run:       34675467051
job:                103504435817
admission commit:   5049e3b25eaca8526e2559123b12ea3e6283b8da
workers:            3
split depth:        8 unresolved decisions
explore:            disabled
entry capacity:     8,388,608
term arena words:   460,000,000
```

The solver ran for roughly 780.56 seconds before the hosted runner delivered a shutdown signal. The solver step was cancelled by runner shutdown; it did **not** throw semantic-TT term-arena exhaustion.

Last shared-TT evidence before shutdown:

```text
entries:                 8,388,608
replacements:          168,397,037
slot reuses:           149,546,655
slot grows:             18,850,382
chunk count:            27,238,990
descriptor data:       210,231,525 words
chunk headers:          81,716,970 words
total term arena:      291,948,495 / 460,000,000 words
```

Thus the old v4 hard term-lifetime boundary was removed. After more replacements than the v4 failure run (`168.4M` vs `153.3M`), v5 had used only about 63.5% of its bounded arena and retained substantial headroom.

The next failure signal moved back to host memory rather than the shared proof arena. Process RSS reached `15,751,729,152` bytes before runner shutdown. Per-worker high-water at the last complete snapshots was approximately:

```text
worker 0: 42.02M local states, 10.19M residual classes, 103.37M cached term IDs, 3.84 GB V8 heap
worker 1: 46.70M local states, 11.27M residual classes, 116.17M cached term IDs, 4.22 GB V8 heap
worker 2: 46.10M local states, 10.94M residual classes, 111.37M cached term IDs, 4.09 GB V8 heap
```

Each worker still retained the then-current residual semantic descriptor cache, which materialized one exact `Uint16Array` plus a JS descriptor object per observed residual class. With roughly 10-11 million classes per worker, that is now the measured next resource-lifetime owner.

## Next evidence boundary

The v5 shared proof term-lifetime correction is accepted for the current research lane. Do not increase the shared term arena in response to run `34675467051`.

The next correction must target worker-local residual semantic descriptor ownership while preserving exact semantic identity and leaving the canonical slot64 residual kernel, CPC/WSL/NDC semantics, shared proof generation safety, task wire protocol and search/control logic unchanged.

See `docs/research/2026-09-11-worker-residual-descriptor-ownership.md` for the admitted ownership seam and qualification requirements.
