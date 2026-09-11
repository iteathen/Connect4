# OQS seed and quotient scaling probe

Continue from 42e1a1ca90905bb3edec8ad4a2e49c99ef635651. The owner authorizes
adaptive timeouts, preferring short tests and longer runs only to sharpen runtime
or growth evidence. The previous 16/40-hour extrapolations are conditional
cofactor scenarios, not full-solve predictions or confidence bounds.

The next falsifier is whether actual larger-board residuals resemble the sampled
5x5 frontiers. The existing OQS seed builder runs a complete C1 reference solve
before exposing any support. Reuse that exact recurrence with research-only
observation hooks and stop boundaries, preserving only completed support seeds.
Source instrumentation uses unique checked seams and a source SHA-256 identity;
the maintained seed solver is unchanged. Full 4x4 support-by-support equality
qualifies the observer, including explicit early-rank termination.

Sequential units owned here: (1) short 5x4 calibration and bounded 6x5/7x6 seed
progress/capacity probes; (2) exact incremental OQS on captured completed seeds,
with candidate guards before allocation and per-cut progress; (3) reassess the
runtime scenario using measured growth, and persist evidence. Generic GPU
grouping remains CUDA-Algorithms-owned and outside this CPU research probe.

Initial limits: 10 s 5x4 and 20 s 6x5/7x6 soft budgets, 5 s outer termination
margin, 1.5 GiB Node heap and 65,536 raw normalization/product records. A boundary
is partial evidence, not root W/D/L. The CPU child creates no descendants or GPU
resources. Each run has unique retained logs, completed-seed samples and a result
summary. Do not overwrite a timeout with a later success. Longer runs require a
changed bound or measurement question, not repetition without information gain.

## Observed growth and revised execution

CPU development evidence, exact recurrence source SHA-256
`55518a308a6bbaa9a4e9c0ebade1b93c42bd1c5c31e9e3652b241539a2aab03a`.
The [retained event record](evidence/2026-09-11-oqs-seed-scaling.json) contains
all eight logs and their raw SHA-256 identities. Timings include observation and
seed-checkpoint overhead; they are not native CUDA measurements.

| Seed probe | Raw-product guard | Elapsed | Completed supports | Largest Win / Loss | Next rejected product |
| --- | ---: | ---: | ---: | ---: | ---: |
| 5x4 calibration | 65,536 | 1.020 s | all 3,125 | 284 / 194 | none |
| 6x5 first | 65,536 | 0.490 s | 93 | 1,203 / 916 | 107,100 |
| 7x6 first | 65,536 | 3.392 s | 130 | 3,618 / 3,792 | 123,354 |
| 6x5 widened | 262,144 | 8.033 s | 235 | 1,653 / 2,910 | 473,958 |
| 7x6 widened | 262,144 | 5.563 s | 138 | 3,618 / 3,996 | 1,299,780 |
| 7x6 explosion probe | 2,097,152 | 30.689 s | 184 | 3,618 / 5,205 | 2,446,901 |

Every larger seed run stopped at a product-capacity boundary, before its time
limit. These are six seed logs plus two quotient logs (eight in total). The
5x4 calibration matches the established 108,266 boundary records and root draw.
The final 7x6 probe processed 13,359,503 pair candidates but remained within rank
38; it had completed only 184 of 823,543 supports. No support-rate extrapolation
to a complete solve is justified by this strongly rank-biased prefix.

Captured complete seeds, tested separately with direct-versus-sequential cofactor
checks and the existing incremental JS quotient:

- 6x5 support 36286: 11 cuts completed in 6.335 s, reaching 43,776 exact states.
  The next 87,552-candidate layer hit the 65,536 candidate guard before allocation.
- 7x6 support 470594: six cuts completed in 22.829 s, reaching 8,192 exact states
  and 1,732,992 total Win/Loss records in that active layer. The 20-second soft
  time budget was observed between cuts; the 25-second outer supervisor did not
  kill the child. The next cut would generate 16,384 candidates.

These selected partial quotients were not independently rebuilt at every layer;
they are exact-reference/direct-cofactor evidence, not native throughput or full
quotient completion. The observed records/state and active-record growth already
invalidate assuming that 7x6 automatically fits O1's 5x5 envelope or keeps its
per-candidate cost. The prior 16/40-hour numbers remain arithmetic scenarios only.

## First bounded native 7x6 seam

O2 freezes the completed rank-38 seed at support 470594, with heights
[5,6,6,6,6,6,3], 240 Win records and 3,792 Loss records. It is preserved under
the OQS experiment's fixtures with its source identity. O2 uses one input state,
16 candidates and a 4,096-record frontier capacity: 2,163,384 device bytes plus
the ordinary 256 MiB runtime allowance. This is a selected first-cut profile;
it does not widen O1 or claim all 7x6 layers fit.

The first cut checks every direct cofactor, both independent R3 layers, and all
GPU candidate/target sets. One warmup and three rotating-order repetitions per
mode separate repeated submit timing from setup. Native Q1 uses a 30-second
case timeout initially. Any timeout remains a failure/boundary artifact.

Current pre-native checks: all 93 integrated tests pass; O2 portable preparation,
submission and cleanup pass. Source review covers only the changed research
observers/stop seams, fixture, finite O2 layout/runner/profile and qualification
claims. The seed recurrence, CUDA kernel, plan lifecycle and dependency pins are
unchanged. Native publication and final state reconciliation follow.

## Official O2 native result

Q1 run `20260911T043015870Z-2d8e0785` qualified the selected first cut at clean
source `5c298c7e1dfdf1cfd93116884585144e33fb9dd7`.
[Evidence PR #28](https://github.com/iteathen/Connect4/pull/28) is open at
`05ea4fd0e91c3b11e1074cc68d36738675c4ae51`. All eleven payloads match the
manifest SHA-256 hashes and the remote Git blob identities.

The 30-second Q1 case passed: 16 candidates in each of eight native executions,
zero mismatches, full selected-cut target coverage, two independent R3 layers and
graceful cleanup. Three measured submit/wait samples per mode, after warmup:

| Mode | Samples ms | Median ms |
| --- | --- | ---: |
| Baseline | 18.8653, 21.0361, 17.4842 | 18.8653 |
| Preservation | 21.2722, 21.1138, 21.4477 | 21.2722 |

The shortcut did not improve this small heavy-frontier workload. Setup was
864.678 ms. Sixteen blocks do not establish large-batch occupancy or per-candidate
throughput; do not extrapolate this directly or apply the 5x5 throughput blindly.
The CUDA kernel, O1 semantics and dependencies remain unchanged.

Portable CUDA run 34562427487 and incremental OQS regression 34562427459 passed
at that source. Subsequent residual-reuse work below is an optional CPU reference
experiment; O2 native evidence remains scoped to its exact source above.

## Residual sharing: exact structural reduction

The seven-by-six cut census exposed repeated residual work hidden by total state
counts. After six cuts, 8,192 `(crossing assignment, residual)` states contain only
48 distinct exact residual pairs. Logical frontier records total 1,732,992, but
the distinct residual pairs contain only 10,597 records. Cut five requires 8,192
state/input outputs but only 128 distinct residual/input cofactor evaluations.

For a fixed cut and ownership ordinal, the cofactor function depends only on the
exact Win/Loss pair and introduced ownership bits, not on the previous crossing
assignment. Equal canonical pairs therefore produce equal successor pairs. The
crossing-mask update still runs independently for every state/input; no quotient
state or transition is omitted. A per-cut cache keyed by the complete canonical
pair and input ordinal is sound; hash equality alone is not the key. Cache entries
are immutable cofactor pairs and the cache is discarded between cuts.

An optional `reuseResidualCofactors` reference experiment implements that exact
reuse with the existing JS Map machinery. The default remains the established
baseline. Direct-versus-sequential validation executes once per distinct computed
cofactor; cache hits inherit that same exact result. This is Connect4 semantic
research, not a private generic GPU sorting/grouping implementation.

Qualification checks every next-layer state set on all 625 4x4 supports against
the baseline, whose layers are also independently rebuilt by R3: all 325,652
candidate outputs retain exact parity. The six common layers of the selected
7x6 A/B probe have identical canonical state-set SHA-256 digests.

[Raw reuse evidence](evidence/2026-09-11-oqs-residual-cofactor-reuse.json):

- Same six-cut prefix: baseline 22.51794 s, reuse 3.28369 s (6.86x observed CPU
  elapsed ratio), including direct validation, census and digest overhead.
- Actual cofactor evaluations fall from 11,056 to 624 on that prefix; all state
  and transition outputs remain present.
- Reuse reaches ten cuts in 8.22574 s: 65,536 states, 180 distinct residual pairs,
  6,103,040 logical frontier records but only 17,748 distinct residual records.
  Across those cuts: 1,476 evaluations and 222,572 cache hits.
- It then refuses the next 131,072-candidate layer at the 65,536 guard. Baseline
  stopped on the between-cut 20-second time budget; neither completed OQS.

The measured ratio is a single CPU research A/B result, not CUDA or complete-solve
speedup. This changes the next CUDA composition target: factor residual-pair
storage and transforms from the crossing-state table, then use exact pair IDs for
cheap state/input mapping. Generic grouping/compaction remains CUDA-Algorithms
work; Connect4 owns pair meaning and cofactor equivalence. A full seed remains
the separate prerequisite. No reliable complete-solve time follows yet.
All 94 integrated tests pass after the optional reuse change. This is bounded
author-side review and qualification, not an independent full solver audit.

Retain the OQS worktree, frozen O2 fixture, raw local probe logs and seed samples,
and both published Q1 evidence PRs for continuation. Every child exited; no GPU
resources or research temporary modules are intentionally left active. Old solver
and lower-repository source checkouts remain protected unchanged.
