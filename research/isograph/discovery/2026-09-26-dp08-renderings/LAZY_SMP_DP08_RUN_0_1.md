# DP 0.8 discovery run — Lazy SMP successor 0.3 — 0.1

**Status:** experimental successor discovery; no authority or solver-method effect  
**Campaign branch:** `research/dp08-discovery-20260926`  
**Modernization input commit:** `6d386c180d98f4be6dc96b8c72db769a4d75620f`  
**Primary implementation anchor:** JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`

## Frozen inputs

| Artifact | Git blob |
|---|---|
| Lazy SMP 0.3 native | `106909a7ab625720b2775dcecb02a6e58167259c` |
| Lazy SMP 0.3 JSON | `b54137db1bf6ca16eb1b80580bd29d476097cb75` |
| Lazy SMP 0.3 prose | `949b1f4e2965193997417018afa4e3f48c750745` |
| Lazy SMP 0.2 native | `1592a32b6dcc3fc392bdb9b75ac220da482662ee` |
| Lazy SMP 0.2 JSON | `aa9db6d4ec2c37551527a4767100f8619108d4c3` |
| Lazy SMP 0.2 prose | `7d610f2c2ccebbaf9196ec39a12163e92e5d33ea` |
| Core 0.19 exact-source qualification | `b5a6c031b61530436de6f310e8f0e56ece9eb2b8` |
| full-decode DP report | `a4b83d004925faa97e4d8b459fddbdd9ca270b5c` |
| all-leads investigation | `af32939aaa0bc01e6132d7db31acb316bb853c97` |
| DTS provenance census | `de2ef912510ac9f6f7901f56f82c4143213eca70` |
| route-8-only plan | `b9366538f438f38bc0100dbfe32b63dd162bcfe0` |

No unified valuation profile is imposed across all Lazy SMP alternatives. Where earlier experiments measured wall/CPU/cycles, those values are used only at their pinned experiment scope.

---

# 1. Declared objectives

### LS-VALUE

Obtain the exact scalar ordinary W/D/L result.

### LS-WITNESS

Obtain the exact result plus the current required root move/witness behavior.

### LS-HOST

Satisfy the current Lazy SMP host contract:

```text
ERROR == 0
AND DONE == 1
AND WINNER >= 0
```

and complete invocation teardown cleanly.

### LS-TELEMETRY

Preserve whatever result-row/metric outputs are explicitly required by the external caller/measurement contract.

These objectives are separated because publication, winner arbitration, failure handling, and telemetry do not have identical support requirements.

---

# 2. Temporal support states — exactness creation is not winner selection is not host acceptance

The current worker ordering is:

```text
solve returns exact result
    -> publish metrics/result/completion
    -> CAS WINNER
    -> winner sets DONE and WAKE
    -> host observes DONE/STOP
    -> close/terminate workers
    -> final ERROR/DONE/WINNER gate
```

DP 0.8 + DTS therefore distinguish at least three milestones:

### T1 — semantic exactness created

A worker has computed an exact result.

### T2 — winner selected

One already-published worker wins `WINNER: -1 -> workerIndex`.

### T3 — host/session exactness accepted

The host observes the completion path and the final gate still has:

```text
ERROR == 0
AND DONE == 1
AND WINNER >= 0.
```

These are not interchangeable.

A loser can fault after DONE and set ERROR, invalidating LS-HOST even though a winner had already published an exact scalar result.

This temporal distinction is load-bearing for every publication/teardown optimization below.

---

# 3. WAKE — dead for the current host target, not globally dead

Current producers:

- winner path;
- failure path;
- close path.

Current Lazy SMP host consumer:

```text
none
```

The host polls STOP/DONE instead of waiting on WAKE.

Therefore for LS-VALUE / LS-WITNESS / the current polling host’s observation path:

```text
WAKE increment + notify
    = NONESSENTIAL_FOR_SUFFICIENCY_CANDIDATE
```

at this composition.

Important boundaries:

- generic ManagedThreadSession ownership is broader than this one caller;
- another composition may wait on WAKE;
- no direct remove-WAKE valuation experiment has been supplied.

The related experiment that **started consuming WAKE** via `Atomics.waitAsync` was worse:

```text
wall +6.66%
CPU  +0.78%
cycles +0.14%
```

That rejects the tested WAKE-driven waiting alternative. It does not measure the cost/benefit of deleting currently unconsumed notifications from a narrower caller-specific implementation.

**Disposition:** support-dead locally; removal value unknown; generic deletion unauthorized without consumer audit.

---

# 4. Publication before WINNER — result support versus telemetry support

The worker currently publishes:

```text
metrics
value
relative
move
completion
```

before attempting the winner CAS.

## Result fields

For the current unsynchronized host path, publishing winner result/completion before DONE is a straightforward support dependency:

```text
host may observe DONE
    -> winner row must already be valid
```

Moving result publication after DONE would be insufficient without adding another publication/visibility protocol.

So the existence of a result-before-host-observation edge is **LOAD_BEARING** for LS-HOST/LS-WITNESS.

## Metrics

Whether all metrics must precede winner arbitration is different.

If metrics are part of LS-TELEMETRY, they must be published under a contract that guarantees their availability and provenance.

If only LS-VALUE is declared, metrics are not part of the semantic result support cone.

Therefore:

```text
metrics-before-CAS
    = OBJECTIVE_DEPENDENT
```

not automatically removable.

Measured timing shows winner publication itself is tiny:

```text
solver return -> result publication ~0.014 ms
publication -> winner CAS           ~0.001-0.002 ms
```

so no high-value optimization follows merely from support bypassability.

---

# 5. Shared-hit repeated atomic probing — exact alternative exists, valuation rejects it

Current path:

```text
local miss
    -> shared exact hit
    -> return exact value
```

No local backfill occurs, so a later encounter can repeat the shared atomic probe.

An exact alternative was tested:

```text
shared exact hit
    -> write validated value into private direct-map slot
```

It reduced repeated shared hits dramatically:

```text
~102k -> ~7.5k
```

but measured:

```text
wall   +0.92%
CPU    +0.14%
cycles +0.48%
```

The alternate sufficient topology is therefore economically worse at that pinned configuration because local direct-map replacement damage offsets saved shared probes.

DP 0.8 classification:

- repeated shared atomic probing is **not uniquely necessary** for exactness;
- local retention is an exact alternative;
- the tested alternative is **VALUATION-REJECTED**;
- therefore “fewer atomics” is not a valid standalone value proxy.

---

# 6. Deterministic share mask — semantic nonessentiality versus resource sufficiency

Sharing eligibility is a deterministic exact-key partition:

```text
(hash & sharedSampleBits) == 0
```

For a fixed key/mask/hash, all workers agree on eligibility.

The mask therefore creates a permanent cross-worker visibility blind region during an invocation.

Measured under full sharing with shadow mask-7 classification:

```text
mask-7 eligible hits  ~11-13%
excluded hits          ~87-89%
```

The eligible/excluded populations were approximately rank-neutral.

## DP 0.8 distinction

For **unbounded semantic exactness**, the shared cache and its particular mask are not game semantics; workers retain private exact solvers.

For **bounded host success**, however, sharing may affect whether the solve completes before timeout/resource limits.

Thus:

```text
share mask
    nonessential to ordinary value semantics
but
    potentially load-bearing to a declared deadline/resource objective
```

No “share more” conclusion follows.

Prior evidence shows full sharing can recover roughly eight times more shared hits while performing worse in CPU/cycles.

**Falsifier:** shared-hit count is not a sufficient leverage/value metric.

---

# 7. Local/shared collision coupling — real structure, rejected simple substitution

When local and shared capacities match, both direct maps use the same low hash bits, coupling collision partitions.

This coupling is implementation structure, not semantic support.

A shifted shared-slot alternative:

```text
shared slot = (hash >>> 8) & mask
```

decorrelated the slot namespace.

Solved-control signal:

```text
wall   -2.69%
CPU    -0.28%
cycles -0.06%
```

but the hard probe regressed:

```text
CPU    +10.61%
cycles +9.87%
```

and empty board was also slightly worse.

Therefore:

```text
collision-domain coupling
    !=
proof that simple decorrelation has positive valuation
```

The alternative is correctness-sufficient but **VALUATION-REJECTED AS A GENERAL REPLACEMENT** by current workload evidence.

Replacement rate itself is also not a value proxy: lower replacement did not monotonically improve runtime.

---

# 8. Worker-order diversity — objective-dependent admissibility

Current recursive order is:

```text
orderOffset = workerIndex mod columns
```

For 7 columns, configured diversity saturates after seven offsets. Worker 7 repeats worker 0’s nominal cyclic order.

This is a limited deterministic orbit, not independent search-policy diversity.

## Root-diversity experiment

Allowing root ordering to follow worker-private rotations preserved W/D/L but changed the required root witness:

```text
lazy.move != serial.move
```

Therefore:

- for LS-VALUE alone, the result demonstrates scalar exactness can survive that change on the tested controls;
- for LS-WITNESS, the candidate is **INSUFFICIENT / INADMISSIBLE** because it violates the authoritative witness contract.

This is a direct DP example where a support change is sufficient for a narrower objective but not the current product contract.

## Recursive spread experiment

Keeping root witness semantics while spreading recursive offsets:

```text
(workerIndex * 2) mod columns
```

measured:

```text
wall   -1.98%
CPU    +2.65%
cycles +3.02%
```

So greater diversity did not lower total machine work.

**Disposition:** current cyclic orbit is not proven optimal; the two tested expansions are rejected for contract and/or valuation reasons.

---

# 9. Post-DONE policy — scalar exactness versus session integrity

Injected lifecycle controls established:

## Loser error after DONE

```text
DONE = 1
WINNER = 0
ERROR = 101
STOP = 1
```

## Clean loser exit after DONE

```text
DONE = 1
WINNER = 0
ERROR = 0
```

Thus the current host intentionally distinguishes:

```text
clean loser termination
    !=
loser fault
```

even after winner publication.

For LS-VALUE, an already-published winner scalar may still be mathematically exact.

For LS-HOST, however, `ERROR == 0` remains part of the declared acceptance gate.

Therefore ignoring a loser error after DONE would change the host correctness contract, not merely remove redundant performance work.

**Disposition:** fail-closed post-DONE error policy is **LOAD_BEARING FOR LS-HOST** until explicit contract authority says otherwise.

Do not treat it as a hot-loop optimization.

---

# 10. Teardown after DONE

Recursive Lazy SMP does not cooperatively poll STOP.

After winner/failure observation, close performs:

```text
STOP = 1
WAKE += 1
notify
Worker.terminate() all threads
await exits
```

For LS-VALUE, loser recursive work after T2 contributes no new required winner value.

For LS-HOST, external termination/exit completion is part of clean invocation closure.

Therefore:

```text
loser search after accepted winner
    nonessential for result value

mechanism that actually stops/joins losers
    load-bearing for clean host termination
```

A cooperative-stop alternative would be a different transition topology and needs DTS plus valuation; none is inferred here.

---

# 11. Shared provenance — what current sharing actually supports

Measured provenance census:

```text
100% committed shared stores = CPC_EXACT
100% consumed shared hits    = CPC_EXACT
```

for the measured workloads.

Observed reuse:

```text
solved control ~21.5-22.6 hits/store
hard probe     19.31
empty board    43.22
```

Thus at the pinned revision/workloads the shared boundary is empirically:

```text
cross-worker CPC_EXACT memoization
```

not a mixed general population of recursive proof results.

A candidate ordering:

```text
local -> CPC -> shared -> recursion
```

would recompute the exact CPC transition currently avoided by every measured shared hit, with no measured non-CPC shared population to recover afterward.

**Disposition:** CPC-before-shared is structurally disfavored/rejected for the measured domain.

The leverage question therefore moves **inside CPC_EXACT**.

---

# 12. Scalar-only shared evidence is already a sufficient payload

The shared cache transports exact scalar W/D/L only, not:

- best move;
- witness;
- proof/certificate;
- alpha/beta bound.

On a shared hit the worker returns exact scalar value immediately.

Therefore, for the current shared-cache consumer objective:

```text
move/proof payload
    = NONESSENTIAL_FOR_SUFFICIENCY
```

at the shared boundary.

Adding them would widen rows and introduce stronger provenance/identity obligations without a demonstrated consumer.

This is a useful negative result: support minimization already favors the current scalar-only payload.

---

# 13. Combined deterministic-partition lead

Two current diversity mechanisms are deterministic and globally repeated:

```text
worker order:
    workerIndex mod columns

share eligibility:
    fixed hash mask by exact key
```

For worker indices separated by board width, nominal recursive order repeats. The same exact key is always share-eligible or share-ineligible for every worker.

Therefore configured worker diversity does not independently diversify the share partition.

This does **not** prove duplicate work: private cache state, scheduling, and shared-cache timing still differentiate traces.

But it narrows the structural question:

> for worker counts beyond the action-order orbit, what cheap diversity signal changes actual high-leverage dependency exploration without violating the root witness contract or increasing total cycles?

Existing root and spread experiments already falsify “more order diversity is automatically better.”

**Disposition:** QU / bounded future experiment question, not a new candidate promotion.

---

# 14. No minimum and no universal valuation

Current evidence is enough to reject several tempting proxies:

```text
more shared hits        != better
fewer atomic probes     != better
fewer collisions        != better
more worker diversity   != better
shorter host wait       != better
more persistent reuse   != better
```

The current Lazy SMP topology is not proved minimum.

Alternative spaces remain open for:

- leverage-aware CPC_EXACT sharing;
- route-8-only protected residency;
- root-witness-safe scheduling diversity;
- host lifecycle designs with an explicitly changed contract;
- cache layout/capacity policies.

No cross-experiment universal ranking is manufactured.

---

# 15. QU / DTS / NEI

- **QU:** direct valuation of deleting unconsumed WAKE writes; cheap CPC_EXACT leverage signal; best cache collision topology; better root-witness-safe diversity; route-8-only result; global minimum.
- **DTS:** load-bearing for T1/T2/T3 exactness milestones, metrics/result publication timing, post-DONE errors, teardown, shared-result provenance, and worker occurrence versus winner occurrence.
- **NEI:** no new natural-identity conclusion is required. Cache-key/q-r identity remains owned by game-theory qualification.
- **Valuation:** experiment-specific only; no graph-size or event-count proxy.

---

# 16. Disposition

DP 0.8 separates the Lazy SMP leads cleanly:

| Subject | Sufficiency result | Valuation result |
|---|---|---|
| WAKE for current polling host | nonessential candidate | direct deletion unmeasured; WAKE-driven wait rejected |
| result-before-host observation | load-bearing under current protocol | publication delay tiny |
| metrics-before-CAS | objective-dependent | no separate useful saving established |
| shared-hit local backfill | exact alternative | rejected |
| deterministic mask | not game-semantic; may matter to deadline/resource target | “share more” rejected |
| collision decorrelation | exact alternative | simple shift rejected globally |
| broader worker-order diversity | scalar-only may survive; witness contract can fail | tested variants rejected |
| post-DONE loser error | scalar winner may remain exact; host contract invalidated | contract decision, not performance optimization |
| scalar-only shared payload | sufficient | retain; no need for wider payload |

The strongest new conceptual result is the DTS separation:

```text
exactness created
    !=
winner selected
    !=
host/session exactness accepted
```

That distinction prevents apparently redundant publication or post-DONE work from being removed under the wrong objective.
