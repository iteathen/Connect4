# Lazy SMP DTS 0.1 — Protected Route Overhead Result 0.3

**Date:** 2026-09-25  
**Status:** COMPLETE solved-control overhead census  
**Authority effect:** none  
**Solver-method effect:** experimental shared-cache policy only

## Exact anchors

- baseline JSMinSys: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- protected-route candidate: `05a699b575e15d4039d835af61aa5c35b00822e1`
- JSMinSys PR: #48
- JSMinSys Verify: `36202589179` — PASS
- Connect4 experiment head: `483619d0f9f3ca418afa13538b38b7174a374dea`
- workflow: `IsoMax CPC Route Protect Overhead`
- workflow run: `36203168819`
- job: `108293956201`
- workers: exactly 4
- shared sample mask: 7
- workload: solved control `45461667`

The preceding route-displacement census observed **zero route-6/route-8 displacement on this solved control**, so this workload primarily measures the cost of route tagging, packed-value decode, and the candidate guard without exercising the intended protection benefit.

## Correctness

All 12 samples returned:

```text
status       EXACT
root WDL     +1
witness move 3
oracle       matched
cleanup      true
workers      4 exited
```

## Six samples per side

| metric | baseline mean | candidate mean | delta |
|---|---:|---:|---:|
| wall | 3087.972 ms | 3111.665 ms | +0.77% |
| CPU | 11667.0 ms | 11599.0 ms | -0.58% |
| process cycles | 26.8009 B | 26.5782 B | -0.83% |
| shared hits | 101,341.0 | 99,698.2 | -1.62% |
| shared stores | 4,582.3 | 4,591.8 | +0.21% |

Observed CPU ranges:

```text
baseline   11,594 .. 11,798 ms
candidate  11,391 .. 11,813 ms
```

Observed cycle ranges:

```text
baseline   26.5280 .. 27.0558 B
candidate  26.2414 .. 26.8308 B
```

## Interpretation

No measurable CPU/cycle overhead penalty is established by the pure-overhead control.

The candidate does **not** receive credit for the small favorable mean CPU/cycle deltas because no protected displacement benefit was present in this control and Lazy-SMP winner/search races can alter total work.

Wall time is likewise not promoted as a regression from the +0.77% mean because the sample range remains noisy.

The useful conclusion is narrower:

> packing the CPC route into the existing shared value word and checking the protection predicate does not expose a large recurring cost on the solved control.

## Remaining qualification problem

The candidate's intended benefit occurs on unresolved workloads where the route-displacement census observed route-6/8 eviction. Fixed-duration hard probes do not currently expose a stable progress-normalized metric: CPU availability varied materially between nominally identical baseline samples.

Therefore:

```text
correctness                     PASS
pure-overhead falsifier          NOT TRIGGERED
protected-residency mechanism    SUPPORTED
net hard-workload benefit        OPEN
promotion                        NOT YET
rejection                        NOT YET
```

The next experiment should measure search progress on an unresolved workload under comparable CPU/cycle expenditure, or find a bounded exact workload that exercises protected displacement and reaches a terminal result.
