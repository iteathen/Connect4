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

| Representation | Submit/wait samples (ms) | Median submit/wait | Median upload | Median readback | Allocated device arrays |
| --- | --- | ---: | ---: | ---: | ---: |
| Unfactored | 8.3013, 11.3893, 9.9435 | 9.9435 ms | 15.6443 ms | 76.5544 ms | 151,290,024 B |
| Factored | 1.2580, 1.1091, 6.8013 | 1.2580 ms | 3.4860 ms | 4.2034 ms | 2,781,876 B |

For this bounded layer the median submit/wait ratio is **7.904x** and allocated device arrays shrink **54.384x**. The ratio of the three-sample submit/wait sums is **3.232x** because the third factored sample is slower. These are bounded A/B measurements, not a stable general throughput or complete-solve forecast. O3's two Q1 cases completed in about 2.845 s (4x4) and 10.361 s (bounded 7x6), including fixture construction, verification and cleanup. All 96 local tests passed; expanded portable/reuse CI run `34564683731` passed. All 17 published evidence payload hashes/Git blobs matched.

## O3 interpretation

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

O3 does not yet synthesize pair IDs on device, group/unique output residual records into dense next-pair IDs, emit dense next-state IDs, or chain the next OQS layer entirely on device. Complete 7x6 quotient synthesis and root W/D/L remain unclaimed.

## CUDA-Algorithms producer evidence

The first generic producer-side scan experiment has now been verified directly in CUDA-Algorithms rather than accepted from the old mixed Connect4 branch as authority.

- isolated branch: `codex/oqs-segment-scan`
- exact experimental source: `7d923eb5e4bf4664feab0d0d7c3dded2f81e15b3`
- evidence checkpoint: `3aa4f6eb4ee434d82835fe9e9daabafd31dcc0d1`
- owner issue: CUDA-Algorithms #9, **Qualify checked device scans for segment IDs and compact record offsets**
- native evidence: 72 fixture checks / 84 submissions pass; exported OQS cut-five sequence produces exactly 48 CPU-established groups and 10,597 records from 128 payloads
- median submit/wait: 0.4901 ms at 128 entries, 0.6262 ms at 8,192, 0.8847 ms at 65,536, and 0.9921 ms at 262,144
- largest device buffers: 11,603,100 bytes
- portable/reference CI `34565710334` passed at the exact native source

This is **producer evidence, not an adopted CUDA-Algorithms API**. The Connect4 dependency pin remains `48ee0aec9acae7776950f03ab52ab1737e598b6e`. No CUDA-JS mechanism gap was found for this bounded hierarchical checked-scan realization. Exact residual equality/ordering, payload copying, supported public composition and full OQS chaining remain open.

## Current blocker / next seam

The next production seam is **device-resident exact residual ordering/group-boundary generation plus supported checked scan/select, variable-length record compaction, dense pair/state ID assignment, and next-layer chaining**.

Connect4 must provide exact residual descriptors/equality and consume dense IDs; it must not hide generic scalable sort/scan/group infrastructure locally. CUDA-Algorithms #9 now owns qualification of the checked scan/select producer capability, while broader scalable ordering/grouping remains under CUDA-Algorithms ownership. Hash ordering alone is not exact equality: complete collision handling must place all equal residuals into the same exact group before IDs are assigned.

## Parallel C1 track

The earlier C3 cause profiling and B2 legacy-vs-bucketed normalizer track remains preserved as an independent diagnostic/fallback path. It is not the current OQS continuity owner.

## Research boundary

The latest mixed historical OQS checkpoint is `54d63ae9a066dba42b2748b3ad51353611a2c52a`; its O3 implementation source is `5dfe1312a357c48eee53168e82fd6eba27814a06`. The latest checkpoint adds dependency evidence only; it introduces no new Connect4 algorithmic code. CUDA-owned implementation/evidence is curated here, while solver-neutral residual-pair semantics and global reuse questions remain on `research/semantic-quotient`. Both canonical lanes preserve the mixed checkpoint as ancestry.

Frozen OQS/R3 prototype files in this branch are qualification/reproduction oracles, not a competing research owner.

## Non-claims

- empty-board 7x6 is not yet solved by complete CUDA-BSFP closure;
- no exact-distance result is claimed by BSFP;
- O3 does not prove global residual interning across arbitrary supports/cuts;
- the isolated CUDA-Algorithms scan experiment is not a supported dependency API;
- no bounded O3 or scan timing is a complete-solve speedup claim.
