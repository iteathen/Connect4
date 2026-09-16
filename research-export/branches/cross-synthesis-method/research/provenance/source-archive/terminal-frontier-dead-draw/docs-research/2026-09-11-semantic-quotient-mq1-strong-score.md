# Semantic quotient MQ1 — exact strong-score qualification

**Status:** passed on complete bounded games. Research evidence only; this is not a standard 7x6 proof or a production minimax implementation.

## Question

Does the identified-line quotient

```text
Q = (support, H0, H1)
```

preserve enough future information for the **distance-sensitive exact minimax objective**, not merely root/state W/D/L?

Here `H0` and `H1` are the identified winning-line hit masks induced by the cells physically occupied by each player. The support skeleton preserves gravity/legal landing coordinates.

MQ1 strengthens the earlier exact quotient test by requiring every pair of reachable physical states that maps to the same `Q` to agree on:

1. legal columns;
2. immediate terminal timing for every legal column;
3. exact successor quotient class for every nonterminal column;
4. exact side-to-move strong state score; and
5. the complete per-column strong action-score vector.

The score convention matches the exact-search objective structurally: draw is zero, a win is positive, a loss is negative, faster wins score higher, and slower losses score better. A nonterminal action score is the negation of its child score.

## Authority and reproduction

```text
branch:       research/semantic-quotient
source:       research/semantic-quotient/mq1-strong-score.mjs
source head:  499e031526080ec8bddce1f8861eca960a18f628
workflow:     Semantic quotient MQ1 strong score
run:          34569663402
job:          103168883561
runner:       Ubuntu 24.04.5 / Node 26.7.0
```

Durable compact evidence:

```text
docs/research/evidence/2026-09-11-semantic-quotient-mq1-strong-score.json
```

## Result

MQ1 passed all four complete controls.

Across **1,681,808 reachable physical nonterminal states**, the candidate quotient produced **420,704 identified-line classes**. The test performed **1,261,104 comparisons against another physical state in the same quotient class**.

Observed mismatches:

```text
strong state score:        0
per-column action score:   0
terminal timing:           0
successor quotient class:  0
```

| Geometry | Physical states | Quotient classes | Collapse | Multi-member classes | Max class | Root strong score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 4,659 | 4,499 | 1.036x | 96 | 28 | +2 |
| 4x4 c4 | 139,625 | 37,323 | 3.741x | 14,654 | 5,336 | 0 |
| 5x3 c4 | 152,003 | 17,455 | 8.708x | 9,943 | 4,440 | 0 |
| 4x5 c4 | 1,385,521 | 361,427 | 3.833x | 131,877 | 37,080 | 0 |

The aggregate physical-to-line-quotient collapse is about **3.998x** across these differently shaped controls, but the important result is equivalence, not that aggregate ratio.

## Decisive 4x5 evidence

The strongest falsifier remains the complete 4x5 c4 game because the quotient merges very large populations of distinct physical histories.

MQ1 compared **1,024,094** merged physical states on that geometry with no strong-score or action-score disagreement.

Late-rank classes become extremely large:

| Rank | Physical states | Quotient classes | Largest class |
| ---: | ---: | ---: | ---: |
| 16 | 221,834 | 19,405 | 1,492 |
| 17 | 192,778 | 5,882 | 1,954 |
| 18 | 153,648 | 968 | 5,156 |
| 19 | 88,520 | 64 | 14,581 |
| 20 | 37,080 | 1 | 37,080 |

Thus the strong-score result is not explained by testing only singleton or tiny equivalence classes.

## Interpretation

This materially strengthens the identified-line result.

On every complete game tested, `(support,H0,H1)` is not merely a W/D/L quotient. It is an exact **action-value quotient for the tested distance-sensitive minimax objective**: histories merged by the quotient have the same legal choices, the same immediate terminal behavior, the same quotient successor for each labeled column, the same exact state value, and the same exact value for each action.

That means a minimax solver does not need the historical colored board to distinguish any of those merged states on the qualified domains.

This is a practical minimum-description result: many bits of physical ownership history are demonstrably representational redundancy with respect to the remaining action-labelled game.

## What MQ1 does not establish

MQ1 does **not** establish:

- standard 7x6 equivalence by exhaustive enumeration;
- that `(support,H0,H1)` is the coarsest exact quotient;
- that literal 69-bit-per-side line masks are the best runtime encoding;
- a production minimax speedup;
- a TT layout;
- a CUDA representation;
- a whole-game precomputed solve table.

The literal line-hit tuple can be wider than the current colored-board key. Its value is semantic collapse. The production target is therefore a smaller canonical class ID or similarly compact exact representation, not necessarily the raw tuple itself.

## Consequence

MQ1 clears the correctness gate for **MQ2**.

The next question is now:

> How much of `(support,H0,H1)` is itself redundant once only exact action-labelled future behavior matters?

For each complete bounded game, compute the coarsest deterministic behavioral partition. Because the legal game graph is acyclic by rank, an exact class can be constructed bottom-up from the labeled action signature:

```text
column -> illegal | immediate-terminal-score | child-behavior-class
```

Then measure:

```text
physical histories
    -> identified-line quotient classes
    -> exact behavioral classes
```

MQ2 should also report whether any behavioral class spans multiple line-hit classes, supports, or ranks and retain minimal representatives for the first such merges. Those merges identify the next removable information after the physical-board history already discarded by MQ1.

Do not change the production minimax representation yet. First quantify the coarsest exact behavioral quotient and its transition representation cost.
