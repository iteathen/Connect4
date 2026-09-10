# C4-0006 — CUDA-BSFP exact W/D/L solver v1

**Status:** Working specification extracted from the preserved 2026-09-09 BSFP research/evidence lineage. Not yet accepted compatibility or 7x6-empty-board completion authority.

## Purpose

Define the Connect4-owned semantic contract for **CUDA-BSFP — Backward Symbolic Fixed-Point**, an exact W/D/L solver whose primary proof mechanism is backward symbolic fixed-point closure rather than recursive move-tree search.

This specification normalizes already-established BSFP research into one entry point. It does not replace the original research/evidence artifacts and does not promote unqualified representation or performance claims.

## Ownership boundary

Connect4 owns:

- Connect Four domain and terminal semantics;
- BSFP proof-state/domain meaning;
- geometric winning-line axioms;
- support/event and residual-winspace interpretation;
- CPC/WSL-625/NDC semantics where used by BSFP;
- exact symbolic identity/equality and proof meaning;
- W/D/L fixed-point interpretation and solver-level correctness.

CUDA-Algorithms owns reusable provider-neutral algorithm mechanics and plans. CUDA-JS owns generic runtime/compiler/memory/provider/native lifecycle and Device-JS language/composition mechanisms.

CUDA-MCGS/search semantics are not a dependency of this solver contract.

## Existing cross-repository authority chain

The CUDA-BSFP integration seam was already designed from the CUDA-Algorithms side. Do not create a competing generic seam in Connect4.

The relevant existing authorities at the current development seam are:

1. **CUDA-Algorithms SPEC-0002 — Algorithm Plans, Active Extents, and Device Chaining** (**Candidate**)
   - owns algorithm-plan semantics, host-known capacities, device-resident active extents, algorithm status, bounded workspace/realization facts, and the rule that GPU-produced counts can feed later GPU work without mandatory host readback;
   - Node may administer submission/observation/epoch boundaries but may not inspect records/counts to decide mathematical survivor sets, ordering, predecessors, or fixed-point progression.

2. **CUDA-Algorithms SPEC-0003 — Stable Index Selection and Permutation Ordering** (**Candidate**)
   - owns stable selection of indices by device flags and stable lexicographic ordering of an index sequence by external primitive key-word columns;
   - deliberately leaves arbitrary consumer-record equality/canonicalization with the consumer;
   - hashes may help partition/group but are never exact BSFP identity.

3. **CUDA-Algorithms SPEC-0004 — Device Worksets and Fixed-Point Closure** (**Working Draft**)
   - owns bounded workset/frontier meaning, ranked acyclic progression, generic activation/delta/compaction progression, capacity and administrative-yield truth, and shard invariance;
   - explicitly retains consumer derivation, record/domain meaning, proof semantics, terminal predicates, equality/canonicalization, and domain-specific dominance outside CUDA-Algorithms;
   - explicitly names BSFP as the strongest first RankedClosure consumer while prohibiting CPC/WSL-625/NDC/WDL vocabulary from the generic RankedClosure contract;
   - intentionally leaves the consumer callback/composition boundary open until the first real GPU vertical slice determines the simplest statically bounded shape.

4. **CUDA-JS SPEC-0028 — Typed Device-JS Library Composition** (**Accepted**)
   - provides the existing consumer-neutral mechanism for compiling bounded typed Device-JS leaf libraries and explicitly importing declared device functions into independently compiled Device-JS programs;
   - imports carry exact typed signatures and semantic/artifact identity through the normal CUDA-JS compile/link path;
   - no dynamic device function pointers, arbitrary native callback surface, ambient registry, or consumer-specific vocabulary is introduced.

The CUDA-Algorithms first-profile design already records the intended BSFP/NDC shape approximately as:

```text
consumer produces candidate records / facts
    -> consumer structural keys or boundary flags
    -> CUDA-Algorithms stable ordering / selection / generic sequence mechanics
    -> consumer exact-equivalence / proof-specific reduction facts
    -> CUDA-Algorithms generic compaction / activation / ranked progression
    -> next consumer-owned BSFP rank/proof work
```

The same design states that BSFP/NDC is the motivating first consumer and that Node must not inspect proof records, choose predecessor semantics, deduplicate proof records, or advance the mathematical fixed point on CPU.

### What remains intentionally unfrozen

There is **not** a missing generic semantics specification to invent before implementation. The unresolved question is narrower: how the first BSFP Device-JS consumer functions are statically composed into a CUDA-Algorithms ranked-closure epoch using the already accepted CUDA-JS library mechanism.

SPEC-0004 intentionally leaves open whether the final reusable form is expressed as typed imported Device-JS leaf functions, caller-supplied prepared function capabilities, a bounded declarative transform, or another consumer-neutral composition shape. The first real BSFP-backed GPU slice is the evidence intended to settle that question.

Therefore:

- C4-0006 must specify the BSFP facts/functions required by that slice;
- CUDA-Algorithms SPEC-0004 must own only the generic progression contract that survives deletion of Connect4;
- CUDA-JS SPEC-0028 remains the lower language/linking authority;
- no repository may infer another owner's semantics from function names, record widths, index layouts, or accidental structural similarity.

## Canonical terminology

- **CPC — Control Parity Calculus:** future-control/event-rank parity, response and timing relations originating in the earlier Connect4 evaluator line.
- **WSL-625 — Winspace Lattice 625:** the fixed 625-element residual requirement/blocker universe for standard 7x6 Connect Four.
- **NDC — Nested Dependency Closure:** recursively compose terminal, prerequisite and adversarial dependencies until closure.
- **BSFP — Backward Symbolic Fixed-Point:** execute the exact game solution backward from terminal outcomes through the symbolic dependency system.

The conceptual stack is:

```text
geometric winning-line axioms
        -> CPC / support-event precedence
        -> WSL-625 residual requirements and blockers
        -> NDC nested dependency closure
        -> BSFP backward fixed point
        -> exact W / D / L
```

These layers may be realized differently as stronger compact representations are qualified. Their semantic ownership does not move into CUDA-Algorithms merely because lower GPU machinery executes them.

## Searchlessness requirement

A CUDA-BSFP W/D/L implementation is not a minimax/search specialization.

The production proof path must not use recursive alpha-beta, minimax, MCTS, PNS, or data-dependent enumeration of legal move continuations as its primary mechanism for resolving strategic alternatives.

It may:

- iterate exact monotone/fixed-point operators;
- traverse a static/bounded dependency DAG;
- solve parity/equation/constraint systems;
- apply exact dominance, blocker, canonicalization or antichain algebra;
- perform bounded structural case analysis fixed by domain geometry;
- use independent search-based solvers only as external qualification oracles.

If unresolved alternatives are converted back into ordinary recursive move-tree choice, that path is not CUDA-BSFP under this specification.

## Terminal axioms

The primitive terminal-win authority is the finite set of geometric winning-line schemas for the selected Connect Four geometry.

A placement is a terminal win only when the newly placed stone completes a valid K-in-row through that landing cell and the predecessor was nonterminal. A full legal board with no winner is a terminal draw.

The BSFP terminal boundary is independently qualified; the symbolic recurrence must not certify its own axioms.

## Backward W/D/L fixed point

The exact W/L attractor formulation is:

```text
Win  := terminal-win
        OR controllable-predecessor(Loss)

Loss := universal-predecessor(Win)
```

Iterating from terminal-win axioms produces the least fixed point of forced wins/losses. States outside both attractors form the greatest-fixed-point safety residue and are draws under perfect play.

The intended production realization computes these predecessor obligations symbolically over compact support/residual/event structure rather than over a materialized physical colored-board predecessor graph.

## Direct symbolic support-lattice recurrence

The already-qualified direct BSFP baseline uses support/height skeletons.

For support skeleton `h`, let `V_h` be an exact symbolic W/D/L function over ownership of already-filled cells. For legal move in column `c`, landing at cell `x`:

```text
Move_c(h)
  = terminal outcome for mover
      if placing x completes a geometric winning line
  = V_(h + e_c)[x := mover]
      otherwise
```

With `-1 < 0 < +1` from P0's perspective:

```text
P0 to move: V_h = max_c Move_c(h)
P1 to move: V_h = min_c Move_c(h)
```

Evaluation proceeds backward from deeper support skeletons toward the root support skeleton. The recurrence is Connect4/BSFP semantic authority; CUDA-Algorithms does not own `max`, `min`, terminal meaning, move meaning, or `V_h` merely because it progresses the ranked workset.

For width `W` and height `H`, the empty-board support lattice contains `(H + 1)^W` skeletons; standard 7x6 therefore has `7^7 = 823,543` skeletons.

## Residual win-space state

A stronger compact realization may replace raw ownership variables with an exact residual state whose semantic content is approximately:

```text
support/accessibility or equivalent legal frontier
+ side/event rank
+ minimal surviving winning requirements for P0
+ minimal surviving winning requirements for P1
+ exact timing/response facts required by the proof algebra
```

For a legal placement at addressed cell `x`:

- mover requirements containing `x` satisfy/remove `x`;
- opponent requirements containing `x` are blocked and disappear;
- an empty surviving mover requirement denotes a completed win;
- equal requirements are deduplicated;
- same-player strict supersets are removed when a subset already represents the stronger/equal completion obligation;
- if both players have no surviving winning requirements and no prior terminal win exists, the remaining continuation is an exact draw region.

Any compressed representation must preserve legal support, event timing, first-win stopping, and all consequences of already blocked lines. A removed physical color distinction must never revive a blocked winning requirement.

For standard 7x6, WSL-625 provides the fixed residual requirement/blocker identity universe for this algebra.

## Nested dependency closure

NDC permits proof facts to depend on earlier proof facts rather than forcing every unresolved relation into move-tree branching.

A generic BSFP certificate may contain:

```text
prerequisites
response/resource/timing constraints
consequence
horizon/rank
```

Consequences may establish ownership/response facts, blockers, requirement elimination, or terminal propositions. Dependencies must be well-founded by the selected event/completion/support rank or otherwise participate in an explicitly valid monotone fixed-point order.

A useful abstract closure state is:

```text
X = (R0, R1, B0, B1, P)
```

where `R0/R1` are active residual requirements, `B0/B1` certified blockers, and `P` compact parity/response/event-order facts. Exact inference is monotone:

```text
F(X) = X union exactConsequences(X)
X*   = lfp(F)
```

No inference may treat eventual ownership as equivalent to ownership-before-opponent-win; temporal/event precedence is a first-class correctness fact.

## Exact equality and canonicalization

A hash is not equality.

BSFP exact state/proof identity remains Connect4-owned. CUDA-Algorithms may sort, group, scan, select, compact or schedule consumer indices, but exact equality/canonicalization of BSFP records is decided by BSFP semantics.

The already-recorded generic boundary is:

```text
consumer exact equality / semantic comparison
        -> device boundary/change flags or equivalent exact primitive facts
        -> CUDA-Algorithms generic sequence/group/selection mechanics
```

Do not add a CUDA-Algorithms generic proof-record equality callback merely because BSFP is the first consumer unless the first GPU slice proves that the existing typed-library/primitive-fact boundary cannot support a correct efficient path.

Dominance/antichain compression is permitted only under a proved order relation for the exact support/accessibility context. The preserved research theorem candidate uses residual dominance to represent upward/downward-closed W/L regions by frontier antichains.

## Ranked CUDA-Algorithms composition

The BSFP dependency orientation must expose an explicit finite rank compatible with the selected CUDA-Algorithms RankedClosure profile. A derived dependency submitted to a strictly descending ranked-closure epoch must have lower declared rank than its source; a violation is an exact semantic error, not a request for the library to guess another rank.

The first CUDA-BSFP vertical slice should bind only the consumer-specific functions/facts actually required to exercise the existing generic contract. It must not freeze names or call shapes before the slice demonstrates them.

At minimum the composed slice must preserve these ownership facts:

- Connect4/BSFP determines consumer item/proof meaning, terminal facts, rank meaning, derivation, exact equality, W/D/L composition, and any proof-specific dominance or canonicalization;
- CUDA-Algorithms determines generic bounded workset/active-extent progression, stable sequence transformations used by the plan, duplicate activation semantics where the selected profile defines set activation, finite capacity/status handling, and physical shard/epoch invariance;
- CUDA-JS determines typed Device-JS library/program compilation and linking, device views, prepared execution, native operation lifecycle, memory/synchronization mechanisms, and lower cleanup.

The current JavaScript `runRankedIndexClosure()` reference is an exact reference for generic **index activation/progression** semantics: finite rank, strict descent, bounded emissions, idempotent activation, shard-size invariance, and exact active sets. It is not an alternative specification of BSFP's W/D/L recurrence and must not be treated as one.

### Consumer-program composition constraint

The preferred first experiment is the already-documented CUDA-Algorithms direction: express BSFP-owned bounded device functions through CUDA-JS typed library composition and import them into the finite algorithm epoch/program.

This must remain statically bounded and identity-material. The experiment must prove that:

- the selected BSFP library exports have exact Device-JS signatures;
- the exact library and imported-function identities are bound into the compiled program identity by CUDA-JS;
- CUDA-Algorithms does not inspect or reinterpret BSFP record fields to call them;
- BSFP does not reimplement generic select/order/active-count/workset progression locally;
- no dynamic device function pointer, native callback ABI, private CUDA-JS import, or host semantic callback is introduced.

If the experiment demonstrates that the Accepted SPEC-0028 leaf-library model is insufficient for a genuinely generic closure epoch, stop and route the minimal missing consumer-neutral capability to CUDA-JS or revise CUDA-Algorithms SPEC-0004 as appropriate. Do not compensate with a Connect4-local native/runtime escape path.

## Administrative and capacity semantics

For a GPU-owned CUDA-BSFP epoch:

- active extents and mathematical progression remain device-resident;
- Node may prepare/submit, asynchronously observe device-produced administrative status, supply/persist opaque shards/checkpoints where specified, resubmit after a declared administrative yield, cancel/stop, and perform terminal result delivery/cleanup;
- Node may not inspect individual proof records or active counts to choose what mathematically survives, what dependency is expanded, or which W/D/L result is published;
- capacity, watchdog, spill, input, or work-budget boundaries must produce explicit administrative truth and must never masquerade as fixed-point convergence;
- physical batch/shard size must not change the exact logical result;
- runtime completion and algorithm semantic validity remain separate facts.

## Qualified evidence inherited by this working spec

Preserved 2026-09-09 evidence establishes:

- direct BSFP solves of complete 4x3 connect-3, 4x4 connect-4, 5x3 connect-4 and 4x5 connect-4 without recursive minimax or a physical colored-state graph in the direct solve;
- exhaustive differential qualification over **1,681,808 reachable physical states** and **3,869,237 legal edges** with **0 W/D/L disagreements**;
- correct W/D/L sign on all eight frozen standard-7x6 research roots using root-specialized symbolic solving;
- independent terminal-boundary qualification over **3,869,237 legal edges**, including **414,691 winning terminal edges** and **96,960 draw-terminal edges**, with no terminal predicate or reconstructed-board mismatch;
- backward attractor/fixed-point controls matching complete small-game results and representative 7x6 roots;
- substantial exact residual-winspace quotienting and WSL-625 fixed-universe evidence.

These results qualify the stated tested domains and recurrence. They do not prove empty-board 7x6 scalability of any current representation.

## Representation status

The raw-ownership MTBDD was the first direct exact realization and is explicitly replaceable.

Current scaling work should prefer representations that preserve the recurrence while reducing symbolic width, especially:

1. WSL-625 residual requirement/blocker variables;
2. support-event state where exact;
3. dominance-antichain W/L frontiers;
4. CPC parity/response/race constraints;
5. upward-closure terminal/blocker operations;
6. exact residual symmetry/canonicalization;
7. GPU-batched and out-of-core execution through public CUDA-JS/CUDA-Algorithms contracts.

These are implementation/representation directions, not permission to weaken exact semantics.

## W/D/L versus strong distance

C4-0006 v1 governs exact W/D/L only.

Exact distance-to-win/loss is a separate extension. A W/D/L proof must not claim Pascal-Pons-style strong-score equivalence unless distance semantics are separately specified and qualified.

## First cross-repository qualification gate

Before C4-0006 or CUDA-Algorithms SPEC-0004 can be promoted on the strength of the first CUDA-BSFP slice, the exact tested tuple must record:

- Connect4 branch/commit and C4-0006 revision;
- CUDA-Algorithms branch/commit and SPEC-0002/0003/0004 revisions;
- CUDA-JS exact revision and Accepted SPEC-0028-compatible library/program path;
- the selected BSFP consumer record/rank/derivation/equality functions and exact semantic identity;
- finite capacities, emission bounds, workspace/status resources and administrative-yield behavior;
- portable differential results against the preserved BSFP/reference/oracle evidence;
- at least one physical CUDA execution of the exact composed path before any native or GPU correctness claim;
- capacity/error/rank-violation/shard-invariance falsifiers;
- lower operation/plan/runtime cleanup evidence;
- an explicit deletion test showing CUDA-Algorithms still describes a coherent generic ranked-closure algorithm after all CPC/WSL-625/NDC/Connect4 terminology is removed.

Performance remains a separate qualification. Correctness does not imply a throughput win.

## Falsifiers

Rework the solver or seam design if any required exact root/result cannot be derived without effectively recreating data-dependent move-tree search, if symbolic compression changes W/D/L, if temporal ordering is lost, if physical shard size changes the mathematical result, if a capacity boundary drops work or falsely converges, if Node becomes part of mathematical progression, if CUDA-Algorithms must own BSFP record/proof semantics to function, or if the proposed compact state cannot reproduce independent Connect4 oracle results.

## Preserved source/evidence authority

This working spec is derived from and must be read with the preserved original packet on `feature/cuda-bsfp`, especially:

- `docs/research/2026-09-09-bsfp-terminology-and-attribution.md`
- `docs/research/2026-09-09-searchless-solver-hypothesis.md`
- `docs/research/2026-09-09-nested-strategic-dependency-closure.md`
- `docs/research/2026-09-09-backward-winline-fixed-point.md`
- `docs/research/2026-09-09-searchless-symbolic-backward-solver.md`
- `docs/research/2026-09-09-searchless-backward-candidate-update.md`
- `docs/research/2026-09-09-owner-searchless-connect4-findings.md`
- `docs/research/2026-09-09-strategic-candidate-theory-state-proof.md`
- `docs/research/2026-09-09-terminal-boundary-qualification.md`
- associated files under `docs/research/evidence/` and `reference/research-prototypes/`.

Where this thin normalization conflicts with exact preserved evidence, the cited CUDA-Algorithms/CUDA-JS authority, or an explicit later owner instruction, stop and reassess rather than silently rewriting the theory.
