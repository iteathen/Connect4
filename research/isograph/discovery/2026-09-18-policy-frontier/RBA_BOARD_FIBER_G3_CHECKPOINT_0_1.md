# RBA board-fiber G3 checkpoint 0.1

**Date:** 2026-09-18  
**Canonical branch:** `research/semantic-quotient`  
**Status:** theorem-shaped post-1.1 research with exhaustive non-reflection transport tests; no authority promotion  
**Research direction:** Josh Oshiro

## Candidate

G3:

> Exact abstract ordinary-value semantics depend only on the G2 support-conditioned structural fiber, not on its concrete embedding in the 7x6 board.

The G2 fiber contains:

- all future/unoccupied cells;
- gravity-chain order;
- legal-frontier markers;
- all unique nonempty residual winning-line hyperedges;
- residual-to-cell incidence.

## Executed value-transport qualification

Fifteen distinct non-reflection G2 fiber pairs at ranks 34 and 35 were selected.

For every source abstract q pair:

1. transport both player residual antichains through the exact cell/residual fiber isomorphism;
2. solve exact strong value independently on source and target;
3. map every legal source action to its target frontier cell;
4. compare exact strong action scores;
5. compare exact state score;
6. compare mapped best-move sets.

Aggregate:

~~~text
non-reflection fiber pairs          15
complete q pairs             1,592,642
mapped action-value cases    3,929,368

state-value mismatches               0
action-value mismatches              0
best-move-set mismatches             0
~~~

The tests include both side-to-move parities because ranks 34 and 35 were both exercised.

## Direct threshold-boundary transport

Two representative non-reflection fibers were also checked at the exact generator-set level.

### Rank 35

~~~text
source [0,6,6,6,5,6,6]
target [0,6,6,6,6,5,6]

antichains/player      164
q pairs             26,896
threshold boundaries     21
generator mismatches      0
largest boundary         11
~~~

### Rank 34

~~~text
source [0,6,6,6,5,5,6]
target [0,6,6,6,5,6,5]

antichains/player       410
q pairs             168,100
threshold boundaries      32
generator mismatches       0
largest boundary          12
~~~

Aggregate direct boundary comparisons:

~~~text
53 complete threshold-boundary generator-set comparisons
0 mismatches
~~~

## Why G3 is theorem-shaped

Let phi be a G2 fiber isomorphism.

G2 fixes:

1. a bijection of future cells;
2. a bijection of residual hyperedges;
3. gravity/frontier legality;
4. the legal-action bijection;
5. owner-true and owner-false principal cofactor correspondence;
6. the induced child fiber after every mapped legal action.

The induced map on residual formulas therefore preserves the residual poset and extends to an order isomorphism on the residual upset lattice, and coordinate-wise to q states.

Induct on remaining cells.

### Terminal action

Mapped actions complete exactly corresponding residual requirements, so first-win terminal kind and ply distance agree.

### Nonterminal action

The mapped action leads to an isomorphic child fiber and the corresponding child q state. By induction the child exact strong value is equal. The one-ply score lift therefore agrees.

### State value

The legal actions are in bijection and every corresponding action score is equal. Max over the action set therefore preserves state value.

### Best-move set

Argmax transports through the same action bijection.

### Threshold boundaries

The q mapping is an order isomorphism and exact values are preserved. Therefore the preimage of each strong-score threshold region is identical under transport, and minimal Upper/maximal Lower generators map exactly.

Hence:

> G2 fiber isomorphism implies isomorphism of the complete abstract ordinary strong-value boundary algebra.

## Guard: abstract value fiber versus historical realizability

This result does **not** establish that the set of historically realizable/physical q states at one concrete support embedding maps bijectively onto the historically realizable q states at another embedding.

The G2 fiber intentionally omits past occupied ownership/history.

Therefore:

~~~text
abstract ordinary-value fiber isomorphism
    !=
physical/history realizability isomorphism
~~~

For ordinary value reuse, the conservative-extension result is the relevant bridge: legal q values equal the abstract fiber values on the legal subset.

Proof/certificate identity remains separate.

## Structural consequence

The board can now be factored before the value algebra:

~~~text
concrete support vector
        |
        | quotient by exact support-conditioned
        | gravity + residual-incidence isomorphism
        v
board structural fiber type
        |
        v
residual lattice
        |
        v
cofactor / adjoint family
        |
        v
exact value-boundary algebra
~~~

Concrete board coordinates are not semantically load-bearing for the abstract ordinary-value algebra after the exact structural fiber is fixed.

## Relation to RBA

This shrinks the RBA unknown again.

The residual lattice and its exact ordinary-value behavior are not independent support-specific primitives. They are fiber-derived.

The open compact-normal-form problem becomes:

> Can the finite family of board-fiber transition/value-transformer types be composed compactly enough to evaluate the empty-board fiber without constructing every concrete support/rank boundary?

That is more specific than the previous support-by-support formulation.

## Current disposition

~~~text
G2 residual/cofactor fiber invariance          PASS / theorem-shaped
G3 exact ordinary-value fiber invariance       PASS / theorem-shaped
non-reflection q-pair transport                1,592,642 PASS
mapped action-value transport                  3,929,368 PASS
direct threshold-boundary transport            53/53 PASS
physical/history realization equivalence       NOT CLAIMED
fiber quotient minimality                      OPEN
compact fiber-transformer composition          OPEN
empty root solved                              NO
authority 1.1 mutated                          NO
typed relation promoted                        NO
~~~

## Next candidate

The next high-value board/RBA candidate is:

> **G4 — fiber-transformer quotient:** legal support edges between isomorphic source/target fibers induce only a much smaller set of exact cofactor/value-transformer isomorphism types than the number of concrete support edges.

If G4 holds strongly, RBA may be expressible as a finite transfer algebra over fiber-transition types rather than over concrete supports.
