# Chunk probe distribution and accessed footprint

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assess and plan

Continues the chunk lookup target at local HEAD
`0317c1c95eeae2e6b3e60040eed57198f4f5f9eb` plus the preserved working tree.
AGENT_LOCAL/C4-0010 require exact canonical equality, separate proof authority,
and initialization-owned resources. The previous cheaper hash's small timing
change did not establish a reliable speedup; the next question is whether its
remaining cost is collision scanning or the ordinary index/key access.

The production interner reads a candidate ID from an Int32 hash table, then reads
the canonical Uint32 pair by that ID. Hashes select candidate locations; the two
words establish equality. Empty chunks already use direct IDs. Initialization
reserves 262,144 chunk IDs and 524,288 hash slots for each of ten dictionaries in
this bounded profile. These are resource targets, not universal geometry limits.

## Execute and qualify

An isolated copy of current source received exact counters for slots examined,
candidate reads, rejected collisions, empty bypasses, probe histograms and distinct
accessed address blocks. Counters reset after normal engine initialization and
reservation. The unchanged normal search ran from empty 7 columns by 6 rows,
connect 4, depth 8, with its 60-second child timeout. No production source was
modified or instrumentation retained in its hot loop.

[Instrumentation and source hashes](evidence/2026-09-12-chunk-probe-diagnostic/source-manifest.json)
and the [raw result](evidence/2026-09-12-chunk-probe-diagnostic/result.json) are
retained. The [summarizer](evidence/2026-09-12-chunk-probe-diagnostic/summarize.mjs)
requires identical result, every search/proof/descriptor counter, engine-reported
memory and unchanged engine storage-growth counters against the uninstrumented
baseline. It also checks that probe counts reconcile with rejected collisions,
histograms and per-dictionary lookup totals.

Instrumentation itself allocates address-touch arrays and histograms before
search, outside engine memory reporting. Its wall/CPU timing and process memory
are therefore not baseline performance evidence. No allocation occurs per probe.
Existing [production line timing](evidence/2026-09-12-cheap-chunk-line-cpu/line-cpu.md)
still applies to the unchanged source, with its sampling/JIT limitations.

## Findings

| Search-only measurement | Result |
|---|---:|
| Hashed chunk lookups | 2,724,741 |
| Empty-chunk direct bypasses | 149,835 |
| Hash-table slot reads | 2,888,962 |
| Exact candidate-key reads | 2,728,231 |
| Extra reads caused by rejected collisions | 164,221 |
| Average slots per hashed lookup | 1.06027 |
| Lookups examining exactly one slot | 94.754% |
| Maximum slots in one lookup | 10 |

The 20 bootstrap intern calls are excluded by the post-initialization reset.
Long collision chains are not the dominant mechanism at these bounds. Even
eliminating every collision would remove only 164,221 of 2,888,962 index reads;
it would not eliminate the 2.72 million initial lookups or successful exact-key
checks. This is an operation-count observation, not a CPU-time savings estimate.

The [per-dictionary table](evidence/2026-09-12-chunk-probe-diagnostic/report.md)
shows strongly unequal use. All ten dictionaries reserve 4 MiB apiece, but unique
chunk counts range from 52 to 132,068. The largest dictionary has 25.19% hash-table
occupancy, average 1.112 slots and maximum 10; the smallest has 0.010% occupancy
and every query examines exactly one slot.

Across the run, observed lookup reads touched 4,917,632 bytes (4.690 MiB) of
distinct aligned 64-byte address blocks in the index and canonical payload
arrays, out of their combined 40 MiB reservation. This includes only reads
instrumented at lookup, not initialization, insertion writes or all other engine
accesses. A 64-byte block here is an accounting unit, not a claim about this CPU's
cache-line size. Cache residency, eviction frequency, misses and memory latency
were not measured. Unused reservation alone does not establish slow CPU access.

## Review, cleanup and decision

Production engine files remain byte-identical to the pre-diagnostic manifest.
The isolated diagnostic source/results are retained as provenance until
integration. No test process remains. The root trigger, board-size ownership,
semantic representation, hash function and proof policy were not changed.

Do not spend another unit merely shortening this hash or caching cheap identity
operations. The next useful performance question is the cost of the initial
index access and dependent canonical-key read, including actual access locality.
Any compact per-dictionary reservation must have an explicit task/resource
contract; do not reduce capacity to observed depth-8 counts and imply full-root
support. Further CPU-memory causation needs a controlled layout comparison or
hardware-counter evidence. This diagnostic does not justify a new engine change
or a full-root launch by itself.
