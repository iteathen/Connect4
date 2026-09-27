# IsoMax NEES / JSMinSys boundary

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
