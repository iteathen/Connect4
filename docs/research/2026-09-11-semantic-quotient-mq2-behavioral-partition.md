# Semantic quotient MQ2 — exact action-labelled behavioral partition

**Status:** passed on complete bounded games. Research evidence only; not a standard 7x6 proof and not yet a production minimax representation.

## Question

MQ1 established that the identified-line quotient

```text
Q = (support, H0, H1)
```

preserves the exact distance-sensitive state score and every labeled action score on the complete bounded controls.

MQ2 asks the next minimum-description question:

> How much information in `(support,H0,H1)` is itself unnecessary once only exact future action behavior matters?

Because legal Connect Four play is acyclic by move count, the coarsest deterministic behavioral equivalence can be computed bottom-up. Two states are placed in the same behavioral class exactly when every labeled column has the same outcome token:

```text
column -> illegal | immediate-terminal-score | child-behavior-class
```

This preserves the complete action-labelled continuation, not merely state value or W/D/L.

## Reproduction

```text
branch:       research/semantic-quotient
source:       research/semantic-quotient/mq2-behavioral-partition.mjs
source head:  e937e90ed86588ff5272db6370ac789e14af911a
workflow:     Semantic quotient MQ2 behavioral partition
run:          34570098421
job:          103170191176
runner:       Ubuntu 24.04.5 / Node 26.7.0
```

Compact evidence:

```text
docs/research/evidence/2026-09-11-semantic-quotient-mq2-behavioral-partition.json
```

## Result

The identified-line quotient is **not minimal**.

Across the four independent complete controls:

```text
physical histories:       1,681,808
identified-line classes:    420,704
behavioral classes:         269,347
```

Thus, after the physical-history reduction already established by MQ1, exact action-labelled minimization removes another **1.562x** of state distinctions. Relative to the original physical histories, the complete behavioral quotient is **6.244x** smaller across these controls in aggregate.

| Geometry | Physical | Line classes | Behavior classes | Physical→line | Line→behavior | Physical→behavior |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 4,659 | 4,499 | 2,912 | 1.036x | 1.545x | 1.600x |
| 4x4 c4 | 139,625 | 37,323 | 27,424 | 3.741x | 1.361x | 5.091x |
| 5x3 c4 | 152,003 | 17,455 | 9,779 | 8.708x | 1.785x | 15.544x |
| 4x5 c4 | 1,385,521 | 361,427 | 229,232 | 3.833x | 1.577x | 6.044x |

Every physical state in one identified-line class mapped to exactly one behavioral class. There were **zero identified-line-class behavioral mismatches**.

## The important result is not the average collapse

Behavioral collapse grows very sharply in late ranks.

For complete 4x5 c4:

| Rank | Physical states | Line classes | Behavior classes | Line→behavior |
| ---: | ---: | ---: | ---: | ---: |
| 15 | 204,136 | 41,808 | 9,287 | 4.502x |
| 16 | 221,834 | 19,405 | 1,989 | 9.756x |
| 17 | 192,778 | 5,882 | 402 | 14.632x |
| 18 | 153,648 | 968 | 60 | 16.133x |
| 19 | 88,520 | 64 | 8 | 8.000x |
| 20 | 37,080 | 1 | 1 | 1.000x |

The largest 4x5 behavioral class contains **498 distinct identified-line classes** and 37,080 physical states.

This demonstrates that even the already-compressed line-hit coordinates retain large amounts of future-irrelevant information near the end of the game.

## Support and rank are not always irreducible

Behavioral classes were allowed to merge globally when their complete labeled future was identical.

Observed classes spanning different support skeletons:

```text
4x3:  27
4x4:  30
5x3:  10
4x5: 211
```

Observed classes spanning different ranks:

```text
4x3:  22
4x4:  26
5x3:  10
4x5: 208
```

This is a significant result. Support and move count are necessary inputs to the natural transition representation, but they are not always part of the irreducible behavioral identity once the future game has collapsed enough.

The production conclusion is **not** that support/rank should simply be removed. It is that the true semantic state is smaller than the natural coordinate tuple and can, in principle, be represented by a canonical future-behavior ID.

## First demonstrated extra merge on 4x5

The first 4x5 line-class merge appears at rank 9, at the same support skeleton but with different line-hit masks:

```text
state A:
  H0 = 0x1e7b7
  H1 = 0xc68b

state B:
  H0 = 0x1e7a7
  H1 = 0xc69b
```

Both have exactly the same labeled future signature:

```text
C181756 | C185404 | illegal | C185405
```

So at least one pair of line-hit distinctions can be removed without losing any future decision information.

MQ3 should explain *why* these differing line bits are behaviorally dead.

## Dense-ID / transition artifact scale

The complete behavioral quotient on 4x5 needs **229,232 classes**, or 18 information bits for a dense class ID.

A simple flat four-column action table using four-byte symbols would occupy approximately:

```text
229,232 classes × 4 columns × 4 bytes = 3,667,712 bytes
```

This is not an optimized encoding and does not include a construction/indexing mechanism. But it demonstrates that, on the complete 4x5 control, the exact future game can be represented as a few-megabyte deterministic automaton despite originating from 1.385 million physical nonterminal states.

The smaller controls similarly compile to small flat tables:

```text
4x3:  23,296 bytes
4x4: 219,392 bytes
5x3:  97,790 bytes
```

This closely matches the architectural shape independently discovered in OQS:

```text
small dense semantic ID + local input -> next dense semantic ID / terminal
```

The minimax and BSFP paths are therefore converging on the same representational object even though their solving recurrences remain separate.

## Interpretation

MQ1 showed that historical colored ownership contains redundant information.

MQ2 now shows that `(support,H0,H1)` also contains redundant information.

The hierarchy on the qualified domains is therefore:

```text
physical history
  -> identified-line quotient
  -> exact action-behavior quotient
```

with each arrow removing distinctions that provably cannot affect the remaining labeled game.

This is a much closer practical analogue of the minimum-description/Kolmogorov motivation: the target is not the shortest textual encoding of the board, but the smallest exact equivalence class required to reproduce all future decision behavior.

## Next: MQ3

MQ3 should classify the information discarded by the line→behavior collapse.

For pairs of distinct `(support,H0,H1)` states in the same behavioral class, derive and compare:

- viable winning-line sets for each player;
- minimal residual winning requirements;
- duplicated/subsumed residual requirements;
- dead line-hit bits whose line can no longer matter;
- support differences that induce the same future landing/event structure;
- player/column automorphisms where applicable;
- neutral capacity / tempo-only differences;
- whether the behavioral merge is explained by the existing WSL-625 residual antichain;
- whether a much smaller canonical residual signature predicts the behavioral class.

The first objective is explanatory and representational: find a compact **forward-updatable sufficient statistic** that predicts the MQ2 class without having to precompute every physical history.

Do not yet replace production minimax state with offline behavioral IDs. First identify the compact state law that generates them.
