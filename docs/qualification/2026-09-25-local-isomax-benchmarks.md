# Local IsoMax benchmark — 2026-09-25 (Pacific)

Tested Connect4: `152f583a5f451a46f18b497e89c4339051ed818a` on
`work/isomax-jsminsys-rebuild`.
Actual pinned JSMinSys: `a1f3ee26c9a1f7a5af6887d6f91e2ae3f0f49e82`.
The gitlink and checked-out dependency agree; STATUS, README, AGENT_LOCAL and
NEES_PROFILE contain older dependency revisions and are not the provenance of
this measurement.

Host: Intel Core i5-12600K, Windows x64, Node 26.7.0, V8 14.6.202.34-node.28.
Run timestamps in the raw artifacts use UTC (2026-09-26).
Source was clean. The pre-existing uncommitted scheduling regression was saved
in a named Git stash before fast-forwarding the checkout. No solver code,
dependency pin, benchmark limit or benchmark harness was changed.

## Verification

- `node --test test/*.test.mjs`: 57/57 passed.
- `node --test vendor/jsminsys/test/*.test.mjs`: 142/142 passed.
- Raw output: `isomax-local-20260925-tests.log` and
  `isomax-local-20260925-jsminsys-tests.log` in this directory.

These checks and benchmarks do not constitute full NEES/JMS certification.

## Official Fhourstones input sequence

The maintained harness ran each official input once, in order, with one
evaluator plus Branch Manager, 65,536 TT rows/buckets, manager budget 64,
ready target 2, and the unchanged 120,000 ms solver timeout. Both optional CPC
frontier-response and projected-advisory settings were false, as in the harness.
There was no warmup, retry or substituted input.

| Input | Outcome | Wall seconds | Evaluations | Process CPU cycles | Final live TT rows |
|---|---|---:|---:|---:|---:|
| 45461667 | TIMEOUT (102) | 120.017 | 208,441 | 142,414,098,789 | 34,868 |
| 35333571 | CAPACITY (1) | 91.246 | 228,145 | 148,074,274,600 | 65,536 |
| 13333111 | CAPACITY (1) | 108.896 | 261,789 | 190,070,979,139 | 65,536 |
| empty | CAPACITY (1) | 68.822 | 158,014 | 104,432,576,232 | 65,536 |

**0/4 solved.** No root WDL or oracle match was produced. All cases reported
cleanup=true, two exited threads, no host exception and zero fault words.
Error 1 is `RBA_TT_ERR_CAPACITY` in the pinned library. The harness exited 1,
correctly reporting `INCOMPLETE_OR_FAILED`.

Total measured process CPU cycles: **584,991,928,760**.
Highest periodic/completion RSS observation: **251,260,928 bytes**; this is a
sampled process footprint across successive sessions, not an allocator peak or
live-TT high-water measurement. Each session reported 43,253,944 shared bytes.

These are shared-TT CPC-first evaluation counters, not Fhourstones node counts.
The timeouts and capacity failures are not a completed Fhourstones score. No
search-depth telemetry is exposed by this harness; depth at exhaustion is unknown.
No pruning/reclamation root cause is inferred solely from these failures.

## Separate 1/2/4-worker benchmark

The existing scaling harness ran `45461667` sequentially at 1/2/4 evaluators,
each with a fresh session, unchanged 30,000 ms timeout, 65,536 TT rows/buckets,
manager budget 64, and ready target twice the evaluator count.

| Evaluators | Outcome | Wall seconds | Evaluations | Process CPU cycles | Final live TT rows |
|---:|---|---:|---:|---:|---:|
| 1 | TIMEOUT | 30.018 | 68,632 | 38,796,371,952 | 23,015 |
| 2 | TIMEOUT | 30.010 | 140,363 | 56,557,755,189 | 50,429 |
| 4 | TIMEOUT | 30.023 | 342,446 | 79,032,138,210 | 32,740 |

All three returned no WDL, cleaned up, and exited all owned threads. None hit
capacity in this run. Four-worker claims (342,447) exceed reported evaluations
(342,446) by one; preserve the actual counters rather than substituting one for
the other. Counters are periodically published and may be truncated at shutdown.

Higher evaluation throughput is observed, but no solve-time speedup is established.
Different interleavings can expand different work; these single samples are not
a paired optimization comparison. Whole-process CPU time was respectively
10.328 / 15.656 / 22.015 seconds across about 30 seconds wall time, so these runs
do not demonstrate full multicore utilization. No profiler was run to attribute
waiting or synchronization costs.

The scaling harness exits 0 after completing its samples even when every sample
times out. Its exit code is not evidence of solving success.

## Reproduction and evidence

From the tested checkout, using Node 26.7.0 on Windows:

```powershell
node --experimental-ffi tools/bench-fhourstones.mjs docs/qualification/fhourstones-local-20260925-152f583a.json
node --experimental-ffi tools/bench-isomax-branch-manager.mjs
```

Use a new output filename for reproduction to preserve these artifacts.

- `fhourstones-local-20260925-152f583a.json`: complete report/configuration.
- `fhourstones-local-20260925-152f583a.json.jsonl`: incremental 30-second progress and results.
- `fhourstones-local-20260925-152f583a.log`: full captured harness output.
- `isomax-scaling-local-20260925-152f583a.jsonl`: complete scaling samples.
- `isomax-scaling-local-20260925-152f583a.stderr.log`: scaling stderr.

Cycle counts use Windows QueryProcessCycleTime, including user/kernel cycles
across all process threads for the whole operation (ingress, preparation,
worker/manager execution, reporting and cleanup). They are not estimates from
nominal clock frequency or per-hot-loop cycle attribution.
