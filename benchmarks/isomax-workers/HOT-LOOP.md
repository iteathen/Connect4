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
