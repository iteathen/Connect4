# C4-0009-P2 — Compact hybrid packed42 CUDA-BSFP profile v0

**Status:** working performance/qualification profile on durable branch `solver/cuda-bsfp`; retained as the exact finer-representation baseline for the post-P2 update pass; not an Accepted final production execution profile.

## Purpose

P2 is the first profile in this branch that computes an actual Connect Four root W/D/L with the compact ownership-antichain BSFP representation while using CUDA for the measured scaling bottleneck.

It is deliberately a transition profile between the exact CPU reference and the final all-device CUDA-BSFP execution shape. It exists to answer one question quickly and quantitatively:

> Once antichain Cartesian generation and dominance reduction move to CUDA, what work remains on the critical path to an extremely fast empty 7x6 solve?

P2 is a solver profile, not a synthetic primitive benchmark. A successful run must produce the root W/D/L.

### Update-pass role

P2 is now the **exact regression and economics baseline**, not a presumption about the final ordinary-value representation.

The update pass may add a q/RBA boundary-native profile alongside P2. Do not rewrite P2 semantics merely to obtain the new representation. Promotion requires exact same-input comparison and better total economics; a smaller state partition or fewer frontier records alone is insufficient.

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

### IsoGraph/q alignment

The packed ownership mask is a **P2 representation coordinate**, not the canonical ordinary gameplay identity.

Current canonical research identifies ordinary future-behavior state as:

```text
q =
    support
    + normalized P0 residual antichain
    + normalized P1 residual antichain
```

P2 is still exact because retaining physical ownership distinctions is conservative: it may distinguish records that are SAME under q, but it does not merge states that require different gameplay behavior.

The consequence is primarily efficiency and architecture:

- ownership-frontier width may contain q-redundant distinctions;
- P2 metrics must not be interpreted as the irreducible gameplay-state count;
- future compression may quotient or seed frontiers through q only after exact profile qualification;
- blockers/CPC/NDC proof context must remain separately typed when not derivable from q.

P2 therefore remains a valid exact control while becoming the **finer-representation baseline** for q-native BSFP experiments.

Post-1.1 successor research has since supplied a candidate exact ordinary-value residual-boundary algebra over the q/residual carrier, including antichain-semiring Bellman composition and exact output-sensitive projection pruning. Those results remain canonical research evidence, not an automatic P2 mutation or frozen-authority promotion. A new profile may consume them only with explicit revision pinning and qualification against this baseline.

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

### Packed and Tensor overflow recovery on this branch

The ordinary batched path retains a 1,024-record per-segment survivor capacity. On overflow, the Tensor reducer reads the already generated packed candidates and popcounts, then normalizes them exactly in cardinality order with 256-candidate by 1,024-reference resolved-SIMT tiles. It does not truncate the frontier or regenerate the Cartesian product. Tensor mode no longer prepares an unused packed recovery plan.

`BSFP_HYBRID_OVERFLOW_EXECUTOR=tensor|packed` selects the recovery executor (default: packed). Packed reuses the existing bounded single-segment normalizer and output slab, with a 262,144-record frontier ceiling; it fails visibly above that capacity. Neither method changes the batch, CUDA-JS, Q1 admission or timeout limits. This is an A/B of existing P2 mechanisms, not adoption of a generic CUDA-Algorithms normalizer API. Promotion follows independent exact replay of both real overflow directions and an all-frontier native control with 122 forced recoveries. Tensor remains available explicitly.

Host deduplication removes equal masks within a cardinality phase. Tensor compares against earlier accepted cardinalities. Recovery counts, maximum recovered frontier and Tensor run timings are observations, not an independent correctness proof.

Packed recovery and ordinary batch normalization now select the existing B2 `bucketed-cardinality-v0` strategy after separate matched real-input qualification. `BSFP_HYBRID_PACKED_STRATEGY=legacy-43-phase-scan` and `BSFP_HYBRID_PAIR_STRATEGY=legacy-43-phase-scan` independently retain the baselines. B3's quadratic duplicate-first scan is not promoted. Candidate generation remains unchanged. The two sequential normalization plans reuse one 4,194,304-element u32 index lane and three 43×256-element metadata lanes: 16,909,312 bytes. No candidate/frontier capacity or memory-policy limit increases. P2's existing 543,169,548-byte conservative admission bound still covers the sequential callable gate and solver: the solver packed payload is 90,316,812 bytes; even two resident replay services plus one 64 MiB resolved workspace and the 256 MiB runtime allowance total at most 516,177,944 bytes.

Q1 `c4-0009-p2-overflow-bucketed-replay` reuses the captured-input/independent-oracle gate to compare legacy packed against bucketed packed with the same warmup, repetition, output-capacity and cleanup requirements. This selects an existing experimental P2 mechanism; it does not implement or adopt the proposed scalable CUDA-Algorithms #11 API.

Q1 `c4-0009-p2-pair-bucketed-replay` holds bucketed recovery fixed and compares ordinary legacy vs ordinary bucketed batch normalization on the same operands.

Q1 `c4-0009-p2-overflow-final-replay` compares legacy ordinary/Tensor recovery against the final bucketed ordinary/packed recovery stack directly, after the synchronization repair. All comparisons retain the same independent BigInt frontier oracle and bounds.

Native 5x5 all-frontier qualification exposed a cross-warp histogram initialization race in the existing B2/B3 kernels. Both now place a block barrier between counter resets and atomic histogram increments (CUDA-JS SPEC-0013). Q1 `c4-0009-p2-bucket-regression` exercises 256 mixed-direction short/partial-warp high-cardinality segments in 20 differently ordered submissions, checking 5,120 exact frontiers. Portable runtime success alone cannot qualify this race fix; full native frontier controls remain required.

### Intersections larger than a batch

A support's universal intersection may exceed a physical input or candidate arena. P2 partitions its complete Cartesian domain into disjoint rectangles that each satisfy the unchanged input and candidate bounds. CUDA computes each tile's exact antichain. The P2 host combines those results by its existing exact minimal/maximal union normalization; this is valid because normalization of a union of normalized subsets equals normalization of the full union. A parent is not finalized or published until all tiles have completed. No rectangle is omitted and no oversized allocation is attempted.

This extends the existing transitional P2 host boundary; it is not a device-resident production claim. Progress reports tiled intersection/tile counts and host merge wall time separately. Tests enforce tiny arenas on the actual recurrence and compare every frontier in both polarities against the full-domain reference.

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

The optional Tensor overflow normalizer uses CUDA-JS-Tensor `ResolvedTensorPlan`. Under accepted Tensor SPEC-0005 its resolved-plan workspace ceiling is **64 MiB**, and P2 uses that value as the shared default and maximum for `BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES`. The separate full-shape Tensor A/B gate uses the SPEC-0009 device-callable program profile and retains its independently qualified larger workspace allowance; that allowance must not be forwarded into the resolved-plan solver path. CUDA-JS device-allocation policy is a third, independent contract and P2 no longer derives `maxAllocationBytes` from the Tensor workspace option.

Admission reports the 64 MiB resolved-SIMT ceiling and the independent 192 MiB callable A/B ceiling separately. It retains the conservative 543,169,548-byte bound for the sequential qualification steps. The current 90,316,812-byte packed payload and the two-service replay bound are accounted for above; the callable A/B and solver do not coexist. The 95%-of-current-free policy and 256 MiB emergency floor are unchanged. This admission allowance is not a CUDA-JS allocation policy.

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

Independent expected/oracle root checks available to P2 qualification include:

- 4x3 connect-3: Win;
- 4x4 connect-4: Draw;
- 5x4 connect-4: Draw;
- 5x5 connect-4: Draw;
- 7x6 connect-4: Win.

This list is **not** a list of completed P2 solves. In particular, the current canonical branch status records the bounded 7x6 P2 attempt as a clean timeout with no observed root W/D/L. A profile may compare a completed result with the expected/oracle value only after the solve actually completes.

Intermediate scaling geometries without a separately frozen root oracle still produce exact BSFP results when they complete, but completion alone does not create an independent-oracle claim.

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

## Next semantic compression seam

Before increasing frontier capacity merely to accommodate growth, measure whether the growth is caused by distinctions that collapse under q.

A q-native successor experiment should compare, on the same bounded complete controls:

```text
P2 ownership-antichain frontier
vs
q-keyed explicit dynamic-programming frontier
vs
symbolic q-region / predecessor frontier
```

Required measurements:

- exact root and all-frontier agreement;
- number of physical/ownership records represented;
- distinct q identities represented;
- q-equivalent records merged;
- candidate products avoided before materialization;
- extra cost of q construction/canonicalization;
- peak frontier width and wall time.

Do not replace P2 with q merely because q is smaller in theory. Promotion requires exact replay and net solver economics.

## Promotion / rejection rule

If P2 makes 5x5 and 6x5 dramatically faster and the time split shows GPU pair reduction dominates, widen batching and move directly toward 7x6.

If host structural preparation/finalization dominates after CUDA removes pair reduction cost, move those Connect4-owned transforms into a rank/shard Device-JS kernel while preserving the same exact recurrence.

If frontier capacity or surviving frontier width—not execution throughput—becomes the wall, shift compression effort toward WSL-625/CPC/NDC rather than hiding the growth with larger allocations.
