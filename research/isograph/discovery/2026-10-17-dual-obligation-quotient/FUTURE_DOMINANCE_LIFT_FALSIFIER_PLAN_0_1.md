# Frozen cross-horizon falsifier: dual response row dominance MUST NOT be lifted without a theorem

**Date:** 2026-10-17 Pacific. **Research branch HEAD:** `aef307c7d4051fb04826abcdde58848f6088cad2`.
**Status:** PLAN. **Owner:** research/semantic-quotient.

The exact dual reply-signature antichain proved on finite source response-cover relations preserves BOTH `forall b exists a` and `exists a forall b` for that ONE guarded fixed-horizon predicate, and labels for every reply. Full 4x3/4x4 P1 physical-state controls PASS; universal obligation count falls >52% overall. However this savings occurs only after source covers have been computed, so NO full strategic branch elimination has been proved.

## New dangerous inference to falsify
Suppose two P1 reply columns b,c from the same legal source q have the SAME set of P0 answering actions for the short-horizon predicate. This proves only equality of that bounded Boolean predicate, not equality of unrestricted W/D/L. Similarly, strict inclusion of short-horizon response signatures may NOT order their full-game WDL values.

**Falsifier**: enumerate exact first-win-stopped 4x3 Connect3 physical source q where P1 moves next. Derive `K_a` and `S_b` ONLY by original source residual `createUniversalResponseCover` and new dual quotient, then *separately* compute the EXACT unrestricted action values of P1 b via independently qualified recursive `createExactQCore.solve` on each physical/q successor (VALIDATION ONLY).
Look for the first lexicographic legal witness where:
  - S_b=S_c, but full-game WDL(v_b) != WDL(v_c); and separately
  - S_b strict subset S_c but v_b > v_c (P1 prefers lower P0 value).
Record physical move history, original binary masks, both exact numeric WDL child values, first-win/terminal guards and proof of legality. A sampled witness is sufficient to refute unrestricted reuse of the bounded quotient.

If no witness on 4x3, run 4x4 suffix positions under a bounded validation workload. No solved WDL policy or child value is permitted as input to the original dual source quotient. Keep 60k nodes / 300k Boolean ops / 10k supports / 15s **per source compile**; reference validator is bounded separately and can use cache, but must report state/edge work.

A successful witness blocks unsound cross-depth propagation. Next positive theorem must certify `S_b(z)` inclusion *for all guarded legal future contexts z* to remove a universal reply before inner quantifier work, or prove a stronger source monotone simulation. No new authority or merge.
