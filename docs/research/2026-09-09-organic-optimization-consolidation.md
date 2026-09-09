# Organic optimization research consolidation

**Date:** 2026-09-09  
**Status:** research consolidation only; maintained Connect4 source and `main` remain unchanged

This note preserves the current research state after rethinking the exact-solver/shared-TT/dependency-chunk work under the principle that stronger optimization often comes from representing the underlying structure so that desired behavior follows naturally, rather than adding controllers that repair a weaker representation.

## Starting premise

Historical positive and negative results remain evidence, not final architectural verdicts. In particular:

- a measured speedup can still be an indirect consequence of some deeper variable;
- a failed implementation can fail because it violated the idea it purported to test;
- a successful mechanism can still be superseded by a representation that makes the mechanism unnecessary;
- exactness, transposition reuse, scheduling, physical placement, and cleanup are separate obligations and should not be collapsed into one dependency hierarchy.

The strongest surviving baseline remains the fixed-width two-word exact negamax kernel with a direct-mapped shared TT and coarse multicore scheduling. Dependency routing inside recursive negamax remains rejected.

## Historical rethink

A complete 107-item historical idea reassessment was produced during this research session. The main correction is that dependency topology had gradually been asked to do too many jobs: describe state relationships, predict reuse, allocate memory, organize scheduling, and justify cleanup. These are not identical relations.

The revised organizing question is:

> Which representation or ownership change makes several problems disappear together, while preserving exactness and reducing total proof-completion cost?

The most important reopened areas are representation density, proof-information retention, temporal affinity, state equivalence, and win-space structure.

## Exact TT-key compression experiment

The existing research shared TT stores:

- 32-bit `keyLo`;
- 32-bit `keyHi`;
- 8-bit bound payload;
- 32-bit publication-control word;
- 8-bit writer diagnostic.

That is 14 bytes per entry across the TT arrays.

A candidate exact residual-key representation was tested. The key observation is structural: the TT slot index already carries part of the state identity. With an injective transform, the stored residual plus the slot can identify the complete 49-bit Connect Four key exactly; this is not a probabilistic fingerprint.

A fixed-format candidate reduced TT storage from 14 bytes/entry to 10 bytes/entry while preserving the measured single-worker search tree and retained information on the qualified comparisons.

Representative preserved results:

- `41267575`, 1 worker, 512K entries: baseline 5,854,083 nodes; fixed-format candidate also 5,854,083 nodes. In one six-repeat three-way batch, median time moved from about 1.312 s to 1.157 s.
- `41267575`, 4 workers, 512K entries: one six-repeat batch measured about 1.149 s baseline versus 1.043 s fixed-format candidate, with the candidate faster in 4/6 paired trials.
- `41267575`, 4 workers, 1M entries: one six-repeat batch measured about 1.266 s baseline versus 1.098 s fixed-format candidate, with the candidate faster in 5/6 pairs.
- `663152175`, 4 workers, 256K entries: fixed-format and baseline were effectively tied in the strongest repeated comparison.

Interpretation: the **storage reduction is the strongest result**. A universal speedup is not established. The experiment also exposed a lifecycle constraint: if address bits participate in exact identity, arbitrary relocation or resizing cannot silently reinterpret retained bytes.

## Organic remaining-requirement / neutral-move experiment

A separate experiment tested a structural reduction based on remaining winning requirements.

At the root, the prototype identified remaining ways each player could win, removed redundant requirements, and certified columns whose remaining cells could not affect either player's victory. Certified neutral moves were not deleted: they still consumed turns and capacity, but multiple physically different neutral choices could be collapsed into one semantic action.

Two implementation styles were compared:

1. a requirement-mask kernel that searched through the structural representation directly;
2. a lower-cost integration that compiled structural facts into masks and retained the original fast bitboard kernel.

The second integration was stronger.

Correctness evidence included:

- exhaustive analysis of all 4,659 reachable nonterminal states of a 4x3 connect-three variant;
- 3,670 resulting full remaining-game equivalence classes in that small variant, eliminating 989 historical distinctions (~21.2%);
- independent cell-array oracle checks on 7x6 endgames;
- independent verification of the selected structural stress cohort.

Ordinary 7x6 holdout evidence did **not** show a general improvement. An 80-position holdout paid root-compilation overhead without reducing nodes, so blindly compiling every root was rejected.

A structurally eligible 24-position holdout reduced nodes from 923 to 694 (~24.8%), but those searches were too small for setup cost to pay back.

A 54-position structural stress cohort was then generated using structural eligibility rather than candidate speedup. In the reversed-order confirmation at 128K TT entries:

- unchanged bitboard baseline: 112,174 nodes, about 17.918 ms compile+search;
- structural masks integrated into original kernel: 76,853 nodes, about 12.784 ms compile+search.

That is about 31.5% fewer nodes and 28.7% lower compile-plus-search time on that deliberately suitable workload. Including measured table clearing reduced the time advantage to about 17.5%.

Interpretation: the useful lesson is not that a heavy abstraction interpreter should replace the bitboard. It is that **structural analysis can prove distinctions unnecessary, then let the existing low-level kernel operate on a smaller problem**.

## Coarse shared-proof experiment

Another experiment kept negamax as the worker solver but added bounded proof knowledge above coarse tasks.

For an exact state, retained knowledge was represented as an interval:

```text
L(s) <= V(s) <= U(s)
```

Two candidate modes were compared against the flat shared-TT baseline:

- completed-proof reuse: reuse previously completed coarse-state bounds;
- shared proof graph: additionally coalesce unfinished requests for the same exact coarse state when their obligations permit it.

The graph layer stayed outside recursive worker negamax.

On `41267575`, 4 workers, 512K TT, one tuned complete-solve comparison measured:

- flat baseline: ~1.012 s, ~13.059M nodes, ~5,441 worker dispatches;
- shared proof graph: ~0.805 s, ~10.660M nodes, ~2,530 dispatches.

That batch corresponds to roughly 20.5% lower median time, 18.4% fewer nodes, and 53.5% fewer dispatches; the graph won all six paired trials in that batch.

However, the ablation is important. In a compact-key comparison, completed-proof reuse was slightly faster than the full graph. Single-worker controls showed completed-proof reuse and graph mode searching the same reduced node count while the graph had no in-flight joins.

Mechanism tests with intentionally duplicated requests showed strong joining behavior, while unrelated requests showed essentially no benefit.

Interpretation: **retaining completed coarse proof knowledge has earned further consideration. Universal coordination of unfinished searches has not yet earned mandatory status.**

The smaller established position did not produce a stable timing win across sessions, so graph coordination is not an unconditional improvement.

## Structural shapes now considered promising

### 1. Ranked state graph

Every legal move increases occupied-cell count by exactly one. This gives the game an intrinsic DAG rank. Occupancy/rank may be useful for storage organization, lifecycle reasoning, or coarse proof structure without requiring a scheduler-created dependency partition.

This does not imply MCGS is required. Negamax can remain the value relation and local solver while exploiting graph-aware reuse.

### 2. Proof knowledge as monotone interval refinement

For one state, useful exact knowledge is naturally an interval. Valid observations combine by tightening the interval:

```text
[max(L1,L2), min(U1,U2)]
```

This representation naturally prevents weaker same-state knowledge from erasing stronger knowledge and lets exactness emerge when the bounds meet. It may support completed-proof reuse, move witnesses, and duplicate-query suppression through one structure.

### 3. Winning requirements as the semantic search object

The newest candidate direction is more radical: legal moves remain the expansion rule, but the recursive search identity may not need the complete colored board.

A candidate state is:

```text
remaining winning requirements for player 0
+ remaining winning requirements for player 1
+ column frontiers/heights
+ side to move
```

The board becomes the external/user representation and an independent oracle. Search advances the remaining winning-condition system directly.

For one player, identical remaining requirements can be merged. A requirement that strictly contains another requirement is logically redundant for terminal-winning semantics. Blocked winning lines disappear permanently. Different physical histories may become search-equivalent if they leave the same reduced winning requirements and legal frontiers.

Draw does not require a third constructive search space. If neither player has any surviving winning requirement, no future move can restore a destroyed line, so the remaining continuation is an exact draw. Other optimal-play draws can still contain live winning requirements and must be resolved by negamax.

This direction is preserved separately in `docs/research/2026-09-09-win-space-search-representation.md`.

### 4. Address/context carries information

The exact-key experiment demonstrated the general principle that a location or representation context can carry information that does not need to be redundantly stored in the payload. Future compact representations should ask what identity is already implied by the address, rank, canonical orientation, or fixed task configuration before storing duplicate facts.

### 5. Temporal affinity can substitute for physical isolation

Earlier A1/B/A2 experiments showed that physically separating incompatible work can protect TT state from eviction. Equal-capacity controls also showed that scheduling related ready work close together can sometimes recover the same retained reuse without owning additional physical tables.

Therefore spatial partitioning and temporal ordering should compete as alternative mechanisms rather than being assumed cumulative requirements.

## Current negative / cautionary findings

- BigInt is unsuitable for the specialized recursive 7x6 kernel.
- Per-node dependency routing, chunk-map reads, allocation, cleanup checks, and redirect chasing remain rejected.
- One 32K table per logical dependency identity is too small and strands capacity.
- Two-way/four-way associativity as previously implemented lost to direct mapping.
- Hot task-node count is not a reliable allocator objective.
- Previous-pass/cumulative hot-family remapping was not profitable in the tested forms.
- Two-row dependency signatures form an overlapping lattice and are not automatically independent physical cache families.
- Raw irreversible incompatibility is sufficient to show no identical raw descendant board, but future symmetry-canonical keys can change cache-equivalence relationships.
- Deepening the normal YBWC shell merely to force dependency resolution explodes task count.
- Grouping, isolation, compact keys, proof reuse, move ordering, and active capacity can interact; isolated wins must be requalified after material representation changes.

## Research principles for the next candidate cycle

1. Search for structural changes that make multiple desired behaviors follow naturally.
2. Prefer removing distinctions or duplicated facts over adding policy to manage them.
3. Keep legal/exact semantics and the distance-sensitive score unchanged unless a separate explicitly named experiment tests another objective.
4. Keep negamax as the selected search rule for the next candidate cycle.
5. Keep performance-sensitive recursion fixed-width and numeric.
6. Isolate each candidate first, then test interactions among survivors.
7. Compare equal active bytes where storage layout changes.
8. Include ordinary holdouts, structurally suitable cases, and mechanism-specific stress cases without relabeling selected cohorts as general evidence.
9. Preserve failed implementations and adverse measurements.
10. Do not promote research prototypes into maintained source without a separate decision and qualification cycle.

## Candidate ideas awaiting selection

The strongest current candidates are:

1. **Win-space search representation** — search reduced winning requirements plus legal frontiers instead of treating the full board as the only recursive identity.
2. **Exact compact TT identity** — retain the fixed-format residual-key idea as the denser flat-TT control.
3. **Monotone same-state proof retention** — retain stronger lower/upper knowledge instead of unconditional same-key overwrite.
4. **Completed coarse-proof reuse** — preserve useful completed coarse results without requiring universal in-flight joining.
5. **Forced-consequence compression** — propagate exact forced choices until the next genuine decision before re-entering full branching machinery.
6. **Rank-aware storage/lifecycle** — exploit occupied-cell count as an intrinsic DAG rank without assuming equal per-rank capacity.
7. **Ready-task temporal affinity** — preserve reuse by ordering already-legal work before paying for physical cache isolation.

No candidate in this list is yet accepted as maintained architecture.
