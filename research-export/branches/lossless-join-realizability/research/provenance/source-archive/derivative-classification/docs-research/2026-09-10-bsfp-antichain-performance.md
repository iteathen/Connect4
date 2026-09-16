# BSFP ownership-antichain performance checkpoint

**Date:** 2026-09-10  
**Status:** measured research/maintained-branch evidence; performance is descriptive and non-gating.  
**Source revision measured:** `1dcd0dd4b3d504e83b3421d5671d9979fa428d21`  
**GitHub Actions run:** `34449586657`

## Purpose

Record the first repeated performance comparison between the maintained direct raw-ownership MTBDD BSFP reference and the maintained direct ownership-antichain BSFP reference.

Both solvers are exact bottom-up symbolic BSFP realizations. Neither benchmark path enumerates the physical colored-state graph. Correctness qualification remains separate; this file records speed and representation size only.

## Environment

- Ubuntu 24.04.4 LTS, GitHub hosted runner image `20260831.293.1`
- Node `v26.7.0`
- AMD EPYC 7763, 4 logical CPUs exposed to the runner
- one warmup plus five measured repetitions per representation and geometry
- GC exposed before measured runs

Timing is descriptive evidence. No timing threshold can turn an incorrect result into a pass or a correct result into a failure.

## Results

| Geometry | MTBDD median | Antichain median | Antichain speedup | MTBDD records | Antichain boundary records | Representation reduction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 29.214 ms | 15.498 ms | **1.885x** | 7,691 | 3,004 | **60.9%** |
| 4x4 c4 | 97.144 ms | 31.942 ms | **3.041x** | 38,412 | 6,591 | **82.8%** |
| 5x3 c4 | 24.911 ms | 20.421 ms | **1.220x** | 9,071 | 5,442 | **40.0%** |
| 4x5 c4 | 899.330 ms | 378.139 ms | **2.378x** | 302,723 | 40,707 | **86.6%** |

Median support-skeleton throughput:

| Geometry | MTBDD skeletons/s | Antichain skeletons/s |
| --- | ---: | ---: |
| 4x3 c3 | 8,763 | **16,518** |
| 4x4 c4 | 6,434 | **19,567** |
| 5x3 c4 | 41,106 | **50,144** |
| 4x5 c4 | 1,441 | **3,427** |

Observed maximum antichain widths were:

- 4x3: Win 19, Loss 48;
- 4x4: Win 26, Loss 54;
- 5x3: Win 19, Loss 10;
- 4x5: Win 84, Loss 75.

## Interpretation

The ownership-antichain realization is not merely a smaller proof representation. On this runner it is also faster on every measured complete game.

The strongest current result is 4x4: the antichain solver uses 6,591 boundary records instead of 38,412 MTBDD nodes and completes in a median 31.942 ms instead of 97.144 ms, a 3.041x wall-clock speedup with 82.8% fewer symbolic records.

The 4x5 result is important for scaling direction: 40,707 antichain boundary records replace 302,723 MTBDD nodes, an 86.6% reduction, while wall time improves by 2.378x. This supports moving the CUDA profile toward compact frontier execution rather than widening the dense ownership table.

The 5x3 case is a useful caution: representation reduction is only 40.0% and wall speedup only 1.220x. The benefit is geometry-dependent, so future CUDA work must report both elapsed time and frontier size instead of assuming compression automatically produces equal speedup.

## Native Q1 baseline already available

The first successful hardware Q1 run (`20260910T065508562Z-fb451dd8`, PR #18) remains the native baseline for the dense 4x3 profile:

- total executable case: 13.285 s;
- ranked activation step: 11.852 s;
- dense W/D/L step: 1.418 s;
- dense step independently verified 4,631 states and 11,818 legal edges;
- approximate end-to-end verification throughput: 3.27k states/s and 8.33k legal edges/s;
- device-wide used-memory peak observed by Q1: 1,057 MiB;
- minimum observed free VRAM: 4,910 MiB.

These native times include process startup, CUDA-JS runtime/compiler activity, GPU work, readback and oracle checking. They are not pure kernel throughput.

## Reporting rule going forward

Every serious BSFP candidate should report, where applicable:

- complete wall time and repeated median/range for CPU reference work;
- representation size and maximum frontier width;
- support/rank throughput;
- native Q1 step and case time;
- device-wide VRAM telemetry;
- verification throughput when the child performs exhaustive oracle checking;
- explicit separation of compilation/setup, execution, readback and verification when a profile can expose those phases without distorting the implementation.

Correctness and performance remain separate axes. A candidate is not promoted solely because it is faster, and a correctness pass is not considered a sufficient performance report.

Structured evidence: `docs/research/evidence/2026-09-10-bsfp-antichain-performance.json`.
