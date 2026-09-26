# Lazy SMP DTS 0.1 — Route-8 Exact Continuation Scan Result 0.6

**Date:** 2026-09-25  
**Status:** COMPLETE  
**Authority effect:** none  
**Solver-method effect:** none

## Exact anchors

- measurement JSMinSys: `0bb979c61c012290fdbd4d69dd845f4896f70877`
- Connect4 measurement head: `108df23541c5f3b7544e4d2b5983f45999536a88`
- workflow: `IsoMax Route8 Exact Continuation Scan`
- run: `36203670826`
- job: `108295489541`
- workers: exactly 4
- shared mask: 7
- timeout: 8 s

## Result

The route-8 seed produced several bounded exact positions that retain long-range-response displacement.

Strong controls:

| position | exact result | wall | route8 stores | route8 hits | route8 displaced | main displacer |
|---|---|---:|---:|---:|---:|---|
| `13333111271421` | +1 / move 2 | 2851 ms | 30 | 19,536 | **25** | route 5 (25) |
| `13333111271415` | -1 / move 5 | 3125 ms | 10 | 8,750 | **5** | route 3 (5) |
| `13333111271431` | +1 / move 3 | 3258 ms | 10 | 57,642 | 1 | route 3 |
| `13333111271452` | +1 / move 2 | 6507 ms | 6 | 46,261 | 1 | route 3 |

The strongest target is `13333111271421`: under the diagnostic baseline, 25 of 30 committed route-8 publications were later displaced, all by incoming stacked-threat route 5.

That is a direct exercise of the frozen candidate rule:

```text
existing route 8
incoming route 5
-> retain existing route 8
```

## Decision

Run clean same-runner completion-cost A/B on at least:

1. `13333111271421` — primary route-8 stress control, expected +1 / witness 2;
2. `13333111271415` — independent route-8 control, expected -1 / witness 5.

Keep `13333111444444` as the route-6 control already running.

This gives exact terminal comparisons for both protected route families and avoids relying on fixed-duration unresolved CPU occupancy.
