# Open-cap dominance closure — semantic success, representation non-monotonicity

**Status:** exact bounded semantic qualification + representation falsifier  
**Research direction:** Joshua Oshiro  
**Experimental branch:** research/nim-control-parity-algebra-20260929  
**Semantic qualification workflow:** 36594018714 — success  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Closure

The optional bounded closure removes an opponent residual equal to all currently open top caps only when a rule-only support audit proves one of two conditions:

1. no legal support interleaving can complete the cap residual; or
2. every legal cap-completing interleaving completes another existing residual no later.

The detector uses no solved outcomes or recursive class IDs. When the bounded proof is unavailable, it leaves the residual untouched.

## Semantic qualification

Across the complete current small-board matrix, the closure preserves:

- the independently established recursive class count;
- the root value;
- zero W/D/L split classes.

Therefore the first-terminal dominance theorem is semantically sound on every tested control.

## Exact representation matrix

| Board | Baseline states | Closure states | Baseline edges | Closure edges | Recursive classes |
|---|---:|---:|---:|---:|---:|
| 3x3 C3 | 158 | 156 | 349 | 345 | 130 |
| 4x3 C3 | 1,475 | 1,518 | 4,260 | 4,387 | 1,002 |
| 3x4 C3 | 596 | 574 | 1,386 | 1,347 | 406 |
| 4x4 C3 | 8,169 | 8,618 | 24,901 | 26,204 | 4,384 |
| 4x4 C4 | 9,319 | 9,090 | 29,076 | 28,480 | 8,242 |

The closure therefore reduces the structural graph on three controls but enlarges it on both width-4 Connect-3 controls.

## Falsified assumption

The following intuitive rule is false:

~~~text
semantically redundant residual
    -> delete residual
    -> structural graph cannot get larger
~~~

Semantic deletion is not representation-monotone.

## Why deletion can enlarge the graph

A residual that can never be the unique first terminal cause may still participate in later cofactor and antichain-normalization steps.

Keeping the residual can generate a smaller cofactor that subsumes other residuals. If the behaviorally redundant residual is erased too early, those later syntactic consequences are never generated, so more residual representatives can survive and diverge.

Thus:

~~~text
terminal relevance
!=
cofactor / normalization utility
~~~

A clause may be behaviorally dead while still serving as a useful algebraic simplifier of its descendants.

This explains the apparent paradox: the closure preserves the final recursive semantics but can increase the number of intermediate structural representatives.

## 4x4 Connect-4 gain

For the main C4 control the closure is still useful:

~~~text
after support-release closure       9,319 states / 29,076 edges
after open-cap dominance closure    9,090 states / 28,480 edges
recursive classes                   8,242
~~~

Incremental reduction:

~~~text
229 structural states
596 structural edges
~~~

Relative to the original 10,507-state residual-orbit graph:

~~~text
original static excess      2,265
remaining excess              848
removed/explained excess     1,417
fraction                     ~62.56%
~~~

The earliest class-5950 open-cap distinction is removed, but this destructive representation is not a universal graph-size optimization because of the C3 countercontrols.

## Consequence

The right generalized target is not simply clause deletion. It is a quotient or canonical representation that preserves the useful derivative/cofactor consequences of a behaviorally redundant obligation while identifying states with the same first-terminal continuation semantics.

This points toward a derivative-automaton / language-equivalence view:

~~~text
residual syntax
    -> cofactors / derivatives
    -> first-terminal continuation language
    -> canonical semantic state
~~~

rather than destructive local erasure alone.

## Non-claims

This bounded closure is not a polynomial generalized solver, not a guaranteed state-count optimization, and not a production mechanism. The width-4 C3 increases are first-class negative evidence and must be retained.
