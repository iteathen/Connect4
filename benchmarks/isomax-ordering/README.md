# Native IsoMax ordering comparison

Run with Node 26.7.0 from a clean source checkout:

```text
node --test components/domain/test/domain.test.mjs components/isometric/test/*.test.mjs components/bsfp/test/rba-wdl-reference.test.mjs
node benchmarks/isomax-ordering/run.mjs
```

This implementation qualification compares, in historical order:

1. The retained benchmark-only fixed center-first control.
2. Production native WSL ordering from the accepted September 15 playable-singleton
   effect order: promote one move creating two, then one, distinct own playable
   completions; veto promotion if support exposes an opponent singleton.

The research source is
`docs/research/2026-09-15-native-singleton-effect-ordering.md`, also preserved
by canonical research revision `104abfbe4444fcd315ac807b46ce2be8da13df39`.
The separately rejected opponent-suppression and own-cofactor proximity tiers
are not part of this candidate.

Singleton ordering is now the production default. The fixed-control loader reads
the current solver and removes only the unresolved recursive ordering prefix,
failing if its source seam changes. Native state, transitions, exact closures, caches and
root tie selection remain the same. Pair incidence is compiled once from the
WSL vocabulary; move classification does not materialize children or mutate the
residual pool. Suppressed degree-two supersets cannot remove a new completion:
their surviving singleton subset is either already exposed by support or the
landing singleton would have triggered immediate-win closure first.

Only below-root unresolved nodes receive advisory promotion. No value, pruning,
certificate or identity consequence follows from an ordering class. Optional
RBA remains disabled in both variants.

The workload has independently seeded sets of 16 quiet legal roots at 18 and
20 pieces played, plus 32 roots each at 24 and 28 pieces played. Physical domain predicates select
roots without either player's immediate win; no solver results select fixtures.
These are synthetic controls, not Begin-Hard or an empty-board solve.

Each process has the same eight untimed warmup roots and fresh pool/cache per
measured root. Times measure exact WDL plus root move selection; setup and forced
GC between roots are excluded and setup is separately reported. Six processes
run sequentially A-B-B-A-A-B, with 120-second process deadlines, no retries.
The report requires identical WDL/root moves and repeatable node counts, then
reports three-sample median total solve time per workload and all raw timings.

Tests compare effect classes to realized physical child threats, and both
orders to a physical-board exact oracle on late roots. Benchmark agreement on
earlier roots is differential evidence, not an independent solved oracle.
Logs flush per completed root; interrupted roots have no invented result.
Evidence is retained under the Git-private `solver-performance/<run-id>/`
directory. The runner also asserts that both variants reproduce the recorded
pre-promotion decisions, node counts and ordering-promotion counts exactly.

## Pre-promotion qualification result — 2026-09-19

Tested source: `afb61e98d69d809bb51da3b57446ab9fdd09f787`.
Host: Intel Core i5-12600K, Windows, Node 26.7.0. CPU execution; no GPU.
Run: `20260919T154057273Z-isomax-ordering`.
Structured evidence: `../results/2026-09-19-isomax-ordering.json`.

Historical order is fixed control first, accepted research effect second.
Times are three-process medians of total solve time for each set:

| Pieces played / remaining | Roots | Fixed time | Singleton time | Time change | Fixed nodes | Singleton nodes |
|---|---:|---:|---:|---:|---:|---:|
| 18 / 24 | 16 | 5,908.44 ms | 4,759.53 ms | -19.45% | 5,893,201 | 4,263,076 |
| 20 / 22 | 16 | 743.56 ms | 761.62 ms | +2.43% | 653,136 | 558,223 |
| 24 / 18 | 32 | 155.36 ms | 130.29 ms | -16.14% | 110,412 | 75,335 |
| 28 / 14 | 32 | 15.66 ms | 13.88 ms | -11.35% | 9,934 | 8,158 |

Median total across all 96 roots: 6,839.35 ms fixed versus 5,639.22 ms singleton
(17.55% less time). This is the median of each process's total, not a sum of
per-workload medians. Nodes: 6,666,683 versus 4,904,792 (26.43% fewer).
Every process produced identical WDL and root moves; node counts repeated exactly.

Actual chronological execution, all on 2026-09-19 UTC:

| Run | Start | End | Variant | Total solve ms |
|---|---|---|---|---:|
| 1 | 15:40:57.370 | 15:41:04.788 | fixed | 6,656.07 |
| 2 | 15:41:04.790 | 15:41:11.164 | singleton | 5,639.22 |
| 3 | 15:41:11.167 | 15:41:17.591 | singleton | 5,711.62 |
| 4 | 15:41:17.594 | 15:41:25.230 | fixed | 6,890.93 |
| 5 | 15:41:25.232 | 15:41:32.824 | fixed | 6,839.35 |
| 6 | 15:41:32.827 | 15:41:39.179 | singleton | 5,617.34 |

All processes exited normally and stayed within their 120-second deadlines.
31 tests passed, including 1,390 independent physical child-effect comparisons
(104 opponent-exposure vetoes; 319 high-cell cases) and independent physical
exact WDL/root-move checks on 32 late roots. No production solver file changed.

The 20-piece set has a small median timing regression despite 14.53% fewer
nodes; sample ranges overlap (fixed 742.67–759.64 ms, singleton
726.22–781.99 ms). Do not claim a uniform improvement or a settled regression
from those three timing samples. Classification cost and execution overhead
can offset less recursive work. No heuristic threshold was tuned on these sets.

The initial smaller run `20260919T154018851Z-isomax-ordering` at
`365bd185731d5c94f41884e4cf9a6ceda2981acc` is retained separately in
`../results/2026-09-19-isomax-ordering-initial.json`. Its subsecond totals
motivated adding earlier roots; do not combine its timing samples with the
expanded workload's different warmup/execution history.

These results support this method on the measured synthetic controls. They
do not establish an empty-board solve speedup, Begin-Hard performance, or
universal benefit. The owner subsequently authorized production promotion.

## Production promotion

The native classifier now lives in `components/isometric/move-order.mjs` and
is called directly by the ordinary solver below the root. The experimental
candidate copy/loader was removed. Root scope is reset for every `solve` and
`solveValue` call; promotion counts are in returned solver metrics.

C4-0011 documents the ordering classes, opponent-exposure veto, quiet-node and
root guards, exact-authority precedence and unchanged proof/value boundaries.
Its overall Candidate specification status is unchanged.

Local domain/native/RBA qualification: 47 tests passed, including the original
1,390 child-effect comparisons and independent physical WDL controls, plus
imported-root ordering/reset/exception-restoration coverage. These tests now
run in the native IsoMax CI workflow.

Post-promotion repeated comparison at `b4b8f1f9`, run
`20260919T154659258Z-isomax-ordering`, passed with
`matchesQualifiedExperiment: true`. Across all six processes, both variants
exactly reproduced the earlier experiment's decisions, nodes and promotion
counts. Production made 738,581 advisory promotions per complete workload.

Median total solve time: fixed control 6,840.28 ms, production singleton
5,906.60 ms (13.65% less time). Nodes remain 6,666,683 versus 4,904,792
(26.43% fewer). Per-set timing changes were -15.67%, +2.05%, -18.79%, -3.75%
for 18, 20, 24, 28 pieces played respectively. The 20-piece ranges again
overlapped; the benefit is workload-dependent. All processes exited normally.
Complete source/runtime identities, decisions and timing samples:
`../results/2026-09-19-isomax-ordering-promoted.json`.
