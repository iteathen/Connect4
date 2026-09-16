# C4-0009-B2 — Packed42 cardinality-normalizer A/B v0

**Status:** Working performance/correctness profile on `feature/cuda-bsfp`; no solver-result claim.

## Purpose

B2 decides whether exact cardinality bucketing materially improves the packed42 antichain normalization primitive before that physical change is considered for the native-qualified C1 CUDA-BSFP solver.

The comparison isolates one specific code-review finding: the legacy reducer scans the complete candidate interval once for each of 43 cardinality phases even though each valid candidate belongs to exactly one phase.

## Ownership

Connect4 owns the packed42 dominance/equality semantics and benchmark fixtures. CUDA-JS supplies only the generic Device-JS/runtime mechanisms. CUDA-Algorithms is not changed by this profile.

## Fixed native workload

B2 is selected through the standard 7x6 connect-4 geometry but is a primitive benchmark, not a 7x6 solve.

Every step uses:

- 1,024 independent segments;
- 512 packed42 candidates per segment;
- 524,288 candidates total;
- alternating minimal/maximal antichain direction;
- output capacity 512 records per segment;
- 256 threads per block.

Two deterministic fixtures are required.

### Equal-cardinality duplicate stress

Each segment contains distinct equal-popcount masks plus one exact duplicate. This deliberately maximizes the legacy 43-phase interval-scan overhead while exercising exact duplicate suppression.

### Mixed-cardinality deterministic control

Every segment receives the same frozen xorshift-generated 42-bit corpus spanning multiple cardinalities plus one exact duplicate. Exact expected minimal and maximal survivor sets are computed once from ordinary subset semantics and every native segment is compared against the appropriate set.

This second fixture prevents an optimization decision from being based only on the most favorable one-bucket workload.

## Strategies

### Legacy control — `legacy-43-phase-scan`

For every cardinality phase, every candidate position is visited and a popcount equality guard selects active records. Exact duplicate suppression scans earlier input positions and checks cardinality before equality.

### Candidate — `bucketed-cardinality-v0`

The candidate performs:

1. one linear count into 43 exact popcount buckets;
2. one 43-entry prefix step;
3. one linear scatter of original candidate indices;
4. exact dominance processing only over the selected bucket;
5. exact same-cardinality duplicate suppression only over earlier entries in that bucket.

The candidate adds one u32 candidate-index scratch lane and three 43×segment u32 metadata arrays. It does not hash or approximate equality.

## Native correctness gate

Each of the four child steps independently verifies:

- status OK for every segment;
- exact survivor count for that direction and fixture;
- exact survivor set equality;
- the injected duplicate is represented only once;
- every one of the 1,024 segments is checked.

The four steps are:

1. legacy / equal-cardinality;
2. bucketed / equal-cardinality;
3. legacy / mixed-cardinality;
4. bucketed / mixed-cardinality.

A timing result is admissible only after its step's exact assertions pass.

## Memory bound

The Q1 estimate includes all candidate, output, check, bucket-index and bucket-metadata arrays plus a fixed 256 MiB runtime allowance. Steps execute sequentially, so the bound is the larger bucketed peak, not the sum of all four children.

## Timing interpretation

Compare `timingsMs.submissionWait` only within the same fixture on the same native Q1 run. The equal-cardinality fixture is the scan-overhead stress case; the mixed fixture is the generalization control. Promotion should require a material gain that is not confined to the deliberately favorable stress case.

B2 remains a primitive normalizer result. It does not establish whole-solver speedup because C1 also performs pair generation, cofactor handling, terminal subtraction, unions, copies, barriers and support-level orchestration.

Promotion requires a native A/B win followed by C1 integration and exact all-frontier requalification on 4x3, 4x4 and 5x5.

## Falsifiers

Reject or redesign this candidate if survivor sets differ, capacity behavior differs, portable composition fails, native count/scatter traffic erases the avoided rescans, or the apparent gain exists only on the one-bucket stress fixture and disappears on mixed cardinalities.

## Non-claims

B2 does not claim a standard 7x6 result, a complete 6x5 result, that bucketed normalization is already the C1 reducer, a CUDA-Algorithms/CUDA-JS capability gap, or that high GPU utilization proves either strategy efficient.
