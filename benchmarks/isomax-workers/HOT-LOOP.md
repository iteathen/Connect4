# Native hot-loop restoration

Research direction: Josh Oshiro. Implementation/qualification: OpenAI ChatGPT.

Baseline: fcfdd1fb2ae69412a000d7f977556ed78ef8f372.
This implementation pass restores the allocation/storage discipline documented
in the September 12 ranked hot-loop and preallocated-storage qualifications.
It does not transfer the old Negamax proof policy to IsoMax.

First unit: scalar native frontier codes, preloaded immutable proof-facing
conclusions, direct singleton metadata writes, empty certificate-path bypass,
and a gravity-only legal-column test after native terminal classification.
Certificate guards and contradiction checks remain active when configured.
The numeric code is an execution representation, not a new proof identity.

The existing 68 controls and two new hot-loop controls pass. The new controls
exhaustively classify singleton/pair threats across both mask words, preserve
own-win precedence, and trap conclusion freezing/empty certificate collection
during a nontrivial solve.

The initial paired three-root screen retained identical exact decisions and
node counts (2,643,905 serial; 2,644,522 one worker). Serial medians were
2518.79 -> 2472.12 ms; one-worker medians 2839.76 -> 2764.10 ms.
One targeted test overlapped part of this preliminary screen; use the final
isolated rerun for performance conclusions. Raw preliminary logs are Git-private
under hot-loop-unit1. No root-solve or universal speedup claim follows.

Reproduce against a detached baseline checkout:

```text
node benchmarks/isomax-workers/compare-hot-loop.mjs <baseline-directory> <output-directory>
```

The comparator alternates fresh processes, reverses order for the middle sample,
checks exact decisions, records node work, and includes worker startup/cleanup.
It accepts a dirty candidate while recording the tracked diff hash; final
evidence must also identify the committed tested source.

Second unit: one scheduled node-control check replaces the per-node inherited
wrapper; native unwind precedes continuation packaging. Ordinary worker tasks
reserve/seal residuals, chunks, reference widths and exact-cache storage before
entry. The move-order scan is indexed and uses its proven ongoing/valid-column
precondition. The fixed-storage contract is for the normal bounded worker path;
the explicit synchronous research/certificate APIs are not certified by it.

72 controls pass. The actual task-entry regression traps buffer construction,
typed-array copies/subviews, array iterators, Array.from and JSON formatting
during 4096 recursive entries while new classes are created. Sealed capacity
failures are explicit. Existing quantum, continuation-work, forced/mirror,
first-win, deadline, worker-death and cleanup controls remain passing.

The isolated final second-unit comparison against fcfdd1fb is retained in
hot-loop-results.json. No tests ran concurrently. Three paired samples:

| Execution | Baseline median ms | Candidate median ms | Reduction | Calls |
|---|---:|---:|---:|---:|
| Serial control | 2504.06 | 2355.69 | 5.93% | 2,643,905 |
| One actual worker, including lifecycle | 2822.58 | 2752.23 | 2.49% | 2,644,522 |

All samples preserve exact WDL/actions and call counts within each execution
mode. This compares the combined first/second unit, not a causal attribution
of the total saving to reservation alone. Neither multi-core scaling nor an
empty-root solve follows from these bounded three-root timings.

Third unit: manager q deduplication reuses exact numeric triple storage rather
than a formatted string. A dedicated reporting worker serializes and writes
periodic evidence; manager/search execution never awaits periodic output.
Final cleanup drains accepted reports before process exit. A timeout test
verifies prepared/progress/final ordering and worker-thread provenance.

The prior I1 source seam would have put its bound inside the now-optional
certificate block. The harness now injects outside that block and checks that
bounds actually execute without certificates. Obsolete I6 empty-fact timing is
retired; its historical samples remain. Physical differential qualification
still covers 132 roots and 330 actions.

Final runtime source: 1441f513b2cac31b4c083f4091147440af6fcb9b.
76 tests pass locally and in CI run 35459938641. The final four-worker comparison
is in hot-loop-four-workers.json: medians 2493.73 -> 2379.37 ms (4.59% lower).
Three samples each, same exact WDL/moves. Parallel calls vary with completion
order (baseline 7.41–7.60 million, candidate 7.37–7.41 million); this measures the
whole execution change, not identical-work instruction savings.

The normal 30-second empty-root smoke is in hot-loop-empty-root.json, run
20260919T180404665Z-isomax. It reached the unchanged 29-second internal deadline
(one second reserved inside the outer budget), with no earlier storage/runtime
failure. 66,610,937 settled calls, four active search workers, 28 periodic
records, 962,416,640 bytes peak process RSS, all workers and the child exited.
Root WDL is unknown. The executor's poison/fault counters at shutdown are its
existing fail-closed abort handling, not an earlier solver failure. Compared
with the earlier single smoke (64,763,476 calls, 937,029,632 bytes), memory is
slightly higher; these nondeterministic single observations are not a solve
speed comparison or a proof of multicore efficiency.

## Reviewed boundary and remaining costs

- Replay import, tables, scratch, masks and reversible history are prepared
  outside recursive execution. The native packed representation remains active.
- Recursive frontier/ordering/play/undo/cache paths use numeric state and
  preexisting storage. No runtime string-key formatting, conclusion object
  construction, per-node promises, reporting, buffer clone/copy, widening or
  rehash is required on the successful ordinary-worker path. Scalar writes
  implementing residual transforms/history are still necessary computation.
- Typed constructors/copy APIs/iterators/formatting are trapped by tests; source
  review covers literal-object sites. This is not proof of zero V8 internal
  allocation, optimal generated assembly or all possible runtime behaviors.
- Errors remain explicit cold diagnostics. The normal quantum throw is a
  precreated symbol, not a new Error. Its catch/packaging is outside recursion.
- Manager dependency nodes and worker transport still allocate at task
  boundaries. Preparation may copy/rehash warm storage between tasks. The
  reporter has its own isolate and final cleanup waits for its FIFO drain.
- Custom certificate/RBA synchronous research paths still have object-based
  guards/results. They are not silently enabled in the fixed-storage worker.
- Repeated q hashing/reflection comparisons, residual interning/normalization,
  validation crossings, task-boundary allocation and duplicate parallel proof
  work remain candidates. Dense own-move normalization is preserved: the older
  lazy mover's 7x6 regression is evidence against casually replacing it.

The supported exact identity, first-win stopping, advisory move-order method,
worker queue and continuation reuse are retained. No new quotient, proof
shortcut, GPU implementation or timeout extension was introduced.
