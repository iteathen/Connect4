# C4-0009-B3 — Packed42 duplicate-first normalizer A/B v0

**Status:** Working performance/correctness profile on `feature/cuda-bsfp`; no solver-result claim.

## Purpose

B3 decides whether exact same-cardinality duplicate elimination should occur before retained-frontier dominance checks once candidates have already been cardinality-bucketed.

The comparison isolates a second code-review finding from C1: OR/AND Cartesian products may emit the same 42-bit ownership mask many times, while the current normalizer can make each duplicate pay retained-frontier subset checks before discovering exact equality.

B3 does not estimate the duplicate rate of the 6x5 solver. C3 remains the authority for whether duplicate/prior-scan work is materially present in the real first 6x5 epoch.

## Ownership

Connect4 owns packed ownership identity, equality, dominance, the Cartesian fixture, and the decision to promote the strategy. CUDA-JS supplies the generic Device-JS/runtime mechanisms. CUDA-Algorithms is unchanged.

## Fixed native workload

B3 is selected through the standard 7x6 connect-4 geometry only to give Q1 a stable benchmark identity. It is not a standard-7x6 solve.

Each A/B step uses:

- 1,024 independent segments;
- 512 packed42 candidates per segment;
- 524,288 candidates total;
- alternating minimal/maximal antichain direction;
- output capacity 512 records per segment;
- 256 threads per block;
- the same bucket scratch layout already qualified by B2.

## Duplicate-rich Cartesian fixture

The fixture is generated deterministically from finite left/right packed42 operand sets and materializes OR products for minimal segments and AND products for maximal segments. Repeated output masks therefore arise from the same algebraic operation class used by compact BSFP intersections rather than from copying one arbitrary constant repeatedly.

The corpus spans both u32 lanes and multiple popcounts. The harness records total candidates, unique exact `(lo, hi)` masks, exact duplicates and duplicate fraction. Portable qualification establishes only representability and exact output behavior; its fake-runtime timings are not performance evidence.

## Strategies

### Control — `bucketed-cardinality-v0`

This is B2's exact cardinality-bucketed normalizer. A candidate first pays retained-frontier dominance checks. If it survives those checks, exact equality is then tested against earlier entries in the same bucket.

### Candidate — `bucketed-dedup-first-v0`

This strategy preserves the same bucket order, exact `(lo, hi)` equality and exact subset relation but reverses those two local operations:

1. find any earlier exact duplicate in the same cardinality bucket;
2. if duplicate, discard before retained-frontier dominance work;
3. otherwise run the same exact retained-frontier subset checks;
4. append only an exact survivor.

There is no probabilistic hash identity, bloom filter, heuristic collision policy or weakened equality rule.

## Native correctness gate

B3 executes two Q1 child steps on the identical deterministic corpus:

1. `bucketed-duplicate-rich-control`;
2. `dedup-first-duplicate-rich`.

Each child independently requires:

- native outcome `native-dedup-first-stress-pass`;
- the expected strategy and fixture identity;
- 1,024 × 512 workload shape;
- at least one exact duplicate and at least one unique candidate;
- exact duplicate accounting (`duplicates = candidates - unique`);
- duplicate fraction strictly between 0 and 1;
- nonempty exact survivor set no larger than the exact unique set;
- finite nonnegative observed retained-frontier subset-check count;
- finite nonnegative submission/wait time.

The experiment itself compares every native segment's survivor set against an independently computed exact CPU antichain result before emitting a passing outcome.

## Memory bound

The Q1 estimate reuses B2's proven upper-bound layout because B3 uses the same candidate, output, checks, bucket-index and bucket-metadata arrays. A fixed 256 MiB runtime allowance remains included. The two strategies run sequentially, so their allocations are not summed.

## Decision rule

Correctness does not depend on performance.

Promotion requires both:

1. C3 native evidence showing that real 6x5 duplicate/prior-scan work is material enough to address; and
2. native B3 A/B evidence showing that duplicate-first ordering reduces useful normalization cost on the conditioned duplicate-rich workload without changing exact results.

If the B3 stress case wins but C3 shows a low real duplicate rate, park the strategy. If C3 shows heavy duplicate work but B3 does not repay its earlier equality scan, redesign rather than promote.

Observed `frontierSubsetChecks` are particularly useful because B3's intended mechanism is to prevent duplicate candidates from reaching dominance work. Wall time remains the final physical cost check.

## Relationship to other candidates

B3 composes with B2 cardinality bucketing; it does not replace B2's question about eliminating 43 whole-interval scans.

It also composes with exact semantic filters such as the distinct-playable double-threat absorber and with specialized terminal subtraction. Those candidates reduce or discard records at different points in the pipeline and must be qualified independently before combination.

## Non-claims

B3 does not claim:

- a 6x5 or 7x6 solve;
- that the real 6x5 workload has the fixture's duplicate fraction;
- whole-solver speedup;
- that duplicate-first is already the C1 reducer;
- a CUDA-JS or CUDA-Algorithms capability gap;
- permission to replace exact equality with hashing.
