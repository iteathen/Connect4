# Clause-coverage real workload census

**Status:** exact reference workload characterization for the qualified product-capacity clause profile.

**Research direction:** Josh Oshiro.

## Purpose

Characterize actual universal/intersection jobs produced by the beneficiary-relative clause BSFP recurrence before designing the native CUDA A/B.

This is deliberately not a synthetic-mask benchmark. Each job is captured from a complete backward solve of a variable Connect-k geometry and carries the actual support, rank, beneficiary, exact legal stone count, left/right proof frontiers and support-local clause dictionary.

The recurrence uses the already-qualified bounded exact legal-slice guards:

```text
forced singleton count > k
forced singleton count = k with an unsatisfied clause
forced singleton count = k-1 with no one cell satisfying all residual clauses
```

No generic minimum-hitting-set search is used.

## Aggregate census

| Geometry | Supports | Intersection jobs | Raw pairs | Rejected pre-materialization | Materialized | Sum normalized survivors | Max raw job | Max local dictionary |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 5x4 c4 | 3,125 | 15,060 | 505,238 | 237,186 | 268,052 | 110,793 | 570 | 35 |
| 4x5 c4 | 1,296 | 5,479 | 112,037 | 47,028 | 65,009 | 33,040 | 180 | 35 |
| 4x4 c3 | 625 | 2,927 | 86,976 | 35,438 | 51,538 | 22,397 | 399 | 37 |

These totals include both ordinary universal aggregation and first-win terminal-blocker intersection jobs.

## Where the rejection occurs

### 5x4 c4

```text
aggregate jobs:          8,902
terminal jobs:           6,158
aggregate raw pairs:   461,239
terminal raw pairs:     43,999
aggregate rejects:     236,775
terminal rejects:          411
```

### 4x5 c4

```text
aggregate jobs:          2,845
terminal jobs:           2,634
aggregate raw pairs:    96,295
terminal raw pairs:     15,742
aggregate rejects:      46,878
terminal rejects:          150
```

### 4x4 c3

```text
aggregate jobs:          1,337
terminal jobs:           1,590
aggregate raw pairs:    74,534
terminal raw pairs:     12,442
aggregate rejects:      34,860
terminal rejects:          578
```

Therefore the bounded legal-slice filter is principally a **generic universal-frontier-product reduction**. It should not be designed as a terminal-specialization primitive.

## Hottest 5x4 c4 jobs

The largest jobs occur around rank 11/12.

| Rank | Support heights | Beneficiary | k | Left | Right | Raw | Rejected | Reject % | Materialized | Survivors | `|D(S)|` |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 11 | 3,1,1,3,3 | P0 | 6 | 30 | 19 | 570 | 448 | 78.60% | 122 | 32 | 22 |
| 11 | 3,3,1,1,3 | P0 | 6 | 26 | 20 | 520 | 364 | 70.00% | 156 | 32 | 22 |
| 11 | 3,1,1,3,3 | P0 | 6 | 21 | 24 | 504 | 361 | 71.63% | 143 | 30 | 22 |
| 11 | 3,0,1,3,4 | P0 | 6 | 23 | 21 | 483 | 358 | 74.12% | 125 | 36 | 22 |
| 11 | 3,3,1,1,3 | P0 | 6 | 19 | 24 | 456 | 296 | 64.91% | 160 | 24 | 22 |

The hottest selected job needs only 22 support-local clause IDs even though it represents a nontrivial exact proof frontier.

## Hottest 4x5 c4 job

```text
rank:          11
support:       3,4,4,0
beneficiary:   P0
k:             6
left/right:    15 x 12
raw pairs:     180
rejected:      127 (70.56%)
materialized:   53
survivors:      17
|D(S)|:         25
```

## Hottest 4x4 c3 job

```text
rank:          10
support:       3,0,4,3
beneficiary:   P1
k:             5
left/right:    19 x 21
raw pairs:     399
rejected:      268 (67.17%)
materialized:  131
survivors:      18
|D(S)|:         28
```

This denser-overlap Connect-3 geometry remains a useful adversarial control because clause calculus was less profitable in the CPU mechanism comparison.

## CUDA-facing implication

The real hot job shape is exactly the one targeted by the experimental device profile:

```text
left/right coverage records
    -> bitwise OR
    -> cheap bounded exact legal-slice filter
    -> subset-antichain normalization
```

For the selected complete controls, the hot support-local dictionaries are far below 64 IDs, but that is workload evidence only. Production width remains:

```text
ceil(|D(S)| / backendWordBits)
```

and is geometry/support selected.

The next CUDA fixture should use the actual top jobs above rather than random coverage masks.

## Ownership boundary

The product semantics, clause dictionary, legal beneficiary count and proof meaning remain Connect4-owned.

If qualification exposes a reusable consumer-neutral GPU primitive (for example generic segmented bitset product/filter/compaction mechanics), route that requirement to CUDA-Algorithms. Do not move clause/BSFP semantics downward merely to reuse a kernel.

## Disposition

Use the top real jobs as the stable first native/portable packed-coverage fixture set.

Compare against the equally qualified rank-slice packed ownership profile under identical device/runtime conditions before making any production representation decision.
