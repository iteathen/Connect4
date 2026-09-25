# Lazy SMP DTS 0.1 — Pre-Publication Overlap Census 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE first overlap census  
**Authority effect:** none  
**Solver-method effect:** none  
**DTS campaign:** `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/`

## Exact anchors

- IsoGraph qualified integrated stack: `iteathen/IsoGraph@419f3d13ab5480d72fcd78f51502e5928bf5280f`
- JSMinSys production baseline: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- measurement JSMinSys head: `dd343f3edd7e83c18f87741da53ca8e0eac9bde7`
- measurement PR: JSMinSys #47
- JSMinSys Verify run: `36200737547` — PASS
- Connect4 measurement head: `292a342129aa751bf064f9ac5cae1a0e1501bb99`
- overlap census run: `36200817878` — PASS
- workers: exactly 4
- production shared mask: 7
- overlap trace: deterministic 1/256 full-q_r-key sample, 32,768 records per worker
- trace identity: full qualified q_r key words; hash/slot equality is not used as identity authority

## What was measured

For each sampled CPC-only search-state occurrence after a local/shared exact-cache miss, the measurement records:

```text
full q_r key
worker occurrence
start/end wall-clock time
alpha/beta window
depth
node counter delta
cofactor counter delta
exit/transition kind
```

The interval ends on the q_r occurrence's return or on an in-loop forced transition to the next q_r state.

Cross-worker duplicate resolution is established only when intervals for the same full q_r key overlap in wall-clock time.

The instrumentation is measurement-only and changes runtime timing. Therefore the census establishes structure and gives a first magnitude estimate; it is not a production performance ratio.

## Observations

### Solved control `45461667`

Three runs:

| run | sampled occurrences | sampled keys | keys seen by 2+ workers | temporally overlapping keys | overlap pairs | max sampled inclusive nodes |
|---|---:|---:|---:|---:|---:|---:|
| A | 7,443 | 345 | 143 | 4 | 19 | 378 |
| B | 7,523 | 345 | 143 | 4 | 6 | 496 |
| C | 7,414 | 345 | 143 | 7 | 15 | 375 |

All three remained exact `+1`, witness move 3, clean teardown, four workers exited.

Observed overlap was sparse relative to cross-worker repeated-key incidence, but it was not uniformly cheap. Individual overlapped occurrences reached roughly 375-496 inclusive nodes/cofactors.

No overlapped solved-control key in this deterministic sample showed multiple alpha/beta window classes.

### Hard unresolved probe `13333111`

```text
sampled occurrences:       52,987
sampled keys:               2,260
cross-worker keys:            328
overlap keys:                    3
overlap pairs:                  16
max distinct workers:            2
window-variant overlap keys:     1
max inclusive nodes:           347
```

The run timed out cleanly at 15 s as intended.

One sampled q_r key was observed under both `[-1,0]` and `[-1,1]` consumer windows.

### Empty-board unresolved probe

```text
sampled occurrences:       39,997
sampled keys:               1,162
cross-worker keys:            446
overlap keys:                   14
overlap pairs:                  84
max distinct workers:            2
window-variant overlap keys:     9
max inclusive nodes:         1,599
next high sampled occurrence:  771
```

The run timed out cleanly at 15 s as intended.

The overlapping sample includes q_r keys consumed under multiple windows, including `[-1,0]`, `[0,1]`, and `[-1,1]`.

## DTS interpretation

### Result R1 — pre-publication duplicate resolution exists

The previously invisible class is real:

```text
worker A resolving q_r
overlaps in time with
worker B resolving the same full q_r
before either occurrence is eliminated by an exact cache hit
```

Therefore raw shared-hit telemetry is not complete telemetry for cross-worker duplicated search work.

**Discovery disposition:** STRUCTURE_ESTABLISHED.

### Result R2 — overlap is sparse in the first deterministic sample, but has a heavy tail

Most sampled cross-worker repeated q_r keys were not simultaneously active. For example, solved runs had 143 sampled keys seen by multiple workers but only 4-7 with temporal overlap.

However, overlap cost was heterogeneous. Rare sampled events reached hundreds to more than one thousand inclusive descendant nodes/cofactors.

This rejects both overstatements:

```text
"duplicate overlap is everywhere"       — not supported
"duplicate overlap is always trivial"   — falsified by observed outliers
```

Prevalence outside the deterministic sample remains an empirical question.

### Result R3 — same q_r does not imply same process context

Hard/empty probes directly observed temporally overlapping occurrences of the same qualified q_r key under different alpha/beta windows.

Thus:

```text
same q_r scalar-value class
    != same search-window occurrence
    != same resolution transition
```

This confirms DTS-LSMP-H1's structural premise.

No NEI conclusion is required or implied.

### Result R4 — repeated-key incidence is much larger than simultaneous overlap

Some sampled keys recur hundreds or thousands of times across workers while only a small number of their occurrences overlap.

This means at least three distinct quantities must remain separate:

```text
cross-worker repeated q_r occurrence
temporal duplicate resolution
committed shared exact hit
```

They cannot be substituted for one another as leverage metrics.

The large sequential recurrence is especially relevant to the next provenance/window experiment because narrow-window returns need not publish global exact q truth.

## QU refinement

### `QU-DTS-LSMP-03-inflight-overlap`

Refined from OPEN to:

```text
existence: ESTABLISHED
first-sample prevalence: SPARSE / workload-dependent
cost distribution: heterogeneous with material outliers
global prevalence and profitable intervention rule: OPEN
```

### `QU-DTS-LSMP-04-consumer-context`

Refined:

```text
same q_r under different alpha/beta windows: ESTABLISHED
effect of window class on avoided work: OPEN
```

### Still open

- exact-result provenance among repeated/published/consumed states;
- whether expensive overlap is predictable cheaply before resolution;
- whether a narrow intervention can beat the coordination cost;
- whether static or dynamic diversity is useful specifically on expensive overlap.

## Decision

Do **not** implement in-flight ownership or duplicate suppression yet.

The overlap census found enough real structure to continue, but not enough prevalence evidence to justify synchronization machinery.

The next experiment remains the low-risk DTS lead:

> classify exact publications and consumed shared hits by producer resolution provenance, then determine whether cheap and expensive exact-result transitions are being treated identically by the current shared boundary.

This preserves the project's lazy/minimality doctrine: measure the distinction before adding a mechanism.
