# UC4A latent-structure tomography View-1 +2 trajectory correction 0.1

**Date:** 2026-10-01  
**Status:** frozen execution-correctness correction before rerun  
**Branch:** `research/universal-structural-policy-20260930`

## Trigger

The first completed Phase-B evidence reported:

```text
view1.counts.sameParityByTwo = 0
```

This is not a structural result. It is an implementation coverage defect.

The frozen experiment design explicitly requires special attention to same-parity width/height changes by two. The implementation built View-1 trajectory edges only between consecutive available boards and then filtered those edges for `step === 2`. Because the 52-board cohort contains dense strips with intermediate dimensions present, a valid pair such as `8x6 -> 10x6` was never emitted: it was represented only as `8x6 -> 9x6 -> 10x6`.

## Correction

Preserve all existing consecutive trajectory edges.

Additionally, for each fixed-width strip, emit every available pair `(W,H) -> (W,H+2)`.

For each fixed-height strip, emit every available pair `(W,H) -> (W+2,H)`.

These edges are a separate View-1 diagnostic family. They do not replace unit edges and do not enter the already frozen View-4 unit-edge rank matrices.

## Boundary

No structural field changes.

No W/D/L label changes.

No threshold, feature, rank target, separator, or candidate triangle is introduced.

The correction is required solely to execute the already-frozen `+2` comparison requested by the experiment design. The prior Phase-B evidence at commit `47690bec3214e67a3dd0e124ff7d3b054649ed7d` remains useful for every unaffected view, but it is superseded as the complete View-1 result.
