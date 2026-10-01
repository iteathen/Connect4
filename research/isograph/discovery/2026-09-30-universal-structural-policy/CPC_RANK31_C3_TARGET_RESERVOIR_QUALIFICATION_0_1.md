# CPC rank-31 c3r5 truncated target-reservoir qualification 0.1

**Date:** 2026-10-01  
**Status:** frozen structural theorem candidate before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Test the already-qualified truncated target-reservoir pairing theorem on the exact rank-31 current state reached structurally by:

`rank28 P1:c5 -> unique P2:c7 -> rank30 P1:c1`.

Exact qualification locator:

`4444415666662322224233177555571`

The locator is provenance only. The exact RBA state must have:

- rank 31;
- Player 2 to move;
- support `[3,6,3,6,5,5,3]`;
- an active Player-1 singleton target at c3r5;
- c3r5 nonplayable at the current support frontier;
- CPC projected owner Player 1 for c3r5;
- no currently playable Player-2 singleton terminal.

## Qualified schema consumed

Consume the structural theorem:

`CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md`

but synthesize the pairing **fresh** for this exact state. No template from an earlier rank-29 family may be copied.

Target:

`t = c3r5`.

Construct the truncated relevant capacity:

- target column c3 ends at r5;
- every non-target column extends only through its remaining physical cells.

Search all synchronized pairings of odd-capacity columns and all legal odd prefix lengths, requiring:

1. target c3r5 is a Player-1 response cell, never a cross-pair endpoint;
2. every active Player-2 residual is covered by:
   - a vertical Player-1 response,
   - both endpoints of one synchronized cross pair,
   - or post-target gravity deferral;
3. no currently playable Player-2 singleton terminal exists.

## Independent falsification traversal

For any synthesized template, execute an exhaustive exact-RBA traversal of the finite response law:

- every legal Player-2 trigger must map to a legal paired Player-1 response;
- no Player-2 terminal may occur before the response;
- earlier Player-1 terminals are accepted;
- otherwise the finite pairing must ultimately reach the c3r5 response terminal.

The traversal is a falsification cross-check; the proof certificate remains the finite pairing plus exact residual coverage.

## Acceptance

Set `accept=true` only if:

- the singleton/owner/mover guards hold;
- a fresh valid template exists;
- all active Player-2 residuals have exact coverage witnesses;
- exhaustive exact-RBA traversal reports no failure.

If no template exists or traversal fails, record `accept=false` as an exact theorem rejection. Do not repair the template after seeing the result.

## Scope if accepted

Acceptance proves only this exact rank-31 state is a Player-1 win.

It may then be composed backward only through independently qualified structural transitions. It does not consume or validate any diagnostic W/D/L recursion.

## Boundary

- `oracleUsed=false`;
- `solvedInputsUsed=false`;
- `ordinaryGameTreeSearchUsed=false`;
- no Pons, solved database, BSFP solved frontier, or sealed holdout;
- production CPC and JSMinSys unchanged;
- BSFP unchanged.
