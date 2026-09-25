# Lazy SMP DTS 0.1 — Shared Exact Provenance Census 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE first provenance census  
**Authority effect:** none  
**Solver-method effect:** none

## Exact anchors

- JSMinSys production baseline: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- measurement JSMinSys head: `12d4fd8367f1c9f39b121a28382df3efb94649dc`
- JSMinSys PR: #47
- JSMinSys Verify: `36201178980` — PASS
- Connect4 measurement head: `f6517660e3ec2cc4e566f34d9681b8c8268a0770`
- provenance/overlap run: `36201229199` — PASS
- workers: exactly 4
- production shared mask: 7

The diagnostic sidecar is measurement-only. It writes producer provenance inside the existing shared-slot sequence publication window and attributes a consumed shared hit only after the normal full-key + sequence validation succeeds.

## Provenance classes

```text
0  unclassified / non-CPC-only path
1  CPC_EXACT
2  semantic interval collapse outside CPC_EXACT
3  full-window forced-terminal exact publication
4  recursively resolved full-window exact publication
```

## Result

Across every measured workload, **100% of committed shared stores and 100% of consumed shared hits were provenance class 1: CPC_EXACT.**

### Solved control `45461667`

| sample | shared stores | shared hits | CPC_EXACT stores | CPC_EXACT hits | hits/store |
|---|---:|---:|---:|---:|---:|
| A | 4,579 | 98,574 | 4,579 | 98,574 | 21.53 |
| B | 4,591 | 101,914 | 4,591 | 101,914 | 22.20 |
| C | 4,588 | 103,608 | 4,588 | 103,608 | 22.58 |

All other provenance classes: **0 stores / 0 hits**.

### Hard probe `13333111`

```text
shared stores       22,053
shared hits        425,802
CPC_EXACT stores    22,053
CPC_EXACT hits     425,802
hits/store           19.31
other provenance         0
```

### Empty board

```text
shared stores       10,427
shared hits        450,707
CPC_EXACT stores    10,427
CPC_EXACT hits     450,707
hits/store           43.22
other provenance         0
```

## DTS interpretation

### Result P1 — current shared exact cache is empirically a cross-worker CPC-exact memoizer

For the tested production CPC-only Lazy-SMP workloads, the shared boundary is not transporting a mixture of cheap and recursively expensive exact results.

Observed transition shape:

```text
worker A:
    local/shared miss
    -> CPC evaluation
    -> CPC_EXACT
    -> exact local store
    -> optional shared publish

worker B:
    local miss
    -> shared exact hit
    -> return
```

The shared hit therefore primarily avoids repeating the CPC exact-resolution transition.

This is narrower than the previous working model of a general exact-result shared cache.

**Discovery disposition:** STRUCTURE_ESTABLISHED for the exercised workloads.

### Result P2 — first provenance-selective publication hypothesis is falsified

The candidate distinction:

```text
cheap CPC exact publication
versus
expensive recursively resolved exact publication
```

does not currently coexist at the measured shared boundary.

There are no measured class-4 shared publications to preferentially retain.

Therefore the first form of `L-DTS-01` is **FALSIFIED / NOT APPLICABLE** to current production behavior.

This is a useful negative result: do not add provenance metadata or policy to production merely to distinguish classes that are not present.

### Result P3 — CPC-before-shared probing is structurally disfavored on the measured domain

Current order:

```text
local miss
-> shared probe
-> CPC
```

Every measured successful shared hit resolves to a fact originally produced by `CPC_EXACT`.

For the same qualified q_r state, CPC semantics are deterministic. Therefore moving CPC before the shared probe would recompute the exact transition that the shared hit currently avoids.

On the exercised workloads, after CPC returns unresolved there is no observed non-CPC shared-result population to recover.

Thus the specific candidate:

```text
local -> CPC -> shared -> recursion
```

loses the observed benefit mechanism and has no measured compensating shared-result class.

**Disposition:** reject as the next optimization candidate for the exercised domain. A later solver revision that begins sharing non-CPC exact results would require re-evaluation.

### Result P4 — the leverage problem moves inside CPC_EXACT

The remaining sharing question is no longer:

> which exact-result provenance class should be shared?

It is:

> which CPC_EXACT facts are expensive enough to recompute, and/or reused often enough across workers, to justify shared publication/probing?

The measured reuse is substantial:

```text
solved control  ~21.5-22.6 consumed hits per committed store
hard probe      ~19.3
empty board     ~43.2
```

These ratios are not unique-key fanout because direct-map replacement and repeated publication are present, but they establish heavy reuse of the currently selected CPC-exact population.

## QU refinement

### `QU-DTS-LSMP-01-resolution-provenance`

For the exercised workloads:

```text
shared producer provenance = CPC_EXACT only
shared consumer-hit provenance = CPC_EXACT only
```

The cross-class provenance uncertainty is closed for this revision/workload set.

A new nested unknown remains:

```text
QU-DTS-LSMP-06
    internal CPC_EXACT resolution cost / structure / reuse leverage
```

### `QU-DTS-LSMP-05-asymmetric-gating`

Still OPEN, but its useful form changes.

Do not gate by broad exact-result provenance. Investigate a cheap pre-CPC structural signal that predicts:

```text
expected CPC evaluation cost saved
*
expected cross-worker reuse
-
shared probe/store cost
```

## Next lead

Instrument CPC_EXACT itself, preserving its internal transition/decomposition structure without changing solver behavior.

The next census should answer:

1. Which CPC_EXACT closure routes produce shared stores?
2. Which of those routes dominate consumed shared hits?
3. What deterministic state features available **before CPC execution** correlate with high CPC work and high reuse?
4. Can those features be computed from already-present q_r/key/profile data without adding material hot-loop cost?

Do not change sharing policy until that decomposition is measured.
