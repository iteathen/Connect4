# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** MQ1-MQ4 passed; MQ5 transferred to minimax; SIU-1 relational dual-direction exactness passed

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, identified-line quotients, residual classes, canonical transitions and practical minimum-description representations.

It does **not** own solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `solver/hybrid-confluence`

## Qualified reduction chain

Complete bounded-game qualification establishes:

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

The line quotient is exact but not minimal.

### MQ3 — forward semantic state

The candidate

```text
support
+ minimal P0 residual winning-requirement antichain
+ minimal P1 residual winning-requirement antichain
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

## SIU-1 — one relational language in both directions

`research/semantic-quotient/state-identity-unification/` tested the BSFP-aligned logical state:

```text
supportIndex
+ sideToMove
+ normalized P0 residual requirements
+ normalized P1 residual requirements
```

The forward engine used only that relational state. A reverse exact W/D/L closure used only relational IDs plus the exact inverse relation. Colored board state was confined to an independent oracle.

Across the same **1,681,808** complete-control physical states, SIU-1 produced zero physical-projection, forward-transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

Observed physical-to-relational reduction ranged from **1.247x to 13.431x**. On 4x5 c4, 1,385,521 physical states collapsed to 294,593 relational states, with one relational state representing as many as 37,080 physical states.

The forward quotient is deliberately not state-level reversible. On 4x5 c4, **127,374** `(child,column)` pairs had multiple relational predecessors, with up to 21 parents for one pair. This identifies the correct common algebra as:

```text
forward:       T(q,a) -> q' | terminal
backward: Pre_a(Q) -> exact predecessor set/frontier
```

rather than requiring `undo(q',a)` to be a function.

An explicit reverse CSR would cost about 4.44 MB on the 4x5 control versus 4.71 MB for the dense forward transition table, so materializing both directions nearly duplicates transition storage. The BSFP-facing next step is therefore symbolic preimage, not history restoration.

The current BSFP ownership-antichain representation is also more compressed than explicit relational enumeration: 40,707 boundary records versus 294,593 relational states on 4x5. Common semantics must not force BSFP to abandon a better physical representation.

Authority:

- `research/semantic-quotient/state-identity-unification/src/siu1-relational-dual-direction.mjs`
- `research/semantic-quotient/state-identity-unification/SIU1_RESULT.md`
- `research/semantic-quotient/state-identity-unification/evidence/2026-09-11-siu1-relational-dual-direction.json`
- Actions run `34632643724`, job `103372941221`

## Transfer and ownership boundary

The residual state law is solver-neutral authority here. Production search control, TT layout, CUDA-BSFP execution, hybrid scheduling and performance claims remain on their solver lanes.

No solver should be refactored merely to look unified. The emerging target is one exact relational game algebra with solver-specific execution forms.

## Current next questions

1. **SIU-2 direct relational alpha-beta:** can recursive alpha-beta navigate `q` without a colored board and retain or improve wall-clock performance after accounting for transition/key cost?
2. **SIU-3 semantic TT economics:** how much additional useful proof reuse comes from relational identity rather than physical identity?
3. **SIU-5 symbolic preimage:** can BSFP compute `Pre_a(Q)` compactly without materializing the complete reverse relation?
4. **7x6 scale:** how large is the reachable relational space and what packed representation is practical?
5. **Evaluator/NN compatibility:** which approximate-evaluation features are absent from the relational state and whether they should be derived, carried separately, or intentionally kept outside exact identity.
