# Lazy SMP DTS 0.1 — Route-8-Only Candidate Plan 0.9

**Date:** 2026-09-25  
**Status:** CHECKPOINTED BEFORE IMPLEMENTATION  
**Authority effect:** none  
**Solver-method effect:** none

## Evidence entering this refinement

The broad v1 protected-residency rule is rejected globally:

```text
protect existing route 6 or route 8
against incoming route 3/4/5
```

Exact controls:

- route-6 control `13333111444444`: process cycles +0.46%, CPU +0.76%;
- high-displacement route-8 control `13333111271421`: process cycles -1.10%, CPU -0.83%;
- lower-displacement route-8 control `13333111271415`: process cycles +0.92%, CPU +1.07%.

The sign tracks the density of valuable protected displacement, not game value or winner-node topology.

## Controlled v2 question

Before redesigning route signaling, isolate one semantic change:

> is route 6 protection itself harmful enough that a route-8-only policy improves the candidate?

v2 changes only:

```text
v1: protect displaced route in {6,8}
v2: protect displaced route == 8
```

Keep:

- the same packed value-word route metadata;
- the same producer route tagging;
- the same incoming route set {3,4,5};
- the same mask-7 sharing;
- the same q_r full-key identity;
- the same cycle-accounted implementation shape.

This is intentionally a minimal differential experiment. Do not combine it yet with a new route signaling representation.

## Falsifier

Reject v2 if route-8 exact controls remain net negative/neutral enough that the benefit does not exceed recurring route-tagging cost, or if the route-6 control still regresses similarly despite no route-6 protection.

If v2 preserves the high-displacement route-8 benefit and removes the route-6 penalty, then optimize the route-8 signal representation in a separate pass.
