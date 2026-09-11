# Connect4 Status

**Updated:** 2026-09-11 UTC
**Active lane:** research/zdd-transfer-20260910 — Offline Quotient Synthesis

Goal: exact, extremely fast empty-board standard 7x6 connect-4 W/D/L through
CUDA-BSFP. This is symbolic solving, not legal move-tree search.

## Current evidence

R1 falsified crossing assignment alone as complete state. R3 established exact
residual-class transition stability on tested controls; R4 qualified a flat
transfer artifact. R5 located the cost in repeated semantic layer discovery.
R6 replaces rediscovery with previous exact quotient plus at most four introduced
ownership bits, exact cofactor candidates, and exact deduplication.

The original R6 job 103111963716 has now been read and its metrics preserved in
[the R6 record](docs/research/2026-09-10-r6-incremental-oqs-results.md). It includes
17,948 independent layer checks and 478,657 direct-cofactor checks. The three
additional 5x5 supports have weaker independent R5 count-check scope; do not
present them as independently rebuilt layer parity.

The new O1 bounded CUDA cofactor slice reuses packed42 antichain collectives.
Local Q1 passed all 220,744 candidates across 112 transitions for 5x5 supports
4426, 4743, 6351 and 6465 in baseline and antichain-preserving modes. Every
candidate's crossing and Win/Loss sets matched JS and covered the reference next
quotient. Selected small supports and 4426 also rebuild independent R3 layers.
Official clean-source publication is the remaining qualification transaction.

The preservation shortcut has a formal set-order argument and exhaustive checks
on all 168 four-bit antichains. Local 5x5 submit/wait was 451.255 ms baseline and
285.352 ms optimized; this single pass is not an end-to-end OQS speedup. Readback
cost about 2.25 s per mode and initial C1 seed construction 38.49 s.

[O1 profile](docs/specs/profiles/C4-0009-O1-oqs-cofactor-42-v0.md) and
[assessment, proof and measurements](docs/research/2026-09-11-oqs-cuda-cofactor-qualification.md)
define the exact scope. All 90 integrated tests pass. Portable execution proves
composition/lifecycle only, never native numerical parity.

## Next seam and limits

GPU grouping, dense IDs, compact record output and device layer chaining remain
unimplemented. CUDA-Algorithms' pinned select/order realization is quadratic and
has no scalability claim. Route scalable sequence/grouping requirements to its
existing issue #3; keep exact residual equality and Connect4 semantics here.
Ordering by hash alone is insufficient: complete collision handling must place
all equal residuals in one exact group before assigning IDs.

C1 seed construction remains a separate costly prerequisite. No full device OQS
or empty7x6 root result is claimed. A bounded 7x6 slice needs an exact seed and a
measured finite envelope before admission; O1 currently refuses 7x6.

Exact unchanged dependencies:

- CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
- CUDA-JS: 98e2ebc942c14d63acf4dd82e912dd548c363a05 (0.1.0-alpha.20)

The older feature/cuda-bsfp lane and its C1/C3/B2 evidence remain separate and
unchanged. Its inherited status is preserved in Git at 0b1d67e; it is not the
active OQS plan. No production-lane reducer migration is part of this change.

## Retained continuation state

The OQS worktree, package junctions, ignored raw R6 logs and Q1 spools are retained
for reproducibility/continuation. No lower-repository source changes or persistent
GPU allocations are intended. Official evidence uses Q1 append-only branch/PR
publication; source work stays on the research branch, with no main merge.
