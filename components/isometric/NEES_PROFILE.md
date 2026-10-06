# IsoMax NEES / JSMinSys boundary

## Current package boundary — 2026-10-06

Connect4 consumes the frozen IsoMax0.2.0-rc.4 package under `isomax/`, from
JSMinSys source `89b1b147b8811bfd343724150ed304a081d61498`. The producer owns
the worker/session/cache/geometry support libraries and their562-unit ledger.
Connect4 owns the thin application API and independent qualification.

`components/isometric/solve.mjs` delegates to the package's public
`runLazySmpConnect4Rba32`; it does not recreate a worker, cache or result translator.
The prepared API is available through `isomax/index.mjs`.

Default execution discovers physical performance cores at initialization and
uses one deep center/live worker per target and the largest fitting memory
profile.1/2/4/8GiB tested;16/32/64/128GiB experimental, including automatic
selection. Private budget256MiB/worker; geometry widths and banks are selected
cold, with actual allocation/status reported. Native layouts, compiled support transitions, reflection
and exact/bound sharing retain the producer semantics. Worker creation, all
solver-owned allocation and configuration precede the all-ready barrier.
Windows/Linux bindings are verified before worker module/private TT setup.
macOS uses explicit scheduling hints, without a hard-pinning claim. CPU discovery,
binding/hints and readiness acknowledgements are cold support-library operations;
recursive search bodies and original unbanked hot cache functions are unchanged.
Historical four-worker performance evidence does not qualify another automatically
selected hardware/profile combination.

No hot diagnostic counters or clocks are added. Metrics are null when unavailable;
cache-protocol/cancellation atomics remain required work. Primary timing includes
empty-root construction after readiness; recorded process cycles include init and
cleanup. Small correctness fixture capacities are not performance settings.

## Historical replaced dependency/profile

The following describes the previous gitlink and profile, retained as historical
qualification rather than an active execution default.

IsoMax no longer owns an independent hot execution kernel or result translator.

Cost and hot-path authority for the active Connect4 Lazy-SMP runtime lives in
JSMinSys, pinned at:

`a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a`

NEES remains the parent cost authority used by JSMinSys. IsoMax retains only
cold application policy around `runLazySmpConnect4Rba32`. The default consumes
the selected six-deep/one-wide profile. The library
`docs/isomax-root-frontier-nees.md` owns its NEES Draft 0.5 scope and declared
JMS-RESTRICTED deviations; neither JMS-SEALED nor allocation-free V8 execution
is claimed. Integer WDL/bound transport is normalized without changing search.

Therefore:

- worker/session construction is cold/init-time;
- each Lazy-SMP worker owns a complete private CPC/Negamax search;
- private and shared exact-cache operations are cycle-accounted in JSMinSys;
- only committed exact W/D/L evidence is shared across workers;
- there is no Connect4 Surplus queue or Branch Manager execution role;
- final exact-value/WDL and caller-frame move translation are performed in
  JSMinSys;
- IsoMax must not recreate local TT, evaluator, worker, manager, or result
  translation machinery;
- future execution operations required by IsoMax must first be admitted and
  cycle-accounted in JSMinSys rather than implemented privately here; and
- application-level timeout policy, CLI and reporting remain outside the
  local-node cycle budget.

Connect4 qualification verifies exact oracle agreement, reflection/witness
transport, timeout/cancellation fail-closed behavior, cleanup, 2+/4-worker
behavior, shared-cache configuration, and the thin dependency boundary.
