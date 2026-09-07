# Connect4 Status

**Updated:** 2026-09-07
**Phase:** solved-strength oracle candidate / Node 26 qualification

## Product role

Connect4 is an independent Node benchmark/validation product. It owns Connect Four domain/evaluator/benchmark meaning and consumes generic CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS contracts only through public surfaces.

It is not a CUDA-family semantic library and does not own generic search/runtime/Tensor mechanisms.

## Protected incumbent baseline

`main@33888bee6cf8d3e1941ad53819ef24a1432a2244` protects C4-0001 through C4-0004:

- canonical 7×6 product-domain semantics while incumbent machinery remains dimension-parameterized;
- frozen optimized incumbent evaluator behavior, including repeated-immediate frontier promotion;
- explicit-root-player low-allocation alpha-beta and persistent cross-move TT semantics;
- exact legacy evaluator/search/self-play conformance;
- Node 26.7 persistent-vs-reset benchmark evidence and fixed-wall-clock depth evidence.

Main push `verify` run **34116478402** succeeded after PR #4 merged.

## Solved-strength candidate

C4-0005 adds an independent exact 7×6 numerical oracle used only for solved-game strength evidence. It does not import or reuse incumbent evaluator/search/TT code.

External parent scores come from Pascal Pons benchmark test sets. Matching test-set bytes were independently read in two public mirrors at fixed revisions. The candidate freezes:

- 128 deterministic calibration positions: first 64 `Test_L3_R1` + first 64 `Test_L2_R1`;
- 30 separately labeled beginning-position spot checks from `Test_L1_R1`/`Test_L1_R2`;
- exact per-column strong scores generated only after external parent-score parity.

Local Node qualification currently shows:

- **158/158** external parent scores matched exactly;
- all 128 calibration per-column action-score vectors regenerate exactly;
- all 30 beginning spot-check action-score vectors regenerate exactly;
- primary calibration reaches 128/128 exact optimal moves and 128/128 W/D/L preservation at depth 8 and remains exact through depth 12;
- beginning spot checks remain 29/30 W/D/L-correct at depth 12, so depth 12 is demonstrably not perfect on the solved evidence.

## Known solved incumbent-v1 defect

Sequence:

`54676552255627`

Solved column scores:

`[1, 2, -2, -5, 1, -2, -14]`

At depth 12 incumbent v1 selects column 3 (`-2`), turning a solved win into a solved loss. The same baseline selects optimal column 2 (`+2`) at depth 19 and remains on column 2 through the locally checked depths 20–24.

`legacy-qualified` fixed-depth and production persistent-ordering search make identical choices on this vector through the investigated correction seam, falsifying TT ordering as the cause. The evidence points to a horizon/evaluator-search limitation, not to cross-move TT contamination.

A controlled local experiment removing only the repeated-immediate promotion produced mixed solved-corpus results: some horizons improved and others regressed, with the isolated failure still oscillating before depth 19. C4-0002 therefore remains unchanged; no replacement evaluator has demonstrated uniform dominance.

## Next executable seam

1. Qualify C4-0005 and both strength corpora in exact Node 26.7 CI.
2. Capture revision-bound `strength-evidence` output under Node 26.7.
3. Promote the solved-strength baseline only after readback/review.
4. Then assess the public CUDA-MCGS composition needed for the Connect4 comparison lane without resuming CUDA-MCGS #124 or making upstream mutations.

CUDA-MCGS #124 remains paused under explicit owner instruction.

## Repository governance

Governance alignment remains tracked separately in issue #3. Main is still not protected at the last live readback. Product CI success does not complete repository-policy alignment.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four engine exists here yet;
- perfect performance on the calibration corpus does not prove globally perfect play at that depth;
- the beginning spot-check sample is explicitly non-representative;
- the repeated-immediate behavior has not been proven either necessary or defective in isolation;
- no Python or cross-language comparison is in scope for the first benchmark gate.
