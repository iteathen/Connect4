# Anchored zero-edge residuals: rewriting winspace and pair blockers in control-potential coordinates

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Continue the control-potential/domain-wall reduction into player-specific residual winning requirements.

A geometric four-line can be represented by one owner anchor plus three adjacent disagreement edges. This is an invertible change of coordinates. Under it, first-player and second-player wins have identical geometric target coordinates; only the anchor lift differs.

This absorbs pair blockers and odd/even target ownership into the same affine parity system while preserving nonlinear blocker clauses and NDC deadlines where they remain necessary.

## 1. Four-cell path transform

Let a geometric winning line be ordered as

```text
ell=(v0,v1,v2,v3).
```

Let

```text
q_i=q(v_i) in F2.
```

Define path coordinates

```text
a   = q_0
e_0 = q_0+q_1
e_1 = q_1+q_2
e_2 = q_2+q_3.
```

The transform

```text
(q_0,q_1,q_2,q_3) -> (a,e_0,e_1,e_2)
```

is invertible, with inverse

```text
q_0 = a
q_1 = a+e_0
q_2 = a+e_0+e_1
q_3 = a+e_0+e_1+e_2.
```

So no information is lost.

## 2. Player-specific win target

Let player bit `p` use the project convention

```text
p=0 first player
p=1 second player.
```

Player `p` owns the entire line iff

```text
a=p
e_0=e_1=e_2=0.
```

Equivalently shift the anchor by `p`:

```text
z_0=a+p
z_1=e_0
z_2=e_1
z_3=e_2.
```

Then **either player's win target is simply**

```text
z=(0,0,0,0).
```

The geometry is player-independent; player identity is one affine anchor shift.

## 3. Terminal sign projection

When

```text
e_0=e_1=e_2=0,
```

all four owners are equal and the winner is exactly the anchor `a`.

Therefore the selected conceptual result bits

```text
[sign/player,win]
```

have a literal line-coordinate interpretation:

```text
win bit    = certified terminal zero-edge path;
player bit = anchor a of that path.
```

This is why

```text
00 draw
01 first-player win
11 second-player win
```

fits the algebra without transposition.

## 4. Pair blockers are odd path parity

Take any two cells `v_i,v_j` on the line, `i<j`.

Their owner XOR is

```text
q_i+q_j = e_i+e_(i+1)+...+e_(j-1).
```

If a certified response relation establishes

```text
q_i+q_j=1,
```

then the edge path between them has odd parity and cannot have all edge coordinates zero.

Therefore the line cannot become monochromatic for either player.

So every valid pair blocker on a winning line is exactly an odd path-parity certificate incompatible with the universal zero-edge target.

The support/resource/deadline proof that establishes the pair blocker remains required.

## 5. Fixed opponent ownership is an anchor inconsistency

If any line cell is fixed to the opponent of player `p`, then

```text
q_i+p=1.
```

Using the inverse path transform, this is an affine equation in the anchor and edge coordinates inconsistent with the player-`p` all-zero target.

Thus ordinary physical blocking and strategic pair blocking are both affine contradictions to the same line target:

```text
wrong owner anchor/path value
or
odd path parity.
```

## 6. Singleton threat as one potential equation

Suppose a player-`p` residual line has exactly one future cell `t` left and all already occupied cells are player `p`.

Completing the line is equivalent to

```text
q(t)=p.
```

From the CPC control-potential theorem,

```text
q(t)=kappa+r(t)+rho(t),
kappa=(W-1)H mod 2.
```

Therefore the singleton completion condition is the one affine equation

```text
rho(t)=p+kappa+r(t).
```

The usual odd/even threat ownership rule is thus an anchored control-potential equation, subject to the same reservation/resource/deadline guards as CPC.

## 7. Two threats share the same geometric target language

Two distinct playable singleton obligations for the same opponent are not two new tactical primitives.

They are two distinct target events at which the corresponding anchored zero-edge path would close.

If one placement response slot cannot invalidate both and no immediate mover win supersedes them, the existing exact response-capacity rule gives a forced loss.

The domain-wall transform changes only the representation of the obligations; it does not weaken the response-capacity theorem.

## 8. Residual requirement as an affine target with support

For a player `p`, an alive geometric line represents the target assignment

```text
q(v0)=q(v1)=q(v2)=q(v3)=p.
```

In anchored path coordinates this is one affine point

```text
(a,e0,e1,e2)=(p,0,0,0).
```

A partial position/certificate fixes some cell owners or parity relations and leaves others future. Residualization asks which remaining future ownership facts are still needed to reach that target under gravity/support order.

Thus the WSL residual subset can be interpreted as a support-aware projection of an anchored affine target rather than as a fundamentally different player-specific object.

No claim is made that the existing 625-element standard residual universe automatically shrinks in cardinality under this representation; the value is the shared affine relation and cross-line parity reuse.

## 9. What linear parity does not capture

A general blocker statement

```text
opponent cannot own every event in B
```

need not identify a fixed pair with XOR `1` or a fixed wrong-owner anchor.

It is a nonlinear clause/disjunction over ownership possibilities.

Therefore:

- singleton fixed ownership and pair blockers belong directly to the affine parity layer;
- larger blocker clauses remain WSL/U2 hypergraph facts unless separately reduced;
- support/resource/deadline premises remain certificate metadata;
- completion-before-deadline remains temporal NDC structure.

Do not force those facts into XOR merely for representation uniformity.

## 10. Filtered signed-constraint interpretation

The pairwise ownership layer can now be viewed as a `Z2` signed/gain graph whose vertices are physical/future events and whose edges are exact same/opposite-owner relations.

As proof progresses, exact edges/anchors may become certified at specific ranks/horizons. At any fixed proof horizon, connected parity components determine relative owner potentials up to anchors/global complement.

A line target is impossible as soon as the active constraints imply an affine contradiction to

```text
(a,e0,e1,e2)=(p,0,0,0)
```

before its completion deadline.

This suggests a filtered/causal signed-constraint layer underneath NDC. It is a representation proposal for pairwise facts, not a replacement for nonlinear blocker closure.

## 11. Reduced NDC vocabulary after this pass

The currently necessary primitive shapes are now at most:

```text
binary control potential / ownership anchors;
pairwise potential differences (XOR edges);
zero-edge path win targets;
nonlinear blocker clauses where no pairwise reduction exists;
support/accessibility;
resource compatibility;
rank/horizon/deadline;
first-win terminal semantics.
```

Named tactical/rule families are certificate generators for these facts rather than separate terminal ontologies.

## Next theorem target

Inspect the current WSL/NDC blocker families and classify which blockers are:

```text
A. affine contradictions (anchor or pair/path parity);
B. clauses that become affine after another exact premise is added;
C. irreducibly nonlinear blocker clauses under the present variable set.
```

This is the next decomposition needed before a signed all-board selector can be sought honestly.

## Proof boundary

Sections 1-7 are exact binary algebra plus already-qualified CPC/response-capacity semantics. Section 8 is a representation equivalence of the full line target, not a claim of WSL cardinality reduction. Sections 9-11 preserve nonlinear and temporal facts explicitly. No solved W/D/L data is used.
