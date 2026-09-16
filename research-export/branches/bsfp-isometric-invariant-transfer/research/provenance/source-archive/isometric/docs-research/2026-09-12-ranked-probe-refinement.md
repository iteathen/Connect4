# Ranked probe and frontier operation refinement

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assessment and contracts

Continues the [latest pre-change depth-8 profile](evidence/2026-09-12-direct-edge-line-cpu-rerun/line-cpu.md),
from local HEAD `0317c1c95eeae2e6b3e60040eed57198f4f5f9eb` plus the preserved working-tree changes.
AGENTS, global guidance, AGENT_LOCAL, C4-0001, C4-0006, C4-0010 and current routers were read.
This is performance-only work: no terminal, parity, proof-bound, ordering or search-policy change.
Dimensions continue to come from initialization. No root trigger or remote refs changed.

## Ranked review and execution

| Pre-change source timing item | Decision and structural justification |
|---|---|
| TT status read, 134.14 estimated CPU ms | Retain the atomic publication observation. Move the separate generation read after hash rejection: a rejected hash carries no proof authority. Exact payload comparison remains between generation reads and final status validation. No negative-proof cache is introduced. |
| Chunk hash lookup, 107.31 ms | The all-zero pair has one immutable dictionary-owned ID. Remember that ID after its first successful insertion; subsequent empty pairs bypass hashing/probing. Retain exact two-word comparisons for other keys. No new descriptor or payload owner. |
| Singleton intersection, 85.51 ms | Combine low/high intersections with bitwise OR and test zero once. Remove unsigned conversions that cannot affect zero/nonzero truth. Preserve all ID/mask domain checks, including the high sign bit. |
| Descriptor hash composition, 63.72 ms | Retain in this unit. Immutable state IDs could support composed-hash reuse, but that requires an explicit reserved metadata/lifetime decision. Do not cache shared-proof absence or generation validity as if it were immutable semantic content. |
| Frontier overlap check, 63.72 ms | For the same typed array, determine overlap using numeric frame offsets. Disjoint frames fuse copying and cancellation: each output word is written once, avoiding the second read/write of the opponent slice. Distinct overlapping views retain memmove-before-mask semantics. |
| Class hash lookup, 62.04 ms | Retain exact first-time class interning; direct semantic edges already bypass repeated transitions. A hash alone cannot establish residual equality. |
| Hash-target validation, 45.27 ms | Retained: the public helper accepts arbitrary targets. A future internally owned, bound target can remove these checks without weakening the external contract; this unit does not expose an unchecked target API. |
| Block-transition class lookup, 40.24 ms | Retain exact canonical lookup. Existing parent-chunk reuse and direct-edge caching remain enabled. |

The changed successful fast paths use numeric words/IDs/offsets, no string keys,
parsing, new arrays, new objects, queues or waits. Existing broader hot-path
validation and diagnostic string arguments have not all been removed; this is
not a claim that the entire engine meets the requested final hot-loop standard.
Reporting and profile serialization remain outside timed recursion. Copying the
necessary parent frontier into a distinct child frame preserves advisory path
state; no board reconstruction is involved.

## Qualification and measurement

57 contract controls passed. New controls cover empty-ID reuse across dictionary
growth, invalid input before reuse, generation-read elimination on hash mismatch,
same-hash replacement immediately before generation acquisition, and independent
frontier-mask results across both movers, three geometries and same/disjoint/
overlapping views in both directions. Existing generation, poisoned-slot,
allocation, exact ordering and worker failure controls remain green.

Eight local campaigns/controls passed: slot64 residual, semantic TT replacement,
ExploreHint, online dependency parallel, independent terminal boundary, pruning,
proof lifecycle and proof reuse. Logs are in
[unit evidence](evidence/2026-09-12-ranked-probe-refinement/contracts.log).
All changed sources/tests are already included in the relevant bounded workflow
path filters. These were local executions, not remote CI runs.

Four sequential cold runs, baseline/candidate/candidate/baseline, used the normal
empty 7-column by 6-row, connect-4, depth-8 test with a 60-second child timeout:

| Measurement | Baseline mean | Candidate mean |
|---|---:|---:|
| Search elapsed | 2155.39945 ms | 2080.63725 ms |
| Process CPU | 2320.5 ms | 2258 ms |
| Reserved kernel typed bytes | 91,823,879 | 91,823,879 |

[Exact comparison](evidence/2026-09-12-ranked-probe-refinement/comparison.json):
3.47% lower mean elapsed and 2.69% lower mean CPU. Individual timings overlap;
two runs per variant do not establish a robust speedup. Search/proof counters,
results and maximum bucket scan are identical; no search storage grows.
The empty chunk remembers one additional scalar per dictionary, outside typed-byte accounting.

The [new frozen-source CPU profile](evidence/2026-09-12-ranked-probe-line-cpu/line-cpu.md)
completed in 2194.9764 ms, 2282 CPU ms, with 305 mapped locations. Highest lines
remain TT status (131.59 estimated CPU ms), chunk lookup (117.15) and singleton
intersection (65.80). Sampling/JIT attribution means these are not precise
per-instruction durations or proof of each change's isolated contribution.

## Review, cleanup and next owner

Reviewed the unit delta against the pre-edit snapshot; `git diff --check` passed.
The snapshot, [source hashes and unit patch](evidence/2026-09-12-ranked-probe-refinement/source-manifest.json)
are retained as provenance until integration. Prior working-tree changes and
historical evidence are preserved. Full-root sizing and repository integration
remain unresolved; no new full root was run.

Next owner: reduce repeated semantic descriptor/hash preparation through an
explicit initialization-bound capability, then assess remaining nonempty chunk
lookups. Do not remove synchronization, exact comparison or validation merely
to improve a timing line. Continue measuring under identical bounded conditions.
