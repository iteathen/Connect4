# Empty-board five-minute memory comparison

Exactly two sequential samples as requested: baseline first, large second.
No warm-up, retry, intermediate capacity test or solver change.
Four workers; same mask 7, CPC and original move ordering.
JSMinSys ec6a602268e5dd281db9cb29b2f4defd47c6d325;
Connect4 harness 53b3fe70 (full SHA and source hashes in manifest.json).
Node26.7.0, Windows, Intel i5-12600K.

| Metric | Baseline | Larger memory |
|---|---:|---:|
| Shared entries | 65,536 | 1,048,576 |
| Private entries per worker | 65,536 | 1,048,576 |
| Total cache backing bytes | 20185100 | 322961420 |
| Elapsed seconds | 300.011 | 300.030 |
| Outcome | CLEAN TIMEOUT | CLEAN TIMEOUT |
| rootWdl | not produced | not produced |
| All-worker node visits | 1807178882 | 1884704714 |
| Visits/second | 6023703 | 6281720 |
| CPU cycles/visit | 2434.72 | 2329.93 |
| All-thread CPU cycles | 4399968082219 | 4391230579366 |
| Sampled peak RSS MiB | 150.76 | 430.12 |
| Shared exact hits | 28812052 | 24649042 |
| Shared exact stores | 271459 | 173079 |
| Shared store contention | 0 | 0 |
| Workers exited / cleanup | 4 / true | 4 / true |

Larger memory: visits/sec 4.28%, cycles/visit
-4.30%, total CPU cycles -0.20%.
Both ran for the fixed duration, so total cycles are not cycles-to-solve.

## Interpretation

A modest throughput difference was observed with 16x cache capacity, but no solve
or WDL was produced. More node visits do not prove greater proof progress: cache
reuse changes work, and distinct nodes / duplicate states were not counted.
Fewer shared hits likewise do not prove poorer total reuse; private hits are not
aggregated in these diagnostic samples. No causal attribution to shared versus
private capacity is possible because both changed together.

Only one observation per arm, fixed order, no confidence interval or significance
claim. Scheduling, JIT and thermal/order effects are not eliminated. Both use the
same all-worker counter loader, which can affect generated code; do not compare
these figures directly to uninstrumented screens or Fhourstones node counts.
The previous one-second position screen and this empty-board probe measure
different workloads. No production default or dependency pin changed.

## Capture / limits

Each solver deadline was 300,000 ms per explicit owner instruction. Normal
application solve7x6 retains its 120-second ceiling. JSMinSys and BSFP unchanged.
Runtime errorCode 102 is the configured deadline, with errors=[] and no WDL.
Each counter sum equals totalNodes; each bootstrap+setup+solve sum equals total
process CPU cycles. Counts include unfinished work from every worker after join.
RSS is process-wide, sampled every 30 seconds; reported high-water is a lower
bound on exact peak. Progress logs and raw stdout are retained even on failure.
Caches use about 19.25 versus 308 MiB of backing storage; RSS includes runtime
and other working memory. Final RSS after worker shutdown is not peak usage.

Harness unit/integration validation: 15/15 tests passed before these runs.
Reproduce using run-empty-five-minute.mjs in the parent directory, passing the
harness path, immutable selected library path and a new output directory.
