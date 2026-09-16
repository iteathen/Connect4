# Quotient-native versus exact physical W/D/L control

**Status:** complete bounded-control comparison; quotient not yet promoted as faster forward kernel  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`

## Question

Does the qualified quotient-native forward solver already repay the runtime cost of residual transition construction, residual-class interning and quotient-state interning when compared against a purpose-built exact physical W/D/L solver under the same search contract and a normalized typed-memory budget?

## Fair control

The physical control was intentionally stronger and narrower than the legacy incumbent. It uses:

```text
state = supportIndex + exact P0 ownership bitmask
P1 ownership = support universe - P0 ownership
```

and:

- W/D/L-native fail-soft full-window Negamax;
- the same immediate-win / forced-response / double-threat closure;
- TT-best then center-first ordering;
- exact physical key equality, not probabilistic Zobrist proof authority;
- a bounded 4-way set-associative TT;
- safe replacement: eviction only loses cached information and causes recomputation;
- no evaluator, iterative deepening, mate-distance scoring, or legacy perspective duplication.

The physical TT typed arrays were required to fit under the quotient solver's **root-only typed-array footprint**. Root-action qualification was performed separately and was not allowed to enlarge the physical memory budget.

Authority:

- `src/physical-wdl-control.mjs`
- `src/quotient-vs-physical-wdl-campaign-v3.mjs`
- Actions run `34647777241`, job `103422562204`

The earlier v1/v2 attempts are non-authoritative harness history:

- v1 failed because the physical exact TT was treated as unbounded and filled;
- v2 added safe bounded replacement, but incorrectly derived the memory budget after root-action qualification and therefore over-allocated physical memory;
- v3 fixed both issues and is the governing comparison.

## Exactness

Before timing, both solvers independently matched the BSFP oracle for:

- root W/D/L;
- every legal root-action W/D/L.

No semantic mismatch was observed.

## Results

### 4x5 c4 — governing bounded control

```text
root-only typed-memory budget: 1,844,704 B

quotient:
  median total: 16.697 ms
  expansions:   15,054
  calls:        24,882
  typed bytes:  1,844,704

physical:
  median total: 15.804 ms
  expansions:   36,826
  calls:        51,924
  typed bytes:  1,745,668
  TT slots:     131,072
  TT load:      33.3%
  replacements: 519
```

Ratios:

```text
quotient / physical wall-clock: 1.0565x
quotient / physical expansions: 0.4088x
```

The quotient therefore performs about **59.1% fewer expansions** but is about **5.7% slower wall-clock** in the current JavaScript implementation.

That is a strong structural result but not yet a speed win. The quotient is buying substantial proof-work compression; current transition/interner overhead consumes the advantage.

### 5x3 c4

```text
quotient: 0.838 ms, 852 expansions
physical: 2.041 ms, 4,315 expansions
```

The quotient is about **2.43x faster** and uses about **19.7%** as many expansions.

### 4x4 c4

```text
quotient: 7.436 ms, 4,250 expansions
physical: 4.368 ms, 9,403 expansions
```

The quotient performs about **54.8% fewer expansions** but is about **70.2% slower**. At this scale the richer quotient transition machinery is not amortized.

## Interpretation

The comparison separates two questions that had previously been conflated:

1. **Does the quotient reduce exact proof work?**  
   Yes, strongly on every complete control tested.

2. **Does the current quotient implementation turn that reduction into lower wall-clock time?**  
   Not consistently yet. On the largest complete control it is close but still behind.

The 4x5 result is especially useful because the physical TT was not memory-starved in a way that explains the outcome: load was about 33% with only 519 replacements across 51,924 calls. The physical control therefore had substantial exact caching and still expanded more than twice as many nodes.

The remaining deficit is principally **cost per quotient expansion**, not proof-work count.

## Disposition

Do **not** promote a quotient forward-solver speedup claim yet.

Advance these facts:

```text
quotient semantic exactness: qualified
quotient proof-work compression: qualified
quotient-native WDL full-window driver: current native baseline
quotient-vs-physical 4x5 wall-clock: near break-even but currently slower
```

The next optimization campaign should target the hot quotient transition path directly:

```text
T(q,a)
  = residual-class update
  + residual-class canonicalization/intern
  + quotient-state intern
```

Specifically measure and reduce:

- residual normalization work on cache misses;
- residual-class interner probes/equality work;
- quotient-state interner probes/equality work;
- duplicate transition recomputation;
- dynamic JavaScript-array metadata behind residual classes;
- allocation/copying during residual reduction.

Search-control candidates (PVS, MTD(f), threshold, general ETC, state-edge caches) should remain closed unless the transition-cost model materially changes.

## Promotion gate

The quotient forward kernel should not move to the production solver branch until one of these is demonstrated:

1. a notable wall-clock win against the exact physical W/D/L control under comparable memory; or
2. independently justified 7x6-scale evidence showing the proof-work compression grows enough to dominate the remaining per-transition overhead.

## Non-claims

- no standard 7x6 performance claim;
- no full-JS-heap equal-memory claim: quotient typed-array accounting remains a lower bound because some residual metadata still lives in JavaScript arrays;
- no production speedup claim from reduced expansion count alone;
- no hybrid speedup claim until actual BSFP construction/publication/query cost is included.
