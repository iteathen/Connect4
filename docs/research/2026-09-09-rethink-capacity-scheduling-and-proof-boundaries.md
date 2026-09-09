# Rethink: capacity, scheduling, and proof boundaries

Date: 2026-09-09. Research only; no maintained solver change.

## Inputs and disposition

Read remote research head `990686a094acaddc0bc37d0995759ab138d63aa4` and main `de47d43f4f4133a68973d0876a402531ef5735da` before work. Read repository/global agent guidance, original cleanup note, performance checkpoint, selective-promotion implementation, retained shared-TT kernel, and interleave control. Original sources and failed experiments remain unchanged. Only additive research artifacts are introduced.

The locally reconstructed kernel was verified byte-for-byte by Git blob hash `965c3806c92a7add544dce4777d965b3e12376d6`. It imports no external implementation. Direct Git cloning was unavailable because sandbox DNS failed; connector reads were used. No Python, native implementation, or new hot-loop routing was used.

## New controlled execution

Question: does the incompatible-domain isolation result beat an equal-total-capacity table, and can scheduling recover its benefit without partitioning?

`reference/research-prototypes/2026-09-09-rethink-controls/equal_capacity_interleave.mjs` imports the unchanged shared-TT solver and reuses the exact A1/B/A2 numeric roots from `2026-09-09-selective-promotion/dependency_interleave_isolation_bench.mjs`.

Four modes: A1/B/A2 in one N-entry table; the same order in one 2N-entry table; A1/A2 in one N-entry table and B in a separate N-entry table; A1/A2/B grouped into one N-entry table. All use the same fixed 2M-entry preallocated backing; active capacity differs explicitly. One worker, full-mode warmup, five measured repeats per mode/capacity, rotated and reversed mode order. Clearing is outside timing. Timing includes coarse view binding and the three calls, not initial arena allocation. No frontier generation, dynamic alpha-beta scheduling, or multiworker behavior is measured.

Environment: Linux x64, AMD EPYC 9V74 80-Core Processor, Node v22.16.0, V8 12.4.254.21-node.26, availableParallelism 4, one executing worker, 29,360,128 arena bytes. This is sandbox evidence, not target Node 26 qualification.

| N entries | Shared N nodes | Shared 2N nodes | Split N+N nodes | Grouped N nodes |
| ---: | ---: | ---: | ---: | ---: |
| 262,144 | 2,065,343 | 1,935,328 | 2,018,571 | 2,018,571 |
| 524,288 | 1,935,328 | 1,883,891 | 1,913,389 | 1,913,389 |
| 1,048,576 | 1,883,891 | 1,863,060 | 1,875,595 | 1,875,595 |

These counts were identical across all five repeats. Grouped N and split N+N also had identical per-task node/hit counts. All null-window results were 3. Independent full *calls* to the same kernel's solveBits returned 3 for each root (A1 1,515,100 nodes; B 1,075,176; A2 1,390,509). That is full-score consistency, not an independent numerical oracle.

Median elapsed seconds, in shared N / shared 2N / split N+N / grouped N order:

- N=256K: 0.314702448 / 0.378171091 / 0.313093703 / 0.311368243.
- N=512K: 0.333619747 / 0.433837053 / 0.357316406 / 0.345209133.
- N=1M: 0.464391084 / 0.569857160 / 0.478131804 / 0.469733684.

Timing varies materially; do not turn small differences into a reliable speedup. At equal total active capacity the larger flat table searches fewer nodes, but costs more time in this batch. That still supports a locality tradeoff, not independent proof of a superior partitioning policy. Grouping reproduces the isolation node benefit with half the active storage in this fixed task list. Its profitability inside real YBWC remains untested: reordering tasks may delay a cutoff or reduce parallelism.

Raw trials, including every task score/node/hit/time and whole-trial time, are in `evidence/2026-09-09-equal-capacity-interleave.tsv`; full-score/environment records are in the adjacent `-meta.json`. Column order normalizes task names; actual grouped execution order is A1/A2/B, as the mode specifies. These files retain unrounded recorded numbers, not just medians. Original JSONL is also retained in the accompanying sandbox evidence bundle.

## New root-entry counterexample

`root_entry_precondition.mjs` checks the legal six-ply sequence `121212`. P0 has three vertical stones in column 1 and can win immediately by playing there. The independently visible vertical proof gives score 18 under the solver's distance score.

The existing `Solver.solveBits` returns 18. Calling internal `negamax` directly with window [17,18) returns 17 in one node, because its no-immediate-win precondition was violated. This is not a defect in that internal precondition-based kernel.

The selective-promotion harness's `solve -> pneg -> prepare` entry does not discharge this precondition. `prepare` caps the root upper score at floor((41-moves)/2)=17 and has no own immediate-win guard. Its root path cannot establish the correct 18 for this valid input. Preserve this failing wrapper evidence; a corrected successor needs an entry guard or explicit validated input restriction. No claim that the two existing timed layout positions are wrong follows from this counterexample.

Raw result: `evidence/2026-09-09-root-entry-precondition.json`.

## Reassessment of the ideas

### Representation and flat sharing

Keep the two-word hot state, direct lookup, full-key validation, fixed arena, and coarse worker boundaries as the control. These have more evidence than the allocation policies. Existing kernel already implements forced defense, non-losing-move filtering, threat-count ordering, and center-biased ties. The distinct next ordering question is completed-cutoff replay, not adding a supposedly absent basic ordering system.

### Physical granule versus active working set

32K remains a measured candidate allocation granule, not a physical law. A contiguous multi-slab descriptor is still a normal larger table: calling it slabs does not itself improve locality. Requalify byte footprint when publication fields, instrumentation, or target runtime changes. The present TT arrays consume 14 bytes per entry; the selective prototype additionally allocates an 8 MiB dense logical map. Slab accounting must include those costs and distinguish assigned capacity from useful resident entries.

### Hotness versus marginal value

More task nodes do not establish that more memory will save more work. Hotness can reflect cold caches, lost sharing, changed windows, or speculation. A hindsight top-three-signature replay that loses disproves that policy on that workload, not every dependency-aware policy or any optimal upper bound. Allocation should eventually use the *marginal* improvement from capacity, with selector/relocation cost included, not node share alone. All collection remains at coarse boundaries or in separate diagnostic runs.

### Exclusivity is sufficient for no lost cross-domain reuse, not necessary for cache correctness

Different dependency signatures can overlap in descendants. That explains lost reuse, not false scores when full-key publication is sound. Physical isolation can be correct while duplicating cache entries. Whether that tradeoff is profitable is separate from whether a descriptor certifies all its contents for proof-only cleanup.

Do not silently relax canonical sharing requirements. If one physical residency per canonical state and disjoint fixed regions are both demanded, connected overlapping task-reachability sets must share a descriptor. Requiring a completely exclusive frontier while also retaining unresolved ordinary subtrees is a real design tension, not an allocator defect. It does not imply every task must be expanded until a chosen cell is occupied.

### Better near-term alternative: dependency-aware scheduling on the shared table

Use dependency information first as an affinity hint among already-ready coarse tasks, while preserving eldest-first proof priority and legal alpha-beta dependencies. Grouping compatible reuse temporally may replace some physical isolation. Do not impose a global domain barrier, eagerly manufacture tasks, or delay a promising cutoff just to improve locality. Compare against unchanged scheduling, equal-budget partitioning, and an active-size-tuned flat table. This is proposed, not yet an integrated speedup.

### Fixed-depth negative is narrower than a domain-formation impossibility result

The 113x task growth measured one fixed-depth BigInt/object-heavy coordinator and one chosen discriminator. It is evidence against that construction, not every adaptive coarse boundary. Natural resolved task roots, a bounded affinity queue, or selective shallow split points remain candidates; none requires mid-negamax redirection. Do not pursue a new frontier generator before testing cheaper scheduling and equal-resource controls.

### Placement, content guarantees, and lifetime need separate evidence

A placement map does not prove every resident entry satisfies a newly promoted child's facts. Retained halves of a former broad table can contain other families' entries. Full-key checks make those leftovers cache-safe, but a child-only content certificate would be false. A fallback shared by several logical IDs has only facts guaranteed across every possible writer/content lineage. No new per-node provenance is recommended: retain a conservative broad certificate, or establish a clean certificate at a drained boundary.

Proof-only death must account for every permitted future search region, including queued work and later mandatory proof passes. A sibling cutoff or a completed task does not make its descendants globally unreachable. Actual game-root advancement often gives a stronger irreversible contradiction. Heuristic cache replacement and proof of impossible future reuse are different justifications; do not relabel one as the other.

### Forwarding and quiescence

Keep direct forwarding and stale-holder drain. The current prototype resolves in `Pool.run` *before enqueue*, not when a worker starts. This is safe for its full-drain replans, but an integrated retiring-descriptor protocol must count queued already-resolved assignments as holders, or move resolution to actual dispatch. Worker exit, delivery failure, cancellation, and queued work are coarse lifecycle cases, not reasons for per-node refcounts.

Do not add duplicate detection without a source of duplicates. One canonical mapping authority can often avoid provisioning duplicates in the first place. Equal projections establish shared classification, not full-board equality or completed-proof equality.

### Publication and correctness qualification remain separate

The retained TT protocol uses ordinary key/value accesses bracketed by atomic version reads. ECMAScript distinguishes per-element tear freedom from ordering and multi-field snapshot consistency. Benchmark agreement on x64 is not a language-level no-false-hit proof. Require an explicit memory-model argument for the exact protocol, including version wrap and slot reuse. This unit does not provide that proof or claim a reproduced hardware false hit. Do not substitute XOR/checksum collision probability for full identity correctness.

Null-window outputs are bounds unless independently established exact. Stable node counts and matching score vectors are valuable diagnostics, not independent solver oracles. Compare task results by stable task ID, particularly when execution order changes.

### Search objective and runtime controls

The recorded Fhourstones reference reports W/D/L, while this Node kernel converges a distance-sensitive score. Match the objective before comparing empty-board proof work. The old timing stays a rough throughput reference, not a same-obligation target. Microkernel NPS without TT and multicore aggregate NPS also measure different work. Do not infer that a successful four-worker scaling test rules out scheduler, cache, quota, or critical-path bottlenecks for the composed solver.

## What follows

The next performance experiment should be an integrated, eldest-first-preserving affinity scheduling control on the flat shared TT, not a compulsory exclusive-domain frontier. First repair/guard the benchmark root entry and retain independent correctness vectors. Keep move-order replay in a separate experiment; do not require an unproven allocator to be finished before testing it. Keep cleanup integration deferred until placement and conservative content/lifetime guarantees are explicit.

Reproduce from repository root:

```sh
node reference/research-prototypes/2026-09-09-rethink-controls/equal_capacity_interleave.mjs 5
node reference/research-prototypes/2026-09-09-rethink-controls/root_entry_precondition.mjs
```

Relevant external primary references (concept/standard checks only; no external implementation imported):

- ECMAScript memory model, sections 29.1, 29.6, 29.7, 29.11: https://tc39.es/ecma262/multipage/memory-model.html
- Fhourstones author's benchmark description and W/D/L examples: https://tromp.github.io/c4/fhour.html

No new multicore isolation result, release qualification, completed empty-board solve, or integrated allocator/cleanup success is claimed by this unit.
