# Constructive algorithmic core: narrow qualification plan 0.1

**Date:** 2026-10-16. **Durable research owner:** `research/semantic-quotient`.
**Starting live head:** `60f040c47106c03f008f395a59119f37eaab098d`.
**Governing authority:** Connect4 IsoGraph logic 1.2, especially its exact ordinary q_o future-behavior congruence, physical first-win semantics, and its OPEN proof/value shortcut region.

## Corrected question

1. **Core existence/completeness:** Is the finite residual state, exact owner-true/false cofactor, first-win/draw boundary, and alternating max/min recurrence a self-contained algorithm which terminates with exact W/D/L and the complete **W/D/L-optimal action set** for every legal standard Connect4 state? Branching and recursion **are permitted** at this stage.
2. **Preferred extra property:** Can quantified alternatives be composed without **independently recursively** evaluating each alternative? This is strictly separate and unresolved until a structural operator is both exact and computationally shown not to hide equivalent branching.
3. Recursion elimination, polynomial-time complexity, complete frontier compression and minimality are **not** prerequisites.

## Proof method

Induct on the number of empty cells in the finite first-win-stopped game. `q_o` determines the mover and legal actions; a single q cofactor determines immediate completion or a unique child q; a completed winning residual terminates, and board exhaustion without a completion is draw. Every continuing child decreases the empty-cell count by one. The player-to-move extremum (max for P0, min for P1) therefore computes the game value, and its attaining-action set is exact for W/D/L. The solver does not require an oracle. The recurrence may branch exponentially; **do not mislabel that as a missing core operation**.

## New, nonredundant executable check

Prior records already establish: qualified q_o congruence, 316/1,586 rank-local oracle-relative transitions, four exhaustive small-board compiled-frontier round trips. **Do not repeat the oracle campaign or materialize 7x6 rank shells.**

Add a tiny independent stand-alone exact q-only recursive evaluator, which:
- starts from a q compiled from legal physical input or the empty board;
- in its solving loop uses **only** support, P0/P1 minimal residual antichains, exact owner-true/false cofactor, terminal kind and alternating extrema;
- returns absolute P0 W/D/L, mover-optimal **set of legal columns** and per-action W/D/L; tracks nonterminal recursion, nodes, memo reuse and successor calls;
- never calls a solved oracle, physical bitboard evaluator, CPC/NDC strategic oracle, or prefetched frontier label.

Qualify against a separate physical rule evaluator using directly scanned four-direction lines (not q residual operations). Prefer complete first-win-reachable-state controls on the 4x3 Connect-3 and 4x4 Connect-4 boards if budgets allow, and independent bounded 7x6 late-game positions generated only from legal moves. Include immediate wins, opponent wins, draws, non-full stale residuals, symmetry and return-all-ties. Record counts of all q states, all physical states, all legal one-ply edges, W/D/L/action-set disagreements, costs and source revision.

## Predeclared bounds

- Small controls: max **200,000** reachable nonterminal physical states per board, **800,000** local edges, and **30 seconds** per board. If a threshold is met, abort cleanly and mark PARTIAL.
- Q evaluation: max **200,000** unique q states and **800,000** successor calls per board; no searching the 7x6 root.
- 7x6: at most 4,000 seeded legal random playout attempts with seed `0x4c2a3026`; evaluate only positions with at least 35 stones, at most 12 such late positions; max 30 seconds total, max 50,000 unique q states per position. If too few exist, report coverage achieved rather than invent cases.
- Checkpoint code **before** expensive execution; preserve negative results and seeds. Stop on first counterexample and record exact physical position, q, action and discrepancy; never alter the oracle/scorer to force a pass.
- Use the current isolated JS V8 runtime if necessary; distinguish it from Node26/GitHub Actions qualification.

## Decision rule

Declare **constructive algorithmic core established at the game-semantics level** iff the proof assumptions are actually supplied by qualified game rules/q-congruence and a finite executable q-only evaluator realizes them. This is an exact correctness theorem under the stated assumptions; finite tests qualify the code, not the universal theorem.

Declare **branch elimination OPEN** until a generally valid compressed `forall/exists` operator avoids separate recursive child evaluation; returning a single object containing all children is insufficient. Do not manufacture new claim IDs, modify qualified IsoGraph 1.2 or merge.
