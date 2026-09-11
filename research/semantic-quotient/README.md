# Semantic quotient research

This is the canonical namespace for **new** solver-neutral research into the minimum exact description of the remaining Connect Four game.

The branch itself owns cross-solver questions such as:

- action-labelled future-behavior equivalence;
- identified-line and win-space quotients;
- support/accessibility sufficiency;
- residual-class construction;
- hidden-history censuses and minimal missing accumulators;
- flat compiled transition automata;
- description-length/state-transition cost accounting.

New experiment packets should use:

```text
research/semantic-quotient/<experiment>/
  README.md
  manifest.json
  src/
  evidence/
```

## Active experiment packets

- [`state-identity-unification/`](state-identity-unification/) — tests whether the qualified residual/primitive state can become a useful common logical identity for minimax, CUDA-BSFP and hybrid confluence while each solver retains its fastest native operational representation. Promotion is gated on exactness and notable net performance gain.

The immediate program is MQ1-MQ5 as routed by this branch's `next_step.yaml`. Solver control flow does not move here: alpha-beta-specific implementation belongs on `solver/minimax-alpha-beta`; BSFP/CUDA-specific implementation belongs on `solver/cuda-bsfp`; hybrid-confluence implementation belongs on `solver/hybrid-confluence`.

Historical OQS/ZDD/win-space prototypes remain in their original committed paths. Preserve them as provenance; do not keep creating new chronological catch-all directories under `reference/research-prototypes/`.
