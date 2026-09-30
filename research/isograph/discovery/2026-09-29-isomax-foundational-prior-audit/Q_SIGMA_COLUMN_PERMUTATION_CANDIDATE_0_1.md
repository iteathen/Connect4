# Candidate theorem: full column-permutation equivariance of the compiled q_o transition algebra

**Status:** deductive candidate pending independent qualification and authority integration  
**Research direction:** Joshua Oshiro  
**Finite confirmation:** complete 4×4 carrier, 12,891,744 legal-transport checks, 7,309,776 transition-equivariance checks, zero mismatches

## Statement

Let

[
q=(h,R_0,R_1)
]

be an orientation-sensitive (q_o)-style state: support heights (h) and normalized owned residual antichains (R_0,R_1).

For a column permutation (piin S_W), act by:

- ((pi h)_{pi(c)}=h_c);
- ((r,c)mapsto(r,pi(c))) on cells;
- (R_imapstopi R_i) on every residual;
- literal action (cmapstopi(c)).

Let (T(q,c)) be the exact q transition contract: legality from support, landing cell, own residual cofactor/terminalization, opponent residual blocking, antichain normalization, support increment, and full-board draw.

Candidate theorem:

[
T(pi q,pi c)=pi T(q,c)
]

for every legal action, with the same terminal token when terminal.

Consequently the full symmetric-group orbit

[
q_Sigma(q)=[q]_{S_W}
]

is a rank-local transporter-aware quotient of the compiled q transition algebra.

## Proof

### 1. Rank and mover

A column permutation only reorders support heights.

[
sum_c h_c=sum_c(pi h)_c.
]

Therefore occupied rank and side to move are invariant.

### 2. Legal actions

Action (c) is legal iff (h_c<H).

By definition of the transported support,

[
h_c<Hiff(pi h)_{pi(c)}<H.
]

Thus legal actions correspond bijectively under (cmapstopi(c)).

### 3. Landing cell

The landing cell of (c) is ((h_c,c)).

The landing cell of (pi(c)) in (pi h) is

[
((pi h)_{pi(c)},pi(c))=(h_c,pi(c))=pi(h_c,c).
]

### 4. Own residual cofactor

For residual (R), playing landing cell (x) maps

[
Rmapsto
egin{cases}
Rsetminus{x} & xin R\
R & x
otin R.
end{cases}
]

Because (pi) is a bijection,

[
pi(Rsetminus{x})=pi Rsetminus{pi x}.
]

An own residual becomes empty after the move in one frame iff its transported residual becomes empty in the transported frame. First-win terminal token is therefore preserved.

### 5. Opponent blocking

Opponent residual (R) is deleted iff (xin R).

Bijectivity gives

[
xin Riffpi xinpi R.
]

Opponent blocking commutes with transport.

### 6. Antichain normalization

Normalization removes duplicate residuals and strict supersets.

Column permutation preserves equality and subset inclusion:

[
A=Biffpi A=pi B,
qquad
Asubset Biffpi Asubsetpi B.
]

Therefore

[
pi,mathrm{Normalize}(R)
=
mathrm{Normalize}(pi R).
]

### 7. Board-full draw

Support sum and cell capacity are invariant, so board exhaustion is preserved.

### 8. Transition equivariance

All components of the exact q transition commute with (pi). Therefore:

[
T(pi q,pi c)=pi T(q,c).
]

### 9. Future-game correspondence

Induct on remaining cells.

Terminal states have identical transported terminal tokens. For a nonterminal state, legal actions correspond bijectively and every successor is related by the same (pi). Therefore the complete q transition game is isomorphic under the action transporter.

### 10. Value

Player identity is not permuted and terminal tokens are preserved. Max/min Bellman operators range over a bijectively transported action set, so scalar exact value is invariant:

[
V(q)=V(pi q).
]

## Important distinction

This is **not** the claim that every column permutation is a physical automorphism of the fixed Connect Four board.

For physical 5×4 geometry, the foundational audit found only identity and horizontal reflection preserve the fixed winning-line hypergraph.

The larger (S_W) action becomes admissible **after physical line geometry has been compiled into the residual hypergraph**. It is an automorphism candidate of the abstract q transition algebra, not of the original board embedding.

## Rank-locality

(q_Sigma(P)) can be constructed directly from the current (q_o(P)) and (G) by finite column-orbit canonicalization. Its definition does not require future play.

For scalar value, an orientation/transporter witness need not be retained once a canonical orbit key is obtained.

For literal move/action output, the current-to-canonical transporter must be retained or reconstructed.

## Current evidence

Complete 4×4 finite audit:

- physical states: 161,029;
- nonterminal states: 134,289;
- (q_o) classes: 34,094;
- (S_4)-orbit classes: 10,496;
- physical q-transition controls: 304,574;
- legal transport checks: 12,891,744;
- nontrivial transition-equivariance checks: 7,309,776;
- mismatches: 0.

This is finite confirmation of the proof implementation, not independent qualification of the general theorem.

## Open burden

Before promotion into Connect4 authority:

1. independently verify the symbolic proof against the qualified standard-7×6 q_o contract;
2. state the abstract transported-q domain precisely, including nonphysical canonical representatives;
3. qualify action-transporter semantics and identity scope;
4. verify no proof/certificate semantics are silently transported from q;
5. run fresh controls and authority-level qualification.

No solver adoption follows automatically.
