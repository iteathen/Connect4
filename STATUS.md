# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** MQ1-MQ4 passed; SIU-1 relational exactness passed; search-method and negamax-optimization campaigns complete

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game and determine which forward/backward exact reasoning forms exploit it best. This branch owns solver-neutral research into relational state identity, future-behavior equivalence, canonical transitions, cross-solver proof contracts, and comparative solver evidence.

It does **not** own production solver implementation. Current product lanes remain:

- preserved historical `solver/minimax-alpha-beta`;
- `solver/cuda-bsfp`;
- `solver/hybrid-confluence`;
- a future forward solver generation will be based on relational negamax after packed-kernel qualification.

## Qualified relational state

The exact shared state is:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

Across **1,681,808** complete-control physical states, SIU-1 produced zero projection, transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

The common algebra is:

```text
forward:  T(q,a) -> q' | terminal
backward: Pre_a(Q) -> exact predecessor set/frontier
hybrid:   exact values / sound proof facts keyed by q
```

Common semantics do not require common physical representation. The existing BSFP ownership-antichain form remains substantially more compressed than explicit `q` enumeration on the 4x5 control.

## Search-method campaign v1

The first solver-method campaign compared relational alpha-beta/negamax, PVS/NegaScout, MTD(f), PN-DAG, and Proof-Set Search over the same precompiled relational DAG.

On the largest 4x5 draw control with relational tactical closure:

```text
alpha-beta: 16,489 expansions
PVS:        15,110
MTD(f):     15,103
PN-DAG:     61,275
PSS:        scale-deferred
```

The result selected **side-to-move negamax as the forward value formulation**, not a final driver. Alpha-beta remains the control/kernel; PVS and MTD(f) remain driver finalists. PN-DAG and PSS remain research-only candidates.

An ideal exact BSFP wall around rank 10 reduced the same 4x5 forward work to roughly 1.3k expansions for the alpha-beta family, establishing a strong confluence leverage ceiling but not an end-to-end hybrid speed claim.

Authority:

- `research/semantic-quotient/state-identity-unification/SEARCH_METHOD_CAMPAIGN_V1_RESULT.md`
- Actions run `34636074995`, job `103384159647`

## Negamax optimization campaign

Two campaign passes screened optimizations newly enabled or materially simplified by the side-to-move negamax formulation.

### Structural defaults

These now advance as baseline semantics for the rebuild:

```text
side-to-move-relative value
single-perspective exact TT records
fail-soft exact bounds
native relational tactical closure
```

Fail-soft beat fail-hard in expansion count on every complete control. On 4x5:

```text
fail-soft: 16,488
fail-hard: 17,440
```

### W/D/L-native negamax

The product target is exact root W/D/L, and CUDA-BSFP already speaks exact W/D/L. Carrying distance-sensitive score distinctions through every node is therefore optional work unless a consumer requests strong distance.

Standalone 4x5:

```text
strong-score negamax: 16,488 expansions
W/D/L-native negamax: 15,096
```

The decisive 4x3 control showed a much larger benefit:

```text
strong-score: 212
W/D/L:         39
```

The forward solver should therefore expose:

```text
solveWdl(q) -> -1 | 0 | +1
refineStrong(q, provedWdl) -> exact distance-sensitive value  # optional
```

### Enhanced Transposition Cutoff (ETC)

ETC is the strongest new search-control optimization found. It probes exact child TT bounds and uses negamax sign symmetry to obtain a parent cutoff without recursively expanding the child.

| Geometry | strong baseline | strong + ETC |
| --- | ---: | ---: |
| 4x3 c3 | 212 | 189 |
| 4x4 c4 | 4,478 | 3,074 |
| 5x3 c4 | 996 | 820 |
| 4x5 c4 | 16,488 | **11,761** |

On 4x5 ETC produced 3,446 direct child-bound cutoffs. A gated form using ETC only with at least three moves remaining expanded slightly more states (11,811) but had lower measured search-only cost in the research implementation; the exact probe policy remains a packed-kernel tuning question.

### W/D/L + ETC

The leading product-facing composition is currently:

```text
W/D/L-native fail-soft negamax
+ exact relational TT
+ relational tactical closure
+ ETC
```

4x5:

```text
strong baseline: 16,488
strong + ETC:    11,761
W/D/L baseline:  15,096
W/D/L + ETC:     10,562
```

That is about a **35.9% expansion reduction** from the strong-score baseline before changing the physical relational-state implementation.

### Candidates rejected as defaults

Generic chess-derived ordering did not transfer well:

```text
4x5 history/killer ordering: 29,674 expansions
baseline:                     16,488
```

So generic history/killer ordering is rejected in its current form. Child-bound ordering without an actual cutoff also failed to beat ETC and is not a default. Blindly enabling all candidate optimizations was worse than selecting the individually compatible winners.

Exact rank/distance envelope remains useful only as a conditional strong-distance optimization; it helped the decisive 4x3 case substantially but was neutral/slightly harmful on draw controls.

### W/D/L threshold driver

Two-threshold W/D/L search remains a driver candidate, not a proof-work winner. On 4x5 it expanded 15,203 states versus 15,096 for full-window W/D/L; with ETC, 10,612 versus 10,562. Micro-timing sometimes favored the threshold form, so it stays in the driver tournament until the real packed kernel exists.

### BSFP composition

With the same ideal ~50% BSFP boundary, 4x5 W/D/L threshold + ETC dropped to **1,229 expansions**, versus 1,315 for strong-score + ETC. The ideal wall excludes BSFP construction/publication/query cost and remains a leverage ceiling only.

Authority:

- `research/semantic-quotient/state-identity-unification/NEGAMAX_OPTIMIZATION_CANDIDATES.md`
- `research/semantic-quotient/state-identity-unification/NEGAMAX_OPTIMIZATION_CAMPAIGN_RESULT.md`
- `research/semantic-quotient/state-identity-unification/evidence/2026-09-11-negamax-optimization-campaign.json`
- broad Actions run `34637521061`, job `103388937756`
- refinement Actions run `34637786848`, job `103389801743`

## Current next seam

The next evidence unit is no longer another precompiled-DAG search experiment. Build the actual **packed/on-the-fly relational negamax kernel** in research first:

```text
packed or dense relational q
+ incremental/on-the-fly T(q,a)
+ W/D/L-native fail-soft negamax
+ native relational tactical closure
+ tuned ETC
+ compact exact single-perspective TT
```

Then compare thin drivers over that exact same kernel:

```text
full-window alpha-beta control
PVS / NegaScout
MTD(f)
W/D/L threshold driver
```

Use equal-byte TT/memory controls. After serial kernel economics stabilize, add reflection/residual automorphism, compiled local proof masks, Connect4-specific proof-cost ordering, and only then parallelism.

Actual BSFP-produced boundaries must replace ideal walls before claiming hybrid performance.

## Hard non-claims

- no standard 7x6 production performance claim;
- no packed/on-the-fly transition performance claim yet;
- no end-to-end hybrid speedup claim;
- no final PVS vs MTD(f) vs threshold driver selection;
- no safety claim for null-move, futility, razoring, heuristic LMR, or other selective pruning not independently proven exact.
