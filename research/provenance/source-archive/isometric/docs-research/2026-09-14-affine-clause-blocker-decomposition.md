# Affine + monotone-clause decomposition of blocker and response logic

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Correct and refine the ownership/blocker decomposition.

A two-cell blocker is **not automatically** an XOR/split relation. Some qualified strategic facts establish exact opposite ownership; others establish only that an opponent cannot own both cells. The latter is a Boolean clause and permits the controller to own both.

This note separates the exact affine layer from the monotone blocker-clause layer and shows that the existing WSL upward-closure rule is exactly clause/requirement incompatibility.

Where earlier exploratory notes loosely described named pair blockers as XOR/domain-wall facts, this note is the authoritative refinement: only an explicitly certified split relation belongs to the XOR layer.

## 1. Relative ownership variables

Fix an opponent/player target bit `p` and define, for every relevant event/cell `v`,

```text
x_v = q(v)+p.
```

Then

```text
x_v=0 -> v is owned by player p
x_v=1 -> v is not owned by player p.
```

For a two-player completed ownership assignment, `x_v=1` means the other player owns `v`. For future proof facts it means the certified ownership relation excludes player `p` as appropriate to the certificate horizon.

## 2. Blocker theorem as a monotone clause

A certified blocker set `B` against player `p` means

```text
player p cannot own every event in B
```

before the blocker certificate's relevant deadline/horizon.

In relative bits this is exactly

```text
OR_(v in B) x_v = 1.
```

So every blocker is a positive monotone clause

```text
C_B = join_(v in B) x_v.
```

The blocker certificate asserts `C_B=1` under its support/resource/deadline premises.

## 3. Residual requirement as the all-zero assignment on its cells

A player-`p` residual requirement `R` asks player `p` to own every event in `R` before terminal completion.

In relative bits the completion target is

```text
x_v=0 for every v in R.
```

Thus completion of `R` assigns zero to all variables in that requirement.

## 4. WSL upward closure is logical subsumption

Suppose blocker `B` is certified.

If

```text
B subset_of R,
```

then completing residual requirement `R` would set

```text
x_v=0 for every v in B,
```

which falsifies the certified blocker clause

```text
C_B=1.
```

Therefore `R` is impossible.

Conversely, the blocker clause over `B` alone says nothing about a requirement that does not contain all variables of `B`.

Hence the exact structural rule

```text
Up[B]={R : B subset_of R}
```

is precisely the set of residual all-zero targets contradicted by clause `C_B`.

This recovers the existing U2/WSL upward closure without a separate blocker-specific algebra.

## 5. Singleton blockers

For

```text
B={u},
```

the blocker clause is

```text
x_u=1.
```

So a singleton blocker is both:

- a unit monotone clause;
- an affine fixed-ownership/anchor fact.

Claimeven-style guaranteed ownership consequences therefore sit in the intersection of the affine and clause layers when their ownership premise is exact.

## 6. Pair blockers versus split/XOR relations

For

```text
B={u,v},
```

the blocker fact is

```text
x_u OR x_v = 1.
```

This allows

```text
(x_u,x_v)=(1,0),(0,1),(1,1).
```

It does **not** imply

```text
x_u+x_v=1.
```

An exact split/response ownership relation is the stronger affine fact

```text
x_u+x_v=1,
```

which allows only

```text
(1,0),(0,1).
```

Therefore:

> pair blocker != XOR unless the rule/certificate explicitly proves split ownership.

Baseinverse/Vertical/Lowinverse/Highinverse/Baseclaim consequences must be classified instance-by-instance according to the actually qualified consequence. Historical rule names do not promote a blocker clause into an XOR relation.

## 7. Affine facts can discharge clauses

Suppose a pair clause

```text
x_u OR x_v = 1
```

is certified.

If an affine premise gives

```text
x_u+x_v=1,
```

the clause is automatically satisfied.

If instead

```text
x_u+x_v=0,
```

then the two variables are equal and the clause reduces to

```text
x_u=1,
```

so both variables are fixed to `1`.

Likewise if one variable is fixed `0`, the pair clause forces the other to `1`; if one is fixed `1`, the clause is already discharged.

Thus parity/ownership inference can turn a nonlinear blocker into new affine anchors.

## 8. General clause propagation

For a certified blocker clause

```text
x_1 OR ... OR x_k = 1:
```

- if any literal is proved `1`, the blocker is discharged;
- if all but one literals are proved `0`, the final variable is forced to `1`;
- affine equalities/XOR relations may identify or complement literals, reducing the effective clause;
- after reduction, a clause may become a unit anchor, a tautology, or remain genuinely nonlinear.

This is the concrete algebraic form of one major NDC feedback path:

```text
parity/ownership facts
-> simplify blocker clause
-> new fixed ownership
-> eliminate requirements
-> expose stronger parity/ownership facts
-> ...
```

## 9. Blocker antichains are clause antichains

If

```text
B1 subset B2,
```

then clause `C_B1` is stronger for requirement blocking: every residual requirement containing `B2` also contains `B1` and is already killed by the smaller blocker.

So retaining minimal blocker sets is exactly retaining a minimal monotone-clause antichain under variable-set inclusion.

This is the blocker-side dual of residual minimal-antichain normalization.

## 10. Current exact logical stack

The ownership/proof layer now separates cleanly into:

```text
AFFINE LAYER
  q(v)=p
  q(u)+q(v)=b
  control-potential differences
  domain-wall/path parity

MONOTONE CLAUSE LAYER
  OR_(v in B) (q(v)+p) = 1
  blocker antichains / WSL upward closure

SUPPORT/TEMPORAL LAYER
  playability
  response resources
  event precedence
  rank/horizon
  completion-before-deadline
  first-win semantics.
```

Named strategic rules are certificate generators into these layers.

## 11. Relation to anchored zero-edge win targets

For a four-cell geometric line, player `p` completion is the affine target

```text
anchor=p
three path disagreements=000.
```

A fixed wrong-owner fact or exact odd path parity gives an affine contradiction immediately.

A blocker clause says that at least one selected line event must differ from `p`, but may not identify which one. It is therefore a disjunctive contradiction to the same all-`p` target.

Both mechanisms terminate the same residual requirement; they differ only in proof strength/shape.

## 12. Isomorphism class

Ignoring temporal guards, this is a hybrid Boolean constraint system consisting of:

```text
affine/XOR equations over F2
+ positive monotone clauses.
```

The Connect-4-specific structure lies in:

```text
which variables come from support-ordered board events;
which clauses are subsets of geometric four-lines;
which parity edges can be legally certified;
which clauses/edges hold before which deadlines.
```

Generic XOR-SAT/CNF complexity results are comparison context, not solver authority; the support/path/deadline structure must be exploited rather than erased.

## Next theorem target

Classify every currently used blocker/certificate family into:

```text
A. exact affine fact;
B. monotone blocker clause;
C. guarded composition of A/B with deadline;
D. genuinely missing relation, if any.
```

Then express NDC closure as propagation on the affine+clause system plus the minimum temporal metadata required for soundness.

## Proof boundary

Sections 1-9 are direct Boolean reformulations of the existing blocker definition and WSL subset coverage. They do not strengthen any rule's certified consequence. In particular, no named pair blocker is treated as XOR without an independent split-ownership proof. Temporal validity remains exactly as strong as the underlying certificate.
