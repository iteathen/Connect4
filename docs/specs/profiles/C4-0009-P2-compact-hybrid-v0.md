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

P2 now evaluates one representative per horizontal-reflection support orbit,
selected by the smaller support index. A reflected child is transported back
into the physical parent's coordinates before cofactor application. This is an
exact geometric permutation of both u32 lanes and preserves the entire Boolean
ownership domain; no legal-slice pruning is implied. The reported
`supportSkeletons` remains the full lattice, while `evaluatedSupports`,
rank support counts, retained-record counts and supports/second describe the
representative schedule.

P2 also skips redundant normalization for upward cofactors fixed to P1
(antichain filtering), and downward cofactors fixed to P0 (filtering followed by
removing the common landing bit). The other cofactors still normalize.
`BSFP_HYBRID_REFLECTION=0` and
`BSFP_HYBRID_COFACTOR_PRESERVATION=0` independently select the corrected
baseline for measurement; both optimizations default to enabled.

Independent qualification can set `BSFP_HYBRID_VERIFY_FRONTIERS=1` on boards
with at most 25 cells. It compares every physical support, including reflected
occurrences, to the unchanged full-lattice reference recurrence. This observer
does not drive native progression. Its preparation occurs before runtime open;
its comparisons are included in solve wall time. Ordinary runs do not load
the reference observer. Qualification tests additionally exercise all four
optimization combinations and shard widths 1, 17 and 256.

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

### Tensor overflow recovery on this branch

The ordinary batched path retains a 1,024-record per-segment survivor capacity. On overflow, the Tensor reducer reads the already generated packed candidates and popcounts, then normalizes them exactly in cardinality order with 256-candidate by 1,024-reference resolved-SIMT tiles. It does not truncate the frontier or regenerate the Cartesian product. Tensor mode no longer prepares an unused packed recovery plan.

`BSFP_HYBRID_OVERFLOW_EXECUTOR=tensor|packed` selects the recovery executor (default: packed). Packed reuses the existing bounded single-segment normalizer and output slab, with a 262,144-record frontier ceiling; it fails visibly above that capacity. Neither method changes the batch, CUDA-JS, Q1 admission or timeout limits. This is an A/B of existing P2 mechanisms, not adoption of a generic CUDA-Algorithms normalizer API. Promotion follows independent exact replay of both real overflow directions and an all-frontier native control with 122 forced recoveries. Tensor remains available explicitly.

Host deduplication removes equal masks within a cardinality phase. Tensor compares against earlier accepted cardinalities. Recovery counts, maximum recovered frontier and Tensor run timings are observations, not an independent correctness proof.

### Crash-safe measurements and real-overflow replay

`generatedPairCandidates` now counts generation-completed batches even while their recovery is active. `completedBatchPairCandidates` retains the former completed-batch meaning; `submittedPairCandidates`, `activeBatch`, and `activeOverflow` distinguish submissions and in-flight work. Solver progress includes active rank/shard and process CPU microseconds. Counts are observations, not completed proof state.

`BSFP_HYBRID_CAPTURE_OVERFLOW_DIR` enables a bounded evidence observer (first two overflows per direction) that persists original operands, geometry, rank/support/stage, source revision/dirty state and SHA-256 before recovery. No recovered output is used as oracle authority.

Q1 profile `c4-0009-p2-overflow-replay` accepts an explicit `BSFP_OVERFLOW_REPLAY_FIXTURE` captured 7x6 input. It checks the content hash and ordinary batch bounds, independently computes the full Cartesian product and exact BigInt normalization, then replays both existing executors with one warmup and three measured passes in alternating order. Every result must match the oracle and cross the 1,024 frontier boundary. Timing includes pair generation, host/device transfers and recovery, but excludes oracle/verification. Setup is separate. It claims no root WDL. Both resident packed slabs plus one resolved workspace fit inside the existing conservative P2 admission bound and unchanged 256 MiB runtime policy.

The separate callable Tensor A/B rotates method order and uses two warmups plus seven measured samples, reporting each sample and min/median/max. Its executor/workspace remains independent of resolved-SIMT recovery.

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

### Tensor overflow workspace contracts

The integrated overflow normalizer uses CUDA-JS-Tensor `ResolvedTensorPlan`. Under accepted Tensor SPEC-0005 its resolved-plan workspace ceiling is **64 MiB**, and P2 uses that value as the shared default and maximum for `BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES`. The separate full-shape Tensor A/B gate uses the SPEC-0009 device-callable program profile and retains its independently qualified larger workspace allowance; that allowance must not be forwarded into the resolved-plan solver path. CUDA-JS device-allocation policy is a third, independent contract and P2 no longer derives `maxAllocationBytes` from the Tensor workspace option.

Admission reports the 64 MiB resolved-SIMT ceiling and the independent 192 MiB callable A/B ceiling separately. It retains the conservative 543,169,548-byte bound (73,407,500-byte packed payload + 256 MiB runtime allowance + the larger 192 MiB Tensor allowance) for the sequential qualification steps. The 95%-of-current-free policy and 256 MiB emergency floor are unchanged. This admission allowance is not a CUDA-JS allocation policy.

The solver uses an independent CUDA-JS policy of 256 MiB total device bytes, 128 MiB per allocation, and 16 MiB per transfer. The A/B uses 256 MiB total, 192 MiB per allocation, and 16 MiB per transfer to admit its 164,544,512-byte callable arena. Neither policy is inferred from a Tensor workspace option. The normalizer Tensor session admits at most 512 MiB total, 128 MiB per tensor and 2,048 live tensors; the borrowed CUDA runtime remains the stricter final allocation authority.

The regression test imports the actual P2 runner configuration, passes it through the reducer option mapping, and resolves/runs both directions at full 256x1,024 tile size using the portable runtime. This checks contracts and lifecycle only, not native arithmetic. The runner emits configuration and five-second progress snapshots to the qualifier stderr log so timeout evidence retains counters. The qualifier timeout stays at 120 seconds.

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
