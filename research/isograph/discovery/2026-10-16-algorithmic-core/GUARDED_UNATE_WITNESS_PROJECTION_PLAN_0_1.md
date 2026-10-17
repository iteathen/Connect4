# Frozen candidate: same-direction witnesses and syntactic unateness for exact quantified factorization

**Date:** 2026-10-16 Pacific. **Live HEAD at plan:** `564f24485c49dac66582c029821985e87e087f79`. **Status:** PRE-IMPLEMENTATION PLAN.
**Owner:** research/semantic-quotient, primary target: exact elimination of adaptive branch expansion and complete WDL-tied optimal literal actions.

## Mathematical lemma before code
For a Boolean function F(x,s), holding s fixed, if F is certified monotone nondecreasing in x, then
  exists x F(x,s) = F(1,s);
  forall x F(x,s) = F(0,s).
If F is nonincreasing, reverse endpoints. This is immediate from F(0,s) <= F(1,s) (or >=).

For a correlated conjunction A(x,s) AND B(x,s), if A and B are certified monotone in the SAME direction, then their satisfiable x-witnesses have a shared endpoint and
  exists x (A AND B) = (exists x A) AND (exists x B).
Similarly same-direction monotonicity permits forall over their disjunction by the dual shared endpoint. General exists-over-AND **must not distribute** without such a certificate; A=x, B=NOT x is the negative control.

Use a conservative syntactic certificate on the existing signed-edge AND/NOT DAG, for the exact CURRENT quantified input bit x:
  x literal: + (nondecreasing); NOT x: - (nonincreasing);
  literals not containing x: 0 (independent);
  NOT flips + and -;
  AND child directions +/+ or +/0 => +; -/- or -/0 => -; 0/0 => 0; mixed + and - or any unknown => UNKNOWN.
An UNKNOWN direction merely triggers existing proven exact local projection/Shannon fallback. No dependency from source full-column, first-win, draw, mover, responder resources may be dropped. Syntactic unateness can miss semantic equivalences but must never assert a false direction.

## Bounded test and instrumentation
Modify ONLY the currently qualified `guarded-action-qbf-local-quantifier.mjs` by computing signed-variable directions before quantifying a selected inner action bit; when certified + or -, restrict to the correct SINGLE endpoint instead of constructing both cofactors or distributing a false independent-witness law. Preserve the shared first-action-free output and all chronological QBF action-block quantifiers.

Falsify on:
1. Generic exact Boolean truth table for x, s over small signed AND/NOT DAG combinations, including A=x B=NOT x, opposite-polarity and negation-dual cases.
2. Independent physically qualified 4x3 Connect3 and 4x4 Connect4 short full-game suffix optimum sets (13 singleton and 11 tied fixtures), plus legal 223 adaptive reply counterexample.
3. Standard7x6 source 44444 k7: compare 28 literal Boolean threshold results with independent physical first-win minimax (2,799,124 validation transitions). Only THEN try k8 and at most k9 with unchanged 60k nodes, 300k nontrivial Boolean ops, 10k supports, 15s per compile.
4. Count polarity certificate recursion/cache work, reduced-to-one-cofactor calls, mixed-Shannon fallbacks, local pushes, Boolean operations, peak AND nodes, independent GC work, and all unresolved outcomes. Never count only final expression size.

Expected research value even on failure: exact count of syntactically unate versus truly mixed adaptive subfactors, not a general lower bound. No oracle-generated policy, new authority, merge, or numerical-cap changes.
