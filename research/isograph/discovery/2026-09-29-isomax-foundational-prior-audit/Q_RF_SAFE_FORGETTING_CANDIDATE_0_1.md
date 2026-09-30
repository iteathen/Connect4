# Candidate theorem: commuting rank-local safe-forgetting operators below q_o

**Status:** deductive candidate; 4×4 exhaustive confirmation complete; standard-7×6 qualification pending.

Let (q=(h,R_0,R_1)) be a q_o state.

Define three deletion operators on residual antichains.

## M — remaining-move capacity

Delete a player residual (R) when

[
|R| > 	ext{number of turns remaining for that player}.
]

This is a necessary condition for completion. If it fails now, no future continuation can complete that residual.

## R — support-release / turn-slot necessary feasibility

For each required future cell, compute its earliest possible release ply from current support.

The owner has a fixed parity class of future move slots. Delete the residual if no injective assignment exists from its required cells to owner move slots at or after their release thresholds.

This is a **necessary** schedule condition only. It need not be sufficient for whole-game realizability to justify deletion.

If the necessary matching fails at the current rank, a later completion would concatenate with the intervening prefix to produce a current feasible assignment, contradiction. Thus failure is permanently dead information.

The cardinality condition (M) is implied by existence of such an injective assignment, so (R) is at least as strong a deletion rule as (M).

## F — universal nonterminal frontier blocker

Let the current mover's nonterminal frontier be the set of currently legal landing cells excluding any landing cell that is an immediate mover win.

Delete an **opponent** residual when it contains the entire nonterminal frontier.

Why safe:

- if the mover chooses an immediate winning action, the game terminates and the opponent residual cannot matter afterward;
- otherwise every legal action lands in the nonterminal frontier;
- because the opponent residual contains every such landing cell, every nonterminal action blocks that residual immediately.

Therefore the residual cannot affect any nonterminal successor and may be forgotten at the current rank.

## Idempotence

Each operator only deletes residuals and leaves support fixed.

- M and R recompute the same necessary predicates on the same support after their own deletions.
- F does not modify mover residuals, so its immediate-win exclusion set is unchanged by F itself.

Thus each is idempotent.

## R absorbs M

Every R-feasible residual must have an injective assignment into the owner's remaining move slots. Therefore it cannot contain more required cells than available owner turns.

So:

[
Rcirc M = Mcirc R = R
]

as residual filters.

## R and F commute

F's frontier depends on support and mover immediate-win singleton residuals.

An immediate-win singleton has release threshold 1 and the mover's next slot is 1, so R never deletes such a singleton.

Therefore R does not change the frontier used by F.

Both operators then act by deletion predicates on the same antichain and support, hence:

[
Rcirc F = Fcirc R.
]

The same argument gives M/F commutation.

## Candidate reduced state

Define

[
q_{RF}(P)=F(R(q_o(P))).
]

The deletion arguments above are intended to establish that removed residuals cannot affect any future terminal token or successor semantics. Therefore (q_{RF}) is a candidate rank-local Q-F representation strictly below q_o.

Compose with the full column orbit candidate:

[
q_{Sigma RF}(P)=[q_{RF}(P)]_{S_W}.
]

If the q_o column-equivariance theorem and the safe-forgetting theorem both qualify, (q_{Sigma RF}) is an exact rank-local transporter-aware Q-F quotient.

## Complete 4×4 evidence

Direct literal Q-F class counts:

- q_o: 34,094
- M: 32,520
- R: 32,214
- F: 32,788
- M+F: 31,581
- R+F: **31,389**

Every tested ordering of all three operators produces 31,389 classes and remains a literal transition congruence.

After full S4 column-orbit canonicalization:

- q_o/S4: 10,496
- M/S4: 10,198
- R/S4: 10,106
- F/S4: 9,940
- (M+F)/S4: 9,734
- (R+F)/S4: **9,676**

Every tested composition remains transporter-aware transition congruent.

## Nonclaims / burden

The 4×4 exhaustive result is not a standard-7×6 qualification.

The proof burden still includes:

1. formalize R's necessary matching predicate for arbitrary standard-7×6 support;
2. prove permanence of an R-deleted residual under every legal prefix;
3. prove the q_o transition factors through R/F deletion in every terminal/nonterminal case;
4. independently verify the commutation/absorption laws;
5. combine with q_Sigma only after both components qualify independently.

No claim is made that q_SigmaRF is minimal.
