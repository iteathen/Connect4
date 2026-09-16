# Standard 7x6 bounded-depth scaling checkpoint — 2026-09-13

## Purpose

Measure the current frontier-native quotient Negamax implementation on standard 7x6 Connect Four as bounded physical depth increases, then separate deterministic search-work growth from runner-dependent timing. This is a prediction exercise, not a standard-root qualification or a full-root solve.

The current executable path includes the guarded parity/control response closure `guarded-adjacent-response-coverage-v1`. It is a sound compiled subset of the broader C4-0006/C4-0007 control/parity framework, not the full general CPC verifier.

## Reproducible campaign

Campaign:

- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-depth-scaling-campaign.mjs`
- `.github/workflows/frontier-standard7x6-depth-scaling.yml`

Research commits:

- `b0211519b9a06c9c89f34a84dc598877a9246078` — add standard 7x6 depth-scaling campaign
- `24b940e3ae613e18ff6aa917ed43cbc282d46c0f` — extend measurement through depth 10

GitHub Actions evidence:

- run `34743713642`, job `103687640810`: depths 5..9, three fresh-process repeats per depth
- run `34743813758`, job `103687909364`: depths 8..10, three fresh-process repeats per depth

Node: 26.7.0. Runner: Ubuntu 24.04. Timed search excludes setup time. Prepared kernel storage is sealed and checked for growth during each timed search.

## Exact-work measurements

| Physical depth | Status | Calls | Expanded | Horizon leaves | Forced macro transitions | States | Classes |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | depth-limited | 18,503 | 2,687 | 15,624 | 0 | 5,618 | 10,184 |
| 6 | depth-limited | 117,426 | 16,686 | 98,807 | 1,365 | 20,655 | 27,506 |
| 7 | depth-limited | 758,889 | 108,079 | 640,584 | 6,474 | 70,216 | 125,521 |
| 8 | depth-limited | 4,777,115 | 672,690 | 4,014,763 | 77,745 | 221,398 | 305,714 |
| 9 | depth-limited | 30,748,514 | 4,345,719 | 25,942,800 | 371,419 | 672,582 | 1,171,153 |
| 10 | depth-limited | 191,526,252 | 26,887,119 | 160,295,322 | 3,494,689 | 1,893,494 | 2,633,212 |

The exact work signature was deterministic across fresh-process repeats at each depth.

Per-ply call growth from depth 5 onward was approximately 6.35x, 6.46x, 6.29x, 6.44x, and 6.23x. A log-linear fit through depths 5..10 gives an effective call-growth factor of approximately **6.363x per physical ply** over this measured range.

No exact root result was observed through depth 10.

## Out-of-sample validation

The depth-5..9 log-linear call model predicted depth 10 at about **195.89 million calls**. Actual depth-10 work was **191.53 million calls**, approximately 2.2% lower than the prediction.

The corresponding expanded-node prediction was about **27.36 million**; actual was **26.89 million**, approximately 1.7% lower.

This one-step validation is much stronger evidence for the work curve than an in-sample goodness-of-fit number alone.

A quadratic log-growth model did not improve rolling prediction error on the 5..9 data. At this checkpoint, there is no evidence that a higher-order nonlinear model is preferable to a simple exponential model for exact work over the measured range.

## Timing evidence and runner drift

Wall time is materially less stable than exact work.

First run medians:

- depth 8: 2.724 s
- depth 9: 13.683 s

Second run medians on a different hosted runner instance:

- depth 8: 3.567 s
- depth 9: 19.349 s
- depth 10: 102.856 s

Depth-10 fresh-process samples were 105.780 s, 102.856 s, and 99.378 s; median CPU time was 103.288 s.

Therefore prediction should be two-stage:

1. physical/effective proof depth -> deterministic exact work;
2. exact work -> a throughput band derived from deep measurements on the target execution environment.

Do not fit solve time directly from shallow wall-clock samples.

## Current extrapolation boundary

Using the depth-10 exact-work point and the measured 5..10 work growth only as a local projection:

- depth 11: about 1.22 billion calls
- depth 12: about 7.75 billion calls
- depth 13: about 49.3 billion calls

These are **not solve-time claims** and must not be extrapolated to physical ply 42. The intended target is the earliest exact proof horizon available under quotient equivalence plus terminal parity/control closure.

The correct next inference problem is to determine that proof horizon independently, then evaluate the work curve only up to that horizon.

## Resource boundary

Depth 10 used:

- 1,893,494 states
- 2,633,212 residual classes
- kernel typed bytes: 944,316,167
- residual typed bytes: 848,746,856
- median RSS: about 734 MB

The bounded plan reserved 2,097,152 states and 4,194,304 classes. The generic board-depth upper bound was not fully covered at depth 10, but the actual run completed without storage growth or exhaustion.

The state reservation was already about 90.3% occupied. A blind depth-11 run under the same 2 GiB plan is therefore not justified without a separate resource-feasibility assessment or a structural reduction.

## Parity/control interpretation

The current executable search calls `frontierBoundCode` before tactical expansion at every node. The installed response closure can establish:

- side-to-move cannot win -> W/D upper bound;
- opponent cannot win -> D/W lower bound;
- both cannot win -> exact draw.

However, the current implementation is the guarded adjacent-response closure, not the full general control-parity certificate machinery described by C4-0006/C4-0007.

`frontierBoundCuts == 0` through depth 10 means no structural bound produced an immediate return counted by that metric. It does **not** prove the closure had no narrowing effect, because one-sided narrowing can continue search without incrementing that counter.

The measured near-exponential work curve through depth 10 therefore characterizes the current executable solver; it does not refute the hypothesis that stronger terminal parity/control reasoning could produce a much earlier exact proof horizon.

## Current conclusion

The important checkpoint is:

- exact work is predictable over depths 5..10;
- a simple exponential work model currently beats a more flexible quadratic-log model on predictive error;
- depth 10 validates the depth-5..9 prediction within about 2%;
- wall time is runner-sensitive and should be a secondary calibration;
- the root remains unresolved through depth 10;
- depth 11 is a resource-risk boundary under the present 2 GiB reservation;
- the next high-value task is to establish the earliest exact proof horizon from perfect-play evidence plus the solver's terminal parity/control semantics, rather than extrapolating toward 42 physical plies.

No standard-empty-board full-root solve was attempted and no root-readiness revision was changed.
