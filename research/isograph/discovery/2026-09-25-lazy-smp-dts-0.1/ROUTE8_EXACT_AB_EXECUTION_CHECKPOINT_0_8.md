# Lazy SMP DTS 0.1 — Exact Route-8 A/B Execution Checkpoint 0.8

**Date:** 2026-09-25  
**Status:** A/B LAUNCHED  
**Authority effect:** none

## Exact controls

Primary:

`13333111271421`

Diagnostic baseline:

```text
EXACT +1 / witness 2
route8 stores      30
route8 displaced   25
displacer           route5 for all 25
diagnostic wall    ~2.85 s
```

Independent:

`13333111271415`

Diagnostic baseline:

```text
EXACT -1 / witness 5
route8 stores      10
route8 displaced    5
displacer           route3 for all 5
diagnostic wall    ~3.12 s
```

## Transport

Connect4 candidate experiment head:

`0e1fe8d6ea9dea3fe93ab4ac8b2cf7f9566e976e`

Workflow:

`IsoMax CPC Route8 Exact A-B`

Two same-runner matrix jobs, one per exact control. Each runs B/C/C/B repeated three times: six baseline and six candidate samples.

Baseline:

`04d37498607ace16dae33c79462ddfe1503c8a0d`

Candidate:

`05a699b575e15d4039d835af61aa5c35b00822e1`

## Recovery seam

For each matrix job:

- require exact expected WDL, expected witness stability, cleanup, and four worker exits;
- compare wall, CPU, process cycles, winner nodes, local/shared hits and shared stores;
- keep the two positions separate before any pooled interpretation.

These are the first clean completion-cost controls with direct evidence that the candidate's protected route-8 replacement rule would fire.
