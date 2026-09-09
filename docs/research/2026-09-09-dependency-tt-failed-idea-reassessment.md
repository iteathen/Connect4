# Dependency TT failed-idea reassessment

**Date:** 2026-09-09  
**Status:** research/evidence correction; not maintained solver authority

## Purpose

Several dependency-TT experiments were initially classified too broadly as failures. This note re-evaluates them against the architecture they were actually intended to test.

The key distinction is:

> A negative benchmark is evidence against an idea only if the prototype preserved that idea's required ownership, lifetime, routing, and resource boundaries.

The earlier prototypes often did not.

## Baseline facts that remain valid

The successful flat shared-TT experiment remains the comparison baseline:

- one fixed preallocated `SharedArrayBuffer` TT;
- shared across workers;
- canonical two-word key validation;
- exact-result agreement;
- cross-worker TT hits directly observed;
- workload-dependent TT-capacity knee.

The dependency cleanup direction also remains:

- canonical logical dependency ownership;
- proof-only cleanup;
- whole physical chunk/slab recycling;
- chunk-map forwarding for duplicate logical ownership;
- no path-owned TT state;
- no cleanup policy inside negamax;
- stale holders may finish their coarse task before a retiring descriptor is recycled.

## Mistake 1: dependency routing was performed inside recursive negamax

The first `shareddep` prototypes changed dependency identity whenever a tracked irreversible cell became occupied. Inside the move loop they effectively performed:

```text
move changes dependency signature
    -> resolve/allocate logical family
    -> change physical TT region
    -> recurse
```

This was not the intended coarse-task design.

For `41267575`, the old prototypes recorded hundreds of thousands to millions of dependency transitions even though the bottom-row projection contained only a handful of logical families. The repeated map/allocator traffic was therefore procedural routing work, not evidence that canonical dependency ownership itself was expensive.

### Correct boundary

A coarse task should do:

```text
task root
    -> canonical logical dependency ID
    -> resolve chunkMap once
    -> fixed physical descriptor/base for the task
    -> ordinary serial negamax to task completion
```

If a new dependency refinement is important enough to own different TT storage, it must become a **new coarse task boundary**, not an invisible routing event inside negamax.

## Mistake 2: direct hierarchical splitting violated the grace-period rule

The old hierarchical prototype immediately shrank a parent's live physical region and assigned the old upper half to a child.

That happened while workers could still hold the parent's old full-span base/mask.

Thus stale parent workers and new child workers could use overlapping physical storage concurrently. Full-key validation protected exact correctness from false hits, but the physical ownership/lifetime model was wrong and caused destructive cache pollution.

### Correct split lifecycle

A parent region may be split only when the physical ownership change is safe:

1. decide at a coarse/pass boundary that a child merits dedicated capacity;
2. wait until the parent descriptor has no stale coarse holders, or defer the split;
3. shrink the parent descriptor;
4. assign the released physical half to the child;
5. update logical chunk-map ownership for **future** tasks;
6. never require a running worker to follow the change.

A useful power-of-two property is that shrinking a region from `2N` to its lower `N` preserves entries whose old hash already landed in the lower half. The upper half can become the child without copying. Other entries become safe misses.

## Mistake 3: 32K slab size was confused with logical-family capacity

The locality sweep found about 32K entries to be a strong **physical slab / cache-local working unit**.

That does **not** imply every logical dependency family should be capped at one 32K table.

The old one-chunk-per-family result demonstrates the distinction:

- `663152175` had zero bottom-row dependency transitions;
- the prototype allocated only one 32K family chunk despite a 256K total arena;
- the remaining physical capacity sat unused.

That benchmark was effectively a 32K-TT benchmark, not a fair dependency-family benchmark.

The corrected model is:

```text
logical dependency node
    -> chunk-map descriptor
    -> one or more 32K physical slabs
```

The descriptor's active capacity is dynamic and workload-dependent.

## Mistake 4: 'dynamic' region sizing was actually static dependency-depth guessing

The `flat-region-v2` prototype reduced region size according to how many bottom cells had become fixed. It did not assign capacity from measured search work.

On a coarse-task profile of `41267575`, the three bottom-row families were highly unequal:

- family `336394`: about 72% of task-node work in the representative profile;
- family `336522`: about 27%;
- family `336458`: about 0.2%.

Yet the old policy could give the tiny family the same 128K allocation as the heavy child.

This is evidence against fixed depth-based sizing, not against multi-slab family regions.

## Corrected coarse-task retest

A new dirty prototype moved dependency resolution completely out of negamax. The YBWC coordinator/dispatcher assigns a fixed region to each worker task. The worker uses that region unchanged until the task returns.

For `663152175`, the task-root bottom-row projection is one logical family. Giving that family the whole 256K table produced essentially the same search class as the flat table, confirming that the dependency identity itself is not costly when resolved at the correct boundary.

For `41267575`, a deliberately simple first-level split maps the heavy child to one half and the root/tiny sibling to the other half.

### Capacity matters

With too little total capacity, the split is bad:

| total TT | flat median | split median | result |
| ---: | ---: | ---: | --- |
| 256K | ~1.401 s / 14.49M nodes | ~1.550 s / 17.86M | split under-capacity |
| 512K | ~1.149 s / 10.89M | ~1.291 s / 13.64M | flat still better |

At larger total capacity, the locality benefit becomes visible:

| total TT | flat median | split median | observation |
| ---: | ---: | ---: | --- |
| 1M | ~1.161 s / 9.16M | ~1.117 s / 10.72M | split searches more but is competitive/faster in this batch |
| 1M, reversed order | ~1.120 s / 9.11M | ~1.115 s / 10.80M | essentially tied; not a mode-order artifact |
| 2M | ~1.348 s / 8.54M | ~1.232 s / 9.70M | split beats oversized flat table |

These timings are sandbox research values, not qualification numbers. The important result is structural: **dependency partitioning can recover locality strongly enough to offset additional search work when each active family receives sufficient capacity.**

### Deterministic single-worker locality check

With one worker and 1M total TT:

- flat: exactly **5,155,878 nodes**, median about **1.454 s**;
- coarse split: exactly **6,398,912 nodes**, median about **1.282 s** in the controlled batch.

The split performs about 24% more search work yet completes faster in that batch, showing that locality—not parallel race behavior—can dominate elapsed time.

However, flat 512K remained faster than the 1M split in the corresponding single-worker test. Therefore **the selector must choose both total active capacity and whether/where to split**. More memory or more hierarchy is not automatically better.

## Pass-boundary split retest

A further prototype begins with one broad physical table, drains the first mandatory null-window pass, then performs the parent/child split only at the drained boundary.

At 1M total / 4 workers it remained in the same performance class as the pre-split layout (~1.1 s class in the tested batch) and returned the same exact score.

This is the first test resembling the intended quiescent physical split. It does not yet implement the full dynamic selector, but it shows that a parent can be repartitioned without per-node redirect chasing or live physical overlap.

## Genuine negative: blind deep 32K fragmentation

The nested idea was also retested at the correct coarse boundary using a two-row canonical dependency identity.

The task roots do form a useful hierarchy:

- `663152175`: 11 two-row child identities; top 5 account for about **96.7%** of task-node work;
- `41267575`: 47 child identities; top 13 account for about **95%** of task-node work.

But assigning one 32K logical table to each hot child is still too aggressive:

- `663152175`, 256K total: nested-32 ~**1.94M nodes / 191 ms** vs flat ~**1.18M / 147 ms**;
- `41267575`, 512K total: nested-32 ~**25.0M / 1.89 s** vs flat ~**10.9M / 1.11 s**.

This is now a fairer negative result.

The conclusion is **not** that nested dependency identity is bad. It is that 32K should remain an allocation granule/locality unit, while hot logical children may need multiple slabs and tiny children should alias/fallback rather than receive dedicated capacity.

## Revised architecture

The current strongest model is:

```text
canonical task-root state
        |
        v
logical dependency tree/lattice
        |
        v
stable logical chunk ID
        |
        v
chunkMap[logical ID]
        |
        v
physical descriptor
        |
        +-- base / slab set
        +-- active capacity
        +-- lifecycle state
        +-- coarse write lease (candidate)
        |
        v
fixed preallocated SAB arena
```

### Rules

1. **Dependency topology is logical, not physical.**
2. **Workers resolve placement once per coarse task.** They never chase redirects inside negamax.
3. **32K is a physical slab candidate, not a universal logical-family capacity.**
4. **Descriptors may span multiple slabs.** Capacity is assigned from measured workload/resource pressure.
5. **Nested refinement is selective.** A logical child is promoted to dedicated storage only when measured work justifies it; tiny children may remain mapped to a parent/fallback descriptor.
6. **Physical splitting/reassignment requires a coarse grace/quiescent boundary.** No live parent/child overlap caused by stale masks.
7. **Duplicate physical chunks are forwarded through the chunk map.** Future tasks resolve directly to the survivor; stale holders finish the loser; loser becomes free only after drain.
8. **Cleanup is proof-only.** An ownership contradiction may retire a dependency subtree/chunk; false retention is acceptable, false reclaim is not.
9. **No redirect chains.** Logical IDs map directly to current physical survivors.
10. **Total active TT capacity, descriptor capacity, worker count, split permission/depth, and speculative width are all resource-selector variables.**

## What remains genuinely unproven

The corrected architecture still needs a full integrated test with:

- worker-side chunk-map resolution once at task start;
- dynamic descriptor sizing from previous mandatory proof-pass work;
- selective nested child promotion;
- safe parent shrink/split only after coarse holders drain;
- duplicate forwarding/dedupe;
- proof-only reclamation;
- global cross-worker sharing inside each surviving descriptor;
- no dependency routing inside negamax.

The previous failed prototypes should not be used as evidence against that design.