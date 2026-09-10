# C4-0009-B2 — Packed42 cardinality-normalizer A/B v0

**Status:** Working performance/correctness profile on `feature/cuda-bsfp`; no solver-result claim.

## Purpose

B2 decides whether exact cardinality bucketing materially improves the packed42 antichain normalization primitive before that physical change is considered for the native-qualified C1 CUDA-BSFP solver.

The comparison isolates one specific code-review finding: the legacy reducer scans the complete candidate interval once for each of 43 cardinality phases even though each valid candidate belongs to exactly one phase.

## Ownership

Connect4 owns the packed42 dominance/equality semantics and this benchmark fixture. CUDA-JS supplies only the generic Device-JS/runtime mechanisms. CUDA-Algorithms is not changed by this profile.

## Fixed native workload

B2 is selected through the standard 7x6 connect-4 geometry but is a primitive benchmark, not a 7x6 solve.

Both strategies receive the same deterministic workload:

- 1,024 independent segments;
- 512 packed42 candidates per segment;
- 524,288 candidates total;
- alternating minimal/maximal antichain direction;
- equal-popcount distinct masks plus one exact duplicate per segment;
- output capacity 512 records per segment;
- 256 threads per block.

The legacy and bucketed steps execute in separate child processes under the same Q1 hardware/memory/timeout supervision.

## Strategies

### Legacy control

`legacy-43-phase-scan`

For every cardinality phase, every candidate position is visited and a popcount equality guard selects the active records. Exact duplicate suppression scans earlier input positions and checks their cardinality before equality.

### Candidate

`bucketed-cardinality-v0`

The candidate performs:

1. one linear count into 43 exact popcount buckets;
2. one 43-entry prefix step;
3. one linear scatter of original candidate indices;
4. exact dominance processing only over the selected bucket;
5. exact same-cardinality duplicate suppression only over earlier entries in that bucket.

The candidate adds one u32 candidate-index scratch lane and three 43×segment u32 metadata arrays. It does not hash or approximate equality.

## Native correctness gate

Each child independently verifies:

- status OK for every segment;
- exactly 511 survivors per segment;
- survivor set equals the deterministic expected exact mask set;
- exactly one duplicate removed per segment.

A timing result is admissible only after those assertions pass.

## Memory bound

The Q1 estimate includes all candidate, output, check, bucket-index and bucket-metadata arrays plus a fixed 256 MiB runtime allowance. The two strategies execute sequentially, so the bound is the larger bucketed peak, not their sum.

## Timing interpretation

The primary comparison is `timingsMs.submissionWait` from the two step results on the same native Q1 run.

This is a primitive normalizer result. It does not establish whole-solver speedup because C1 also performs pair generation, cofactor handling, terminal subtraction, unions, copies, barriers and support-level orchestration.

Promotion requires a material native gain followed by C1 integration and all-frontier requalification on 4x3, 4x4 and 5x5.

## Falsifiers

Reject or redesign this candidate if:

- survivor sets differ;
- output capacity behavior differs;
- portable compilation/submission fails on a supported pinned-runtime lane;
- native count/scatter/global-memory overhead erases the avoided 43-scan work;
- integration changes any qualified C1 frontier.

## Non-claims

B2 does not claim:

- a standard 7x6 result;
- a complete 6x5 result;
- that bucketed normalization is already the C1 reducer;
- a CUDA-Algorithms or CUDA-JS capability gap;
- that high GPU utilization alone proves either strategy efficient.
