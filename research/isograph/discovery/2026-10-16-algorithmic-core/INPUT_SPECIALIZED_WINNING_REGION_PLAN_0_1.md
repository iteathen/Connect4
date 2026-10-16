# Input-specialized backward-winning-region certificate campaign (0.1)

**Date:** 2026-10-16. **Canonical research owner:** research/semantic-quotient.
**Initial live HEAD:** `14d46af997f0a4a1ec5e40d33b11f0542f6f8bed`.
**Authority:** Connect4 game-theory logic 1.2, qualified orientation-sensitive q congruence, exact first-win cofactors and favorable monotone residual order. No authority promotion.

## Decision / objective

The exact **recursive, branching** algorithmic core is already established; a nonbranching implementation is optional. The prior support-general symbolic Boolean compiler could not compile even the empty 4x3 Connect-3 board under 60,000 allocated gates. It attempted a value function over all hypothetical abstract residual states, which may be unnecessarily general for the **one actual input**.

Test a **candidate-first root-winning-region certificate**, specialized to the empty 4x3 Connect-3 q state. The proof need only certify **one W/D/L-optimal opening move** if a P0 win is established; it must not claim all four equal-valued openings without verifying them. Construct and validate separately, no oracle values, solved frontiers, or perfect-play action labels in certificate *discovery*. A separate comparison to the already-qualified `exact-q-core.mjs` after successful backward verification is validation only.

## Proposed proof carrier and construction

A positive P0-winning region at fixed support h is an upward-closed set under the established claimant-favorable residual order. Represent its **verified minimal generators**, rather than all possible abstract states or the entire ordinary WDL value function.

* A proof node contains h, both exact normalized residual antichains and a P0-winning policy. At a P0 mover node, *one* legal action is chosen. At a P1 mover node, *every* legal action is discharged.
* Discharge an edge by (i) immediate first-win outcome for P0, or (ii) direct exact cofactor successor dominating an already certified P0-winning generator at the child support, or (iii) a certified child generator.
* Never promote immediate draw or P1 terminal as a P0 win; full-board nonwinning draw is a **failed** P0-winning obligation.
* Prove each generator bottom-up with a strictly increasing occupied-rank edge (well-founded). A single support-local favorable-order comparison can discharge arbitrarily many equivalent/more-favorable child obligations, without exploring their interiors.
* Candidate discovery is limited to rule-only move ranking: immediate P0 completion, double-threat creation, available residual lengths, source-state residual coverage, deterministic column order. It may try P0 alternatives and expand P1 replies, but must count those efforts truthfully. A witness producer must not read the independently computed WDL root value.
* The **separate verifier** must not search for an action, choose a better branch or load solved values. It must check supplied P0 choices, all supplied P1 actions, legal terminal tokens, exact q cofactors and all dominance premises by finite direct operations and decreasing-rank certificate dependencies. Verify the root q is covered.

## Budget (fixed before run)

- **60,000** construction operations/obligation visits (comparable to the failed symbolic gate budget), at most **300,000** local cofactor, dominance, or candidate-ranking checks, and **15 seconds** construction wall time.
- Limit independently certified P0-winning generator nodes to at most 60,000 and stored proof edges to at most 300,000. Do not increase ceilings after failures.
- One root 4x3 Connect-3 input. No breadth expansion to all support fibers, no standard 7x6 root solve.
- Deterministic candidate order; no random seed needed. Preserve any first counterexample, failed policy and exact budget metrics rather than guessing outcomes.
- Compare final **certificate generation cost**, **verification cost**, visited q states, actual branching at P0 and P1, proof generator count/edge count, number of support-local dominance closures, and peak active obligations against the previously qualified 4x3 exact q baseline **3,734 unique q**, **10,232 transitions**, **7,837 recursive calls**.
- For a successful P0-winning certificate compare the conclusion with the independent recursive core and independent physical-rules controls **only after verification**. Correctness of winning certificate follows from local guards and rank induction, not from sample success.
- Run adversarial certificate alterations: missing opponent response, illegal/changed P0 choice, wrong successor/cofactor, invalid terminal, and false dominance claim. Reject each.
- Make all decisions/result files durable before broadening or switching strategy. Stop the experiment at first successful verified P0 root certificate or first budget exhaustion.

## Interpretation

A small exact certificate would demonstrate **input specialization and one-claimant proof compression**, not a complete branch-eliminating algorithm. P1 universal replies remain proof obligations, and the producer may search alternatives on P0 turns. Returning a single region/certificate does not erase underlying branching work; report true counts.

Failure would be a specific negative result for the candidate strategy under stated budgets, not a falsification of the existing core or impossibility of another compressed predecessor algebra. Minimality, recurrence elimination, universal polynomial complexity and solved-label-driven candidate mining remain out of scope.
