# CPC q5d34 G4 E/F-reply G5 survivor audit 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC consequence design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume only:

- `CPC_Q5D34_G4_FOUR_REPLY_FORCED_SAFETY_0_1.json`;
- `CPC_Q649_TWO_REPLY_CONSEQUENCE_CLASS_CLOSURE_0_1.json`;
- `CPC_Q5D34_EF_NONWIN_CONVERGENCE_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`.

Within q5d:G4:

### P1:E6 reply

Rank-36 q `f435a6ec7dd5469e` has:

- C4 unsafe by immediate P1:C5 exposure;
- F6 safe -> exact q649, already P0-nonwinning by P1 draw;
- G5 safe -> q `5992c0c8965586f2`.

Thus G5 is the only remaining P0 winning candidate in this class.

### P1:F6 reply

Rank-36 q `6c9a60f756817109` has:

- C4 unsafe by immediate P1:C5 exposure;
- E6 safe -> exact q649, already P0-nonwinning by P1 draw;
- G5 safe -> q `7cac0ef80f3901f7`.

Thus G5 is the only remaining P0 winning candidate in this class.

## Purpose

Apply the unchanged forced terminal-safety operator independently to the two rank-37 P1-to-move survivor classes:

- `5992c0c8965586f2`;
- `7cac0ef80f3901f7`.

## Per-survivor result

Report one of:

- `P0_WIN_FORCED_CHAIN`;
- `P0_LOSS_FORCED_CHAIN`;
- `DRAW_FULL_BOARD`;
- `UNRESOLVED_MULTIPLE_SAFE`.

If a survivor is loss/draw, its rank-36 predecessor is P0-nonwinning because every alternative P0 action is already loss/nonwin.

If a survivor is a forced P0 win, its predecessor is P0-winning through G5.

If unresolved, preserve the exact next fork.

## q5d:G4 implication

Because P1 chooses among the G4 replies:

- if either predecessor is P0-nonwinning, G4 is P0-nonwinning;
- otherwise this experiment does not certify G4.

If G4 becomes P0-nonwinning, combine with the already-qualified q5d E/F nonwin result to classify q5d34 P0-nonwinning.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

No branch is followed after a multiple-safe state.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
