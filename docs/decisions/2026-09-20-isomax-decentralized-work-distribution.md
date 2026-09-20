# IsoMax decentralized work-distribution implementation contract

**Date:** 2026-09-20  
**Implementation owner:** `solver/isometric`  
**Canonical research owner:** `research/semantic-quotient`  
**Primary candidate:** issue #102  
**NEES:** Draft 0.3 at `iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c`

## Decision

Implement issue #102 as one complete bounded vertical slice rather than as another optimization of the central scheduler.

The existing central `IsoMaxBranchManager` and `createSearchWorkerExecutor` remain unchanged as correctness/performance controls while the new architecture qualifies.

The candidate architecture is a separate execution profile:

```text
evaluator workers
    claim globally READY execution records themselves
    reconstruct one portable replay in worker-local native state
    consume exact/deterministic structure locally
    expose every successor at the first genuine decision frontier
    relinquish discovery-lineage privilege
    return to global claiming

shared work system
    owns execution reservation only
    fixed-width SharedArrayBuffer records
    bounded priority queues
    generation-safe slot reuse
    READY -> RUNNING by worker CAS
    retirement through shared needed/liveness state

Branch Manager / reconciler
    never assigns a worker
    canonicalizes q_r from portable replay
    owns typed canonical-q and occurrence/edge arenas
    merges convergent occurrences
    collapses duplicate READY
    retires duplicate/obsolete RUNNING
    propagates exact WDL
    updates global priority
    reclaims execution slots
```

NEES class follows cadence, not process/file ownership.

## Identity domains

Never collapse these domains:

```text
physical replay occurrence
parent/action occurrence
canonical q_r dependency
execution work slot
worker-local residual/class/chunk IDs
proof/certificate identity
```

Worker-local residual/class/chunk IDs never cross the worker boundary.

Portable work is a legal move replay stored as fixed move bytes in shared slot storage.

Manager-local q coordinates are derived in one manager-owned residual pool. Hashes locate candidate q slots; exact p0/p1/support coordinates establish equality inside that pool.

q_o versus q_r and the reflection action transporter retain logic-authority 1.2 meaning.

## Work-slot lifecycle

Execution slots are not semantic identity.

Each slot carries a generation and follows:

```text
FREE
  -> WRITING
  -> READY
  -> RUNNING
  -> DONE / RETIRED
  -> FREE(next generation)
```

Rules:

- slot reuse increments generation;
- queue/publication records carry slot + generation;
- stale records fail generation/ticket checks and are ignored;
- READY claim is atomic;
- claiming grants temporary execution reservation only;
- manager may set `needed=0` on obsolete RUNNING work;
- retired/failed/unfinished work never publishes WDL;
- only manager reconciliation releases a slot to the reusable free pool.

## Worker execution rule

A claimed dependency has two semantic cases.

### Deterministic structure

The worker reconstructs the claimed legal replay once in reusable worker-local state.

It then consumes:

- exact native terminal/value closure;
- exact forced native response;
- exact ordinary legal outdegree one.

For outdegree one it applies the unique move directly and continues.

It does **not** enqueue a deterministic edge merely to reclaim it.

If deterministic descent reaches exact WDL, the worker publishes one exact completion for the original claimed dependency.

If deterministic descent reaches a different q decision frontier, the manager later records a pass-through canonical dependency from the claimed q to that frontier q. The worker does not schedule the endpoint separately merely to rediscover the frontier it already reached.

### Genuine decision frontier

At two or more live legal successors the worker:

1. computes only cheap numeric scheduling metadata already available from native state;
2. reserves one bounded shared work slot for every successor;
3. writes every successor replay to fixed shared move storage;
4. publishes every successor occurrence;
5. publishes one frontier-end record;
6. returns to global claiming.

No child is retained merely because this worker discovered it.

## Publication protocol

Publication is a bounded numeric MPSC/MPMC ring.

Record kinds:

```text
CHILD
FRONTIER_END
EXACT
RETIRED
FAILURE
```

A frontier is committed semantically only after the matching `FRONTIER_END` for the current work attempt is observed.

Child records received before the end are staged in fixed numeric storage keyed by parent execution slot.

This prevents partial worker death from creating half-published semantic topology.

Every execution claim has an attempt number.

Worker death or explicit requeue invalidates the old attempt. Late publication from an old attempt is stale and cannot become semantic authority.

## Canonical q reconciliation

The manager uses one reusable native state to replay published paths from the external root without allocating a state per occurrence.

Canonical q arena fields are fixed typed arrays.

At first occurrence of q:

- allocate q index;
- attach occurrence;
- adopt the provisional execution slot if q still needs execution.

At repeated occurrence:

- attach/redirection points to existing q;
- exact q immediately satisfies the occurrence;
- duplicate READY work is retired/reclaimed;
- duplicate RUNNING work gets `needed=0`;
- already-expanded q does not receive another useful execution root.

A canonical q may have many incoming parent/action occurrences but at most one useful execution root after reconciliation.

## Parent/action occurrence arena

Edges are fixed numeric records containing at least:

```text
parent q index
child q index
physical parent action
next outgoing edge
next incoming edge
liveness
frontier attempt provenance
```

Action labels remain occurrence-local. Scalar q_r WDL may be shared without pretending reflected literal actions are identical.

Root witness remains physical and center-first.

## Exact completion

Only WDL in `{-1,0,+1}` is publishable as exact.

On exact q completion:

- conflicting duplicate exact publication fails closed;
- every live parent occurrence sees the same scalar value;
- parent exact reduction is retried;
- obsolete sibling demand is retired;
- demand loss recursively releases no-longer-needed descendants;
- no unfinished/retired/failure token is interpreted as draw.

Outdegree-one/pass-through q takes its child value directly.

Decision q uses fixed-P0 max/min semantics and exact target cutoffs.

## Root witness

Root value completion and root action completion are separate.

For an ordinary root decision, choose the first center-order physical edge whose child equals the root value **only after all earlier physical edges are exact**.

For a root deterministic chain, retain the first forced/only legal physical move as the root witness.

Completion order must not change the root action.

## Priority

The first integrated implementation uses explicit coarse bands, not an opaque fitted scalar.

Initial unreconciled provisional work enters the lowest band.

After canonical reconciliation, transparent priority inputs are:

- direct root criticality;
- whether any live parent is one unresolved dependency from closure;
- canonical q fan-in;
- otherwise ordinary canonical READY work.

All competing READY work uses the same global queues.

Priority changes enqueue a new ticket; stale older tickets fail the ticket check.

Cost magnitude can later include worker affinity, support-conditioned competitive width and observed task cost without changing ownership.

## Affinity

The complete representation records discovery/last-worker affinity numerically.

Affinity is not ownership and never causes waiting.

A preferred worker may consume an affinity hint only when it does not bypass higher global priority.

The initial correctness vertical slice may leave affinity neutral while recording the field; tuning occurs only after the complete architecture qualifies semantically.

## Capacity and backpressure

Workers do not own a backpressure policy.

Bounded shared capacities are explicit:

- work slots;
- per-band queue cells;
- publication cells;
- canonical q arena;
- occurrence/edge arena.

Storage exhaustion fails closed with a capacity error unless a safe global free slot becomes available.

Visibility may exceed executing work, but not declared storage capacity.

## Failure / worker death

Unexpected worker death never publishes a value.

RUNNING slots owned by a dead worker are invalidated and requeued from their portable replay when still needed.

Any partial frontier from the dead attempt is invalidated by attempt number.

If no evaluator worker remains, the solve fails closed.

Global abort sets shared abort state, wakes all workers, drains/terminates ownership and publishes no fabricated WDL.

## NEES E2 constraints

Branch publication, claim and reconciliation are E2.

They therefore use:

- fixed-width numeric records;
- preallocated typed/shared memory;
- stable integer indices;
- bounded atomic state transitions;
- numeric counters only.

Do not copy the central scheduler's E3 Map/Set/Promise/task-object/structured-clone machinery into these paths.

The host-facing solve Promise, worker startup messages and cold final reporting remain E3.

## Qualification sequence

1. lifecycle/state-machine tests using small capacities and forced slot reuse;
2. stale generation/ticket/publication tests;
3. duplicate READY and duplicate RUNNING convergence;
4. worker-death/requeue, abort and capacity controls;
5. exact WDL/root-action differential against serial and central manager;
6. deterministic-chain controls including first-win and one-legal-column cases;
7. 1/2/4-worker completed-solve comparison against the retained central scheduler;
8. tune priority, affinity and yield policy only inside the complete system;
9. bounded empty-root telemetry without solve extrapolation.

Metrics must distinguish:

- calls / native transitions performed by workers;
- canonical q count;
- canonical decision expansions;
- publication occurrences;
- duplicate READY collapsed;
- duplicate RUNNING retired;
- stale records;
- priority claims by band;
- reconciliation lag/batches;
- retirement waste;
- coordination operations;
- memory/capacity high-water;
- cleanup.

This contract does not promote issue #102 by itself. Promotion follows completed implementation qualification.
