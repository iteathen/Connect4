# Original-q-anchored future-owner ROBDD: remove unrealizable historical ownership variables

**Date:** 2026-10-16. **Canonical research owner:** `research/semantic-quotient`.
**Earlier result:** `OWNER_INCIDENCE_BDD_EXHAUSTIVE_RESULTS_0_1.json` exactly solves every legal WDL/action value on complete 4x3 Connect-3 and 4x4 Connect-4 by owner-incidence support-DAG ROBDD, with NO physical game-state search or solved values entering symbolic compilation.
**Scaling falsifiers:** `OWNER_INCIDENCE_BDD_STANDARD7X6_RANK{28,30,32,35}_RESULTS_0_1.json` show that the support-wide owner-variable function exceeds 60,000 nodes on seeded *actual standard7x6* supports despite only 18 supports at rank35. This breadth comes from retaining ownership variables for **previously filled cells** whose actual consequences are already encoded in the input q residual antichains.
**Current game-theory authority:** qualified q_o/cofactor first-win 1.2; no promotion.

## Derivation frozen before test

Given an **actual legal nonterminal** q0=(h0,R0,R1), define source future-cell set F0. For any virtual support h>=h0 and any future cell already filled between h0 and h, let `z_y` denote the owner of that NEW cell: true=P0, false=P1. No symbolic owner variable is introduced for a cell occupied before h0.

For candidate next landing x=(c,h_c) of player p, the immediate-win predicate under the original source q is:

\[
\boxed{
G_p(h,x,z)
=
\bigvee_{r\in R_p(q_0),\ x\in r,\ r\setminus\{x\}\subseteq O(h)}
 \;\bigwedge_{y\in r\setminus\{x\}} [z_y=p],
}
\]

where O(h)=Occupied(h) minus Occupied(h0).
It checks first-win exactly for any **legally reachable nonterminal** descendant because own residual cofactor success means that *all* source requirements for an unblocked winning line are owned by p. A losing blocker in r falsifies the AND. Larger/superset source requirements are normalized away semantically; early first wins stop recursion.

At a support h, compile P0 WIN/NONLOSS Boolean functions over **only** `z_y` for y in O(h). For a legal next action in column c:
1. Compute G_p from the **original q0** plus the hypothetical ownership of O(h), no child q.
2. Pull back child support functions by Shannon cofactor `z_x=p` (source original-q owner-true/false cofactor).
3. Apply guarded terminal and drawn-full-board action boundaries, then P0 OR / P1 AND with literal action-specific threshold roots.
4. Hash-cons into canonical ROBDD and discard prior supports when no longer needed.

This eliminates abstract ownership histories at the input and maintains exact **adaptive choice quantifier order** in the support DAG. The formula is **input-specific symbolic algebra**, not policy search: the only input facts are q0, geometric support and current mover; the producer does not inspect descendant q states, query winning policies or recursively solve game trees.

## Bounds and predeclared controls

Same fixed caps for each attempted support compilation: 60,000 BDD nodes, 300,000 nontrivial Boolean apply/restrict/not calls, 10,000 support vectors, 15 seconds. No change to budget for comparison. Source q geometric residuals are validated separately by existing qualified q core.

Controls:
1. Empty 4x3/4x4 roots: anchored builder should agree with successful generic-owner BDD and independent WDL all-action outputs. Record node/operation costs.
2. Standard7x6 **frozen seeded legal prefixes** `43214636342357317661423762461717147` at ranks 35,32,30,28, in that order (from prior independent validation fixtures). Candidate gets root h0,R0,R1 only. Compare all root literal WDL action values with the independent exact recursive q solver **only after** compiler closes; cap q recursion at 200k q states/800k transitions/30s. If q reference exhausts, record partial, not PASS.
3. First-win/capacity guards: compare q-root result on both center-full `444444` and its legal turn7 prefixes only if support-rectangle cap <=10k; otherwise preserve explicit NOT_EVALUATED.
4. When legal physical state of support h is supplied, never treat root-specific output as a function over all other possible q states at the same h. Those require their own anchored compilation.
5. Negative controls omit P1 terminal guard or omit owner restriction of the next newly occupied cell. They must be falsified against the oracle-free independent q core; preserve the first concrete witness, not a cosmetic root agreement.
6. Preserve true work counts: support DAG nodes/edges, owner BDD node peaks, residual-clause checks, variable cofactor operations, output action values; note that AND/OR support fanout remains. No general polynomial-time or fully branch-eliminated Connect4 claim.

## Interpretation

Success would show one important route to eliminating **spurious historical state dimensions** while retaining algebraic exact strategic-value evaluation beyond small boards. It is allowed to be recursive/factored but is NOT evidence that full 7x6 empty root can be solved within similar limits. Failure preserves first mixed-cover/BDD width obstruction and does not demote complete recursive q core or prior local fixed-horizon formulas.
