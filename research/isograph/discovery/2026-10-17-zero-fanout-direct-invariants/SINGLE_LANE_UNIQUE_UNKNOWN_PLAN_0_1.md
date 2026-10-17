# Frozen candidate: exact one-lane structural continuation after source certificate saturation

**Date:** 2026-10-17 Pacific. **Owner:** research/semantic-quotient. **HEAD at freeze:** `030cd8922c1693c990d0838b6e41e1a38c34b2a4`. **Status:** proof candidate, not full-board result.

## Strict mathematical interface

The already proved source-only two-turn/frontier operator returns an EXACT unrestricted WDL value for selected literal first actions without constructing their q successors: immediate own first win, guaranteed opponent next-turn win, mover double-threat guaranteed win, exhausted both winning requirement families forcing draw, or previously proved source-only pairing/forced-column exact root certificates.

Let `E(q)` be the set of first actions whose EXACT full-game WDL value is certified directly from source q. Let `U(q)=L(q)\E(q)` be actions not yet certified. The current source operation must compute E and U **simultaneously from q** using no future-game evaluation and without mistaking bounded tactical equivalence for exact WDL.

**Lemma SINGLE-LANE-INDUCTIVE-CLOSURE.**
- If `U(q)=empty`, the source action vector gives `Z(q)=(V(q),ALL best moves)` directly.
- If `U(q)={c}` is a singleton, calculate ONE exact successor cofactor `next(q,c)`, and apply THIS SAME nonbranching algorithm to that single child. If it yields exact `V(child)`, combine with all previously certified source-only action values; one max/min on that labelled vector gives exact `Z(q)`, with EVERY tie.
- If `|U(q)|>=2` and there is no proven full-future equivalence theorem grouping them into ONE class, return INCOMPLETE. No child states may be materialized and no fallback minimax/BDD/QBF may evaluate these alternatives.
- If the unique child is incomplete, the parent is incomplete. Never backtrack to another speculative action.

**Proof:** source-certified action values are exact by prior guarded residual theorems. The only non-source value arises from one strict-rank-descending successor; rank induction proves it exact if the single lane terminates in a source-only certificate. Thus the whole first-action value vector and equality-based best-move set are exact, and the **maximum game-semantic fanout is ONE** throughout the execution trace. Runtime and depth are not the success criterion. An unanswered source state is INCOMPLETE, not a falsified WDL.

This is a recursive algorithm, but not a branching one: it never evaluates two inequivalent future games. It is a **restricted-domain** exact zero-fanout algorithm, NOT proof that every Connect4 position has a single-lane structural closure.

## Source-only full-future equivalence extension (deferred until first control)
Full-future mirror, nongeometric static column-transport isomorphisms, and dynamically pooled inert-column equivalences are earlier proved rules. When several U(q) labels are certified as ONE entire-future equivalence class, one class representative can be the single lane and all corresponding original labels receive its value. Weak scalar dominance is NOT sufficient for tying or single-lane merging. The immediate test must start with **literal singleton U only**, then consider exact equivalence transport separately.

## Frozen falsifiers
- All 3,734 q states of 4x3 Connect3 and all 34,094 of 4x4 Connect4 reconstructed from independently legal physical sources, including every P0/P1 rank. Qualify full WDL, all labelled first-action values and complete best-move set against independent qualified full recursive q solver ONLY AFTER deriving source invariants/unique unresolved action choice. Count exact q states certified by one-lane process, new versus zero-continuation direct source theorem, maximum lane length, total true next(q,c) calls and **max semantic fanout**, false-positive cases, and distribution of INCOMPLETE because >=2 unknown.
- Original legal `223` noncommutation, `111` source bounded-response WDL-divergence, center-full original chronological moves7/8 and standard `44444` with seven legal P1 moves; fail safely when >1 inequivalent action unresolved.
- Instrument `semanticNextObjectsConstructed`, `evaluatedInequivalentSuccessorsAtOneNode` and `maximumStrategicFanout`; no source solver WDL action values may enter candidate. Any value obtained from two futures is FAIL_ZERO_BRANCH, not progress.
- Same frozen per-source resource envelope 60k nodes, 300k Boolean/bitset ops, 10k supports, 15s as safety only; no increase/authority/merge. The mathematical theorem does not depend on speed.

**True success:** a strict zero-branching evaluation trace that returns an exact complete optimal-move set on a nontrivial test domain. The generic arbitrary-position theorem still requires a source law that reduces every unresolved action set to one future-equivalent class WITHOUT enumerating game continuations.
