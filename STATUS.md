# Connect4 CUDA-BSFP Status

**Updated:** 2026-09-10  
**Lane:** CUDA-BSFP exact solver  
**Canonical branch:** `solver/cuda-bsfp`  
**Superseded branch name:** `feature/cuda-bsfp`

## Mission

Solve standard empty-board 7x6 Connect Four to exact W/D/L extremely fast with backward symbolic fixed-point computation. This lane is not minimax, alpha-beta, MCTS, proof-number search, recursive legal-move traversal, or a full colored-state solve table.

## Protected base and dependencies

```text
base:            main@de47d43f4f4133a68973d0876a402531ef5735da
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

Connect4 owns BSFP semantics, terminal/first-win behavior, product state identity and qualification. Consumer-neutral GPU algorithms remain CUDA-Algorithms-owned; runtime/compiler/device mechanisms remain CUDA-JS-owned.

## Qualified production-adjacent milestones

- P1: first physical CUDA-BSFP correctness slice on GTX 1660 Ti.
- B1: about 35.35 billion exact packed42 subset checks/s; the raw two-u32 subset predicate is not the first scaling wall.
- C1: complete device-owned compact recurrence with exact all-frontier agreement on 4x3, 4x4 and 5x5.
- Official C1 5x5: about 3.30 s submit/wait and 3.57 s warm solve wall versus about 11.66 s for the same-machine CPU reference including its qualification observer.

## Production-adjacent 6x5 seam

Two bounded C1 6x5 attempts timed out at 180 seconds. With a 2,048-candidate tile, the first 32-node static epoch took about 75.118 seconds. Observed GPU utilization was approximately 95–100%, so the active question is useful work quality/volume rather than simple host starvation.

Current production-adjacent gates remain:

1. native C3 cause profiling at exact source `468611d9e2f743a6a30a55a2db23cc70a824f988`;
2. native B2 legacy-vs-bucketed A/B at exact source `7298bbbaa5d761b0dd163f68aa00ba9baf9cb1e5`;
3. select the smallest measured intervention;
4. requalify every affected support frontier before another 6x5 attempt.

Potential interventions remain cardinality bucketing, exact early dedup, specialized terminal subtraction, heavy-support decomposition, and exact semantic pre-normalization filtering.

## Research boundary

Cross-solver representation research no longer uses this lane as its continuity owner. Shared questions such as minimum-description game state, identified-line quotienting, future-behavior equivalence and OQS-style class compilation belong on `research/semantic-quotient`.

The newest OQS/flat-transfer findings remain preserved in Git history through `research/zdd-transfer-20260910` and its descendant `research/semantic-quotient`; they are evidence/candidates until deliberately promoted here.

## Non-claims

- empty-board 7x6 is not yet solved by complete CUDA-BSFP closure;
- no exact-distance result is claimed by BSFP;
- OQS/semantic-quotient research is not automatically production architecture;
- no lower-repository capability gap is currently established.
