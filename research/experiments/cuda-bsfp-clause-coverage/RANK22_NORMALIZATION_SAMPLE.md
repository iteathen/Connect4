# Leashed 6x5 rank-22 normalization sample

**Status:** bounded work-shape sample completed; no semantic mismatch in the compared normalization orders. This is a mechanism diagnosis, not native GPU timing.

**Research direction:** Josh Oshiro.

## Purpose

The complete combined 6x5 reference probe localized the next wall to rank 22/21, with rank 22 reaching about 5.78M universal pair occurrences while memory remained modest. Re-running the whole rank has low information value.

This follow-up therefore used a hard leash and sampled only a bounded number of real rank-22 universal segments from the qualified combined recurrence:

```text
support-local upward coverage
+ exact support-edge cofactor
+ horizontal-reflection support orbits
+ eager exact bounded legal-slice pruning
```

The probe stops on the first of:

```text
wall-clock budget
segment budget
accepted-candidate budget
```

and emits every completed terminal-band rank before sampling rank 22.

Default leash used for this result:

```text
wall clock:          75 s
rank-22 segments:    64
accepted candidates: 120,000
```

The segment budget fired first; total wall time was about 32 s.

## Prelude ranks

The combined recurrence completed the terminal band before sampling rank 22:

| Rank | Reflection reps | Rank time |
|---:|---:|---:|
| 30 | 1 | 1 ms |
| 29 | 3 | 2 ms |
| 28 | 12 | 24 ms |
| 27 | 28 | 71 ms |
| 26 | 66 | 278 ms |
| 25 | 126 | 1.254 s |
| 24 | 233 | 7.377 s |
| 23 | 378 | 20.623 s |

This is consistent with the previously recorded complete rank-by-rank probe.

## Rank-22 sample

The sample stopped after 64 real universal/intersection segments:

```text
rank-22 support reps:          588 total
supports started:               29
supports completed:             28
universal segments sampled:     64
raw Cartesian pairs:        18,309
legal-slice survivors:      17,712
unique accepted signatures: 12,390
subset-minimal survivors:    2,001
max accepted segment:           721
max survivor segment:             90
```

Derived ratios:

```text
accepted duplicate rate: 30.05%
final survivor rate:     11.30%
```

Thus the sampled rank-22 workload contains substantial duplicate occurrence before subset dominance, and only about one accepted candidate in nine remains in the final antichain.

## Work-order comparison

Two exact cardinality-phased normalization orders were simulated over the same accepted coverage signatures.

### Legacy order

```text
for candidate in cardinality bucket:
    scan previous-cardinality frontier for subset dominance
    then scan prior same-cardinality candidates for equality
```

### Existing private dedup-first order

```text
for candidate in cardinality bucket:
    scan prior same-cardinality candidates for equality
    then, if unique, scan previous-cardinality frontier for subset dominance
```

Both were required to produce the exact same subset-minimal antichain as direct exact normalization.

Observed work:

```text
legacy subset checks:        153,920
dedup-first subset checks:   112,835
subset-check ratio:            0.7331

legacy equality checks:       20,986
dedup-first equality checks: 205,275

total comparisons:
  legacy:                    174,906
  dedup-first:               318,110
  dedup-first / legacy:        1.8187
```

## Diagnosis

Moving duplicate elimination before subset dominance is structurally correct and reduces subset comparisons by about **26.7%** on this real rank-22 sample.

However, implementing that duplicate elimination as a linear prior-equality scan is the wrong execution form. Its quadratic equality work more than erases the subset-scan reduction.

The result therefore rejects this local optimization:

```text
bucketed prior-linear-scan dedup
```

and strengthens the reusable algorithm boundary already routed to CUDA-Algorithms #11:

```text
exact key grouping / lexicographic sort
-> run-length encode / unique
-> subset-minimal or subset-maximal dominance
-> compact
```

Same-cardinality strict subset dominance is impossible; within one cardinality bucket the only dominance relation is equality. Therefore exact duplicate collapse may precede cross-cardinality subset work without semantic loss.

## Consequence

Do not spend more long CPU runs trying to make the current private O(n^2) normalizer cross rank 21.

The next discriminating test should change the normalization algorithm itself. A useful bounded experimental qualifier may compose existing generic sort/RLE/compact machinery, but any reusable production primitive remains owned by CUDA-Algorithms #11.

No new CUDA-JS runtime/compiler method is implied by this result.
