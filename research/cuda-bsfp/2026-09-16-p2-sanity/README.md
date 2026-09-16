# P2 sanity repair and measured optimization integration

Native tested source: `b16d77023d93f84bb79a2308942bf7d7ad0dbfaf`.
Branch: `research/bsfp-tensor-overflow-dominance`.
Starting live source: `86f588455ac74307a211d2e0588bec3ea3985e9a`.

The repaired and optimized P2 path matches every reference frontier on native
4x3 c3, 4x4 c4 and 5x5 c4. The 7x6 case reaches a clean 120-second timeout;
it has not solved the root.

## Authority and research disposition

The review inventory in [manifest.json](manifest.json) covers 50 BSFP/OQS
research documents, C4-0006 through C4-0009 and their 11 profiles, and both
repository agent files. Account-global agent guidance was also read.
The pinned CUDA-JS memory/prepared-execution/view/composition contracts and
Tensor SPEC-0005/SPEC-0009 remain the lower-layer authority.

The research separates mathematical validity, portable composition, native
correctness and measured benefit. Reflection and restricted cofactor preservation
have exact transport/order proofs applicable to P2's full Boolean ownership
domain. They are integrated here. Clause legal-slice pruning, completion
quotients and residual reuse have different context/representation obligations;
they are not silently substituted for P2's full-domain frontiers.

Generic absorption and scalable segmented normalization remain owned by
[CUDA-Algorithms #12](https://github.com/iteathen/CUDA-Algorithms/issues/12) and
[#11](https://github.com/iteathen/CUDA-Algorithms/issues/11), both observed open.
The newer warp cofactor profile requires a different dependency tuple and is
not available through the unchanged P2 pins. No private generic GPU algorithm
or search fallback was introduced.

## Repairs

1. **Incorrect loss cofactor.** In the compact runner, an unbraced `else`
   belonged to the inner membership test instead of the mover condition.
   P1 loss cofactors became empty, and some P0 cases retained invalid caps.
   Braces restore C4-0008 valuation substitution.
2. **Insufficient P2 correctness gate.** The actual recurrence can now be
   independently qualified at every support, with a qualification-only BigInt
   reducer or with its native CUDA reducer. The latter compares all physical
   supports, including reconstructed reflected occurrences, to the unchanged
   full-lattice reference. Native execution still uses the GPU service.
3. **Host argument-stack boundary.** Valid 150,000-record input buckets raised
   `RangeError: Maximum call stack size exceeded` through `push(...records)`.
   Packed normalization, runner publication, reducer packing and Tensor frontier
   publication now append without converting records into function arguments.
   Both minimal/maximal large-bucket controls and a 150,000-survivor Tensor
   publication control pass. The latter checks host capacity, not fake-runtime
   numerical execution.
4. **Qualification coupling.** The runner no longer eagerly imports CUDA merely
   to test its semantics/configuration. Optional Tensor tests import the reducer
   after dependency availability is established. Progress now counts the
   full-board support rather than omitting it.

Repair commit: `816e416`. Optimization/capacity repair commit: `b16d770`.
The earlier buggy runner's timings are not a valid semantic speedup baseline.
Its successful callable Tensor A/B evidence remains useful primitive evidence.

## Integrated optimizations

- Horizontal reflection: evaluate the smaller-index support representative;
  transport a mirrored child back to physical coordinates before its cofactor.
- Cofactor preservation: skip normalization only for upward/P1 filtering and
  downward/P0 filtering followed by removal of the common landing bit.

Both default on and can be independently disabled for A/B measurements.
Reflection preserves exact frontier sets after transport, including bits
31/32/41. It does not discard ownership assignments. Counters distinguish
the full support lattice from evaluated representatives.

## Qualification

`node --test`: **110 passed, zero failed/skipped**.
Actual P2 recurrence tests compare every frontier over five complete geometries,
all four optimization combinations, and shard widths 1/17/256.

Native GTX 1660 Ti, 6 GiB, driver 610.74, Node 26.7.0:

| Run | Scope | Result |
|---|---|---|
| 20260916T081153148Z-8c752914 | Repaired baseline 4x3/4x4/5x5 | Every frontier matches; W/D/D |
| 20260916T081642344Z-301c4264 | Optimized 4x3/4x4/5x5 | Every frontier matches; W/D/D |
| 20260916T082019392Z-135e3f63 | Same-source corrected 5x5 baseline | 7,776 supports match; Draw |
| 20260916T082048065Z-de2d9aca | Same-source optimized 5x5 | 7,776 physical supports match; Draw |
| 20260916T082127123Z-b08a6b9f | Forced Tensor overflow, 4x3 | All 256 supports match; Win |
| 20260916T081744627Z-a7fd3082 | Optimized 7x6 | CLEAN-TIMEOUT; no root result |

The forced-overflow control lowers the ordinary frontier capacity to four,
under a 30-second case budget. It recovers **122/122 jobs**, zero failures,
maximum recovered frontier 19, and executes 350 resolved Tensor runs.
This verifies integrated recovery on the control; it does not independently
verify every recovered 7x6 frontier.

The paired 5x5 measurements were sequential on the same clean source, with
no concurrent test suite. Both enable the full-frontier observer. Reference
preparation is outside solve time; comparisons are inside it. These are single
paired observations, not a repeated median or a general throughput estimate.

| Metric | Corrected baseline | Optimized |
|---|---:|---:|
| Solve wall, ms | 13,848.1289 | 8,354.0746 |
| Evaluated supports | 7,776 | 3,996 |
| Generated pairs | 61,177,131 | 32,002,452 |
| Stored boundary records | 1,044,159 | 536,209 |
| Peak resident boundary records | 267,675 | 136,626 |
| Structural preparation, ms | 851.9073 | 379.1889 |
| GPU reducer wall, ms | 5,845.0961 | 3,776.8018 |
| Finalization/observer, ms | 6,137.3456 | 3,273.0205 |
| Device-wide peak memory, MiB | 905 | 905 |

Observed solve speedup: **1.658x**, **39.7% less time**.
Generated pairs fall **47.7%**; resident records fall **49.0%**.
Tiny 4x3/4x4 cold runs remain around one second and are setup dominated.

## Bounded 7x6 result and remaining bottleneck

Case duration 120,217 ms; callable A/B 2,222 ms; solver step 117,981 ms.
Q1 shares the original 120-second case budget between A/B and solver.
No timeout or VRAM limit was increased.

Callable Tensor A/B passed exact equality:

- packed median: 14.2762 ms;
- Tensor-only median: 34.9194 ms;
- packed-to-Tensor median: 33.1650 ms;
- workspace: 164,544,512 bytes, independent limit 201,326,592 bytes.

Resolved-SIMT overflow remains at 67,108,864 bytes. CUDA-JS solver policy remains
256 MiB total / 128 MiB allocation / 16 MiB transfer; callable A/B uses
256/192/16 MiB. Conservative Q1 admission remains 543,169,548 bytes.

Last crash-surviving snapshot at 115,317.9095 ms:

- 175 representative supports completed, five completed ranks;
- 2,229,118 generated pairs from completed batches; active batch excluded;
- 17 overflow attempts, 16 completed/recovered jobs, zero reported failures;
- maximum recovered frontier 5,891; one recovery still active;
- 2,159,232 completed overflow candidates; 2,421,120 admitted to normalization;
- 6,983 Tensor runs; 1,619,995,769 completed comparison pairs;
- completed overflow wall 104,217.4451 ms;
- Tensor upload/execution/readback host intervals:
  6,855.9583 / 77,881.5946 / 3,091.9516 ms.

The solver peak is 909 MiB device-wide; the A/B peak is 993 MiB.
No unexpected solver exception precedes timeout. Q1 terminates the process;
graceful solver teardown at timeout is not claimed. After all tests, GPU memory
returns to the observed 769 MiB baseline, with 5,198 MiB free.
Successful control children exit zero through asserted graceful runtime close.

The remaining large-case cost is still Tensor overflow normalization. Roughly
90% of the last progress interval is accounted for by completed overflow wall
time. These host intervals include orchestration and are not pure kernel time.
No SM occupancy, utilization or memory-bandwidth efficiency was measured.
Avoid extrapolating an empty-board solve time from this partial rank.

The next optimization should compare real overflow replay against a qualified
packed device normalization/absorption path, retaining exact output checks.
The callable A/B is slower than packed on this GPU, but it is a different
workspace/execution contract from resolved overflow and cannot alone select its
replacement. Remove repeated transfers/submissions only through accepted public
contracts. At 5x5, host terminal finalization also remains material.

## Evidence and cleanup

[evidence/results.json](evidence/results.json) retains selected structured Q1
results, configuration, telemetry, A/B samples, rank data and last progress.
It is a sanitized review packet, **not official Q1 publication**. Every run used
`--no-publish`; original immutable journals/logs remain in the ignored local
`.cuda-bsfp-qualification/runs/<run-id>/` spool. Machine paths are excluded.
No temporary scripts, workflows, replacement refs or lower-repository changes
were introduced. New qualification helpers/tests are retained infrastructure.
