# IsoMax corrected surplus-opportunity work distribution

**Status:** implementation candidate for issue #102  
**Implementation branch:** `work/isomax-surplus-pull-102-corrected`  
**Semantic correction authority:** `research/isograph/optimization/ISOMAX_DECENTRALIZED_PULL_102_INTERPRETATION_CORRECTION_0_1.md`  
**NEES:** Draft 0.3 at `iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c`  
**Gameplay authority effect:** none

## Governing distinction

A **branch point is an opportunity-publication event, not an execution boundary**.

For ordered legal successors:

```text
A B C D

current worker:
    continue A in the existing native recursive stack

global visibility:
    publish B C D as surplus branch opportunities

spare workers:
    pull globally prioritized surplus work
```

The current worker does not stop merely because the position branches.

## Identity domains

Keep distinct:

```text
physical occurrence
canonical q_r
running continuation occurrence
surplus branch opportunity
canonical helper work
worker execution reservation
proof identity
```

Canonical q_r is used to reconcile equivalent work. It does not itself create an execution boundary.

Worker-local residual/chunk/class IDs remain non-portable.

## Current continuation

Every locally executing child is represented by a **continuation occurrence**.

Publishing a continuation:

- exposes its exact physical replay to canonical reconciliation;
- does not enqueue it;
- does not reconstruct it;
- does not transfer execution ownership;
- does not interrupt its native recursive stack.

If another equivalent continuation or helper completes the canonical q first, the current worker may consume that exact result at the existing amortized control checkpoint and unwind only to the branch frame owning that continuation.

Thus:

```text
locality is preserved
+
convergence remains globally visible
```

## Surplus opportunity

All non-primary legal alternatives at a genuine branch are published as surplus occurrences before the primary continuation is entered.

A surplus occurrence is globally visible immediately but is **not necessarily executable**.

This implements the required separation:

```text
visibility > execution
```

## Backpressure / execution admission

The canonical reconciler may materialize helper work only while:

```text
active canonical work < worker count
```

The currently claimed top-level subtree counts against that capacity.

Therefore:

- one worker: no helper work is created while the root continuation is active;
- two workers: at most one additional canonical helper subtree is admitted;
- N workers: at most N canonical execution roots are READY/RUNNING/owned at once.

Unadmitted surplus remains visible as canonical demand.

This is the corrected meaning of backpressure: workers do not invent local backpressure policies and global visibility need not be truncated merely because CPU is occupied.

## Local reclaim

When the original worker later reaches a surplus sibling:

1. if canonical q is exact, consume it;
2. if an equivalent running continuation/helper owns the q, wait for exact value;
3. if spare worker work is READY, allow a short claim opportunity for that helper;
4. if no helper execution is admitted/claimed, continue the sibling directly from the live parent state.

Local continuation of an unadmitted surplus does not replay the root and does not create a new work task.

When local evaluation starts, that occurrence is promoted to a running continuation occurrence so convergence remains visible.

## Helper work

A spare worker:

1. atomically claims the highest-priority READY canonical surplus q;
2. reconstructs that q's portable physical replay into its persistent native state using common-prefix undo/apply;
3. performs ordinary native recursive IsoMax;
4. at branch points, keeps its own primary continuation local and publishes its own surplus;
5. publishes exact WDL for its claimed canonical q.

It does not become a scheduler owner.

## Priority

Initial priority is intentionally simple and explicit:

- earlier local move-order rank raises priority;
- multiple canonical demands raise priority.

Priority is a global surplus-work policy. It does not select the current worker's primary child; local IsoMax ordering does that.

Dependency leverage, richer width/support terms, and affinity remain tunable candidates after the complete corrected lifecycle qualifies.

## Affinity

The corrected first slice does not require affinity to establish semantics.

Any later affinity must remain a marginal execution-cost hint only:

- no ownership;
- no waiting for a preferred worker;
- no bypass of higher-priority global work.

## Deterministic structure

Exact native forced structure and ordinary legal outdegree one remain local and publish no scheduling opportunity.

Only two-or-more-child ordinary decisions reach the distribution hook.

## Canonical reconciliation

The reconciler:

- derives q_r from occurrence replay;
- verifies exact p0/p1/support equality;
- merges equivalent occurrences;
- records running continuation leaders;
- broadcasts exact WDL to all live occurrences;
- suppresses/removes helper work when a native continuation already covers the same q;
- admits canonical helper work only for spare worker capacity;
- retires READY/RUNNING helper work when demand disappears;
- repairs worker death using portable canonical helper replay.

It does **not** compute the ordinary parent max/min DAG. Parent reduction remains inside the native worker recursion.

This is intentionally different from the rejected frontier-per-work-item experiment.

## Exact-value flow

For locally solved continuation/surplus:

```text
native recursive child value
    ->
occurrence exact publication
    ->
canonical q exact
    ->
broadcast to equivalent occurrences
```

For helper work:

```text
canonical helper work exact
    ->
canonical q exact
    ->
broadcast
```

Only exact WDL in `{-1,0,+1}` is published.

Retirement/failure is never an exact value.

## Root semantics

The externally claimed root remains one ordinary IsoMax recursive subtree.

Root move selection continues through the existing exact `selectMoveForValue` semantics and reflection/action transport.

Parallel completion order must not change the selected root action.

## Failure/liveness

Generation, ticket and attempt identity protect helper work.

Worker death:

- invalidates the dead helper attempt;
- requeues demanded helper work;
- retires stale occurrences whose parent attempt no longer exists.

A local continuation is represented by an occurrence tied to its parent top-level work attempt; death/retirement invalidates that visibility record without creating an exact value.

## Required controls

Before performance promotion:

1. serial exact WDL/root-action differential;
2. one-worker local-continuation proof:
   - genuine branches published;
   - one top-level work claim;
   - no remote surplus/helper waits;
   - only external-root replay;
   - executable population <= 1;
3. two/four-worker helper stealing:
   - surplus opportunities claimed by otherwise available workers;
   - local primary recursion remains active;
   - executable population <= worker count;
4. q_r convergence / reflection action controls;
5. continuation duplicate exact interruption;
6. helper death/requeue;
7. timeout/abort/capacity fail closed;
8. completed-solve 1/2/4 comparison against central control;
9. historical hard-root comparison;
10. NEES E2 cost audit.

## Non-claims

This candidate does not claim:

- every internal native node is globally scheduled;
- every visible q receives a helper work slot;
- a running continuation is worker-owned semantic truth;
- q_r is proof identity;
- current priority is optimal;
- worker pull is faster before completed-solve qualification;
- the rejected frontier-per-work-item result applies to this corrected design.
