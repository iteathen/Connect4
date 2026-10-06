# Best-version reproduction

The fastest preserved comparable prepared-empty 7x6 solve is JSMinSys `427f691b00248ac15b795e187508bf5144f69706`, originally **53.451 seconds**. A scan of 144 EXACT prepared-empty records is retained in `historical-scan.json`. The historical source was restored from `git archive`, without solver changes, and its original invocation reproduced in two fresh processes.

| Source | Today's primary solve times | Mean |
|---|---|---|
| Current Connect4 package, source d2e4cca | 58.346 / 55.595 / 59.014 s | 57.652 s |
| Historical best, source 427f691b | 59.653 / 57.167 s | 58.410 s |

All five solves returned EXACT WIN with c4 selected, four workers ready before root construction, four workers exited, and clean cleanup. Timing excludes initialization and cleanup. No RLC, supplied opening prefix, or previous-run cache was used. Cache capacities, generated transition plans, runtime and actual affinity were checked against the retained configuration.

Both historical retests used Node v27.0.0-nightly20260928b59840b593, V8 14.6.202.34-node.36, the i5-12600K, JIT limits 2400/9600, four deep workers with center/live/center/live policies pinned to logical 0/2/4/6, 4 GiB shared native TT and 256 MiB native private TT per worker. Root frontier remained disabled, shared sample mask 0, and shared proof bounds enabled. Initialization took 4.397 / 4.245 s. Peak RSS was 6,903,508,992 / 6,905,966,592 bytes.

The historical launcher recorded **826,417,275,714 / 801,809,725,133 process cycles**, covering initialization, solve and cleanup. CPU times were 224.953 / 218.250 s over all threads. Original C66-01 whole-operation cycles were 759,462,830,896. The current package launcher does not expose cycle accounting; no comparable solve-only cycle claim is made. Native node/cache counters remain unavailable, with no added hot instrumentation. Historical launcher exit status 3 means the <=10 s target was missed, despite an EXACT result; neither run timed out.

The historical best did not reproduce its earlier speed. Its two current timings overlap the current package range. This does not establish a source regression or explain the slowdown. Between that historical revision and package source, the only addon source change is a cold compiled-plan reuse/accounting fix; hot worker code is identical. No thermal, frequency, scheduler or background-load cause was measured sufficiently to attribute the difference. No rollback or optimization was promoted from this test.

`comparison.json` preserves all measurements; each run directory preserves stdout, stderr, invocation, external measurement and affinity reports. `BEST-RETEST-PROTOCOL.md`, the original invocation, `retest-best.ps1` and unchanged `measure.ps1` preserve reproduction instructions. Formula holdouts remain sealed.
