# RBA algebra-core checkpoint 0.1

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** post-1.1 research checkpoint; no authority promotion
**Research direction:** Josh Oshiro

## Current tested semantic stack

~~~text
board structural fiber
-> support-local residual distributive lattice
-> terminal-extended join-preserving cofactor
<-> exact right adjoint
-> six-value partial WDL information
-> four nested monotone endpoint fronts
-> antichain semiring / Bellman lattice-polynomial composition
~~~

## Multirelation model

A two-ply macro maps a state to a family of opponent-possible successor sets, one set per current-player action. Threshold success is existential over action sets and universal inside the selected set. Up/union closure adds only weaker choices and does not change this threshold semantics.

Existing multirelation theory supplies associative composition on appropriate closed subclasses. The raw representation is nevertheless too fine.

Complete 4x3 control:

~~~text
physical states                      4,631
2-ply minimal outcome sets: avg 2.29, max 4, root 4
4-ply minimal outcome sets: avg 14.09, max 1,024, root 1,024
value mismatches                     0
~~~

Late six-ply slice:

~~~text
states rank >= 6                     4,070
left/right parenthesization mismatches   0
value mismatches                         0
max minimal outcome sets                 3
~~~

Therefore raw multirelation outcome families are a useful semantic model but not a compact RBA carrier. Value abstraction must happen during composition.

## Four-front value abstraction

The six scalar partial values LL, LD, LW, DD, DW, WW are represented exactly by four nested monotone fronts:

~~~text
lower >= DRAW
lower >= WIN
upper >= DRAW
upper >= WIN
~~~

Qualification already recorded:

~~~text
arbitrary q-dependent two-ply front comparisons   24/24 exact
chained 4/6-ply state-front comparisons           32/32 exact
root action-front comparisons                      96/96 exact
~~~

## Antichain semiring

Fix the favorable q-state lattice L at one support. Minimal antichains represent upward-closed regions.

Define:

~~~text
A plus B  = Min(A union B)
           represents union of upward sets

A times B = Min({a join b | a in A, b in B})
           represents intersection of upward sets
~~~

This is the upward-set bounded distributive lattice written in extremal-antichain form; equivalently an idempotent commutative semiring presentation.

Tests:

~~~text
support [5,5,5,2,6,6,6]
    semiring/distributive law checks  1,000
    mismatches                            0
    fixed-path preimage join mismatch     0
    fixed-path preimage meet mismatch     0

support [5,5,2,5,6,6,6]
    law checks                          500
    mismatches                            0
    preimage join mismatch                0
    preimage meet mismatch                0
~~~

## Bellman transformer

For one threshold front U:

~~~text
T(U)
  = plus over current-player actions a
      (
        terminal-win constant
        plus
        times over opponent replies b
            Pre_ab(U)
      )
~~~

So the Bellman block is a monotone lattice polynomial over the antichain semiring. The mixed reply-cover explosion is exactly expansion of semiring multiplication before antichain minimization.

## Simplifications rejected

Reply dominance removed only about 3.1% and 1.5% of tested reply constraints. Every exact WDL case retained all replies.

Reply boundaries were usually not mover/opponent rectangles:

~~~text
rectangular cases   support1 ~22.5%, support2 ~17.0%
projection-product / exact-boundary ratio
                    support1 ~3.50x, support2 ~3.82x
~~~

Thus mover/opponent pairing is load-bearing.

## Remaining RBA unknown

The semantic operation is no longer missing. The current core is:

> Find a compact/output-sensitive representation and multiplication algorithm for the antichain-semiring product and for composed Bellman lattice polynomials at earlier ranks/root scale, without expanding Cartesian mixed reply covers or materializing every intermediate fiber frontier.

Secondary question:

> Can Bellman-polynomial transformers be fused/factored into a compact normal form over the board-fiber graph?

## Current candidate semantic core

~~~text
board-fiber indexed residuated transition algebra
+ four-front partial-value abstraction
+ idempotent antichain semiring
+ alternating Bellman lattice polynomials
+ resolution ordinal for strong distance
~~~

## Next executable target

~~~text
output_sensitive_antichain_semiring_multiplication
~~~

Do not search for another semantic Bellman operator unless this representation-level seam falsifies the current algebra.
