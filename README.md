# Connect4

Connect4 is the product repository for exact Connect Four semantics, benchmark/oracle authority, solver validation, and product-specific CUDA composition.

The repository now carries two intentionally separate exact solver lanes plus one shared representation-research lane:

- `solver/minimax-alpha-beta` — exact minimax/negamax/alpha-beta search and search-specific optimization/evidence;
- `solver/cuda-bsfp` — backward symbolic fixed-point solving on CUDA, not move-tree search;
- `research/semantic-quotient` — solver-neutral research into win-space, support/accessibility, future-behavior equivalence, quotient construction and minimum-description game state.

`main` remains the accepted product/domain/spec/oracle baseline and repository-level router. Read `STATUS.md`, `next_step.yaml`, and `REPOSITORY_STRUCTURE.md` before choosing a work lane.

## Current state

The incumbent Node engine, benchmark protocol and solved-strength oracle baseline are qualified on the product line. The minimax research corpus is consolidated but no new maintained kernel is currently promoted. CUDA-BSFP has exact device-owned closure qualified through 5x5 controls; empty-board 7x6 remains unsolved by complete BSFP closure. Shared semantic-quotient research is currently testing whether exact future behavior can be represented by substantially fewer semantic classes than historical colored-board state.

No solver lane should be inferred from old historical branch names. The branch migration/retirement record is preserved in `research/MIGRATION_MANIFEST.json`.

The archived 2025 browser game is source/provenance material, not the target architecture. UI/audio/browser-specific structure is not imported wholesale.
