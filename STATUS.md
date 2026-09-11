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
- B1: about 35.35 billion exact packed42 subset checks/s.
- C1: complete device-owned compact recurrence with exact all-frontier agreement on 4x3, 4x4 and 5x5.
- O1: native packed42 OQS cofactor qualification.
- O2: native bounded 7x6 selected-seed first-cut qualification; not a complete quotient or root solve.
- **O3: native exact residual-pair reuse plus crossing-occurrence mapping qualification.** Q1 run `20260911T050640911Z-b3554293` passed all 4x4 controls and the selected 7x6 cut-five A/B layer on the GTX 1660 Ti. Historical evidence PR #30 is closed after exact subtree/ancestry consolidation into this branch.

## O3 result

The selected 7x6 cut retains all **8,192 logical outputs** while performing only **128 distinct residual/input transforms**.

Measured samples excluding warmup:

| Representation | Submit/wait samples (ms) | Median submit/wait | Median upload | Median readback | Allocated device arrays |
| --- | --- | ---: | ---: | ---: | ---: |
| Unfactored | 8.3013, 11.3893, 9.9435 | 9.9435 ms | 15.6443 ms | 76.5544 ms | 151,290,024 B |
| Factored | 1.2580, 1.1091, 6.8013 | 1.2580 ms | 3.4860 ms | 4.2034 ms | 2,781,876 B |

For this bounded layer the median submit/wait ratio is **7.904x** and allocated device arrays shrink **54.384x**. Because the third factored sample is slower, the ratio of the three-sample submit/wait sums is **3.232x**. Treat this as a bounded A/B result, not a stable general throughput or complete-solve forecast. The two resident 7x6 plans required about 952.067 ms setup in the qualification run.

O3's two Q1 cases completed in about 2.845 s (4x4) and 10.361 s (bounded 7x6), including fixture construction, verification and cleanup. All 96 local tests passed; expanded portable/reuse CI run `34564683731` passed. All 17 published evidence payload hashes/Git blobs matched.

## O3 interpretation

O3 establishes this solver composition seam:

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

What O3 does **not** provide yet:

- pair IDs are still supplied by the CPU fixture rather than synthesized/grouped on device;
- output residual records are not yet grouped/uniqued into dense next-pair IDs;
- dense next-state IDs are not yet emitted;
- the next OQS layer is not yet chained entirely on device;
- complete 7x6 quotient synthesis and root W/D/L are not claimed.

## Current blocker / next seam

The next production seam is **device-resident exact output-pair grouping, variable-length record compaction, dense pair/state ID assignment, and next-layer chaining**.

Connect4 should expose exact residual descriptors and consume the IDs; it should not hide generic scalable sort/group/unique infrastructure locally. At pinned CUDA-Algorithms revision `48ee0aec9acae7776950f03ab52ab1737e598b6e`, maintained stable select/order realizations are correctness-first quadratic implementations with no scalability claim. The generic scalable mechanism must be established under CUDA-Algorithms ownership before broadening the OQS layer chain.

## Parallel C1 track

The earlier C3 cause profiling and B2 legacy-vs-bucketed normalizer track remains preserved as an independent diagnostic/fallback path. It is not the current OQS continuity owner.

## Research boundary

The latest mixed historical OQS checkpoint is `c8be6474e329e08b0b09304e92dd99706e13adf7`; its O3 implementation source is `5dfe1312a357c48eee53168e82fd6eba27814a06`. CUDA-owned implementation/evidence is curated here, while solver-neutral residual-pair semantics and global reuse questions remain on `research/semantic-quotient`. Both canonical lanes preserve the mixed checkpoint as ancestry.

Frozen OQS/R3 prototype files in this branch are qualification/reproduction oracles, not a competing research owner.

## Non-claims

- empty-board 7x6 is not yet solved by complete CUDA-BSFP closure;
- no exact-distance result is claimed by BSFP;
- O3 does not prove global residual interning across arbitrary supports/cuts;
- no CPU timing ratio or bounded O3 A/B ratio is a complete-solve speedup claim.
