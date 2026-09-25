# IsoMax NEES / JSMinSys boundary

IsoMax no longer owns an independent hot execution kernel or result translator.

Cost and hot-path authority for the managed Connect4 runtime lives in JSMinSys,
pinned at:

`19a96823cad46c7e5e9e70e0d68079d5574f92a3`

NEES remains the parent cost authority used by JSMinSys. IsoMax itself retains
only cold application policy around `runManagedConnect4CpcRba32`.

Therefore:

- worker, Branch Manager and managed-session class construction is cold/init-time;
- recurring worker/manager/search operations are accounted in JSMinSys;
- production managed workers CPC/RBA-evaluate claimed q, retain one continuation, and publish unresolved surplus siblings to the shared queue; Branch Manager remains off the worker evaluation hot loop;
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
