# Native IsoMax execution

`IsoMaxBranchManager` reintegrates bounded ready-work supply with the existing
`createSearchWorkerExecutor`. It runs `IsoMaxSolver` in real Node worker
threads. The older quotient kernel/Negamax engine is not used by these workers.
The manager is an execution role on the calling thread, not a second solver
representation. It owns native q task dependencies and fixed-P0 exact backup.

Normal performance entry: `npm run bench:isomax:performance`.
Public one-shot entry: `await solveIsoMax(moves)`. For repeated roots use
`new IsoMaxBranchManager(options)`, `await manager.solveMoves(moves)`,
and `await manager.close()` in finally. `IsoMaxSolver` remains the synchronous
worker kernel and explicit serial correctness/performance control.

Default workers: min(4, available logical CPUs minus one), minimum one. This leaves
capacity for the manager/other host work; it is not a proven optimum or a
guarantee of contention-free BSFP orchestration. Set `workers` explicitly when
composing resource owners. GPU work is never launched.

The manager exposes a bounded reservoir of authoritative ordinary-value tasks.
Exact native frontier consequences and forced single edges retain precedence.
It deduplicates q in its own residual pool; only legal replay paths cross worker
boundaries, never process-local class IDs. Workers reconstruct native state once
per task and recurse directly on packed WSL state. Root ordering scope remains
the original external root ply; result arrival order cannot change root ties.

Workers run synchronous bounded quanta (default 65,536 calls). A yielded task
returns `split` with no value, plus its unfinished native dependency path and
already proved sibling values. Only `exact` returns WDL. The manager expands
unfinished work at its actual child-value dependencies and consumes completions
incrementally. A node quota is scheduling, not search depth or a WDL cutoff.
Worker-local exact caches survive yields; q equality in the manager shares
completed task values. There is no shared recursive transposition table yet.

At an exact parent cutoff, queued unnecessary tasks retire before execution.
Busy tasks observe their manager-owned necessity word at scheduled checks,
unwind to their exact root and return retired without WDL. They never inspect
the queue or take another branch inside recursion. Root result-ready time and
drain/termination time remain separate. Abort/retirement checks occur every
512 recursive entries, and at the exact task budget boundary.
Worker fault, bad result, missing work or capacity exhaustion fails closed.
No unfinished result is published as draw.

Before each quantum, the worker reserves and seals residual/chunk dictionaries,
reference widths and its exact transition cache. At most four new residual
classes per admitted node covers the ordinary replay profile (own, block and
their reflections); each class contributes at most one chunk per slot. This is
a conservative capacity bound, not measured expected occupancy. Reservation and
any rehash/copy happen before recursion, retaining warm IDs and exact values.
Sealed overflow fails explicitly; it cannot trigger recursive allocation.
Memory shares above are retained-record thresholds, not reserved-byte limits.

The recursive scheduling overhead is one numeric threshold check. Abort polls
occur every 512 nodes or at the exact budget boundary. A yield saves the active
path to preallocated bytes, unwinds native play/undo, and only then packages
dependency messages. There is no inherited per-node wrapper/catch, per-node
promise, reporter call, string key, or conclusion-object construction.
The explicit synchronous certificate/RBA and serial controls are outside this
bounded fixed-storage worker profile.

Manager q deduplication also uses the existing exact numeric triple cache;
it no longer formats strings. Manager dependency objects and legal replay
messages remain outside recursive worker execution. The performance entry
posts periodic snapshots without waiting; a dedicated reporting worker owns
JSON/output. Cleanup drains its FIFO after search workers terminate. Telemetry
RSS/CPU are process-wide; heap figures explicitly identify the reporting
isolate and must not be mistaken for aggregate solver heap.

The manager exposes up to twice the worker count as ready work and submits at
most one task per worker, keeping stale queued speculation off the executor.
Manager q capacity defaults
to 262,144 and fails visibly at exhaustion. V8 old-generation budgets split a
4096 MiB budget among workers plus the host share; this is not an aggregate RSS
limit. A session retention allowance of 1,048,576 classes and 8,388,608 cache
entries is divided across workers. Pools reset only between tasks above their
share; a task may temporarily exceed it. Typed arrays/runtime overhead must be
included in measurements. Small identical per-worker caps were rejected because
they repeatedly discarded useful exact values on the one-worker control.
The public solve deadline cannot exceed 120 seconds. The performance supervisor
reserves up to one second inside its existing wall deadline for worker cleanup.

This public parallel profile accepts legal replay roots with native ordinary
value semantics. It does not serialize custom certificate indexes or optional
RBA resolver objects; their synchronous API remains explicit. It introduces no
new proof transfer, exploration-as-proof rule, CPU/GPU adapter or legacy board
inside recursion. The historical executor's proof/exploration priority and
failure handling are reused; this integration supplies authoritative IsoMax
tasks, not speculative exploration presented as exact value.

Research inspected: canonical `ae30ed3b` (new loss14 result changes no worker
contract), earlier Branch Manager/worker source and lifecycle tests, C4-0010
execution/proof separation, C4-0011 native value/identity/root-order contracts.
Execution policy is explicitly restated for IsoMax; the old Negamax algorithm
does not become its authority.

Qualification:
```sh
node --test components/isometric/test/execution.test.mjs research/semantic-quotient/state-identity-unification/src/quotient-worker-contract.test.mjs
node benchmarks/isomax-workers/run.mjs
```
The benchmark uses three preselected expensive synthetic roots, three fresh
processes per worker count, and includes session startup/cleanup. Correct WDL
and root actions must match the serial native control. It measures completed
answers, not summed throughput alone. Empty-board telemetry is separately
bounded and does not claim a solve.
## Fixed residual-transition memo qualification (#75)

The default pool now reserves two 65,536 × 42 Int32 transition tables (21 MiB
per pool), before recursion. IDs and terminal/unknown sentinels remain local;
no equality or WDL rules change. Above the prefix, exact dense computation
continues. Measured against the prior 4K policy in ISSUE-CAMPAIGN.md; a 16K
control was also tested. Include the manager pool and every worker pool when
accounting memory. This is a measured policy for this workload/host, not a
claim of a universal optimal prefix or a reason to grow during recursion.
