# C4-0008 — BSFP exact solver v1

**Status:** Candidate exact-solver semantic specification on `feature/cuda-bsfp`; not Accepted until reviewed and integrated through the repository's normal authority path.

## Purpose

Define **BSFP — Backward Symbolic Fixed-Point** as a Connect4-owned exact W/D/L solver architecture.

BSFP executes exact game solution backward from geometric terminal facts through NDC dependencies. Its primary proof mechanism is symbolic/ranked fixed-point closure, not recursive move-tree search.

This specification defines solver mathematics and result meaning. CUDA execution is separately governed by C4-0009.

## Depends on

- C4-0001 Connect Four domain semantics;
- C4-0005 solved-strength oracle evidence where standard-7x6 external checkpoints are used for qualification;
- C4-0006 Control Parity and Winspace v1;
- C4-0007 Nested Dependency Closure v1;
- preserved research/evidence, especially:
  - `docs/research/2026-09-09-searchless-symbolic-backward-solver.md`;
  - `docs/research/2026-09-09-backward-winline-fixed-point.md`;
  - `docs/research/2026-09-09-terminal-boundary-qualification.md`;
  - `docs/research/2026-09-09-searchless-backward-candidate-update.md`;
  - `docs/research/evidence/2026-09-09-searchless-symbolic-backward-solver.json`;
  - `docs/research/evidence/2026-09-09-terminal-boundary-qualification.json`.

## Ownership

Connect4 owns:

- BSFP W/D/L semantics;
- terminal and first-win rules;
- controllable-predecessor meaning;
- player-choice/existential/universal composition;
- NDC proof interpretation;
- exact result meaning;
- BSFP record/proof equality and canonicalization;
- representation-specific proof obligations.

CUDA-Algorithms may execute generic progression mechanics but does not own `Win`, `Loss`, `Draw`, `max`, `min`, predecessor meaning, terminal meaning, or Connect Four proof state.

## 1. Result domain

BSFP v1 solves exact W/D/L only.

From the perspective of the side/player orientation declared by the selected profile:

```text
Win  = +1
Draw =  0
Loss = -1
```

A result is exact only when it is derived from the complete applicable fixed-point semantics, not from an evaluation score or incomplete frontier.

Exact strong distance-to-win/loss is outside v1 and requires a separate specification.

## 2. Searchlessness contract

The BSFP production proof path must not use recursive alpha-beta, minimax, MCTS, PNS, or data-dependent legal-move tree enumeration as the primary mechanism for resolving the game.

BSFP may use:

- backward controllable-predecessor fixed points;
- finite ranked dependency propagation;
- symbolic Boolean/multi-terminal functions;
- CPC/WSL/NDC algebra;
- exact dominance/antichain closure under a qualified order;
- bounded static structural case analysis;
- independently implemented search solvers only as external qualification oracles.

A control harness may enumerate physical states to verify BSFP, but that enumeration is not the production solver architecture.

## 3. Terminal axioms

Primitive terminal-win authority is the finite geometric set of K-in-row line schemas for the selected Connect Four geometry.

A legal placement is a new terminal win only when:

1. the predecessor is legal and nonterminal;
2. the newly placed stone lands in the legal gravity-supported cell;
3. the move completes at least one valid K-in-row containing that landing cell.

A full legal board with no winner is a terminal draw.

No continuation after an earlier win is legal solver input.

Terminal predicates must be qualified independently of the symbolic recurrence so a self-consistent fixed point cannot certify its own incorrect axioms.

## 4. Backward fixed-point formulation

The exact W/L attractor formulation is:

```text
Win  := terminal-win
        OR controllable-predecessor(Loss)

Loss := universal-predecessor(Win)
```

Interpretation:

- a state is winning when the side to move has at least one legal exact dependency into a state proved losing for the opponent, or has an immediate terminal win;
- a state is losing when every legal nonterminal continuation is proved winning for the opponent and no immediate winning escape exists.

Iterating these operators from terminal-win axioms gives the least fixed point of forced wins/losses.

States outside both W/L attractors after exact closure form the greatest-fixed-point safety residue and are draws under perfect play.

An implementation may use an equivalent order-theoretic formulation, but it must reproduce these W/D/L semantics.

## 5. Direct support-lattice recurrence

The already-qualified direct symbolic profile uses support/height skeletons rather than physical colored-board states as its primary outer lattice.

For support skeleton `h`, let `V_h` be the exact symbolic W/D/L function over ownership facts still represented by that profile.

For legal move in column `c` landing at cell `x`:

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

Evaluation proceeds from deeper support skeletons toward shallower predecessors/root.

This `max/min` notation is semantic choice composition, not authorization to implement recursive minimax search. The qualified prototype computes complete symbolic predecessor functions bottom-up.

## 6. Finite rank

For the support-lattice profile:

```text
rank(h) = occupied cell count
```

Forward legal moves increase rank by one; backward propagation from child/terminal information to predecessors decreases rank.

A BSFP implementation may use a refined event/completion rank where needed, but every ranked execution profile must prove that dependencies respect the declared finite orientation.

## 7. Support-lattice size

For empty-board width `W`, height `H`, the number of support skeletons is:

```text
(H + 1)^W
```

Examples:

```text
4x3 -> 256
4x4 -> 625
5x3 -> 1,024
4x5 -> 1,296
7x6 -> 823,543
```

This is a structural bound on support skeletons, not a claim about total symbolic proof-node count or memory.

## 8. Representation independence

The recurrence and fixed-point result are normative. The first MTBDD implementation is not.

A conforming BSFP realization may use, individually or in composition:

- raw symbolic ownership functions;
- WSL-625 residual requirements/blockers;
- support-event states;
- CPC response/parity constraints;
- NDC certificate DAGs;
- exact dominance antichains;
- exact symmetry/canonicalization;
- another representation proved equivalent.

Changing representation must not change exact W/D/L.

## 9. Residual-state realization

When C4-0006 residual winspace is used, a BSFP state must preserve every fact needed to reproduce legal transitions and terminal timing, including the selected profile's support/accessibility, side/event rank, normalized surviving requirements, blockers, and response/race facts.

A compressed state is valid only if exact transition/result equivalence is established. Historical colors may be omitted where proven irrelevant; blocked-line history may not be forgotten in a way that revives an impossible win.

## 10. NDC realization

C4-0007 dependencies may be used as symbolic predecessor obligations.

A later/lower-rank result may depend on shared certificates derived from multiple terminal lines. BSFP may hash-cons or otherwise share those subproofs.

The solver must preserve existential versus universal proof meaning:

- existential obligation: one admissible dependency is sufficient;
- universal obligation: every admissible response/dependency must be discharged.

A deduplication or proof merge that loses this distinction is invalid.

## 11. Draw semantics

Draw is not merely "no win found yet."

A draw result requires exact proof that the state lies outside both forced W/L attractors after applicable closure, or an equivalent exact safety/exhaustion proof.

Examples of valid draw mechanisms include:

- greatest-fixed-point safety residue after complete W/L closure;
- bilateral WSL requirement exhaustion with no prior win;
- another independently proved equivalent condition.

Budget exhaustion, capacity yield, unfinished input, or an empty temporary workset is never a draw proof by itself.

## 12. Exact identity

A hash is not equality.

If BSFP deduplicates symbolic records, states, certificates, or frontier entries, equality/canonicalization must preserve complete solver semantics for the selected representation.

CUDA-Algorithms may provide ordering/grouping/compaction over item indices; the equality predicate and canonical proof meaning remain Connect4-owned.

## 13. Independent terminal qualification

The preserved terminal-boundary qualification checked the terminal axioms separately from the symbolic recurrence.

Aggregate complete-small-game evidence:

- **1,634,924** nonterminal physical states checked;
- **3,869,237** legal edges checked;
- **414,691** winning terminal edges checked;
- **96,960** full-board draw terminal edges checked;
- **0** terminal-predicate mismatches;
- **0** terminal-board mismatches;
- **0** prior-terminal states admitted.

It also exercised externally documented standard-7x6 wins/draws and the maintained independent oracle's strong-score convention anchors.

## 14. Direct BSFP qualification

The direct symbolic BSFP prototype solved complete games without recursive minimax and without constructing the physical colored-state graph in the solve path:

| Game | Independent reachable states | Support skeletons | Root W/D/L | Symbolic decision nodes |
| --- | ---: | ---: | --- | ---: |
| 4x3 connect-3 | 4,659 | 256 | W | 7,635 |
| 4x4 connect-4 | 139,625 | 625 | D | 38,438 |
| 5x3 connect-4 | 152,003 | 1,024 | D | 9,099 |
| 4x5 connect-4 | 1,385,521 | 1,296 | D | 302,745 |

Independent exhaustive differential qualification then checked:

- **1,681,808 reachable physical states**;
- **3,869,237 legal oracle edges**;
- **0 W/D/L disagreements**.

A root-specialized symbolic form also matched the exact W/D/L sign of all eight frozen standard-7x6 research roots.

These results qualify the tested recurrence and implementations. They do **not** establish an empty-board 7x6 completion.

## 15. Root specialization

Facts already fixed by an input root/prefix should be constant-folded or otherwise removed from unresolved symbolic state when exact to do so.

The research prototype demonstrated that treating already-known root ownership as free symbolic variables can cause pathological symbolic growth. Correct root specialization changed a late standard-7x6 case from timeout behavior to a small bounded solve.

This is a representation principle, not a requirement to use MTBDDs.

## 16. Proof completion

A BSFP solve is complete only when the requested root has an exact W/D/L classification under the declared fixed-point semantics and all dependencies required for that classification are finalized.

Completion must be distinguishable from:

```text
capacity-yield
budget-yield
watchdog boundary
needs-input
needs-spill
cancelled
failed
unresolved
```

C4-0009 defines the CUDA administrative boundary for these states.

## 17. Qualification requirements for a new representation

Before a new BSFP representation is treated as a maintained exact path, it must:

1. pass terminal-boundary invariants;
2. match complete small-game W/D/L against an independent physical-game oracle;
3. exercise every representation-specific equality/canonicalization rule;
4. prove or differentially verify rank/dependency orientation;
5. exercise draw as well as win/loss roots;
6. include adverse/collision/capacity cases where applicable;
7. preserve exact root results under physical batching/sharding if the representation is batched;
8. keep performance claims separate from correctness qualification.

## 18. Strong distance is separate

C4-0008 v1 does not define Pascal-Pons-style strong score magnitude.

A future strong BSFP extension must specify distance propagation, tie preference, terminal distance convention, and independent numerical qualification. W/D/L equality alone does not establish strong-score equality.

## Non-claims

This specification does not claim:

- empty-board standard-7x6 completion;
- that MTBDD is the final representation;
- that WSL-625/CPC/NDC compression is already sufficient for the empty root;
- exact distance-to-win/loss;
- CUDA correctness or performance;
- that a search-based oracle is part of the production BSFP path.

## Falsifiers

Rework the solver or representation if:

- any complete qualified game produces a W/D/L disagreement against an independent oracle;
- terminal predicates and independent physical reconstruction diverge;
- a symbolic merge changes existential/universal predecessor meaning;
- a draw is inferred from incomplete work rather than exact safety/fixed-point semantics;
- rank orientation is violated silently;
- representation compression changes legal transitions or terminal timing;
- the production proof path degenerates into ordinary recursive move-tree search.
