# CPC semantic renewal operator theorem

**Date:** 2026-09-30  
**Status:** exact rank-local proof-automaton theorem / candidate CPC renewal primitive  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Replace bounded physical continuation replay in the response-template renewal experiments with an exact transition operator on the CPC/RBA semantic state itself.

The earlier two-switch control established a sound survival distinction at the consumed v4 boundary:

\[
[5,5,7]
\]

for candidates 2, 3, and 6.

That control was valid as theorem qualification, but it materialized move-sequence successors. The desired move finder should operate on the current rank-local proof state, not on history strings or an ordinary game tree.

This theorem shows that the renewal calculation is a local automaton over:

- support heights;
- side to move;
- the CPC/RBA residual coordinate;
- a complete synchronized-response template;
- exact RBA cofactor transport.

No colored history, oracle value, minimax, negamax, or alpha-beta recursion is required.

## 1. Semantic state and exact transition

Let \(q(P)\) be the prepared CPC/RBA state.

The state contains the support vector and the upward-closed residual coordinates for both players.

For a legal placement in column \(c\), use the exact RBA cofactor

\[
C_c(q)
\]

implemented by \`connect4RbaCofactorKnownHeight()\`.

Its transition law is the semantic residual law:

- advance the support height in the chosen column;
- mover residuals containing the landing cell lose that cell;
- opponent residuals containing the landing cell are destroyed;
- retained residuals are re-expanded into the exact child coordinate;
- immediate terminal completion is detected before nonterminal transport.

Thus renewal needs no move-history reconstruction.

## 2. Fixed-template base classes

For odd physical horizon \(D\), define \(B_D\) as the set of nonterminal attacker-to-move CPC states for which one complete synchronized-response template covers every active minimal attacker residual with optimistic completion rank at most \(D\).

By the already-qualified bounded synchronized-response theorem:

\[
q\in B_D
\Longrightarrow
\text{attacker cannot terminally complete through }D.
\]

The executable control uses \(B_3,B_5,B_7\).

## 3. Exact response transport operator

For a complete response template \(\Pi\) at state \(q\), every legal attacker frontier cell \(x\) must have a prescribed response mate

\[
r_\Pi(x).
\]

For each legal attacker column:

1. apply the exact attacker cofactor;
2. reject the template if the attacker terminally wins on that placement;
3. verify that the prescribed response cell is immediately legal;
4. apply the exact defender cofactor;
5. if the defender terminally wins or the board ends in a draw, the branch is closed against a later attacker win;
6. otherwise the exact successor semantic state \(q'\) has the attacker to move again.

No other observation is used.

## 4. Renewal predecessor

For any already-sound CPC proof class \(S\), define

\[
\mathcal R(S)
\]

as the set of CPC states \(q\) for which there exists one complete response template \(\Pi\) such that **every** legal attacker trigger, followed by \(\Pi\)'s exact response transport, either:

- closes in a defender/draw terminal; or
- reaches a semantic successor in \(S\).

If every state in \(S\) survives through horizon \(D\), then

\[
\boxed{
q\in\mathcal R(S)
\Longrightarrow
q\text{ survives through }D+2.
}
\]

### Proof

The attacker cannot terminally complete on the trigger because such a branch invalidates the candidate template.

The prescribed defender response occurs on the next physical ply and is exact/legal by the response-template theorem and cofactor check.

A defender/draw terminal closes the branch. Otherwise the successor is in \(S\), which prevents attacker completion through the next \(D\) plies.

Therefore every attacker branch survives through \(D+2\). The defender selects the witnessing template.

QED.

## 5. Finite proof-class automaton used by the control

Define:

\[
S_5=B_5\cup\mathcal R(B_3).
\]

Then every state in \(S_5\) has a constructive survival-through-5 certificate.

Define:

\[
S_7=B_7\cup\mathcal R(S_5).
\]

Then every state in \(S_7\) has a constructive survival-through-7 certificate.

These definitions are proof-class transitions. They are not W/D/L recurrence and do not evaluate arbitrary child values.

## 6. Repairability controls

The renewal feature census contains 18 exact H=3 states whose labels were derived structurally, not from Pons:

- 5 **repairable** states: fixed \(H=3\), one-switch \(H=5\);
- 13 **nonrepairable** states: fixed \(H=3\), one-switch remains \(H=3\).

The semantic renewal operator is required to reproduce all 18 labels using only \(q\), exact cofactors, and response templates.

This is a stricter control than matching the three consumed candidate roots alone.

## 7. Consumed v4 boundary

At the three children of prefix \`444441566\`:

- candidate 2 is in \(S_5\) but not \(S_7\);
- candidate 3 is in \(S_5\) but not \(S_7\);
- candidate 6 is in \(S_7\).

Therefore the semantic proof automaton reproduces the bounded two-switch survival result:

\[
\boxed{
\underline T(P_2)\ge5,\qquad
\underline T(P_3)\ge5,\qquad
\underline T(P_6)\ge7.
}
\]

The important improvement is architectural: this result is now expressed entirely as transitions of the current CPC semantic state, not replayed move histories.

## 8. Relationship to the rejected static shortcuts

The prior census proved that renewal is not determined by:

- support phase alone;
- derivative alone;
- residual-size histogram;
- fixed-template defect count;
- pair count;
- local pair support depths.

The semantic renewal operator retains exactly what those shortcuts discarded:

\[
\text{typed residual state}
+\text{support}
+\text{response action}
+\text{exact transport}.
\]

Thus it is transition-aware rather than a fitted scalar classifier.

## 9. Runtime/compression boundary

This theorem does **not** yet claim the final production implementation should recursively construct arbitrarily many proof classes \(S_D\).

The useful result is that renewal is a congruent local transition on the CPC/RBA state.

The next compression target is to determine whether the proof classes relevant to Connect Four close under a finite or bounded descriptor, such as a temporal-contract/response-resource automaton, without one state per physical continuation.

Stop if the descriptor degenerates into ordinary game-tree state enumeration.

## 10. Consequence for v5

The semantic lower-bound separation is still insufficient for loss-delay selection.

At the consumed boundary the finite forced-completion upper bounds for candidates 2 and 3 remain unknown.

Therefore:

\[
[5,+\infty],\quad[5,+\infty],\quad[7,+\infty]
\]

is the current sound interval state under this grammar.

No v5 is licensed.

## Claim discipline

This theorem:

- is rank-local and geometry-derived;
- consumes no solved W/D/L or oracle value;
- uses no ordinary minimax/negamax/alpha-beta recursion;
- proves survival lower bounds only;
- preserves equivalent-move semantics;
- does not claim a universal move finder is finished.
