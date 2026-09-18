# Candidate theorem — support-local residual order induces isotone exact action value

**Date:** 2026-09-18  
**Status:** deductive candidate with four complete-control adversarial checks  
**Authority effect:** none  
**Base:** Connect4 IsoGraph authority 1.1 plus the newer q future-behavior candidate

## Purpose

Find an exact relation weaker than complete future-behavior identity but strong enough to determine the best move without traversing the full q future.

The candidate is not a new solver primitive. It is a partial order already implicit in the residual/topology semantics.

## Definitions

Fix one legal nonterminal support `S` and therefore one side to move `p`.

For player `r`, let the normalized residual antichain denote the monotone completion function:

~~~text
F_r(q) = OR_(R in residual_r(q)) AND_(x in R) X_x
~~~

where `X_x` means that future cell `x` is owned by `r` in the contemplated completion assignment.

For two exact behavior states `qA,qB` with the **same support S**, define:

~~~text
qA >=_p qB
~~~

iff:

~~~text
F_p(qA) >= F_p(qB) pointwise

and

F_(1-p)(qA) <= F_(1-p)(qB) pointwise.
~~~

Equivalently in minimal-antichain form:

- every mover residual in `qB` is covered by a subset residual in `qA`;
- every opponent residual in `qA` is covered by a subset residual in `qB`.

Thus `qA` gives the current player no harder a winning condition and the opponent no easier a winning condition.

## Why equal support is load-bearing

Equal support gives:

- the same legal action alphabet;
- the same landing cell for every action;
- the same side to move;
- the same future gravity/accessibility schedule for any common action sequence.

Cross-support residual implication is not sound by itself. The bounded controls produced explicit false action-dominance claims when this guard was removed.

## Lemma 1 — same-action cofactor preserves the favorable order

Take `qA >=_p qB` at equal support and apply the same legal action.

The action has the same landing cell and owner in both states.

Residual updates are exact Boolean cofactors:

- owner residuals containing the cell contract;
- opponent residuals containing the cell are killed;
- minimal-antichain normalization preserves the represented monotone function under first-win stopping.

Boolean implication is preserved by applying the same cofactor.

Therefore, whenever both actions remain nonterminal, the two successor states have the same successor support and retain the same absolute beneficiary-favorable ordering.

## Lemma 2 — terminal changes are favorable-monotone

Under the same action sequence:

- a `p` completion possible in the less-favorable state cannot become impossible in the more-favorable state;
- an opponent completion possible in the more-favorable state cannot become impossible in the less-favorable state in the direction that would hurt `p`;
- earlier `p` terminalization or later opponent terminalization is favorable under first-win stopping.

So the order does not create a worse terminal token for `p` along a common legal action.

## Candidate theorem — state value

Let `V_p(q)` be the exact beneficiary-oriented strong value under:

~~~text
win > draw > loss
faster forced win is better
slower forced loss is better.
~~~

Then for equal-support states:

~~~text
qA >=_p qB
    ->
V_p(qA) >= V_p(qB).
~~~

Proof candidate: induction on remaining cells.

At each common legal action, Lemmas 1-2 preserve or improve the beneficiary-oriented child/terminal value. The controller uses max and the opponent uses min over the same action alphabet. Max/min are monotone operators, and adding one ply preserves the within-win and within-loss distance order. Therefore the parent value is monotone.

## Corollary — fixed-action value

For every legal action `a` at support `S`, define exact strong action value `Q_a(q)`.

Then:

~~~text
qA >=_p qB
    ->
Q_a(qA) >= Q_a(qB).
~~~

The action is common because support is equal; apply the theorem to its terminal result or successor.

## Corollary — exact action-value frontiers

For any fixed support `S`, action `a`, and strong-score threshold `theta`, the set:

~~~text
U(S,a,theta) = { q | Q_a(q) >= theta }
~~~

is upward-closed under `>=_p`.

Every finite upward-closed set is represented exactly by its minimal antichain generators.

Therefore exact action value can be represented by nested support-local antichain frontiers:

~~~text
support S
+ action a
+ threshold antichains
-> exact Q_a(q)
~~~

and exact best move is:

~~~text
argmax_a Q_a(q).
~~~

This does not require the full future-behavior quotient to remain as a transition-closed policy automaton.

## Important negative result

The predicate:

~~~text
`action a is currently optimal`
~~~

is **not** upward-closed under this state order.

A more favorable state can improve another action even more and remove `a` from the argmax set.

So the exact object is the family of **action-value frontiers**, not a direct best-action antichain.

## Complete-control evidence

Across the complete 4x3 c3, 4x4 c4, 5x3 c4, and 4x5 c4 controls:

~~~text
comparable q-state pairs             6,300,753
state W/D/L violations                       0
state strong-distance violations              0

comparable fixed-action pairs        18,076,405
action W/D/L violations                      0
action strong-distance violations             0
~~~

These checks are adversarial evidence for the proof candidate, not the proof itself.

## Scope

This theorem candidate is stated over an exact residual behavior carrier.

The four bounded controls have complete exact qualification.

Applying it directly to standard 7x6 through `q = support + residual antichains` depends on independent qualification/promotion of the newer standard-7x6 q-congruence result.

## Consequence for solver methodology

The natural exact method becomes:

~~~text
current support S
+ current residual state q
        |
        v
for each legal action a:
    evaluate Q_a(q) by support-local threshold-frontier membership
        |
        v
choose maximal action value
~~~

IsoMax can consume these frontiers as exact bounds/closures that eliminate recursive siblings.

BSFP can attempt to propagate only frontier generators rather than interior states.

Both are consumers of the same Connect4 order/frontier relation.
