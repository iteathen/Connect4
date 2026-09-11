# Connect4 CUDA-BSFP Status

**Updated:** 2026-09-10  
**Lane:** CUDA-BSFP exact solver  
**Canonical branch:** `solver/cuda-bsfp`  
**Superseded branch names:** `feature/cuda-bsfp`, `research/zdd-transfer-20260910`

## Mission

Solve standard empty-board 7x6 Connect Four to exact W/D/L extremely fast with backward symbolic fixed-point computation. This lane is not minimax, alpha-beta, MCTS, proof-number search, recursive legal-move traversal, or a full colored-state solve table.

## Ownership

Connect4 owns BSFP semantics, terminal/first-win behavior, exact residual equality, product state identity, OQS solver-specific composition and qualification. Generic scalable scan/order/group/unique/compaction belongs in CUDA-Algorithms; runtime/compiler/device mechanisms belong in CUDA-JS. Shared quotient mathematics and behavioral-equivalence research continue on `research/semantic-quotient`.

## Qualified production-adjacent milestones

- P1: first physical CUDA-BSFP correctness slice on GTX 1660 Ti.
- B1: about 35.35 billion exact packed42 subset checks/s; the raw two-u32 subset predicate is not the first scaling wall.
- C1: complete device-owned compact recurrence with exact all-frontier agreement on 4x3, 4x4 and 5x5.
- O1: native packed42 OQS cofactor qualification.
- O2: native bounded 7x6 selected-seed first-cut qualification; not a complete quotient or root solve.
- **O3: native exact residual-pair reuse + crossing-occurrence mapping qualification.** Q1 run `20260911T050640911Z-b3554293` passed 4x4 and the selected 7x6 reuse cut on the GTX 1660 Ti. The 7x6 bounded case retained all 8,192 logical outputs while transforming only 128 distinct residual/input pairs. The generated evidence is consolidated under `docs/evidence/cuda-bsfp/qualification/`.

O3 observed Q1 case walls were about 2.845 s for 4x4 and 10.361 s for the bounded 7x6 case, with admitted device bounds of 264 MiB and 402 MiB respectively. Those are qualification-case timings, not a full-solve forecast.

## O3 interpretation

O3 establishes the solver composition seam we wanted:

```text
crossing-state occurrences
        |
        v
exact residual-pair IDs
        |
        +--> cofactor each distinct pair/input once
        |
        v
map every occurrence/input back to exact output slots
```

The selected 7x6 layer reduces the cofactor-transform domain from 8,192 logical outputs to 128 distinct residual/input transforms while preserving every logical occurrence. The source commit also cuts the bounded representation's raw device arrays from roughly 151.3 MB unfactored to 2.78 MB factored before fixed runtime allowance.

What O3 does **not** provide yet:

- pair IDs are still supplied by the CPU fixture rather than synthesized/grouped on device;
- output residual records are not yet grouped/uniqued into dense next-pair IDs;
- dense next-state IDs are not yet emitted;
- the next OQS layer is not yet chained entirely on device;
- complete 7x6 quotient synthesis and root W/D/L are not claimed.

## Current blocker / next seam

The next production seam is device-resident exact grouping and dense-ID assignment for OQS successor residual pairs, followed by layer chaining. Connect4 should expose the exact residual descriptors and consume dense IDs; it should **not** hide a generic scalable sort/group/unique implementation locally.

At the pinned CUDA-Algorithms revision, maintained stable select/order implementations are correctness-first quadratic realizations with no scalability claim. Before broadening 7x6, either CUDA-Algorithms must acquire a scalable generic sequence/grouping implementation through its accepted architecture, or an already accepted generic CUDA primitive path must be demonstrated there.

## Parallel C1 track

The earlier C3 cause profiling and B2 legacy-vs-bucketed normalizer track remains preserved as an independent diagnostic/fallback path. It is not the current OQS continuity owner.

## Research boundary

The latest mixed historical OQS source handoff is `5dfe1312a357c48eee53168e82fd6eba27814a06`. CUDA-owned O1/O2/O3 implementation has been curated here. Solver-neutral residual-pair meaning, global reuse questions, minimum-description state and behavioral quotients remain on `research/semantic-quotient`.

Frozen OQS/R3 prototype files in this branch are qualification/reproduction oracles, not a competing research owner.

## Non-claims

- empty-board 7x6 is not yet solved by complete CUDA-BSFP closure;
- no exact-distance result is claimed by BSFP;
- O3 does not prove global residual interning across arbitrary supports/cuts;
- no CPU timing ratio is a CUDA/full-solve speedup claim.
