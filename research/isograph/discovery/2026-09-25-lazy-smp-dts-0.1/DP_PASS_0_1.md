# Lazy SMP — DTS 0.1 / DP 0.1 Discovery Pass

**Date:** 2026-09-25  
**Status:** COMPLETE first structural pass; measurements pending  
**Authority effect:** none  
**Solver-method effect:** none  
**Model:** `DTS_MODEL_0_1.json`

## Observation-first result

The new DTS view changes the remaining Lazy-SMP optimization question.

The earlier campaign asked which **states** are worth sharing. DTS shows that the unresolved quantity is more precise:

> which **exact-resolution and exact-consumption transition occurrences** collapse enough future work to repay publication/probe cost?

Those are not the same semantic quantity.

The current q_r key is already qualified for exact scalar-value reuse. That closes state identity for the declared cache scope. It does **not** establish that two occurrences of the same q_r state have the same process/decomposition, search window, producer effort, consumer effort, or performance leverage.

No NEI invocation is required for this conclusion; this is scoped q_r/cache semantics plus DTS transition structure, not a natural-identity claim.

## Established structure

### F01 — value equivalence is narrower than process equivalence

For the qualified cache scope:

```text
same q_r
    -> same exact scalar ordinary value
```

But the implementation permits occurrences of that q_r under different:

- worker occurrences;
- recursive alpha/beta windows;
- action-order histories;
- cache states;
- producer/consumer timing;
- already-paid local work.

Therefore:

```text
same q_r scalar value
    != established same resolution transition
    != established same consumption leverage
```

This is exactly the DTS barrier:

```text
same target/effect
    != same transition
```

### F02 — current share selection is state-only

Current publication/probe eligibility is:

```text
share(key) iff hash(key) & sharedSampleBits == 0
```

The gate has no representation of:

- producer resolution provenance;
- producer work already spent;
- consumer alpha/beta window;
- consumer work remaining;
- cross-worker in-flight overlap.

The previous rank census therefore tested one state property against a transition-relative target.

This does not invalidate the rank result; it explains why rank-neutrality did not close the leverage question.

### F03 — producer provenance is erased at the shared boundary

The same shared row format carries an exact value produced by materially different transition shapes, including:

- direct CPC exact closure;
- semantic interval collapse;
- immediate terminal closure under a full window;
- recursively resolved full-window exact search.

The shared cache stores only full key + scalar exact value + generation protocol.

Thus cheap-to-rederive and expensive-to-rederive exact facts are intentionally indistinguishable after publication.

This is a hidden-distinction lead, not yet a performance conclusion.

### F04 — shared probing occurs before CPC

Current order:

```text
local cache probe
-> eligible shared cache probe
-> CPC evaluation
-> recursive work
```

A shared hit skips CPC and everything below it.

Therefore an alternative ordering can be investigated without changing the game-theory solver method:

```text
local cache probe
-> CPC
-> only if unresolved, eligible shared probe
-> recursive work
```

The trade is exact and measurable:

```text
saved shared probes on CPC-cheap states
versus
repeated CPC work on states that would have shared-hit
```

No claim is made yet about which side wins.

### F05 — shared-hit telemetry cannot see the most important possible redundancy class

A shared hit requires a committed shared exact fact.

The current shared-cache sequence protocol represents:

```text
EMPTY
WRITING-STORE
COMMITTED
```

It does **not** represent:

```text
worker is currently searching q_r
```

Therefore if two or more workers enter the same q_r before the first exact publication, all may perform private resolution work and the event appears as **no shared hit** during the overlap.

This means:

> raw shared-hit count excludes pre-publication duplicate work by construction.

The earlier conclusion that hit count is not a leverage metric is therefore stronger under DTS: hit count is both unweighted **and blind to concurrent duplicate resolution before publication**.

### F06 — publication and consumption are different transitions

Current code uses the same deterministic key partition for both publication and consumption.

DTS separates:

```text
should producer publish this exact fact?
should consumer spend a shared probe on this occurrence?
```

Those are different transition questions.

There is no semantic requirement that they use the same gate. Symmetry is an implementation choice.

### F07 — current shared cache accelerates exact value, not transition construction

A consumer must reach and canonicalize the q_r key before the exact-cache probe can return a hit.

Accordingly, state-value sharing does not by itself remove parent-to-child transition construction that happened before entry to that child search occurrence.

This is structurally relevant because cofactor/canonical child construction is a major runtime component, but changing that layer would cross the present "solver method unchanged" campaign boundary. Record it; do not act on it in this Lazy-SMP-only pass.

## New leads

### L-DTS-01 — provenance-selective publication

Measure shared publication and consumption by exact-result provenance.

Candidate if supported:

```text
cheap exact closures:
    local cache only or much sparser shared publication

recursively expensive exact closures:
    denser shared publication
```

A particularly attractive property is that producer provenance is already known at the call site. A first candidate may need no wider shared row and no consumer metadata.

**Status:** OPEN / high priority.

### L-DTS-02 — CPC-before-shared probe

Reorder only the shared probe relative to CPC while preserving local-cache-first behavior and exact semantics.

**Status:** OPEN / high priority.

### L-DTS-03 — pre-publication overlap census

Measure per full q_r key:

```text
first worker enter time
other-worker enters before first publish
first exact publish time
overlap cohort size
private nodes/cofactors spent by overlapping workers
late post-publish consumers
```

This directly measures the duplicate-work class the shared-hit counter cannot see.

**Status:** OPEN / highest information value.

### L-DTS-04 — sparse counterfactual shared-hit value

On a sparse diagnostic sample of valid shared hits, run a control/shadow recovery without consuming the hit and record the extra descendant work required to recover the same exact value.

This turns "hit" into a transition-residual measurement:

```text
avoided nodes
avoided cofactors
avoided CPC work
avoided cutoffs/path exploration
```

It is measurement-only evidence; it is not a production mechanism.

**Status:** OPEN / high information value.

### L-DTS-05 — context-asymmetric consumption gate

If avoided work varies strongly with already-available consumer context, test a probe gate based on a minimal context signal rather than only q_r hash partition.

Candidate signals must be essentially free or already materialized. Alpha/beta window class is the first structural candidate because it already exists at every recursive call.

**Status:** OPEN / dependent on L-DTS-04.

### L-DTS-06 — overlap-triggered dynamic diversity

Only if L-DTS-03 finds material expensive overlap, test a decentralized response where a worker that detects a same-q_r in-flight peer changes recursive exploration rather than statically spreading every worker's order.

This is materially different from the rejected static `(workerIndex*2)%columns` experiment:

```text
static diversity everywhere
    !=
conditional diversity only on observed duplicate transition overlap
```

**Status:** OPEN / deferred until overlap is measured.

## Leads not reopened

DTS does not revive:

- shared-hit local backfill;
- persistent cross-invocation shared cache;
- wake-driven host wait;
- root witness diversity;
- static spread recursive offsets;
- simple shifted-slot decorrelation;
- broader sharing by itself;
- writer-contention optimization.

Those remain rejected/low-value under their recorded evidence.

## QU after the pass

```text
QU-DTS-LSMP-01
    exact-result provenance distribution among published/consumed facts

QU-DTS-LSMP-02
    counterfactual descendant work avoided per consumed fact

QU-DTS-LSMP-03
    pre-publication same-q_r overlap and duplicate work

QU-DTS-LSMP-04
    dependence of avoided work on consumer occurrence context

QU-DTS-LSMP-05
    cheapest profitable asymmetric publication/consumption gate
```

These unknowns are load-bearing for the performance claim and must remain open until measured.

## Next experiment order

1. **L-DTS-03 pre-publication overlap census** — highest information value because current telemetry cannot observe it at all.
2. **L-DTS-01 provenance census** — low conceptual risk; directly tests whether the shared row collapses an economically important distinction.
3. **L-DTS-04 sparse counterfactual hit value** — establishes actual saved-work distribution.
4. Use those measurements to decide whether **L-DTS-02**, **L-DTS-05**, or **L-DTS-06** deserves a behavior-changing A/B.

No behavior-changing optimization should be selected before these transition measurements.
