# IsoMax on the standard Fhourstones inputs

Outcome: **incomplete, 0/4 solved**. All four attempts reached the existing
120-second solver deadline, error code 6, with no runtime errors and successful
thread cleanup. No WDL was produced. This is a bounded attempt on the official
inputs, not a completed Fhourstones benchmark score or full NEES/JMS certificate.

Tested source: `e742d1dc0d44585169c12a42f42d1dbbe5d932aa`, clean at launch.
Solver implementation is unchanged from `229358549a63adb41cda37c88ae207ef87cc0164`.
JSMinSys: `64ba37a11522b533a1de87942a14921fe690ef86`.
Host: Intel Core i5-12600K, Windows x64, Node 26.7.0, V8 14.6.202.34-node.28.
One evaluator plus the execution manager; default two-ply RBA boundary and native
fallback. No solver edits, retries, capacity changes or timeout extensions.

The [official benchmark](https://tromp.github.io/c4/fhour.html) uses these four
inputs in order, ending with the empty board. Input provenance is
`tromp/fhourstones@7ddf48dc70931eaa9c07904e12424960c3a019a1`, blob
`a8036a915ad1a3568762c269844cfd2ded7df3d3`. Expected WDL is win/loss/draw/win.

| Input | Result | Whole wall seconds | Fallback nodes | Million fallback nodes/s | Process CPU cycles | Cycles/fallback node |
|---|---|---:|---:|---:|---:|---:|
| 45461667 | TIMEOUT | 120.037 | 289,957,137 | 2.416 | 437,253,473,377 | 1,508.0 |
| 35333571 | TIMEOUT | 120.030 | 267,001,617 | 2.224 | 436,200,459,555 | 1,633.7 |
| 13333111 | TIMEOUT | 120.031 | 280,875,920 | 2.340 | 438,328,431,774 | 1,560.6 |
| empty | TIMEOUT | 120.025 | 303,524,245 | 2.529 | 437,370,368,682 | 1,441.0 |

Total measured wall time: 480.122 seconds. Total process CPU cycles:
1,749,152,733,388. Cycles are measured by Windows QueryProcessCycleTime and sum
user/kernel cycles across all process threads. Whole-operation measurements
include ingress, preparation, worker startup, cleanup and cold measurement.
No nominal-frequency conversion or invented per-instruction latency is used.
Thirty-second samples observed at most 99,282,944 resident bytes; this is an
observed sample maximum, not a continuously measured memory peak.

Each case made one boundary call, zero boundary closures and zero boundary
failures, then selected fallback. Boundary construction steps were respectively
555, 513, 553 and 503. Each attempt exited both owned threads. Existing counters
are published at control boundaries and may omit the final interrupted quantum.

IsoMax fallback frame entries and Fhourstones alpha-beta calls are different work
units; these rates are not interchangeable engine scores. The published reference
finishes the first position in 51,596 nodes, whereas this IsoMax attempt remained
unresolved after about 290 million fallback entries. This establishes an excessive
work problem on this input; it does not identify an unmeasured optimization's
benefit. No solve time is extrapolated from the partial counts.

Reproduction (Windows, Node 26.7.0):

```text
node --experimental-ffi tools/bench-fhourstones.mjs
```

Evidence: [complete results](fhourstones-isomax.json),
[incremental journal](fhourstones-isomax.json.jsonl).
The harness was syntax-checked and executed through all four cases, returning
exit 1 as intended for incomplete qualification. No solver source changed.
