# CPC/formula three-coordinate local semantic decoder theorem

Date: 2026-10-01
Version: 0.1 frozen before execution
Status: exact local theorem candidate
Branch: research/universal-structural-policy-20260930

## Purpose

Use the already-qualified CPC/formula bridge to determine whether the three formula-inspired coordinates

F = (Bx, By, Bxy)

carry a direct structural meaning inside the exact three-column CPC phase-transfer family.

This is a local semantic theorem only. It does not revive the old scalar decoder.

## Source evidence

The theorem may consume only:
- CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json
- CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json

Both were generated without oracle or solved-value premises.

## Candidate decoder

For each exact Player-2 trigger transition in the qualified phase machine, inspect F immediately after the Player-2 move and before the certified Player-1 response.

The candidate exact code is:

- F = [1,0,0]  => TRANSFER
- F = [0,1,0]  => EXPOSE_C3
- F = [0,0,0]  => EXPOSE_C5

where:
- TRANSFER means the certified Player-1 response is legal/nonterminal and returns to the viability family;
- EXPOSE_C3 means the trigger exposes the c3 singleton and P1:c3 is exact first win;
- EXPOSE_C5 means the trigger exposes the c5 singleton and P1:c5 is exact first win.

No other post-trigger F vector may occur in the qualified finite family.

## Bxy disposition

The pilot also suggests:
- Bxy = 1 at the initial Q state;
- Bxy = 0 at every later exact Player-2 state in the phase machine;
- Bxy = 0 after every defender trigger.

Therefore Bxy is a candidate one-time mixed/coupling state bit in this family, not a direct terminal-value bit.

Qualification records this pattern but does not generalize its meaning.

## Formula-to-CPC interpretation

If qualified, the local semantics become:

Bx:
  viability / transfer-versus-exposure channel

By:
  conditional exposed-target orientation when Bx=0

Bxy:
  mixed/coupling bit present at the initial unresolved orientation and extinguished after the first defender event in this family

This would give current-state game semantics to all three coordinates in one exact bounded system.

## Falsifiers

Reject if:
- any TRANSFER row has post F other than [1,0,0];
- any exact c3 exposure has post F other than [0,1,0];
- any exact c5 exposure has post F other than [0,0,0];
- any row with one of those F vectors has a different qualified structural role;
- any unexpected post-trigger F vector occurs;
- Bxy is nonzero after any defender trigger;
- the result requires an old scalar code, oracle value, local game-tree value or solved W/D/L premise.

## Scope

This theorem applies only to the exact qualified three-column phase-transfer family.

It does not prove universal meanings for By or Bxy, standard 7x6 value from the old formula, rank 10, v5 or a complete Connect Four solve.
