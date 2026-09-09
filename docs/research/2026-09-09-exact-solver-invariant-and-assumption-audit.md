# Exact-solver assumption and invariant audit

Date: 2026-09-09. Research only; no maintained implementation promotion.

## Evidence identity and preservation

The initial remote read found research head `990686a094acaddc0bc37d0995759ab138d63aa4` and main `de47d43f4f4133a68973d0876a402531ef5735da`. The shared solver was read at that exact research revision. Its Git blob is `965c3806c92a7add544dce4777d965b3e12376d6`; the local copy was byte-identity checked before execution.

Before preservation, the research branch had independently advanced to `40831024d730a304bebef34d3508a7f07e05326e`, adding fair isolation controls and their 54-trial TSV. Those additions were inspected and preserved, not overwritten. This unit adds a separate invariant probe and raw output. It does not claim to have executed the independently added fair-control batch.

New executable evidence:

- `reference/research-prototypes/2026-09-09-invariant-reassessment/invariant_probe.mjs`
- `docs/research/evidence/2026-09-09-invariant-reassessment.jsonl`

Probe SHA-256: `7a6bbf32b74380f2118c6c914b4b926abc977d77423df1945d8dea6033ea5b7f`.
Raw output SHA-256: `e6d4bbe9645c132f575555736185796bb817273e223037e99418e73b2fa656af`.

Run: `node reference/research-prototypes/2026-09-09-invariant-reassessment/invariant_probe.mjs`.

## Main correction

Do not let the most recent prototype turn a sufficient condition into a mandatory architecture.

Contradictory irreversible ownership proves that two descendant state spaces cannot intersect. That prevents loss of legitimate cross-domain transposition reuse when they are separated. It does not prove that splitting memory is profitable, and it is not necessary for exact search correctness when TT hits are validated against complete keys and sound bounds. Overlapping cache partitions may safely lose reuse and recompute; whether that is worthwhile is a performance question.

The separate hard requirement remains: no torn/false TT hits and no reuse of storage held by running tasks. Exclusivity of logical domains does not replace publication or lifetime safety.

The earlier conclusion that automatic exclusive-domain formation must be the next implementation is therefore too strong. First compare simpler alternatives that preserve broad sharing.

## 1. The benchmarks are solving different questions

The original C reference reports win/draw/loss. The Node kernel's `solveBits` converges a distance-sensitive integer score through multiple null windows. A WDL proof and a full distance-sensitive score are not equal proof workloads. The same-machine Fhourstones throughput remains a rough engineering reference, not a direct node-efficiency ratio or a same-semantic wall-time target.

Separate reporting should cover WDL, exact distance-sensitive score, and replay of fixed task/window pairs. The public exact-score objective must not silently be reduced to WDL.

Source leads: John Tromp's benchmark documentation at https://tromp.github.io/c4/fhour.html and the inspected owned kernel's `solveBits` implementation. The external source is a comparator/documentation lead, not an admissible implementation patch.

## 2. Isolation benefit is real, but earlier controls did not establish its net value

`dependency_resolved_batch_isolation_bench.mjs` allocates a 2N arena in all modes, but shared mode actively uses N entries while split mode uses 2N. It also removes unresolved tasks from the captured pass: 30 resolved tasks remain out of 50. Thus it isolates a mechanism; it is not a whole-solve scheduler qualification or an equal-active-memory result.

Re-reading its deterministic evidence at equal active capacity:

| Active total | Flat/interleaved | Split/interleaved | Split node change |
| --- | ---: | ---: | ---: |
| 512K | 2,920,062 | 3,121,037 (2 x 256K) | +6.88% |
| 1M | 2,727,195 | 2,776,451 (2 x 512K) | +1.81% |

These rows compare preserved results from different table powers in `2026-09-09-resolved-domain-batch-isolation.tsv`. They do not establish a wall-time winner.

The newly added A1/B/A2 fair controls at `40831024...` reinforce this distinction. At 512K active total, flat searches 1,935,328 nodes while two 256K descriptors search 2,018,571. Yet grouped execution in one 256K table also searches exactly 2,018,571. The same within-domain order can preserve the demonstrated reuse without owning both physical tables simultaneously.

This is not a theorem that grouping always wins. Grouping can delay useful cutoffs, serialize useful parallel work, or be unavailable because tasks are not ready. Test ready-task affinity within legal YBWC scheduling, not arbitrary reordering of future proof work. Unresolved tasks must remain in the integrated workload.

## 3. Logical topology, physical placement, and time ordering are different variables

The two-row identity is a lattice of partial irreversible facts. A broader task can enter descendants compatible with several child signatures while retaining its fixed descriptor. Separate child-root tasks may reach the same boards. The earlier ancestor/descendant overlap experiment correctly demonstrates lost sharing for that sample, not a universal rejection of hierarchical caches.

If every overlapping task must share storage, an unresolved broad task can connect otherwise incompatible sibling groups and collapse the placement back into one shared descriptor. That follows from the requirement itself, not an allocator defect.

The legal choices under fixed-descriptor tasks include broad sharing, tolerating measured duplication in selective partitions, and better ordering of already-ready coarse work. Do not add per-node routing, map reads, dependency checks, or implicit region changes to evade this tradeoff.

Dependency information can remain valuable as a scheduling-affinity hint and a cleanup proof even when it does not allocate a separate physical table.

## 4. Capacity should follow marginal saved time, not raw task-node share

Large node share is not equivalent to high reuse value. A large one-use subtree may gain little from another slab, while repeated modest tasks may gain much more. A starved region can also look hot precisely because it is recomputing work. The current weighted selector cannot distinguish these cases from aggregate task-node counts.

The resource question is the observed or estimated reduction in completed proof time from another capacity increment, including weaker locality, lost sharing, remap/warmup cost, and critical-path effects. Completed-pass evidence is useful input but not an oracle for the next pass. Tiny proof passes should not be treated as complete workload forecasts.

Leaving preallocated capacity inactive is a valid outcome. Active-byte utilization is not a success metric. Report reserved bytes, active TT bytes, actually used descriptors, and metadata separately. The current dense two-row `Int32Array(1 << 21)` chunk map itself occupies 8 MiB; this is significant next to a 256K-entry, 14-byte/entry TT (3.5 MiB).

Retain dynamic total capacity and dynamic multi-slab descriptors as candidates. Do not equate either with continual remapping or a duty to use every slab.

## 5. The next TT candidate can be simpler than more partitioning

The existing shared kernel allocates five arrays: 32-bit keyLo, 32-bit keyHi, 8-bit bound, 32-bit publication control, and 8-bit writer owner: 14 bytes/entry. Its position key needs 49 bits, so only 17 bits of keyHi are meaningful.

An exact fixed-width packing candidate is:

- word 0: keyLo, 32 bits;
- word 1: keyHi, 17 bits; existing bound encoding, 7 bits; existing writer tag, 8 bits;
- word 2: publication control, 32 bits.

That is 12 bytes/entry with the same full key and existing diagnostic tag, not probabilistic tagging or associativity. It may reduce traffic; extra bit extraction may offset the benefit. Benchmark it without changing bounds, hashing, ordering, descriptor routing, or publication semantics first. Packing alone does not establish coherent multiword publication.

A separate later candidate uses the same second-word budget for keyHi17 + lower6 + upper6 + moveHint3. Each bound has 37 legal score codes plus an absent code. This removes the per-entry writer tag from that representation, so diagnostic memory must be accounted separately in any fair comparison.

The new probe performed 177,280 encoding round trips, covering every 17-bit high key with a boundary payload and all lower/upper/hint combinations for selected high-key boundaries. It also exhaustively checked the per-column gravity-key digit range. This qualifies the bit allocation only: no packed TT implementation or speedup is claimed.

## 6. Same-key proof information is currently thrown away

The inspected `publish` acquires the slot and unconditionally replaces its fields. The new probe demonstrates the stored sequence:

`lower >= 3 -> lower >= 1 -> upper <= 3`.

All can be valid bounds for a value of 3, but the second write weakens useful knowledge, and the one-bound encoding cannot retain the final upper and earlier lower simultaneously.

A candidate correction, separate from layout research, is same-key monotone proof retention under the existing publication ownership: retain the greatest valid lower bound and least valid upper bound. An interval that closes yields an exact value. This is bound algebra, not age, LRU, reference counting, or per-node cleanup policy. Its extra checks and publication cost still require measurement. Opposite-type overwrite is not always bad in a one-bound design; do not assume dual bounds win without a controlled test.

Keep direct mapping as the baseline. Earlier associativity failures do not justify restoring multiway probes without new evidence.

## 7. Reclamation requires a fact about resident contents, not just future routing

The no-copy split reasoning is sound for lookup: a retained aligned half keeps entries whose old hash already landed there. Full-key validation still makes mismatching entries safe misses.

But assigning that half to a child does not establish that every retained entry belongs to that child.

The new probe seeds a real incompatible B-state key in a parent table, takes the aligned resident half without copying, and verifies that the B key remains addressable after the half could be assigned to A-only future tasks. The real state pair is `412675753` versus `4126757563`, contradictory at zero-based column 2, row 0. This is a synthetic retained-entry witness, not a claim that the full layout benchmark encountered that exact slot.

Therefore distinguish:

- logical facts about a task/family;
- where future tasks are directed;
- guaranteed facts about ALL currently resident entries.

A descriptor with retained broad contents must keep a conservative broad resident-scope guarantee. A possible coarse-only representation is the intersection of guaranteed absolute-owner facts from inherited contents and every admitted task root. Facts cannot become stronger merely through relabeling. An empty/cleared descriptor can start with a stronger admitted scope; otherwise false retention is acceptable. No per-node accounting is required for this conservative rule.

Forwarding also must account for all logical aliases and stale holders, including queued tasks already resolved to the descriptor. The artificial retry in the preserved cleanup smoke is safe as a cache request but can broaden a survivor's resident scope; it must not leave a narrower cleanup assertion behind.

Keep the existing direct forwarding/grace mechanism. Defer integrated proof-only reclamation until this composition invariant is explicit. Do not confuse null-window pruning or speculative cancellation with game-state impossibility.

## 8. Coarse scheduling has not been isolated from its prototype machinery

The preserved shell still uses BigInt boards, object construction, arrays, Map bookkeeping, per-task typed-array views, and `postMessage` objects. Node documents that message values are cloned; SharedArrayBuffer backing memory is shared. Thus the current harness does not qualify a representation-stable numeric dispatch path. It is research evidence, not maintained implementation authority.

The deep-shell task-count increase is real. The associated cost is not yet the lower bound for a fixed-width numeric shell and fixed task records. Conversely, changing representations cannot remove the combinatorial increase in task count. Neither conclusion licenses per-node scheduler work.

Keep eldest-first behavior and the existing two-lane comparison baseline. Test affinity only among already-ready younger work, with task/window identity, speculative work, time to useful cutoff, and total solve time. More node throughput or fewer replay nodes alone may still make the proof slower.

## 9. Existing move ordering is not an empty baseline

Both inspected shell and kernel already have center-biased tie order, threat-count sorting, forced-defense handling, and losing-move elimination. The missing opportunity is retained search experience, such as coarse previous-pass cutoff replay and separately tested TT move hints, not reimplementing already present tactical ordering.

Do not change move order inside a descriptor-layout comparison. It is nevertheless unnecessary to wait for a speculative cleanup architecture to become production-ready before testing a separate flat-TT ordering experiment.

## 10. Correctness claims need their exact scope

Null-window tasks prove a bound or threshold decision, not generally the exact score of that task. Comparing raw return values across cache histories is neither a necessary nor sufficient independent correctness test.

The new independent cell-array oracle checks 48 legal late-game positions against `solveBits`; 9 of those have no immediate current-player win and support 81 valid raw-negamax window checks. Nineteen returned a sound bound different from the exact oracle value. This is a deliberately small tactical qualification, not broad strong-solver certification.

The kernel's raw negamax entry also requires that the current player has no immediate win. For legal position `121212`, the independent immediate-win value and public `solveBits` both give 18; direct raw negamax at [17,18) returns 17 because that precondition is violated. The test demonstrates the entry contract, not a defect on valid internal tasks. The coarse public wrapper must enforce or explicitly restrict this condition; parsing only past terminal moves is insufficient.

The two preserved earlier positions were also rerun with a cold 512K table: `663152175` returned -4 at 1,004,480 nodes, and `41267575` returned 3 at 5,945,560 nodes. These are same-kernel consistency checks, not independent early-position oracles or multicore performance measurements.

Finally, repeated scores do not prove the research seqlock protocol portable. ECMAScript distinguishes sequentially consistent Atomics from unordered ordinary shared accesses. The complete key/payload snapshot, racing writes, version wrap, and supported architectures need their own proof and adversarial qualification. This audit does not claim an observed false hit or a completed formal disproof.

## Revised priority and falsifiers

1. Repair evidence interpretation and entry/bound qualification before using timings to choose architecture. Preserve old evidence with narrower claims.
2. Establish exact-byte accounting and a packing-only flat-TT comparison. Reject packing if it loses completed-solve time or changes valid single-worker node counts under otherwise identical semantics.
3. Compare legal ready-task affinity with the unchanged flat TT. Reject it if delays to useful cutoffs/speculation offset retained reuse.
4. In a separate experiment, test same-key proof retention and then coarse cutoff replay. Reject extra policy when its per-access cost exceeds avoided work.
5. Revisit selective multi-slab isolation only where interference remains after those controls, comparing equal active total bytes and equal local working sets, with unresolved tasks included.
6. Integrate forwarding/reclamation only after resident-scope guarantees, alias closure, and stale-holder safety compose with retained bytes.

This is not a rejection of dependency chunking. It is a correction of what has been demonstrated and a preference for mechanisms that can capture the measured benefit without first requiring an expensive global domain partition.

## Source routing

Owned inspected sources: the shared solver; selective-promotion coordinator and descriptor worker; resolved-batch isolation runner; preserved locality/overlap reassessment; chunk-map proof-cleanup smoke; and the newly added `2026-09-09-rethink/isolation_fair_controls.mjs` and its TSV at `40831024...`.

Primary external references consulted for semantic checks, not copied implementation:

- https://tromp.github.io/c4/fhour.html
- https://nodejs.org/api/worker_threads.html
- https://tc39.es/ecma262/multipage/memory-model.html

All previous prototypes and evidence remain preserved. No main, maintained-source, branch-deletion, or PR action is part of this unit.
