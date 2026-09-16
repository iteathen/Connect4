# Frontier parity-balance invariant

**Date:** 2026-09-13  
**Status:** exact structural theorem; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization:** OpenAI ChatGPT

## Purpose

Derive a global parity invariant connecting stone row parity to the support frontier. This strengthens the bridge between gravity/support and CPC: apparent local parity-control changes cannot be independent of the current column-height frontier.

Rows and columns below are 1-based.

## Definitions

For a legal nonterminal prefix `s` let:

```text
h_c  = occupied height of column c
n    = sum_c h_c = current ply
eps  = n mod 2
q    = number of columns with odd h_c
```

Let:

```text
O0 = number of P0 stones on odd-numbered rows
E0 = number of P0 stones on even-numbered rows
O1 = number of P1 stones on odd-numbered rows
E1 = number of P1 stones on even-numbered rows
```

P0 moves first.

## Theorem 1 — frontier parity balance

For every legal prefix:

```text
O1 - E0 = (q - eps) / 2
```

and equivalently:

```text
O0 - E1 = (q + eps) / 2.
```

### Proof

A column of height `h` contains exactly:

```text
ceil(h/2) odd-row occupied cells
floor(h/2) even-row occupied cells.
```

Therefore the total number of occupied odd-row cells is:

```text
sum_c ceil(h_c/2)
= (sum_c h_c + number_of_odd_h_c) / 2
= (n + q) / 2.
```

Because P0 moves first and turns alternate, P0 has exactly:

```text
ceil(n/2) = (n + eps) / 2
```

stones.

Now:

```text
O0 + O1 = (n + q) / 2
O0 + E0 = (n + eps) / 2.
```

Subtract the second identity from the first:

```text
O1 - E0 = (q - eps) / 2.
```

Likewise, P1 has `(n-eps)/2` stones, so subtracting P1's total from the odd-row occupancy gives:

```text
O0 - E1 = (q + eps) / 2.
```

QED.

## Corollary 1 — integrality

Since:

```text
n mod 2 = q mod 2,
```

both right-hand sides are integers. This also follows because the parity of a sum of column heights equals the parity of the number of odd summands.

## Corollary 2 — cross-parity inequalities

Because `q >= eps`:

```text
O1 >= E0.
```

And trivially `q+eps >= 0`, so:

```text
O0 >= E1.
```

Thus every P0 occupation of an even row is globally financed by at least one P1 occupation of an odd row; the exact surplus is determined by the frontier.

## Corollary 3 — side-to-move forms

When P0 is to move, `n` is even and `eps=0`, hence:

```text
O1 - E0 = q/2.
```

When P1 is to move, `n` is odd and `eps=1`, hence:

```text
O1 - E0 = (q-1)/2.
```

The support frontier therefore determines the exact global cross-parity imbalance at every turn.

## Corollary 4 — full-board balance

On the full 7x6 board:

```text
q = 0
eps = 0
```

so:

```text
O1 = E0
O0 = E1.
```

This is a terminal/full-support consequence of gravity plus alternating turns, independent of strategy.

## Transition interpretation

A P1 move onto an odd-numbered row increases `O1`. Such a move also changes the odd-height-column count in exactly the way required by the theorem.

A later P0 move onto an even-numbered row increases `E0` and can consume one unit of the corresponding frontier surplus.

Therefore a proposed strategy fragment that appears to give P1 an additional odd-row repair resource without accounting for the resulting support-frontier/parity change is incomplete.

This does **not** say that P0 may choose where the compensating even-row ownership occurs. Location, accessibility, reservations, and deadlines remain strategic facts owned by CPC/NDC.

## Relation to CPC

CPC gives target-local event-rank parity relative to a selected future event reservoir.

The frontier parity-balance theorem gives a global conservation identity over the already occupied prefix:

```text
local CPC target equations
+ global frontier parity balance
```

must agree in every valid proof state.

This provides a cheap consistency check and a potential proof invariant when a repair or response fragment changes a column's control phase.

## Relation to response-matroid defect transfer

The response-matroid calculus proves that a repair may force some existing response obligation to be displaced.

The present theorem adds a second conserved quantity: a repair that changes odd/even-row ownership also changes the frontier parity account. A valid defect-transfer step must preserve both:

```text
response-slot feasibility
frontier parity balance.
```

This may help rule out static blocker covers that appear complete only because they assign incompatible row-parity control independently in different columns.

## Claim boundary

Established:

- both balance identities for every legal prefix;
- the identities depend only on column heights, ply parity, and alternating-turn semantics;
- row-parity ownership is therefore globally coupled to the support frontier.

Not established:

- that the balance identity alone determines local cell ownership;
- that it distinguishes W/D/L states;
- that it proves the center opening win or any perfect-play terminal-line membership;
- a monotone progress rank from this invariant alone.
