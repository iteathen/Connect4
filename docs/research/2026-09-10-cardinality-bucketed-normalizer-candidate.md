# Cardinality-bucketed packed42 normalizer candidate

**Date:** 2026-09-10  
**Branch:** `feature/cuda-bsfp`  
**Status:** exact physical-work candidate; legacy normalizer remains the solver control.

## Motivation

Code review of the compact CUDA-BSFP path found that `packedNormalize42` traverses the complete candidate interval in each of 43 cardinality phases. A candidate participates semantically in exactly one cardinality phase, so the other 42 interval visits are physical overhead rather than proof work.

The current reducer also scans earlier input positions to suppress exact same-cardinality duplicates. The popcount predicate makes most positions irrelevant to that scan.

The owner additionally observed roughly 95–100% GPU utilization during the slow 6x5 interval. High utilization therefore does not imply high useful-work efficiency: the device may be saturated by repeated candidate visits and irrelevant duplicate-scan comparisons.

## Candidate

`packedNormalize42Bucketed` preserves the exact reducer order while changing only physical organization:

1. one linear pass counts valid candidates into 43 exact popcount buckets;
2. a 43-entry prefix step assigns disjoint bucket ranges;
3. one linear pass scatters original candidate indices into those ranges;
4. cardinality phases consume only their own bucket;
5. dominance against completed earlier-cardinality frontier records is unchanged;
6. exact duplicate suppression scans only earlier entries in the same cardinality bucket;
7. survivor publication remains exact and capacity-fail-closed.

The candidate stores candidate **indices**, not copied 42-bit masks. It therefore adds one u32 scratch lane per candidate plus three small `43 * segmentCount` u32 metadata arrays.

Invalid popcount sentinels such as the compact cofactor path's `99` are omitted from all buckets, preserving existing invalid-candidate behavior.

## Exactness boundary

The transformation relies only on the already-qualified antichain invariant:

- minimal antichains process lower cardinalities before higher ones;
- maximal antichains process higher cardinalities before lower ones;
- distinct masks of equal cardinality cannot strictly contain one another;
- equal masks are interchangeable as frontier records.

The atomic scatter does not preserve original within-bucket order. This cannot change the output set because same-cardinality records interact only through exact equality; any surviving representative of an equal mask has the same 42-bit proof meaning.

No probabilistic hash/equality, heuristic pruning, Connect4 semantic inference, shared memory, warp primitive, CUDA C++, PTX, or CUDA-JS revision change is introduced.

## Integration scope

The legacy `packedNormalize42` remains available and is still the compact C1/C3 solver path. The bucketed function is exposed first through the segmented packed-antichain primitive plan under strategy `bucketed-cardinality-v0`.

This sequencing deliberately avoids changing the native-qualified C1 recurrence before the candidate compiles and submits across the pinned portable CUDA-JS matrix and receives a native numerical comparison.

## Qualification gates

Before promotion into compact C1:

1. portable Device-JS compile/submit on Windows and Linux, Node 24.15 and 26.7;
2. native primitive output-set equality against the legacy path for mixed minimal/maximal segments, including duplicates;
3. native timing comparison on the same hardware/workload;
4. compact 4x3, 4x4 and 5x5 all-frontier equality after integration;
5. only then compare 6x5 C3/complete scaling behavior.

The candidate should be rejected if the two-pass count/scatter and extra global-memory traffic erase the savings from eliminating 42 irrelevant full scans.

## Relationship to winspace inference

This physical optimization composes with the exact double-threat result. The latter found only 2.37% direct pair reduction on 5x5 but identified about 26.59% of baseline pair results as already inside a proved final region. A future pipeline can therefore filter semantically proved candidates before placing survivors into cardinality buckets. The two ideas attack different waste sources and should be measured independently before composition.
