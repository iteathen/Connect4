# IsoMax #102 interpretation correction — branch opportunity versus execution root

**Date:** 2026-09-20  
**Status:** governing correction to the architectural interpretation used by the rejected #102 experiment  
**Predecessor result:** `ISOMAX_DECENTRALIZED_PULL_102_RESULT_0_1.md`  
**Gameplay authority effect:** none

## Correction

The completed #102 experiment implemented and rejected this stronger execution rule:

```text
genuine branch
    ->
publish every child
    ->
stop local worker recursion
    ->
canonical reconciliation
    ->
rematerialize selected child as a new global execution root
```

That rule was an over-interpretation of earlier discussion using the phrase **branch root** / **dependency root**.

The intended architecture is:

```text
worker already executing a line
    ->
genuine branch
    ->
continue one locally ordered successor in-place
    +
publish the surplus successor opportunities globally
    ->
other available workers claim globally prioritized surplus work
```

The worker's continued line is a **current continuation**, not permanent ownership. It remains visible to canonical q reconciliation, may be retired as duplicate/obsolete, and may yield at a separately qualified amortized control boundary.

Canonical q identity is a reconciliation/semantic relation. It is **not** by itself an execution boundary.

## Terminology

Use these terms:

- **current continuation** — the currently executing worker-local line;
- **surplus branch opportunity** — an alternative branch made globally available for another worker;
- **canonical dependency** — q_r semantic node used for convergence and value propagation;
- **execution reservation** — temporary worker use of CPU; retireable/yieldable;
- **branch point** — a place where surplus work becomes available, not a mandatory scheduler round trip.

Avoid using **root** without a qualifier.

## What remains valid from the rejected experiment

The previous experiment remains valuable evidence for:

- q_r convergence frequency;
- duplicate READY/RUNNING collapse mechanisms;
- generation/ticket/attempt lifecycle design;
- fixed-width shared E2 representation;
- action transport under reflection;
- failure/retirement distinctions;
- worker-pull priority queues;
- worker-death handling;
- the cost of replay/rematerialization and centralized reconciliation;
- the negative result for **mandatory decision-frontier externalization**.

These results must be preserved.

## What is invalidated as a conclusion

The previous report MUST NOT be cited as evidence that the intended worker-pull architecture is economically rejected.

It falsifies only this realization:

> every genuine decision frontier terminates local execution and becomes a globally rematerialized execution boundary.

It does **not** test the intended realization where:

- local recursive continuity is preserved;
- only surplus alternatives are globally queued;
- global priority controls otherwise-idle worker capacity and qualified yields;
- canonical reconciliation observes/merges running continuations without forcing them through rematerialization.

Therefore the prior promotion disposition is narrowed to:

```text
over-externalized frontier-per-work-item variant:
    rejected

intended local-continuation + surplus-opportunity architecture:
    OPEN / unqualified
```

## Corrected execution model

At a branch with ordered successors:

```text
S0 S1 S2 ... Sn

current worker:
    continue S0 in-place

global pool:
    expose S1..Sn as surplus opportunities

reconciler:
    canonicalize/merge S0..Sn occurrences
    may retire S0 if duplicate/obsolete
    may reprioritize S1..Sn
```

The local continuation may be the existing solver's next ordered child. This is execution continuity, not a worker-authored global scheduling policy.

At the next branch on S0, repeat:

```text
continue one
publish surplus
continue one
publish surplus
...
```

A worker returns to the global pool when:

- its current continuation becomes exact;
- it is retired/obsolete;
- it reaches an explicit safe yield/quantum boundary and global policy elects to yield;
- it otherwise becomes available.

It does **not** return merely because a branch exists.

## Corrected performance hypothesis

The intended architecture attempts to preserve both:

```text
worker-local recursive locality
+
global visibility of parallel opportunities
```

This is qualitatively different from the rejected realization, which traded away local recursive locality at every branch.

The corrected experiment must therefore measure:

- local calls/expansions retained inside continuations;
- surplus branches published;
- surplus branches claimed by other workers;
- duplicate canonical continuations discovered;
- duplicate running work retired;
- worker-local cache/TT reuse;
- publication/claim overhead;
- manager reconciliation lag;
- number of forced global rematerializations;
- completed-solve wall/resource economics.

## Issue-disposition consequence

Issue #102 is reopened.

Prior #102 closure and PR #109 remain historical evidence for the rejected over-externalized realization.

Candidate conclusions derived specifically from that realization must be reconsidered where material:

- #90 dependency-leverage priority: still OPEN as a global surplus-work priority mechanism;
- #91 affinity: still OPEN as a cost hint for surplus work / qualified continuation yield;
- #94 quantum/yield: OPEN and now directly load-bearing;
- #95 local deterministic descent: remains valid and completed.

## Governing falsifier for the corrected architecture

Reject the intended architecture only after a complete implementation preserves current-line local recursion and still fails complete-solve economics or correctness.

Do not substitute the previous frontier-per-work-item experiment for that test.
