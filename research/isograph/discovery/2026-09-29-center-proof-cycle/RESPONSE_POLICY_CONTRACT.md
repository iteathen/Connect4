# Fixed response-channel certificate under test

Research family, not a new selected worker mechanism. Game inputs are only
the current legal 7x6 board and rules. This extends the existing synchronized
response-policy *choice* census; it does not assume residual counts determine
value and does not copy known winning moves into a strategy.

## Guard and execution rule

The attacker is the player to move in a nonterminal state. Remaining cells in
each column are numbered upward from its current height. Columns are partitioned
into singletons and disjoint pairs. A singleton must have even remainder. A
paired (c,d) has channel length L with 1 <= L <= min(remainder[c],remainder[d])
and both remaining-L even. Channel cells at the same depth are paired across
the two columns. After the channel, adjacent cells are paired vertically.

On each attacker move, the defender takes the partner cell. If a player has
already won, play stops before any response. Every attacker turn begins with
equal consumed depth in each cross channel or with all relevant channel cells
consumed. Vertical tails have even consumed depth on attacker turns. Hence a
nonterminal attacker move always has a legal unoccupied partner reply. Each
reply restores the invariant. This is proved by induction on completed pairs;
unrelated columns can be interleaved arbitrarily.

## Winning-line coverage condition

Discard geometric lines already containing a defender token. Remove current
attacker tokens from the other lines to obtain requirements. Each such
requirement must contain at least one of:

1. a vertical upper cell, guaranteed to be owned by the defender; or
2. both endpoints of a cross-channel pair, of which the attacker gets at most one.

Such a requirement cannot complete on the attacker's turn: before its partner
response the other endpoint is still empty, and afterward it belongs to the
defender. Thus coverage of **every** surviving requirement prevents attacker
victory, including early victory. It establishes a no-win bound, not necessarily
a defender win. A failed coverage check establishes no game value.

## Complexity and scope

For W columns, M explicit live requirements, maximum requirement length K:
validate a supplied policy in O(W), check coverage in O(M*K^2), using O(W+M*K)
storage in this diagnostic. Standard K=4 gives constant-sized line work.
That is a polynomial **checker** bound. Enumerating all disjoint column
matchings and allowed channel lengths is not claimed polynomial in W. Neither
this checker nor a fixed-board timing proves polynomial perfect-play selection.

All complete policies in this bounded family are enumerated without consulting
outcomes. Policy ordering is column/index based, not answer based. The output
includes a maximum-coverage policy and its still-uncovered requirements to expose
which premises fail. That coverage score is not an ordering or W/D/L theorem.

## Qualification

Use real 7x6 root/child states for 44,444,4444. Check all generated policy guards,
reflection-invariant coverage counts, and explicit legal response simulation
over all attacker choices for three paired turns in selected policies. These
finite controls supplement the invariant argument; they do not replace it.
No production import, runtime mask, changed TT, or performance claim is involved.

If there is no certificate, preserve that family-specific negative result and
the uncovered obligations. Do not conclude that arbitrary conditional/adaptive
strategies, stronger NDC certificates, or polynomial formulations are impossible.
