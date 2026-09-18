# Connect-4 derived difference axioms

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Record a more primitive representation of the Connect-4 geometry exposed by decomposing before invariant-isomorphism search.

The four geometric line directions need not be treated as unrelated primitive classes. Over `F2`, length four is a third finite difference, and diagonal derivatives are algebraically derived from the two axis derivatives plus mixed terms.

This note is structural only. It does not assert game value or optimal play.

## 1. Length four is a third difference

For a translation operator `T_d` in any board direction `d`, define

```text
partial_d = 1 + T_d.
```

Over `F2`,

```text
1 + T_d + T_d^2 + T_d^3
  = (1+T_d)^3
  = partial_d^3.
```

Therefore every geometric Connect-4 incidence window is a translated third derivative.

This is the operator form of the one-dimensional quotient recurrence

```text
[e_(j+3)] = [e_j]+[e_(j+1)]+[e_(j+2)]
[e_(j+4)] = [e_j].
```

The four-periodicity is derived from the third-difference axiom; it is not a fitted board-size pattern.

## 2. Axis reduction

Write

```text
X = partial_x
Y = partial_y.
```

After quotienting by the horizontal and vertical Connect-4 windows, the residual axis algebra obeys

```text
X^3 = 0
Y^3 = 0
XY = YX.
```

The ordinary `W,H>=4` residual cell module is therefore represented inside the nine monomials

```text
1, X, X^2,
Y, XY, X^2Y,
Y^2, XY^2, X^2Y^2,
```

with boundary truncation automatically reducing this module when an axis has length below three.

This is the algebraic source of the `min(W,3)min(H,3)` residual dimension in the total-domain incidence decomposition.

## 3. Rising diagonal is derived

The rising-diagonal translation is

```text
T_plus = T_x T_y = (1+X)(1+Y).
```

Hence

```text
partial_plus
  = 1 + T_plus
  = X + Y + XY.
```

Inside the axis-reduced algebra (`X^3=Y^3=0`), cubing gives

```text
partial_plus^3 = XY^2 + X^2Y.
```

Thus the rising-diagonal four-window imposes the single mixed-derivative relation

```text
XY^2 = X^2Y.
```

In coefficient notation this is the previously observed condition

```text
a_12 = a_21.
```

The condition is therefore derived from the axis derivative algebra, not an independent empirical diagonal axiom.

## 4. Falling diagonal is derived

Within `Y^3=0`,

```text
T_y^-1 = (1+Y)^-1 = 1+Y+Y^2,
```

because

```text
(1+Y)(1+Y+Y^2)=1+Y^3=1.
```

The falling-diagonal translation is

```text
T_minus = T_x T_y^-1.
```

Therefore

```text
partial_minus
  = 1 + T_minus
  = X + Y + XY + Y^2 + XY^2.
```

Cubing in the same truncated algebra gives

```text
partial_minus^3
  = XY^2 + X^2Y + X^2Y^2.
```

Together with the rising relation, the falling relation contributes precisely

```text
X^2Y^2 = 0,
```

which is coefficient condition

```text
a_22 = 0.
```

Therefore the two regular-board diagonal rank corrections are exactly the two mixed-derivative relations

```text
XY^2 + X^2Y = 0
X^2Y^2 = 0.
```

This reproduces the earlier seven-dimensional incidence cokernel from a simpler operator decomposition.

## 5. Why 4x4 is not a new axiom

The operator identities above describe the interior derivative relations. On a finite board, a relation can contribute rank only when its translated support/start neighborhood is actually present.

The total-domain diagonal-start rectangle has dimensions

```text
a=(W-3)_+
b=(H-3)_+.
```

Its checkerboard residue map has rank

```text
d=min(2,ab).
```

At `4x4`, `ab=1`, so the two diagonal orientations have only one start neighborhood and realize the same quotient residue; only one of the two mixed relations is independently observable at that boundary size. Once `ab>=2`, both checkerboard start neighborhoods occur and both mixed directions are realized.

So the 4x4 incidence defect is boundary realization of the same derivative system, not a separate law.

## 6. Response pairs are first derivatives

A two-cell mate-response pair in direction `d` has incidence

```text
1 + T_d = partial_d.
```

Thus the universal interval-pair lemma has an operator explanation:

```text
Connect4 window = partial_d^3
response pair   = partial_d
partial_d^3     = partial_d * partial_d^2.
```

A length-four requirement therefore carries a first-derivative factor that a legal response matching may exploit. Gravity determines whether that algebraic factor is available as a causal response, but the geometric divisibility is intrinsic.

This links the earlier mate-response theorem to the same derivative algebra rather than treating response matching as an unrelated strategic object.

## 7. Candidate decomposition of the strategic calculus

The emerging representation is:

```text
third derivatives   -> geometric winning requirements
first derivatives   -> local mate/response resources
mixed derivatives   -> diagonal/inter-axis coupling
support order        -> which derivative resources are causally legal
GF(2) event rank     -> who controls an exposed event
NDC deadlines        -> whether a response arrives before completion
```

This is a candidate structural factorization, not yet a complete game-value theorem.

The immediate research question is whether the remaining Allis/U1/U2/NDC response programs reduce to compositions of these first/mixed derivative resources plus support/deadline guards. If a valid strategic construction cannot be represented this way, that is evidence for a genuinely missing derived axiom.

## 8. Isomorphism rule

Cross-board invariant-isomorphism search should occur only after this decomposition.

A useful isomorphism must preserve at least:

```text
axis derivative modules
mixed-derivative coupling
start-neighborhood adjacency/checkerboard class
gravity support direction
response-resource relation
event-rank parity/deadline labels.
```

Ordinary grid adjacency or equal scalar ranks are insufficient. Conversely, named historical rule classes should not be preserved if they decompose into the same derivative/support relation.

## Proof boundary

All identities in sections 1-5 are exact algebra over `F2` plus finite-boundary start availability. Section 6 identifies the incidence shape of response pairs; legality remains governed by the existing support/response semantics. Sections 7-8 are research direction, not promoted theorem claims.
