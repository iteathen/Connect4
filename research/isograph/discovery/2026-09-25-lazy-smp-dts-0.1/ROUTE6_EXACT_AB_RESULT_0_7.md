# Lazy SMP DTS 0.1 — Exact Route-6 A/B Result 0.7

**Date:** 2026-09-25  
**Status:** COMPLETE  
**Authority effect:** none  
**Solver-method effect:** experimental shared-cache policy only

## Exact anchors

- position: `13333111444444`
- diagnostic baseline had observed route-6 displacement: 3
- baseline JSMinSys: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- candidate JSMinSys: `05a699b575e15d4039d835af61aa5c35b00822e1`
- Connect4 experiment head: `331df4f184b1996f3d6a93070adbb7c3dfdc2540`
- workflow: `IsoMax CPC Route6 Exact A-B`
- run: `36203741416`
- job: `108295711335`
- samples: 6 baseline + 6 candidate, B/C/C/B repeated three times

## Correctness

Every sample returned:

```text
status       EXACT
root WDL     +1
witness move 2
oracle       matched
cleanup      true
workers      4 exited
winner nodes 1,972,145
```

The identical winner-node count is useful: this control did not change the winning worker's search-node topology.

## Means

| metric | baseline | candidate | delta |
|---|---:|---:|---:|
| wall | 4914.278 ms | 4944.756 ms | +0.62% |
| CPU | 18966.3 ms | 19109.7 ms | **+0.76%** |
| process cycles | 43.6278 B | 43.8286 B | **+0.46%** |
| winner nodes | 1,972,145 | 1,972,145 | 0.00% |
| shared hits | 243,648 | 241,522 | -0.87% |
| shared stores | 5,099.0 | 5,104.2 | +0.10% |

## Interpretation

On this route-6-only exact control, the protected-route candidate does not produce a measurable search-topology benefit. The small CPU/cycle regression is consistent with paying route-tagging/protection overhead for only a few protected displacement opportunities.

This is a real negative signal, but it does **not** yet reject the candidate globally because the route-displacement campaign found the strongest leverage in route 8, not route 6.

Disposition:

```text
route-6-only exact control:
    correctness PASS
    winner topology unchanged
    performance slightly negative
    no promotion support

global protected-route candidate:
    OPEN pending route-8 exact controls
```

The route-8 exact continuation scan has identified stronger exact controls and should determine the candidate's disposition.
