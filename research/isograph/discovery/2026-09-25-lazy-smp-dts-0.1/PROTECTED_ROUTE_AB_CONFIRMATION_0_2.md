# Lazy SMP DTS 0.1 — Protected Route A/B Confirmation 0.2

**Date:** 2026-09-25  
**Status:** CONFIRMATION RUN COMPLETE; hard fixed-time samples unstable  
**Authority effect:** none

The exact same workflow run `36202656737` was re-run as attempt 2.

## Correctness

All solved-control samples again returned EXACT +1, witness 3, cleanup true, four workers exited.

## Solved control

Second B/C/C/B means:

```text
wall:    -10.41% candidate
CPU:      +1.14%
cycles:   +0.59%
```

The large wall delta is runner/scheduling noise: baseline wall samples were ~2.895 s and ~3.511 s while their CPU/cycles remained close. CPU/cycles are the useful quantities here.

Across the two workflow attempts, the solved-control cycle signal changed from -2.05% to +0.59%. This does not establish a candidate speedup or regression.

## Hard / empty caveat

Attempt-2 fixed-15-second CPU availability was not stable even between the two baseline samples:

```text
hard baseline CPU:  45.5 s vs 57.7 s
empty baseline CPU: 58.0 s vs 39.8 s
```

Process cycles moved correspondingly. Therefore attempt-2 hard/empty B/C/C/B means are not valid candidate speed ratios.

The candidate still changed shared-cache behavior in the expected direction when comparable CPU was available, but fixed-time CPU/cycles cannot separate search progress from runner scheduling here.

## Decision

Do not promote or reject from attempt 2.

The solved control is useful as an **overhead control** because the displacement census observed zero route-6/8 displacement there. Run a larger solved-control-only same-runner sample to estimate pure route-tagging/packed-value overhead. Keep hard/empty as structural/mechanism probes unless a progress-normalized metric is added.
