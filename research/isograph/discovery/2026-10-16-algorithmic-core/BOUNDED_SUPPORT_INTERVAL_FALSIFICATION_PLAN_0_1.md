# Bounded-support WDL interval — independent cross-horizon falsification plan

**Date:** 2026-10-16. Canonical owner `research/semantic-quotient`.
**Already frozen positive:** `BOUNDED_SUPPORT_INTERVAL_RANK20_RESULTS_0_1.json` — source-q rank20 prefix `43214636342357317661`, depth4 support cone 284 vectors (of 14,400 full), all seven literal action values exactly +1 on column5, -1 others. Independent complete q solver confirms 79,697 states, 351,153 move evaluations. This control **does not infer general early closure**.
**Authority:** qualified q_o and terminal-first 1.2, no promotion or merge.

## Mathematical falsifier

For each valid legal starting q and each literal root action a, define exact full-game WDL \(v_a\), and bounded interval \([l_{a,k},u_{a,k}]\) by assigning unknown [-1,+1] to nonterminal support cells at cutoff k, then composing P0 max/P1 min with exact terminal-first source-q owner BDD cofactors.

Soundness must satisfy for every tested rank/horizon/action:

\[
  l_{a,k}\le v_a\le u_{a,k}.
\]

Increasing cutoff k must preserve the tightening order
\(l_{a,k}\le l_{a,k+1}\), \(u_{a,k+1}\le u_{a,k}\).
If lower=upper, action value is exact. If root lower=upper, absolute root value is exact; the full optimal-move set can be emitted only if all actions can be classified by strict bound separation or known exact equality. These properties must also hold on P1-to-move input (minimizer).
For k>=remaining empties, all action intervals must be exact and equal to previously qualified ordinary q solver.

## Predeclared, rule-only fixtures and budgets

Use **all 12** independently generated legal rank35 standard7x6 positions from frozen
`STANDARD7X6_LOCAL_FUSION_RESULTS_0_1.json` and their **first four** 30-move prefixes. No winning policy or oracle label may enter BDD compilation. Exact horizon set per rank35: **k=1,2,3,5,7**; per rank30: **k=2,4,6,8**. Additionally, include 4x3 Connect-3 legal physical prefixes `223`, `1112232`, `112233` if first-win stopping permits, and 4x3 empty root k=1,3,5,8,12; include P0 and P1 movers. These are validation fixtures, not forward policy search.

Each symbolic compile: original cap 60,000 nodes, 300,000 nontrivial apply/restrict/not operations, 10,000 support vectors, 15s clock. Each independent ordinary q reference: <=200,000 q states, <=800,000 transitions, <=30s per q. Total experiment should make useful incremental checkpoints and avoid extraneous tests if any user interruption occurs.

**Negative mutant controls:** (1) replace cutoff unknown [-1,+1] by a falsely CERTAIN P0 win, (2) drop P1 first-win guard, and (3) skip new-cell owner cofactor. No production-source patch; compare with exact independent q or reject unbound variables on a genuinely physical input. Require at least one detected first falsifier for each or explicitly record missing coverage.

## Qualification decision

PASS if every completed action interval contains the independently obtained exact action WDL and depth monotonicity holds in all tested cases; when remaining cells entirely represented, action intervals must collapse to the exact values. A budget-partial is not a semantic fail. This is an exact algebraic *soundness* check under the finite-rank proof, not statistical proof of a global complexity bound. Preserve actual support work and all statuses.

Do not recast a bounded support-cone compilation as a search for a winning sequence. The candidate is a Boolean representation of the same quantified Bellman algebra and still has support-action AND/OR fanout.
