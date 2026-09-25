# Lazy SMP DTS 0.1 — Protected Route A/B Execution Checkpoint 0.2

**Date:** 2026-09-25  
**Status:** A/B LAUNCHED  
**Authority effect:** none  
**Solver-method effect:** experimental shared-cache policy only

## Candidate

JSMinSys PR #48, head `05a699b575e15d4039d835af61aa5c35b00822e1`.

Policy:

```text
existing committed route in {6 all-lift, 8 long-range response}
incoming route in {3 immediate singleton, 4 multiple opponent threats, 5 stacked threat}
occupied direct-map slot
    -> retain existing row
```

Route metadata is packed into unused high bits of the existing atomic shared value word. Probe returns only low two WDL bits. No separate route array is allocated.

JSMinSys Verify run `36202589179`: PASS.

## Connect4 qualification transport

Experiment branch:

`experiment/isomax-lazy-smp-cpc-route-protect-v1@6235ddec15ffbfe40532a8203d4dbca66803dbe5`

Workflow:

`IsoMax CPC Route Protect A-B`

Planned same-runner comparisons:

- solved control `45461667`: B/C/C/B;
- hard `13333111`: B/C/C/B at 15 s;
- empty board: B/C/C/B at 15 s.

Baseline remains production JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`.

## Recovery seam

On reconnect, inspect the latest workflow run for `experiment/isomax-lazy-smp-cpc-route-protect-v1`. Extract JSON samples grouped by the workflow's baseline/candidate tags, then compute mean wall, CPU and process cycles for each side and workload. Preserve exactness/witness/cleanup checks before judging performance.
