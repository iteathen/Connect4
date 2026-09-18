# Connect4

Connect4 is the shared product/domain repository for exact Connect Four semantics, benchmark and oracle authority, solver qualification contracts, and product-specific CUDA composition.

The repository has one shared foundation, one canonical research lane, and **five first-class solver-family heads**:

- `solver/minimax-alpha-beta` — exact minimax/negamax/alpha-beta implementation and search-specific optimization/evidence;
- `solver/cuda-bsfp` — backward symbolic fixed-point solving on CUDA, not move-tree search;
- `solver/hybrid-confluence` — hybrid exact solving that composes solver capabilities through an exact confluence contract;
- `solver/isometric` — the structural-calculus / frontier-exact Isometric solver family;
- `solver/sut` — SUT (`S ∪ T`), a distinct solver lineage intended to combine mature structural and terminal solving boundaries;
- `research/semantic-quotient` — the single canonical owner of **all Connect4 research**, including solver-specific research, normalized knowledge, experiment results, research evidence, negative results, open questions, synthesis, and provenance.

`main` is **not another solver line**. It is the shared accepted substrate and repository router. It owns domain rules, benchmark/fairness semantics, oracle/reference behavior, accepted cross-lane contracts and repository-level ownership decisions.

The qualified incumbent implementation on `main` is retained as a reference/baseline and oracle comparator. It is not the repository's singular "current solver" and does not make `main` the minimax implementation head.

## Durable branch model

```text
                              main
               shared domain / oracle / contracts
        _____________|_____________|_____________
       /             |             |             \
 minimax         CUDA-BSFP     hybrid-confluence  Isometric
                                                    \
                                                     SUT
                         \
                  research/semantic-quotient
                   canonical shared research
```

The diagram is ownership-oriented, not a Git ancestry claim. Solver heads are peers and may have different historical origins.

The durable set is closed by `docs/decisions/2026-09-17-solver-namespace-normalization.md`. Agents may create bounded temporary work/experiment branches, but may not invent another durable lane or let a temporary branch become a continuity owner without explicit owner instruction.

## Branch hygiene

Temporary `work/*`, `experiment/*`, `feature/*`, handoff, staging and evidence branches must name an owning durable lane and a retirement condition. Do not create new durable focused `research/*` branches. Valuable implementation returns to its solver owner; every durable research result, hypothesis, falsifier, research-evidence packet, and unresolved question returns to `research/semantic-quotient` before the temporary ref is removed.

Shared accepted changes flow from `main` into solver lines. **All research** is normalized and preserved on `research/semantic-quotient`. Solver-specific kernels, scheduling, symbolic state, transposition structures, implementation contracts, and composition machinery stay on their owning solver head.

Read `STATUS.md`, `next_step.yaml`, `REPOSITORY_STRUCTURE.md`, and the target lane's own status/next-step before executing work.

## Current state

The shared domain, benchmark protocol and solved-strength oracle baseline remain qualified on `main`. Minimax, CUDA-BSFP and Isometric have established implementation/research histories. Hybrid Confluence remains a dedicated implementation lane whose branch-local state must be developed explicitly. SUT is intentionally at its starting point and is not a rename of Hybrid Confluence, Isometric or BSFP.

The canonical research lane consolidates **all** research, including solver-specific findings and provenance, so solver and experiment branches never become competing research owners.

The archived 2025 browser game is source/provenance material, not the target architecture. UI/audio/browser-specific structure is not imported wholesale.
