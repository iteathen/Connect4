# C4-0009-P2 — Compact hybrid packed42 CUDA-BSFP profile v0

**Status:** working performance/qualification profile on `feature/cuda-bsfp`; not an Accepted production execution profile.

## Purpose

P2 is the first profile in this branch that computes an actual Connect Four root W/D/L with the compact ownership-antichain BSFP representation while using CUDA for the measured scaling bottleneck.

It is deliberately a transition profile between the exact CPU reference and the final all-device CUDA-BSFP execution shape. It exists to answer one question quickly and quantitatively:

> Once antichain Cartesian generation and dominance reduction move to CUDA, what work remains on the critical path to an extremely fast empty 7x6 solve?

P2 is a solver profile, not a synthetic primitive benchmark. A successful run must produce the root W/D/L.

## Semantic ownership

Connect4 continues to own every BSFP fact:

- support-lattice and legal landing semantics;
- ownership-mask meaning;
- terminal first-win semantics;
- minimal Win and maximal Loss antichains;
- cofactor transformations;
- existential/universal move aggregation;
- exact W/D/L and root interpretation.

CUDA-JS supplies only runtime/compiler/memory/execution mechanisms. CUDA-Algorithms is not extended by P2 because the current OR/AND frontier-product meaning is still Connect4/BSFP-specific.

## Representation

P2 supports Connect Four geometries with at most 42 cells. Ownership masks are exact JavaScript integers below `2^42` on the host and two u32 lanes on device.

The solver retains only two logical support ranks at a time. Current-rank supports are processed in bounded host shards. Child frontiers are immutable during production of a parent rank.

## Algebraic terminal simplification

P2 does not apply terminal override subtraction separately to every move frontier.

For P0:

```text
Win  = union_i ChildWinCofactor_i  union TerminalWin
Loss = (intersection_i ChildLossCofactor_i) minus TerminalWin
```

For P1:

```text
Win  = (intersection_i ChildWinCofactor_i) minus TerminalLoss
Loss = union_i ChildLossCofactor_i union TerminalLoss
```

This is the same exact set algebra as C4-0008; it factors repeated terminal work out of the per-move intersection sequence.

## CUDA pair-reduction service

The expensive intersection operator is evaluated through a persistent CUDA service. A batch contains many independent support segments.

For each segment the device DAG:

1. generates every Cartesian OR candidate for an upward/minimal intersection or AND candidate for a downward/maximal intersection;
2. computes the exact 42-bit candidate popcount;
3. reduces the candidate region to its exact minimal or maximal antichain using one block per segment and 43 cardinality phases;
4. publishes survivor counts and explicit overflow status.

No overflow may truncate a frontier. Capacity exhaustion is a failed profile boundary and must be reported with the required survivor count.

Generator offsets are bounds-checked on-device before indexed reads/writes. Invalid segment metadata is a failure, not undefined execution.

### Reused-slab overflow specialization

The ordinary batched path retains the small per-segment survivor stride below. When a segment exceeds that stride, P2 does not widen all segments and does not regenerate the Cartesian product.

After the ordinary pair DAG has completed, the generated candidate masks and popcounts remain authoritative in the persistent candidate workspace. The service retries only the overflowing segment through the existing exact segmented-antichain normalizer using a distinct one-segment prepared-plan specialization. The specialization reuses the already allocated batched output slab as one contiguous frontier instead of interpreting it as many fixed-stride segments.

With the v0 defaults this gives:

```text
ordinary per-segment survivor capacity: 1,024 records
ordinary segment capacity:              256 segments
reused output-slab capacity:            262,144 records for one retry
```

The reusable retry capacity is derived from the profile workspace as `min(segmentCapacity * outputCapacityPerSegment, candidateCapacity)`; it is not a 7x6 constant and is not inferred from an observed overflow count. Candidate data are not mutated by normalization other than the dedicated checks workspace, which is reset by each normalizer invocation. Multiple overflowing segments are therefore retried sequentially before the next batch upload overwrites the shared candidate workspace.

The retry allocates no second frontier slab, so the Q1 device-memory admission formula is unchanged. If the one-segment reused slab also overflows, P2 fails explicitly at that wider profile boundary. Such a result is evidence that frontier width itself has become the scaling wall and must not be hidden by silent clipping or unbounded allocation growth.

Every native result records overflow retry count, recovered-job count, initial overflow lower bound, maximum recovered frontier, failures, and separated retry upload/execution/readback time.

## Current fixed GPU workspace

The v0 service defaults are:

- segment capacity: 256;
- left records: 262,144;
- right records: 262,144;
- generated candidates: 4,194,304;
- ordinary survivor capacity: 1,024 records per segment;
- reused-slab overflow capacity: 262,144 records for one segment;
- block size: 256 threads.

The candidate workspace uses four u32 arrays when checks are included: low mask, high mask, popcount, and comparison count. Output frontiers use two u32 arrays. Metadata and status arrays are bounded by segment capacity.

Including a 256 MiB runtime allowance, Q1 admits P2 with a conservative device upper bound below 384 MiB. The Q1 95%-of-current-free policy and 256 MiB emergency floor remain authoritative for hardware admission. The overflow specialization reuses these allocations and therefore does not increase this bound.

These fixed capacities are qualification parameters, not claims that 1,024 is sufficient for every 7x6 support. If an exact frontier exceeds the ordinary stride, the reused-slab specialization is attempted; if it exceeds that bounded specialization too, the result is an explicit scaling datum and the profile is compressed or sharded. It is never clipped.

## Host/device boundary in P2

P2 still performs these exact but comparatively cheap operations on the host:

- support decoding and legal-column enumeration;
- child frontier cofactors;
- terminal boundary construction;
- union-side normalization;
- final terminal subtraction.

Only the expensive iterative Cartesian intersection is currently sent to CUDA.

This means P2 does **not** satisfy the final C4-0009 goal of device-resident semantic progression. It is a measured integration profile used to identify the next bottleneck. A fast P2 result is evidence for the algebra and GPU mapping, not permission to freeze this host boundary as the production architecture.

## Geometry ladder

P2 can attempt the current Q1 ladder through 7x6 so long as `columns * rows <= 42`. Larger cases remain unsupported by this packed42 profile.

Established root checks currently include:

- 4x3 connect-3: Win;
- 4x4 connect-4: Draw;
- 5x4 connect-4: Draw;
- 5x5 connect-4: Draw;
- 7x6 connect-4: Win.

Intermediate scaling geometries without a separately frozen root oracle still produce exact BSFP results, but completion alone does not create an independent-oracle claim.

## Performance evidence

Every native result must report at least:

- runtime-open and total solve wall time;
- support skeletons and supports/second;
- structural preparation time;
- wall time spent in GPU pair reduction;
- finalization/terminal-subtraction time;
- GPU reducer batch/call/job counts;
- generated pair candidates;
- ordinary/reused-slab overflow counts and maximum recovered frontier;
- GPU upload/execution/readback time, with overflow-retry time identified;
- total and maximum frontier sizes;
- per-rank wall time and frontier width.

Performance numbers are descriptive evidence, not correctness thresholds.

## Promotion / rejection rule

If P2 makes 5x5 and 6x5 dramatically faster and the time split shows GPU pair reduction dominates, widen batching and move directly toward 7x6.

If host structural preparation/finalization dominates after CUDA removes pair reduction cost, move those Connect4-owned transforms into a rank/shard Device-JS kernel while preserving the same exact recurrence.

If frontier capacity or surviving frontier width—not execution throughput—becomes the wall, shift compression effort toward WSL-625/CPC/NDC rather than hiding the growth with larger allocations.
