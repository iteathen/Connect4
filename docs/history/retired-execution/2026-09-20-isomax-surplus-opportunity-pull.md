> HISTORICAL SNAPSHOT at Connect4 `7db9b5c3d31d86e7cfee84d02c551a96c892d0cb`.
> Retired execution design/evidence; not current implementation authority.
> See ../../decisions/2026-09-24-isomax-lazy-smp-only.md.

# IsoMax decentralized retained-pull / shared-TT execution

**Status:** active implementation contract for issue #102  
**Implementation branch:** `work/isomax-surplus-pull-102-corrected`  
**Clean rebuild point:** `cc0519528e823b01b2dc2b46512e0a2f9768147a`  
**NEES authority:** `iteathen/NEES@34412670878316295736799097ebb8f248a7bb50` — Draft 0.4  
**Gameplay authority effect:** none

This document supersedes the earlier occurrence/reconciler/helper-work realization of #102. Git history preserves that experiment; active source must not preserve its duplicate lifecycle machinery.

## Solver-family separation

This architecture is **IsoMax-only**.

BSFP remains a separate exact-solver solution. IsoMax must not import BSFP state, fixed-point recurrence, proof procedure, scheduling semantics, implementation machinery, or optimization authority. Cross-solver synthesis is deferred until IsoMax is independently performing near its intended limit and the owner explicitly requests that synthesis.

Repository-wide BSFP CI may run when this branch changes; that is unrelated regression coverage and is not IsoMax qualification evidence.

## Single authority

The governing invariant is:

```text
shared canonical TT
    = semantic q authority
    + exact-value authority
    + live execution authority
```

BranchManager organizes this table. Workers execute against this table. The global queue contains only generation-safe references into this table.

There is no manager-private q table and no independent q-work object.

```text
                         SHARED TT
                 +---------------------+
                 | exact canonical q   |
                 | exact W/D/L         |
                 | execution state     |
                 | priority metadata   |
                 | generation/liveness |
                 | portable replay     |
                 | compact ref state   |
                 +----------+----------+
                            |
             +--------------+--------------+
             |              |              |
          worker A       worker B      BranchManager
             |              |              |
          execute         execute         organize
          descend         descend         topology
          expose          expose          priority
          surplus         surplus         convergence
             |              |              |
             +---------- shared TT --------+

global queue:
    (qIndex, qGeneration)
    ...
```

The queue is ordering/visibility machinery only. Replay is execution reconstruction data only. Neither is semantic authority.

## Shared q record

The first corrected realization uses fixed/prepared shared numeric storage. One q slot owns these logical fields:

| field | meaning |
|---|---|
| `generation` | slot lifetime identity; every reuse advances it |
| `live` | whether the generation is a currently addressable q |
| `hash` | locator only; never equality |
| `canonicalSupport` | mirror-canonical packed support |
| `identityFlags` | exact terminal/sentinel distinctions not expressible by residual words |
| `p0Words[20]` | exact canonical P0 residual content |
| `p1Words[20]` | exact canonical P1 residual content |
| `exactCode` | UNKNOWN or exact LOSS/DRAW/WIN |
| `execution` | NONE, QUEUED, or RUNNING(worker) in one atomic owner word |
| `priorityClass` | coarse globally maintained scheduling class |
| `priorityDepth` | explicit depth/cost metadata, not an opaque combined score |
| `fanIn` | compact dependency leverage metadata |
| `refCount` | live topology/root/execution references required for safe reuse |
| `replayLength` | length of the retained physical reconstruction seed |
| `replay[42]` | one portable legal-move seed for this q generation |
| `parentHead` | manager-owned incoming dependency adjacency |
| `childMask` / child refs | manager-owned fixed-seven-action outgoing topology when established |

Storage may be struct-of-arrays physically. The table record remains the one logical owner.

The exact equality relation is:

```text
canonicalSupport equal
AND identityFlags equal
AND all 20 P0 uint32 words equal
AND all 20 P1 uint32 words equal
```

Hash equality is insufficient.

Worker-local `ResidualPool` class/chunk IDs never enter shared equality.

### Canonicalization boundary

Portable q construction happens only at the E2 branch/claim boundary. The worker:

1. compares physical support with reflected support;
2. if support differs, chooses the lower packed support orientation;
3. if support is reflection-symmetric, compares exact residual content through the worker's qualified residual-pool ordering to choose the same q_r orbit orientation as `gameplayKey()`;
4. writes the chosen residual classes into reusable 20-word P0/P1 scratch;
5. probes/inserts the shared TT by exact full content.

Ordinary E0 recursion does not construct portable q.

### Replay seed

The q retains one physical legal replay seed sufficient to reconstruct a representative in another worker's private `ResidualPool`.

Replay is not equality, not canonical identity, and not a second q representation. A later equal physical occurrence may have a different replay and still resolve to the same q.

## Shared insertion state machine

The shared hash table is bounded and prepared before execution. Buckets are fine-grained numeric synchronization domains; normal execution never resizes or rehashes.

```text
portable canonical q
    |
    v
hash -> bucket
    |
    +-- lock bucket
    |
    +-- scan bucket chain
    |      |
    |      +-- generation/live/hash/support/flags/full-40-word match
    |      |       -> acquire q reference
    |      |       -> unlock
    |      |       -> return (qIndex, qGeneration)
    |      |
    |      +-- no exact match
    |              -> acquire prepared free/new slot
    |              -> initialize next generation completely
    |              -> link into bucket
    |              -> publish live
    |              -> unlock
    |              -> return (qIndex, qGeneration)
```

A slot is reusable only after BranchManager establishes that its real shared references are gone and execution is NONE. Recycling unlinks the old generation under the same bucket synchronization, advances the generation, clears owned topology/execution state, and returns the slot to the prepared free structure.

Capacity exhaustion fails closed. It is not repaired by hot resize, manager-private translation, hash-only fallback, or hidden capacity inflation.

## Execution state machine

Execution ownership is a field of q itself:

```text
                 BranchManager queue admission
NONE ------------------------------------------------> QUEUED
 ^                                                       |
 |                                                       | worker CAS
 |                                                       v
 +---------------- exact/retire/release ------------- RUNNING(worker)
```

A queue ticket is only:

```text
(qIndex, qGeneration)
```

Claim procedure:

1. dequeue highest available priority-class reference;
2. reject it if q generation/live state no longer matches;
3. atomically transition q execution `QUEUED -> RUNNING(workerId)`;
4. if the CAS fails, discard the stale ticket and continue polling;
5. execute directly from the q's replay seed.

No second work-slot lifecycle exists.

If local retained descent reaches a q already RUNNING elsewhere, that convergence is already represented by the shared q. The worker does not synchronously ask BranchManager what to do. BranchManager asynchronously selects the useful execution and increments the redundant worker's reset token. The redundant worker observes it at the existing amortized control boundary, unwinds, releases only execution references it actually owns, and returns to global polling.

Exact publication uses a single exact q value. Conflicting exact publication is a fatal correctness error. Retirement/reset never fabricates W/D/L.

## Genuine branch publication

Deterministic/forced/outdegree-one structure remains private native recursion.

At a genuine branch a worker uses fixed per-ply numeric scratch to:

1. enumerate/rank legal children;
2. derive/probe/insert each child q in the shared TT;
3. retain the highest-eval locally ordered child as the current continuation;
4. publish **one** fixed branch descriptor containing parent q ref, retained child ref, surplus child refs, actions/evaluation classes, worker/run identity and generations;
5. continue retained descent immediately.

The descriptor is a topology notification. It is not another q lifecycle owner.

BranchManager consumes descriptors and writes/merges the canonical dependency topology on the same q records. It may enqueue live surplus q references by changing that q's own execution state to QUEUED and pushing only its generation-safe reference.

No `PUB_CHILD x N + PUB_FRONTIER_END`, occurrence pool, manager replay canonicalization, or q-to-work rematerialization survives in the active design.

## Topology and exact propagation

Connect Four has at most seven legal actions, so established outgoing topology is stored directly by action/ref on the q record. Incoming parent relationships use a bounded numeric adjacency arena owned by BranchManager because those records represent relationships, not executable work.

Workers publish compact exact-q completion references to BranchManager. BranchManager follows incoming adjacency directly; it does not scan the q table to find affected parents.

For each parent:

- maximizing side closes to WIN as soon as a WIN child is exact;
- minimizing side closes to LOSS as soon as a LOSS child is exact;
- otherwise the parent closes after all still-relevant children are exact;
- exact parent closure recursively propagates through the same adjacency relation.

Root witness bookkeeping keeps physical-root action transport separate from canonical q equality. Completion order must not change the existing deterministic root action semantics.

## Worker loop

A persistent worker:

```text
poll global q-reference queues
    -> claim QUEUED q atomically
    -> reconstruct/reuse private IsometricState
    -> native deterministic descent
    -> genuine branch:
         probe/insert child q records
         publish one branch descriptor
         keep best child local
    -> publish exact q completions
    -> observe reset/abort at amortized control boundary
    -> return directly to global polling
```

Workers do not:

- assign work to peers;
- inspect peer-idle state to decide whether semantic work exists;
- wait for BranchManager approval;
- construct manager-private q identity;
- perform queue scans from E0;
- build portable q on ordinary recursive nodes.

## BranchManager loop

BranchManager runs independently and owns organization, not gameplay descent:

- consume branch descriptors and exact-completion notifications;
- attach/merge canonical dependency topology;
- maintain explicit priority metadata;
- enqueue generation-safe q refs;
- converge duplicate READY/RUNNING q;
- request asynchronous redundant-worker reset;
- propagate exact values;
- maintain root closure/witness state;
- apply real ref/lifetime consequences;
- recycle q only when the shared record's lifecycle permits it.

It does not manufacture children, replay q to discover identity, assign workers, synchronously gate worker recursion, or own a second q table.

## Initial priority representation

Priority remains explicit and inspectable rather than one opaque formula.

The first implementation stores separate fields for:

- child evaluation/closure class;
- depth/cost class;
- canonical fan-in/dependency leverage.

Queue admission consumes a small fixed set of coarse priority classes. BranchManager may improve a q's class as topology becomes known by publishing a fresh generation-safe queue reference; stale lower-priority tickets fail the q execution-state check.

Priority tuning is an economics question after exact lifecycle qualification.

## NEES boundary

E0/E1 remains the qualified native solver:

- `IsometricState.applyUnchecked/undo`;
- private `ResidualPool`;
- native frontier handling;
- local exact transition cache;
- no shared-q construction in ordinary recursion.

E2 includes:

- branch-only portable-q derivation;
- shared-TT probe/insert;
- fixed branch descriptor publication;
- q-reference queue claim;
- exact completion notification;
- amortized reset/abort observation;
- BranchManager reconciliation at branch/completion cadence.

E2 uses prepared numeric storage, direct indices, bounded atomics and numeric diagnostics only. No strings, Map/Set, Promises, structured clone, per-frontier object graphs, ordinary-path resize/rehash, or synchronous cross-thread coordination.

Draft 0.4 final qualification is intentionally deferred until this coherent worker/shared-TT/BranchManager replacement is complete.

## Removed active machinery

The replacement must delete active compatibility for:

- occurrence pools and occurrence leaders;
- helper-work slots independent of q;
- manager-private q dictionaries;
- manager replay canonicalization;
- q/work rematerialization;
- demand-token publication policy;
- `PUB_CHILD x N + PUB_FRONTIER_END`;
- old split-task continuation packaging;
- orphan resurrection / exact-orphan eviction;
- append-only edge-compaction and tombstone/rebuild machinery inherited from the failed private-manager model.

Historical commits and the Draft 0.3 audit preserve evidence.

## Qualification order after structural completion

1. targeted shared-q exact identity / generation / claim / propagation lifecycle;
2. Linux + Windows retained-pull exactness;
3. historical hard-root control;
4. full repository verify;
5. completed-solve economics at 1/2/4 workers;
6. NEES Draft 0.4 qualification of the complete worker + shared-TT + BranchManager E2 optimization unit.

Capacity increases are not an admissible substitute for a lifecycle or contention defect.
