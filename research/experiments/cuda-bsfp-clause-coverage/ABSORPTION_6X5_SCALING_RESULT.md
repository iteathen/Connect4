# Combined 6x5 scaling with cross-frontier absorption

**Status:** bounded reference scaling probe. Cross-frontier absorption materially moved the 6x5 wall and nearly completed rank 21 under the original 150-second total leash. This is still single-threaded JavaScript with the correctness-first normalizer, not native GPU timing.

**Research direction:** Josh Oshiro.

## Candidate

```text
support-local upward-coverage clause records
+ exact support-edge coverage cofactors
+ horizontal-reflection support-orbit recurrence
+ eager bounded legal-slice pruning
+ exact cross-frontier absorption before universal OR-product materialization
```

Cross-frontier absorption uses the exact law:

```text
if some a in A satisfies a subseteq b in B,
then the entire product column b is represented by b;

dually, if some b subseteq a,
the entire product row a is represented by a.
```

## Leash

The run emitted every completed rank and stopped at a hard total wall-clock budget:

```text
target rank: 21
total wall-clock budget: 150 s
execution: attached/reference Node semantics
```

No attempt was made to let rank 21 run indefinitely.

## Rank evidence

| Rank | Reflection reps | Rank time | Raw pairs | Pairs eliminated | Elimination rate | Remaining pairs | Legal rejects | Candidate occurrences | Output records | Max frontier |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 30 | 1 | 1 ms | 0 | 0 | 0.0% | 0 | 0 | 0 | 0 | 0 |
| 29 | 3 | 2 ms | 0 | 0 | 0.0% | 0 | 0 | 0 | 12 | 5 |
| 28 | 12 | 12 ms | 68 | 0 | 0.0% | 68 | 0 | 68 | 136 | 9 |
| 27 | 28 | 48 ms | 781 | 57 | 7.3% | 724 | 0 | 738 | 679 | 31 |
| 26 | 66 | 262 ms | 7,907 | 2,115 | 26.7% | 5,792 | 0 | 6,088 | 2,660 | 80 |
| 25 | 126 | 1.152 s | 42,792 | 17,481 | 40.9% | 25,311 | 8 | 26,812 | 7,887 | 109 |
| 24 | 233 | 4.716 s | 346,916 | 189,347 | 54.6% | 157,569 | 1,862 | 164,710 | 22,182 | 176 |
| 23 | 378 | 12.637 s | 927,864 | 549,710 | 59.2% | 378,154 | 19,106 | 380,352 | 48,357 | 250 |
| 22 | 588 | 46.200 s | 5,693,732 | 3,599,558 | 63.2% | 2,094,174 | 298,771 | 1,873,353 | 109,685 | 601 |

Rank 21 was interrupted only by the total leash:

```text
rank-21 reflection reps total: 833
rank-21 reps completed:        817
completion fraction:           98.08%
rank-21 elapsed inside rank:   84.969 s
raw pairs seen:                10,363,594
pairs eliminated:               6,784,208
pair elimination rate:             65.46%
remaining pairs:                3,579,386
legal rejects:                    531,283
candidate occurrences:          3,175,156
output records so far:            251,503
max frontier observed:                471
RSS near previous wall remained modest; this remains compute/frontier dominated.
```

## Comparison with the pre-absorption combined reference

Previously recorded rank times:

```text
rank 24:  7.014 s
rank 23: 19.795 s
rank 22: 97.631 s
```

With absorption:

```text
rank 24:  4.716 s   (~1.49x faster)
rank 23: 12.637 s   (~1.57x faster)
rank 22: 46.200 s   (~2.11x faster)
```

The gain grows as the product wall grows, which is the desired structural behavior.

## Interpretation

Cross-frontier absorption is not merely a constant-factor kernel optimization. It removes product occurrences before OR construction, feasibility checking, duplicate collapse, and subset normalization.

At rank 22 it removes nearly two thirds of the Cartesian pairs before materialization. At rank 21 the partial run had already eliminated about 65.5%.

This changed the practical conclusion from the previous 6x5 probe:

```text
before absorption:
    rank 21 did not finish within a ~2 minute rank-local probe;

after absorption:
    817 / 833 rank-21 reflection reps completed inside the original 150 s total run,
    after first paying the full ranks 30..22 cost.
```

The remaining wall is still normalization/product work, but its scale is substantially smaller.

## Next falsifier

One attached rerun with a slightly larger but still hard total leash is justified to determine whether rank 21 completes cleanly. Do not keep extending the run if it fails.

Regardless of that outcome, the next architectural lever remains scalable exact duplicate collapse plus GPU-native subset dominance under CUDA-Algorithms #11; absorption composes before that stage.
