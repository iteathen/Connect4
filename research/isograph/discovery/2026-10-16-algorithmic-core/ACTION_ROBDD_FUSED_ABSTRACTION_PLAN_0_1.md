# Bounded experiment: canonical Boolean cofactor quotient for action-QBF

**Date:** 2026-10-16. **Research owner:** research/semantic-quotient. **Live HEAD before test:** `c9bf6d7a7cd5baef482eed24c11fb9069dd34ec8`.
**Status:** FROZEN PLAN; not a result.

## Why
The first-action-free source-QBF local AND/NOT quantifier projector completed k7 after canonical `44444`, but k8 lower exhausted the 60,000-node limit after 16/21 quantified inner action bits. This does not prove essential future-function width. The prior AND/NOT hash-cons table canonicalizes only identical *syntactic gates*; two different gate DAGs may denote the SAME Boolean function.

## Exact mathematical alternative
Construct a **reduced ordered binary decision diagram** for the *same* source-only guard-complete Boolean matrix `F_z(a0,...,ak-1)` directly by compiling its already-deterministic AND/NOT Tseitin definitions, using ordered, unique `(variable,low,high)` nodes and counted Boolean APPLY. This is canonical for a specified action-bit variable order, giving exact equality of functions on all still-free inputs. Fuse a quantified-variable reduction into the BDD recursion at each original action-bit block:
- `exists x F = F_0 OR F_1`;
- `forall x F = F_0 AND F_1`.
Do not swap the alternating action blocks. Keep the original first-action bits unquantified, yielding one shared complete labelled action-threshold vector without separate root action solves. Explicitly preserve invalid-column coding, full-column guards, first-win, draw, and all original source residual semantics in the input circuit.

**Canonical quotient statement:** two partially assigned histories can share one reduced ordered BDD node ONLY when their future Boolean cofactors agree as FUNCTIONS of the same remaining free action bits, not just if they share rank/support or the same bounded scalar. `reduce + unique-table` is sound by Shannon induction; a BDD is not a magic constant-work operator. Direct source-circuit compilation and all APPLY/cache-miss/quantifier visits are counted. The construction may fail economically and must record it honestly.

## Predeclared comparisons
1. Algebraic identities on generic 3–6-bit truth-table functions: Boolean APPLY, NOT, EXISTS, FORALL, and equal-vs-different cofactor BDD canonicity; an explicit `forall b exists a != exists a forall b` counterexample (the legal physical `223` remains independent game control).
2. Qualified physical small boards 4x3 Connect3 and 4x4 Connect4: terminal and short suffixes, all four threshold action values, full WDL and all tied optimal moves, legal and full-column guards.
3. Standard 7x6 `44444`: k1..k7 must first equal prior independently validated source-QBF/physical threshold vectors; **only then** attempt k8. If k8 completes and no limits change, try k9. Do not misstate these depths: k8 after rank5 is absolute turn13, while chronological moves7/8 were already structurally closed.
4. Compare action-bit orders: chronological and reverse chronological under one identical rule-only source-QBF. Variable order must be fixed before action-value results, and all literal first-action labels retained.
5. Original strict per-compile limits: 60,000 live/retained BDD nodes, 300,000 nontrivial Boolean APPLY/cofactor/quantifier operations, 10,000 source-support representatives, 15 seconds. Report all supporting compilation and GC scans separately; never conceal state enumeration or increase limits. Stop at first failure per variant and retain the negative result.

No game-state continuation search in candidate; physical/minimax reference only *after* formula-derived operator for independent falsification. A compact BDD without successful quantifier elimination is only a representation result. No new IsoGraph authority, no merge.
