# IsoMax Phase-2 plan — row-carried shared exact publication

Date: 2026-09-28
Status: planned experiment from selected solver baseline `81c9475e94607cff9e777776157b82b3466c385b`.

## Trigger

The compact private-cache experiment qualified:
- whole-process cycles -1.807%, 95% [-2.545%, -1.069%];
- nodes -0.771%;
- cycles/node -1.045%.

The selected 7x6 private and shared caches now use the same exact 8-word identity
layout while retaining the full 14-word q and full-q locator hash.

On exact fixture `353335714`, the winning candidate still attempts about
1.594 million shared exact stores per solve.

## Measured redundancy

For an ordinary exact publication the current path is:

1. compute full-q locator hash;
2. materialize the exact private cache row;
3. if sharing admission passes, call the shared exact store;
4. the shared store re-reads q and reconstructs the same compact 8-word identity;
5. publish that identity atomically.

Thus selected 7x6 pays compact support/tail reconstruction twice on admitted
shared exact stores even though the exact compact identity already exists in the
private row.

The same opportunity exists when opposite private LOWER0/UPPER0 rows coalesce to
an exact draw: the matching private row is already materialized before shared
exact publication.

## Candidate

Create an isolated JSMinSys branch from exactly `81c9475e...`.

Add a known-hash shared publication helper that accepts an already-materialized
private exact-identity row:

```
shared cache
+ local key array
+ local row offset
+ exact value
+ already-computed full-q hash
```

The helper must:
- keep the same direct-map slot from the full-q hash;
- keep the same seqlock/CAS publication protocol;
- copy exactly `storedKeyWords` from the private row into shared atomic keys;
- keep exact-only shared values;
- keep contention/drop behavior unchanged.

Use it only where the private row has already been proven/materialized:
- ordinary exact local store followed by shared publication;
- same-q opposite zero bounds after exact draw coalescing.

## Exactness guard

Private and shared row layouts must match before search:
- same full keyWords;
- same storedKeyWords;
- same compact-profile selection.

The standard host creates both from the same initialized geometry. Add an
explicit preparation-time guard rather than relying on convention.

Compatibility/public shared q-store APIs remain unchanged.

## Expected structural savings

For selected 7x6, row-carried publication replaces a second q-to-compact
construction with eight hot private-row loads.

It removes the second:
- compact-support reconstruction;
- compact-tail reconstruction;
- associated q loads/shifts/ands/ors.

The private row was just written or already matched and is expected to be hot.

This is not an admission change and must not change shared store count by design.

## Correctness gates

- compact 7x6 row publication round-trips exact value;
- forced direct-map collision still rejects different q on probe;
- non-7x6 full-key row publication remains exact;
- preparation rejects mismatched local/shared stored layouts;
- private LOWER0/UPPER0 exact-draw publication remains exact;
- Verify/schema/runtime-geometry/Node compatibility green;
- cycle ledger/source blobs updated in the same source commit;
- no single-worker execution.

## Benchmark

A = `81c9475e...` selected compact-private baseline.

B = row-carried shared-publication candidate.

Fixed:
- 4 workers = 1 wide + 3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- full sharing / sharedSampleMask=0;
- Node 26.7.0.

Primary fixture `353335714`: eight balanced completed exact A/B blocks.
Authority: whole-process cycles.

Secondary fixture `35333571`: 120000 ms application ceiling; censored if
either arm times out.

Reject if correctness fails or the completed exact whole-process-cycle interval
does not establish improvement.

PR #84 remains draft/open and is not authorized for merge by this work.
