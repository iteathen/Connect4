# Separate bounded solver performance runs

Run each command from its live solver branch with Node 26.7.0 and a clean source
checkout. Run them sequentially on the same otherwise idle host:

```sh
# solver/isometric
node tools/solver-performance.mjs isomax

# solver/cuda-bsfp, with the pinned CUDA packages prepared
node tools/solver-performance.mjs bsfp
```

Both request exact fixed-P0 W/D/L for the standard 7x6 **empty board**. This is
not Pascal Pons Begin-Hard or a claim to reproduce Fhourstones node accounting.
The limit is 120 seconds; an optional second argument shortens it in milliseconds
and cannot exceed 120000. One process/run, fresh solve state, no silent retry.

IsoMax uses the maintained native solver with RBA disabled, a fresh pool/cache
and 4096 MiB V8 old-space ceiling (not a whole-process RSS cap). A benchmark-only
subclass checks the clock every 8192 node entries and emits roughly one-second
progress snapshots. This instrumentation has overhead; results are instrumented
throughput, not pristine microbenchmark timings. The parent enforces the deadline
even while recursion blocks the child's event loop. Counts at interruption are
the last durable lower bound. Cache capacity, residual class count, CPU usage,
RSS/heap/external bytes and OS high-water RSS accompany the solver counters.

BSFP invokes the existing native P2 qualifier with unchanged memory policies and
`--no-publish`. Its 120-second **case** budget includes the Tensor A/B prerequisite
and native root step. A/B/setup and actual solve time must therefore be reported
separately. The outer watchdog allows 60 seconds only for preflight/finalization;
it cannot extend the qualifier's case deadline. Existing periodic GPU telemetry
and five-second solver snapshots remain authoritative for native counters.

Results and flushed logs live under the Git-private `solver-performance/<run-id>/`
directory (resolved by `git rev-parse --git-path solver-performance`). Metadata
records exact source/branch, runtime, CPU, RAM, workload and limits. BSFP also
retains its full qualifier bundle. Logs survive child failure and timeout.
Local logs may contain machine paths; share sanitized summaries rather than raw
private logs. Neither command publishes automatically.

Timeout is not a solve. Compare progress only within each solver's work units:
IsoMax nodes are not BSFP candidates/supports. A single bounded run gives no
statistical speedup claim and no reliable extrapolation to full solve time.

Harness controls:

```sh
node --test tools/test/solver-performance.test.mjs
```

## Recorded run — 2026-09-19

Host: i5-12600K, 32 GiB RAM, GTX 1660 Ti 6 GiB, NVIDIA 610.74, Node 26.7.0.
One run per solver, strictly sequential. Source changes were benchmark-only.
Structured sanitized evidence: [results/2026-09-19-separate-solvers.json](results/2026-09-19-separate-solvers.json).

### BSFP rank progress

Rank means **pieces already played**. BSFP works backward from rank 42 (full
support) to rank 0 (empty board). This run completed ranks **42, 41, 40, 39, 38,
37** and timed out with **rank 36 still in progress**: 36 pieces played, six empty
cells. It did not complete rank 36 or any lower rank.

| Native solver elapsed | Observed active rank | Empty cells |
|---|---:|---:|
| 12.87 s | 37 | 5 |
| 52.51 s | 36 | 6 |
| 107.59 s, last snapshot | 36 | 6 |

These are observation times, not exact rank-boundary timestamps. Six completed
ranks out of 43 does **not** mean 14% of the solve is done: layer costs differ
greatly. Future harness summaries expose `rankProgress` directly.
[Rank-only evidence](results/2026-09-19-bsfp-ranks.json) is derived from the
preserved run logs; no new solve was launched.

| Measurement | IsoMax | Native CUDA-BSFP P2 |
|---|---:|---:|
| Tested SHA | `681caa3c` | `8f15ffe4` |
| Outcome | 120 s timeout | 120 s case timeout |
| Root W/D/L | Not produced | Not produced |
| Last progress time | 119.447 s | 107.586 s in native solver |
| Work recorded | 60,858,368 nodes | 79,797,022 submitted pair candidates |
| Completed work | 31,734,919 cached values | 75,798,666 completed-batch candidates; 411 supports |
| Peak memory | 3.10 GiB process RSS high-water | 931 MiB device-wide native stage; 1003 MiB during A/B |

IsoMax instrumented throughput was about 509,499 nodes/s at the last snapshot;
29,123,420 cache hits and 8,934,140 forced transitions were recorded.

BSFP's A/B took 10.144 s, leaving 109.787 s for its native root step. A/B passed
with medians 7.0148 ms packed, 27.5792 ms Tensor-only and 30.0220 ms packed→Tensor;
callable workspace was 164,544,512 bytes. Native progression reached active rank
36 with six ranks completed, 124 recovered overflow jobs, zero reported overflow
failures and maximum recovered frontier 8,895. The promoted default executor was
packed/bucketed; Tensor overflow calls were zero. At the last snapshot, cumulative
GPU execution was 64.103 s, including 62.293 s overflow execution. An overflow
was still active when interrupted, so counters are lower bounds, not final totals.

Native GPU utilization samples averaged 56.29% (0–100%, 215 samples), device-wide.
Both parents observed child exit. The native solver PID was absent after timeout;
post-run free VRAM was 5191 MiB. No solver retry or limit increase was performed.

Run IDs:

- IsoMax: `20260919T150939953Z-isomax`
- BSFP wrapper: `20260919T151201835Z-bsfp`
- BSFP qualifier: `20260919T151202206Z-350f4328`

Neither run establishes full-solve speed or a winner between solvers. The work
units differ and BSFP's prerequisite consumes part of its case budget.
