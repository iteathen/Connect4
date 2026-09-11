# CUDA residual reuse qualification

Continue from e04cee12bc24cda63fcf889eb4ca2137837f86bf. The CPU reference has
qualified exact residual/input reuse independently of crossing assignment. This
unit moves that transform and the complete crossing-state output mapping into one
prepared CUDA DAG, retaining the existing exact cofactor kernel/collective.

Inputs are an exact residual-pair table plus `(crossing, input-pair-ID)` states.
The qualification fixture supplies exact IDs from full canonical pair equality.
The device computes each pair/input cofactor once, then emits every original
state/input crossing mask and a reference to the computed pair slot. That slot is
not a canonical next-quotient ID. Generic next-pair grouping/compaction remains
CUDA-Algorithms-owned; no private sorting/scan/grouping stack is introduced.

Owned sequential work: (1) finite factored layout and device mapping under the
existing plan lifecycle; (2) full 4x4 selected-support transition controls and the
captured 7x6 support 470594 cut five; (3) native A/B against duplicate per-state
transforms, then evidence/cleanup. Exact small layers have R3 oracle coverage;
the large fixture must match the retained baseline canonical layer digest.

The mapping kernel must reject invalid active extents, pair IDs, high crossing
bits and failed upstream cofactors before using a payload. Reset precedes all
status publication. Candidate products/slots are bounded u32 values. The plan
owns all disjoint allocations and closes them in reverse order. A failed mapping
cannot be reported as a successful partial quotient. Compare every logical
candidate and complete target set; shape/block changes must preserve meaning.

Initial native budget: 30 seconds per geometry, 120 seconds total under Q1. Keep
both representations resident only within the profile's combined finite bound.
Measure identical normalization modes, one warmup and three alternating-order
repetitions. Report transfer/readback/setup separately. No complete OQS, GPU ID
discovery, root result or generalized throughput claim follows from this slice.

Falsifiers: any candidate/set mismatch, invalid slot read, stale status acceptance,
overflow, exceeded admission bound, lifecycle leak or hidden host progression.
Retain immutable Q1 evidence and local failed runs; preserve the original solver
lane and lower-repository pins. A material semantic/shared-contract deviation
requires reassessment before widening.

## Qualified result

Native source: `5dfe1312a357c48eee53168e82fd6eba27814a06`. Q1 run
`20260911T050640911Z-b3554293`, [evidence PR #30](https://github.com/iteathen/Connect4/pull/30),
evidence commit `e99680503aae6e3d56e168437e4b1ffc5708b6c3`. All 17 published
payload SHA-256 values and their remote Git blob identities match the local
sanitized bundle. The post-publication journal event is excluded when comparing
the earlier immutable published journal.

GTX 1660 Ti 6 GiB, driver 610.74, Node 26.7.0; exact CUDA-JS
`98e2ebc942c14d63acf4dd82e912dd548c363a05` and CUDA-Algorithms
`48ee0aec9acae7776950f03ab52ab1737e598b6e` remain unchanged.

Both cases passed within the original limits: 4x4 in 2.845 s and 7x6 in 10.361 s,
including fixture construction, setup, verification and cleanup. All ten 4x4
cuts (1,409 logical / 326 residual candidates) and selected 7x6 cut five
(8,192 / 128) passed eight native repetitions each with zero mismatches and
complete target coverage. All nine native controls passed. The GPU executes
cofactor and occurrence mapping in one prepared submission.

Measured 7x6 cut-five samples, excluding warmup:

| Representation | Submit/wait samples (ms) | Median upload (ms) | Median submit/wait (ms) | Median readback (ms) | Allocated device bytes |
| --- | --- | ---: | ---: | ---: | ---: |
| Unfactored | 8.3013, 11.3893, 9.9435 | 15.6443 | 9.9435 | 76.5544 | 151,290,024 |
| Factored | 1.2580, 1.1091, 6.8013 | 3.4860 | 1.2580 | 4.2034 | 2,781,876 |

Median submit/wait improves 7.904x and allocated device arrays shrink 54.384x.
The factored third sample is noticeably slower: the ratio of total measured
submit/wait (29.6341 / 9.1684 ms) is 3.232x. Three samples support this bounded
A/B result, not a stable general throughput estimate. Setup for the two resident
7x6 plans totals 952.067 ms. Transfer savings reflect smaller buffers/readback,
not just faster device arithmetic; future GPU chaining should avoid qualification
readbacks. No standalone mapping-kernel time was isolated.

On the small 4x4 workload, summed submit/wait over 30 measured samples increases
from 19.0308 to 24.5141 ms. Tiny layers do not amortize the additional mapping
kernels. Its factored buffers also retain the small control capacity, so this
case supplies correctness/control evidence rather than a memory optimization.

Validation: all 96 local tests pass. O1 and O2 portable regression paths pass.
The expanded portable/reuse CI at source 5dfe131 passes:
[run 34564683731](https://github.com/iteathen/Connect4/actions/runs/34564683731).
No reference recurrence changed; prior incremental regression evidence remains
applicable alongside the current exhaustive 625-support reuse test.

## Next boundary and disposition

This resolves the selected device transform-plus-mapping question. CPU fixture
IDs and unmerged output slots remain explicit. Exact output-pair grouping,
variable-length record compaction, dense IDs and device chaining are still open;
generic mechanisms belong to CUDA-Algorithms issue #3, with residual equality
and crossing semantics in Connect4. The O3 evidence was appended to that issue
and its complete body read back unchanged against the submitted text. Measure that composition before widening
quotient cuts. Initial exact seed construction and later layer growth still
prevent a calibrated whole-7x6 solve-time forecast. The prior 16/40-hour figures
remain conditional scenarios, not estimates supported by O3.

The native cases and test processes exited, both runtimes closed gracefully,
and no temporary reference import modules remain. Retain Q1's immutable report
branch/PR and ignored local spool for provenance; retain the OQS worktree and
package junctions for continuation. The original feature lane and both lower
repositories remain clean at their exact prior heads. No main merge, dependency
pin change, generic downstream primitive implementation or production-lane
mutation occurred. All current source work is on the research branch.
