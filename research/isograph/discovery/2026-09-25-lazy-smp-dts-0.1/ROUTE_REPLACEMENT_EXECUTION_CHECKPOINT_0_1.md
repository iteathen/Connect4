# Lazy SMP DTS 0.1 — Route Replacement Matrix Execution Checkpoint 0.1

**Date:** 2026-09-25  
**Status:** RUNNING  
**Authority effect:** none  
**Solver-method effect:** none

## Implementation checkpoint

Measurement-only route displacement instrumentation is now staged.

Exact heads:

- JSMinSys measurement branch: `0bb979c61c012290fdbd4d69dd845f4896f70877`
  - full-key same-key refresh versus different-key collision split;
  - 12 x 12 incoming-route x displaced-route matrix;
  - cycle ledger updated in the same work;
  - Verify run `36202180202`: PASS.
- Connect4 measurement branch: `6242c5dafc9ee355a3645ef56f57b4ab5c01a332`
  - benchmark summarizes matrix totals, per-route incoming/displaced collision counts and top collision pairs;
  - workflow pinned to the exact JSMinSys measurement head.

The instrumentation remains diagnostic-only and does not change search semantics or production sharing policy.

## Recovery seam

On reconnect, inspect the latest `IsoMax Lazy SMP DTS Overlap Census` run for Connect4 branch `experiment/isomax-lazy-smp-dts-overlap-v1` at or after head `6242c5d`.

If the run passes, extract the route replacement matrix from each workload and answer:

1. Are long-range-response rows materially displaced by lower-reuse routes?
2. Are all-lift rows materially displaced?
3. Which incoming routes dominate those displacements?
4. What fraction of occupied-slot stores are same-key refresh versus different-key collision?
5. Is the asymmetry large enough to justify one minimal producer-side replacement/admission A/B?

Do not implement route-aware replacement before this evidence is consumed.
