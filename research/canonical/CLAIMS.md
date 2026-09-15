# Canonical claim ledger

This is the readable companion to `CLAIM_REGISTRY.json`. It is intentionally conservative. The source archive contains substantially more material than has been normalized here; unreviewed material remains `untriaged` rather than being silently promoted.

## C4-R0001 — winning structures are first-class research objects

**Status:** accepted research model, not a theorem.

Connect4 can be represented and reasoned about through the set of possible winning structures and their relations, in addition to ordinary board-state/game-tree representation. This is the common model connecting the structural, quotient, frontier, Minimax-candidate, and BSFP research programs.

## C4-R0002 — Connect-k line geometry has exact derivative structure

**Status:** `deductive_exact`.

Directional winning-line counts and their finite differences exhibit an exactly derivable interior/boundary structure. The exact geometry is distinct from any speculative semantic rule built from it.

## C4-R0003 — playable own singleton gives an immediate terminal win

**Status:** `guarded_exact`.

When the current player has a legal playable cell completing one of its unblocked singleton-residual winning lines, playing that completion produces a terminal win one physical ply later.

## C4-R0004 — multiple distinct opponent immediate completions force loss

**Status:** `guarded_exact`.

When the opponent has at least two **distinct legal playable completion cells** and the current player has no earlier terminal win, one move cannot block both; the result is a forced loss with the qualified physical terminal distance used by the terminal-frontier calculus.

The distinct-completion guard matters. Multiple line references to the same completion cell do not imply this claim.

## C4-R0005 — a unique opponent immediate completion forces the reply, not the result

**Status:** `guarded_exact`.

Exactly one immediate opponent completion can force the current move to block that cell, but that fact alone does not determine the eventual terminal result. It is an exact move constraint, not an exact terminal-value certificate.

## C4-R0006 — exact structural certificates precede heuristic horizon evaluation

**Status:** `accepted_contract`.

At a solver horizon, exact structural terminal certificates must be applied before heuristic evaluation. A heuristic estimate cannot replace or override an exact consequence.

## C4-R0007 — unresolved residue remains solver work

**Status:** `accepted_contract`.

If no accepted exact structural certificate or valid reduction decides a state, the residual problem remains unresolved and must be delegated to an appropriate solver/evaluator rather than being labeled structurally solved.

## C4-R0008 — quotient reductions require behavior preservation

**Status:** `accepted_contract` for the requirement; individual quotient candidates remain separately qualified.

A semantic quotient may collapse state distinctions only when the equivalence preserves the behavior relevant to the target semantics. Empirical similarity can nominate a quotient but does not prove it.

## C4-R0009 — dead residual win-space implies exact draw

**Status:** `guarded_exact`.

If neither player retains any residual unblocked winning line from a legal state and no terminal win has already occurred, neither player can subsequently create a winning line; the game-theoretic value is therefore draw under the stated guard.

This theorem must not be confused with the performance of any particular runtime detector.

## C4-R0010 — measured hot-state maintenance for dead residuals is not currently justified

**Status:** `empirically_supported`; implementation disposition `deferred` / rejected for the measured hot path.

The investigated live-counter maintenance strategy showed transition/runtime cost while the benchmark campaign observed effectively no useful pruning incidence. That evidence argues against carrying that mechanism in the current hot path. It does **not** falsify C4-R0009.

## C4-R0011 — a complete predicate calculus still lacks composition/closure laws

**Status:** `missing_law`.

The current exact local predicates do not yet provide a complete derivation system for arbitrary positions. Explicit laws are still needed for composing intersections, reachability, timing, ownership, and local certificates into global exact conclusions.

## C4-R0012 — higher derivative / periodic-annihilator structure may yield semantic predicates

**Status:** `candidate_rule` / hypothesis family.

The exact geometric derivative work motivates higher-order structural classifications, but semantic closure and game-theoretic sufficiency must be proved or qualified independently.

## C4-R0013 — perfect-play win-set support/DAG is an active structural experiment family

**Status:** `hypothesis` / experimental program.

The perfect-play win-set support/DAG work investigates whether initial-board and support-structure invariants can characterize reachable winning-space quantities without ordinary recursive search. Individual numerical observations are not promoted here until their definitions and generalization claims are normalized.

## How to extend this ledger

Do not add a new number for prose duplication. Reuse an existing claim when meaning and guards are equivalent. Create a new claim when the proposition, guard, semantic target, or evidence model is materially different. Record relations in `CLAIM_REGISTRY.json`.
