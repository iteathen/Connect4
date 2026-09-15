# Compact chunk index with stable canonical IDs

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assess, research and plan

Continues the [probe/footprint diagnostic](2026-09-12-chunk-probe-distribution.md)
at local HEAD `0317c1c95eeae2e6b3e60040eed57198f4f5f9eb` plus the preserved
working tree. The old open-addressed table averaged 1.060 probes, so long chains
were not the main mechanism at depth 8. Uniform full-capacity index reservations
still left most bucket slots empty in the smaller chunk dictionaries.

AGENT_LOCAL and C4-0006/0010 require exact content identity, stable local semantic
IDs, separate proof ownership and initialization-owned resource contracts.
Reducing capacity to observed depth-8 counts or storing a second copy of each
canonical key was rejected. The experiment changes index layout only.

## Executed ownership and resource contract

`SlotChunkPool64` now uses a smaller Int32 bucket-head array and private Int32
collision links indexed by stable chunk ID. The canonical Uint32 pair remains
stored once. A bucket lookup reads its head and compares exact words; on mismatch
it follows the numeric link. Empty chunks retain their direct-ID shortcut.
No extra semantic/proof owner or per-query allocation was introduced.

For reserved capacity C, the key payload uses 8C bytes, bucket heads use 2C bytes
(C/2 heads), and links use 4C bytes. Total is 14C versus 16C for the old payload
and 2C-slot open-addressed index. The full C chunk capacity is preserved, including
collision-heavy keys. IDs and class references never change on rehash.

Payload/link growth in unsealed reference use allocates both backing arrays
before committing either. Bucket allocation occurs before links are rebuilt;
rehash's rebuild uses existing canonical numeric data synchronously. Prepared
search reserves everything before recursion and remains sealed. Exhaustion checks
the payload capacity first, before attempting hash growth. No resize, string key,
parsing, waiting or reporting was added to the recursive lookup.

## Qualification and review

The initial narrow test caught two issues: exhaustion reached a hash-capacity
error before the promised payload boundary, and an old test assumed the previous
index sizes. Exhaustion ordering was repaired; the test now exercises the new
growth boundary while preserving its claim that a hit cannot request growth.
The [initial failures](evidence/2026-09-12-compact-chunk-index/initial-boundary-failures.log)
are retained as evidence, not a passed qualification.

Final source passed 60 controls and four local campaigns: slot64 residual,
semantic TT replacement, ExploreHint and online dependency parallel. Controls
include 400 deliberately colliding keys across rehash; full reserved-capacity
insertion followed by explicit exhaustion; failures allocating links or bucket
heads; recovery with previously published IDs unchanged; and no typed allocation
or growth inside prepared search. Collision links remain private; tests use exact
lookup/recovery behavior and memory reporting rather than mutate those links.
Existing workflow paths cover both changed source/test files.

## Same-bounds measurement

Final measurements use the normal empty 7-column by 6-row, connect-4 search,
depth 8, hard 60-second child timeout. Four sequential cold processes alternate
baseline/candidate/candidate/baseline. All search/proof/descriptor counters match;
there is no storage growth. Root remains unknown at the depth limit.

| Mean / reservation | Baseline | Final candidate |
|---|---:|---:|
| Elapsed | 1918.67885 ms | 1928.15615 ms |
| Process CPU | 2070 ms | 2062.5 ms |
| Kernel typed bytes | 91,823,879 | 86,580,999 |
| Chunk dictionary bytes | 40 MiB | 35 MiB |

[Final comparison](evidence/2026-09-12-compact-chunk-final/comparison.json):
5 MiB saved per kernel/worker at C=262,144 across ten dictionaries, with the same
capacity. Elapsed was 0.49% higher and CPU 0.36% lower; these differences are within
run variation. Retain this as a qualified memory reduction, not a speedup or proof
of better hardware cache behavior. An earlier measurement before private-link
sealing is historical preliminary evidence; the final four-run result governs.

The [new frozen-source CPU report](evidence/2026-09-12-compact-chunk-line-cpu/line-cpu.md)
completed in 1929.5576 ms, 2093 CPU ms, with 299 mapped locations. Top sampled
locations are shared TT status (92.39 estimated CPU ms), singleton intersection
(77.27) and chunk bucket-head lookup (58.79). These are JIT-attributed samples,
not exact instruction durations. The old 1.060-probe diagnostic describes the
previous layout and must not be presented as the new chain distribution.

## Cleanup and remaining work

[Exact unit patch and source hashes](evidence/2026-09-12-compact-chunk-final/source-manifest.json)
preserve the two changed files against the pre-unit snapshot. `git diff --check`
passed. Earlier working-tree edits and evidence remain intact; baseline and
qualification artifacts are retained as provenance until integration. No test
process remains. No root trigger, remote ref or protected-main change occurred.

Remaining performance work includes shared TT probe overhead and the new layout's
behavior at larger loads. The current evidence preserves capacity and qualifies
bounded exactness; it does not establish full-root throughput, memory sizing or
readiness. Board geometry remains owned by initialization.
