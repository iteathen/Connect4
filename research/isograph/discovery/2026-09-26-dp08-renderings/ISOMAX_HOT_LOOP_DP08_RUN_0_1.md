# DP 0.8 discovery run — IsoMax hot loop / CPC / exact-source support — 0.1

**Status:** experimental successor discovery; DP 0.8 is unqualified  
**Gameplay authority effect:** none  
**Performance-authority effect:** none; qualified hot-loop authority remains 0.3  
**Campaign branch:** `research/dp08-discovery-20260926`  
**Modernization input commit:** `6d386c180d98f4be6dc96b8c72db769a4d75620f`

## Frozen inputs

| Artifact | Git blob |
|---|---|
| qualified hot-loop authority root 0.3 | `0fbd2f8bfc5e21c12e2b8b87877d09fbf32ba1e1` |
| hot-loop 0.3 native | `4875d4407030ed804870ac061b5f47d90deb3524` |
| hot-loop 0.4 candidate native | `45b6a2198b1e6e975dc651cf45ecdf1766a5aeeb` |
| hot-loop 0.4 candidate JSON | `f4d77cfe1c4d133802daaf6f8a5764b248d39554` |
| hot-loop 0.4 candidate prose | `1a2454e83a342ccaed1ed57c443b6dc101dd79df` |
| Core 0.19 executable rendering qualification | `b5a6c031b61530436de6f310e8f0e56ece9eb2b8` |
| prior source-grounded DP report | `f858617801d298b0ef799010699a827d7a639783` |
| ordered source support projection | `fba58300527449c71e5de46b413ca7a135c82e4e` |
| finite discovery controls | `82e0ff9c86719f1d9661b3821e3eba941902e553` |
| no-predictive-draw result | `a3b9723f1034604810c44194d3828931c6e1bd0a` |
| win-only result | `17e2025c3874e35de6e15ab46dd1d93827582aa7` |
| CPC-owned transition-win result | `4a6d2cc32b86cd44d1a798271b6731fb3f9f795d` |

## Revision firewall

The Core 0.19 exact-source rendering is qualified only for:

- Connect4 `2ed88683ba46fc4d99790414ad99a2e409acf400`;
- JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`.

The later CPC experiments use later JSMinSys revisions.

Therefore:

```text
qualified exact-source occurrence
    !=
silent exact-source qualification of later experiment code
```

Older exact-source findings are used only at their pinned revision unless the later experiment record independently establishes the same guard/placement.

---

# 1. Declared objectives

### IM-SCALAR

Return the exact ordinary scalar W/D/L value.

### IM-SOLVE

Return the exact current solve contract, including the required root action/witness behavior and retained terminal semantics.

### IM-CYCLES

Among supports that satisfy IM-SOLVE for the tested composition, minimize:

```text
total process cycles
```

under the exact host/runtime/workload profile recorded in the CPC campaign.

Wall time is not silently substituted for total cycles.

---

# 2. Support topology — current CPC composition

The 0.4 candidate separates:

## Tactical/exact-restriction support

- immediate mover win;
- opponent double threats;
- forced block;
- support-lift loss;
- fork-preemption loss;
- exact action restrictions.

## Predictive no-win/bound support

- initial residual-exhaustion / no-win bounds;
- long-range response no-win bounds.

## Exact closure

- exact recursive alpha-beta/RBA fallback;
- actual first-win handling;
- full-board draw handling.

This separation is load-bearing because predictive no-win bounds are not identical to semantic DRAW.

---

# 3. Fresh sufficiency classification

## 3.1 Predictive no-win/bound family

The no-draw experiment removed both predictive-bound subfamilies while retaining tactical support, exact fallback, first-win handling, and terminal draw handling.

For the selected composition:

```text
predictive no-win/bound family
    = NONESSENTIAL_FOR_SUFFICIENCY_CANDIDATE
```

for IM-SOLVE at the tested/controlled scope.

This does not mean:

- the deductions are false;
- DRAW semantics are removable;
- every workload is unaffected;
- every individual predictive deduction has negative valuation.

The exact fallback is the alternate sufficient support that closes unresolved positions.

## 3.2 Terminal/full-board DRAW

Full-board non-winning draw remains part of exact game semantics and the retained transition closure.

```text
predictive no-win analysis removable candidate
    !=
terminal DRAW removable
```

Terminal DRAW is **LOAD_BEARING** for exact ordinary semantics.

## 3.3 Tactical support

The win-only ablation shows that much tactical loss/restriction support can be omitted without changing the one sampled root answer, but it does not establish a universal correctness-safe omission across the intended solver scope.

Disposition:

```text
not uniquely necessary on the sampled solve
but
broader sufficiency qualification unresolved
```

The exact fallback provides a plausible alternative path, but root witness, first-win, restriction, and all-position correctness obligations must remain guarded.

---

# 4. Occurrence-level redundancy — immediate-win predicate

The later CPC-owned experiment gives a particularly clean DP 0.8 result.

On the guarded CPC-only recursive path:

```text
CPC proves:
    no legal immediate mover win exists

then recursive transition code tests:
    immediate mover win again
```

For that occurrence:

```text
upstream exact proof
    -> duplicate downstream predicate
    -> no additional support for IM-SOLVE
```

Therefore the transition-level test is:

```text
NONESSENTIAL_FOR_SUFFICIENCY
on the guarded CPC-owned recursive path
```

while the same predicate remains required at other occurrences:

- CPC first-win priority;
- root witness selection;
- checked ingress;
- optional Four-Front callers;
- other paths without the upstream proof.

This is an important DTS/occurrence distinction:

```text
predicate globally useful
    !=
every occurrence load-bearing
```

The optimization is justified by support topology, not by renaming the predicate “redundant” everywhere.

---

# 5. Exact-source DP 0.8 reclassification — C1 closure absorption

At the qualified Core 0.19 source revision, the prior DP campaign found:

```text
target coordinate U is already an upset
x in U
    -> up(x) subset U
    -> U union up(x) = U
```

Therefore once image `x` is already present in the completed target upset, re-expanding its principal upset cannot change the final coordinate.

For target-coordinate equality:

```text
repeated principal-upset expansion after x in U
    = NONESSENTIAL_FOR_SUFFICIENCY
    under the completed-closure guard
```

Finite controls covered 2,688 insertion cases and explicitly rejected the unsafe incomplete-closure variant.

What remains unknown is valuation and later-revision applicability.

Extra membership loads/branches may cost more than saved scans.

So:

```text
semantic/algebraic sufficiency result: supported at frozen source revision
performance preference: QU
later experiment revision applicability: not silently inherited
```

---

# 6. Exact-source DP 0.8 reclassification — endpoint exactness

At the qualified source revision, the ordinary value domain is closed:

```text
V in {-1,0,+1}
```

Therefore:

```text
proven lower bound V >= +1
    -> V = +1

proven upper bound V <= -1
    -> V = -1
```

For exact scalar-cache publication of endpoint values:

```text
full-window proof
    is not uniquely necessary
```

if a correctly directed bound collapses the finite value domain to one point.

Interior bound counterexample:

```text
V >= 0
    permits DRAW or WIN
```

so generic cutoff bounds cannot be reclassified as exact.

Disposition:

- endpoint full-window condition: **NONESSENTIAL_FOR_SUFFICIENCY CANDIDATE** at the frozen source semantics;
- direction/mover/key provenance: **LOAD_BEARING**;
- performance value / useful producer population: **QU**.

This lead is separate from the later CPC ablations.

---

# 7. Exact-source DP 0.8 reclassification — orientation fusion

At the qualified source revision, reflection commutes with set removal/cofactor structure and preserves subset order.

When child support **strictly** determines reflected canonical orientation before coordinate materialization, the intermediate parent-orientation coordinate may be bypassable:

```text
cofactor
    -> parent-orientation materialization
    -> reflection copy

can potentially become

cofactor directly into selected reflected orientation
```

for the strictly selected branch.

But support-symmetric ties still require residual comparison and action/orientation transport.

Disposition:

```text
alternative sufficient factorization candidate
with explicit symmetric-tie residual
```

not a qualified implementation optimization.

---

# 8. Valuation — total process cycles

Valuation is applied only after the scoped sufficiency cases above.

## 8.1 Full CPC vs no-predictive-draw

Pinned profile:

- Intel i5-12600K / Windows;
- Node 26.7.0 / V8 14.6.202.34-node.28;
- four Lazy SMP workers;
- input `45461667`;
- mask 7;
- 65,536 local/shared entries.

Total-process-cycle result:

```text
initial:
    -3.093%
    interval [-5.776%, -0.410%]

confirmation:
    -3.768%
    interval [-7.333%, -0.202%]
```

All eight paired confirmation/initial blocks favored the candidate on total cycles.

**Valuation disposition:** no-predictive-draw is favored over full CPC for total cycles on this pinned profile.

Wall-time intervals for these screens cross zero; no elapsed-time ordering is established.

## 8.2 Full CPC vs win-only

```text
win-only:
    +45.46% total process cycles
    interval [39.29%, 51.62%]
```

The sampled result stayed exact, but the candidate caused much more search.

**Valuation disposition:** win-only is rejected under the pinned total-cycle objective.

## 8.3 No-draw vs CPC-owned transition-win removal

Confirmation:

```text
-1.825% total process cycles
interval [-2.867%, -0.784%]
```

**Valuation disposition:** guarded duplicate-check removal is favored over the no-draw control on this pinned confirmation profile; broader qualification remains pending.

No compound percentage versus full CPC is inferred from chaining separate experiments.

---

# 9. Why support size / visit count is not a valuation proxy

The measurements supply two opposite examples.

## No-draw candidate

Diagnostic:

- about 2.2% **more** visits;
- about 7.5% **fewer** total cycles per visit;
- lower whole-operation total cycles.

So:

```text
more search work
    can coexist with
lower total cost
```

## Win-only candidate

Diagnostic:

- about 85.5% **more** visits;
- about 19.8% **fewer** cycles per visit;
- much higher whole-operation total cycles.

So:

```text
cheaper visit
    !=
cheaper solve
```

These are direct falsifiers for any DP policy that equates:

- fewer predicates;
- fewer transitions;
- fewer cycles/visit;
- or more visits/second

with better whole-operation valuation.

---

# 10. New valuation lead — split the predictive family

The successful no-draw experiment removes two logically distinct subfamilies together:

1. initial residual-exhaustion/no-win bounds;
2. long-range response no-win bounds.

The combined result proves neither subfamily’s individual economic effect.

Possible relationships include:

- both individually costly;
- one useful and one costly;
- interaction where the pair differs from the sum of individual effects.

Therefore the next clean valuation experiment is a factorial/single-ablation split:

```text
full CPC
vs
remove exhaustion only
vs
remove response bounds only
vs
remove both
```

with unchanged whole-operation cycle measurement and correctness controls.

**Disposition:** high-value experiment lead; no direction is predicted.

---

# 11. Candidate support frontier

For the tested workload, current evidence contains at least these distinct support configurations:

```text
FULL CPC
    exact sampled result

NO-PREDICTIVE-DRAW
    exact sampled result
    lower total cycles than FULL on pinned profile

WIN-ONLY
    exact sampled result
    much higher total cycles than FULL on pinned profile

NO-PREDICTIVE-DRAW + GUARDED TRANSITION-WIN REMOVAL
    exact sampled result
    lower total cycles than NO-PREDICTIVE-DRAW on pinned confirmation
```

This is a measured local support/valuation frontier, not a globally ordered solver design space.

No minimum support set is claimed because:

- the ablation candidate space is not exhausted;
- many interactions remain untested;
- correctness qualification is not global for all candidates;
- valuation is workload/host-specific.

---

# 12. QU / DTS / NEI

- **QU:** individual valuation of the two predictive-bound subfamilies; broader workload correctness; C1/C2/C3 economics; later-revision transfer of old exact-source findings; global support minimum.
- **DTS:** load-bearing for the CPC-owned immediate-win result because proof availability differs by occurrence/path; also load-bearing for mover/key orientation in endpoint publication and reflection fusion.
- **NEI:** no new identity claim is required. `q_r` equality remains owned by game-theory authority and used only at its exact cache/value scope.
- **Valuation:** total process cycles only where measured; wall time kept separate.

---

# 13. Disposition

DP 0.8 confirms and sharpens several different kinds of nonessential support:

1. **family-level correctness support:** predictive CPC no-win bounds can be bypassed by exact fallback in the tested composition;
2. **occurrence-level redundancy:** transition win checks after CPC has already proved no immediate win;
3. **algebraic repetition:** closure expansion after membership already certifies the principal upset;
4. **proof-condition substitution:** endpoint exactness can replace full-window exactness for extreme W/D/L bounds;
5. **representation factorization:** direct selected-orientation cofactor construction is a guarded alternative to materialize-then-reflect.

Most importantly, valuation changes the interpretation:

```text
nonessential for correctness
    !=
desirable to remove
```

The no-draw candidate improved total cycles; the much smaller win-only support regressed them dramatically.

Qualified hot-loop 0.3 remains unchanged.
