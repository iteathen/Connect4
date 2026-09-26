# IsoMax local Fhourstones workload, four and eight workers

Eight workers solved 1/4 inputs; the other three reached the unchanged 120-second deadline. Every case exited all workers cleanly. This is an incomplete bounded benchmark, not a completed Fhourstones score.

- Connect4: 2ed88683ba46fc4d99790414ad99a2e409acf400
- JSMinSys: 04d37498607ace16dae33c79462ddfe1503c8a0d
- CPU: 12th Gen Intel(R) Core(TM) i5-12600K; 16 logical CPUs
- Node: v26.7.0; V8: 14.6.202.34-node.28; Windows x64
- Eight-worker run: 2026-09-26T14:37:04.949Z to 2026-09-26T14:43:06.484Z
- Identical local/shared cache capacity: 65,536 entries each; shared sample mask 7; CPC frontier-response/projected-advisory disabled.
- Production Lazy SMP host and worker algorithms; benchmark-only counter storage instrumentation described below. No checked-in solver/library file changed.

## Eight-worker results

| Input | Result | Wall seconds | Total node visits | Million visits/sec | CPU cycles/visit | Total billion CPU cycles |
|---|---|---:|---:|---:|---:|---:|
| 45461667 | EXACT +1 | 1.314 | 5,544,004 | 4.220 | 7743.2 | 42.929 |
| 35333571 | TIMEOUT | 120.023 | 821,061,227 | 6.841 | 4288.9 | 3521.455 |
| 13333111 | TIMEOUT | 120.017 | 958,848,221 | 7.989 | 3673.5 | 3522.329 |
| Empty board | TIMEOUT | 120.011 | 1,135,340,845 | 9.460 | 3102.1 | 3521.925 |

Total: **2,920,794,297 visits**, **361.364 wall seconds**, **2878.297 CPU seconds**, **10608637614924 process cycles**. Weighted aggregate: **8.083 million visits/sec**, **3632.1 cycles/visit**.

The solved first input returned P0 WDL +1 and zero-based move 3 (human column 4), matching the repository's expected oracle. Its winner visited 716,450 nodes. Timeout cases produced no WDL. Error 102 is the scheduled deadline, not an unexpected runtime exception.

Peak observed process RSS: 244.71 MiB. RSS sampled every 15 seconds and at case endpoints, so this is not an exact peak allocation measurement.

## Earlier four-worker comparison

The four-worker run used the uninstrumented production implementation. Its losing-worker and timeout node counters are unavailable. Do not infer their counts or divide process cycles by winner-only nodes. Eight-worker counter instrumentation can affect timing; this is not a controlled scaling A/B, and each configuration has only one sample per input.

| Input | Four-worker result | Four-worker seconds | Eight-worker result | Eight-worker seconds |
|---|---|---:|---|---:|
| 45461667 | EXACT | 1.121 | EXACT | 1.314 |
| 35333571 | TIMEOUT | 120.016 | TIMEOUT | 120.023 |
| 13333111 | TIMEOUT | 120.013 | TIMEOUT | 120.017 |
| Empty board | TIMEOUT | 120.012 | TIMEOUT | 120.011 |

The five-worker run was stopped at the owner's request during the third input. Its partial evidence is retained and excluded from this comparison. One and three workers were not benchmarked.

## Measurement and scope

The Node preload hook redirects the library's existing node increments to one single-writer Float64 counter per worker, padded to separate 64-byte slots. It adds no extra per-node counter increment, atomic operation, logging, allocation, or callback. Final counters are read only after the library joins all workers. This changes counter storage/access and may affect generated code; overhead has not been separately qualified. It is not a claim of unchanged performance or full NEES certification.

Total visits sum all workers, including repeated/transposed states and deterministic forced-transit states counted by JSMinSys. These are not unique positions and do not use Fhourstones engine node accounting. Root handling and terminal cofactor returns follow the library's existing node-count semantics; they are not redefined as extra node visits.

CPU cycles are measured by Windows QueryProcessCycleTime, summed over all process threads, including runtime helpers. They are not estimated from GHz. Cycles/visit divides those cycles by all-worker visits. Visits/sec divides all-worker visits by whole-operation wall seconds, including ingress, startup, search, cleanup, and cold reporting. No nominal clock-rate conversion.

The eight-worker ordering uses index modulo seven columns, so workers 0 and 7 have the same configured order offset. This is the existing library policy, not a benchmark optimization.

## Per-worker visits

| Input | Worker 0 | Worker 1 | Worker 2 | Worker 3 | Worker 4 | Worker 5 | Worker 6 | Worker 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 45461667 | 677,502 | 702,324 | 660,358 | 716,450 | 676,920 | 734,608 | 696,317 | 679,525 |
| 35333571 | 107,879,736 | 102,567,983 | 104,274,528 | 97,545,012 | 99,826,833 | 95,919,293 | 110,197,190 | 102,850,652 |
| 13333111 | 124,887,371 | 110,488,635 | 119,488,572 | 119,058,953 | 123,251,561 | 114,477,472 | 123,019,747 | 124,175,910 |
| Empty board | 146,159,060 | 154,899,430 | 138,067,431 | 123,106,283 | 130,840,846 | 149,578,220 | 137,926,159 | 154,763,416 |

## Validation and reproduction

Before the full run, instrumented eight-worker late-position, reflected-position, and terminal-position checks matched the independent physical oracle; winner counters matched reported winner metrics. A separate 100ms empty-root timeout check retained all eight counters and joined all workers. Full benchmark ran in a fresh Node process after those checks. No full-benchmark warmup, retry, or timeout increase.

From this checkout, use Node 26.7.0:

```powershell
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-worker-scaling/run-eight.mjs
```

The driver refuses to overwrite existing eight-worker evidence. For a future rerun, copy the harness files into a new qualification directory at the same depth. The original four-worker command was node --experimental-ffi docs/qualification/20260926-worker-scaling/run.mjs 4.

Raw per-case outcomes are in workers-8.json; periodic samples in workers-8.jsonl; earlier evidence in workers-4.json/jsonl and the explicitly stopped workers-5.json/jsonl. artifact-hashes.json pins these files and the measurement harnesses. Historical evidence is not overwritten.
