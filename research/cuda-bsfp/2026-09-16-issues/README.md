# BSFP issue verification, repairs and measured selection — 2026-09-16

Issues were treated as hypotheses. The fetched starting head was `c973f220b120dbb62350230c11f12686e07c785a`; final executable head tested was `6a0082dd2b068fccd65ed388a0edbc3d755e6caa`, on `research/bsfp-tensor-overflow-dominance`. Subsequent evidence/documentation commits do not change that executable. These are local `--no-publish` qualifications, with selected sanitized evidence in [evidence.json](evidence.json), not rewritten official Q1 bundles.

## Priority and disposition

1. **Connect4 #49 — correctness/capacity:** the old 1,024-record failure is repaired. Independently checked captured overflows, full native frontier controls, bounded oversized intersections, and the final clean timeout support closing that specific defect. A clean timeout does not establish a solved 7x6 board.
2. **Connect4 #51 — measurements and effective integration:** implemented real-input replay, crash-safe utilization/work accounting, improved callable A/B sampling, active-slab readback, packed recovery, and bucketed ordinary/recovery selection. Found and fixed a real bucketed-kernel race before promotion. Retain the issue for the remaining scalable execution and work-reduction proposals below.
3. **Producer boundaries:** CUDA-Algorithms #11/#12 remain capability/specification requests, not proved library defects. CUDA-Algorithms #9 already has an implementation/native-qualified PR #10 pending integration/adoption; it is not a missing implementation to duplicate. The Tensor pinned implementation comes from staged PR #82/#81; this pass provides additional consumer evidence, not authorization to bypass its merge gates.

The current open Connect4 winning-line research and frontier-negamax issues describe a separate solver lane. They were not silently folded into BSFP or altered.

## Repairs and integration

- **Histogram initialization race:** the existing B2/B3 kernels reset bucket counters and then incremented them from different warps without a block barrier. A full native 5x5 frontier check failed at support 734, although isolated overflow fixtures passed. Added the required block barrier in both variants. This was Connect4 synchronization misuse, not a CUDA-JS defect.
- **Oversized per-support intersection:** faster recovery reached rank 36 and exposed `RangeError: jobs[171] exceeds one GPU pair-reduction batch capacity`. The actual P2 recurrence now partitions the complete Cartesian product into disjoint bounded rectangles, normalizes each on CUDA, then uses its existing exact host minimal/maximal union. It publishes no parent before all rectangles finish. No allocation/candidate/frontier/timeout bound was raised.
- **Safety and observations:** enforce emergency VRAM termination before telemetry journal writes; journal failure cannot prevent the safety action. Optional unavailable GPU metrics remain null. Persist utilization, clocks, power and memory samples; separate submitted, generation-completed and fully recovered batch counters. Report active support/rank, CPU time, tiled work and merge time.
- **Measured selection:** retain generated packed candidates on device for the existing reused-slab recovery, use the existing bucketed-cardinality implementation for both ordinary and overflow normalization, share sequential bucket scratch, and read only the active output slab prefix. Tensor and legacy strategies remain explicit controls. The quadratic B3 deduplication strategy is not promoted.
- **Replay authority:** capture original operands before recovery with source SHA, context and content hash. Independent BigInt Cartesian/antichain arithmetic supplies the expected frontier. One warmup, three alternating measured repetitions per method; no optimized result manufactures its own oracle. Callable Tensor A/B separately uses two warmups and seven rotated-order repetitions.

Reflection/cofactor preservation and the resolved-SIMT workspace/binding repairs were already present at the fetched starting head. Preserve them; do not credit them as new changes from this pass.

## Matched real-overflow measurements

Same GPU, pins, capacities and exact input; host wall time includes pair generation plus recovery and transfers, excludes oracle/comparison. Each of eight results per fixture (warmup plus three repetitions for each method) matched the independent exact oracle. These compare the old ordinary/Tensor stack to the final ordinary-bucketed/packed-bucketed stack, not one isolated instruction change.

| Captured direction | Pair candidates | Exact survivors | Old Tensor stack median | Selected packed stack median | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| Maximal, rank 38 | 16,005 | 1,055 | 327.3094 ms | 36.5302 ms | 8.96× |
| Minimal, rank 37 | 448,941 | 2,473 | 19,921.3156 ms | 187.1082 ms | 106.47× |

Maximal run `20260916T090610736Z-2104d7de`; minimal run `20260916T090614448Z-f79ba461`. The minimal packed samples were 187.1082, 435.2875 and 184.5851 ms: retain the spread rather than presenting a deterministic latency. Both services closed gracefully. Fixtures are under [fixtures/](fixtures/), hashes `92edd9aa…` and `babbc287…`, captured from clean `9330e191…` before recovery.

Earlier controlled steps also isolated recovery bucketing (minimal 3,159.141 → 601.198 ms) and ordinary bucketing (603.3769 → 178.8775 ms). Those measurements preceded the synchronization repair; the final direct replays above and subsequent full frontier controls are the promotion evidence.

Native 5x5, with the same full-frontier observer and 32,002,452 pair candidates: legacy ordinary/bucketed recovery took 8,269.7276 ms; repaired bucketed ordinary/recovery took 6,071.7720 and 6,499.5684 ms. These are one baseline and two candidate observations, not a statistically established speedup distribution or a 7x6 forecast.

## Final bounded 7x6 qualification

Command: `node tools/cuda-bsfp-qualifier.mjs --qualify-benchmark --profile c4-0009-p2-compact-hybrid --cases 7x6:c4 --no-publish`.

- Run: **`20260916T090952138Z-6869ee54`**; clean source `6a0082dd2b068fccd65ed388a0edbc3d755e6caa`.
- GTX 1660 Ti, 6,144 MiB, driver 610.74, compute capability 7.5; Windows 11, Node 26.7.0 with FFI enabled by native tooling.
- CUDA-JS `98e2ebc942c14d63acf4dd82e912dd548c363a05`; CUDA-JS-Tensor `9df9324b0ca7606f9dd2af2e89aed118839896a5`; CUDA-Algorithms `48ee0aec9acae7776950f03ab52ab1737e598b6e`.
- Tensor callable A/B **PASS**. Medians: packed **15.9651 ms**, Tensor-only **17.8028 ms**, packed→Tensor **30.0435 ms**. All samples retained. Another run measured 16.0333/17.1084/16.7531 ms; the original issue's blanket 2× Tensor penalty is not stable across the improved sampling. This is distinct from resolved recovery.
- Callable workspace **164,544,512 bytes**, ceiling **201,326,592 bytes**. Optional resolved-SIMT overflow configuration **67,108,864 bytes**, backend SIMT. Final solver uses packed recovery, so Tensor overflow calls are **0**.
- Independent CUDA-JS solver policy: **268,435,456 total / 134,217,728 per allocation / 16,777,216 per transfer bytes**. A/B per-allocation policy remains 201,326,592 bytes. Conservative Q1 upper bound stays **543,169,548 bytes**, including the new scratch proof; admission 519 MiB against 5,177 MiB free. Emergency floor remains 256 MiB.
- 7x6 **CLEAN-TIMEOUT**, Q1 `complete-with-boundaries`, case `timeout`; **no rootWdl**. The 120,000 ms *case* budget includes A/B. A/B took 2,400 ms; solver received 117,591 ms. Observed child duration 117,788 ms; case duration 120,204 ms including termination. Exact final reason: **`step exceeded 117591 timeout`**. No setup, contract, allocation, binding, Tensor-resolution or unexpected runtime error before termination. FFI experimental warnings are retained locally.
- Last persisted solver snapshot at **111,382.1859 ms**: 411 complete supports, six complete ranks, active rank 36; **111,603,820** generation-completed pair candidates vs **107,756,617** fully recovered-batch candidates; **169** overflow attempts, **168** completed packed recoveries, **0** failures, initial-required lower-bound maximum **2,512**, maximum recovered frontier **8,895**. Two oversized intersections and nine completed tiles; host tile merge 538.8677 ms. Snapshot counts are lower bounds at termination.
- Completed recovery timings: upload **148.3875 ms**, execution **87,793.9910 ms**, readback **481.6445 ms**. These are host-wall accounting, overlap outer execution, and exclude unfinished recovery. Do not sum overlapping counters.
- Peak device-wide memory: **1,015 MiB overall** (A/B); solver peak **943 MiB**, minimum free **5,024 MiB**. Solver samples (232): GPU utilization mean **78.30%**, range 0–100; memory utilization mean **0.49%**; power mean **45.06 W**; SM clock mean **1,744.78 MHz**. Samples are not kernel occupancy or time-weighted utilization.
- Cleanup: qualifier terminated the process tree at timeout; no matching solver/qualifier children remained, GPU memory returned to pre-run **790 MiB used / 5,177 MiB free**. No graceful solver `runtime.close()` claim after forced termination.

The old 1,024 frontier boundary was crossed and recovered. Independent exact replay establishes overflow correctness on the captured inputs; the absence of an exception in the unfinished 7x6 recurrence does not establish global correctness or the expected root oracle `1`.

## Qualification and failures retained

`node --test`: **118 passed, zero failed/skipped**, 15.260 s. Native post-repair controls compare every physical frontier for 4x3 connect-3, 4x4 connect-4, and 5x5 connect-4; repeated 5x5 passes. A dedicated native histogram-reuse regression compares **5,120** frontiers across mixed directions, partial warps and 20 reordered submissions. Tiny native input/candidate/frontier capacities force **141** tiled intersections, **434** tiles and **119** recoveries; all 256 physical 4x3 frontiers match the independent reference.

Retained failures: rank-36 arena boundary run `20260916T085420587Z-255b9108`; native frontier mismatch run `20260916T090056677Z-6344a945`. These remain failures in evidence. Their subsequent repairs are separate runs.

Specs reviewed: Connect4 C4-0006→0009, P2/Q1 and B2/B3; pinned CUDA-JS device memory (0004), synchronization (0013), bounded scheduling (0018), prepared DAG (0020), numeric views (0021), typed composition (0028); pinned Tensor resolved SIMT (0005) and device-callable program (0009). No dependency implementation or limit changed; no lower-layer defect was demonstrated.

## GPU efficiency and remaining priorities

High device-busy readings do not establish good GPU use. Packed recovery still assigns one block to a large segment, and overflow execution remains dominant. A short Nsight Systems mixed replay observed 3,156 kernel launches, 168.13 ms summed kernel duration over a 1,539.63 ms first-to-last span, 1,158 allocations and matching frees, 968 HtoD and 292 DtoH transfers. This instrumented mixed fixture is not a 7x6 occupancy measurement. Q1 marked that profiler-wrapped child as runtime-failure because the profiler intercepted structured stdout; recovering stdout from the profiler database proved fixture parity/graceful cleanup but does not retroactively change Q1's outcome. Wrapping the entire qualifier also caused a correctly fail-closed telemetry admission refusal. Hardware-counter profiling was blocked by **ERR_NVGPUCTRPERM**; no occupancy/stall claim is made. Raw profiler databases contain local environment paths and remain private.

1. CUDA-Algorithms #11: scalable exact segmented packed normalization with efficient duplicate grouping, multi-block work distribution and compaction. Supply these real fixtures, measure complete time, and retain both minimal/maximal exactness. Existing experimental B2 is a qualified interim selection, not that public capability.
2. CUDA-Algorithms #12: core-relative absorption before Cartesian materialization, after accepted API/ownership contracts. Reuse domain proofs; test it against the equally optimized current ownership path. Do not duplicate a generic production algorithm downstream.
3. Measure and then reduce host structural/cofactor/union/finalization work and serial large-segment scheduling. Device-resident semantic progression remains the C4-0009 direction; the current hybrid boundary is explicit.
4. Legal-slice coverage remains a different representation/semantic qualification task. Pruning P2's full Boolean ownership domain using coverage research would invalidate its present frontier oracle. No speculative drop-in was made.
5. Tensor result-arena reuse is a producer capability question. Current resolved `run()` allocation behavior and these profiles motivate it; private allocation access or inferred workspace permissions would be invalid workarounds.

Full local logs remain under `.cuda-bsfp-qualification/runs/<runId>/`, including `results.json`, case stdout/stderr, and `gpu-telemetry.jsonl`. This report deliberately publishes only selected sanitized evidence, complete timing samples and portable fixture inputs. No full 7x6 solve-time extrapolation is supported.
