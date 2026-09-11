# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** MQ1-MQ4 passed; minimax implementation transfer active

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, identified-line quotients, residual classes, canonical transitions and practical minimum-description representations.

It does **not** own the minimax/alpha-beta solver implementation or the CUDA-BSFP solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`

## Qualified reduction chain

Complete bounded-game qualification now establishes:

```text
physical colored history
  -> identified-line quotient (support,H0,H1)
  -> support + minimal residual antichain pair
  -> coarsest exact action-behavior class
```

### MQ1 — identified-line strong-score quotient

Across **1,681,808 physical nonterminal states** and **1,261,104 merged-state comparisons**, `(support,H0,H1)` produced zero mismatches in exact distance-sensitive state score, per-column action score, terminal timing, or successor quotient class.

### MQ2 — coarsest action-labelled behavioral quotient

Across the same four independent complete controls:

```text
physical histories:       1,681,808
identified-line classes:    420,704
behavioral classes:         269,347
```

On complete 4x5 c4:

```text
physical histories: 1,385,521
line classes:          361,427
behavior classes:      229,232
```

The line quotient is therefore exact but not minimal.

### MQ3 — forward semantic state

The candidate

```text
support
+ minimal current/P0 residual winning-requirement antichain
+ minimal opponent/P1 residual winning-requirement antichain
```

was sufficient for exact MQ2 behavior on every complete control. Residual requirements without support were not sufficient, proving that gravity/accessibility remains semantic.

For complete 4x5:

```text
line classes:             361,427
support+residual states:  294,593
behavior classes:         229,232
```

The forward semantic state is only **1.285x** above the theoretical behavioral minimum.

### MQ4 — direct residual automaton

MQ4 generated the game directly from the empty residual root using only:

```text
support + minimal residual pair + column
  -> terminal score | next support + next minimal residual pair
```

No colored ownership board or identified-line history participates in recursive transition generation.

Across all complete controls:

```text
reachable-set mismatches: 0
strong-score mismatches:  0
action-score mismatches:  0
flat-replay mismatches:   0
```

Complete 4x5 direct automaton:

```text
residual states:          294,593
nonterminal transitions:  890,358
terminal edges:             76,058
peak rank frontier:         60,650
naive flat target table: 4,713,488 bytes
```

Authority:

- `research/semantic-quotient/mq4-residual-automaton.mjs`
- Actions run `34570662573`, job `103171852729`
- `docs/research/2026-09-11-semantic-quotient-mq4-residual-automaton.md`
- `docs/research/evidence/2026-09-11-semantic-quotient-mq4-residual-automaton.json`

## Transfer boundary

The residual state law is now sufficiently qualified to test under alpha-beta. That implementation comparison belongs to `solver/minimax-alpha-beta` as **MQ5**.

This branch retains ownership of the shared mathematical result and may continue investigating the remaining ~1.285x residual-to-behavior redundancy in parallel. It does not own search control, TT layout, or minimax benchmark claims.

The primary shared research question after the MQ5 transfer is whether the remaining behavioral collapse can be explained by a cheap forward invariant such as support-event equivalence, forced-response equivalence, parity/tempo equivalence, or residual automorphism without sacrificing the simple local residual transition law.
