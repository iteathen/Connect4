# CPC rank-20 c3 proof-routing discovery probe 0.1

**Date:** 2026-10-01  
**Status:** frozen structural route-discovery design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Move the RLC proof one predecessor layer earlier without importing solved value information and without inventing a new Connect-Four proof primitive.

Exact root:

`44444156666623222242`

Required current state:

- rank 20;
- Player 1 to move;
- support `[1,6,1,6,1,5,0]`.

Consumed structural predecessor candidate:

`P1:c3`.

This move is not selected from an oracle. It is the already-consumed predecessor transition whose defender `c3` child reaches the newly qualified rank-22 routed-win theorem root.

## Frozen theorem library

The probe may compare exact current RBA states only against these already-qualified roots:

- rank-22 routed root: `4444415666662322224233`;
- rank-24 c1 zugzwang root: `444441566666232222423311`;
- rank-24 c3 singleton-handoff root: `444441566666232222423313`;
- rank-24 c7 routed root: `444441566666232222423317`.

Equality requires full exact RBA equality, never support equality.

## Procedure

After exact `P1:c3`:

1. enumerate every legal Player-2 reply;
2. record exact terminal/rank/support;
3. test direct exact equality with the qualified rank-22 routed root;
4. for every unclosed nonterminal child, evaluate production CPC read-only in baseline and frontier-response modes;
5. enumerate every legal Player-1 move from that child;
6. record immediate terminals;
7. for every nonterminal Player-1 candidate, evaluate production CPC read-only;
8. only when CPC supplies one exact forced/restricted defender column in both modes, execute that one defender cofactor;
9. compare the resulting exact rank-24 state with the three frozen qualified rank-24 roots;
10. record current-state minimal residual attachment and CPC projected-owner data needed to identify a CIC/RCIC resource if no theorem-root handoff exists.

The probe stops after that one forced macro-step. It does not recursively search or assign values to unclosed branches.

## Desired evidence

Useful positive evidence is:

- direct exact handoff to the rank-22 theorem;
- convergence of multiple physical routes to one exact theorem-root class;
- a CPC-forced macro-step that reaches a qualified rank-24 root;
- repeated current-state obligation/resource structure shared by otherwise unclosed children.

## Falsifiers / negative evidence

Preserve exactly:

- defender replies with no theorem-root route;
- CPC disagreement between baseline/frontier modes;
- forced macros whose exact child does not equal any known theorem root;
- support-equal but RBA-unequal states;
- P2 first terminals.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only. It does not certify the rank-20 state as a win unless a later frozen composition theorem closes every legal defender branch.
