# CPCX Global Event-Phase Gauge Theorem 0.1

**Status:** frozen theorem contract; implementation/qualification pending  
**Scope:** experimental CPCX only  
**Observation:** relative event-rank parity of an untouched residual

## Purpose

Make precise the phase identity exposed by the UC4A–CPCX diagonal-defect bridge.

CPCX records an event rank for every currently empty target cell.  The recent
move-6 diagonal diagnostic observed the same three-cell residual with absolute
event-parity vectors

```text
101
010
```

before and after certified transport.

This theorem determines whether that change is a real defect mutation or only
a global phase change forced by physical rank.

It is generic and contains no move-6 fixture, solved value, oracle result, or
future reply enumeration.

## Definitions

Fix a rectangular finite-gravity board with `H` rows.

For an exact nonterminal position `S`, let

```text
h_c = current height of column c
E   = sum_c (H - h_c)
```

be total remaining physical capacity.

For an empty cell `x=(c,r)`, with zero-based row `r`, CPCX defines

```text
supportDistance(x) = r - h_c

eventRank(x)
  = supportDistance(x) + 1
    + sum_{j != c}(H - h_j).
```

Let

```text
rho_S(x) = eventRank_S(x) mod 2.
```

For an ordered untouched residual cell set

```text
X=(x_0,...,x_{k-1}),
```

define its relative phase signature

```text
sigma_S(X)_i = rho_S(x_i) xor rho_S(x_0).
```

The choice of `x_0` is only a gauge origin.  Any fixed deterministic ordering
of the residual cells is admissible.

## Algebraic identity

For every currently empty cell `x=(c,r)`:

```text
eventRank_S(x)
 = (r - h_c) + 1 + sum_{j != c}(H - h_j)
 = E - H + r + 1.
```

Therefore event rank is independent of the target column height once total
remaining capacity and target row are fixed.

Modulo two:

```text
rho_S(x) = (E - H + 1 + r) mod 2.
```

Hence for two empty cells `x,y`:

```text
rho_S(x) xor rho_S(y)
 = (row(x) - row(y)) mod 2.
```

The common board-phase term cancels.

## Theorem

Let `S` and `T` be exact positions on the same geometry.

Let `X` be the same ordered set of physical cells, and assume every member of
`X` is empty in both positions.

Then:

1. **Relative phase invariance**

```text
sigma_S(X) = sigma_T(X).
```

2. **Global phase transport**

If

```text
Delta = T.rank - S.rank,
```

then for every `x in X`:

```text
rho_T(x) = rho_S(x) xor (Delta mod 2).
```

Thus an odd number of physical events complements the entire absolute parity
vector, while an even number preserves it.

3. **Residual gauge identity**

If a separately certified CPCX transition proves that a residual keeps the
same physical missing-cell set `X`, then its event-parity descriptor should
be compared modulo global complement.  Absolute vectors such as

```text
101
010
```

represent the same relative phase signature.

## Geometry-only zero-reservation ownership corollary

CPCX also defines the projected owner of an empty event by

```text
zeroReservationOwner(x)
  = mover xor ((eventRank(x)-1) mod 2).
```

Because Player 0 starts, `mover = rank mod 2`.  On a `W x H` board,

```text
E = W*H - rank
eventRank(x)-1 = E - H + row(x)
```

and therefore the rank terms cancel:

```text
zeroReservationOwner(x)
 = (H*(W-1) + row(x)) mod 2.
```

So zero-reservation ownership of an untouched empty physical cell is not a
dynamic control coordinate at all.  It is fixed by board geometry and row.

For standard 7x6 Connect Four, `H*(W-1)=36` is even, hence:

```text
zeroReservationOwner(x) = row(x) mod 2.
```

For the UC4A/CPCX protected diagonal

```text
A6-B5-C4-D3
```

the geometry-fixed owner pattern is therefore:

```text
A6 -> P1
B5 -> P0
C4 -> P1
D3 -> P0
```

This corollary removes projected-owner parity as an independent dynamic state
coordinate.  Residual survival, actual ownership, support/release state, and
first-win response capacity remain separate load-bearing facts.

## What the theorem does not preserve

This theorem does **not** prove that a residual survives.

A placement may:

- occupy one of its missing cells;
- contract it for its owner;
- kill it for the opponent;
- trigger an earlier terminal;
- alter support distances and release relations.

Those are separate CPCX cofactor/support/first-win facts.

The theorem applies to phase identity only after the relevant physical cells
are established to remain empty in both compared states.

## First-win discipline

No post-terminal event is admitted as proof evidence.

The theorem carries no W/D/L, remoteness, best-move, or completion claim.

It may be composed with a separately certified transition only to identify the
relative phase of residual cells that remain live and empty.

## Complexity

For `k` selected cells:

```text
phase descriptor: O(k)
transport comparison: O(k)
```

No legal-move tree or residual expansion is required.

## Required qualification controls

Qualification must include:

1. a fresh empty-board cell set;
2. a fresh non-bottom cell set;
3. one exact one-ply transport showing global complement;
4. one exact two-ply transport showing absolute phase restoration;
5. rejection if a selected target becomes occupied;
6. a multi-cell residual-shaped set whose support distances change while the
   relative phase signature remains fixed;
7. production-CPC / solver / oracle / recursive-search isolation.

## UC4A–CPCX bridge consequence

For the current center diagnostic, the protected diagonal residual is

```text
A6-B5-C4-D3
missing = {A6,B5,C4}.
```

The observed vectors

```text
repair phase     101
successor phase  010
```

are therefore candidates for one gauge class, not two defect identities.

This removes absolute event-phase parity as a reason to distinguish those
carriers.  It does **not** establish that the UC4A 3:1 quotient direction is
formally identical to this CPCX residual, nor does it prove first-win closure.

## Claim boundary

The theorem establishes only an exact rank-local parity gauge for untouched
empty cells.

Promotion of a **Diagonal Control-Defect Transport Theorem** still requires:

- residual survival/cofactor identity;
- support/release transition semantics;
- blocker/response-capacity preservation;
- first-terminal guards;
- a finite progress or decreasing-measure argument.
