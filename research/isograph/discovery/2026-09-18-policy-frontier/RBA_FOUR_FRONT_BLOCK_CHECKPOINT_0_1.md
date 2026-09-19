# RBA four-front symbolic block checkpoint 0.1

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** post-1.1 research checkpoint; no authority promotion
**Research direction:** Josh Oshiro

## Result

The six-value partial WDL domain

```text
LL LD LW DD DW WW
```

does not require six independent symbolic q-regions.

Represent a partial value as endpoint functions

```text
lower, upper : q -> {LOSS < DRAW < WIN}
lower <= upper
```

Each isotone three-valued endpoint is determined by two nested upward-closed threshold regions.

Therefore the exact symbolic carrier is four nested fronts:

```text
lower >= DRAW
lower >= WIN
upper >= DRAW
upper >= WIN
```

with the expected nesting constraints.

## Arbitrary q-dependent two-ply test

For each rank-37 leaf support in the two pathological rank-35 future cones, random monotone lower/upper endpoint functions were generated independently subject to `lower <= upper`.

The four leaf threshold fronts were converted to exact minimal antichain boundaries.

A direct two-ply symbolic operator then used only:

- composed residual cofactors;
- coordinate frontier preimages;
- opponent-reply intersection in the parent favorable lattice;
- current-player action union;
- exact terminal constants.

No parent q-pair enumeration was used in the symbolic construction.

Qualification used explicit interval minimax over all parent q pairs.

```text
supports                                      2
random trials/support                         3
complete endpoint-front comparisons          24
generator-set mismatches                      0
```

## Chained four- and six-ply symbolic blocks

The same four-front interface was then used as the **only value-information interface between two-ply blocks**.

Leaf partial-value functions were placed at rank 39 or rank 41. Two-ply symbolic transformers were applied bottom-up in blocks:

```text
rank35 -> rank37 -> rank39
rank35 -> rank37 -> rank39 -> rank41
```

The symbolic calculation passed only the four front families between blocks, not q-state value tables.

Against explicit interval minimax:

```text
depths                               4, 6
state-front generator comparisons     32
state-front mismatches                  0

largest raw universal intersection    840
largest normalized intersection        56
largest fixed-action front             57
largest final state front              85
```

## Action-specific preservation

Exact best-move recovery also requires action bounds.

The root fixed-action four fronts were compared against explicit block-minimax action endpoint values.

```text
action-front generator comparisons     96
mismatches                               0
```

Thus the four-front symbolic block algebra preserves the partial action-value information needed for later exact argmax/best-move recovery.

## Theorem candidate — four-front closure

A six-valued partial WDL function is exactly a pair of isotone endpoint maps into the finite 3-chain.

Each endpoint map is exactly represented by its two threshold upsets.

For an even-depth alternating block:

- the scalar block transformer is monotone in every frontier value;
- lower and upper transform independently;
- each threshold preimage is upward closed;
- current-player choice is union;
- opponent choice is intersection;
- exact q/cofactor preimage preserves the threshold semantics.

Therefore the four-front carrier is closed under even block composition.

For an odd-depth block, global polarity reverses and lower/upper swap under negation. A one-ply endpoint transformer plus even blocks closes arbitrary finite depth.

## Important negative — naive Upper-only deep flattening

A deliberately simpler construction propagated only success/upward fronts through a deeply flattened 4/6-ply root-space expression.

It passed at depth 2 but failed at depth 4 and 6.

Reason:

> internal early-terminal branches require nonterminal/complement guards; discarding the paired lower/upper/prefix information is not closed under deeper nesting.

This rejects that specific incomplete representation. It is not a theorem that no alternative Upper-only normal form can exist.

## Transformer homomorphism test

The resulting exact two-ply front transformer `T` was then tested for a stronger simplifying law.

For random monotone leaf fronts A and B:

```text
T(A union B) ?= T(A) union T(B)
T(A intersect B) ?= T(A) intersect T(B)
```

Results:

### Support [5,5,5,2,6,6,6]

```text
trials                         20
join-homomorphism failures     20
meet-homomorphism failures     17

states in T(A∨B) beyond
T(A)∨T(B)                  11,531

states in T(A)∧T(B) beyond
T(A∧B)                        973
```

### Support [5,5,2,5,6,6,6]

```text
trials                         20
join-homomorphism failures     20
meet-homomorphism failures     12

states in T(A∨B) beyond
T(A)∨T(B)                   9,783

states in T(A)∧T(B) beyond
T(A∧B)                        786
```

No opposite-direction violations occurred.

## Structural reason — mixed reply covers

For a two-ply WDL threshold, schematically:

```text
T(U)
    =
OR over current actions a
    AND over opponent replies b
        Pre_ab(U)
```

Each preimage preserves union.

But:

```text
AND_b (Pre_b(A) OR Pre_b(B))
```

is not generally:

```text
(AND_b Pre_b(A))
OR
(AND_b Pre_b(B))
```

because different opponent replies may be covered by different inputs.

Distributing the expression introduces **mixed choice functions** assigning A/B independently to replies.

That is exactly the new state mass observed in `T(A∨B)`.

This is the remaining irreducible alternating-game operation.

## Consequence for RBA

Symbolic block composition is now closed.

The next unknown is more specific:

> find a compact/output-sensitive normal form for the mixed reply-cover combinations generated by alternating union/intersection, without expanding their full Cartesian choice-function product.

This points directly toward:

- antichains of minimal reply covers;
- distributive-lattice dualization;
- minimal transversals / blocker algorithms;
- positive alternating-automata formulas with absorption;
- monotone lattice-polynomial normal forms.

The old question “can symbolic six-valued blocks compose?” is no longer open.

## Current disposition

```text
six scalar value regions required                 NO
four nested endpoint fronts sufficient            YES / theorem-shaped
two-ply arbitrary partial-info composition         PASS
4/6-ply chained symbolic composition               PASS
action-front preservation                          PASS
simple join/meet homomorphism                      DISPROVEN
mixed reply-cover operation                        LOAD-BEARING
compact mixed-cover normal form                    OPEN
empty standard root solved                         NO
authority 1.1 mutated                              NO
typed relation promoted                            NO
```
