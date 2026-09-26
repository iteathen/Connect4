# Lazy SMP DTS 0.1 — Exact Route-6 A/B Execution Checkpoint 0.7

**Date:** 2026-09-25  
**Status:** A/B LAUNCHED  
**Authority effect:** none

## Position

`13333111444444`

The diagnostic baseline completed exactly at +1 / witness 2 in about 5.1 seconds and observed three route-6 direct-map displacements.

## Transport

Connect4 candidate experiment head:

`331df4f184b1996f3d6a93070adbb7c3dfdc2540`

Workflow:

`IsoMax CPC Route6 Exact A-B`

Baseline:

`04d37498607ace16dae33c79462ddfe1503c8a0d`

Candidate:

`05a699b575e15d4039d835af61aa5c35b00822e1`

Qualification shape:

- exactly 4 workers;
- mask 7;
- B/C/C/B repeated three times;
- 30-second ceiling;
- expected root WDL +1;
- exact completion cost, CPU, process cycles, winner nodes, shared hits/stores;
- exact witness/cleanup preserved.

## Recovery seam

Consume the newest workflow run for head `331df4f1...`. Reject any sample that is not exact +1, clean teardown, or four-worker exit. Compare six samples per side. This is the first clean completion-cost control known to exercise the protected route class.
