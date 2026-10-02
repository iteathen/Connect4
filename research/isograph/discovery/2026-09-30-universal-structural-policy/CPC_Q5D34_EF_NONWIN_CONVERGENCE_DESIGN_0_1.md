# CPC q5d34 E/F nonwin convergence and surviving-G reduction 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume only:

- `CPC_Q5D34_THREE_ACTION_FORCED_SAFETY_CENSUS_0_1.json`;
- `CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json`;
- `CPC_Q649_TWO_REPLY_CONSEQUENCE_CLASS_CLOSURE_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q identity.

Target exact state:

- q: `5d34e24395b9d801`;
- rank: 34;
- support: `[6,6,3,6,5,5,3]`;
- safe P0 actions: E6, F6, G4.

## Exact composition

Recompute and require exact semantic-q identity for both cross replies:

```text
q5d:E6 -> P1:F6 -> e5d63da12420fdb3
q5d:F6 -> P1:E6 -> e5d63da12420fdb3
```

Then compose only already-qualified consequences of exact q `e5d63da12420fdb3`:

1. the q2db forced-safety evidence identifies `e5d63…` at rank 36 and proves:
   - C4 is unsafe by exact P1:C5 terminal exposure;
   - G4 is its unique safe P0 action;
   - G4 reaches exact q `6496c888c4e2a157`;
2. the q649 consequence closure proves P1 has a G5 consequence from q649 that follows a unique forced chain to a full-board draw.

Therefore q649 is P0-nonwinning, hence `e5d63…` is P0-nonwinning, hence either q5d root action E6 or F6 can be answered by P1 into a P0-nonwinning exact state.

## Result

Report:

- exact bridge checks for both E/F cross replies;
- exact q identity to `e5d63…`;
- exact e5d63 unique-safe handoff to q649;
- exact q649 draw witness;
- E6 disposition `P0_NONWIN`;
- F6 disposition `P0_NONWIN`;
- G4 disposition `SURVIVING_CANDIDATE`.

If any exact-q bridge fails, classify `INTEGRATION_FAILURE` rather than inferring a result.

## Boundary

This proves only that E6 and F6 cannot force a P0 win. It does not classify G4 or q5d34 itself.

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
