# Frozen next theorem: source-derived full-future alternating simulation for branch elimination

**Date:** 2026-10-17 Pacific. **Owner:** `research/semantic-quotient`.
**Live research branch HEAD before freeze:** `a167792136b876502d0780e015101bd2c46b453e`.
**Status:** MATH PLAN / NOT A RESULT.

## Problem, and what has already been solved
The exact residual/cofactor/terminal/recursive Bellman WDL core is constructively complete. The historical chronological move7/8 column-completion transition and bounded turn8 defensive masks are already closed. The owner explicitly requests **eliminating independently evaluated strategic branches**, returning exact WDL and ALL equally optimal legal moves. Do not continue BDD/QBF gate GC, variable-order sweeps, horizon records or routine solver implementation optimization as the PRIMARY research activity.

The new dual minimal P1 reply antichain reduces one-layer universal proof obligations by 54.47%/52.94% on complete physically legal 4x3/4x4 P1-source corpora but is built AFTER all source K_a masks and cannot be promoted to full strategic equivalence. Genuine legal counterexamples: 4x3 source `111`, P1 replies 2/3 have identical short-horizon signature zero yet full P0 WDL +1/0; 4x4 source `1111222234334`, P1 replies 3/4 identical bounded signature zero yet full P0 WDL -1/0. Preserve these as mandatory falsifiers.

## Full-future alternating simulation lemma to prove and use

For two source residual games u and v at the same remaining-rank/mover, define a candidate structurally decidable relation R(u,v) intended to certify P0-relative `V(u) <= V(v)`.

A sufficient **value-free local closure law** over R is:
- if both terminals, `terminalValue(u) <= terminalValue(v)`;
- if nonterminal with P0 mover: for EVERY legal P0 action c in u, there EXISTS a legal P0 action d in v with `R(next(u,c),next(v,d))`;
- if nonterminal with P1 mover: for EVERY legal P1 action d in v, there EXISTS a legal P1 action c in u with `R(next(u,c),next(v,d))`.

Terminal-vs-nonterminal comparability requires explicit separately justified terminal-value guards; do NOT assume it from residual similarity. For a relation satisfying these clauses, induction on decreasing remaining cells proves `V(u)<=V(v)`, since P0 MAX is monotone under the first ∀∃ action simulation condition, while P1 MIN is monotone under the dual condition. A pair where both R(u,v) and R(v,u) are established is exactly WDL-equivalent (for any rank/actual source q within scope), allowing ALL original action labels to be restored as a tie class. One-way R proves only WEAK action dominance; the easier P1 choice may still tie and must remain a possible optimal label until strict WDL comparison is separately proved.

**This lemma alone is not a computational branch eliminator** if verifying its ∀∃ successors recursively reconstructs the game graph. The desired research result is a **local residual/hypergraph/capacity invariant** R whose closure under all owner cofactors and first-win legality constraints is proven deductively, so each application at a position replaces entire continuation families with one compact proof certificate.

## Candidate structural certificates (ranked next mathematical tasks)

1. **BASELINE PROVED FULL-HORIZON:** exact horizontal-reflection automorphism of winning-line/residual/height supports, including terminal and literal action transport. At symmetric standard7x6 `44444`, seven legal P1 move6 actions become four WDL-equivalence classes `{1,7},{2,6},{3,5},{4}`; after `444444`, six P0 move7 wings become three reflection classes. These are genuine full-game equalities, NOT just bounded one-layer masks. Recover/verify existing G2 source support fiber certificates rather than re-running generic minimax.
2. **SOURCE GUARDED MONOTONE-ORDER EXTENSION:** compare P0/P1 residual upset inclusions AFTER an admissible future-chain/support transport, with explicit cofactor commutation, mover, shared first-win and capacity guards. Existing same-support monotone threshold/fiber theory may supply pieces. Prove the alternating-simulation closure, rather than assuming monotonicity between DIFFERENT supports or phases.
3. **POINTWISE FUTURE PAYOFF SUFFICIENCY:** for actual original source action/reply/continuation literals with totalized guards, prove `P_win(b_h,a,z)=>P_win(b_e,a,z)` and `P_nonloss(b_h,a,z)=>P_nonloss(b_e,a,z)` for every a,z from SOURCE structural implications (not by enumerating z). Original ordered ∀/∃ future operators then preserve weak WDL order. Stronger full future-functional equality on both thresholds grants tie equivalence.
4. **DEFERRED:** applying a one-layer bounded dual signature quotient as if it were unrestricted WDL identity (falsified); further generic ROBDD/QBF node compilation depth without a source-simulation theorem.

## Next bounded experimental protocol
- Derive and freeze a concrete candidate `R` or pointwise implication from source q, winning-line geometry, support h, minimal residual antichains, capacity/terminal guards and literal action transport **BEFORE** consulting any exact solved values.
- First verify that candidate implies the formal simulation step algebraically via owner-true/owner-false cofactors, and that every source move's legal/terminal state is transported or correctly terminal-comparable. Count source residual membership checks, affine/phase guards, relation width and proof DAG nodes; no future-game history traversal in the candidate.
- Negative controls: legal `111` and `1111222234334` bounded-signature equal but WDL different; legal `223` ∀reply ∃response != ∃response ∀reply; `44444` column completion and first-win; source G2 mirror equivalence must PASS. Explicit mutation of one guard should be rejected.
- Post-derivation only: independent complete 4x3-c3 / 4x4-c4 exact-q WDL oracle-free reference validates every proposed dominance/equivalence pair, including exact all-tied-optimal action sets. Use actual source rule verification and count false positives separately; missed valid equivalences are allowed for a conservative relation but must be reported.
- When a certified u/v pair is available, return labels and proof path; quantify **how many successor WDL evaluations were avoided**, not only how many rows a new antichain stores. Compare to baseline reflection-only orbit proof and bounded dual signature savings separately.
- Keep 60,000 nodes / 300,000 nontrivial Boolean operations / 10,000 support reps / 15s PER compile unless owner separately changes it. No new IsoGraph authority, no merge, no searched-value premise.

**Success:** one sound source-only certifiable nonreflection full-horizon action dominance/equivalence class or a rigorous obstruction explaining why the candidate relation cannot lift without enumerating futures. Do NOT promise proof of global branch elimination at a particular horizon. `44444` unrestricted outcome and tied-optimal moves remain UNKNOWN.
