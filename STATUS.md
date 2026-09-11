# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** MQ1/MQ2 passed; MQ3 residual sufficiency active

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, identified-line quotients, residual classes, canonical transitions and practical minimum-description representations.

It does **not** own the minimax/alpha-beta solver implementation or the CUDA-BSFP solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`

## MQ1 — strong-score identified-line quotient

MQ1 qualified:

```text
Q = (support, H0, H1)
```

against complete 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4 game graphs using the distance-sensitive exact minimax score convention.

Across **1,681,808 physical nonterminal states** and **1,261,104 comparisons between distinct physical states in the same quotient class**, observed mismatches were zero for strong state score, per-column action score, terminal timing, and successor quotient class.

Authority:

- `research/semantic-quotient/mq1-strong-score.mjs`
- Actions run `34569663402`, job `103168883561`
- `docs/research/2026-09-11-semantic-quotient-mq1-strong-score.md`
- `docs/research/evidence/2026-09-11-semantic-quotient-mq1-strong-score.json`

## MQ2 — coarsest action-labelled future quotient

MQ2 computed the deterministic bottom-up behavioral partition:

```text
column -> illegal | immediate-terminal-score | child-behavior-class
```

The identified-line quotient is not minimal.

Across the four complete controls:

```text
physical histories:       1,681,808
identified-line classes:    420,704
behavioral classes:         269,347
```

So exact action-behavior minimization removes another **1.562x** beyond the line-hit quotient and yields **6.244x** aggregate collapse from physical histories.

Complete 4x5 c4:

```text
physical histories: 1,385,521
line classes:          361,427
behavior classes:      229,232
line -> behavior:        1.577x
physical -> behavior:    6.044x
max line classes / behavior class: 498
cross-support behavior classes:     211
cross-rank behavior classes:        208
```

Late 4x5 ranks reach line-to-behavior collapse of 9.756x at rank 16, 14.632x at rank 17, and 16.133x at rank 18.

A simple dense 4x5 behavior ID needs 18 information bits; a naive flat four-column transition table is about **3.67 MB**.

Authority:

- `research/semantic-quotient/mq2-behavioral-partition.mjs`
- Actions run `34570098421`, job `103170191176`
- `docs/research/2026-09-11-semantic-quotient-mq2-behavioral-partition.md`
- `docs/research/evidence/2026-09-11-semantic-quotient-mq2-behavioral-partition.json`

## Current primary research seam — MQ3

Explain the information removed by MQ2 and find a forward-updatable sufficient statistic substantially closer to the behavioral quotient.

The first candidate under qualification is:

```text
support
+ minimal P0 residual winning-requirement antichain
+ minimal P1 residual winning-requirement antichain
```

At fixed support, the residual requirements are derived from identified geometric lines after removing lines already blocked by the opponent, subtracting occupied support cells, and removing duplicate/subsumed requirements.

MQ3 asks:

1. Is `support + minimal residual pair` sufficient for exact action behavior?
2. How much of the line-hit → behavior collapse does this explain?
3. Are residual requirements alone sufficient, or does gravity/support still carry indispensable behavior?
4. What exact redundancy remains after residual antichain reduction?

Do not change production minimax representation until the compact forward state law is identified and qualified.

## Cross-solver interpretation

OQS independently found the same architectural shape from the BSFP direction:

```text
natural history/state
  -> exact residual behavior class
  -> small dense semantic ID
  -> flat local transition
```

The semantic state can be shared research even though minimax search recurrence and BSFP fixed-point recurrence remain separate solver-owned mechanisms.
