# Branch Manager optimization checkpoint — TT contention retry

Date: 2026-09-23

JSMinSys revision:
`b9df5a54d73f9f372607b2e73d2e113a31934f44`

Connect4 scaling run:
`35936006863`

Control immediately before this experiment:
`35935640694` (fresh-surplus tail inspection).

Experiment:
- distinguish TT lock contention from true idle;
- immediately retry contention instead of entering the 1 ms idle park;
- use load-first TT lock claim to avoid failed compare-exchange RMW traffic.

Result on official first Fhourstones input `45461667`, 65,536 TT rows:

| Workers | Tail-first control | Contention-retry experiment |
|---:|---|---|
| 1 | TIMEOUT 30.0 s; 11,104 evals; TT 8,519 | CAPACITY 0.757 s; 51,664 evals; TT 65,536 |
| 2 | CAPACITY 24.67 s; 98,726 evals | CAPACITY 0.702 s; 66,881 evals |
| 4 | CAPACITY 0.971 s; 119,602 evals | CAPACITY 1.125 s; 134,781 evals |

Interpretation:

The change successfully removed the worker-side throughput throttle, but it
overwhelmed manager dedupe/cleanup immediately. The prior 1 ms park was masking,
not causing, the dominant architecture wall. The Branch Manager cannot currently
inspect/merge/reclaim surplus at the rate workers can produce it.

This experiment is rejected for the current manager implementation and should be
reverted. Do not increase worker publication rate again until manager throughput
and lock residency are improved enough to keep TT occupancy bounded.

Next target:
- Branch Manager maintenance throughput;
- avoid repeated/scattered duplicate scans;
- reduce manager transaction work per useful merge;
- increase reclaim/merge rate without moving dedupe into workers;
- retain true-idle parking until manager capacity is sufficient.
