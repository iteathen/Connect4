# Negamax optimization campaign — result

**Status:** Complete on bounded relational controls

**Date:** 2026-09-11

**Runs:** broad screen `34637521061` / job `103388937756`; refinement `34637786848` / job `103389801743`

## Decision context

Negamax is now the selected forward exact value formulation. This campaign did not select the final search driver; alpha-beta, PVS/NegaScout and MTD(f) remain driver choices over the same future kernel.

All candidates operated over the BSFP-aligned relational state:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

No positional board identity participated in search. The campaign used a precompiled exact relational DAG to isolate proof/search-control effects from relational-transition construction cost.

## New negamax-specific candidates screened

The campaign screened optimizations that become simpler or newly valuable under a single side-to-move value orientation:

- single-perspective TT/value semantics;
- fail-soft versus fail-hard bound return;
- W/D/L-native negamax;
- exact rank/remaining-distance score envelope;
- Enhanced Transposition Cutoff (ETC) via child-bound probing;
- child-bound ordering;
- side-normalized history/killer ordering;
- W/D/L-first then optional strong-distance refinement;
- W/D/L threshold/null-window classification;
- exact BSFP W/D/L injection at a fixed relational boundary.

Selective heuristic pruning such as null-move, futility, razoring and unsound late-move reductions was excluded because this is an exact solver campaign.

## 1. Fail-soft is the default

The broad screen compared fail-soft against fail-hard on the same strong-score negamax kernel. Fail-soft expanded fewer states on every complete control.

On the 4x5 draw control:

```text
fail-soft: 16,488 expansions
fail-hard: 17,440 expansions
```

There is no evidence here for preserving fail-hard as the primary bound-return policy. Exact TT bound flags remain mandatory.

## 2. Enhanced Transposition Cutoff is the strongest new strong-score optimization

ETC probes child TT bounds before recursive expansion and uses the negamax sign relation to detect a parent cutoff.

Refinement results:

| Geometry | strong baseline | strong + ETC | reduction |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 212 | 189 | 10.8% |
| 4x4 c4 | 4,478 | 3,074 | 31.4% |
| 5x3 c4 | 996 | 820 | 17.7% |
| 4x5 c4 | 16,488 | 11,761 | 28.7% |

On 4x5, ETC obtained 3,446 direct child-bound cutoffs and reduced proof expansion by 4,727 states.

The extra child probes are not free. Gating ETC away from the shallowest remaining region (`remaining >= 3`) slightly increased proof work on 4x5 from 11,761 to 11,811 expansions but reduced measured search-only time from about 8.11 ms to 6.13 ms in this research implementation.

Therefore the semantic mechanism advances, while the physical probe policy remains a tuning dimension for the packed kernel.

## 3. W/D/L-native negamax is the strongest product-contract change

The product requirement is exact root W/D/L, and CUDA-BSFP v1 also publishes exact W/D/L. Negamax makes the value domain naturally:

```text
{-1, 0, +1}
```

without carrying distance-sensitive score distinctions through every state.

Standalone full-window W/D/L versus strong-score baseline:

| Geometry | strong baseline | W/D/L native |
| --- | ---: | ---: |
| 4x3 c3, win | 212 | **39** |
| 4x4 c4, draw | 4,478 | **4,291** |
| 5x3 c4, draw | 996 | **971** |
| 4x5 c4, draw | 16,488 | **15,096** |

The decisive root benefits dramatically because distance refinement is unnecessary. Draw roots show a smaller but consistent work benefit.

With ETC enabled:

| Geometry | strong + ETC | W/D/L + ETC |
| --- | ---: | ---: |
| 4x3 c3 | 189 | **37** |
| 4x4 c4 | 3,074 | **2,912** |
| 5x3 c4 | 820 | **800** |
| 4x5 c4 | 11,761 | **10,562** |

On the largest control, W/D/L-native + ETC reduces expansions 35.9% relative to the strong-score baseline and about 10.2% relative to strong-score + ETC.

This is now the leading default product-value contract candidate. Strong distance should be a refinement mode when a consumer actually asks for it, not automatically part of every root proof.

## 4. W/D/L threshold search is a driver candidate, not a proof-work winner

A two-threshold W/D/L classifier was tested:

1. ask whether `V >= Win`;
2. if not, ask whether `V >= Draw`.

It did not reduce expansion work versus ordinary full-window W/D/L negamax on the draw controls.

4x5:

```text
W/D/L full window:          15,096
W/D/L two-threshold:        15,203
W/D/L full window + ETC:    10,562
W/D/L threshold + ETC:      10,612
```

Measured search-only elapsed time sometimes favored the threshold version (4x5 ETC/interior: about 4.40 ms versus 4.89 ms full-window), but this is micro-timing on a precompiled DAG and is not enough to override the proof-work result.

Retain threshold W/D/L as a driver candidate alongside PVS/MTD(f); do not treat it as a proven default.

## 5. Generic history/killer ordering is rejected in its current form

The broad campaign showed that conventional side-normalized history/killer ordering is badly mismatched to this low-branching relational graph.

4x5:

```text
strong baseline:          16,488 expansions
history/killer ordering:  29,674 expansions
```

This does not mean all learned/refutation ordering is useless. It means generic chess-like history/killer machinery should not be part of the default kernel. Future ordering candidates should exploit Connect4-specific relational proof cost rather than importing generic search folklore.

## 6. Child-bound ordering does not advance as a default

Using child TT bounds for reordering without an immediate ETC cutoff was mixed and generally weaker than using those same probes only for exact cutoffs. On 4x5 it produced 15,403 expansions versus 11,761 for ETC.

The useful information is the certified cutoff itself; speculative reordering from partial child bounds has not earned its cost.

## 7. Exact distance envelope is conditional

The exact remaining-rank score envelope combined strongly with ETC on the decisive 4x3 root:

```text
strong baseline:         212
strong + ETC:            189
strong envelope + ETC:   136
```

On draw controls it was neutral to slightly worse in proof work:

```text
4x4: ETC 3,074 vs envelope+ETC 3,142
5x3: ETC 820   vs envelope+ETC 820
4x5: ETC 11,761 vs envelope+ETC 11,899
```

Retain it for strong-distance/decisive-score mode, not as a universal W/D/L default.

## 8. W/D/L first, distance second is now the correct semantic layering

The broad screen tested W/D/L-first then strong refinement. On draw roots the strong refinement is unnecessary because exact draw strong score is already zero. On decisive roots a second phase may still be required to recover exact distance.

The resulting architecture should therefore expose two explicit contracts:

```text
solveWdl(q) -> -1 | 0 | +1

refineStrong(q, provedWdl) -> exact distance-sensitive value
```

BSFP naturally satisfies the first contract. The second remains a forward-search responsibility unless a future BSFP profile is extended to strong distance.

## 9. Ideal BSFP confluence remains highly complementary

At the same approximate 50% rank wall used in the earlier search-method campaign, the refined kernels produced:

| Geometry | strong + ETC + ideal BSFP | W/D/L threshold + ETC + ideal BSFP |
| --- | ---: | ---: |
| 4x3 c3 | 80 | **20** |
| 4x4 c4 | 528 | **520** |
| 5x3 c4 | **325** | 326 |
| 4x5 c4 | 1,315 | **1,229** |

For 4x5, the W/D/L hybrid candidate went from 10,612 standalone expansions to 1,229 with the ideal rank-10 exact wall. Search-only median time was about 0.425 ms in that synthetic-boundary model.

This remains a forward-work-elimination ceiling. BSFP construction, publication and lookup cost are excluded and must be included before any hybrid speed claim.

## 10. Current kernel disposition

### Structural defaults

- BSFP-aligned relational `q` identity;
- side-to-move negamax recurrence;
- one value/bound orientation per `q`;
- fail-soft exact bound semantics;
- native relational immediate-win/double-threat/forced-response closure;
- exact TT identity and exact bound flags.

### Advance into the packed-kernel campaign

- **W/D/L-native negamax** as the default product result contract;
- **ETC** as the strongest newly qualified negamax optimization;
- **ETC gating policy** as a physical-cost tuning dimension;
- strong-distance mode as an optional refinement path;
- exact distance envelope only inside strong-distance mode;
- PVS, MTD(f), full-window W/D/L and threshold W/D/L as drivers to compare after the packed kernel exists;
- exact BSFP W/D/L injection keyed directly by `q`.

### Reject as current defaults

- fail-hard negamax;
- generic history/killer ordering;
- child-bound ordering without a cutoff;
- blind "enable every optimization" composition.

### Deferred

- counter-move/refutation tables unless a Connect4-specific relational formulation is developed;
- internal iterative deepening until an evaluator/ordering contract exists;
- unsafe selective pruning without independent exactness proof.

## Next evidence seam

The next campaign should move away from a precompiled whole-game DAG and build the actual candidate kernel:

```text
packed / dense relational q
+ on-the-fly T(q,a)
+ W/D/L-native fail-soft negamax
+ relational tactical closure
+ tuned ETC
+ compact exact single-perspective TT
```

Then run full driver comparisons over that one implementation:

```text
alpha-beta / full-window WDL
PVS / NegaScout
MTD(f)
WDL threshold driver
```

Only after serial packed-kernel economics stabilize should reflection/residual automorphism, compiled local proof masks, proof-cost ordering and coarse parallelism be layered in.

Actual BSFP-produced boundaries must replace ideal walls before hybrid performance is claimed.

## Non-claims

The campaign does not establish:

- standard 7x6 production performance;
- packed/on-the-fly relational transition cost;
- end-to-end hybrid speedup;
- final PVS versus MTD(f) versus threshold driver selection;
- safety of excluded heuristic/selective pruning methods.
