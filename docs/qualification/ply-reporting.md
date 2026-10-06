# Ply telemetry for IsoMax memory tests

The benchmark can sample absolute game ply without a new per-node sampling
predicate. Enable `recordPly: true` in `tools/isomax-cycle-sample.mjs`'s JSON
configuration and launch with `--import ./tools/isomax-node-counts.mjs`.
The default reader period is 100 ms; progress is emitted every 30 seconds.
`plySampleMs` (5–1000) and `plyReportMs` (sample period–30000) are cold options.

For example, using Node 26.7 with experimental FFI enabled:

```powershell
node --experimental-ffi --import ./tools/isomax-node-counts.mjs tools/isomax-cycle-sample.mjs C:/r/jsminsys-c1 '' '{"sharedCacheCapacity":1048576,"localCacheCapacity":1048576,"timeoutMs":300000,"recordPly":true,"progress":true}'
```

This is a test setup, not a change to JSMinSys, the production solver, cache
sizes, move ordering, or timeout policy. The existing five-minute benchmark
ceiling is unchanged. No new five-minute run is part of setup qualification.

## Meaning and cost

The source-guarded measurement loader publishes `rank + 1` into a worker-owned,
64-byte-separated uint32 slot on the existing eligible shared-cache probe,
after a local-cache miss. Zero means no publication or completed worker.
Rank is absolute stone count, not recursive call-stack depth; forced transitions
are represented correctly by the native q metadata. No board reconstruction,
string, allocation, added predicate, clock call, message, or atomic is injected
into search. There is one additional load/shift/store expression at that probe.

A separate reporting worker reads those slots, builds per-worker and aggregate
43-bin histograms, records time windows and RSS, and writes JSON progress to
stderr. Search workers never wait for it. Final stdout includes `plyTelemetry`
and reporter cleanup after it joins. Process cycles include reporter startup,
sampling, output, shutdown, and the search. Reporter errors fail the sample.

These are **time samples of latest eligible shared-probe ply**, not exact
visits-per-ply counts, instantaneous stack samples, an exact maximum reached,
branching factors, or a completed proof frontier. Local-hit/terminal work may
not publish; a prior value can remain until another probe. A terminated worker
can leave a last value during shutdown. Independent uint32 reads are non-tearing
but do not constitute a simultaneous multi-worker snapshot. A sampled maximum
is explicitly `maxObservedPly`. Raw windows preserve the evolution, allowing
comparison with the research's expected pressure around ply 21.

## Qualification

`node --test test/ply-reporting.test.mjs` checks publication selection, absolute
rank encoding, unchanged local/shared lookup results, source guards, padded
slots, histogram accounting, invalid samples, and reporting-worker cleanup.

`node tools/isomax-ply-check.mjs C:/r/jsminsys-c1 NEW_OUTPUT_DIRECTORY` performs
two short OFF/ON ABBA blocks on 45461667 with four workers, then one five-second
empty-board timeout. It preserves source hashes, raw logs, total cycle costs,
oracle/cleanup checks, sampled ply, and a descriptive paired summary. The OFF
arm retains the pre-existing all-worker node counter instrumentation.
This small screen cannot establish negligible overhead; inspect measured costs
before treating sampled tests as comparable performance results. Diagnostic
instrumentation does not inherit production NEES qualification.
