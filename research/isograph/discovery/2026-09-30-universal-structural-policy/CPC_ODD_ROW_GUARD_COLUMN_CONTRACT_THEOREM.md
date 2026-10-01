# CPC odd-row guard-column contract theorem

**Date:** 2026-09-30  
**Version:** 0.1 frozen before execution  
**Status:** exact local temporal-contract theorem candidate / internal CPC proof resource  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Compress the ancestry-preserved horizontal ladder exposed at the consumed candidate-6 failure frontier.

The relevant source-semantic objects are three distinct horizontal winning lines:

- \`B1 C1 D1 E1\`;
- \`A3 B3 C3 D3\`;
- \`A5 B5 C5 D5\`.

After the A3 trigger, their live attacker residuals are respectively:

\[
\{B1,C1\},\quad \{B3,C3\},\quad \{A5,B5,C5\}.
\]

A fixed-shape-ID view is insufficient because attacker cofactors change residual IDs while preserving winning-line ancestry.

The theorem below preserves the attachment and turns one defender frontier seizure into a persistent vertical guard resource.

## 1. Guard-column state

Let \(g\) be one Connect Four column on an even-height board.

At an attacker-to-move proof state, suppose the defender has established this invariant:

1. the current height \(h_g\) is odd;
2. every occupied odd one-based row in \(g\) up through \(h_g\) that belongs to the guard chain is defender-owned;
3. the next cell in \(g\), if any, is therefore at even one-based row \(h_g+1\).

Call this an **odd-row guard**.

For standard 7x6 starting at the bottom:

\[
G_g=\{g1,g3,g5\}.
\]

## 2. Same-column guard transition

If the attacker does not play in \(g\), the guard state is unchanged.

If the attacker plays in \(g\) while \(h_g<5\), the attacker lands on the next even row:

\[
h_g+1.
\]

Gravity makes the following odd row

\[
h_g+2
\]

immediately playable by the defender.

The defender responds in the same column.

The resulting height is odd again, and the new odd cell is defender-owned.

Therefore:

\[
\boxed{
G_g(h)
\xrightarrow{A:g}
D:g
\;G_g(h+2)
}
\]

for \(h\in\{1,3\}\), subject to first-win stopping.

This is exact and requires no search.

## 3. Exhaustion at the top

At \(h_g=5\), an attacker move in \(g\) occupies row 6.

There is no higher odd guard cell on the 7x6 board.

But all guard cells

\[
g1,\;g3,\;g5
\]

have already been defender-owned.

Thus the guard has completed its blocker job. Any attacker winning line whose guard obligation was attached to one of those cells remains permanently blocked.

The proof automaton may retire the guard after the top trigger and continue under another independently sound response class.

## 4. Multi-line blocking consequence

Under the guard contract, the attacker can never own any guard cell.

Hence every live attacker winning-line obligation containing at least one guard cell is discharged for the remainder of the contract.

For a bottom-established guard in B:

\[
B1,\;B3,\;B5
\]

are defender-owned whenever they become occupied.

Therefore the three ancestry-preserved horizontal lines above are all permanently blocked:

- row 1 contains B1;
- row 3 contains B3;
- row 5 contains B5.

The same statement holds symmetrically for a C guard.

This is one temporal resource discharging multiple residual/winning-line obligations.

## 5. Establishment from the cross-residual ladder

At each consumed c6 first-failure child:

- B1 and C1 are both currently playable;
- the attacker trigger A3 cofactors the row-3 line from \(\{A3,B3,C3\}\) to \(\{B3,C3\}\);
- the bottom row-1 line remains \(\{B1,C1\}\).

The already-derived cross-residual ladder geometry licenses B1 or C1 as a local defender response candidate.

If the defender selects B1, a B guard is established.

If the defender selects C1, a C guard is established.

The response simultaneously:

- blocks the row-1 line immediately;
- establishes future blocker ownership at row 3 and row 5 in the selected guard column.

This is stronger than treating the three residuals as three unit-capacity jobs.

## 6. Composition with CPC

The guard is an internal CPC temporal-contract resource, not a move score.

For a guard-carrying survival class \(S_D^G\):

- attacker trigger in guard column -> forced exact same-column guard response while a higher odd cell exists;
- attacker trigger elsewhere -> use an independently licensed CPC response edge whose realized move preserves the guard, then require the exact child to re-enter \(S_{D-2}^G\);
- if an external response consumes the guard column in a way that does not preserve the invariant, the guard may be dropped only if the exact child independently enters an ordinary sound survival class;
- first-win stopping is checked on every realized transition.

A guard contract never licenses arbitrary defender moves.

## 7. Rank-local reconstruction boundary

The final universal operator must be current-state-only.

The guard contract is reconstructible from current occupancy plus the declared guard column:

- support height is visible;
- defender ownership of B1/B3/B5 or C1/C3/C5 is visible;
- no move history is needed.

During theorem qualification, an explicit guard-state tag may be carried as proof provenance. Production promotion requires a current-occupancy reconstruction predicate.

## 8. IsoGraph / formula connection

This theorem preserves the exact attachment that the recent research identified as load-bearing:

\[
\text{winning-line ancestry}
+\text{frontier/support depth}
+\text{response-resource identity}.
\]

It does not replace that attachment with:

- residual count;
- deadline histogram;
- phase alone;
- frontier-touch count;
- trained scalar character.

This follows the Core 0.21 conservation requirement and the late formula finding that frontier contact must remain attached to the normalized interaction it modifies.

## 9. Qualification plan

First test only the consumed c6 ladder boundary.

If the guard materially extends the survival spectrum:

1. freeze implementation and exact premises;
2. generate fresh positions with mechanically detected guard establishments;
3. verify every guard transition from current occupancy and exact cofactors;
4. verify all claimed line blocks by original winning-line ancestry;
5. test negative cases where a superficially similar guard does not cover all load-bearing obligations;
6. only afterward use Pons for falsification/validation.

## Claim discipline

This theorem candidate:

- is rank-local and geometry-derived;
- uses no solved W/D/L or strong distance;
- preserves winning-line ancestry;
- is a finite temporal schema rather than horizon materialization;
- remains internal to CPC obligation accounting.

It does not by itself prove a draw, loss, exact remoteness, candidate-6 superiority, or v5.
