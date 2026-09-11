# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** MQ1 passed; MQ2 behavioral minimization active

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, identified-line quotients, residual classes, canonical transitions and practical minimum-description representations.

It does **not** own the minimax/alpha-beta solver implementation or the CUDA-BSFP solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`

## MQ1 — strong-score identified-line quotient

MQ1 qualified the candidate physical-game quotient:

```text
Q = (support, H0, H1)
```

against complete 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4 game graphs using the distance-sensitive exact minimax score convention.

Across **1,681,808 physical nonterminal states** and **1,261,104 comparisons between distinct physical states in the same quotient class**, observed mismatches were:

```text
strong state score:        0
per-column action score:   0
terminal timing:           0
successor quotient class:  0
```

The 4x5 control alone compared 1,024,094 merged states; its largest quotient class contains 37,080 physical histories.

Authority:

- source `research/semantic-quotient/mq1-strong-score.mjs`
- Actions run `34569663402`, job `103168883561`
- report `docs/research/2026-09-11-semantic-quotient-mq1-strong-score.md`
- evidence `docs/research/evidence/2026-09-11-semantic-quotient-mq1-strong-score.json`

MQ1 therefore promotes `(support,H0,H1)` from W/D/L-equivalent coordinates to a qualified **exact action-value quotient** on the complete bounded controls. This is not yet a standard 7x6 proof or a production representation claim.

## Current primary research seam — MQ2

Compute the coarsest exact action-labelled behavioral partition on complete bounded games and measure:

```text
physical histories
  -> identified-line quotient classes
  -> exact behavioral classes
```

The behavioral signature must preserve each labeled column as:

```text
illegal | immediate-terminal-score | child-behavior-class
```

MQ2 must quantify whether multiple `(support,H0,H1)` classes collapse further, where the first such merges occur, whether any exact class spans support/rank boundaries, and what description/transition bytes would be required for a dense class-ID realization.

Do not change the production minimax representation before this reduction is measured and qualified.

## Residual-pair factorization seam

The shared OQS work independently established that exact residual-function identity can be much smaller than natural history/state descriptions and can compile to transition-stable dense IDs. CUDA implementation/profile/qualification remains owned by `solver/cuda-bsfp`; this branch owns only the transferable semantic interpretation.

Use the OQS results as methodology for MQ2-MQ4, not as permission to import BSFP control flow into minimax.
