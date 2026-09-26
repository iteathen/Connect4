# Lazy SMP DTS 0.1 — Bounded Exact Route Scan Result 0.5

**Date:** 2026-09-25  
**Status:** COMPLETE first bounded exact scan  
**Authority effect:** none  
**Solver-method effect:** none

## Exact anchors

- measurement JSMinSys: `0bb979c61c012290fdbd4d69dd845f4896f70877`
- Connect4 measurement head: `299cf46239442150e3761a19446dc30ec47f64c8`
- workflow: `IsoMax Bounded CPC Route Scan`
- run: `36203517956`
- job: `108295015871`
- workers: 4
- shared mask: 7
- timeout: 8 s per position

## Result

The scan found exact positions that exercise route-6 displacement, but no exact position in this first corpus exercised route-8 displacement.

Selected exact controls:

| position | ply | exact | wall | route6 stores | route6 displaced | route8 stores | route8 displaced |
|---|---:|---|---:|---:|---:|---:|---:|
| `13333111444444` | 14 | +1 / move 2 | 5139 ms | 60 | 3 | 0 | 0 |
| `13333111345417` | 14 | +1 / move 3 | 1949 ms | 26 | 3 | 4 | 0 |
| `1333311146431755` | 16 | +1 / move 3 | 1245 ms | 36 | 5 | 3 | 0 |

The first position is the strongest clean route-6 completion-cost control because it runs for about five seconds under the diagnostic build and has confirmed protected-class displacement.

## Route-8 lead

The 12-ply unresolved position:

`133331112714`

timed out at 8 s but showed:

```text
route6 displaced: 13
route8 displaced: 10
route8 stores:     16
route8 hits:       74,612
route8 displacers:
    route3: 1
    route5: 9
```

This is the strongest current route-8 displacement seed.

## Decision

1. Keep `13333111444444` as a clean exact route-6 A/B position.
2. Search legal 14-ply continuations of `133331112714` for a bounded exact position that retains route-8 displacement.
3. If one exists, use it as the primary clean completion-cost falsifier for the protected-route candidate.

The scan does not change the frozen candidate policy.
