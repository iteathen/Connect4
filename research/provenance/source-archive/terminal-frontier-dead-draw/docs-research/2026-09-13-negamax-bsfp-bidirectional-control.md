# Negamax / BSFP bidirectional proof-intersection control

**Date:** 2026-09-13  
**Status:** complete small-game control / structural-calculus evidence; no production solver change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Turn the Negamax/BSFP duality into an executable control rather than only a semantic observation.

Negamax approaches exact value from the predecessor/root side. BSFP approaches exact value from terminal/deeper ranks. If both are normalized onto the same structural quotient, the predicates and operators common to both are candidates for the missing searchless calculus; implementation-specific artifacts are not.

The first complete control uses **4x3 connect-3** because the complete legal graph is small enough to enumerate independently while preserving the same gravity, first-win, residual, existential/universal and fixed-point semantics.

Reproducer:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/negamax_bsfp_proof_intersection_control.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-negamax-bsfp-proof-intersection-control.json
```

## 1. Independent solver agreement

The complete first-win-truncated game graph contains:

```text
7,157 legal states
2,526 terminal states
4,631 nonterminal states
```

The forward solver evaluates recursively from the root using absolute-P0 `max/min` semantics.

The backward solver starts only from terminal P0-win/P1-win seeds and iterates the exact controllable-predecessor closure; states outside both attractors are draw residue.

Both produce:

```text
P0-win states: 4,199
P1-win states: 2,631
draw states:     327
root: P0 win
```

Across all 7,157 legal states:

```text
solver disagreements = 0
```

Thus the forward and backward formulations are empirically identical on the complete control while being executed from opposite directions.

## 2. Common proof normal form

After removing recursion direction, TT/MTBDD identity, move ordering and scheduler mechanics, every exact state proof falls into the same small family:

```text
terminal(P0Win/P1Win/Draw)
exists(P0Win)
forall(P0Win)
exists(P1Win)
forall(P1Win)
exists(Draw) + universal exclusion of a better mover result
```

The control counts are:

```text
exists(P0Win)                         1,917
forall(P0Win)                           710
exists(P1Win)                         1,332
forall(P1Win)                           373
exists(Draw) & forall(not P1Win)        166
exists(Draw) & forall(not P0Win)        133
terminal P0Win                        1,572
terminal P1Win                          926
terminal Draw                            28
```

This is the proof-level intersection of Negamax choice and BSFP controllable predecessor.

## 3. Local structural partial evaluation

Using only support/playability plus normalized residual requirements, the prototype classifies:

```text
terminal                          2,526
immediate win                     2,570
double playable threat loss         391
bilateral exhaustion draw             8
forced single response              906
genuine decision                    756
```

Every locally exact classification matches both exact solvers:

```text
tactical exact mismatches = 0
```

Therefore the existing tactical/WSL mechanisms are not separate solution theories. They are exact **partial evaluations of the same predecessor recurrence**.

A single forced response is likewise a partial evaluation that reduces a choice operator to one legal macro-edge; it does not create a new game-value semantics.

## 4. The common structural quotient is real

For nonterminal states use the quotient:

```text
support
+ normalized P0 residual antichain
+ normalized P1 residual antichain
```

On the complete control:

```text
4,631 physical nonterminal states
-> 3,734 structural quotient classes
```

So 897 physical states merge.

Across every merged class:

```text
mixed W/D/L classes        = 0
mixed tactical classes     = 0
mixed proof-shape classes  = 0
```

This is stronger than W/D/L preservation alone. The quotient preserves the normalized existential/universal proof obligation itself on this complete game.

It supports the interpretation that colored history is not the natural domain of the calculus; support plus future win requirements is.

## 5. Where the missing calculus remains

At quotient level the classes split into:

```text
local immediate exact          1,907
local double-threat exact        350
local exhaustion exact             3
forced response                  764
genuine decision                 710
```

So only 710 of 3,734 nonterminal structural classes remain genuine choices after the cheap exact partial evaluations.

Those 710 classes are the clean target set for predecessor-calculus discovery.

## 6. Exact successor equality is not the answer

The 710 decision classes contain:

```text
1,946 legal action edges
1,946 distinct exact successor quotient classes
```

No decision class has two legal actions leading to the same exact structural successor.

Therefore ordinary quotient equality / transposition merging does **nothing** to factor these decision choices.

Horizontal-reflection canonicalization reduces only:

```text
1,946 -> 1,934 successor classes
```

and affects only 8 decision classes.

So symmetry is useful but not the missing choice calculus either.

This is an important falsifier. The unresolved factorization must relate **distinct successors** through stronger semantic relations, for example:

```text
impossibility
subsumption / dominance
compatible blocker cover
response-resource serialization
race/deadline precedence
shared NDC certificate consequences
```

rather than merely identifying equal states.

## 7. Solver-direction intersection

The same semantic objects appear from the two ends:

| Common obligation | Forward Negamax view | Backward BSFP view | Structural interpretation |
|---|---|---|---|
| terminal truth | return on terminal/tactical fact | seed / terminal injection | WSL/geometry terminal predicate |
| legal action | transition to child | restrict deeper function by landing ownership | support + residual transition |
| forced response | deterministic macro-edge | only admissible predecessor edge after local restriction | response certificate / action-slot constraint |
| existential win | one child establishes lower proof | controllable `exists` predecessor | `PreE` |
| universal win | every admissible child must discharge | universal predecessor / meet | `PreA` |
| draw | no winning child plus a draw-preserving child | safety residue outside both attractors | greatest safety residue / exact exhaustion |
| finite termination | recursion rank increases | backward support rank decreases | occupied/event rank |

This table is the strongest current statement of the common calculus.

## 8. Consequence for response-capacity research

The earlier center response-serialization theorem now has a solver-independent meaning.

If two certificates require different actions in the same response slot, then:

```text
Negamax view:
  one predecessor node cannot choose two physical moves;

BSFP view:
  one action predecessor cannot simultaneously restrict two distinct landing events;

NDC view:
  the two certificate guards are resource-incompatible.
```

Thus action-slot capacity is not an extra heuristic rule. It is required for any certificate algebra that commutes with both exact solvers.

## 9. Refined missing-calculus statement

The missing calculus is **not** another value recurrence. Both exact solvers already provide the complete recurrence.

It is not primarily state equality or reflection symmetry; the control falsifies that explanation on the genuine decision set.

The missing object is an exact symbolic factorization of `PreE`/`PreA` over distinct structural successor alternatives:

```text
CPC / WSL / NDC facts
    -> prove alternatives impossible, dominated, equivalent-in-obligation,
       forced, mutually incompatible, or jointly covered
    -> discharge exists / forall without ordinary child enumeration
```

This is the seam to pursue on standard 7x6.

## 10. Next experiment

Do not broaden the historical rule set blindly.

Take a set of exact 7x6 states already solved by the quotient Negamax lane and, where the BSFP profile can evaluate the corresponding structural function, record for each genuine decision:

```text
support + residual antichains
Negamax exact child obligation
BSFP predecessor/terminal factor
CPC facts
certified blockers
response-resource constraints
race/deadline facts
```

Then anti-unify only the reductions that both exact solvers support.

The highest-value target is a distinct-successor pair where CPC/WSL/NDC proves that one alternative can be discarded or that a universal family can be discharged without evaluating every child. That would be a concrete new predecessor-calculus rule rather than another restatement of minimax.

## Non-claims

This control does not prove:

- that the 4x3 quotient is automatically sufficient for all 7x6 NDC certificate contexts;
- that all 7x6 decision classes admit a searchless factorization;
- that reflection or exact equality are useless optimizations;
- the final perfect-play terminal-line subset or its cardinality;
- the center-opening positive proof.

It proves a bounded but exact dual-solver intersection and sharply narrows what the missing calculus must accomplish.
