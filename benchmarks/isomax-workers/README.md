# Manager/worker reintegration qualification

Run `node benchmarks/isomax-workers/run.mjs` from a clean committed
`solver/isometric` checkout. Fifteen sequential fresh processes compare serial,
one, two, four and available-minus-one workers (duplicates removed). Three
expensive roots were selected from the prior fixed synthetic corpus before the
worker comparison. Each root starts a fresh session. Total time includes
startup, root WDL/action selection and worker termination. Per-root bound is
30 seconds; the enclosing three-root process bound is 120 seconds.

## Corrected comparison

Source `e6335c439deefbef55f58db931d3216157aae371`.
Run `20260919T171106201Z-isomax-workers`.
Node 26.7.0; i5-12600K, 16 available logical CPUs.
All exact values and center-first root moves matched the serial control.

| Execution | Total median ms | Samples ms | Active workers observed |
|---|---:|---|---:|
| Serial native | 2533.32 | 2520.68, 2584.17, 2533.32 | 0 |
| Manager + 1 | 2851.00 | 2822.82, 2851.00, 2860.77 | 1 |
| Manager + 2 | 2571.01 | 2573.32, 2571.01, 2521.07 | 2 |
| Manager + 4 | 2507.33 | 2507.33, 2520.98, 2458.23 | 4 |
| Manager + 15 | 8143.46 | 8143.46, 7879.05, 8382.29 | 15 |

Four-worker time is effectively near serial with overlapping ranges; do not
claim broad speedup from a 1.03% median difference on three selected roots.
One worker has roughly 0.023% more calls than serial after continuation repair,
but startup/scheduling still costs time. Four workers make about 7.5M calls
versus serial 2.64M; fifteen make about 22M. Private recursive caches and
speculative independent proof work limit scaling. The measured four-worker
default retains actual multicore execution without choosing the observed
fifteen-worker regression. Explicit wider pools remain available.

All samples, exact decisions, cleanup, counts and memory are in
`qualified-results.json`. RSS includes runtime/imports and previous roots
inside each process; maximum observed RSS was about 398 MB at four workers,
900 MB at fifteen. These measurements do not assess GPU/BSFP contention.

## Rejected first integration

Source `04903d2d`, run `20260919T170549675Z-isomax-workers`, retained in
`rejected-initial.json`. One worker took 15.66 s versus 2.52 s serial.
Yielding discarded the unfinished dependency path, and small identical
per-worker retention caps repeatedly discarded exact cached values.

The repair transmits the unfinished native path with already proved sibling
values, keeps unknown distinct from WDL, and divides a session retention
allowance across workers. It also keeps unsent ready work in the manager and
limits submitted tasks to worker count. A regression test checks that the
one-worker continuation path stays within 1% of serial proof calls on the
stress root. Original failed evidence remains unchanged.

This comparison proves operational reintegration and exposes scaling limits.
It does not prove full-core efficiency or an empty-board solve. No timeout
was extended and no GPU path changed.
