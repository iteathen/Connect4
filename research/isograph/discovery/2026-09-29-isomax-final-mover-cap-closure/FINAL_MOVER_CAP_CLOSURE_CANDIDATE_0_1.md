# Candidate theorem — hereditary final-mover cap closure

**Status:** deductive candidate; complete 4×4 confirmation succeeded; cross-case audit pending.

Let the board contain (N=WH) cells and let

[
f=(N-1)mod 2
]

be the player who would make the final board-filling move under alternating no-pass play.

For current support (h), let (C(h)) be the set of top cells of every non-full column.

Define (G) by deleting from the residual antichain of player (1-f) every residual (R) satisfying

[
C(h)subseteq R.
]

## Why the residual is permanently dead

To complete (R), player (1-f) must own every cell of (C(h)).

But once every current open top cap is occupied, every column that was non-full at the current rank is full. Columns already full remain full. Therefore the board is full.

The last one of those cap occupations is the final board move, and that move belongs to (f), not (1-f).

Hence player (1-f) can never complete (R).

First-win semantics does not weaken this argument: a residual containing every current cap cannot become empty before all those caps have been occupied.

## Heredity

Take a nonterminal legal move.

- If the opponent occupies a required cell of a deleted residual, that residual is blocked and disappears.
- If the residual owner occupies a required non-cap cell, the cofactor still contains every current cap.
- If the residual owner occupies a current cap, that cap is removed both from the residual and from the next state's open-cap set.
- If the move does not touch the residual, any change to the open-cap set can only remove an occupied cap.

Thus every surviving descendant of a G-deleted residual still contains every new open cap and remains G-dead.

This is the property the older turn-restricted final-cap rule lacked as a **freshly recomputed representation**: G makes the deadness criterion itself rank-local and hereditary.

## Transition factorization candidate

For ordinary q transition (T):

[
G(T(q,c))=G(T(G(q),c)).
]

A G-deleted residual cannot create a terminal token, and any surviving descendant remains deleted by G.

Strict supersets previously removed by antichain normalization need not be restored: a superset of a cap-complete dead residual is cap-complete and dead as well.

## Symmetry

Full column permutation transports the open-cap set bijectively and preserves the fixed final-board mover. Therefore

[
G(pi q)=pi G(q).
]

## Commutation candidates

R and G depend on support/ownership and delete residuals without changing those predicates, so they commute.

F depends on support and current mover immediate-win singletons. G cannot delete such a singleton:

- if G acts on the opponent, mover singleton data is untouched;
- if G acts on the mover, a cap-complete singleton would require exactly one open cap that is immediately playable, hence one remaining cell, making the mover the final-board mover rather than the player G deletes.

Therefore F and G commute.

## Candidate state

[
q_{Sigma RFG}(P)=[G(F(R(q_o(P))))]_{S_W}.
]

If the factorization, commutation and column-covariance proofs qualify, this is a direct rank-local transporter-aware Q-F representation.

No minimality claim is made.
