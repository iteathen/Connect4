# Lazy SMP — Core 0.19 Implicit Assertion Passes 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE bounded implicit-expansion test  
**Core candidate:** `iteathen/IsoGraph@426a808ac212441dbd718d348977eff0172e6fc6`  
**Subject:** `CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.*`  
**Assertion ledger:** `ASSERTION_LEDGER_0_1.json`  
**Authority effect:** none  
**Solver-method effect:** none

## Result

Core 0.19 produced useful structure on the existing Lazy SMP rendering without modifying the rendering or importing a new premise.

The operational expansion reached a fixed point after three productive passes:

```text
pass 1: 6 assertions
pass 2: 5 assertions
pass 3: 4 assertions
pass 4: 0 new assertions
```

This is a bounded operational fixed point over the frozen inputs, not a claim of universal semantic closure.

## Input distinction

Two layers were kept separate.

### Graph-only layer

Only the already rendered Lazy SMP 0.2 structure was used.

### Evidence-enriched layer

Existing frozen DTS/DP measurement records were admitted as explicit evidence supports.

No measurement was invented or rerun for this pass.

---

# Pass 1 — direct implicit assertions

## IA-G01 — first-resolution shared-cache immunity

From the shared-slot probe contract:

```text
EMPTY or WRITING or nonmatching committed generation
    -> no shared exact hit
```

and the invocation-local cache lifetime:

> if no committed matching shared generation exists when an occurrence probes, the shared exact cache cannot supply that occurrence's exact result.

This says nothing about the worker's private local cache.

**Support:** exact / graph-only.

## IA-G02 — publication benefit begins after resolution

The producer establishes the exact result and stores it privately before the optional shared-store attempt.

Therefore:

> the producer's shared publication cannot reduce the exact-resolution work that produced that publication.

Any positive reuse effect begins with a later occurrence after commit.

That later occurrence may be in another worker or, after private replacement, in the same worker.

**Support:** exact / graph-only.

## IA-G03 — finite reuse window

The shared cache exists only for one invocation and disappears at teardown.

Therefore a committed fact's possible reuse window is:

```text
commit
    ->
later occurrence(s)
    ->
invocation teardown
```

There is no cross-invocation reuse under the frozen method.

**Support:** exact / graph-only.

## IA-G04 — pre-publication overlap lies outside current exact-cache coordination

The shared sequence protocol represents:

```text
EMPTY
WRITING-STORE
COMMITTED
```

It does not represent:

```text
SEARCH-IN-FLIGHT
```

A shared hit also requires a committed matching exact fact.

Therefore:

> the current shared exact-cache protocol cannot coordinate same-q_r resolution occurrences that are already active before the first matching exact commit.

This is stronger than saying the cache has no ownership bit. It states the exact behavioral consequence of that omission.

**Support:** exact / graph-only.

## IA-G05 — current share gate is occurrence-blind within one key

The current decision is:

```text
share(key) iff hash(key) & sharedSampleBits == 0
```

For the same exact q_r key, hash, mask and therefore share eligibility are fixed.

Thus worker identity, search window, CPC route, timing and already-paid work cannot change the current share decision for that key.

This recovers structure already recognized in the DTS campaign.

**Support:** exact / graph-only.

## IA-G06 — winner arbitration does not create exactness

Result publication and completion precede winner CAS.

Therefore winner selection arbitrates among completed results; it does not create the selected result's exactness.

This was already explicit in the 0.2 prose decode and serves as a control that the assertion process can recover a known consequence without changing its meaning.

---

# Pass 2 — assertions over assertions

## IA-G07 — two temporal coordination phases

IA-G01, IA-G02 and IA-G04 jointly force a decomposition:

```text
PRE-COMMIT PHASE
    same-key resolution may overlap
    no matching exact fact is yet consumable

FIRST MATCHING EXACT COMMIT
    ------------------------

POST-COMMIT PHASE
    later local-miss occurrences may consume exact shared truth
```

This is the first materially new synthesis of the test.

The two phases have different available mechanisms and different evidence.

## IA-G08 — committed-row residency cannot remove first-wave overlap

A policy that changes only committed-row retention, replacement or priority acts after a fact exists in shared state.

Therefore:

> committed-row residency policy can alter post-commit reuse, but cannot eliminate same-key work already underway before the first exact commit.

This is a hard mechanism boundary under the frozen architecture.

## IA-G09 — state-only hash gating cannot be occurrence-selective within q_r

Because every occurrence of the same exact q_r key receives the same current share decision:

> a transition-selective policy among same-q_r occurrences cannot be expressed by the current key-hash gate alone.

Such a policy would require additional occurrence/transition information or a different boundary.

## IA-E01 — current post-commit channel is CPC_EXACT memoization

The frozen provenance census established:

```text
100% shared stores = CPC_EXACT
100% consumed shared hits = CPC_EXACT
```

for the exercised production workloads.

Therefore the measured post-commit shared channel is specifically cross-worker CPC_EXACT memoization for that scope.

This is a prior explicit result, not credited as new discovery.

## IA-E02 — route protection acts only on post-commit phase

The route-6/8 protection experiment changes replacement of an already committed shared row.

Combined with IA-G08:

> route protection cannot alter the pre-commit overlap class measured by the overlap census.

This connects two previously separate experimental records.

---

# Pass 3 — cross-record implicit synthesis

## IA-E03 — two independent optimization regimes are present

The overlap census establishes real pre-publication same-q_r overlap.

The provenance and route-residency experiments establish substantial post-commit CPC_EXACT reuse and workload-dependent residency leverage.

Therefore the measured Lazy SMP sharing problem contains at least:

```text
REGIME A
    pre-commit duplicate resolution

REGIME B
    post-commit exact reuse / residency
```

They are related through the same q_r state population but are not the same transition problem.

## IA-E04 — raw shared-hit count is incomplete by construction

A shared hit can exist only after a matching exact commit.

Pre-commit overlap is real and occurs before such a hit is possible.

Therefore raw shared-hit count omits a real class of cross-worker duplicate-resolution opportunity by construction.

This recovers and sharpens a prior DTS conclusion.

## IA-E05 — route-residency success cannot validate in-flight suppression

The exact route-8 A/B produced a positive CPU/cycle result on the high-displacement control.

But the mechanism operates only on committed-row residency.

Therefore that positive result is evidence about post-commit reuse economics only.

It cannot, by itself, validate or falsify a mechanism intended to suppress pre-commit duplicate resolution.

## IA-E06 — committed-cache policy ceiling

IA-G04, IA-G08 and IA-E03 jointly establish:

> any optimization restricted to the current direct-mapped committed exact-cache state machine has a structural ceiling: it cannot remove first-wave same-key overlap before an exact fact is committed.

Crossing that ceiling requires a different mechanism class, such as represented in-flight coordination or another method that acts before commit.

No claim is made that such a mechanism would be profitable.

---

# Pass 4 — operational fixed point

The new assertions from passes 1-3 were reintroduced as premises.

No additional materially distinct assertion was found without:

- restating an existing assertion;
- introducing a performance assumption not represented by the evidence;
- converting an OPEN QU into certainty;
- or proposing a mechanism rather than exposing a forced consequence.

Disposition:

```text
bounded operational fixed point: REACHED
universal implicit closure:       NOT CLAIMED
```

---

# Core 0.19 behavior observed

## Positive

The candidate successfully preserved:

- explicit versus implicit support;
- multi-pass lineage;
- graph-only versus evidence-enriched support;
- QU boundaries;
- grounded inference without a prescribed inference catalogue;
- prior explicit findings without relabeling them as novel.

It exposed a useful phase decomposition that was distributed across several prior records.

## Negative controls

The pass deliberately did **not** assert:

- that pre-commit overlap suppression is profitable;
- that same q_r always has different process leverage;
- that route 8 should always be protected;
- that hit count predicts saved work;
- that any OPEN QU has been closed;
- that pass 4 proves universal semantic closure.

Those conclusions are not forced by the frozen evidence.

## Development disposition

```text
Core 0.19 usefulness on Lazy SMP: SUPPORTED
Core 0.19 qualification:            NOT ESTABLISHED
new solver optimization:            NOT YET ESTABLISHED
new structural synthesis:           YES
```
