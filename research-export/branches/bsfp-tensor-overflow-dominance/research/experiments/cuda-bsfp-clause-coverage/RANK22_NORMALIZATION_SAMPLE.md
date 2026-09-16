# Leashed 6x5 rank-22 normalization sample

**Status:** bounded work-shape sample completed; no semantic mismatch in the compared normalization formulations. This is a mechanism diagnosis, not native GPU timing.

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

The segment budget fired first; total wall time remained about 32-33 s on repeated runs.

## Prelude ranks

The combined recurrence completed the terminal band before sampling rank 22:

| Rank | Reflection reps | Typical rank time |
|---:|---:|---:|
| 30 | 1 | ~1 ms |
| 29 | 3 | ~1-2 ms |
| 28 | 12 | ~7-24 ms |
| 27 | 28 | ~40-71 ms |
| 26 | 66 | ~270-278 ms |
| 25 | 126 | ~1.25-1.31 s |
| 24 | 233 | ~7.4-7.6 s |
| 23 | 378 | ~20.6-20.8 s |

This is consistent with the previously recorded complete rank-by-rank probe.

## Rank-22 sample

The deterministic sample stopped after 64 real universal/intersection segments:

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

Moving duplicate elimination before subset dominance is structurally correct and reduces subset comparisons by about **26.7%**. However, implementing duplicate elimination as a linear prior-equality scan is the wrong execution form: its quadratic equality work more than erases the gain.

The local optimization

```text
bucketed prior-linear-scan dedup
```

is therefore rejected.

## Exact duplicate-collapse projection

The same accepted signatures were then deduplicated exactly before any subset work, modeling the semantic effect of a real key-grouping / sort-RLE stage without pretending a GPU implementation already exists.

```text
legacy subset checks:          153,920
exact-dedup subset checks:     110,617
exact-dedup / legacy:           0.7187
```

So perfect duplicate collapse removes about **28.1%** of the subsequent subset predicates on this sample.

This is useful but not sufficient by itself to explain away the full rank-22 wall. The subset-dominance stage still matters after dedup.

## Independent-dominance formulation

After exact duplicate collapse, incremental frontier construction is not semantically required.

For unique candidates:

```text
candidate C is non-minimal
iff
there exists any candidate R with |R| < |C| and R subset C
```

`R` need not itself be minimal. If some still smaller `Q` dominates `R`, transitivity gives `Q subset R subset C`, so the existence of any strict-subset candidate is enough to reject `C`.

Therefore exact normalization may be expressed as:

```text
exact duplicate collapse
-> cardinality bucket/index
-> independently mark each candidate dominated if any lower-cardinality candidate is a subset
-> compact unmarked candidates
```

The formulation produced the identical exact frontier on all 64 sampled segments.

Work shape:

```text
eligible lower-cardinality pair predicates: 1,274,270
CPU early-exit predicates:                    542,924
```

This is intentionally **not** a CPU optimization: it evaluates more raw subset predicates than the incremental retained-frontier algorithm. Its value is execution shape. Every pair predicate is independent and can be tiled/batched on GPU without a sequential frontier-build dependency.

Scaling the sampled eligible-pair density against the independently recorded complete rank-22 universal-pair count gives an order-of-magnitude projection of a few hundred million fixed-width subset predicates for the whole rank. Treat that as a workload projection only, not native timing evidence.

This formulation has been routed to CUDA-Algorithms #11 as a candidate generic realization:

```text
lexicographic sort / equivalent grouping
-> RLE / unique
-> cardinality offsets
-> tiled segmented strict-subset mark
-> stable compact
```

## Slack-2 guard falsifier

The sample also tested whether the bounded legal-slice filter was simply one exact slack level too weak.

Accepted candidate slack distribution:

```text
slack 0:    33
slack 1:   454
slack 2: 1,852
slack 3: 3,209
slack 4: 2,490
slack 5: 4,585
slack 6: 3,942
slack 7:   348
slack 8:   775
slack 9:    24
```

Among slack-2 candidates with unsatisfied residual clauses:

```text
candidates tested:          1,696
additional exact rejects:     141
```

That removes only about **0.8%** of all candidates already accepted by the current cheap guard.

Conclusion: a hot-path exact two-stone witness extension is not justified by this rank-22 sample. Do not escalate automatically to slack-3 or generic minimum-hitting-set solving; the previously observed τ cost remains a warning.

## Diagnosis

The rank-22 evidence now rejects two tempting local fixes:

```text
1. prior-linear-scan dedup
2. stronger slack-2 feasibility filtering
```

The remaining high-value execution seam is:

```text
real duplicate collapse
+ GPU-native subset dominance
```

The reusable algorithm boundary remains CUDA-Algorithms #11. Connect4 should not grow a second private production normalizer.

## Consequence

Do not spend more long CPU runs trying to make the current private O(n^2) normalizer cross rank 21.

Further large recurrence probes must remain leashed and should only run after the normalization algorithm changes materially. A useful bounded experiment may compose existing generic ordering/select machinery with an experimental adjacent-unique and dominance stage, but reusable production ownership stays upstream.

No new CUDA-JS runtime/compiler method is implied by this result.
