# CPC trigger-adaptive semantic renewal theorem

**Date:** 2026-09-30  
**Version:** 0.1 frozen before execution  
**Status:** exact rank-local proof-class theorem candidate  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Correct an unnecessary quantifier restriction in the existing semantic renewal grammar.

The current renewal predecessor uses:

\[
\exists \Pi\;\forall a
\]

where one complete synchronized-response template \(\Pi\) must be selected before considering every legal attacker trigger \(a\).

A real defender strategy does not have to commit to one counterfactual template before the attacker moves. The attacker move is observed first.

The sound strategic quantifier order is therefore potentially:

\[
\forall a\;\exists \Pi_a.
\]

This theorem formalizes that trigger-adaptive response rule while keeping every response inside the existing rank-local synchronized-template semantics.

No arbitrary defender move, oracle value, minimax value, negamax, or alpha-beta result is admitted.

## 1. Existing proof class

Let \(S_D\) be any already-sound attacker-survival proof class:

\[
q\in S_D
\Longrightarrow
\text{the attacker cannot terminally complete through the next }D\text{ plies}.
\]

The existing fixed-template renewal operator requires one complete template \(\Pi\) whose prescribed response works for every current attacker trigger.

That is sufficient, but not necessary for a strategy.

## 2. Trigger-adaptive predecessor

Fix a legal nonterminal CPC/RBA state \(q\) with attacker \(A\) to move.

For every legal attacker trigger \(a\):

1. apply the exact RBA cofactor;
2. if \(A\) terminally wins on \(a\), the predecessor fails;
3. otherwise choose a **complete synchronized-response template**
   \(\Pi_a\) from the current rank-local template family;
4. require that \(\Pi_a\) prescribes a response cell \(r_a\) to the observed trigger;
5. require \(r_a\) to be immediately legal after \(a\);
6. apply the exact defender cofactor;
7. accept that branch if the defender/draw terminal closes it, or if the exact successor \(q_a'\) belongs to \(S_D\).

The template may depend on the observed trigger:

\[
a\mapsto\Pi_a.
\]

No commitment is made to the unused counterfactual responses of \(\Pi_a\).

## 3. Theorem

Define the trigger-adaptive predecessor \(\mathcal R_{\rm ad}(S_D)\) by the conditions above.

Then:

\[
\boxed{
q\in\mathcal R_{\rm ad}(S_D)
\Longrightarrow
q\text{ survives through }D+2.
}
\]

### Proof

The attacker chooses one legal trigger \(a\).

By premise, that trigger is not immediately terminal for the attacker and has at least one qualifying complete synchronized-response template \(\Pi_a\).

The defender observes \(a\), selects the corresponding witness \(\Pi_a\), and plays its exact legal response \(r_a\).

Only this realized branch matters. Counterfactual templates for attacker moves that did not occur impose no simultaneous resource commitment.

If the response closes in a defender/draw terminal, the attacker cannot later win on that branch.

Otherwise exact cofactor transport reaches \(q_a'\in S_D\), which prevents attacker terminal completion through the next \(D\) plies.

Therefore every attacker trigger has a legal defender strategy surviving through \(D+2\).

QED.

## 4. Why this is not arbitrary game-tree response search

The existential response is restricted to a response already licensed by at least one **complete synchronized-response template** at the current CPC state.

The theorem does not say:

\[
\forall a\;\exists \text{ arbitrary legal defender move}.
\]

It says:

\[
\forall a\;\exists \text{ complete structural template whose exact mate works}.
\]

The child class is also a previously proved structural survival class, not an oracle/minimax value.

Thus the proof graph remains a CPC proof-class hypergraph over structural certificates.

## 5. Relationship to fixed renewal

Fixed-template renewal implies adaptive renewal:

\[
\mathcal R(S_D)\subseteq\mathcal R_{\rm ad}(S_D).
\]

The inclusion can be strict because:

\[
\exists\Pi\forall a
\]

is stronger than:

\[
\forall a\exists\Pi_a.
\]

The consumed v4 boundary is a valid theorem-discovery control for determining whether the stronger grammar was discarding legal adaptive strategies.

## 6. Response deduplication

Different complete templates may prescribe the same response cell to one observed trigger.

For execution, templates may therefore be quotiented at the current trigger by exact prescribed response cell:

\[
\Pi_a\sim\Pi_a'
\iff
r_{\Pi_a}(a)=r_{\Pi_a'}(a).
\]

One representative complete template is retained as provenance for each distinct response.

This does not change the theorem.

## 7. Proof-class ladder

Using the same fixed-template base \(B_D\), define an adaptive ladder:

\[
S^{\rm ad}_3=B_3,
\]

and for odd \(D\ge5\):

\[
S^{\rm ad}_D
=
B_D
\cup
\mathcal R_{\rm ad}(S^{\rm ad}_{D-2}).
\]

This remains a constructive lower-bound family only.

## 8. Qualification target

First run the consumed v4 children through odd horizons without oracle input.

Record:

- maximum certified horizon;
- response chosen for each root trigger;
- whether different triggers require different templates;
- semantic-state and cofactor counts;
- the first adaptive proof-class failure.

Then qualify the theorem on fresh legal positions independently of the consumed training prefix.

## 9. Stop conditions

Reject or narrow the theorem if any branch requires:

- a response not contained in a complete synchronized template;
- a response that is not immediately legal;
- ignoring attacker first-win precedence;
- carrying a resource commitment from a counterfactual template into the realized branch;
- oracle or solved-value information.

Stop the implementation if it degenerates into unrestricted legal-move minimax.

## Claim discipline

This theorem candidate changes only the strategy quantifier order.

It does not:

- prove a win/draw/loss value;
- provide a forced-completion upper bound;
- imply that failure of the fixed-template grammar was an attacker win;
- license v5;
- use the consumed oracle scores as proof premises.
