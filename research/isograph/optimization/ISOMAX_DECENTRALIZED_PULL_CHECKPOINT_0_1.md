# IsoMax decentralized worker-pull campaign — integrated architecture checkpoint

**Date:** 2026-09-20  
**Implementation candidate:** `work/isomax-decentralized-pull-102`  
**Checkpoint implementation SHA:** `9639a52ff1d3bf8f9c8468cd1b1c985035769c7b`  
**Draft PR:** #109  
**Canonical research owner:** `research/semantic-quotient`  
**Primary architecture issue:** #102  
**NEES:** Draft 0.3 at `iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c`

## Status

A complete bounded vertical slice of the #102 decentralized worker-pull architecture now exists and passes the repository's integrated Isometric correctness qualification at the checkpoint above.

This is no longer a central-scheduler experiment.

Promotion economics remain under qualification. The final promotion/default decision is intentionally left open in this checkpoint.

## Implemented architecture

The candidate now has the intended ownership split:

```text
EVALUATOR WORKERS
    pull/claim READY work themselves
    reconstruct portable replay in local native state
    descend deterministic / ordinary outdegree-one structure locally
    expose every genuine successor dependency at decision frontier
    relinquish discovery-lineage scheduling privilege
    return to global pull

SHARED WORK SYSTEM
    fixed-width SharedArrayBuffer work records
    bounded global priority bands
    generation/ticket-safe claim
    execution reservation only
    no semantic truth

CANONICAL RECONCILER
    independent worker
    canonical q_r authority
    typed q and edge/occurrence arenas
    duplicate READY collapse
    duplicate RUNNING retirement
    exact WDL propagation
    root/action transport
    global priority correction
    liveness / reclamation
    never assigns a worker

HOST CONTROLLER
    session lifecycle / timeout / progress / cold reporting
    does not dispatch individual work records
```

The existing central Branch Manager/executor remains unchanged as the correctness and performance control.

## Exact identity boundaries preserved

The implementation keeps separate:

- physical/legal replay occurrence;
- parent/action occurrence;
- canonical q_r dependency;
- execution work slot;
- worker-local residual/class/chunk IDs;
- proof/certificate identity.

Worker-local IDs never become portable identity.

Hash values locate candidates only. Manager-local exact q coordinates establish canonical equality.

q_r shares scalar ordinary value through reflection while action labels remain occurrence/orientation-local and are transported explicitly.

## Lifecycle protocol

Shared work slots carry generation and ticket state with a bounded lifecycle:

```text
FREE
 -> WRITING
 -> READY
 -> RUNNING
 -> DONE
 -> FREE(next generation)
```

The implementation additionally tracks:

- attempt numbers;
- provisional publisher worker;
- needed/liveness;
- priority band/ticket;
- executing worker;
- portable replay bytes;
- affinity hint.

Publication uses a separate bounded numeric ring.

A decision frontier publishes all CHILD occurrence records and then one FRONTIER_END semantic commit marker before any child becomes claimable.

Only complete exact WDL is publishable as exact semantic truth.

## Important protocol defects found and repaired

Integrated qualification exposed several real concurrency/lifecycle defects that were not visible in the old central scheduler.

### R-102-01 — terminal publication replay-use race

A worker could mark a work slot DONE before the exact/frontier terminal publication was consumed. Duplicate retirement could then recycle the slot while a publication still referred to its replay bytes.

**Repair:** DONE is terminal-publication-owned until the corresponding reconciliation handler consumes it. Neither shared helper nor reconciler duplicate retirement may recycle an in-flight DONE record.

### R-102-02 — duplicate copy of premature reclamation

The reconciler had an independent retirement implementation that still reclaimed DONE slots after the shared helper was fixed.

**Repair:** reconciler retirement now preserves DONE publication ownership as well.

### R-102-03 — partial frontier publication / worker death

A worker could reserve child slots and die before a complete frontier commit, leaving provisional WRITING/READY records with no semantic occurrence authority.

**Repair:** provisional child slots carry publisher ownership. Worker-death reconciliation reclaims uncommitted provisional records. FRONTIER_END is the semantic commit boundary.

### R-102-04 — pre-publication DONE worker death

A worker can die after finishing a work attempt but before its terminal publication reaches the manager.

**Repair:** worker death invalidates the attempt, making all late publications stale, and requeues the portable work when canonical demand is still live.

### R-102-05 — demand resurrection

A canonical q may lose all demand while an execution is RUNNING, then gain a new parent occurrence before the retired worker result arrives.

**Repair:** demand resurrection has explicit requeue semantics rather than being treated as impossible or as a failure.

### R-102-06 — repeated unchanged-priority tickets

Topology propagation repeatedly called the priority update path and could enqueue stale duplicate READY tickets even when the priority band was unchanged.

**Repair:** READY records receive a new ticket only when their actual global priority band changes.

## Decision-frontier scheduling semantics

The current candidate implements the intended rule:

```text
exact / forced / one legal action
    -> descend locally

genuine >=2-way unresolved decision frontier
    -> expose all successors
    -> no child ownership privilege
    -> canonical reconciliation
    -> global prioritized READY competition
    -> workers independently claim
```

The worker does not use queue length or local capacity as a scheduling policy.

## Initial priority implementation

The initial policy intentionally uses coarse explicit bands rather than a fitted scalar.

Inputs currently include:

- direct root criticality;
- parent unresolved-count / closure criticality;
- first unresolved edge under exact/advisory ordering;
- canonical fan-in;
- advisory local order hint.

Affinity is a worker-specific cost hint only. It cannot bypass a higher global priority and creates no ownership or waiting.

## Current correctness qualification

At implementation checkpoint `9639a52...`:

- full repository `verify` passed;
- Isometric native WSL qualification passed;
- dedicated `isomax-pull-qualification` passed;
- benchmark-evidence passed;
- strength-evidence passed;
- bsfp-portable passed.

The integrated pull tests include:

- exact WDL/root-action agreement at 1/2/4 workers;
- mirror action transport;
- deterministic first-win/root witness;
- generation/ticket stale rejection;
- actual canonical q convergence;
- duplicate execution retirement;
- bounded capacity failure without manufactured WDL;
- active RUNNING evaluator termination followed by exact surviving-worker completion;
- orphan provisional-frontier cleanup;
- worker-death requeue.

## Economics — first completed late-root screen

GitHub Actions run 35496939925, Node 26.7.0, AMD EPYC 9V74, three deterministic rank-28 roots.

All serial/central/pull variants produced identical root WDL/actions.

### One-shot total wall

The pull implementation was slower in total one-shot wall time and used more memory.

Totals across three roots:

```text
central-1   301.1 ms
pull-1      526.2 ms

central-2   340.8 ms
pull-2      655.9 ms

central-4   580.1 ms
pull-4      828.0 ms
```

Observed max RSS:

```text
central-1   279 MB
pull-1      650 MB

central-2   509 MB
pull-2      783 MB

central-4   511 MB
pull-4      856 MB
```

This is not a promotion result.

### Canonical duplicate collapse is real

On the harder of the three late roots:

```text
pull-1:
    canonical q             2494
    duplicate READY collapsed 2038
    q reuses                3967

pull-2:
    canonical q             2263
    duplicate READY collapsed 1776
    q reuses                3673

pull-4:
    canonical q             1910
    duplicate READY collapsed 1404
    q reuses                2976
```

RUNNING duplicates were also retired, although far less frequently than READY duplicates.

This directly confirms that the proposed earlier q visibility + canonical reconciliation mechanism is active, not merely nominal.

### Current dominant cost signal

The pull architecture still performs substantially more execution-level transition/replay work than the old central scheduler on these late roots.

For example, on one control root:

```text
central-4 transition attempts    1640
pull-4 transition attempts      10030
```

The architecture therefore removes duplicate canonical execution roots while paying heavy frontier/replay/reconciliation cost and exposing enough siblings that more dependency work is actually entered.

Longest-common-prefix replay reuse has since been added so workers no longer reconstruct unchanged physical prefixes from root every claim.

### Timing caution

The pull manager's internal `resultReadyMs` starts after its owned workers are started, while current central result-ready timing includes worker startup. Therefore those internal values are not directly comparable across architectures.

Use one-shot total wall for current fair cold comparison unless timing boundaries are normalized.

## Notable structural finding

**Canonical visibility and useful execution are different optimization axes.**

The new architecture proves that exposing dependencies early can collapse a large amount of duplicate READY work, but that does not automatically reduce total executed work.

A globally visible dependency graph can still over-execute if priority/reconciliation lag allows non-critical siblings to run before parent-closing information propagates.

This validates the issue's distinction:

```text
visibility != execution
```

and adds a second requirement:

```text
early visibility
+
priority propagation fast enough to convert visibility into retirement
```

## Issue-disposition correction

Old-scheduler negative evidence was narrowed rather than erased.

Reopened for integrated #102 qualification:

- #90 — dependency leverage priority;
- #91 — affinity as worker-specific execution cost, not ownership;
- #94 — yield/quantum inside the global pull architecture;
- #95 — worker-local deterministic/outdegree-one descent.

Kept closed with explicit reopen triggers:

- #92 — support-fiber ordering; old workload remained too sparse;
- #93 — demand-triggered support supply front; old workload remained too sparse.

#89 remains a valid qualified central-admission optimization and an important performance control. It is not #102 completion.

## Remaining qualification before final disposition

1. complete the same-head historical expensive 18-ply central-vs-pull comparison;
2. determine whether canonical-dedup savings overtake E2/replay cost at substantial solve work;
3. tune priority/affinity/quantum only if complete-system evidence identifies a credible mechanism;
4. persist final implementation economics and remaining debt;
5. choose:
   - promote as default,
   - retain as qualified alternate/research profile,
   - or reject current realization while preserving the architecture evidence.

No empty-board solve or universal speedup claim is made.
