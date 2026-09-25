# Lazy SMP — IsoGraph DTS 0.1 Discovery Campaign

**Date:** 2026-09-25  
**Status:** ACTIVE / checkpoint 0.1  
**Authority effect:** none  
**Solver-method effect:** none  
**Durable owner:** `research/semantic-quotient`

## Exact source anchors

- IsoGraph integrated stack: `iteathen/IsoGraph@419f3d13ab5480d72fcd78f51502e5928bf5280f`
  - qualified cumulative Core 0.17 + Core 0.18
  - QU 0.1
  - NEI 0.4
  - Discovery Protocols 0.1-0.6
  - DTS 0.1
  - integrated qualification: Experiment 027
- JSMinSys Lazy SMP implementation: `iteathen/JSMinSys@04d37498607ace16dae33c79462ddfe1503c8a0d`
- Existing full Lazy-SMP decode: `research/isograph/successor/CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.*`
- Existing all-leads campaign: `research/isograph/discovery/2026-09-25-lazy-smp-all-leads-investigation/`
- Current exact-key -> q_r realization qualification: `research/isograph/qualification/JSMINSYS_QR_KEY_QUALIFICATION_0_1.md`

## Constraints

- Four-worker qualification remains the performance authority.
- Single-worker Lazy SMP is forbidden.
- The solver method remains unchanged; this campaign investigates search/execution behavior.
- Prior negative results remain negative evidence and are not silently reopened.
- DTS is used as transition semantics, not as an unqualified cost/mechanism profile.
- QU remains explicit wherever a transition-relevant distinction is not yet closed.
- DP discovery output is not proof authority.

## Why rerun with DTS

The previous 0.2 Lazy-SMP graph is state/protocol complete but predates qualified DTS 0.1. It identifies reusable exact states and orchestration events, but the surviving optimization question is itself transition-shaped:

> which exact facts, when published and later consumed, actually collapse enough future worker transition work to repay sharing?

The previous campaign established that state rank, raw shared-hit count, broader sharing, local backfill, persistent sharing, simple slot decorrelation, wake-driven waiting, and wider cyclic order diversity are not adequate answers.

DTS allows the producer transition, visibility transition, consumer transition, and avoided-work residual to be represented separately instead of treating "shared exact state" as one undifferentiated event.

## Initial transition decomposition

For one worker occurrence, represent at minimum:

```text
tau_enter(q)
    local exact probe
    shared exact probe
    CPC evaluation
    bound/window refinement
    action ordering
    cofactor/canonical child transition(s)
    recursive resolution
    exact-local publication
    optional exact-shared publication
    return
```

Across workers:

```text
tau_publish_shared(fact)
    producer-private exact fact
    -> committed shared-slot generation

tau_consume_shared(fact, worker_j)
    local miss
    -> shared exact hit
    -> recursive work avoided

tau_finish(worker_i)
    exact result
    -> metrics/result publication
    -> WINNER CAS
    -> DONE
    -> external loser teardown
```

The load-bearing distinction for the open leverage problem is not merely exact-state identity. It is the transition context in which an exact fact is produced and consumed.

## First DTS hypotheses

### DTS-LSMP-H1 — leverage is occurrence/transition-relative

The same qualified `q_r` exact fact can have different sharing leverage in different worker occurrences because its consumer search window, local evidence, and remaining descendant work can differ.

If true, a pure state-key classifier cannot perfectly rank sharing leverage.

**Falsifier:** measured avoided work for the same `q_r` fact is effectively invariant across materially different consumer contexts.

### DTS-LSMP-H2 — exact-result provenance matters

Current sharing treats exact values produced by cheap local closure and exact values produced after substantial recursive work uniformly once they reach the exact-store path.

Candidate provenance classes include:

- CPC exact;
- CPC/semantic interval collapse;
- immediate terminal child closure;
- recursively searched full-window exact;
- forced-chain exact closure.

Cheaply re-derived exact facts may be poor shared-cache occupants even when frequently reused.

**Falsifier:** publication/consumption economics do not materially differ by exact-result provenance class.

### DTS-LSMP-H3 — shared-probe order may be structurally premature

Current order is:

```text
local exact probe
-> shared exact probe
-> CPC
-> recursive work
```

A DTS alternative is:

```text
local exact probe
-> CPC
-> if still unresolved, shared exact probe
-> recursive work
```

This spends CPC work before a possible shared hit but can remove shared atomic probes for states CPC already resolves or prunes.

**Falsifier:** deferred shared probing increases total cycles because saved shared probes do not repay repeated CPC work on shared-hit states.

### DTS-LSMP-H4 — producer and consumer gates need not be identical

Current deterministic hash gating applies the same state-only eligibility logic to store and probe.

DTS separates:

```text
publication eligibility
!=
consumption leverage
```

A useful policy may sparsely publish one class of exact facts while probing based on a different already-available consumer context.

**Falsifier:** asymmetric gating cannot improve CPU/cycles without unacceptable extra branch/metadata cost.

### DTS-LSMP-H5 — the dominant saved object may be a transition, not a state result

A shared exact hit occurs only after the consumer has reconstructed/canonicalized the state key. Current sharing does not avoid the parent->child cofactor/canonicalization transition that created that key.

If duplicated transition construction is significant, state-value sharing may be downstream of the dominant repeated work.

This is a search/execution hypothesis only; no transition-cache mechanism is accepted here.

**Falsifier:** duplicate parent/action -> child-key transition construction across workers is too rare or too cheap to matter after existing exact-state reuse.

## Measurement plan before behavior changes

1. Instrument exact-store provenance classes without changing solve behavior.
2. Instrument exact shared-hit consumer context:
   - depth/rank;
   - alpha/beta width at the probe occurrence;
   - CPC outcome that would have followed (measurement shadow only where safe);
   - producer/consumer worker identity;
   - repeated-hit count by qualified full key.
3. On a sparse diagnostic subset of shared hits, ignore the hit in a shadow/control lane and measure the counterfactual descendant work needed to recover the same exact value:
   - nodes;
   - cofactors;
   - CPC calls/outcomes;
   - cutoffs;
   - elapsed/cycles where harness support permits.
4. Join publication provenance to consumption avoided-work evidence by full key, never by hash/slot alone.
5. Preserve four-worker solved control plus hard unresolved probes; do not infer universal leverage from one position.
6. Only after the census, isolate behavior-changing candidates one at a time under same-runner B/C/C/B.

## First expected deliverable

A transition-level leverage census answering:

```text
what exact-result transitions are cheap to recompute?
what exact-result transitions are expensive to recompute?
which published facts are actually consumed cross-worker?
when consumed, how much future transition work do they collapse?
which of those distinctions are available cheaply before the expensive work?
```

The first optimization candidate will be selected from that evidence rather than from raw hit counts.
