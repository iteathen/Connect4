# Connect4 — historical Minimax lineage

`solver/minimax-alpha-beta` is retired as an active solver family.

Current active solver-family heads are:

- `solver/isometric` — IsoMax / forward structural exact solver;
- `solver/cuda-bsfp` — backward symbolic fixed-point solver;
- `solver/sut` — future exact composition of IsoMax + CUDA-BSFP.

The incumbent minimax/alpha-beta implementation on `main` remains a reference/baseline comparator.

Durable historical knowledge from this branch is indexed at:

`research/history/historical-only/solver-lineages/MINIMAX_ALPHA_BETA.md` on `research/semantic-quotient`.

Do not route new implementation or research work to this branch.
