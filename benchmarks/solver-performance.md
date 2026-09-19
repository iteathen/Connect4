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
