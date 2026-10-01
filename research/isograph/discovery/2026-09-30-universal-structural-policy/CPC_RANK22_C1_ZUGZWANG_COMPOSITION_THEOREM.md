# CPC rank-22 c1 zugzwang composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact W/L composition candidate; qualification pending  
**Branch:** research/universal-structural-policy-20260930

## Purpose

Test whether the newly qualified CPC zugzwang machinery propagates one full decision layer backward from the exact rank-24 win.

Qualification locator:

4444415666662322224233

At this exact rank-22 RBA state Player 1 is to move.

Candidate move:

\[
\boxed{\text{Player 1: column 1}}
\]

The move is not selected from an oracle. It is the consumed structural transition whose complete legal reply family is now being re-evaluated from current-state CPC/RBA information.

## 1. Legal reply family

After Player 1 column 1, the exact legal Player-2 replies are:

\[
\{1,3,5,6,7\}.
\]

No reply may be omitted.

## 2. Reply 1

Reply 1 reaches the exact rank-24 state already qualified by:

CPC_RANK24_ZUGZWANG_WIN_COMPOSITION_THEOREM.md

Therefore this branch is closed if exact RBA reconstruction agrees with that theorem state.

## 3. Replies 3, 6, and 7 — height-1 column-5 compression

For each of these reply states:

- Player 1 is to move;
- column 5 has support height 1;
- Player 1 retains an active minimal residual attached to:
  - c5r5;
  - c7r3;
- both targets have CPC projected owner Player 1.

Player 1 now plays column 5.

Candidate compression law:

1. if Player 2 replies in column 5, the next Player-1 column-5 move is an exact first win;
2. for every off-column Player-2 reply:
   - Player 1 plays column 5 again;
   - native CPC restricts Player 2 to column 5;
   - exact cofactor enumeration independently confirms column 5 is the sole reply preventing the immediate next Player-1 column-5 terminal;
   - after that forced block, Player 1 plays column 5 again and consumes c5r5;
   - the attached pair contracts to the active Player-1 singleton c7r3.

Every resulting singleton state must then satisfy the already-qualified truncated target-reservoir pairing theorem.

## 4. Reply 5 — height-2 shortened compression

After reply 5, column 5 has support height 2.

Player 1 plays column 5.

The candidate shortened law is:

1. native CPC immediately restricts Player 2 to column 5;
2. exact cofactor enumeration independently confirms column 5 is the sole reply preventing the immediate next Player-1 column-5 terminal;
3. the forced Player-2 column-5 block is nonterminal;
4. Player 1 then plays column 5, consumes c5r5, and contracts the same attached pair to singleton c7r3;
5. the resulting singleton state satisfies the qualified truncated target-reservoir pairing theorem.

## 5. Conclusion target

If all five legal reply branches close, then:

\[
\boxed{
q_{22}\xrightarrow{\text{P1: column 1}}
\text{Player 1 wins against every legal reply}
}
\]

This would be an exact local W/L theorem at rank 22.

## 6. Qualification requirements

Qualification must use:

- exact current-state RBA cofactors;
- pinned JSMinSys authority bf23d3a67652cd42e1975f29c7dc4eed54f7eb42;
- production CPC unchanged;
- residual attachment by exact cell geometry, never by stable-ID assumption;
- the qualified truncated target-reservoir pairing schema;
- first-win precedence on every local transition;
- independent literal reply enumeration wherever native CPC forced-column output is load-bearing;
- oracleUsed=false;
- solvedInputsUsed=false.

The target-reservoir pairing must be synthesized separately for every exact contracted singleton state. A template from one branch may not be copied to another without rechecking support, residual coverage, and target role.

## 7. Falsifiers

Reject this composition if any branch shows:

- a legal Player-2 reply outside the declared family;
- a Player-2 terminal before the claimed compression completes;
- failure of the c5 direct-win branch;
- native CPC/literal-cofactor disagreement about a forced c5 block;
- failure of the attached {c5r5,c7r3} residual to contract to singleton c7r3;
- no valid truncated target-reservoir template after contraction;
- any uncovered Player-2 residual in an accepted template.

## 8. Scope boundary

Even if qualified, this theorem would establish only the exact rank-22 state as a Player-1 win by column 1.

It would not establish rank 20, rank 10, exact remoteness, candidate-6 optimality, a universal policy, or v5.

It does not modify production CPC or JSMinSys.
