# Connect4 CUDA-BSFP Status

**Updated:** 2026-09-10  
**Lane:** CUDA-BSFP exact solver  
**Canonical branch:** `solver/cuda-bsfp`  
**Superseded branch name:** `feature/cuda-bsfp`

## Mission

Solve standard empty-board 7x6 Connect Four to exact W/D/L extremely fast with backward symbolic fixed-point computation. This lane is not minimax, alpha-beta, MCTS, proof-number search, recursive legal-move traversal, or a full colored-state solve table.

## Protected base and dependencies

```text
accepted base:     main
CUDA-Algorithms:   48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:           98e2ebc942c14d63acf4dd82e912dd548c363a05
package:           cuda-js@0.1.0-alpha.20
```

Connect4 owns BSFP semantics, terminal/first-win behavior, product state identity and qualification. Consumer-neutral GPU algorithms remain CUDA-Algorithms-owned; runtime/compiler/device mechanisms remain CUDA-JS-owned.

## Qualified milestones

- P1: first physical CUDA-BSFP correctness slice on GTX 1660 Ti.
- B1: about 35.35 billion exact packed42 subset checks/s; the raw two-u32 subset predicate is not the first scaling wall.
- C1: complete device-owned compact recurrence with exact all-frontier agreement on 4x3, 4x4 and 5x5.
- Official C1 5x5: about 3.30 s submit/wait and 3.57 s warm solve wall versus about 11.66 s for the same-machine CPU reference including its qualification observer.
- O1: packed42 CUDA OQS cofactor profile qualified natively; its exact generated Q1 evidence is consolidated under `docs/evidence/cuda-bsfp/qualification/20260911T032754503Z-b0df94a3/`.
- O2: bounded native 7x6 OQS seed-slice profile qualified on GTX 1660 Ti; exact Q1 evidence is consolidated under `docs/evidence/cuda-bsfp/qualification/20260911T043015870Z-2d8e0785/`.

O2 is intentionally narrow. It does **not** establish full 7x6 quotient synthesis, BSFP closure, root W/D/L, or complete solver performance.

## OQS implementation ownership

The CUDA-specific OQS implementation is now owned here rather than by the former mixed `research/zdd-transfer-20260910` branch:

- `components/bsfp/cuda/oqs-cofactor-42-{layout,plan,program}.mjs`;
- `components/bsfp/test/oqs-cofactor.test.mjs`;
- `docs/specs/profiles/C4-0009-O1-oqs-cofactor-42-v0.md`;
- `docs/specs/profiles/C4-0009-O2-oqs-7x6-seed-slice-v0.md`;
- `experiments/cuda-bsfp-oqs-cofactor/`;
- O1/O2 qualifier profile integration.

The O1/O2 experiment depends on an exact incremental-OQS/R3 reference oracle. A frozen exact copy of that research oracle remains under `reference/research-prototypes/2026-09-10-{oqs,zdd-transfer}/` on this solver branch **for qualification/reproduction only**. Active semantic/OQS research evolution belongs to `research/semantic-quotient`.

## Current OQS seam

Latest shared research established that many crossing states reuse the same exact residual pair. On the bounded 7x6 prefix, 8,192 logical states could collapse to only 48 distinct exact residual pairs after six cuts, and optional exact residual-cofactor reuse reduced observed CPU cofactor evaluations from 11,056 to 624 while preserving exact layers.

The next CUDA/OQS implementation question is therefore **factor residual-pair storage/transforms from crossing-state storage** and map states through exact pair IDs. Generic grouping/compaction remains CUDA-Algorithms-owned rather than being hidden inside Connect4.

## Independent C1 fallback/performance seam

The earlier 6x5 C1 scaling wall remains valid evidence. Native C3 cause profiling and B2 bucketed-normalizer A/B remain available production-adjacent work for the C1 path; they are independent of the OQS factorization direction and should not be silently discarded.

## Research boundary

Cross-solver representation research no longer uses this lane as its continuity owner. Shared questions such as minimum-description game state, identified-line quotienting, future-behavior equivalence, residual-class construction, OQS seed scaling and residual-pair factorization semantics belong on `research/semantic-quotient`.

The former `research/zdd-transfer-20260910` head `e04cee12bc24cda63fcf889eb4ca2137837f86bf` has been preserved as ancestry of the curated OQS handoff rather than remaining an implementation owner.

## Non-claims

- empty-board 7x6 is not yet solved by complete CUDA-BSFP closure;
- O2 is not a complete 7x6 solve or full OQS build;
- no exact-distance result is claimed by BSFP;
- shared semantic research is not automatically production architecture;
- no consumer-neutral grouping/compaction semantics are moved into Connect4 merely for convenience.
