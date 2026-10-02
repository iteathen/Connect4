# CPC 3+1 deferred-singleton tail nonwin theorem

**Status:** qualified structural nonwin theorem  
**Date:** 2026-10-01

## Qualification

Qualified by `CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_QUALIFICATION_0_1.json` on the three exact 3+1-tail instantiations. All three independently reconstructed exact q, satisfied the stated residual/event premises, exposed P1:A2 after A1, and forced the B-first tail to exact draw.

## Purpose

Extract the label-free rank-local theorem exposed by
`CPC_RANK38_3PLUS1_TAIL_EVENT_PRODUCT_0_1.json`.

The theorem is not tied to columns C/E/F/G or to any move-history string.
Those remain qualification provenance only.

## State interface

Let an exact ordinary Connect Four state `q` satisfy all of the following.

1. It is P0 to move.
2. Exactly four legal future placement events remain.
3. Their gravity partial order is

   ```
   A1 < A2 < A3
   B incomparable with A1,A2,A3
   ```

   where `A1,A2,A3` are the last three cells of one column and `B` is
   the last cell of another column.
4. The normalized P0 residual antichain, restricted to still-unplayed
   events, is exactly

   ```
   {A1,A2,A3}.
   ```
5. The normalized P1 residual antichain, restricted to still-unplayed
   events, is exactly

   ```
   {A2}.
   ```
6. There is no earlier terminal state. Exact first-win stopping is used.

The residual clauses are statements about the exact normalized residual
antichains, not about support alone.

## Theorem

Under the premises above, P0 has no winning move.

More precisely:

### Move A1

After P0 plays `A1`, event `A2` becomes accessible.

P1's exact residual is the singleton `{A2}`. Therefore P1 may play `A2`
and terminates immediately.

Hence P0:A1 is not a P0-winning action.

### Move B

After P0 plays `B`, the independent column is full and the only remaining
legal event is `A1`.

The remaining physical sequence is forced:

```
P1:A1
P0:A2
P1:A3
```

P1's singleton `{A2}` is killed when P0 occupies `A2`.

P0's only live residual `{A1,A2,A3}` is killed because P1 owns `A1`
(and later `A3`).

No residual winning requirement survives for either player. The board is full,
so exact play terminates as a draw.

Hence P0:B is an exact draw action.

## Consequence

Every legal P0 root action is nonwinning:

```
A1 -> P1 has an immediate terminal response
B  -> exact draw
```

Therefore the state has the sound P0-nonwin interval:

```
[-1,0].
```

This theorem does **not** distinguish whether the state as a whole is a loss
or a draw under optimal play; it proves only that P0 cannot force a win.

## Relation to E/P/R/C/N

- `E`: the four-event poset supplies accessibility and the forced B-first
  tail.
- `P`: rank parity assigns event positions 1/3 to P0 and 2/4 to P1.
- `R`: the exact normalized residual antichains are
  P0 `{A1,A2,A3}` and P1 `{A2}`.
- `C`: playing `A1` activates P1's singleton contract at `A2`; playing
  `B` leaves a forced single-column tail.
- `N`: exact first-win closure terminates the A1 branch at P1:A2 and the
  B branch at full-board draw.

No projection is sufficient alone; the result is the synchronous product of
the event order, phase, residuals and terminal closure.

## Qualification control

Qualification must verify the theorem on the three exact source states:

- `4f5444dc55bb5371`;
- `60fba7c1d1c84a97`;
- `e7eb0902f1f7984c`.

For every state the control must independently reconstruct exact q, verify the
four-event poset and residual premises, and confirm:

- A1-first extensions include an immediate P1:A2 terminal;
- B-first has one legal linear extension and ends in exact draw;
- no extension contains a P0 terminal;
- no support-only equality is used.

## Boundary

This theorem is reusable only when all stated premises are reconstructed from
the exact current state.

It does not apply merely because a state has four cells left, has the same
support shape, or occurs at rank 38.

No oracle, solved W/D/L input, minimax, opening book, best-move table or BSFP
solved frontier is a premise. Production CPC and BSFP are unchanged.
