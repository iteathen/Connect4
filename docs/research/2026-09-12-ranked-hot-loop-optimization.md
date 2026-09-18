# Ranked hot-loop operation removal

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The first four locations in the frozen CPU line profile were chunk dictionary
lookup, semantic TT status observation, chunk equality, and the terminal column
loop. This unit handles those locations, grouping the two chunk operations by
their common exact key. It does not claim the remaining ranked inventory is done.

## Assessment, research and execution

Read the actual storage owners and C4-0001/C4-0006/C4-0010. Preserve exact
two-word chunk equality, semantic TT generations and lifecycle publication,
and the playable-singleton meaning of tactical closure. Geometry remains owned
by initialization; no standard-board constants enter the new decisions.

| Original rank | Owner/location | Eliminated work and shared invariant | Qualification |
|---|---|---|---|
| 1 and 3 | `quotient-slot64-residual-pool-v2.mjs`, chunk `intern`/`equals` | A validated Uint32 pair is the entire exact key. Read it once; compare directly against dictionary-owned pairs. Remove repeated equality validation and string diagnostic-label arguments from the probe loop. Parent reuse compares the same immutable chunks directly. Move hash growth to confirmed insertion so a hit cannot trigger rehash. | Exact graph/reference campaigns, malformed-key controls, hash threshold and growth controls. |
| 2 | `quotient-semantic-shared-tt.mjs`, `stableDescriptorHandle`/`probe` | Bucket-locked insertion takes the first EMPTY slot. Replacement/poisoning never create holes; quiescent reset clears all slots. Stop at first EMPTY and pass the already-observed status into the stable check. No generation, exact descriptor or post-read coherence check is removed. | Collision/prefix, proof-writing/poison, reset and publication interleaving controls; shared replacement/lifecycle campaigns. |
| 4 | `quotient-native-negamax-support-layout-kernel.mjs`, `tacticalCode` | Every immediate win/forced-response check below is a playable-singleton projection. If neither canonical class has any singleton, none can be playable. Non-full gravity support guarantees a legal continuation. Query existing singleton masks once and skip the whole column scan in that case. | Independent physical-board terminal oracle across variable geometries and standard-board sampled prefixes; exact graph and pruning campaigns. |

These are operation-removal and representation-use changes, not stronger
pruning, new CPC/NDC claims, changed eval, or new semantic caches. Exact chunk
comparison remains after hashing. There are no new string keys/comparisons,
parsing, temporary arrays, per-node promises, copies or reporting calls in the
changed successful paths. Cold diagnostics and required storage growth remain.
The entire active path is not yet certified free of all string uses or avoidable
work; descriptor validation and the remaining owners are still on the inventory.

## Bounded evidence

Forty storage, decision, arena and proof controls passed. Slot64 residual,
semantic replacement, ExploreHint, dependency-aware and independent terminal
campaigns passed. The terminal campaign checked 1,716,141 positions with zero
mismatches, including high cells, both players, all win directions, forced moves,
multiple threats, exhausted/full draws and own-win precedence. Proof lifecycle
and proof reuse diagnostics also passed. The independent pruning campaign passed
after the terminal shortcut. All test processes exited; the final diff check passed.
Logs are retained in the
[evidence directory](evidence/2026-09-12-ranked-hot-loop/contracts.log).

Separate staged profiles used the same empty 7-column, 6-row, connect-4 depth-8
normal search and 60-second child timeout:

| Stage | Profiled search ms |
|---|---:|
| Before this unit | 10763.457 |
| Chunk key changes | 10738.424 |
| Plus TT prefix termination | 9702.0586 |
| Plus singleton scan elimination | 8426.5193 |

These single profiles localize costs; they are not independent causal estimates
of each change. For example, chunk `equals` disappears from sampled execution
but its comparisons move into `intern`. The first stage alone establishes no
speedup. Function/line attribution is an explicitly documented sample estimate.

The [latest 504-location line report](evidence/2026-09-12-singleton-filter-line-cpu/line-cpu.md)
contains frozen source, raw profile and samples, code excerpts and estimated CPU
milliseconds. [Method comparison](evidence/2026-09-12-ranked-hot-loop/profile-comparison.json)
shows TT `stableDescriptorHandle` plus `probe` self estimates falling from about
703 to 331 ms, and `tacticalCode` from 527 to 109 ms. Helper costs are separate;
do not infer total operation cost from a single function or add overlapping tables.

The final unprofiled comparison used four isolated cold processes in
baseline/candidate/candidate/baseline order, each under the same 60-second timeout.
The baseline preserves the exact pre-unit working tree rather than old HEAD.

| Variant | Search ms, run 1 | Search ms, run 2 | Mean search ms | Mean CPU ms |
|---|---:|---:|---:|---:|
| Baseline | 10251.0813 | 10068.6519 | 10159.8666 | 10047 |
| Candidate | 8267.6723 | 8270.0755 | 8268.8739 | 8180 |

Observed reduction: **18.61% elapsed search time, 18.58% CPU**. This is bounded
local evidence from two runs per variant, not a full-root solve claim. All result,
search/proof/descriptor counters and retained memory match. Only maximum bucket
scan telemetry deliberately differs, 8 to 5; the reporter explicitly preserves
and discloses that difference instead of calling every diagnostic counter equal.
Calls remain 4,777,115, expansions 672,690, cutoffs 2,424, local states 221,398,
and the depth-limited root remains unknown.

## Review, cleanup and next owner

The empty-prefix shortcut is valid only with this arena's first-empty insertion,
no-hole retirement and globally quiescent reset contracts. Tests retain full
occupied-bucket scans and verify that PROOF_WRITING/POISONED slots never terminate
the prefix. A racing insertion after an empty observation can produce a cache
miss; the subsequent probe observes the publication. It cannot authorize a proof
for the wrong descriptor/generation.

Changed production owners are covered by existing slot64, replacement,
dependency and ExploreHint workflow filters; the new controls are included by
their storage/arena test entries. Local bounded execution is recorded here;
no remote CI or full root was launched, and the root revision trigger is unchanged.
Whole-repository integration remains pending, including the previously recorded
archived-test missing-fixture blocker.

[Comparison](evidence/2026-09-12-ranked-hot-loop/comparison.json), exact source
hashes and `unit.patch` preserve this unit separately from earlier uncommitted
work. The external pre-unit baseline is retained as benchmark provenance until
this work is integrated; sampled source snapshots remain with the reports.

Continue with the remaining ranked costs: repeated chunk/class interning and
state-triple probes, residual normalization/scratch work, then semantic descriptor
construction/validation. Reassess opportunities to avoid repeated class/event
transitions before changing hash arithmetic or expanding caches. No claim that
all ranked items have been optimized is made.
