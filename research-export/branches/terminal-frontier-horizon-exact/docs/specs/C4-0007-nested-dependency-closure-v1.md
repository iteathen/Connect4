# C4-0007 — Nested Dependency Closure v1

**Status:** Candidate proof-semantics specification on `feature/cuda-bsfp`; not Accepted until reviewed and integrated through the repository's normal authority path.

## Purpose

Promote **NDC — Nested Dependency Closure** from the preserved research line into a formal Connect4 proof-semantics specification.

NDC defines how exact Connect Four facts may depend on other exact facts and be composed to closure without converting every unresolved relation into recursive move-tree search.

NDC is the algorithmic/proof mathematics. BSFP, defined by C4-0008, is the solver architecture that executes the backward fixed-point solution using these dependencies.

## Depends on

- C4-0001 Connect Four domain semantics;
- C4-0006 Control Parity and Winspace v1;
- preserved research/evidence, especially:
  - `docs/research/2026-09-09-nested-strategic-dependency-closure.md`;
  - `docs/research/2026-09-09-universal-strategic-algebra.md`;
  - `docs/research/2026-09-09-backward-winline-fixed-point.md`;
  - `docs/research/2026-09-09-searchless-closure-test-results.md`;
  - `docs/research/2026-09-09-strategic-candidate-theory-state-proof.md`.

## Ownership

Connect4 owns NDC because the meaning of its facts, dependencies, terminal propositions, blockers, response guarantees, timing relations, and proof consequences is Connect Four/BSFP semantics.

CUDA-Algorithms may later schedule indices, order/group candidates, compact worksets, and progress finite ranks. It does not own what an NDC fact proves.

## 1. Core principle

A proof fact may depend on previously or subsequently derived proof facts rather than only on directly observed board predicates.

Conceptually:

```text
primitive facts
  -> local response/control facts
  -> blocker certificates
  -> requirement elimination
  -> new parity/event consequences
  -> larger blocker/race certificates
  -> terminal proposition
```

The dependency structure is a finite proof DAG or a monotone finite-lattice closure, not a transposition-table routing graph and not a recursive legal-move tree.

## 2. Primitive facts

The leaf layer may include exact facts such as:

- currently playable events;
- geometric terminal-win predicates;
- column/support precedence;
- CPC event-rank parity;
- fixed event ownership;
- response-pair/XOR ownership relations;
- normalized residual winning requirements;
- exhausted requirement sets;
- directly certified blocker relations;
- independently established terminal/draw facts.

A primitive fact must have an explicit exact derivation or accepted lower specification. Heuristic evaluator scores are not NDC facts.

## 3. Certificate model

A logical NDC certificate is conceptually equivalent to:

```text
Certificate:
  prerequisites
  guards / response-resource constraints
  consequence
  rank / horizon
  provenance or proof-kind identity where needed
```

`prerequisites` may contain other certificate identities plus primitive structural predicates.

`consequence` may establish, for example:

```text
owner(e) = p
response relation
blocker b is certified
requirement r is impossible
one-sided no-win
terminal win/loss/draw proposition
```

The exact physical encoding is not normative in this specification.

## 4. Well-founded rank

Connect Four supplies natural finite ranks.

For physical/support progression:

```text
rank(state) = occupied cell count
```

A forward legal move increases this rank by one. A backward dependency from a later support state to an earlier predecessor therefore decreases it.

Event/completion/horizon ranks may be used where a proof dependency is finer than occupied-cell rank, but every accepted ranked profile must state a finite rank function and prove the declared dependency direction.

No derivation may silently violate its rank order. A cycle that is not explicitly part of a valid monotone fixed-point profile is a semantic error.

## 5. Closure state

A useful abstract state is:

```text
X = (R0, R1, B0, B1, P, T)
```

where:

- `R0`, `R1` are active normalized residual requirement facts;
- `B0`, `B1` are certified blockers;
- `P` contains CPC parity/response/event-order facts;
- `T` contains terminal/result propositions or other explicitly derived proof facts.

The abstract representation may be refined or compressed, but it must preserve the same proof meaning.

## 6. Monotone inference

For an NDC profile declared monotone under its chosen information order:

```text
F(X) = X union exactConsequences(X)
X*   = lfp(F)
```

Facts are added or strengthened according to the declared order; a consequence may not disappear merely because scheduling or sharding changed.

Examples of exact consequences include:

- parity/response facts certify a blocker;
- a blocker eliminates every residual requirement in its WSL upward closure;
- requirement elimination removes irrelevant obligations from a later proof premise;
- reduced obligations make another event/response relation decidable;
- bilateral exhaustion establishes draw territory;
- a certified completion-before-opponent relation establishes a terminal proposition.

The information order and merge operation must be explicit for any representation that is not simple set union.

## 7. Temporal correctness is first-class

NDC must preserve **when** a fact becomes true where timing can change the winner.

The following are not equivalent:

```text
player eventually owns event e
player owns event e before opponent can complete requirement r
```

A response, blocker, or ownership proof that loses its deadline/event-order condition is unsound even if eventual ownership is correct.

CPC event rank, support order, response obligations, and race horizons must therefore remain available whenever a derived fact depends on them.

## 8. Conditional dependencies

Unresolved exact relations should remain symbolic where practical rather than immediately branching over legal moves.

Examples:

```text
A -> B
A XOR C -> D
{B, D} -> blocker e
```

GF(2) relations, requirement/blocker subset relations, and bounded event-order conditions may be propagated without selecting a concrete move history.

A proof representation may branch only where materially incompatible exact strategic alternatives cannot be represented more compactly. Such branching belongs to NDC proof alternatives and must not silently become ordinary move-tree recursion.

## 9. Shared derived facts

If several earlier obligations depend on the same derived certificate, that certificate should have one semantic identity and may be reused.

Recomputation is an implementation choice; semantic duplication is not required. A proof DAG is permitted to share subproofs across otherwise distinct upstream obligations.

A hash may locate candidate reuse but is never proof identity by itself.

## 10. Requirement/blocker feedback

C4-0006 defines the structural WSL requirement and blocker algebra. NDC permits feedback among those facts:

```text
new response fact
  -> certified blocker
  -> requirements eliminated
  -> smaller relevant event obligation set
  -> stronger parity/response fact
  -> new blocker
  -> ...
```

This feedback is exactly why a flat rule table is insufficient for early-game proof construction.

## 11. Relationship to named strategic rules

Earlier published Connect Four strategic rules may be represented as pre-proved local lemmas or regression witnesses.

The runtime NDC representation should prefer generic consequences such as ownership, response, blocker, requirement, and deadline facts rather than requiring named rule classes as semantic primitives.

If a generic NDC profile cannot reproduce a credited known-valid lemma, that mismatch is evidence of a missing invariant, not permission to weaken the lemma.

## 12. Searchlessness boundary

NDC itself does not authorize recursive minimax, alpha-beta, MCTS, PNS, or ordinary legal-move tree expansion as the primary proof mechanism.

Allowed mechanisms include:

- finite ranked dependency propagation;
- monotone fixed-point iteration;
- symbolic conditional relations;
- exact parity/equation propagation;
- exact blocker/requirement closure;
- antichain/dominance closure under a proved order;
- bounded static dependency DAG evaluation.

If an implementation resolves an NDC dependency by recursively enumerating all legal continuations and selecting the game-theoretic result, that portion is a search oracle/control, not the NDC production proof path.

## 13. Exact identity and merge

NDC exact fact/certificate identity is consumer-owned.

Two proof records may be merged only when their complete semantic obligations and consequences are equivalent under the selected proof profile.

A valid merge must preserve:

- prerequisite meaning;
- timing/rank/horizon;
- consequence strength;
- response/resource constraints;
- terminal meaning;
- any proof-generation or context identity required for sound restart/reuse.

Hash equality or equal cheap keys are insufficient.

## 14. Dominance and antichains

NDC may exploit an independently qualified partial order to represent upward/downward-closed proof regions with antichain frontiers.

The order itself remains Connect4-owned. CUDA-Algorithms may provide generic ordering/selection/compaction machinery over indices but cannot infer that one proof record dominates another.

## 15. Completion conditions

An NDC closure is complete for a requested proof target only when all exact dependencies required by that target are resolved under the selected fixed-point/order semantics.

Administrative boundaries, capacity exhaustion, unfinished shards, watchdog yields, or lack of currently active GPU work are not proof completion unless the solver has separately established that no semantic work remains.

C4-0009 makes this distinction concrete for CUDA-BSFP execution.

## Qualified evidence carried into this specification

The preserved research line establishes:

- finite well-founded Connect Four dependency ranks;
- exact primitive parity/response/blocker/requirement relations;
- backward W/L attractor controls from geometric winning-line axioms;
- small proof-shape quotients showing substantial subproof sharing;
- residual-dominance controls with no observed monotonicity violations on the tested complete games;
- direct symbolic BSFP solving that uses the same nested predecessor semantics without recursive minimax.

These facts support NDC as the proof-composition layer. They do not establish that every proposed compact certificate family is complete enough for the empty 7x6 root.

## Non-claims

This specification does not claim:

- a final certificate binary layout;
- that NDC closure from the empty board is already compact enough;
- that all useful strategic rules have already been reduced to one descriptor family;
- that every NDC profile is acyclic rather than monotone-cyclic;
- CUDA/GPU support or performance;
- exact strong distance.

## Falsifiers

Rework NDC or a proposed profile if:

- a merged certificate loses a prerequisite, response, resource, rank, or temporal condition needed for soundness;
- a supposedly monotone inference retracts or contradicts an earlier exact fact without an explicitly stronger information order that accounts for it;
- closure results depend on scheduling or physical shard order;
- proof completion is reported while unresolved semantic dependencies remain;
- early-game closure requires effectively reconstructing the full legal-move tree with no meaningful symbolic sharing;
- a compact state cannot reproduce independently qualified Connect4 outcomes.
