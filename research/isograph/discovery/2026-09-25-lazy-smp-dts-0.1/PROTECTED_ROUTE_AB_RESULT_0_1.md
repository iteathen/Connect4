# Lazy SMP DTS 0.1 — Protected Route A/B Result 0.1

**Date:** 2026-09-25  
**Status:** FIRST A/B COMPLETE; confirmation required  
**Authority effect:** none  
**Solver-method effect:** experimental shared-cache policy only

## Exact anchors

- JSMinSys candidate: `05a699b575e15d4039d835af61aa5c35b00822e1`
- JSMinSys PR: #48
- JSMinSys Verify: `36202589179` — PASS
- baseline: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- Connect4 experiment head: `6235ddec15ffbfe40532a8203d4dbca66803dbe5`
- workflow run: `36202656737` — PASS
- workers: exactly 4
- shared mask: 7

Candidate policy:

```text
retain existing route 6/8 shared row
when an occupied-slot incoming store is route 3/4/5
```

Route metadata is packed into unused high bits of the existing atomic value word; exact WDL is returned from the low two bits.

## Correctness

Solved-control B/C/C/B:

- all four samples: EXACT +1;
- witness move: 3;
- oracle matched;
- cleanup true;
- four workers exited.

Hard and empty probes timed out cleanly on both sides as intended.

## Same-runner means

### Solved control 45461667

| metric | baseline | candidate | delta |
|---|---:|---:|---:|
| wall | 1687.589 ms | 1649.106 ms | **-2.28%** |
| CPU | 5999.5 ms | 6015.5 ms | +0.27% |
| process cycles | 15.699 B | 15.376 B | **-2.05%** |
| shared hits | 103,726.5 | 100,025.0 | -3.57% |
| shared stores | 4,586.5 | 4,584.0 | -0.05% |

### Hard 13333111, fixed 15 s

| metric | baseline | candidate | delta |
|---|---:|---:|---:|
| CPU | 58,453.0 ms | 58,383.5 ms | -0.12% |
| process cycles | 151.617 B | 151.893 B | +0.18% |
| shared hits | 1,043,379.5 | 1,049,458.5 | +0.58% |
| shared stores | 34,529.5 | 34,198.5 | **-0.96%** |

### Empty board, fixed 15 s

| metric | baseline | candidate | delta |
|---|---:|---:|---:|
| CPU | 58,602.5 ms | 58,648.0 ms | +0.08% |
| process cycles | 151.996 B | 152.249 B | +0.17% |
| shared hits | 917,821.0 | 955,599.5 | **+4.12%** |
| shared stores | 13,889.5 | 13,787.0 | -0.74% |

## Interpretation

The mechanism is active and changes shared-cache economics in the intended direction on the unresolved workloads:

- hard: fewer shared stores and slightly more hits;
- empty: fewer shared stores and materially more hits.

The fixed-time CPU/cycle deltas on hard/empty are approximately neutral (+/-0.2%), while the solved control shows a favorable process-cycle signal but mixed CPU accounting.

This is not enough evidence for promotion or rejection. The candidate is much closer to neutral than the previously rejected broad rank-sharing policies, and the empty-board hit increase is structurally consistent with preserving high-reuse rows.

## Disposition

```text
correctness: PASS
mechanism activation: SUPPORTED
performance: PROVISIONAL / CONFIRM
promotion: NOT YET
rejection: NOT YET
```

Repeat the exact same-runner B/C/C/B matrix once before changing the mechanism. If the confirmation remains neutral-to-positive in cycles without a hard-workload regression, proceed to a narrower decision on whether the added route-tagging cost is justified.
