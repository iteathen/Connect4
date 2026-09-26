# Empty-board memory doubling: diminishing observed return

Previous two results were already published at b984f347 on research/semantic-quotient.
This is exactly one additional five-minute run; no retries or extra solver samples.

Same four workers, empty board, mask7, original move ordering, Node26.7.0,
Windows i5-12600K and JSMinSys ec6a602268e5dd281db9cb29b2f4defd47c6d325.
Harness 3a41a2fc raises only cold memory admission bounds relative to the prior
53b3fe70 harness. Sample and node-loader hashes in manifests are unchanged.
No production solver, JSMinSys, BSFP or dependency-pin changes.

| Shared / private entries per worker | Cache backing MiB | All-worker visits | Million visits/sec | CPU cycles/visit | Sampled peak RSS MiB |
|---|---:|---:|---:|---:|---:|
| 64K / 64K | 19.25 | 1807178882 | 6.0237 | 2434.72 | 150.76 |
| 1M / 1M | 308.00 | 1884704714 | 6.2817 | 2329.93 | 430.12 |
| 2M / 2M | 616.00 | 1890161929 | 6.2999 | 2324.10 | 737.77 |

All three outcomes: clean 300-second timeout; no rootWdl; four workers exited;
errors=[]; errorCode 102 is the configured deadline. Oracle status is unknown,
not matched or failed. New total CPU cycles: 4392923249886; elapsed
300.031 seconds. Node counters and cycle partitions reconcile.

Doubling 1M -> 2M: visits/sec 0.289%,
cycles/visit -0.250%, total cycles
0.039%.
The earlier 64K -> 1M throughput change was +4.283%; the latest increment is much
smaller despite another 308MiB of backing storage. These points do not show
proportional throughput scaling with memory; they suggest saturation. No fitted
linear law, significance claim or proof of saturation is warranted from one
sequential observation at each size. A 0.29% throughput difference can be noise.

This is throughput, not solve speed. A node visit is a recursive entry, not a
unique state or proof-progress measure. Different cache sizes can change work;
all cases timed out, so neither faster completion nor equal completed work is
established. Counter instrumentation was identical, and no winner-only divisor
was used. RSS high-water is sampled every 30 seconds, not an exact peak.

Shared cache counters, new 2M run: 24208971 hits,
169683 stores, 0 store-contention events.
They do not aggregate private cache reuse or measure duplicate-state overlap.

Keep defaults unchanged. The earlier results and all new manifests, progress,
stdout, counters and final JSON are retained. This run's 616MiB cache budget and
300-second benchmark deadline were explicitly authorized by the owner; normal
application timeout policy remains unchanged. Harness validation: 16/16 tests.
