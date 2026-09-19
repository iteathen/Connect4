# Connect4 CUDA-BSFP Status

**Updated:** 2026-09-19  
**Lane:** CUDA-BSFP exact solver  
**Canonical branch:** `solver/cuda-bsfp`  
**State:** bounded q/RBA reference and identity audit qualified; economics gate retains P2; NDC proof seam remains open; 7x6 root still unsolved

## Mission

Solve standard empty-board 7x6 Connect Four to exact W/D/L extremely fast with backward symbolic fixed-point computation. This lane is not minimax, alpha-beta, MCTS, proof-number search, recursive legal-move traversal, or a full colored-state solve table.

## Durable ownership

This branch is the durable CUDA-BSFP implementation head under `docs/decisions/2026-09-17-closed-durable-lane-topology.md`.

Connect4 owns BSFP semantics, terminal/first-win behavior, exact residual/frontier equality, product state identity, solver-specific recurrence/composition and qualification. Generic scalable scan/order/group/unique/compaction/antichain algorithms belong in CUDA-Algorithms; runtime/compiler/device mechanisms belong in CUDA-JS. All durable Connect4 research—including BSFP-specific hypotheses, research results, negative results, and research evidence—routes through `research/semantic-quotient`. This branch owns CUDA-BSFP implementation and implementation qualification only.

## Retained qualified milestones

- P1 — native physical CUDA correctness slice.
- B1 — packed42 subset/dominance throughput qualification.
- C1 — device-owned compact recurrence with exact bounded frontier agreement.
- O1 — native packed42 OQS cofactor qualification.
- O2 — bounded native 7x6 selected-seed first-cut qualification.
- O3 — native exact residual-pair reuse plus crossing-occurrence mapping.

These remain bounded milestones. They do not establish a complete empty-board 7x6 solve.

## Update-pass readiness — 2026-09-19

The bounded implementation pass consumed research revision 104abfbe4444fcd315ac807b46ce2be8da13df39 without changing research authority or P2.

Current contract:

```text
ordinary gameplay/value carrier:
    q / support-local residual fiber

ordinary exact value:
    C4-0008 Bellman fixed point
    candidate boundary-native RBA realization

stronger proof/certificate closure:
    optional C4-0007 NDC context
```

The new alignment decision is:

- `docs/decisions/2026-09-19-bsfp-rba-update-alignment.md`.

Frozen IsoGraph authority 1.1 remains unchanged. Current RBA overlay/QU/topology and rank27+ checkpoints on `research/semantic-quotient` are post-1.1 successor research evidence; the update pass may consume them only with an exact revision pin and qualification.

Readiness disposition:

```text
P2 exact baseline                         READY
BSFP W/D/L semantics                     READY
gameplay / representation / proof keys   READY
q/RBA ordinary-value candidate           BOUNDED CPU REFERENCE QUALIFIED
same-input economics gate                RETAIN P2; DO NOT PROMOTE RBA TO GPU
NDC guarded-obligation / proof bridge    OPEN SIDE SEAM
empty-board 7x6                           UNSOLVED
current-head CI/qualification refresh    REQUIRED BEFORE PROMOTION
```

Implementation and qualification:

- Native residual boundary construction in components/bsfp/rba-wdl-reference.mjs:
  exact cofactor adjoints, terminal handling, Upper/Lower WDL fronts and local
  skyline composition; no q-interior or physical-state enumeration in the solver.
- Complete 4x3 physical/q agreement, complete 2x2 abstract-fiber agreement,
  and 608 research boundary hashes across two rank-33 cones.
- Explicit identity profiles and negative proof-context controls under #61.
- Exact minimal-generator cover optimization reduced measured 4x3 RBA median
  from 862.14 to 756.34 ms and closed the larger rank-33 cone under the unchanged
  two-million-candidate bound.
- P2 CPU control median 21.83 ms versus RBA 756.34 ms: retain P2. These are
  same-input CPU comparisons, not fresh native-GPU timings.
- All 127 repository Node tests passed. No current-head native/CI promotion
  claim is made; the native P2 path and its limits are unchanged.

See docs/qualification/bsfp-rba-reference.md and
docs/qualification/bsfp-identity-audit.md for contracts, commands and evidence.
NDC #63 remains unresolved under C4-0007 section 5B; ordinary WDL does not
discharge its missing proof guards.

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

For the retained P2 baseline, the large-case path is no longer blocked by the old frontier-capacity defect; remaining cost is dominated by large exact normalization/recovery work and serial host orchestration/finalization.

The bounded q/RBA update pass did not improve total economics over P2 on the
complete small-game controls. It remains a reproducible CPU reference.
Earlier-rank scaling, representative larger-input economics, and a justified
GPU specialization remain opportunities, not qualified performance claims.

The next scalable capabilities should be owned at their natural layer:

- CUDA-Algorithms #11 — scalable exact segmented packed normalization / grouping / compaction;
- CUDA-Algorithms #12 — core-relative absorption before full Cartesian materialization, if accepted and qualified.

Connect4 should supply exact BSFP semantics/fixtures and consume public generic capabilities rather than reimplement generic GPU algorithms privately.

## Parallel/open seams

- OQS dense-ID/device-layer chaining remains a valid independent BSFP track.
- q/RBA boundary-native ordinary-value work is the primary new update-pass comparison and must remain adjacent to the unchanged P2 baseline until qualified.
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
