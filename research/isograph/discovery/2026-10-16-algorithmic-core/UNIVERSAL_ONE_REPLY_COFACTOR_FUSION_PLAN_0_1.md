# One-reply universal win-response cofactor fusion — bounded test plan

**Date:** 2026-10-16
**Research owner:** `research/semantic-quotient`
**Starting HEAD:** `b5f79ec11057704066ae589ac6416a609df94404`.
**Governing authority:** qualified standard-7x6 q_o/cofactor congruence, first-win termination, rule-derived residual upsets. Other board dimensions are experimental controls.
**Goal:** construct a **rule-derived alternating-response operation that avoids independently expanding opponent game continuations**. The 46/47-generator winning proofs and solved oracles are validation fixtures **only** and may not inform candidate construction.

## Candidate law, derived before execution

At a legal nonterminal **P1-to-move** ordinary q, P0 is the proposed claimant; `h[c]` is the height of legal column `c`, and `x_c=(c,h[c])` is its immediate gravity landing.

Define three purely rank-local structural quantities by lookup of singleton residual requirements:

- `T(q) = { c legal : {x_c} in R0(q) }` — currently playable immediate P0 winning landings, whether or not it is P0's turn.
- `B(q) = { c legal : {x_c} in R1(q) }` — P1's current first-win actions.
- `U(q) = { c legal : h[c]+1<H and {(c,h[c]+1)} in R0(q) }` — P0 singleton requirements at the *next* landing **above** a P1 move in that same column.

These sets are derived from the actual residual antichains and gravity, not from simulating outcomes or consulting known strategies. Residual minimality makes singleton lookup exact; all singleton completions must be terminal checked first.

The proposed *universal immediate P0-response predicate* is:

```text
AllP1RepliesLeaveP0ImmediateWin(q)
=
(B(q) is empty)
AND (
     popcount(T(q)) >= 2
  OR (popcount(T(q)) == 1 AND the unique t in T(q) belongs to U(q))
  OR (popcount(T(q)) == 0 AND U(q) includes every legal column)
)
```

Equivalent one-word test, with L the legal-column bitmask:

```text
B == 0  AND
((|T|>=2) OR (|T|=1 AND ((T & U)!=0)) OR (T==0 AND ((L & ~U)==0))).
```

**Proof idea:** A P1 move b kills any old P0 singleton {x_b}, but cannot remove P0 singleton requirements in other columns; the new P0 landing in b is the next cell directly above x_b, hence is an immediate P0 win **iff** `b in U`. No other P0 singleton can appear when the opponent adds a stone. Thus the set of legal immediate P0 winning actions after b is exactly `(T\{b}) union ({b} if b in U)`. An immediate P1 completion takes precedence, so require `B=empty`. Full-board draw is naturally excluded by the absence of next P0 landing. The conjunction over every b simplifies by cardinality of T to the three cases above.

This exact statement is a **one-opponent-turn horizon**, not an eventual WDL solution, a winning strategy beyond one immediate response, or a recursive game-tree search. When true, it is a sound structural sufficient condition for P0 having a forced win from the P1-to-move position.

## Operator-lift probe (also predetermined)

For P0-to-move q, a rule-only candidate for **P0 win in at most its next two moves** is: for a legal action a, either P0 wins immediately under the exact local cofactor, or the single child q has `AllP1RepliesLeaveP0ImmediateWin` true. Evaluate this independently for each *literal first action*, but **no recursive continuation/game-tree solve** is allowed in the producer. Returning a set of all certifiably winning actions is one output; it may be incomplete relative to eventual WDL optimal moves.

A separate brute-force physical validation is permitted to test the fixed two-P0-move reachability claim; it must NOT be used to construct or correct the producer formula.

## Qualification and budgets

1. Commit this plan and the formula implementation **before** running controls.
2. Positive/negative exact tests on complete reachable first-win-stopped **4x3 Connect-3** and **4x4 Connect-4** nonterminal domains. Time: 30 seconds per board; 200,000 physical states, 800,000 physical transitions, 300,000 aggregate local formula checks; if exceeded report PARTIAL.
3. At every P1 state, compare the fused predicate to independently scanning **all** P1 literal replies followed by available P0 immediate wins, using direct physical four-in-a-row geometry. At every P0 state, compare all action answers of the two-P0-move lift to a distinct direct finite-depth physical AND/OR checker (depth <=3 after the action, first-win-aware). Never extrapolate this bounded correctness to full-game value.
4. Record the observed numbers of true cases for `|T|>=2`, `|T|=1 and t in U`, and `T=0 and U=L`, plus failing counterexample if any. Include full early P1-win and draw guards, complete action masks, legal placements and reflection controls.
5. Compare real construction cost: number of residual membership tests, legal-action bit operations, **zero child continuations** for the P1 universal calculation, vs direct validator's materialized P1/P0 response edges. Do not claim all game-tree branching eliminated.
6. Add negative controls that deliberately omit `B=empty` or the `U_t` guard. Report whether actual finite controls detect them; if not, preserve a constructed counterexample from mathematically admissible abstract q states, clearly marked nonphysical.
7. Stop after 30 seconds or 300k abstract/physical candidate checks; no budget increases. This experiment is not a search for the winning move of 4x3/7x6, and does not consult stored search-generated policies, oracle labels, or perfect-play values during candidate construction.

## Success/failure interpretation

Success would prove and independently validate a **specific one-ply universal response quantifier fusion** with no recursive child evaluation, and an exact bounded two-P0-move structural operator. This is a positive algebraic mechanism to compose, but by itself does not close full arbitrary-horizon branching.

A falsifier would identify a missed terminal/gravity cofactor guard and invalidate the candidate until independently corrected; do not rerun expanding game searches to patch the failure.

The already established recursive/branching q algorithmic core remains valid whether this optional reduction succeeds or fails. Minimality/recursion elimination are deferred.
