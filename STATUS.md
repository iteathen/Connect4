# Connect4 Status

**Updated:** 2026-09-09
**Phase:** CUDA-BSFP formalization complete enough for first consumer-backed GPU slice; incumbent search lane preserved

## Product role

Connect4 is the product-owned Connect Four solver/validation repository. It owns Connect Four domain truth, evaluator/oracle evidence, benchmark fairness, and two intentionally separate exact-solver lanes:

1. the incumbent minimax/alpha-beta/search implementation under `components/incumbent/`;
2. CUDA-BSFP under `components/bsfp/`, using backward symbolic fixed-point proof semantics rather than search semantics.

The lanes may share Connect4-owned domain/oracle authority, but neither may inherit the other solver's internal semantics merely for convenience.

## Protected baseline

Protected `main@de47d43f4f4133a68973d0876a402531ef5735da` preserves the qualified incumbent/search baseline. The later 2026-09-09 BSFP/searchless research lineage was recovered from its research branches and preserved unchanged on `feature/cuda-bsfp` as evidence/provenance rather than rewritten as if it had already been protected-main authority.

## CUDA-BSFP branch

Active development branch:

`feature/cuda-bsfp`

The branch began directly from protected `main@de47d43f4f4133a68973d0876a402531ef5735da` after verifying no pre-existing BSFP implementation branch existed.

The recovered BSFP research packet now lives on the branch together with its original evidence/prototypes. The previously omitted `docs/research/2026-09-09-winspace-results.md` is also restored.

## Formal BSFP specification stack

The earlier research plan has now been promoted into four deliberately separate product specifications:

- `C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural/domain mathematics;
- `C4-0007-nested-dependency-closure-v1.md` — NDC dependency/certificate/fixed-point proof semantics;
- `C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L, terminal axioms, predecessor/fixed-point result meaning and qualification;
- `C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP realization, GPU/Node boundary and CUDA-Algorithms/CUDA-JS composition.

C4-0006 through C4-0008 are branch-local Candidate semantic specifications backed by the preserved research evidence. C4-0009 remains Working until a real physical BSFP-backed GPU vertical slice settles the still-open generic composition details. None is Accepted protected-main authority yet.

The earlier single-file `C4-0006-cuda-bsfp-wdl-v1.md` draft was superseded and removed so structural mathematics, proof semantics, solver semantics and CUDA execution cannot drift together accidentally.

## CUDA-Algorithms dependency seam

CUDA-Algorithms is the reusable provider-neutral algorithm substrate.

Current relevant contracts:

- SPEC-0002 Candidate — plans, active extents, device chaining and semantic status;
- SPEC-0003 Candidate — stable index selection and permutation-first multiword ordering;
- SPEC-0004 Working Draft — bounded worksets and ranked/fixed-point closure.

The CUDA-Algorithms first-profile design already used BSFP/NDC as its primary consumer pressure and deliberately left consumer record/proof/equality semantics outside the library.

Accepted CUDA-JS SPEC-0028 supplies typed Device-JS leaf-library composition for statically typed consumer device functions.

C4-0009 now defines the Connect4 side of that seam.

### Important seam distinction

The generic CUDA-Algorithms ranked-index-closure reference establishes index activation/progression semantics. That alone does **not** evaluate BSFP W/D/L.

CUDA-BSFP additionally requires consumer-owned complete contribution aggregation and existential/universal (or exact equivalent) semantic reduction before a lower-rank target becomes authoritative. Rank completion must therefore mean semantic rank completion, not merely exhaustion of one local work queue/kernel.

## First intended vertical slice

The preferred first physical slice is **4x3 connect-3** because it already has:

- a complete independent physical-game oracle;
- complete direct symbolic BSFP qualification;
- only 256 support skeletons;
- enough full-game structure to exercise win/loss/draw, duplicate/equality behavior, complete rank reduction, capacity boundaries and shard invariance.

The slice should be correctness-first. It is intended to settle the smallest statically bounded BSFP-consumer composition shape for CUDA-Algorithms SPEC-0004, not to establish performance.

## Ownership boundary

Connect4/BSFP retains:

- CPC/WSL/NDC meaning;
- proof-state/record meaning;
- terminal and W/D/L semantics;
- rank meaning and derivation meaning;
- exact equality/canonicalization/dominance;
- existential/universal proof reduction;
- semantic rank completion;
- final product solve result.

CUDA-Algorithms retains generic sequence/workset/ranked-progression mechanics. CUDA-JS retains Device-JS, compiler/linker, views, memory, prepared execution and native lifecycle.

The CUDA-MCGS #124 dependency applies only to the independent CUDA-MCGS/search comparison lane. It does not block CUDA-BSFP.

## Current correctness evidence

Preserved research evidence includes:

- complete direct BSFP solves of 4x3 connect-3, 4x4 connect-4, 5x3 connect-4 and 4x5 connect-4 without recursive minimax or a physical colored-state graph in the direct solve;
- exhaustive differential qualification across **1,681,808 reachable states** and **3,869,237 legal edges** with **0 W/D/L disagreements**;
- independent terminal-boundary qualification over **3,869,237 legal edges**, including **414,691 winning terminal edges** and **96,960 draw-terminal edges**, with no terminal predicate/reconstructed-board mismatch;
- exact W/D/L sign agreement on all eight frozen standard-7x6 BSFP research roots;
- WSL-625/residual-winspace, dominance and backward-attractor evidence retained as representation/proof evidence rather than stronger completion claims.

## Next work

1. Create the isolated `components/bsfp/` production component boundary.
2. Derive the smallest 4x3 consumer record/contribution/rank profile from C4-0006..0009.
3. Project that profile onto CUDA-Algorithms SPEC-0002/0003/0004 using CUDA-JS SPEC-0028 typed composition where it survives implementation.
4. Keep exact equality and BSFP semantic reduction in the consumer; route any missing generic sequence/ranked mechanism back to CUDA-Algorithms.
5. Qualify every device-produced rank/root result against independent Connect4 evidence.
6. Exercise capacity/budget/shard/duplicate/cleanup falsifiers before any promotion.

## Non-claims

- no empty-board standard-7x6 CUDA-BSFP solve is yet claimed;
- no native CUDA-BSFP correctness result is yet claimed;
- no CUDA-BSFP GPU performance result is yet claimed;
- no exact strong-distance BSFP result is yet claimed;
- CUDA-Algorithms SPEC-0004 remains Working Draft;
- C4-0006 through C4-0009 are not yet Accepted protected-main authority;
- the incumbent minimax/search lane is not being replaced or modified by this activation.
