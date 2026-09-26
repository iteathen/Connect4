# Four-worker follow-up with matched node instrumentation

Four workers solved the first Fhourstones input and reached clean 120-second timeouts on the other three. All three independent solved-control samples returned WDL +1, move 3, with clean teardown. Median control wall time was 1.1122 seconds.

## Provenance and controlled settings

- Execution checkout: 144075897deebf0b87643fe0c1f461e823920afc (publication-only descendant of tested solver source).
- Solver source: 2ed88683ba46fc4d99790414ad99a2e409acf400; no production-code change since the prior eight-worker run.
- JSMinSys: 04d37498607ace16dae33c79462ddfe1503c8a0d.
- Host: 12th Gen Intel(R) Core(TM) i5-12600K, 16 logical CPUs; Node v26.7.0; V8 14.6.202.34-node.28; Windows x64.
- Full run: 2026-09-26T14:54:43.799Z to 2026-09-26T15:00:45.134Z.
- Identical counter preload: ../20260926-worker-scaling/node-counter-hook.mjs, SHA-256 1486a9493c055d8e88ac27bf7c4173483d2c36316c3aa1acf5d7a5201998ea6c.
- Identical cache capacities 65,536 local/shared, sharedSampleMask 7, CPC-only mode, optional frontier-response/projected-advisory disabled, unchanged 120,000ms timeout.

The prior eight-worker run and this run use the same benchmark-only redirection of existing node counters into single-writer shared slots. Final counts are read after workers join. This removes the previous instrumentation mismatch; it does not measure instrumentation overhead or establish a randomized paired scaling qualification. The eight-worker data remain one earlier sample per input.

## Four-worker full run

| Input | Result | Wall seconds | Total node visits | Million visits/sec | CPU cycles/visit |
|---|---|---:|---:|---:|---:|
| 45461667 | EXACT +1 | 1.124 | 2,827,432 | 2.515 | 6594.1 |
| 35333571 | TIMEOUT | 120.014 | 487,707,831 | 4.064 | 3604.8 |
| 13333111 | TIMEOUT | 120.014 | 550,570,819 | 4.588 | 3192.6 |
| Empty board | TIMEOUT | 120.012 | 658,148,459 | 5.484 | 2670.5 |

Full-run totals, excluding the two extra controls: 1,699,254,541 visits, 361.164 wall seconds, 5292051694846 process cycles. Weighted averages: 4.705 million visits/sec and 3114.3 cycles/visit.

## Matched-instrumentation comparison with earlier eight-worker run

| Input | Four-worker M visits/sec | Eight-worker M visits/sec | Throughput ratio | Four-worker cycles/visit | Eight-worker cycles/visit | Eight-worker cycle premium |
|---|---:|---:|---:|---:|---:|---:|
| 45461667 | 2.515 | 4.220 | 1.678x | 6594.1 | 7743.2 | +17.4% |
| 35333571 | 4.064 | 6.841 | 1.683x | 3604.8 | 4288.9 | +19.0% |
| 13333111 | 4.588 | 7.989 | 1.742x | 3192.6 | 3673.5 | +15.1% |
| Empty board | 5.484 | 9.460 | 1.725x | 2670.5 | 3102.1 | +16.2% |

Across the full workload, eight workers delivered 1.718x aggregate visit throughput at 2.005x process cycles. Its weighted cycles/visit were 16.6% higher. Both counts solved the same one input; none of the hard/empty timeouts measure time remaining to a proof.

Eight-worker first-input wall time was 1.3138 seconds, versus the four-worker median 1.1122 seconds. The earlier eight-worker observation is 18.1% longer and used 2.331x the cycles of the median-wall four-worker sample. This is observed behavior, not a statistically established universal worker-count preference.

## Three independent solved-control samples

Sample 1 is the first input of the full run. Samples 2 and 3 ran after it in separate fresh Node processes. Each used fresh worker sessions/caches; no warmup and no retry of a failure. Scheduling/cache interaction can change which worker wins and total loser work.

| Sample | Wall seconds | All-worker visits | Billion cycles | Cycles/visit | Winner | Winner visits |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 1.1241 | 2,827,432 | 18.644 | 6594.1 | 3 | 716,450 |
| 2 | 1.1122 | 2,796,496 | 18.419 | 6586.5 | 3 | 716,450 |
| 3 | 1.1002 | 2,745,304 | 18.219 | 6636.5 | 2 | 708,500 |

## Per-worker full-run visits

| Input | Worker 0 | Worker 1 | Worker 2 | Worker 3 |
|---|---:|---:|---:|---:|
| 45461667 | 687,341 | 721,799 | 701,842 | 716,450 |
| 35333571 | 130,208,784 | 121,768,076 | 121,099,221 | 114,631,750 |
| 13333111 | 143,359,793 | 127,250,922 | 139,995,240 | 139,964,864 |
| Empty board | 174,400,104 | 173,733,116 | 172,321,431 | 137,693,808 |

## Interpretation and limits

- Four workers were more economical in measured cycles per visit on every case. Eight provided more aggregate visits per second but no additional completed solution within the cap.
- These are all-worker visits, including repetitions, cache-hit visits, and forced-transit states counted by JSMinSys. They are not unique states or Fhourstones engine node counts. Higher visits/sec is not proof of proportionally faster solving.
- The counters do not attribute the cycle premium to processor placement, cache traffic, synchronization, runtime helpers, or changed node mix. Expensive repeated-q overlap and kernel-stage profiling remain separate investigations; this run does not claim those measurements.
- QueryProcessCycleTime measures cycles across the whole process, including host/runtime work. Cycles/visit uses the all-worker denominator; visits/sec uses full-operation wall time. No GHz-based estimates.
- Counter storage can affect generated code. Both compared instrumented runs share that change. The earlier uninstrumented four-worker sample is retained as separate historical evidence, not substituted into this comparison.
- Only one solved input was repeated, and the runs were not randomized/interleaved with fresh eight-worker repetitions. No confidence interval or general scaling claim is established.
- No new solve algorithm, production-file modification, bound-sharing policy, timeout increase, or full NEES qualification was performed.

## Reproduction and evidence

From the checkout with Node 26.7.0:

```powershell
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-four-worker-controlled/run.mjs full
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-four-worker-controlled/run.mjs 2
node --experimental-ffi --import ./docs/qualification/20260926-worker-scaling/node-counter-hook.mjs docs/qualification/20260926-four-worker-controlled/run.mjs 3
```

Existing evidence cannot be overwritten by the driver. Use a fresh directory at the same depth for a future run. workers-4-full.json/jsonl contain the full run and 15-second progress samples; workers-4-2.json/jsonl and workers-4-3.json/jsonl contain the extra controls. Prior eight-worker records remain under ../20260926-worker-scaling/.

Validation: all six case records have four-worker cleanup, valid per-worker sums, no unexpected errors, and valid winner/oracle checks where exact. The measurement hook matches the earlier published hash. Production code and dependency revision match the prior source.
