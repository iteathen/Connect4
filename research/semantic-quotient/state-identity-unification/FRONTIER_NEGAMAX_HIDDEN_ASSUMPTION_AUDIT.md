# Frontier Negamax hidden-assumption audit

Date: 2026-09-11
Branch: `research/semantic-quotient-explore-hints`
Status: read-only design audit recorded as research evidence; no solver behavior changed by this note.

Research direction / architecture: Josh Oshiro
Adversarial architecture audit: OpenAI ChatGPT

## Purpose

Audit the current quotient-native parallel Negamax + Branch Manager method for assumptions inherited from conventional alpha-beta/TT engines, path/history leakage across quotient boundaries, incomplete use of already-derived frontier invariants, and resource/lifecycle assumptions that could distort the standard-7x6 root experiment.

The intended engine is a **frontier engine**. Conventional search techniques are not rejected categorically, but they must fit the frontier representation rather than become defaults merely because they are common in ordinary board engines.

## High-priority findings

### 1. Authoritative search is still center-order based

The current `createQuotientNegamaxEngine()` and dependency-aware variant still order non-forced moves by `centerOrder` after a proof-store best-move hint. One path additionally reverses `centerOrder` according to `workerSalt`.

The new dynamic live-winning-line incidence order currently applies only to `explore-path` work.

Therefore the current root solver is not yet frontier-native in its main recursive ordering.

### 2. Live-line evaluation is path-context, not quotient identity

The exact quotient intentionally removes dominated/duplicate residual requirements. Two legal physical histories can therefore map to the same exact quotient while retaining different multiplicities of original still-live geometric winning lines.

The legacy cell value

`number of original winning lines through cell not blocked by the opponent`

can consequently differ across physical representative paths even when exact quotient identity is the same.

That is safe only while the value remains advisory. It must not become semantic equality, proof identity, or globally unique state metadata.

Current `exploreQuotientPath()` deduplicates by quotient state and keeps the first encountered representative path/occupancy. This creates a hidden **first-arrival-wins heuristic context**: later equivalent paths with different live-line values are discarded.

A frontier-native authoritative implementation should either:

- carry reversible live-line/occupancy ordering context on the recursion/search frame, separate from quotient semantic identity; or
- deliberately use a quotient-invariant ordering signal instead.

It should not attach one representative path's legacy line multiplicity to the quotient as if it were semantic truth.

### 3. The common terminal/frontier invariant is only partially used

Current quotient tactical closure exactly handles the cheap residual cases:

- immediate mover singleton -> win;
- one playable opponent singleton -> forced response;
- multiple distinct playable opponent singleton cells -> forced loss;
- bilateral residual exhaustion / no legal continuation -> draw.

The broader research unification went further. It reduced future-target parity/Zugzwang and named Allis-style solution coverage to:

`future event/support frontier + residual requirements + parity/response constraints -> certified blocker IDs -> upward closure in the same requirement universe`.

Nested Dependency Closure further records timing/race/horizon as first-class proof facts.

The current Negamax should therefore not be described as consuming the complete frontier-terminalization invariant. It consumes only the immediate residual/tactical subset.

Useful missing exact frontier deductions include at least one-sided exhaustion as a no-win bound and, once formally accepted for this lane, qualified blocker/parity/response closure.

If blocker/CPC/NDC facts are integrated, they may be reused under the current quotient key only when their validity is derivable from that quotient or their complete context is included in the proof identity. Path/history-dependent strategic certificates must not be attached to `support + R0 + R1` by assumption.

### 4. Shared semantic TT allocates on read

`createOnlineSemanticQuotientPort().proofKey()` calls `tt.findOrCreate()` before ordinary proof reads. Thus every state whose bounds are inspected is inserted into the global semantic table even if it never publishes a useful proof.

This is a conventional TT/interning assumption, not a frontier requirement.

The standard-7x6 attempt filling 8,388,608 entries therefore establishes that more than 8.3M semantic states were **touched/interned**, not that more than 8.3M proof records deserved retention.

Before optimizing replacement policy, test a split API such as:

- `probe(descriptor)` -> existing proof slot or miss, no allocation;
- `ensureForPublish(descriptor)` -> allocate only when publishing a non-default bound/exact result/hint worth retaining.

This could materially change entry pressure and should be measured before treating set-associative replacement as the inevitable next storage architecture.

### 5. Parallel scout handling waits for all siblings

The dependency-aware engine correctly searches the preferred child first, but then launches all sibling scout searches and executes `await Promise.all(...)` before consuming any result.

Consequences:

- an early cutoff cannot release the parent immediately;
- a useful early scout result cannot tighten alpha for siblings already queued;
- obsolete sibling work remains part of the parent's critical path;
- the engine cannot exploit the user's desired non-interruption rule cleanly.

The frontier-native shape should consume sibling completions incrementally. When one completion makes remaining sibling obligations obsolete, the parent can stop awaiting them **without interrupting their workers**. Those workers may finish naturally and publish any sound shared proof, after which they return to the authoritative/explore queues.

This preserves non-interruption while removing obsolete work from the parent critical path.

### 6. Static split depth is still the primary parallelism mechanism

The current dependency-aware engine uses one `splitDepth` boundary. Depth 8 activated all three workers on the hosted standard-7x6 attempt, but the new Branch Manager design is intended to make work-frontier depth adaptive.

A fixed split depth remains useful as a control/initialization parameter, but it should not silently remain the final source of parallel slack once proactive explore work is available.

### 7. Branch Manager is not yet autonomous

Workers no longer request work from Branch Manager, which is correct. However Branch Manager itself currently queues an explore hint only after the coordinator calls `offerExplore(path, depth)`.

So the present implementation is push-to-workers but not yet a self-replenishing Branch Manager.

The intended next shape is:

- Branch Manager maintains a bounded ready reservoir ahead of demand;
- completed exploration supplies ordered frontier candidates;
- Branch Manager queues further exploration proactively;
- idle workers simply consume ready work locally;
- authoritative proof work always outranks explore work.

Current hint dedup is `(path, depth)`, not semantic quotient identity, and completed keys are forgotten. Automatic replenishment without stronger seen/dedup semantics could therefore re-explore transposed or previously completed regions indefinitely.

### 8. Explore result order is not yet proof-obligation order

`ExploreHint(path, depth)` is structural discovery. The resulting frontier path is not automatically a valid authoritative alpha/beta task.

A discovered branch becomes authoritative proof work only when Negamax dependency state supplies a valid proof obligation/window. Otherwise it may remain exploration or explicitly speculative proof work whose results only enrich shared proof state.

Do not convert ordered explore frontier paths directly into parent-advancing tasks merely because they look promising.

### 9. TT replacement is not the only storage issue

Even after shared-TT entry pressure is reduced/replaced:

- each search worker owns an independent mutable local quotient/class pool;
- each worker owns an unbounded local semantic descriptor cache;
- coordinator local state/class pools also grow;
- JavaScript object/array overhead is not represented by typed-array byte counters.

Attempt 2 reached about 3.60 GB RSS. Shared entry saturation was the observed first failure, but fixing it may expose per-worker local growth next.

### 10. Shared-TT publication assumes publishers survive

A TT slot can enter `SLOT_PUBLISHING`. If a worker/process fails after claiming a slot and before publishing `SLOT_READY`, other workers can repeatedly wait on that slot indefinitely. Current research runs implicitly assume publishers survive each insertion.

Generation/ownership/recovery semantics should cover abandoned publication as well as stale handles if replacement is introduced.

## Medium-priority findings

### 11. Proof hints outrank frontier evaluation by default

The proof-store `bestMove` hint is always tried before other ordering. This is sound because hints are advisory and exact quotient keyed, but the performance policy is implicit.

A move that caused one bound cutoff is not necessarily the best first move for a different window. Decide empirically whether proof hints should outrank dynamic frontier incidence, be combined with it, or only outrank it when the proof strength warrants it.

### 12. `workerSalt` reverse ordering is conventional diversification residue

Alternating center order by worker salt is not frontier-derived. It should not remain merely as generic search-worker diversity unless evidence shows it helps after frontier-native ordering exists.

### 13. Center order remains a tie-break inside live-line evaluation

Dynamic line incidence is correctly derived from current opponent occupancy, but equal-valued moves currently fall back to center order. Center is already naturally favored when its derived line count is larger; using center again for equal frontier values is a separate conventional assumption.

A deterministic canonical tie-break or a proof-derived tie-break would make the distinction clearer.

### 14. Legacy live-line value is ordering evidence, not exact quotient content

The old web evaluator's positional value counts original still-winnable geometric lines. Minimal residual antichain terms are not a drop-in replacement because antichain normalization intentionally removes multiplicity/dominated lines.

Do not claim equivalence between those quantities without a separate proof or benchmark.

### 15. One-sided exhaustion is currently underused

If one player's residual requirements are empty, that player cannot win. This does not always settle W/D/L, but it is an exact one-sided bound and can tighten a Negamax window. Current tactical code only turns bilateral exhaustion into exact draw.

### 16. Open addressing degrades before 100% occupancy

The current semantic table probes linearly until the entire table is exhausted. Even if a run has not yet thrown `entry table exhausted`, high load factor can materially increase lookup/probe work. Storage policy should be evaluated before saturation, not only at the terminal failure point.

### 17. Search-record move encoding assumes standard seven columns

The packed proof record reserves three bits for move `0..6` and sentinel `7`. That is correct for standard 7x6, but it is an implicit domain bound in a file otherwise reusable by smaller/larger research geometries. Keep it explicitly standard-Connect4 scoped rather than accidentally universal.

### 18. Geometry ownership is crossing solver lanes

The new Negamax live-line order imports winning-line geometry from `components/bsfp/geometry.mjs`. Winning-line geometry is Connect4 domain truth shared by both solvers, not naturally BSFP-owned. This is a LEGO ownership smell rather than a correctness error.

## Things that are currently sound and should not be 'fixed' merely for novelty

- Side to move from support-rank parity is exact under standard alternating Connect Four with no pass.
- Minimal-antichain subset removal is structurally sound at identical support context: a smaller same-player requirement wins no later, and any blocker of the subset also blocks its superset.
- Immediate/forced/double-threat tactical checks from playable singleton residual requirements are exact for the propositions they claim.
- Bilateral requirement exhaustion is exact draw territory absent an earlier win.
- Exact semantic TT equality uses support plus exact residual term sequences; hashes are only addressing aids.
- Shared proof lower/upper publication is monotone; advisory hints are not proof authority.
- Worker-local qIDs may differ because shared proof identity is semantic-content based.
- W/D/L threshold root windows `[0,1]` then `[-1,0]` are exact for the discrete result domain.
- Non-interruption of busy workers is a good constraint. Obsolete work should be detached/ignored by the parent rather than forcibly preempted.

## Concrete next corrections before another standard-7x6 root claim

1. Repair the incomplete pre-alpha Branch Manager rename. Current online dependency/root-attempt callers still import `startOnlineMaintenanceHost`, and the obsolete maintenance-worker file still exists.
2. Make authoritative search ordering frontier-native; remove `workerSalt`/static-center defaults from the active path unless retained by measured evidence.
3. Decide how path-local live-line context is carried through recursive authoritative search without pretending it is quotient identity.
4. Replace shared-TT allocate-on-read with probe-without-allocation plus allocate-on-publication, then remeasure entry pressure before implementing replacement.
5. Stream sibling scout completions instead of awaiting the complete sibling batch; detach obsolete non-interruptible work from the parent critical path.
6. Make Branch Manager genuinely self-replenishing with bounded semantic dedup/seen state.
7. Integrate cheap exact frontier bounds such as one-sided exhaustion; reassess U1/U2/NDC strategic closure separately before giving those certificates shared quotient proof authority.
8. Re-run standard-7x6 resource/profile evidence only after the above changes, because current 8.39M-slot pressure and split-depth conclusions are partially properties of the conventional assumptions being removed.

## Bottom line

The quotient mathematics is currently stronger than the execution method around it. The largest hidden assumptions are not in the residual transition algebra; they are conventional search-system defaults around that algebra: center-order recursion, first-representative-path heuristic context, allocate-every-visited-state TT semantics, bulk sibling synchronization, and static split-depth parallelism.

The next optimization pass should therefore make the **execution model conform to the frontier representation**, rather than optimizing the conventional execution shell around an already-frontier-native state model.
