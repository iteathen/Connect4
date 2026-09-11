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
Official clean-source Q1 run 20260911T032754503Z-b0df94a3 qualified 4x3, 4x4
and these 5x5 supports; [evidence PR #21](https://github.com/iteathen/Connect4/pull/21)
is published and its 23 payload hashes verified. Exact native source: 6e30e382.

The preservation shortcut has a formal set-order argument and exhaustive checks
on all 168 four-bit antichains. Official 5x5 submit/wait was 428.384 ms baseline and
280.993 ms optimized; this single pass is not an end-to-end OQS speedup. Readback
cost about 2.22 s per mode and initial C1 seed construction 38.63 s.

[O1 profile](docs/specs/profiles/C4-0009-O1-oqs-cofactor-42-v0.md) and
[assessment, proof and measurements](docs/research/2026-09-11-oqs-cuda-cofactor-qualification.md)
define the exact scope. All 90 integrated tests pass. Portable execution proves
composition/lifecycle only, never native numerical parity.

## Next seam and limits

New [seed/quotient scaling probes](docs/research/2026-09-11-oqs-seed-scaling.md)
show 7x6 frontiers reaching 5,205 records after only 184 completed near-full
supports. The 30.689-second CPU probe stopped before a 2,446,901-pair product,
not on timeout. One selected 7x6 quotient reached 8,192 states after six cuts;
the 6x5 control reached 43,776 states. These are partial reference measurements.
The earlier 16/40-hour arithmetic scenarios are not calibrated solve forecasts.

O2 is a new selected 7x6 first-cut qualification profile: support 470594,
one input state, 16 candidates, 4,096 records per frontier, about 2.16 MB device
payload. Independent R3 layers and native qualification pass in
[evidence PR #28](https://github.com/iteathen/Connect4/pull/28), source 5c298c7e.
Median submit/wait: baseline 18.865 ms, preservation 21.272 ms. O1 remains unchanged
in scope. Use short tests; extend only to resolve a measured timing/growth question.

The new optional CPU residual-cofactor reuse experiment preserves all layers on
all 625 4x4 supports and matching digests for the six common selected 7x6 layers.
That 7x6 prefix takes 3.284 s versus 22.518 s baseline (single instrumented CPU
probe). Reuse reaches 65,536 states after ten cuts in 8.226 s, but those states
share only 180 residual pairs and 17,748 distinct records. Factor residual-pair
storage/transform work from crossing-state storage in the next CUDA composition;
do not extrapolate throughput using duplicated per-state frontier work.
All 94 integrated tests pass after this optional reference experiment.

O3 now implements distinct-pair cofactor transforms followed by every crossing
occurrence's output mapping in one prepared CUDA DAG. Portable 4x4 controls and
7x6 cut five pass; native qualification is pending. Input pair IDs come from the
CPU fixture and output slots remain unmerged. The selected 7x6 layer reduces
8,192 transforms to 128 while retaining all 8,192 outputs, with device arrays
151,290,024 versus 2,781,876 bytes. See
`docs/research/2026-09-11-oqs-cuda-residual-reuse.md` and bounded profile O3.

GPU grouping, dense IDs, compact record output and device layer chaining remain
unimplemented. CUDA-Algorithms' pinned select/order realization is quadratic and
has no scalability claim. The measured sequence/grouping requirements are now
attached to its existing issue #3; exact residual equality stays in Connect4.
Ordering by hash alone is insufficient: complete collision handling must place
all equal residuals in one exact group before assigning IDs.

C1 seed construction remains a separate costly prerequisite. No full device OQS
or empty7x6 root result is claimed. A bounded 7x6 slice needs an exact seed and a
measured finite envelope before admission; O1 still refuses 7x6 and O2 admits
only the frozen seed's first cut.

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
