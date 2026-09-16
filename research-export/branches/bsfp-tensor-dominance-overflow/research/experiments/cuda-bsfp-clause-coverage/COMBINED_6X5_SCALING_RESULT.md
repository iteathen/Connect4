# Combined 6x5 Connect-4 clause-coverage scaling probe

**Status:** bounded reference scaling probe stopped deliberately during rank 21 after rank 22 completed. This is a work-shape diagnosis, not a native GPU result or a full-solve failure.

**Research direction:** Josh Oshiro.

## Candidate under test

The probe used the strongest currently qualified structural stack together:

```text
support-local upward-coverage clause records
+ exact support-edge coverage cofactors
+ horizontal-reflection support-orbit recurrence
+ eager bounded legal-slice pruning
```

The reference implementation is ordinary single-threaded Node/JavaScript with the existing correctness-first subset-antichain normalizer. It does **not** include:

- CUDA warp-native cofactor execution;
- CUDA-Algorithms #11 segmented antichain normalization;
- native GPU batching/parallelism;
- any 7x6-specific assumption.

## Harness correction

An initial scaling harness eagerly constructed the dictionary/upward-closure metadata for every support before rank descent, making preprocessing indistinguishable from recurrence scaling.

That form was rejected.

The recorded probe builds support-local dictionaries and guard metadata lazily as supports/edges become relevant, so each emitted rank measurement reflects the actual descent workload plus on-demand metadata construction.

## Rank-by-rank evidence

Geometry:

```text
6 columns x 5 rows
connect 4
46,656 physical support states
horizontal-reflection representative schedule
```

Completed ranks:

| Rank | Reflection reps | Rank time | Universal product pairs | Cofactor inputs | Eager guard rejects | Persistent records | Edges | Max frontier observed | Cached dictionaries |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 30 | 1 | 1 ms | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 29 | 3 | 2 ms | 0 | 0 | 0 | 12 | 3 | 5 | 4 |
| 28 | 12 | 9 ms | 127 | 84 | 0 | 136 | 21 | 9 | 19 |
| 27 | 28 | 45 ms | 1,060 | 702 | 0 | 679 | 63 | 31 | 53 |
| 26 | 66 | 258 ms | 9,195 | 4,276 | 0 | 2,660 | 177 | 80 | 138 |
| 25 | 126 | 1.189 s | 46,717 | 15,366 | 0 | 7,887 | 378 | 109 | 296 |
| 24 | 233 | 7.014 s | 361,504 | 48,348 | 0 | 22,182 | 771 | 176 | 595 |
| 23 | 378 | 19.795 s | 957,809 | 128,329 | 11 | 48,357 | 1,353 | 250 | 1,071 |
| 22 | 588 | 97.631 s | 5,783,153 | 290,969 | 151 | 109,685 | 2,253 | 601 | 1,819 |

Rank 21 was then allowed to run for roughly two minutes. It had not completed when the probe was deliberately terminated. RSS was still only about 287 MB and one CPU core was saturated.

## Diagnosis

The visible bend is between ranks 23 and 22:

```text
rank time:      19.8 s -> 97.6 s
product pairs:  0.96 M -> 5.78 M
max frontier:   250 -> 601
reflection reps:378 -> 588
```

The support-representative count grows only ~1.56x while product work grows ~6.0x and elapsed reference time grows ~4.9x.

Therefore the current wall is **not primarily support-lattice cardinality**. It is frontier/product/normalization growth inside retained supports.

Memory remained modest relative to the compute increase, reproducing the earlier diagnosis that the BSFP wall is compute/frontier manipulation before retained-memory exhaustion.

## Legal-slice activation

The bounded legal-slice guard is nearly inactive in the terminal band:

```text
rank 23 rejects: 11
rank 22 rejects: 151
```

This does not contradict the small-board complete-control result where recursive pruning compounds strongly. It means the particular cheap guard does not become a major reducer until the ownership slice becomes tighter relative to the proof clauses.

Consequently, it should not be expected to solve the rank-22/21 normalization wall by itself.

## Why the probe was stopped

Continuing rank 21 in this implementation would mostly benchmark the private correctness-first `O(n^2)` subset-antichain normalizer on one CPU core.

That is precisely the reusable operation already routed to:

```text
iteathen/CUDA-Algorithms #11
bounded segmented fixed-width set-antichain normalization
```

The intended GPU candidate also has CUDA-JS warp-native cofactor support from completed #262.

The probe was therefore stopped once it had localized the next structural/execution wall rather than burning additional CPU time on a reference implementation already known not to be the intended production normalizer.

## Consequence

The current structural stack successfully moves the first visible 6x5 clause-coverage wall down to the **rank-22 / rank-21 region in the unoptimized JS reference**.

Do not translate that rank directly into a GPU stopping-rank prediction. The measured wall is dominated by exactly the normalization/product stage that has not yet received its intended generic GPU implementation.

The next performance-discriminating test should occur **after** either:

1. CUDA-Algorithms #11 provides a qualified segmented antichain normalizer; or
2. an equivalent bounded experimental GPU normalizer is available strictly for qualification.

Until then, repeating longer 6x5 CPU descent has low information value.
