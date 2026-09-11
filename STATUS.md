# Connect4 Minimax / Alpha-Beta Status

**Updated:** 2026-09-11  
**Canonical branch:** `solver/minimax-alpha-beta`  
**State:** MQ5 semantic-residual alpha-beta comparison active

## Mission

This branch owns the exact minimax/negamax/alpha-beta solver line, its search-specific experiments, benchmark evidence, TT/scheduling work, and search-side structural optimizations. CUDA-BSFP remains a separate solver. Shared semantic-quotient research is routed through `research/semantic-quotient`.

## Consolidation state

The branch contains the complete identified minimax research lineage through the pre-BSFP structural cut plus the missing rethink-control history. Durable navigation starts at:

- `MINIMAX_BRANCH.md`
- `reference/research-prototypes/MINIMAX_INDEX.md`
- `docs/research/2026-09-10-minimax-branch-lineage-audit.md`

## Shared semantic gate is now cleared

`research/semantic-quotient` has completed MQ1-MQ4 on complete bounded controls.

The qualified state law is:

```text
support
+ minimal current-player residual winning-requirement antichain
+ minimal opponent residual winning-requirement antichain
```

with local move transition:

```text
semantic state + column
  -> immediate terminal score | next semantic state
```

MQ4 generated complete residual automata from the empty root without recursive colored-board ownership or line-hit history and reproduced reachable state sets, exact strong scores, every action score, and flat transition replay with zero mismatches on 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4.

Complete 4x5 evidence:

```text
physical nonterminal states: 1,385,521
residual states:               294,593
coarsest behavior classes:     229,232
residual transitions:          890,358
peak residual frontier:         60,650
```

The shared semantic result remains owned by `research/semantic-quotient`; this branch owns only the search implementation/benchmark consequences.

## MQ5 active experiment

Packet:

```text
research/minimax/semantic-residual-mq5/
```

The first MQ5 prototype uses a **root-local exact residual-state arena** with lazy cached transitions. Recursive alpha-beta carries a dense semantic state ID rather than the colored board.

The frozen comparison control is the 512K-slot compact exact **decision-state + intrinsic-rank-bank** solver from:

```text
reference/research-prototypes/2026-09-09-decision-state/solver_compact_decision_rank.mjs
```

The first fairness mode holds TT slot count and rank-bank layout fixed. It also keeps exact distance scoring, null-window convergence, center-first tie order, immediate threat/forced-block semantics, winning-cell-count move ordering, and decision-only TT admission aligned as closely as the different state representation permits.

The prototype deliberately reports semantic arena construction/interning cost separately. Its JS Map/string arena is reconnaissance, not the intended production representation.

## Strong historical control

At 512K entries on `41267575`, the compact decision+rank control previously produced:

```text
score:       +3
nodes:    5,261,422
TT hits:    888,871
TT writes: 2,081,030
```

On `663152175`:

```text
score:       -4
nodes:    1,014,754
TT hits:    167,269
TT writes:   427,015
```

MQ5 reruns the control in the same workflow environment rather than relying only on those historical timing measurements.

## Interpretation rule

Do not reject the semantic quotient merely because the first lazy JS interning implementation is slower in wall time.

Assess separately:

1. exact score parity;
2. alpha-beta proof nodes;
3. TT hits/writes;
4. number of unique residual states and computed transitions;
5. dynamic canonicalization/interning overhead;
6. total memory footprint.

If proof work improves but compilation dominates, optimize the residual state compiler/WSL-625 representation next. If proof work itself regresses, investigate search-policy interaction before promotion.

## Correctness obligations retained

- exact distance-sensitive scores and action values remain authoritative;
- raw optimized board negamax entry requires its no-current-immediate-win precondition to be discharged at the public/task boundary;
- false TT misses are acceptable, false hits are not;
- experimental shared multiwriter publication is not needed for the first serial MQ5 decision;
- benchmark and oracle semantics remain Connect4-owned.
