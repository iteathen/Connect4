# Decision: IsoMax uses Lazy SMP only

**Date:** 2026-09-24 (America/Los_Angeles)

The Connect4 Surplus + Branch Manager execution composition is retired.

## Active execution

- Public IsoMax delegates to JSMinSys `runLazySmpConnect4Rba32()`.
- Lazy SMP requires at least two search workers; single-worker execution remains forbidden.
- Each worker performs a complete private CPC/Negamax exact search.
- Workers share only committed exact W/D/L cache evidence.
- No shared Surplus queue or Connect4 Branch Manager participates.
- The current default shared-cache sampling mask is `7` (one-eighth eligible traffic), subject to continued performance qualification.

## Code ownership

JSMinSys retains generic worker, TT, BranchManager and session primitives where
they remain reusable, but the Connect4 managed Surplus host/worker/manager
composition and CPC Surplus publication/reconciliation API are removed.

Historical Surplus qualification remains in Git history and explicitly marked
historical documents; it is not an allowed production or qualification path.
