# Semantic quotient MQ4 — direct residual automaton

**Status:** passed on complete bounded controls. Research evidence only; not yet a standard 7x6 result or production minimax implementation.

## Question

MQ3 established that the state

```text
support
+ minimal P0 residual winning-requirement antichain
+ minimal P1 residual winning-requirement antichain
```

is sufficient for exact future behavior on the complete bounded controls.

MQ4 asks the decisive constructive question:

> Can that state be generated forward from the empty root using only its own local transition law, with no colored ownership board and no identified-line history?

## Direct transition law

For a move into landing cell `x`:

### Mover

For every mover residual requirement `R`:

```text
x notin R -> R
x in R    -> R - {x}
```

If any reduced requirement becomes empty, the move is an immediate win. Otherwise normalize to the minimal antichain.

### Opponent

Discard every opponent requirement containing `x`. Retained requirements are already an antichain.

### Support

Advance the chosen column height.

No physical stone ownership or winning-line ID is needed by this transition.

## Reproduction

```text
branch: research/semantic-quotient
source: research/semantic-quotient/mq4-residual-automaton.mjs
run:    34570662573
job:    103171852729
```

Evidence:

```text
docs/research/evidence/2026-09-11-semantic-quotient-mq4-residual-automaton.json
```

## Qualification

For each complete control MQ4 independently constructed:

1. the residual automaton directly from the empty residual root;
2. the complete legal physical game graph as an oracle;
3. the physical graph's projection into support+residual state;
4. exact distance-sensitive strong values and per-column action values;
5. a dense-ID flat transition replay check.

Required comparisons all passed with zero mismatches:

```text
reachable residual-state sets: 0 mismatches
strong state scores:            0 mismatches
per-column action scores:       0 mismatches
flat transition replay:         0 mismatches
```

| Geometry | Residual states | Nonterminal transitions | Terminal edges | Flat transition bytes |
| --- | ---: | ---: | ---: | ---: |
| 4x3 c3 | 3,735 | 10,232 | 2,390 | 29,880 |
| 4x4 c4 | 34,095 | 100,764 | 6,256 | 272,760 |
| 5x3 c4 | 11,317 | 37,719 | 1,786 | 113,170 |
| 4x5 c4 | 294,593 | 890,358 | 76,058 | 4,713,488 |

The 4x5 direct residual automaton was qualified against all **1,385,521** reachable physical nonterminal states.

## 4x5 state-shape

Residual-state counts by rank:

```text
0:       1
1:       4
2:      16
3:      52
4:     160
5:     440
6:   1,197
7:   2,916
8:   6,780
9:  13,738
10: 26,427
11: 42,328
12: 59,045
13: 60,650
14: 47,501
15: 23,646
16:  7,882
17:  1,584
18:    209
19:     16
20:      1
```

The frontier peaks at only **60,650 residual states** despite the physical graph containing over 1.38 million nonterminal states in total.

## Architectural consequence

This is the first candidate in the minimum-description line that is both:

- exact on complete game controls; and
- natively self-propagating.

The state transition is now:

```text
residualStateId + column
  -> immediate terminal score | next residualStateId
```

after dense interning/compilation.

That means the colored board has ceased to be semantically necessary for recursive solving on the qualified domains. A solver that begins from the empty root can carry only the semantic state ID through recursion once the transition layer is available.

This is structurally the same object that the OQS line discovered independently from the fixed-point direction: a small exact semantic automaton with flat local transitions.

## Relation to the theoretical MQ2 minimum

For complete 4x5:

```text
coarsest action-behavior classes:   229,232
forward residual states:            294,593
ratio:                                1.285x
```

So the forward-constructible representation pays only about 28.5% more states than the globally minimized future-behavior quotient while avoiding the need for backward whole-graph minimization to define its state.

That is a strong practical trade.

## Next transfer to minimax

The next experiment belongs on `solver/minimax-alpha-beta`.

Do not rewrite the maintained solver yet. Create a research prototype that keeps the serial alpha-beta control as fixed as possible while replacing colored-board state identity with the exact residual state.

The first fair A/B should measure separately:

- semantic states visited;
- alpha-beta nodes;
- TT probes/hits/writes;
- residual-state construction/interning work;
- NPS;
- wall time;
- memory used by TT plus residual-state arena/transition cache.

Run at least two fairness modes:

1. **equal TT slots** — isolates state merging/search effects;
2. **equal total memory budget** — allows the compact semantic key/ID to earn additional cache capacity only when its own arena cost is included.

Keep null-window sequence, move order, exact scoring, tactical terminal rules, and root positions identical.

The initial implementation should favor a lazy exact residual-state arena with cached local transitions. If the semantics win but dynamic interning dominates runtime, optimize the state compiler rather than concluding that the quotient itself failed.
