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

CUDA-Algorithms owns only reusable provider-neutral mechanics such as bounded worksets, ranked progression, active extents, ordering/grouping/selection/compaction, generic activation, and device-owned administrative progression.

CUDA-JS owns generic runtime/compiler/memory/provider/native lifecycle and Device-JS mechanisms.

CUDA-MCGS/search semantics are not a dependency of this solver contract.

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

Evaluation proceeds backward from deeper support skeletons toward the root support skeleton. The recurrence is semantic authority; the current MTBDD representation is not.

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

Dominance/antichain compression is permitted only under a proved order relation for the exact support/accessibility context. The preserved research theorem candidate uses residual dominance to represent upward/downward-closed W/L regions by frontier antichains.

## Ranked GPU progression

The preferred CUDA composition maps well-founded BSFP dependencies onto the generic ranked-closure machinery in CUDA-Algorithms.

Requirements at this boundary:

- finite explicit rank;
- strict declared rank direction for derived dependencies;
- bounded deterministic per-item emission or explicit capacity-yield truth;
- device-resident active counts and mathematical progression;
- duplicate activation is idempotent where the selected closure algebra requires set semantics;
- Node may administer bounded epochs but may not inspect records/counts to decide mathematical survival or which proof dependency to expand next;
- capacity/budget/watchdog/spill boundaries must yield explicitly and must never masquerade as convergence;
- physical sharding/batching must not change the exact logical result.

The generic mechanics above are governed by CUDA-Algorithms SPEC-0004 while it remains Working Draft. BSFP-specific proof vocabulary and record meaning remain here.

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

## Falsifiers

Rework the solver design if any required exact root/result cannot be derived without effectively recreating data-dependent move-tree search, if symbolic compression changes W/D/L, if temporal ordering is lost, if physical shard size changes the mathematical result, if a capacity boundary drops work or falsely converges, or if the proposed compact state cannot reproduce independent Connect4 oracle results.

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

Where this thin normalization conflicts with exact preserved evidence or an explicit later owner instruction, stop and reassess rather than silently rewriting the theory.
