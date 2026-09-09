# Selective dependency TT promotion: locality, overlap, and disjoint-domain reassessment

Date: 2026-09-09

Repository: `iteathen/Connect4`

Research branch: `research/exact-solver-perf-checkpoint-2026-09-08`

This note continues the exact-solver / shared-TT / dependency-chunk research. It does not change maintained Connect4 implementation or `main`. The prototypes below are research evidence only.

## Starting repository state

At the beginning of this unit, the remote repository was read before mutation:

- `main`: `de47d43f4f4133a68973d0876a402531ef5735da`
- research branch: `1f3d76f8c7be3b32732530669346e8ee8203fbc9`
- research branch was 84 commits ahead of and 0 commits behind `main`.

The preserved corrected worker model in `reference/research-prototypes/2026-09-09-dependency-reassessment/ybwc_regionfixed_worker.mjs` was retained: the coordinator resolves a physical region once at coarse-task dispatch and the worker runs ordinary two-word negamax with that fixed region. No dependency lookup or redirect chasing was added inside negamax.

## Question actually tested

The first question was the checkpoint seam:

> Can a coarse-task logical dependency tree use a stable chunk map and dynamically sized multi-slab descriptors to improve TT locality without routing inside negamax?

The implementation intentionally deferred cleanup, forwarding, recycling, move-order hints, and maintained-source changes. It used:

- one fixed preallocated SAB arena;
- stable two-row logical dependency signatures at coarse task roots;
- one `chunkMap` resolution per dispatched coarse task;
- fixed descriptor offset/mask for the complete worker subtree;
- physical capacities in powers of two, composed of 32K physical slabs;
- cold signatures mapped to a broad fallback descriptor;
- promotion only after a drained coarse boundary.

The resulting prototype is `reference/research-prototypes/2026-09-09-selective-promotion/coarse_selective_promotion_bench.mjs` with `ybwc_descriptor_worker.mjs`.

## Implementation correction during qualification

An exploratory equal-block allocator could strand unused blocks when the requested promotion count exceeded the number of observed first-pass families. That was an implementation error, not evidence about dependency partitioning. It was corrected before the authoritative capacity/control evidence: promotion count now falls back to a supported full-arena layout rather than leaving physical capacity unused accidentally.

## Initial capacity result: the earlier locality signal reproduces

On `41267575`, exact score `+3`, four workers, one first-pass-selected promoted family:

| Total TT | Flat median | Promote-1 median | Node effect |
| --- | ---: | ---: | ---: |
| 256K | 1.308 s / 14.997M | 1.508 s / 18.985M | worse |
| 512K | 1.064 s / 10.969M | 1.545 s / 13.789M | worse |
| 1M | 1.174 s / 9.144M | 1.107 s / 10.775M | more nodes, slightly faster in this batch |
| 2M | 1.320 s / 8.486M | 1.098 s / 9.188M | more nodes, faster in this batch |

This reproduces the earlier observation that partitioning only has a fair chance once an oversized flat table is beyond the local working-set knee. It does **not** by itself prove that the logical partition is valuable.

Raw evidence: `docs/research/evidence/2026-09-09-selective-promotion-capacity-41267575.jsonl`.

A single-worker 2M control also reproduced a pure locality effect: flat searched deterministically 4,903,537 nodes while promote-1 searched 5,359,326 nodes, yet the promoted layout was faster in that batch. Because there are no cross-worker races, the wall-time effect can come from physical working-set locality even while search efficiency gets worse.

Raw evidence: `docs/research/evidence/2026-09-09-selective-promotion-oneworker-2m-41267575.jsonl`.

## Replanning at every drained pass is safe but not profitable

`coarse_pass_replan_bench.mjs` tested three policies:

- `frozen1`: choose the first-pass top signature once;
- `replan1`: after every drained pass, remap the promoted half to the previous pass's top signature;
- `cumulative1`: remap using cumulative completed-pass work.

All exact results remained correct. No running worker was redirected: every remap occurred only after `pool.drain()`.

The selector itself failed.

For `663152175`, pass 2 contained only about 449 worker nodes and was 100% one signature. `replan1` therefore switched from `668757` to `670293` on a tiny proof pass, then switched back. It searched substantially more nodes than flat or frozen placement.

For `41267575`, previous-pass and cumulative remapping likewise did not improve the stable placement. Cross-pass TT locality is valuable; a one-pass-lag family predictor is not sufficient evidence for destroying or redirecting it.

Conclusion:

**Quiescent remapping is mechanically safe, but safety is not evidence of profitability. Do not add arbitrary hysteresis thresholds to rescue this selector without a new causal model.**

Raw evidence: `docs/research/evidence/2026-09-09-pass-replan-summary.tsv`.

## Critical control: the apparent 2M multi-promotion win was mostly local table size

Exploratory 2M runs looked very strong for three promoted signatures. In reversed mode order on four workers, `promote3` was around 1.00 s while flat 2M was around 1.31 s, despite `promote3` searching roughly 28% more nodes. Single-worker results showed the same wall-time direction.

That result had a confound: `promote3` creates four 512K regions. Every coarse task therefore runs against a 512K local table, already known to be near the workload's locality knee.

`coarse_partition_locality_control_bench.mjs` added equal-locality controls using the same 2M backing arena:

- `flatQuarter`: one active 512K flat descriptor, remainder unused;
- `flatHalf`: one active 1M flat descriptor;
- `promote3`: four active 512K descriptors, full 2M arena.

For `41267575`, four workers:

- flat-quarter 512K median: ~1.069 s, ~10.837M nodes;
- promote-3 median: ~1.075 s, ~10.900M nodes.

They are effectively tied at equal per-task working-set size.

With one worker the node counts are deterministic:

- flat-quarter: 5,854,083 nodes;
- promote-3: 5,832,764 nodes, only ~0.36% fewer;
- flat-quarter was faster in that batch.

Therefore the dramatic 2M-vs-2M wall-time win was mostly evidence for **smaller task-local TT working sets**, not evidence that the chosen logical signatures productively used four times the active capacity.

Raw evidence:

- `docs/research/evidence/2026-09-09-selective-promotion-2m-exploratory.tsv`
- `docs/research/evidence/2026-09-09-partition-locality-control-41267575.tsv`

## Whole-solve profile replay does not rescue the selector

A stronger upper-bound control was generated by `coarse_profile_replay_patch.mjs`:

1. solve once with a clean flat 512K table;
2. record cumulative coarse-root work by logical signature;
3. discard all TT bytes;
4. replay from clean state while promoting the true whole-solve top three signatures into separate 512K descriptors.

This intentionally gives the selector information unavailable to a real online policy. It is an upper-bound selector experiment, not a production algorithm.

Single worker, `41267575`, exact score `+3`:

- flat 512K: 5,854,083 nodes;
- first-pass promote-3: 5,832,764 nodes;
- whole-solve top-three replay: 6,722,621 nodes.

The hindsight selector increased search by ~14.84%.

Top whole-solve coarse-root signatures included:

- `1008138`: 1,811,520 task nodes;
- `878090`: 822,430;
- `877066`: 595,165;
- `877194`: 579,281;
- `976906`: 418,848;
- `975370`: 394,036.

Raw evidence: `docs/research/evidence/2026-09-09-profile-replay-41267575-1w-2m.tsv`.

## Root cause: two-row signatures form a dependency lattice, not disjoint TT families

The hindsight failure led to checking the actual logical relationships among the hot signatures. `dependency_sig_lattice_check.mjs` decodes the two-row signatures and tests prefix ancestry and contradictory irreversible ownership.

Observed relationships include:

- `1008138 -> 1009162`, `1008266`, `1008162`;
- `878090 -> 1009162`, `878106`, `878218`, `878114`, `878094`;
- `877066 ->` almost every other hot signature in the sample, including `1008138`, `878090`, `877194`, `976906`, and `975370`;
- `877194 -> 1008266`, `975498`, `878218`;
- `975370 -> 976906`, `975498`.

The first-pass promote-3 set itself was nested: `878090` is an ancestor of `878218` and `878114`.

This matters because the worker correctly does **not** route inside negamax. A task rooted at a broader dependency signature can therefore recurse into states satisfying a more-specific child signature while retaining the broad descriptor. A separately dispatched child-root task can search overlapping descendant states using the child descriptor. The two descriptors then divide transposition knowledge that the flat TT would share.

So the earlier shorthand “logical family” was too strong. Until domain exclusivity is proven, these values are better described as **coarse-root dependency signatures**.

Evidence: `docs/research/evidence/2026-09-09-dependency-sig-lattice-41267575.txt`.

## Direct overlap qualification: incompatible siblings vs ancestor/descendant

`dependency_pair_tt_overlap_bench.mjs` used real pass-6 coarse roots from a deterministic one-worker flat solve. Both roots in each pair used the same null window `[3,4)` and 512K task-local TT size.

### Incompatible pair

Signatures `975370` and `1008138` contain opposite owners for the same irreversible tracked cell (`c5r1`). Their descendant state spaces therefore cannot intersect.

Across seven repeats:

- clear-between: exactly 1,325,718 nodes;
- shared 512K: exactly 1,325,718 nodes;
- split into two 512K descriptors: exactly 1,325,718 nodes.

The second task is exactly 899,156 nodes in every mode. Sharing provides no legitimate cross-domain reuse to lose.

### Overlapping control

`1008138` is an ancestor of `1009162` in the dependency lattice.

- clear-between / split: exactly 1,369,259 nodes;
- shared 512K: exactly 1,255,884 nodes.

Sharing saves 113,375 nodes across the pair (~8.28%). The second task falls from 470,103 to 356,728 nodes (~24.12%).

This directly validates the corrected interpretation:

**Partitioning an ancestor/descendant pair destroys valuable TT reuse. Partitioning truly incompatible irreversible siblings does not.**

Raw evidence: `docs/research/evidence/2026-09-09-dependency-pair-overlap-7.tsv`.

The coarse roots used for this smoke were captured by the reproducible `coarse_task_root_capture_patch.mjs` wrapper rather than hand-invented.

## Positive result: incompatible partitioning protects useful intra-domain TT state

A two-task incompatible pair only proves that separation is safe. The next smoke tested whether physical separation can actually protect useful cache state from interleaved sibling work.

`dependency_interleave_isolation_bench.mjs` uses real pass-6 roots in this order:

- `A1`: signature `1008138`;
- `B`: signature `975370`, irreversibly incompatible with A on `c5r1`;
- `A2`: signature `1008138`.

Modes:

- `aOnly`: A1 then A2, showing maximum retained A-domain reuse;
- `shared`: A1, B, A2 in one flat table;
- `split`: A1/A2 use one descriptor and incompatible B uses another equal-sized descriptor;
- `clearBeforeA2`: baseline with all retained TT state removed before A2.

All task results remain exact score `3` for the null window.

The node result is deterministic and capacity-sensitive:

| Per-domain table | A2, A-only | A2, shared with B | A2, split B | Split recovery vs shared |
| --- | ---: | ---: | ---: | ---: |
| 256K | 837,234 | 884,006 | 837,234 | 46,772 nodes (~5.29%) |
| 512K | 770,698 | 792,637 | 770,698 | 21,939 (~2.77%) |
| 1M | 748,606 | 756,902 | 748,606 | 8,296 (~1.10%) |

The split restores **exactly** the A2 node count from the `aOnly` mode at all three capacities. In other words, B has no useful information for A, but in a flat direct-mapped TT it evicts some A-domain information before A2. A separate descriptor protects that information completely in this smoke.

This is the first clean positive evidence in this research unit for dependency-aware physical capacity beyond the generic local-working-set effect.

It also supports the governing dynamic-resource principle: the value of isolation is larger when the local descriptor is tighter and falls as per-domain capacity grows.

Raw evidence: `docs/research/evidence/2026-09-09-dependency-interleave-isolation-capacity.tsv`.

## Why simply deepening the coarse shell is not the solution

A natural way to try to obtain disjoint sibling classes is to keep expanding the YBWC shell until a chosen irreversible ownership discriminator is resolved. `coarse_split_depth_profile_patch.mjs` measured this for the strongest observed candidate, `c5r1`, with a one-worker flat 512K solve.

Weighted task-root work by discriminator state:

| Split depth | Tasks | Unresolved | P0 | P1 |
| --- | ---: | ---: | ---: | ---: |
| 4 | 136 | 41.43% | 16.65% | 41.92% |
| 6 | 677 | 30.04% | 23.86% | 46.10% |
| 8 | 3,366 | 21.34% | 24.78% | 53.88% |
| 10 | 15,357 | 17.78% | 26.24% | 55.98% |

From depth 4 to 10, task count grows about 113x while almost 18% of weighted work is still unresolved. Merely deepening the ordinary coordinator shell trends toward turning the scheduler into the hot search loop before it creates a complete partition.

Raw evidence: `docs/research/evidence/2026-09-09-split-depth-c5r1-profile.tsv`.

## Corrected architecture after this unit

The physical architecture remains valid:

```text
canonical board state
    -> logical dependency topology
    -> stable logical ID
    -> chunkMap resolved once at coarse dispatch
    -> fixed physical descriptor for that task
    -> ordinary negamax
```

But the allocation policy needs one additional invariant:

> A dedicated physical descriptor is only a true independent TT domain when the scheduler can prove that tasks assigned to different descriptors cannot reach the same descendant board state, or when deliberately losing their shared transpositions is proven profitable.

For the current monotone Connect Four dependency representation, contradictory irreversible ownership of the same tracked cell is a sufficient disjointness proof. Parent/child and merely compatible signatures are not disjoint.

Therefore:

- do not promote hot exact signatures solely by task-node share;
- do not interpret dependency-tree nodes as automatically independent physical cache buckets;
- preserve broad sharing across ancestor/compatible tasks unless a scheduler-level domain carve-out makes the descendants exclusive;
- use 32K only as the physical slab/locality granule;
- size each proven domain dynamically from coarse evidence;
- keep chunk-map resolution once per coarse task;
- do not add dependency routing inside negamax;
- do not add cleanup/forwarding complexity yet.

## Next research seam

The next implementation question is no longer “which hot signature gets a descriptor?” It is:

> How can the coarse scheduler create **exclusive irreversible sibling domains** without per-node routing and without exploding the coarse frontier?

The pair/interleave smokes establish that such domains have real cache-isolation value. The depth sweep establishes that blindly pushing the current YBWC shell deeper is not an acceptable general mechanism.

The next faithful prototype should therefore separate **domain formation** from ordinary negamax execution. Candidate work must preserve these constraints:

1. unresolved parent work cannot be allowed to recurse through both promoted child domains while using a third independent descriptor, because that recreates overlap;
2. once a task is dispatched to ordinary negamax, its descriptor remains fixed for the entire subtree;
3. any dependency-boundary/frontier generation must occur outside the ordinary hot negamax kernel and must be measured as scheduler overhead;
4. child descriptors should only be allocated after an exclusivity proof and should receive multiple 32K slabs according to measured retained-work benefit;
5. cleanup/forwarding/recycling remains deferred until this domain-formation mechanism is shown to be worthwhile.

A useful next control is to extend the A1/B/A2 isolation smoke from one manually selected incompatible sibling pair to a coordinator-produced batch of incompatible domains, preserving exact task roots and measuring retained reuse, capacity, and frontier cost separately.

## Reproduction entry points

Representative commands from repository root:

```bash
node reference/research-prototypes/2026-09-09-selective-promotion/coarse_selective_promotion_summary.mjs 41267575 4 20 3 flat,promote1,promote3,promote7,weighted
node reference/research-prototypes/2026-09-09-selective-promotion/coarse_pass_replan_bench.mjs 41267575 4 21 3 flat,frozen1,replan1,cumulative1 summary
node reference/research-prototypes/2026-09-09-selective-promotion/coarse_partition_locality_control_bench.mjs 41267575 1 21 5 flatQuarter,promote3 summary
node reference/research-prototypes/2026-09-09-selective-promotion/coarse_profile_replay_patch.mjs 41267575 1 21 5 flatQuarter,promote3,oracle3 summary
node reference/research-prototypes/2026-09-09-selective-promotion/dependency_sig_lattice_check.mjs
node reference/research-prototypes/2026-09-09-selective-promotion/dependency_pair_tt_overlap_bench.mjs 7
node reference/research-prototypes/2026-09-09-selective-promotion/dependency_interleave_isolation_bench.mjs 7 19
node reference/research-prototypes/2026-09-09-selective-promotion/coarse_split_depth_profile_patch.mjs 8 41267575 1 21 1 flatQuarter full
```

## Status

This unit does **not** establish a production dependency-TT allocator. It does establish four narrower points with direct evidence:

1. task-local TT working-set size is a major part of the earlier partitioning speedup;
2. hot two-row dependency signatures are an overlapping lattice and cannot be treated as independent cache families;
3. truly incompatible irreversible siblings can be separated without losing legitimate TT reuse;
4. separating such siblings can preserve useful intra-domain TT state across interleaved work, with larger benefit at tighter capacities.

The research branch preserves both the positive and negative prototypes. `main` remains untouched.
