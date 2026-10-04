# No-RLC execution-path diagnosis

The no-RLC entrypoint is connected to the actual recursive search. This diagnosis does not establish a completed empty-root runtime or rule out every possible regression.

## Frozen runtime and actual execution

Compared all 54 files in the original admitted IsoMax runtime against the no-RLC runtime: only `wrapper.mjs` differs. Solver modules, runtime executable, profile, worker-affinity targets, and preload are unchanged. Candidate: JSMinSys `1b843981ba7d68c118656dad1a6c7591453e7686`.

The wrapper invokes `runLazySmpConnect4Rba32([], {geometry, ...profile.options})`. The host constructs the empty RBA root, selects `worker-dense.mjs`, and starts four workers. Each calls `solveConnect4RbaFrontier`, which reaches `searchCpcOnlyFrontier`. Removing the RLC loop does not remove or bypass that call.

A separate diagnostic used the unchanged no-RLC wrapper and production memory/affinity configuration, adding only V8 `--prof` and an external 8,000 ms deadline. The deadline deliberately terminates this diagnostic; it is not a solve-time measurement. Process startup/termination made the recorded wall interval 8,808.9704 ms. CPU was 30,171.875 ms, peak RSS 6,852,149,248 bytes. No prior solver processes were found at preflight, and none remained after termination.

Five isolate profiles were produced: the host and four worker isolates. Every worker profile contains optimized recursive `searchCpcOnlyFrontier` stacks, CPC evaluations, cofactor transitions, and TT probes/stores. Worker sample counts were 477, 468, 475, and 412. Cofactor transitions accounted for approximately 47–52% of each worker's flat samples. This short startup sample identifies execution, not whole-solve cost attribution or a performance optimization warrant. Raw logs are retained compressed alongside processed profiles.

All four worker affinity reports confirm the declared placement. The sampled execution entered search with `moves: []`, `rlc_enabled: false`, four deep workers, shared capacity 134,217,728 (4 GiB payload), and private capacity 16,777,216 (576 MiB per worker).

## Historical comparison recovered

| Evidence | Actual recursive-search root | Wall seconds |
|---|---|---:|
| Memory/affinity placement records at JSMinSys `9d87c7274b2753102f8c16f0961acf3bb2acd24b` | `35333571` | 55.313 and 55.583 |
| Private-cache 576 MiB point, same evidence commit | `35333571` | 32.407 |
| Direct repeat at `190f4a6` | `4444` | 46.042 |
| Direct 5 GiB shared-TT run at `a18f0dc` | `4444` | 46.090 |
| Direct 5 GiB shared-TT run at `01cd4ed` | `44444` | 45.660 |
| Empty-board structural composition at `5ea441d` | runtime-computed `44444` | 47.033 including RLC |
| Frozen external comparison, current candidate | runtime-computed `44444` | 34.664 including initialization and RLC |
| Owner-stopped current no-RLC run | genuinely empty | incomplete at 167.997 |

These are different positions and, in the older records, different memory layouts/topologies. They must not be treated as equivalent timing trials. The recovered 55-second records are not direct empty-board solves. No completed 50–55-second direct-empty-root record was found in this investigation; that is a retrieval finding, not a claim that no such record could exist elsewhere.

Disabling RLC removes runtime-computed state advancement. Exact search from the empty board must establish its result over the relevant replies; solving one five-move continuation is a different obligation. This explains why a constant-time RLC phase can have a large effect on the measured search workload. It does not quantify the expected slowdown or independently certify the RLC moves as an optimal empty-root proof.

## Conclusions and limits

- Missing search hookup is contradicted by both source tracing and actual worker execution samples.
- No solver source changed when RLC was disabled; byte comparison confirms this.
- No surviving prior benchmark jobs were found. Background OneDrive load was observed only after the original run stopped, so it is not an established explanation for that run.
- The concrete comparison error is using reduced-position timings as an established empty-root baseline.
- No source fix or solver tuning was made. The original long run remains owner-interrupted, with no W/D/L result. A complete empty-root performance regression assessment remains open until a matching historical empty-root baseline or a controlled matched comparison is available.

Reproduce the bounded sample with the packet's existing `measure.ps1 -Config diagnosis/invocation.json` after adjusting absolute paths to the same verified runtime. Process V8 logs with that exact Node executable and `--prof-process`. The diagnostic's profiler overhead and forced termination prohibit promoting its wall time as a benchmark result.
