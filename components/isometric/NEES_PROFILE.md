# NEES Draft 0.5 — corrected JSMinSys Surplus execution

NEES revision: `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.
JSMinSys revision: `3a8f8fa5d27ab7b28579aee460eed43eda1c0e48`.

**Conformance status: partial qualification; no NEES-EXTREME, JMS-RESTRICTED or
JMS-SEALED claim.**

## Ownership

Worker hot path:

```text
claim ready q
-> evaluate CPC/RBA outside TT transaction
-> retain one runnable continuation
-> blind-allocate/publish remaining unresolved surplus
-> enqueue that surplus directly
-> continue retained path
```

Workers explicitly do not:

- dedupe TT rows;
- merge transpositions;
- clean the TT;
- clean/reorder the global queue.

Branch Manager path:

```text
inspect shared surplus
-> merge duplicate/transposed q
-> maintain evidence/dependency topology
-> remove stale/redundant queue membership
-> sweep dead/resolved/redundant TT state
-> front highest-priority inspected work
-> signal resets for workers whose retained work became redundant
```

The manager neither evaluates the game nor generates/consumes surplus.

## Lifetime and cleanup

A manager-created duplicate redirect owns a temporary reference to its canonical
q. This prevents the canonical row from being reclaimed while pending parent
edges still point through the duplicate. The redirect pin is released when the
redirected row is safely recycled.

Capacity recovery is therefore a consequence of topology cleanup/dedupe. TT size
must not be increased merely to hide stale or redundant retained state.

## Synchronization

- TT topology/queue mutation is serialized by the existing TT transaction.
- Game evaluation remains outside that transaction.
- Workers publish surplus under the short publication transaction but perform no
  duplicate scan.
- Manager queue inspection/dedupe/cleanup occurs asynchronously.
- Reset flags are shared numeric words; workers honor them at control boundaries.
- STOP/DONE/ERROR/WAKE remain atomic session controls.
- Failure/timeout/cancellation returns no fabricated W/D/L.

## Priority

Workers attach CPC-derived branch priority. Manager maintenance inspects a
bounded queue window and moves the strongest inspected candidate to the head.
This limits manager cost while improving ready-work quality without inserting
manager logic into worker evaluation.

## Qualification

Connect4 run `35933307127`:

- 57/57 Connect4 tests;
- 128/128 pinned JSMinSys tests;
- independent 1/2/4-worker late-position oracle agreement;
- reflection/witness controls;
- worker-surplus / manager-dedupe ownership controls;
- redundant-worker reset control;
- canonical redirect lifetime regression;
- fail-closed interruption cleanup.

## Measurement debt

Re-measure:

- official Fhourstones one-worker qualification;
- 1/2/4-worker first-case scaling;
- live TT high-water and ready-queue occupancy;
- manager dedupe/cleanup rate;
- TT transaction contention;
- CPU cycles and wall time.

The prior Branch Manager capacity failures are invalid as performance evidence
for this corrected topology except as a regression control.
