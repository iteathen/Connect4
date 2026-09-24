# IsoMax NEES / JSMinSys boundary

IsoMax no longer owns an independent hot execution kernel.

Cost and hot-path authority for the managed Connect4 runtime lives in JSMinSys,
pinned at:

`24ef9b4dff33be85af6b403d563294983662fb78`

NEES remains the parent cost authority used by JSMinSys. IsoMax itself retains
only cold application policy and API translation around
`runManagedConnect4CpcRba32`.

Therefore:

- worker, Branch Manager and managed-session class construction is cold/init-time;
- recurring worker/manager/search operations are accounted in JSMinSys;
- IsoMax must not recreate local TT, RBA, evaluator, worker or manager hot loops;
- any future hot operation required by IsoMax should first be admitted and
  cycle-accounted in JSMinSys rather than implemented privately here;
- application-level timeout/result formatting/CLI/reporting remains outside the
  local-node cycle budget.

Connect4 qualification still verifies exact oracle agreement, reflection/witness
transport, timeout/cancellation fail-closed behavior, cleanup, worker-count
behavior, and the thin dependency boundary.
