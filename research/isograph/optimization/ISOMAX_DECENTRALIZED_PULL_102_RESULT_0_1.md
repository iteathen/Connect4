# IsoMax decentralized worker-pull experiment #102 — final result

**Date:** 2026-09-20  
**Canonical research owner:** `research/semantic-quotient`  
**Implementation experiment:** `work/isomax-decentralized-pull-102`  
**Latest experiment head reviewed:** `fe52e56c6561b394c92b1071323a60ba35478bb4`  
**Last all-green architecture/economics head:** `9639a52ff1d3bf8f9c8468cd1b1c985035769c7b`  
**NEES authority:** Draft 0.3 at `iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c`  
**Gameplay authority effect:** none

## Disposition

**REJECT FOR PROMOTION in the current Node 26 / V8 14.6 IsoMax profile.**

The complete decentralized worker-pull architecture was implemented as a bounded vertical slice and qualified deeply enough to answer the architectural question.

It is not promoted over the retained central scheduler because:

1. completed late-root economics are materially worse in wall time and memory;
2. the historical hard roots fail to complete within the unchanged 20-second per-root bound at 1, 2 and 4 workers;
3. a later qualification rerun exposed nondeterministic liveness loss on a late root (`unresolved IsoMax pull root has no executable work`);
4. the main cost is architectural execution granularity/replay/reconciliation, not merely one badly chosen priority scalar.

The experiment therefore establishes both useful mechanisms and a strong falsifier for this realization.

This result does **not** imply that global canonical q reconciliation, worker pull, affinity, or dependency-leverage priority are universally bad. It rejects this complete realization in which every genuine decision frontier is externalized into canonical shared scheduling and portable replay work.

## What was actually implemented

This experiment went beyond central admission and implemented the core issue #102 architecture.

### Shared global work machinery

- fixed-width SharedArrayBuffer execution records;
- bounded generation-safe work-slot reuse;
- bounded publication and priority queues;
- READY/RUNNING execution reservation distinct from semantic q identity;
- worker-initiated highest-priority claiming;
- priority tickets that stale out on generation/band changes;
- numeric worker liveness and attempt identity;
- bounded occurrence storage distinct from execution slots.

### Worker behavior

- workers are evaluators, not scheduling-policy owners;
- a claimed dependency reconstructs portable legal replay into worker-local native state;
- exact terminal/forced/outdegree-one structure descends directly;
- genuine decision frontiers publish every successor occurrence;
- discovery lineage confers no retained child ownership;
- after publication, the worker returns to global claiming;
- worker-local residual/class/chunk IDs never become portable identity.

### Canonical reconciler

A separate reconciler worker:

- derives exact q_r from portable replays;
- maintains typed canonical-q and edge arenas;
- keeps physical parent/action occurrence separate from canonical dependency;
- merges q convergence;
- collapses duplicate READY work;
- retires duplicate/obsolete RUNNING work through shared need state;
- propagates exact WDL;
- updates global priority;
- stores one portable replay representative per canonical q only as an execution seed;
- rematerializes bounded execution records from semantic demand.

The host controller does not assign each worker's next task.

### Priority / affinity / admission

The integrated candidate used transparent global bands based on:

- root criticality;
- parent closure leverage (one/two unresolved dependencies);
- parent physical/advisory order;
- canonical q fan-in;
- ordinary READY status.

Worker affinity exists only as a same-or-higher-priority preference. It never creates correctness ownership or waits for a preferred worker.

Execution admission was separately bounded from visibility. Later tuning reduced live execution records and allowed high-priority admission to evict lower-priority READY work.

### Failure/lifecycle handling

The implementation explicitly addressed:

- generation reuse;
- stale queue tickets;
- partial frontier publication;
- terminal-publication slot ownership;
- duplicate READY/RUNNING convergence;
- worker death and attempt invalidation;
- orphan provisional occurrence cleanup;
- abort;
- capacity failure;
- root physical action transport across q_r reflection;
- no exact value from retired/failed/unfinished work.

Several lifecycle defects were found and corrected during qualification. Those defects are important evidence in their own right: the distinction between execution reservation, publication attempt, occurrence and canonical q is load-bearing rather than architectural ceremony.

## Correctness/lifecycle qualification

At `9639a52ff1d3bf8f9c8468cd1b1c985035769c7b`:

- repository `verify` passed;
- native Isometric WSL qualification passed;
- dedicated `isomax-pull-qualification` passed;
- benchmark-evidence and strength-evidence passed;
- late-corpus serial/central/pull exact WDL and root actions agreed.

Dedicated controls covered:

- highest-global-priority claim;
- stale generation/ticket rejection;
- q convergence and duplicate retirement;
- q_r action transport / root witness;
- explicit capacity failure without manufactured WDL;
- active evaluator death and requeue;
- mirror behavior;
- 1/2/4-worker exact decision equivalence on the bounded late corpus.

### Final liveness falsifier

After adding a final execution-admission control only to the benchmark harness, a later run at `fe52e56c6561b394c92b1071323a60ba35478bb4` produced:

```text
pull-1 late root:
unresolved IsoMax pull root has no executable work
```

The same architecture had completed that corpus in earlier runs.

Therefore the current implementation still has a nondeterministic demand/admission/reclamation liveness hole.

This is disqualifying independently of performance.

The attempted tight-admission hard-root run did not execute because the workflow correctly stopped at this earlier liveness failure. No result is claimed for that unrun control.

## Economics — completed late corpus

Dedicated GitHub runner:

- Node v26.7.0
- AMD EPYC 9V74 / 7763 class hosted runners across runs
- three deterministic rank-28 roots
- exact decisions matched on the all-green comparison
- startup/cleanup included

At `9639a52ff1d3bf8f9c8468cd1b1c985035769c7b`:

| Workers | Central wall total | Pull wall total | Pull delta | Central peak RSS | Pull peak RSS |
|---|---:|---:|---:|---:|---:|
| 1 | 301.1 ms | 526.2 ms | +74.8% | 266.3 MiB | 620.1 MiB |
| 2 | 340.8 ms | 655.9 ms | +92.5% | 485.3 MiB | 746.4 MiB |
| 4 | 580.1 ms | 828.0 ms | +42.7% | 487.8 MiB | 816.3 MiB |

Runner variability means these percentages are evidence for this run, not universal speed constants. The direction is unambiguous: the decentralized realization did not qualify on this corpus.

A later run after bounded execution-rematerialization/admission tuning still showed pull slower than central on the successful 2/4-worker late variants and materially higher RSS. The one-worker pull variant then hit the liveness defect above.

## Economics — historical hard roots

Historical roots:

```text
717657616532237625
466537327657277224
616767454664457417
```

At `f7beb80c08274269d2e86c3a79c49e00dcb24de5`, central scheduler completed all roots:

| Profile | Total for 3 roots |
|---|---:|
| serial | 2.203 s |
| central-1 | 2.641 s |
| central-2 | 2.555 s |
| central-4 | 3.932 s |

Every decentralized pull profile hit the unchanged **20-second per-root** timeout for all three roots:

```text
pull-1: 3 / 3 timed out
pull-2: 3 / 3 timed out
pull-4: 3 / 3 timed out
```

No hard-root WDL or move is claimed for the timed-out pull runs.

The benchmark harness originally lacked useful failure snapshots for these timeout cases, so zero-valued pull counters in that failed summary are **missing evidence**, not proof that no work occurred.

## Notable positive findings

### 1. Global q convergence is real and operational

The complete system produced thousands of q reuses and collapsed large numbers of duplicate READY execution occurrences.

Example on one successful pull-4 late root from the early complete comparison:

- canonical q: 1,910;
- q reuses: 2,976;
- duplicate READY collapsed: 1,404;
- duplicate RUNNING retired: 8.

So the earlier premise behind #78/#90/#102 was sound:

> cross-lineage semantic convergence exists and can be recognized early enough to suppress execution reservations.

The problem was not absence of convergence.

### 2. Visibility/execution separation works structurally

Later tuning separated:

- canonical semantic demand;
- occurrence visibility;
- bounded execution records.

The reconciler could retain a much larger dependency graph while admitting only a small bounded set of READY/RUNNING executions.

That is a useful architecture result even though this realization loses overall economics.

### 3. Worker pull can be made semantically independent of discovery lineage

The final design did not centrally assign workers and did not let a discovering worker reserve its children.

Workers genuinely selected from the shared global priority pool.

This validates the semantic feasibility of the intended ownership model.

### 4. Priority actually governed competing work

Most claims occurred in the higher leverage bands rather than the ordinary band.

The priority implementation was not merely metadata attached to immediate dispatch.

### 5. Affinity can remain a cost hint without ownership

The shared pool supports preferred-worker reuse only when it does not bypass a higher global priority.

No wait-for-owner behavior is required.

This is the correct semantic shape for any later affinity experiment.

## Main negative finding: every decision frontier is too fine an execution boundary

The strongest result of the campaign is not "worker pull is slow."

It is more specific:

> externalizing every genuine decision frontier into shared canonical scheduling destroys too much of the efficiency of the existing recursive worker kernel.

The new system gained:

- early q convergence;
- global priority;
- canonical duplicate collapse;
- bounded execution visibility.

But it paid repeatedly for:

- portable replay/rematerialization;
- worker path apply/undo;
- manager/reconciler replay;
- q canonicalization outside the local recursive TT;
- publication/reconciliation;
- execution admission;
- loss of large worker-local recursive cache locality.

On the late corpus, pull workers performed thousands of path replays and transition operations to solve positions requiring very little work in the retained central profile.

On the hard corpus, this granularity failed to finish within a bound where the coarse recursive worker architecture completes in seconds.

This is the primary architectural falsifier.

## Consequence for #78 shared exact reuse

Canonical scheduling does **not** substitute for a shared recursive exact-value mechanism.

The experiment merged task/dependency roots, but most useful exact search still happens beneath those roots.

For harder positions, worker-local recursive TT/cache locality is far more efficient than repeatedly externalizing decision boundaries.

If cross-worker duplicate proof work is revisited, promising directions remain:

- completed exact-entry exchange at coarser boundaries;
- a portable shared recursive exact TT;
- a hybrid in which globally canonical dependencies own **coarse chunks of recursion** rather than one decision frontier each.

This experiment materially strengthens #78 rather than closing it.

## Consequence for issue candidates

### #90 dependency-leverage priority

Reopening was justified. The complete architecture genuinely exercised global priority competition.

The mechanism is semantically valid, but it did not rescue the fine-grained architecture.

Do not generalize this to "dependency leverage has no value"; the architecture-level cost dominates the experiment.

### #91 affinity

Reopening was justified because the old central-scheduler stickiness experiment did not test the right mechanism.

The complete architecture proves the correct form is affinity-as-cost-hint with no waiting/ownership.

No independent economic win for affinity was established.

### #92 support-fiber scheduling

The prior closure remains correctly scoped.

No evidence from this campaign requires support-local ordering or a support-local theorem.

### #93 demand-triggered supply

The prior sparse-fiber result remains scoped to that mechanism/workload.

The new architecture maintained global semantic demand, but its problem was excessive fine-grained externalization rather than lack of supply machinery.

### #94 adaptive quantum

The final result makes this issue more important if a hybrid is attempted.

The decision-frontier itself became the effective quantum and was too fine.

A future hybrid should treat quantum as **how much recursive proof work remains local before returning to global competition**, not merely a node-count polling interval.

### #95 deterministic chain handling

The worker-side form qualifies structurally:

- exact forced/outdegree-one chains descend locally;
- no queue/reclaim cycle is created for deterministic edges.

The rejected old manager preflight remains rejected. The worker-local rule should be preserved in any future hybrid.

## NEES Draft 0.3 assessment

The experiment was appropriately aggressive under NEES-EXTREME:

- fixed numeric E2 records;
- shared preallocated arenas;
- explicit identity domains;
- no Map/Set/Promise object scheduler copied into E2;
- generation/attempt failure semantics;
- bounded capacity;
- small costs retained in metrics.

The maximal-effort audit identified the dominant unresolved debt as **decision-frontier rematerialization/reconciliation frequency**.

Further polishing Atomics, queue code, or source-level loops is not justified before changing that structural granularity.

This is an example of NEES-XTRM-004/M43/M39 in practice: optimize total critical-path machine cost and structural ownership, not local instruction count.

## Promotion decision

Do **not** merge the decentralized pull implementation into `solver/isometric` production.

Retain the current central scheduler and qualified rank-cut policy.

Close implementation PR #109 as a rejected experiment after this result is durable.

Issue #102 may be closed as a completed/rejected candidate. Any successor should be a **new hybrid candidate**, not a claim that #102 was never implemented.

## Reopen triggers / successor shape

A future distributed architecture is justified only if it changes the failed granularity rather than retuning the same one.

Credible reopen conditions include:

1. portable shared recursive exact-value reuse that makes canonical work roots substantially larger;
2. a worker can execute a bounded **coarse canonical dependency chunk** while still publishing convergence/completion safely;
3. measured cross-worker duplicate subtree work large enough to pay for immediate shared synchronization;
4. an execution representation that avoids repeated legal-path replay/canonicalization at every decision frontier.

The central lesson is:

```text
global semantic visibility: valuable
global canonical reconciliation: feasible
worker pull: feasible
every decision frontier as a shared execution unit: rejected
```
