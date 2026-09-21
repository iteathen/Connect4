# IsoMax corrected surplus-opportunity NEES 0.3 audit

**Status:** qualification audit for corrected issue #102 candidate  
**Candidate branch:** `work/isomax-surplus-pull-102-corrected`  
**NEES authority:** `iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c` — Draft 0.3  
**Runtime profile:** Node 26.7.0 / V8 14.6 family  
**Semantic authority effect:** none

## Scope

This document is the Draft 0.3 affected-causal-neighborhood audit required because corrected #102 moves real work into E2 branch-publication / global-claim / canonical-reconciliation cadence.

The inherited ordinary-worker baseline remains:

`components/isometric/NEES_BASELINE_0_3.md`

This audit covers only the new/reclassified execution structure.

## Corrected execution boundary

The candidate does **not** make every decision frontier a global execution boundary.

At a genuine branch:

```text
current worker
    continues one locally ordered child in-place
    +
    publishes only enough surplus sibling opportunities
    to satisfy currently spare execution capacity
```

An available worker may claim a surplus opportunity. If no helper claims it, the current worker later reclaims the opportunity and evaluates the sibling directly from its live parent state.

Canonical q_r is reconciliation identity. It is not execution identity.

## E0/E1 unchanged core

The ordinary `IsoMaxSolver.solveNode` recursive kernel remains the E0 semantic owner.

The branch distributor is entered only after:

- exact/cache closure;
- native exact/forced closure;
- certificate/RBA exclusions for the worker profile;
- no-win bound closure;
- ordinary move-order derivation.

Forced and outdegree-one native paths remain local and bypass branch publication.

The existing native apply/undo, residual transitions, q cache and move-order operations remain governed by the inherited E0/E1 baseline.

## New E2 machine-cost inventory

| Mechanism | Current realization | Disposition before performance qualification |
|---|---|---|
| branch distributor call | one branch-only indirect call at unresolved ordinary branch | REQUIRED for candidate; cost must be measured against saved duplicate work |
| child-order staging | preallocated per-worker numeric arrays indexed by ply | REQUIRED/TRadeoff; no per-branch array allocation |
| current continuation | native recursive call on first locally ordered child | REQUIRED corrected semantic model; REMOVES prior global rematerialization; canonical visibility is emitted when explicit external demand makes cross-worker reconciliation actionable |
| external-demand gate | per-worker shared idle-demand slots; producers consume idle tokens with CAS before publication | REQUIRED cost control; one-worker bypasses occurrence publication entirely; a reservation is demand, never worker assignment; any worker may claim the resulting global work |
| unpublished local sibling | native apply/solve/undo from the live parent | REQUIRED when no external execution demand; never replayed or reconciled globally |
| surplus occurrence write | fixed shared numeric fields + legal path bytes | TRADEOFF; only demand-admitted surplus plus multi-worker continuation visibility pays this cost; full replay bytes remain machine-cost debt |
| occurrence allocation | generation-safe bounded free ring, no growth | CONFORMS M13/M14; live-domain default is >3x the physical 42×7×workers occurrence bound; contention remains measurable |
| occurrence publication | bounded numeric MPMC publication ring with scalar reserve/write/commit operations | REQUIRED current cross-thread visibility contract; per-publication callback allocation was REMOVED; Atomics/cache-line traffic remains UNVERIFIED-DEBT |
| continuation visibility | occurrence record only, not READY execution | REQUIRED for canonical convergence without surrendering local recursion |
| global work claim | fixed priority-band ring + READY->RUNNING CAS + post-CAS generation/ticket revalidation | REQUIRED worker-pull mechanism; stale queue records cannot claim a recycled generation |
| helper work slots | generation-safe bounded reusable arena sized to O(workers), not q capacity | CONFORMS bounded-lifetime requirement; terminal slots recycle only after reconciliation; queue stale records fail generation |
| helper replay | reusable native worker state with common-prefix undo/apply | TRADEOFF only for remotely stolen surplus; remote exact completion is inserted into the consuming worker's normal exact cache to prevent later local recomputation |
| local surplus reclaim | same parent native state, no path replay; RUNNING helper gets a short grace then local continuation wins | REMOVED prior rematerialization cost for un-stolen surplus and prevents helper execution from indefinitely stalling the owner |
| canonical q derive | reconciler reusable native state + exact q triple | REQUIRED exact convergence; manager replay work is material E2 cost |
| q dictionary | preallocated typed arrays, exact hash locator + full triple equality | REQUIRED; hash-only equality forbidden |
| q lifetime | live-demand recycle + exact inactive cache eviction under pressure | CONFORMS bounded visibility; linear exact-eviction search is UNVERIFIED-DEBT |
| q hash deletion | tombstone + in-place rebuild | TRADEOFF; rebuild frequency/cost must remain visible |
| occurrence adjacency | typed head/next arrays | REQUIRED current exact broadcast/demand tracking |
| continuation leader | canonical q -> one running continuation occurrence | REQUIRED duplicate-running reconciliation |
| duplicate continuation | follower references leader; exact broadcast interrupts at control boundary | REQUIRED correctness/duplicate suppression; convergence latency measured |
| helper cancellation | shared needed=0, worker observes at scheduled control | TRADEOFF 512-node amortization inherited; retirement waste measured |
| continuation exact interrupt | active continuation occurrence scan at 512-node control boundary | REQUIRED candidate duplicate suppression; scan depth <= physical recursion depth, still E2 debt |
| priority | coarse numeric bands from order rank and q demand/fan-in proxy | CANDIDATE policy; no opaque scalar |
| refillExecution | scan live q high-water to admit up to workerCount helpers | UNVERIFIED-DEBT; O(q-high-water) reconciliation scan is not accepted as intrinsically cheap |
| worker idle sleep | wake epoch sampled before queue check | REQUIRED lost-wakeup correctness; timeout/wakeup latency measured |
| worker death recovery | invalidate running attempt and requeue portable helper work | REQUIRED fail-closed lifecycle |
| timeout/abort delivery | one immediately-handled session failure promise | REQUIRED host lifecycle; outside branch cadence |
| shared arena defaults | work O(workers), occurrences O(42×7×workers) with explicit headroom; q cache independent/recyclable | REMOVED prior append-only/q-capacity-sized shared-memory over-allocation |
| result reporting | cold host objects/process memory snapshot after solve | E3/COLD, not precedent for E2 |

## Removed work versus rejected over-externalized variant

The corrected design structurally removes several costs that dominated the rejected PR #109 experiment:

- no mandatory worker surrender at every branch;
- no canonical execution materialization for the continued primary child;
- no physical replay to continue the current line;
- no manager max/min dependency DAG;
- no global execution record for every visible successor;
- no waiting for a scheduler decision before primary recursion continues.

Only surplus work backed by an explicitly idle worker crosses the execution boundary. With one worker, branch distribution collapses to native recursive DFS; no branch occurrence enters the shared reconciler. When every worker is busy, descendants remain native/local until a worker advertises demand again.

## Known optimization debt

Before promotion, retain these as explicit debt even if timing is favorable:

### E2-DS-01 — full legal replay bytes per surplus occurrence

Current portable identity/execution seed is a complete legal replay.

Candidate successor:

- parent-replay reference + compact suffix;
- portable exact physical-state carrier;
- or another qualified representation.

Do not introduce worker-local residual/class IDs as portable identity.

### E2-DS-02 — reconciler replay to derive q

Every newly visible occurrence may require manager-side physical replay into a reusable native state.

Measure:

- replay applies/undos;
- q reuse obtained;
- duplicate work avoided.

Do not call q convergence free.

### E2-DS-03 — refillExecution q scan

The reconciler currently scans q indices when helper capacity becomes available.

If manager CPU/reconciliation lag is material, lower this to an incrementally maintained priority-ready index rather than accepting O(q-high-water) scanning.

### Resolved during candidate qualification — per-operation ring callbacks

The initial shared ring helper accepted JS callbacks for payload read/write at every enqueue/dequeue.

That realization has been removed. E2 rings now use scalar reserve -> direct numeric payload access -> commit/release operations, so branch-frequency queue/publication traffic does not construct callback closures.

### E2-DS-04 — shared-ring contention / false sharing

Typed/shared storage is not automatically fast.

Measure:

- queue publications/claims;
- stale tickets;
- Atomics;
- worker idle with surplus READY;
- reconciliation lag.

Layout may need padding/partitioning if cache-line contention is visible.

### E2-DS-05 — 512-node duplicate retirement latency

A locally running continuation checks canonical exact/retirement state only at the existing amortized control boundary.

This preserves E0 simplicity but may waste up to one control interval of duplicate work.

A separate owner-side liveness rule now prevents a stolen RUNNING helper from becoming an unbounded wait: after a short grace, the owner resumes that child as a local continuation and reconciliation retires the redundant helper. This is forward-progress policy, not a replacement for future quantum tuning.

#94 owns future quantum/yield tuning if measurements justify it.

### E2-DS-06 — exact-q cache retention/eviction

Inactive exact q values are retained until q capacity pressure, then safely evicted.

This is semantically safe because eviction causes only recomputation.

The correct retention policy remains workload-dependent.

## Maximal-effort stopping rule

The corrected candidate may be promoted only if:

1. exactness/lifecycle qualification passes;
2. completed-solve economics justify the new E2 machinery relative to the retained central scheduler;
3. known affected-scope costs above have honest dispositions;
4. no known avoidable E0/E1 regression is hidden by multicore wall time;
5. any remaining debt is explicit rather than described as free.

A neutral wall-time result may still qualify if materially lower useful work/resource cost justifies the tradeoff, per repository-owner criterion.

A utilization increase alone does not qualify.

## Required evidence

Report separately at 1/2/4 workers:

- completed root wall time;
- result-ready time and cleanup time;
- serial/central calls, expansion entries and transition attempts;
- local primary branches;
- surplus opportunities published;
- idle-demand reservations;
- unpublished local siblings;
- surplus local reclaim versus remote helper execution;
- helper waits;
- exact occurrence consumption;
- q reuse/reclaim;
- active q high-water and q index high-water;
- helper work creations/reclaims;
- manager replay apply/undo;
- worker helper replay apply count;
- duplicate running continuations;
- exact broadcasts;
- retirement waste in abandoned recursive nodes;
- priority claims by band;
- RSS plus fixed shared-storage capacity and retained worker state counts;
- timeouts/failures without fabricated WDL.

### Qualification counter semantics

For this candidate, `surplusRemote` counts actual non-root canonical helper claims. It does not count
mere observation or waiting on another continuation. `helperWaits` records those waits separately,
and `occurrenceExactConsumed` records exact canonical values consumed by native recursion.

`retirementWasteNodes` counts recursive nodes whose result is abandoned because a continuation is
resolved/superseded or a claimed execution reservation is retired/stopped. Nested continuation
interruptions subtract already-accounted waste so the same recursive nodes are not counted twice.
Replay work is reported separately: `pathReplayApplies` is total claim replay and
`helperReplayApplies` is the non-root helper subset. No per-node reporting/RPC is introduced.

Historical hard roots and late roots are both required before promotion.
