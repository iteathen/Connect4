# Response-capacity closure as a guarded Hall/matching certificate

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Generalize the already-qualified immediate multiple-singleton response-capacity rule without introducing legal-move-tree search.

For a fixed support/resource/deadline guard, a family of defensive obligations competes for a finite family of response slots. When each obligation can be discharged by one allowed slot and each slot has unit capacity, exact schedulability is a bipartite matching problem. A Hall-deficient subset is therefore an exact resource certificate that at least one obligation cannot be met.

This note is intentionally scoped. It does not claim every Connect-4 strategic interaction is a matching problem; one move may sometimes certify several nonlocal blockers, support/order may be adversarial, and obligations may be conditional. The theorem applies once the selected guard has reduced the relevant resource question to unit-capacity response slots.

## 1. Guarded response-capacity instance

Fix a support/proof context and a proof horizon `D`.

Let

```text
O={o_1,...,o_m}
```

be distinct defensive obligations that must all be discharged to prevent the attacking player from obtaining a certified terminal consequence before `D`.

Let

```text
S={s_1,...,s_n}
```

be the defender's unit-capacity response slots/events available under the same guard before the corresponding obligation deadlines.

For each obligation `o`, define

```text
A(o) subset_of S
```

as the response slots that can legally discharge it in time.

This relation must already include the material facts:

```text
release/playability;
column support;
slot turn ownership;
resource exclusions;
obligation-specific deadline.
```

Do not add an edge merely because the cell is eventually reachable.

## 2. Capacity theorem

Construct the bipartite graph

```text
G=(O,S,E)
```

with

```text
(o,s) in E iff s in A(o).
```

Under the unit-capacity assumptions, every obligation can be discharged iff `G` has a matching covering `O`.

By Hall's theorem, such a matching exists iff for every subset

```text
X subset_of O,
```

we have

```text
|N(X)| >= |X|.
```

Therefore a subset with

```text
|N(X)| < |X|
```

is an exact **response-capacity deficiency certificate**.

## 3. Terminal meaning of a deficiency

A Hall deficiency proves only that at least one obligation in `X` cannot receive a distinct allowed response slot.

It becomes a Connect-4 forced-loss/forced-win certificate when the selected obligation semantics additionally establish:

```text
any unmet obligation in X produces the attacker's terminal completion before D;
no defender terminal completion supersedes it;
first-win stopping is respected.
```

Those are ordinary NDC guards/consequences and remain explicit.

Thus the reusable inference is

```text
obligation family
+ legal response-slot graph
+ Hall deficiency
+ terminal/deadline guard
-> terminal proposition.
```

## 4. Immediate double threat is the size-two case

Suppose the defender faces two distinct currently enabled opponent singleton cells

```text
o_1,o_2
```

and has only the current one-placement response slot.

Then

```text
|X|=2
|N(X)|=1
```

for `X={o_1,o_2}`.

Hall fails immediately.

So the existing exact multiple-singleton response-capacity rule is the smallest Hall-deficiency instance, not a separate tactical ontology.

## 5. Shared defensive cells must be canonicalized before matching

Two residual requirements may be blocked by the **same physical response event**. In that case they do not necessarily create two independent obligations.

Before constructing `O`, normalize the obligation family by its exact discharge semantics:

- if one response event simultaneously discharges several requirements, represent the appropriate combined obligation/coverage relation rather than charging multiple unit jobs blindly;
- if a strategic response slot certifies several blocker clauses at once, its capacity effect must be represented as that multi-consequence action.

Ordinary bipartite matching applies only after each obligation really consumes one unit slot independently.

This prevents a false Hall deficiency from duplicate threat descriptions.

## 6. Time-indexed slots

If the selected proof profile has discrete defender move ranks

```text
s_1 < s_2 < ...,
```

use those move ranks as slot identities.

An obligation with release `r(o)` and deadline `d(o)` may connect only to slots satisfying its exact legal interval and any column/resource constraints.

For simple unit tasks with interval-only availability, the matching can also be checked by standard interval-capacity inequalities. The bipartite graph is the general exact statement.

The earliest rank at which a deficiency becomes unavoidable can be attached to the terminal fact and combined with the guarded closure's min-max proof-rank algebra.

## 7. Relation to the abelian draw odometer

Under strict pure follow-up, the second player effectively chooses which neutral column-pair counter to consume. The explicit even-height draw schedule exists because no offensive obligation removes that scheduler freedom.

A threat certificate changes this situation by adding required defensive work before a deadline.

If enough such obligations are created that their allowed response slots violate Hall, the all-neutral draw odometer is no longer realizable: some attacking terminal obligation survives.

So response-capacity deficiency is a precise generic mechanism by which the decisive win bit can interrupt the otherwise commuting counter process.

This does not yet prove that the standard 7x6 center strategy creates such a deficiency from the empty board.

## 8. Transversal-matroid interpretation

For one fixed guarded bipartite response graph, the obligation subsets that can be matched into response slots form a transversal matroid.

A Hall-deficient set is a dependent set in that response-capacity structure.

This is an exact structural comparison for the selected capacity instance. Connect-4-specific support/deadline logic owns the graph itself; generic matching/matroid terminology does not define which edges are legal.

## 9. Interaction with blocker clauses

Ownership blocker clauses and response-capacity obligations are different levels:

```text
blocker clause:
  at least one cell in B is unavailable to a player;

response obligation:
  defender must spend a legal response resource to prevent an attacking terminal target.
```

A response slot may certify a blocker clause; blocker propagation may eliminate a residual requirement; reduced residuals may remove or create capacity obligations.

Hence matching belongs inside NDC feedback rather than beside it.

## 10. Controller/opponent quantification

If the attacking player can choose among several ways to create obligation graphs, the proof layer may select a winning deficient graph (`min` over valid controller certificates in earliest-rank terms).

If the defender/opponent can choose among variants, a guaranteed win must establish deficiency or another terminal certificate in every admissible variant (`max` / universal branch in the proof hypergraph).

Do not union response graphs from incompatible variants.

## 11. Falsifiers / scope boundary

The matching abstraction is insufficient when:

- one action can discharge arbitrary subsets of obligations and cannot be represented by the chosen unit-job normalization;
- response availability itself depends on unresolved strategic choices not retained in the guard;
- two slots share a non-unit resource constraint not encoded by slot identity;
- eventual slot reachability is used in place of completion-before-deadline legality;
- defender counter-wins can occur before an unmet obligation terminalizes.

In those cases enrich the resource structure; do not force a Hall model.

## Next target

At the standard width-7 center seam, identify the first provable family of future singleton/threat obligations created by a non-neutral offensive deviation. Construct its exact guarded response-slot graph and determine whether the resulting pressure is:

```text
Hall-deficient directly;
or
only becomes deficient after affine/clause/NDC feedback.
```

The latter would explain why flat strategic evaluation is strong late but insufficient early.

## Proof boundary

Hall's condition is an exact theorem for the explicitly defined unit-capacity bipartite instance. The Connect-4 inference to a terminal result requires the stated support/deadline/first-win guards. No claim is made that all strategy fragments reduce to matching.
