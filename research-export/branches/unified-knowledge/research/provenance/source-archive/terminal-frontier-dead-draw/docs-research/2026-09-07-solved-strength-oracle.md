# Solved-game oracle and incumbent strength evidence — 2026-09-07

## Objective

Replace self-play intuition with an independent numerical solved-game oracle before using Connect4 as the strong Node-local CUDA-MCGS benchmark control.

## External provenance

The oracle checkpoint convention and strong-score semantics are from Pascal Pons's public Connect Four solver/tutorial. The public solver source defines the position score and `analyze` per-column scores under perfect play.

For the test-set data, two unrelated public GitHub mirrors were inspected at fixed revisions:

- `megakilo/alphafour@cf2d4546e5824c155e9dd7e888a572bff3128498`;
- `Trashtalk217/victor@93421fd4f30aaf8e76f152781ba399b7d0905df8`.

The corresponding test files have identical Git blob identities in both mirrors:

| Set | Git blob SHA |
| --- | --- |
| Test_L3_R1 | `180daa64dc3f52f3ac931be95c99c964945554b2` |
| Test_L2_R1 | `66089b7cf493c00e44f23ddcf12ad1ea0fe8a1a8` |
| Test_L1_R1 | `125e3d872dfec4ea13fe09641606dff992f152ee` |
| Test_L1_R2 | `481876168e3690e6bf080c56683b9d506e5ddd58` |

The original Pons benchmark URLs remain provenance; mirrors are used to make byte identity/retrieval explicit rather than trusting one repackager.

## Independent Node oracle

A separate 7×6 exact solver was implemented in ordinary Node JavaScript. It shares no state/evaluator/search code with the incumbent.

The oracle uses:

- current-player-relative 49-bit bitboard representation using JavaScript `BigInt` bit operations;
- independent exact negamax/alpha-beta recurrence;
- immediate-win and non-losing-move reductions from the solved-game method;
- a Pascal-Pons-compatible one-bound transposition encoding;
- numeric transposition keys because the 49-bit key remains exactly representable in IEEE-754 integer range;
- preallocated move-sort workspace to avoid per-node state/move-array churn.

The performance refinements are only to keep CI practical. Oracle throughput is not benchmark evidence.

## Checkpoint qualification

The deterministic calibration corpus contains the first 64 positions of `Test_L3_R1` and the first 64 of `Test_L2_R1`.

Results:

- **128/128 external parent scores matched exactly**;
- all frozen per-column action scores regenerate exactly from the qualified oracle;
- for every vector, the best generated move score equals the external parent score.

The beginning spot-check corpus adds 30 positions from `Test_L1_R1`/`Test_L1_R2`; all external parent scores and frozen action scores also regenerate exactly. Its selection is cost-bounded and explicitly non-representative.

## Incumbent strength curve — deterministic 128-position calibration

Production iterative deepening, fresh engine per independent position, `persistent-best-move` ordering within each search:

| Depth | Exact optimal | W/D/L preserved | Total strong regret | Result-class drops |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 111/128 | 121/128 | 60 | 7 |
| 2 | 119/128 | 126/128 | 10 | 2 |
| 3 | 122/128 | 127/128 | 9 | 1 |
| 4 | 121/128 | 125/128 | 23 | 3 |
| 5 | 125/128 | 127/128 | 8 | 1 |
| 6 | 127/128 | 128/128 | 1 | 0 |
| 7 | 126/128 | 127/128 | 3 | 1 |
| 8 | 128/128 | 128/128 | 0 | 0 |
| 9–12 | 128/128 | 128/128 | 0 | 0 |

The non-monotonic depth-4 and depth-7 regressions are real solved-position behavior, not self-play noise.

This corpus is intentionally a calibration corpus, not evidence that depth 8 is globally perfect.

## Beginning spot checks

Thirty beginning positions are reported separately because their selection was bounded by practical exact-action generation cost.

| Depth | Exact optimal | W/D/L preserved | Total strong regret | Result-class drops |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 27/30 | 30/30 | 3 | 0 |
| 2 | 26/30 | 30/30 | 21 | 0 |
| 3 | 21/30 | 29/30 | 36 | 1 |
| 4 | 21/30 | 29/30 | 48 | 1 |
| 5 | 25/30 | 29/30 | 32 | 1 |
| 6 | 26/30 | 30/30 | 21 | 0 |
| 7 | 26/30 | 29/30 | 14 | 1 |
| 8 | 26/30 | 29/30 | 17 | 1 |
| 9 | 26/30 | 29/30 | 17 | 1 |
| 10 | 27/30 | 29/30 | 16 | 1 |
| 11 | 28/30 | 29/30 | 15 | 1 |
| 12 | 28/30 | 29/30 | 6 | 1 |

The `Test_L1_R1` easy-beginning subset becomes exact-strong perfect at depth 10. The `Test_L1_R2` medium-beginning subset still contains one W/D/L failure at depth 12.

## Solved defect isolation

Failure sequence:

`54676552255627`

Exact per-column scores:

`[1, 2, -2, -5, 1, -2, -14]`

Thus columns 1, 2 and 5 preserve a win; columns 3, 4, 6 and 7 lose. Column 2 is strong-score optimal.

Incumbent v1 behavior:

- depth 10: column 3, solved `-2`;
- depth 11: column 4, solved `-5`;
- depth 12: column 3, solved `-2`;
- depth 13: column 4, solved `-5`;
- depth 14: column 3, solved `-2`;
- depth 15: column 4, solved `-5`;
- depth 16: column 3, solved `-2`;
- depth 17: column 4, solved `-5`;
- depth 18: column 3, solved `-2`;
- depth 19: column 2, solved `+2`;
- depths 20–24 checked locally: column 2 remains selected.

`legacy-qualified` fixed-depth search and the production persistent ordering lane produce the same move and normalized score at every tested depth 10–20. Cross-move ordering is therefore falsified as the cause of this defect.

The odd/even losing-move oscillation before depth 19 is consistent with horizon/evaluator interaction, but this evidence does not isolate one evaluator term as causal.

## Repeated-immediate-promotion experiment

A local, non-authoritative experiment changed only the optimized repeated-immediate promotion from three increments per playable three-own/one-empty line to one increment.

The result was mixed:

- on the 128-position calibration corpus it improved some horizons and reached 128/128 at depth 7 instead of depth 8;
- it worsened exact/WDL results at other shallow depths;
- on the 13 medium-beginning spot checks it fixed the known failure at depths 10 and 12 but regressed again at depth 11;
- on the isolated failure it alternated between winning and losing choices at depths 10–18 and became stably correct only at depth 19, the same eventual correction depth as incumbent v1.

Therefore removing the repeated-immediate behavior is **not demonstrated to be a uniformly better replacement**. C4-0002 remains unchanged. The oracle has converted the quirk from speculation into a testable candidate, but the current evidence supports preservation of the frozen incumbent while recording the solved defect separately.

## Exact Node 26.7 qualification

Candidate source revision:

`952cf15dfc86e08abdc86e508025a056c8865687`

Repository `verify` run **34122018213** used exact Node **v26.7.0** / V8 `14.6.202.34-node.28` and passed **27/27** tests. That run independently re-solved all **158 external parent checkpoints**, regenerated all 128 deterministic calibration action vectors, regenerated all 30 bounded beginning spot-check action vectors, reproduced the full strength curves, retained all incumbent conformance/self-play tests, and reproduced the known depth-12→19 defect trace.

Separate `strength-evidence` run **34122018076** also used exact Node **v26.7.0** and reproduced the frozen strength measurements exactly. Its defect trace reported:

- depth 12: one-based column 3, solved strong score `-2`, **result class not preserved**, 110,576 incumbent nodes / 47,589 evaluator calls;
- depth 19: one-based column 2, solved strong score `+2`, **exact optimal**, 1,320,048 incumbent nodes / 362,950 evaluator calls.

The existing incumbent `benchmark-evidence` workflow reran at the same candidate revision as run **34122018187** and passed, providing a regression gate that C4-0005 did not change the incumbent performance harness.

## Disposition

The first Node incumbent now has both:

1. exact legacy compatibility evidence; and
2. independent solved-game strength evidence under the canonical Node 26.7 runtime.

The baseline is strong but not perfect at depth 12. A concrete solved W/D/L failure is frozen for later evaluator/search-v2 experiments.

The next Connect4 seam is a **read-only assessment of CUDA-MCGS public composition readiness**. No CUDA-MCGS code or issue #124 work is resumed by that assessment.
