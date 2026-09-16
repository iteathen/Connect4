# Eliminate repeated transition hash lookups

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

Enabling the existing direct semantic-edge table reduced local depth-8 mean
search time from **8396.886 to 2219.513 ms**, a 73.57% elapsed reduction, with
the same search/proof/descriptor counters. This is reuse of exact transition
results, not a new pruning rule or stronger proof claim.

## Assessment and structural invariant

The highest residual costs were dictionary lookups and exact comparisons. Source
inspection showed the kernel already owned a direct edge table, but the bounded
harness, online workers and standard-root coordinator disabled it. Previous
research recorded that choice in the context of retained-state memory; that
record is historical evidence, not authority to leave it disabled indefinitely.

C4-0010's ordinary semantic state is support plus normalized P0/P1 residuals.
For a stable local state ID and a column, the legal transition has one exact
result. Consequently:

`edges[stateId * columns + column] -> child state ID / terminal / illegal`

can reuse a result without hashing, string comparison, parsing, allocation or
another residual computation. Unknown remains a separate sentinel. On first
evaluation, the existing exact residual and state interners establish the result.
On subsequent visits, one direct numeric index retrieves it.

This key is worker-local semantic identity. It does not cache a shared-TT
generation, WDL/window proof, path-dependent CPC/NDC certificate or advisory
live-line frontier. Frontier/eval propagation and current proof reads still run
under their existing owners. No stale proof authority is introduced.

## Execution and qualification

Enabled `cacheEdges` in the normal bounded runner, online search workers and
the standard-root coordinator composition. The default canonical kernel already
supported this path. Its existing reservation prepares the edge array before
search and its existing state owner maintains the IDs. Resource cost is
`reserved state capacity * initialized columns * 4` bytes: **7 MiB** in this test.
No new cache implementation or duplicate semantic owner was added.

The added complete small-geometry control compares every cached transition with
uncached recomputation, including terminal and illegal outcomes, and asserts that
a repeated edge leaves state, residual and chunk interner lookup counts unchanged.
All **54** storage/decision/arena/proof/worker controls passed. Slot64 residual,
semantic replacement, ExploreHint and dependency-aware campaigns passed after
the worker change. Existing bounded workflow filters cover the worker and test
changes. The standard-root revision trigger is unchanged; no full root or remote
workflow was launched.

## Measured avoided work

The same empty 7-column, 6-row, connect-4 depth-8 search made:

| Counter | Value |
|---|---:|
| Transition requests | 4,777,114 |
| Direct edge hits | 4,355,811 |
| First-time transition computations | 421,303 |
| Requests bypassing residual/state interning | 91.18% |
| State interner calls, including initial root | 421,304 |
| Chunk dictionary lookups still executed | 2,874,596 |

These are operation counts, not counts of individual collision-probe slots.
There are still many chunk lookups on first-time transitions; this change does
not establish that every remaining lookup is necessary.

Search calls remain 4,777,115, expansions 672,690, cutoffs 2,424, local states
221,398 and local residual classes 305,714. Shared-TT behavior and descriptor
counters also match. The root remains unknown at the depth boundary. The search
explores the same bounded decisions while spending much less CPU reconstructing
known transitions.

The [source-line profile](evidence/2026-09-12-direct-edge-line-cpu/line-cpu.md)
completed in 2753.3253 ms and preserves 346 mapped source locations, frozen
source, raw samples and explicit CPU estimates. Post-search operation counters
are reported outside the timed loop. Storage-growth snapshots are unchanged.

Four isolated cold processes ran in baseline/candidate/candidate/baseline order,
each under the same 60-second external timeout:

| Variant | Search run 1, ms | Search run 2, ms | Mean search, ms | Mean CPU, ms |
|---|---:|---:|---:|---:|
| No edge reuse | 8331.5267 | 8462.2452 | 8396.88595 | 8141 |
| Direct edge reuse | 2243.0263 | 2195.9998 | 2219.51305 | 2351.5 |

Observed reduction: **73.57% elapsed, 71.12% CPU**, approximately 3.78x throughput
for this unchanged bounded workload. Mean setup changed from 46.25 to 47.24 ms.
Reserved kernel typed bytes increased from 84,483,847 to 91,823,879. This is two
cold runs per variant, not a general/full-root speed claim.

## Review, evidence and next owner

[Comparison](evidence/2026-09-12-direct-edge-reuse/comparison.json), run outputs,
qualification logs and source hashes/patch are retained together. The isolated
baseline is the actual pre-unit working tree, not the old branch HEAD. It remains
as benchmark provenance until integration. No test process remained; the diff
check passed. Work remains uncommitted with the earlier authorized changes.

The existing hash interners still establish equality for first-time results.
Shared semantic TT probes retain generation and exact descriptor checks. Do not
replace either with hash-only identity or cache proof absence without a sound
concurrent invalidation contract.

Next investigate remaining first-time transition chunk/class reuse and repeated
semantic TT descriptor/probe work. The new profile places shared-TT probing above
the reduced chunk-dictionary cost. Keep the direct semantic-edge reuse enabled in
the active execution path while measuring those remaining owners.
