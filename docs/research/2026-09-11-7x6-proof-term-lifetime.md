# Standard-7x6 proof descriptor term lifetime and slot-owned extension chunks

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT  
**Scope:** forward frontier-native exact Negamax resource lifetime; no domain, CPC, WSL-625, NDC, or proof-identity semantic change

This record follows the earlier `docs/research/2026-09-11-7x6-replacement-term-lifetime.md` append-only-incarnation finding and the later slot-span / worker-descriptor lifetime corrections. It records the next distinct failure boundary after those changes rather than replacing their evidence.

## Result

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

## Next evidence boundary

Admit exactly one standard-7x6 root measurement with the current `v5` store after the bounded qualification above.

Keep the prior isolation configuration so the storage-lifetime comparison is interpretable:

```text
search workers:                  3
unresolved decision split depth: 8
autonomous Branch Manager explore: disabled
shared proof entries:            8,388,608
shared term arena words:       460,000,000
```

Measure at minimum:

- root/action W/D/L if resolved;
- shared entries and replacements;
- slot reuses/grows, chunk count, descriptor-data capacity, header words and total arena words;
- calls/expansions/proof admissions;
- authoritative queue and detached sibling work;
- process RSS;
- per-worker local quotient states, residual classes and typed bytes;
- per-worker V8 heap/external/ArrayBuffer high-water;
- residual-class descriptor builds and cached term-ID count.

If the root remains unresolved, change the next resource lifecycle only from the measured owner. In particular, residual-class descriptor payload remains a plausible worker-memory duplication boundary, but exact class identity must not be weakened or reclaimed preemptively without evidence from the `v5` standard-7x6 run.
