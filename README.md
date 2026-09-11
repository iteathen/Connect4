# Connect4

Connect4 is the shared product/domain repository for exact Connect Four semantics, benchmark and oracle authority, solver qualification contracts, and product-specific CUDA composition.

The repository has **three first-class exact solver lines** plus one solver-neutral representation-research line:

- `solver/minimax-alpha-beta` — exact minimax/negamax/alpha-beta implementation and search-specific optimization/evidence;
- `solver/cuda-bsfp` — backward symbolic fixed-point solving on CUDA, not move-tree search;
- `solver/hybrid-confluence` — hybrid exact solving that composes the minimax and CUDA-BSFP lines through an exact confluence contract;
- `research/semantic-quotient` — solver-neutral research into win-space, support/accessibility, future-behavior equivalence, quotient construction and minimum-description game state.

`main` is **not a fourth solver line**. It is the shared accepted substrate and repository router. It owns the domain rules, benchmark/fairness semantics, oracle/reference baseline, accepted cross-lane contracts and repository-level documentation needed by all solver lines.

The qualified incumbent implementation on `main` is retained as a reference/baseline and oracle comparator. It is not the repository's singular "current solver" and does not make `main` the minimax product head.

## Branch model

```text
                         main
          shared domain / oracle / contracts
              /            |            \
             /             |             \
solver/minimax-     solver/cuda-bsfp   solver/hybrid-
alpha-beta                              confluence
             \             |             /
              \            |            /
               research/semantic-quotient
                solver-neutral research
```

The three `solver/*` branches are intentionally long-lived peer product heads. They are not ordinary feature branches waiting to be merged wholesale into `main`.

Shared accepted changes flow from `main` into each solver line. A solver may discover a fact or mechanism that belongs to the shared product/domain layer, but that fact is promoted back to `main` selectively after its cross-lane meaning is established. Solver-specific kernels, scheduling, symbolic state, transposition structures and confluence implementation remain on their owning solver line.

Read `STATUS.md`, `next_step.yaml`, `REPOSITORY_STRUCTURE.md`, and the target lane's own status/next-step before executing work.

## Current state

The shared domain, benchmark protocol and solved-strength oracle baseline remain qualified on `main`. Minimax/alpha-beta and CUDA-BSFP continue independently on their canonical solver heads. `solver/hybrid-confluence` is the dedicated implementation head for the new asynchronous exact-confluence architecture; research may be developed on the appropriate research lane before implementation is promoted there.

No solver lane should be inferred from old historical branch names. The branch migration/retirement record is preserved in `research/MIGRATION_MANIFEST.json`.

The archived 2025 browser game is source/provenance material, not the target architecture. UI/audio/browser-specific structure is not imported wholesale.
