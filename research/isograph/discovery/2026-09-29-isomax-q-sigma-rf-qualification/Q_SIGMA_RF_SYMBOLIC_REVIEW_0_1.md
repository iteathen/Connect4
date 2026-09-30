# Independent symbolic review plan — q_SigmaRF

**Status:** qualification candidate, no authority effect.

This review is independent of the old cocycle interpretation. Its target is the new rank-local representation candidate

[
q_{Sigma RF}(P)=[F(R(q_o(P)))]_{S_W}.
]

The review separates four claims.

## Claim A — full-column equivariance of q_o transition

For a column permutation (pi), support, residual cells and actions are transported together.

Check:

[
T(pi q,pi c)=pi T(q,c).
]

This follows only from the qualified q transition ingredients:

- support-determined legality/landing;
- owned residual cofactor/empty-residual terminalization;
- opponent blocking;
- antichain normalization by equality/subset;
- rank/full-board termination.

No physical-board automorphism premise is used after the line geometry has been compiled into the residual hypergraph.

## Claim B — R deletion is permanent

R deletes a residual only if its required future cells admit no injective assignment to owner move slots at or after support-release thresholds.

If a deleted residual could later complete after any legal prefix, prepend that prefix to its completing schedule. This would induce a feasible assignment at the earlier state, contradiction.

Strict supersets hidden by antichain absorption are also dead: a feasible schedule for a superset would restrict to a feasible schedule for the deleted subset.

Therefore R-deleted residual information cannot later affect an ordinary terminal token or reduced successor.

## Claim C — F deletion is one-step universally dead

F deletes an opponent residual containing every current legal nonterminal landing cell.

For any legal action:

- an immediate mover win terminates before the opponent residual can matter; or
- the landing cell belongs to the nonterminal frontier and therefore blocks the residual immediately.

Any strict superset hidden by antichain absorption also contains the frontier and is blocked.

Therefore F-deleted information cannot affect any nonterminal successor.

## Claim D — R and F commute and are column-covariant

R is per-residual and depends only on support, ownership, release thresholds and owner move-slot parity.

F depends on support plus current mover immediate-win singleton residuals.

R cannot delete a legal immediate-win singleton: its required cell is released now and the mover owns move slot 1.

Thus R does not change F's frontier. F deletes only opponent residuals and does not affect R's predicate on surviving residuals.

Column permutation preserves:

- support rank/turn;
- release thresholds after transporting columns;
- matching existence;
- legal landing cells;
- singleton immediate-win membership;
- containment of the frontier.

Hence R, F and RF are column-covariant.

## Consequence if A–D qualify

The exact q_o transition factors through q_RF, and the full symmetric group acts by transition automorphisms. Therefore q_SigmaRF is rank-local and transporter-aware Q-F sufficient.

This is a future-behavior/action-interface theorem only. It does not imply:

- physical occurrence identity;
- physical-board automorphism under arbitrary columns;
- proof/certificate identity;
- CPC/NDC guard identity;
- minimality of q_SigmaRF;
- any direct formula for D_G.

The cross-case workflow independently reimplements these operations with exact bipartite matching for R and checks A–D on complete 3x3-k3, 3x4-k3, 4x3-k3 and 4x4-k4 carriers, including transported nonphysical q representatives.
