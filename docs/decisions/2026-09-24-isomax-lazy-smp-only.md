# Decision: IsoMax uses Lazy SMP only

**Date:** 2026-09-24 (America/Los_Angeles)

The Connect4 Surplus + Branch Manager execution composition is retired.

## Profile supersession — 2026-10-06

The owner requested that the promoted IsoMax0.2.0-rc.2 package replace the old
Connect4 solver. `isomax/profile.json` and `isomax/provenance.json` now own the
current execution settings/source. Four deep workers, rootFrontierfalse, 4 GiB
shared/256MiB private TT per worker, licensed shared zero bounds and600s search
ceiling supersede the old seven-worker profile and exact-only-sharing description.
Lazy SMP remains the only active execution composition; single-worker execution
and the retired Surplus scheduler remain forbidden. Solver kernels are unchanged
copies of the qualified producer. The paragraphs below preserve the prior decision
and do not restore its old operating profile.

## Historical execution selection

- Public IsoMax delegates to JSMinSys `runLazySmpConnect4Rba32()`.
- Lazy SMP requires at least two search workers; single-worker execution remains forbidden.
- Each worker performs a complete private CPC/Negamax exact search.
- Workers share only committed exact W/D/L cache evidence.
- No shared Surplus queue or Connect4 Branch Manager participates.
- The owner-selected 2026-09-27 profile uses six deep workers and one native root-frontier worker, 4M shared/1M private cache entries and full exact sharing (mask `0`). Historical mask-7 evidence remains revision-scoped.

## Code ownership

JSMinSys retains generic worker, TT, BranchManager and session primitives where
they remain reusable, but the Connect4 managed Surplus host/worker/manager
composition and CPC Surplus publication/reconciliation API are removed.

Historical Surplus qualification remains in Git history and explicitly marked
historical documents; it is not an allowed production or qualification path.
