# IsoMax JSMinSys implementation

This directory is the current Connect4 application adapter for the merged
JSMinSys shared-TT CPC-first IsoMax execution path.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@d176330ebed2c29d8b71f290f95734b107817d3e`

## Execution topology

```text
solve7x6 legal replay
  -> runtime-configured 7x6 RBA geometry
  -> canonical root q + basis
  -> shared RBA TT
       ├─ exact q identity / bounds / dependencies
       ├─ ready work queue
       └─ event queue
  -> one Branch Manager thread
       └─ attach/reconcile events; expose surplus dependencies
  -> N evaluator workers
       ├─ claim ready q directly
       ├─ CPC-first structural evaluation
       ├─ one-ply RBA cofactors
       ├─ publish exact/scalar child evidence
       ├─ retain at most one unresolved child directly
       └─ leave surplus unresolved children for manager exposure
  -> exact root W/D/L + deterministic caller-frame move
```

There is no per-branch worker message/RPC. The TT is the sole q/work/dependency
authority. The Branch Manager does not manufacture game work and does not own a
second task table.

## Work queue

The shared queue is the intrusive ready-q list inside JSMinSys
`addons/rba-tt32.mjs`. Generation, refs, execution ownership, queue membership
and q lifetime are carried by the same TT row.

The publishing worker retains the first runnable child in prepared action order.
After manager attachment/reconciliation, remaining unresolved children are
eligible for the shared ready queue and may be claimed by any evaluator worker.

The current queue is FIFO across published q arrivals. Prepared action order and
CPC bounds determine local publication/retained-child order. A stronger global
value-priority queue is a future optimization, not claimed by this checkpoint.

## Branch Manager ownership

Reusable scheduling mechanics live in JSMinSys
`addons/rba-branch-manager.mjs`.

Connect4 supplies only its domain callbacks:

- `evaluateConnect4CpcRbaTt32`;
- `publishConnect4RbaEvaluation32`;
- `reconcileConnect4RbaEvent32`.

The manager executes reconciliation under the TT transaction. CPC/RBA game
evaluation runs outside that transaction.

## Current profile

Public `solve7x6` supports 1..64 evaluator workers. The manager is a separate
thread and worker IDs are execution ownership only; they are not tied to fixed
cores or semantic branches.

Default shared TT:

```text
capacity    65,536 q rows
buckets     65,536
manager turn budget 64 events
ready target        2 * workers
```

These are resource/scheduling defaults, not semantic limits.

Public W/D/L remains P0-oriented:

```text
+1 = P0 win
 0 = draw
-1 = P1 win
```

Timeout, cancellation, capacity/contract failure and worker failure return no
W/D/L.

## Qualification

Connect4 CI run `35930426403`:

- Connect4: 57/57 tests passed.
- Pinned JSMinSys: 125/125 tests passed.
- Maintained late 7x6 oracle controls agree at 1/2/4 evaluator workers.
- Mirrored caller-frame witnesses agree.
- Shared branch queue is exercised by real workers.
- Deadline/cancellation cleanup is fail-closed.

The earlier single-worker private-alpha-beta Fhourstones result remains historical
comparison evidence only. The branch-manager implementation must be benchmarked
separately before assigning it that result.
