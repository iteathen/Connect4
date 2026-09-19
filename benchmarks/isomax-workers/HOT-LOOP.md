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
