# Connect4 CUDA-BSFP Status

**Updated:** 2026-09-17  
**Lane:** CUDA-BSFP exact solver  
**Canonical branch:** `solver/cuda-bsfp`  
**State:** P2 compact-hybrid correctness/capacity repairs qualified and promoted; 7x6 root still unsolved

## Mission

Solve standard empty-board 7x6 Connect Four to exact W/D/L extremely fast with backward symbolic fixed-point computation. This lane is not minimax, alpha-beta, MCTS, proof-number search, recursive legal-move traversal, or a full colored-state solve table.

## Durable ownership

This branch is the durable CUDA-BSFP implementation head under `docs/decisions/2026-09-17-closed-durable-lane-topology.md`.

Connect4 owns BSFP semantics, terminal/first-win behavior, exact residual/frontier equality, product state identity, solver-specific recurrence/composition and qualification. Generic scalable scan/order/group/unique/compaction/antichain algorithms belong in CUDA-Algorithms; runtime/compiler/device mechanisms belong in CUDA-JS. Shared solver-neutral mathematics routes through `research/semantic-quotient`.

## Retained qualified milestones

- P1 — native physical CUDA correctness slice.
- B1 — packed42 subset/dominance throughput qualification.
- C1 — device-owned compact recurrence with exact bounded frontier agreement.
- O1 — native packed42 OQS cofactor qualification.
- O2 — bounded native 7x6 selected-seed first-cut qualification.
- O3 — native exact residual-pair reuse plus crossing-occurrence mapping.

These remain bounded milestones. They do not establish a complete empty-board 7x6 solve.

## Current promoted P2 implementation

The 2026-09-16 P2 pass repaired and qualified the actual compact-hybrid recurrence rather than only an isolated primitive.

Promoted repairs:

- corrected an incorrectly bound loss-cofactor `else`;
- removed host argument-stack failure on large valid frontiers;
- fixed a real bucketed histogram initialization race with the required block barrier;
- partitioned oversized support intersections into complete bounded rectangles instead of failing at one GPU batch limit;
- hardened timeout/safety telemetry and progress accounting;
- added exact full-frontier qualification controls over the actual recurrence.

Promoted optimizations/selections:

- horizontal reflection representative evaluation with exact transport back to physical coordinates;
- exact restricted cofactor-preservation skips where normalization is provably unchanged;
- bucketed cardinality normalization for ordinary and recovery paths;
- generated packed candidates retained on device for recovery;
- active-slab readback rather than full reserved-slab readback;
- packed bucketed overflow recovery selected for the current solver.

Tensor and legacy strategies remain explicit controls. Tensor is **not** the selected production overflow route.

## Current qualification evidence

Local/CI:

- branch promotion PR #53 passed `verify`, `strength-evidence`, `benchmark-evidence`, `bsfp-portable`, `bsfp-scaling`, `bsfp-clause-coverage-experimental`, and `bsfp-tensor-overflow-portable`;
- branch evidence records 118 Node tests passing;
- native full-frontier controls match independent reference frontiers on 4x3 c3, 4x4 c4 and 5x5 c4;
- dedicated mixed-direction histogram-reuse controls and forced-capacity tiling/recovery controls pass.

Bounded 7x6:

- the old 1,024-record overflow boundary is crossed and recovered;
- the run reaches a clean case timeout rather than a capacity/runtime failure;
- last persisted progress reached rank 36 in the recorded run;
- no `rootWdl` was produced;
- therefore no complete 7x6 solve or solve-time forecast is claimed.

Durable evidence:

- `research/cuda-bsfp/2026-09-16-p2-sanity/`
- `research/cuda-bsfp/2026-09-16-issues/`

Retained failed runs remain failures; later repairs do not rewrite them.

## Measured selection evidence

On two captured real overflow fixtures, every measured method/result matched an independent exact replay oracle. The selected packed stack materially outperformed the old Tensor stack on those same-input controls. The recorded 5x5 full-frontier observation also reduced wall time and generated work after reflection/cofactor/bucketed integration.

These are bounded measurements, not a universal speedup distribution or a 7x6 solve forecast.

## Current bottleneck

The large-case path is no longer blocked by the old frontier-capacity defect. Remaining cost is dominated by large exact normalization/recovery work and serial host orchestration/finalization.

The next scalable capabilities should be owned at their natural layer:

- CUDA-Algorithms #11 — scalable exact segmented packed normalization / grouping / compaction;
- CUDA-Algorithms #12 — core-relative absorption before full Cartesian materialization, if accepted and qualified.

Connect4 should supply exact BSFP semantics/fixtures and consume public generic capabilities rather than reimplement generic GPU algorithms privately.

## Parallel/open seams

- OQS dense-ID/device-layer chaining remains a valid independent BSFP track.
- Clause legal-slice / coverage research remains a separate representation qualification problem; it is not silently substituted for P2's full Boolean ownership domain.
- Host structural/cofactor/union/finalization cost should be measured and reduced after the dominant normalization path is addressed.
- Device-resident semantic progression remains the intended direction where exact contracts permit it.

## Non-claims

- empty-board standard 7x6 is not yet solved by complete CUDA-BSFP closure;
- no exact-distance result is claimed;
- clean timeout is not correctness of the unfinished suffix;
- no lower-layer CUDA-JS or CUDA-Algorithms defect is inferred merely from consumer cost;
- high device utilization is not occupancy/bandwidth efficiency evidence;
- no bounded timing is a complete-solve speedup claim.
