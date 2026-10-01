# CPC trigger-5 forced compression lemma

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local theorem candidate; qualification pending  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Compress the repeated rank-24 column-5 obstruction into a finite CPC obligation macro instead of extending the D27 survival horizon.

The consumed qualification locator is:

`444441566666232222423311`

The move sequence is **not** a runtime proof premise. It is used only to reconstruct the exact current RBA state for qualification.

At that state Player 1 is to move and has an active minimal two-cell residual whose missing cells are:

- column 5, row 5;
- column 7, row 3.

Both cells are already projected to Player 1 by the pinned CPC target-owner projection. Projected ownership alone is not W/D/L.

## Candidate local statement

Let (q) be the exact rank-24 RBA state above and let (A) be Player 1, (D) Player 2.

Let (x=(5,5)) and (y=(7,3)), attached to the same active minimal residual (R={x,y}).

Consider the current legal attacker trigger in column 5.

The candidate lemma is:

1. (A:5) is legal and nonterminal.
2. Every physically legal (D) reply is nonterminal.
3. If (D:5), then the next (A:5) is an exact first win for (A).
4. If (D:r) for any legal (r\neq5), then the next (A:5):
   - is legal and nonterminal;
   - creates an exact native CPC current-action restriction forcing (D:5);
   - admits no alternative defender move that avoids an immediate (A:5) terminal on the following move.
5. After that forced (D:5), the next (A:5) is legal and nonterminal and consumes (x=(5,5)).
6. In every off-column branch, the original attached residual (R={x,y}) therefore contracts to the active singleton residual ({y}).
7. The pinned CPC target-owner projection still assigns (y=(7,3)) to (A).

Thus all legal responses to the first trigger are intended to compress into only two structural outcomes:

- immediate Player-1 win; or
- a smaller singleton-target CPC zugzwang problem at (y=(7,3)).

## Exactness requirements

Qualification must use:

- exact JSMinSys RBA cofactors from the current state;
- existing production CPC unchanged;
- first-win precedence at every cofactor;
- residual attachment by cell geometry, not by assuming a persistent residual ID;
- the pinned JSMinSys authority SHA;
- no oracle, solved W/D/L, best-move table, or physical-position identity.

The native CPC restriction in step 4 is load-bearing only if the independently enumerated legal cofactor cross-check agrees that column 5 is the sole reply preventing the next column-5 move from being an immediate Player-1 terminal.

## What this lemma would establish

If qualified, this is a finite local obligation-compression theorem. It explains why the D13 trigger-5 failure repeatedly reappears: the relevant state is not asking for a new defender response theorem. Column 5 itself is an attacker forcing channel that consumes one member of the parity-aligned residual.

The lemma would reduce the remaining research question to the singleton target (y=(7,3)) plus escape/preemption closure over the remaining event reservoirs.

## What it does not establish

Even if every clause above passes, this lemma does **not** by itself prove:

- the rank-24 state is a Player-1 win;
- candidate 6 is optimal;
- a global CPC zugzwang theorem;
- exact remoteness;
- a literal Nim-sum;
- v5.

The remaining singleton target still needs a sound proof that alternative reservoir play cannot preempt the target or flip the decisive ownership relation.

## Falsifiers

Reject or weaken the lemma if any legal branch shows any of the following:

- a defender terminal before the forced compression completes;
- an off-column first reply for which the second attacker column-5 move is illegal or terminal in the wrong direction;
- native CPC does not force column 5 at the second trigger;
- any alternative legal defender reply at the second trigger avoids the immediate next attacker column-5 terminal;
- the forced column-5 block is itself terminal for the defender;
- the attacker column-5 target-consumption move is illegal or terminal in the wrong direction;
- the attached ({5,5;7,3}) residual does not contract to active singleton ({7,3});
- the singleton target owner is not Player 1.

## Claim discipline

This candidate is frozen before execution. A successful workflow is not sufficient by itself; promotion to a qualified local theorem requires the generated evidence to satisfy every falsifier above.
