# Recovery checkpoint — residual-superdomain / boundary-realizability seam

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Recovered live head before this checkpoint:** `1504fd7dd5ddf940c04e351ec67e0a53d0d9c6a5`
**Status:** recovery checkpoint; several numerical observations below were produced in the interrupted live research session and still require durable rerun artifacts
**Authority effect:** none
**Research direction:** Josh Oshiro

## Why this checkpoint exists

The interactive research session has disconnected repeatedly. This file is a breadcrumb for exact continuation. It is not semantic authority and does not promote any claim or relation.

Resume from this file before repeating older q/frontier work.

## Established repository context at recovery

- frozen Connect4 IsoGraph authority 1.1 remains immutable;
- post-1.1 overlay keeps C4-R0075/C4-R0076 as successor claims;
- unproved cross-claim correspondences remain claim metadata, not native IsoGraph edges;
- `next_step.yaml` routes to the compact clause-to-value controllable-predecessor seam.

## Last durable result before the interrupted session

At standard-7x6 rank 35, distributed universal clause/proof composition encounters pathological products such as:

```text
support [5,5,5,2,6,6,6]
move widths 74,170,210,217
naive product 573,270,600

support [5,5,2,5,6,6,6]
move widths 43,89,119,129
naive product 58,748,277
```

The wall is confirmed as a scoped representation/composition wall before semantic collapse. A compact exact clause->value predecessor remains missing.

## Interrupted-session work recovered

### Negative route 1 — owner-bit ROBDD

A direct exact ROBDD over the occupied owner bits did not become compact enough under the tested default ordering in the bounded run.

Disposition:

```text
exactness: potentially exact
compactness: failed in tested form
use as missing law: REJECTED FOR NOW
```

Do not repeat the same default-order ROBDD experiment without a materially new reason.

### Negative route 2 — propagated exact line-hit/history realizability

A forward exact quotient carrying line-hit/history realizability was tested as a possible guard carrier.

Recovered observation:

```text
first pathological target:
~7.5 million line-hit states by rank 12
```

Disposition: exact realizability as propagated state is still too fine; do not treat it as the desired compact carrier.

### Residual-function superdomain construction

For the first pathological support:

```text
S1 = [5,5,5,2,6,6,6]
unoccupied cells = 7
distinct residual shapes = 16
normalized residual antichains / player = 701
abstract parent residual-pair domain = 491,401
all residual pairs over complete seven-ply future support cone = 804,133
```

For the second:

```text
S2 = [5,5,2,5,6,6,6]
unoccupied cells = 7
distinct residual shapes = 16
normalized residual antichains / player = 704
abstract parent residual-pair domain = 495,616
all residual pairs over complete future support cone = 897,291
```

These are **abstract residual-function superdomains**, not legal-q censuses. Exact cardinality/history realizability has not yet been proved for every pair.

Recovered execution result: direct exact strong-value recurrence over these abstract residual domains completed without materializing the 573M / 58M distributed proof products.

Recovered boundary observation:

```text
largest observed minimal support/action/strong-threshold boundary
across the two pathological targets <= 39 generators
```

This value requires durable rerun/qualification before promotion.

## Current candidate

The working candidate is:

```text
support-local clause/proof input
    ->
exact residual-function superdomain
    ->
direct controller max / opponent min strong-value recurrence
    ->
small support/action/threshold value boundary
    ->
realizability qualification only where it can change that boundary
```

The important distinction is that the residual superdomain is allowed to contain unrealizable states. It may be useful as a conservative exact abstract domain only if unrealizable states cannot change a published value claim for a realizable state, or if a sufficiently small guard removes exactly the dangerous cases.

## Current primary falsifier

Test whether unrealizable abstract residual pairs alter any minimal value-threshold boundary generator or any threshold membership relevant to realizable states.

Outcomes:

1. **No boundary effect, with proof:** candidate compact clause->value law may exist without carrying realizability as propagated state.
2. **Boundary effect but locally guardable:** identify the smallest exact guard and qualify it.
3. **Boundary effect requiring hidden/global information:** stop and identify the exact missing coordinate; do not hide it with recursion or buffers.

## Required next execution

1. Durably reconstruct the residual-superdomain prototype.
2. Rerun both pathological supports and save raw counts/timings/boundaries.
3. Build an independent legal-realizability oracle for only the surviving boundary candidates, not the whole superdomain.
4. Compare abstract vs realizability-filtered threshold boundaries.
5. Run the same method on bounded complete controls where exact physical-state reference is available.
6. Only after exact agreement formulate a theorem/guarded-exact claim.
7. Do not promote any new IsoGraph relation edge unless the relation itself receives deductive or guarded-exact proof.

## Epistemic status

```text
distributed universal wall                     CONFIRMED_SCOPED
residual superdomain dramatically smaller      RECOVERED_OBSERVATION
direct residual strong-value closure            RECOVERED_OBSERVATION
<=39 threshold-generator boundary               RECOVERED_OBSERVATION
realizability can be boundary-only              HYPOTHESIS
compact clause->value law                       MISSING_LAW
empty 7x6 root solved                            NO
authority 1.1 mutated                            NO
```
