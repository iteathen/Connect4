# IsoMax NEES / JSMinSys boundary

IsoMax no longer owns an independent hot execution kernel or result translator.

Cost and hot-path authority for the managed Connect4 runtime lives in JSMinSys,
pinned at:

`f191c5f2885d9ae0a966096c1616d597f7fbc58c`

NEES remains the parent cost authority used by JSMinSys. IsoMax itself retains
only cold application policy around `runManagedConnect4CpcRba32`.

Therefore:

- worker, Branch Manager and managed-session class construction is cold/init-time;
- recurring worker/manager/search operations are accounted in JSMinSys;
- production CPC-only move ordering uses JSMinSys live winning-line contribution scoring after exact CPC restrictions; static geometry order is tie-break only;
- final exact-value/WDL and witness/move result translation is performed and
  cycle-accounted in JSMinSys;
- IsoMax must not recreate local TT, RBA, evaluator, worker, manager, or result
  translation machinery;
- any future execution operation required by IsoMax should first be admitted and
  cycle-accounted in JSMinSys rather than implemented privately here;
- application-level timeout policy, CLI and reporting remain outside the
  local-node cycle budget.

Connect4 qualification still verifies exact oracle agreement, reflection/witness
transport, timeout/cancellation fail-closed behavior, cleanup, worker-count
behavior, and the thin dependency boundary.
