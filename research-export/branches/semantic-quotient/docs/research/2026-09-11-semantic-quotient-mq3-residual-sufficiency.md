# Semantic quotient MQ3 — minimal residual antichain sufficiency

**Status:** passed on complete bounded controls. Research evidence only; not a standard 7x6 proof or production minimax implementation.

## Candidate

For each player, keep only the **minimal residual winning requirements** that remain viable after the opponent's occupied cells have blocked lines and the current support cells have been removed.

The candidate forward state is:

```text
support
+ minimal P0 residual antichain
+ minimal P1 residual antichain
```

A residual requirement is a set of currently empty cells that the player still needs to occupy to complete one geometric winning line. Duplicate and strict-superset requirements are removed because satisfying a smaller requirement already wins.

This representation discards identified line identity whenever two lines reduce to the same or dominated future requirement.

## Reproduction

```text
branch: research/semantic-quotient
source: research/semantic-quotient/mq3-residual-sufficiency.mjs
run:    34570367110
job:    103170983996
```

Evidence:

```text
docs/research/evidence/2026-09-11-semantic-quotient-mq3-residual-sufficiency.json
```

## Result

`support + minimal residual pair` was sufficient for the exact MQ2 behavior class on every complete control: **zero collisions into different behavioral classes**.

Residual requirements **without support** were not sufficient on any control. Gravity/accessibility therefore remains a real semantic input rather than representational noise.

| Geometry | Line classes | Support+residual classes | Behavior classes | Line→residual | Residual→behavior |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 4,499 | 3,735 | 2,912 | 1.205x | 1.283x |
| 4x4 c4 | 37,323 | 34,095 | 27,424 | 1.095x | 1.243x |
| 5x3 c4 | 17,455 | 11,317 | 9,779 | 1.542x | 1.157x |
| 4x5 c4 | 361,427 | 294,593 | 229,232 | 1.227x | 1.285x |

On complete 4x5, the residual-state representation is only **1.285x larger than the coarsest exact behavioral quotient**, while unlike the MQ2 behavioral ID it has an obvious local semantic update law.

## Exact forward update law

For a move into cell `x` by player `P`:

### Mover residuals

For every mover requirement `R`:

```text
if x in R: R' = R - {x}
else:      R' = R
```

If any `R'` becomes empty, the move is an immediate win. Otherwise normalize the resulting set back to its minimal antichain.

### Opponent residuals

Any opponent requirement containing `x` is permanently blocked and is discarded:

```text
R survives iff x notin R
```

Filtering preserves antichain order, so this side does not require full dominance normalization merely because of the move.

### Support

Advance the selected column height by one. The support skeleton still owns gravity/legal landing semantics.

This is exactly the same asymmetric normalization law independently discovered in the OQS cofactor work.

## Why this matters for minimax

MQ1 showed that colored ownership history is unnecessary.

MQ2 established the theoretical action-behavior minimum on the bounded games.

MQ3 now supplies a **forward-constructible state law** close to that minimum:

```text
colored board/history
  -> identified line hits
  -> support + minimal residual antichains
  -> theoretical behavior class
```

The third representation is the first one in this chain that simultaneously has:

- exact future sufficiency on the complete controls;
- a direct local transition law;
- no dependency on historical colored-board reconstruction;
- no need to retain line IDs after residual reduction;
- natural compatibility with the existing WSL-625 requirement universe;
- a plausible dense-handle / transition-table implementation.

For 4x5, 294,593 support+residual states versus 229,232 behavioral states means the practical semantic representation is already within about 28.5% of the coarsest exact future quotient.

## What remains redundant

Minimal residual antichains do **not** explain all MQ2 merges.

For 4x5, only 11,099 of 43,587 behavior classes that merge multiple line-hit classes are fully explained by collapsing to one support+residual signature. There remain 32,488 behavior classes containing multiple distinct support+residual states.

So a second semantic reduction remains. Likely sources include:

- strategically dead but still formally viable requirements;
- support/event differences that lead to the same future reachable action graph;
- forced-response equivalence;
- parity/tempo equivalence;
- residual automorphisms;
- other continuation-level dominance not visible from static residual-set inclusion alone.

That remainder should be studied, but it should not block testing the residual state as a practical minimax substrate.

## Next decisive experiment

Qualify the **incremental residual automaton directly from the empty root**, without referring to physical ownership or line-hit history during transition generation:

```text
support + residual pair + column
  -> terminal score | next support + next residual pair
```

Required checks:

1. generated reachable residual-state sets exactly equal the physical projection at every rank;
2. terminal observations agree exactly;
3. exact strong state/action values agree;
4. dense state IDs and flat column transitions replay correctly;
5. state/transition bytes and construction cost are measured.

If that passes, the residual representation becomes a direct candidate for a minimax search-state prototype rather than merely an explanatory quotient.
