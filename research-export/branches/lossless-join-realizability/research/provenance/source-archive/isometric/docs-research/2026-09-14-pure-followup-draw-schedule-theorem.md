# Strict pure-followup draw schedule on even-height safe setups

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Prove symbolically that the safe pure-followup substrate cannot by itself be a first-player winning strategy on an even-height board after a one-move safe setup.

This converts an earlier validation-only constrained-solve observation into an exact quantified theorem and identifies the necessary location of the missing offensive mechanism.

## 1. Setup

Let the board have even height

```text
H=2m
```

and width `W`.

Assume column `c` is a one-move safe setup column, so after the first player's opening stone in `c`, the pure-followup phase

```text
phi=e_c
```

is geometrically safe: its derivative `d=delta phi` contains neither `000` nor `111`.

After that opening, the second player is to move.

The strict pure-followup policy for the first player is:

> whenever the second player plays in a column that still has a response slot immediately above, answer immediately in that same column; make no voluntary cross-column deviation while such a response exists.

## 2. Capacity decomposition

After the setup stone:

```text
setup column c: H-1 = 2(m-1)+1
other columns  : H   = 2m.
```

Therefore in the previously defined decomposition

```text
R_j=2k_j+u_j
```

we have

```text
k_c=m-1, u_c=1
k_j=m,   u_j=0 for j != c.
```

So exactly one unmatched top defect exists, in the setup column.

## 3. Neutral pair schedule

A complete second-player/first-player same-column response pair in column `j` decrements only

```text
k_j -> k_j-1
```

and leaves the safe phase, seam field and top-defect bit unchanged.

These neutral pair steps commute across columns.

The second player can therefore choose the following legal schedule:

1. consume all `m` neutral pairs in every non-setup column;
2. consume all `m-1` neutral pairs in the setup column;
3. only then play the remaining unmatched top event in the setup column.

At every step before the final event, the first player has exactly the prescribed same-column response and the pure-followup coloring remains unchanged.

## 4. Final event fills the board

After all neutral pairs are consumed:

- every non-setup column is full;
- the setup column has exactly its unmatched top cell empty.

It is the second player's turn because every neutral macro-step consumed one move by each player and returned the decision turn to the second player.

The second player now occupies the final setup-column top cell.

The board is full, so there is no same-column response slot and no free first-player move after board exhaustion.

## 5. No earlier win

By assumption `phi=e_c` is a safe pure-followup phase.

Strict same-column follow-up inserts no seams and never changes `phi`. Therefore throughout the schedule every completely assigned geometric four-line is a restriction of the same globally safe pure-followup coloring.

The final full board is exactly that safe coloring, hence contains no Connect-4 for either player.

No earlier move can have completed one either, since any completed line would already be a line of the same safe coloring.

Therefore the scheduled game ends in a draw.

## 6. Theorem

> **Strict pure-followup draw theorem.** On any even-height finite board, after a one-move safe setup `phi=e_c`, strict same-column pure follow-up is not a forced win for the setup player. The opponent has an explicit draw schedule: exhaust every neutral pair and consume the unique setup-column top defect as the final board cell.

The theorem is quantified over arbitrary even `H` and any width/setup column satisfying the already-proved one-move safe-entry condition.

## 7. Standard width-7 consequence

For width 7 the unique one-move safe setup is the center column `c=3`.

Therefore on every even-height `7 x H` board, including standard `7x6`, the strategy

```text
center setup
+ strict same-column response forever
```

can be held to a draw by the second player.

This does **not** say the board value is draw. It proves that any first-player winning certificate must include at least one non-neutral/offensive deviation before the all-neutral draw schedule terminates.

## 8. Location of the missing sign mechanism

The abelian substrate consists of:

```text
commuting neutral pair counters k_j;
safe phase/domain-wall state;
one conserved top-defect charge class.
```

That substrate admits the explicit draw schedule above.

Thus the decisive `01` first-player result, if proved, must be created by a mechanism that prevents the second player from realizing this schedule. Candidate generic forms already present in the reduced calculus are:

```text
create a singleton threat forcing a response;
create a threat combination that restricts which counter may be consumed;
use a deadline-valued blocker/own-completion certificate;
insert a non-neutral seam/phase update while a response slot still exists.
```

In counter language, a winning strategy must **force or forbid some firing before the opponent completes the draw odometer**.

## 9. Research consequence

Do not seek the winner sign in another invariant of the unconstrained pure-followup/chip-firing quotient. That quotient has an explicit draw realization.

The next object is the stopping/forcing law that constrains the otherwise commuting odometer.

## Proof boundary

The argument uses only the proved safe-phase condition, exact capacity decomposition and legal same-column response schedule. It is not inferred from a constrained solver or solved W/D/L table. It proves a strategy limitation, not the game-theoretical value of the board.
