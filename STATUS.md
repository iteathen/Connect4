# Connect4 Status

**Updated:** 2026-09-07
**Phase:** qualified incumbent Node + solved-strength baseline / CUDA-MCGS public-composition assessment next

## Product role

Connect4 is the product-owned Node benchmark/validation lane for Connect Four search. It owns Connect Four domain/evaluator/benchmark meaning and consumes CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS only through public surfaces.

## Qualified incumbent foundation

C4-0001 through C4-0004 establish:

- canonical standard 7×6 benchmark-domain semantics while incumbent machinery remains dimension-parameterized;
- the frozen optimized incumbent evaluator, including live-line positional value, parity reasoning and repeated-immediate frontier promotion;
- explicit-root-player low-allocation alpha-beta with tactical prepass;
- fixed-size persistent cross-move TT with perspective/depth-qualified score reuse and ordering-only reuse of otherwise-ineligible best moves;
- exact legacy evaluator/search/self-play conformance;
- fixed-request persistent-vs-reset and fixed-wall-clock Node benchmark protocol.

Protected `main@33888bee6cf8d3e1941ad53819ef24a1432a2244` passed post-merge `verify` run **34116478402**.

The reference Node 26.7 benchmark run remains **34116027347** at source `5ca077c2073b7e5e4432c9267da729836efbacb0`: persistent TT completed the frozen depth-8 reroot workload with **501,027 nodes / 289,914 evaluator calls / 480.55 ms**, versus reset-each-root at **624,351 / 371,565 / 542.69 ms**, with the same decision checksum. This is exact-runner evidence, not a universal CPU performance claim.

## C4-0005 solved-game strength qualification

C4-0005 adds a separate exact 7×6 numerical oracle used only for strength/correctness evidence. It does not import or reuse the incumbent evaluator, alpha-beta implementation, TT, or product-domain class.

External parent scores are Pascal Pons strong-solver benchmark checkpoints. Matching test-set bytes were independently observed in two unrelated public GitHub mirrors at fixed revisions before corpus generation. Oracle-generated per-column action labels are admitted only after exact parent-score parity.

At candidate source `952cf15dfc86e08abdc86e508025a056c8865687` under exact Node **26.7.0**:

- `verify` run **34122018213** passed **27/27** tests;
- all **158/158** external Pons parent strong-score checkpoints matched exactly;
- all 128 deterministic calibration action-score vectors and all 30 separately labeled beginning spot-check vectors regenerated exactly;
- `strength-evidence` run **34122018076** passed and reproduced the local strength evidence exactly;
- incumbent `benchmark-evidence` regression run **34122018187** also passed.

### Deterministic 128-position calibration

The first 64 `Test_L3_R1` plus first 64 `Test_L2_R1` positions reach:

- depth 6: **127/128** exact-strong optimal, **128/128** W/D/L preserved;
- depth 7: **126/128** exact-strong optimal, **127/128** W/D/L preserved;
- depths 8–12: **128/128** exact-strong optimal and **128/128** W/D/L preserved.

The depth-4 and depth-7 regressions demonstrate that strength is not monotonically increasing at every fixed horizon. This calibration corpus is not evidence that depth 8 is globally perfect.

### Beginning spot checks

The 30 beginning positions are deliberately selection-biased/cost-bounded and remain reported separately. At depth 12 they are **28/30** exact-strong optimal and **29/30** W/D/L preserving. Therefore depth 12 is demonstrably **not perfect** on the solved evidence.

Known solved defect:

`54676552255627`

Per-column strong scores: `[1, 2, -2, -5, 1, -2, -14]`.

At depth 12 incumbent v1 chooses one-based column 3 (`-2`), converting a solved win into a solved loss. It first selects exact-optimal one-based column 2 (`+2`) at depth 19 and remains correct through the locally checked deeper seam.

Both `legacy-qualified` fixed-depth and production persistent-ordering policies make the same choices through the investigated correction seam, falsifying cross-move TT ordering as the cause. The evidence points to a horizon/evaluator-search limitation.

A controlled experiment removing only the repeated-immediate promotion produced mixed solved-corpus gains and regressions and did not improve the eventual correction depth. C4-0002 therefore remains unchanged; no evaluator replacement has demonstrated uniform dominance.

## Next executable seam

Assess the **public** CUDA-MCGS composition required to express the Connect4 comparison lane, read-only first:

1. inspect current protected CUDA-MCGS/public package state and relevant public evaluator/search/session contracts;
2. map C4-0002/C4-0004/C4-0005 requirements onto public composition points;
3. identify any dependency gap without pushing Connect4 semantics upstream;
4. freeze a Connect4-owned comparison contract only if the existing public dependency is sufficient.

**CUDA-MCGS issue #124 remains paused.** This next seam does not authorize resuming it or mutating CUDA-MCGS.

## Repository governance

Governance alignment remains separately tracked by issue #3. `main` was still unprotected at the latest live readback; product CI success does not complete repository-policy alignment.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four comparison lane exists yet;
- perfect performance on the 128-position calibration corpus does not establish global perfect play at depth 8;
- the 30 beginning spot checks are explicitly non-representative;
- the repeated-immediate behavior is not proven either necessary or defective in isolation;
- no Python or cross-language comparison is in scope for the first benchmark gate.
