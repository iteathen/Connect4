# Frozen test: quantifier-localized Boolean factors before Shannon cofactor expansion

**Date:** 2026-10-16 (Pacific); **live branch HEAD at freeze:** `2bfe6538d9754d1c8f11157a09308d2fb773230a`.
**Owner:** research/semantic-quotient. **Status:** PLAN, not an exact outcome claim.

## Algebra before values
Operate on the existing source-derived full first-win/legality-guarded AND/NOT circuit for P0-relative WIN/NONLOSS. Keep all first-action bits FREE; quantify inner blocks in their original adaptive order.

For a quantified Boolean variable x:
1. If a subfunction A is syntactically independent of x (x absent from its exact DAG *support overestimate*), Q_x A=A for Q=exists or forall.
2. Q_x NOT A = NOT (dual(Q)_x A) where dual(exists)=forall.
3. forall x (A AND B) = (forall x A) AND (forall x B), even when both factors depend on x.
4. exists x (A OR B) = (exists x A) OR (exists x B) (derive by negation/dual rule).
5. If x is absent from B, then Q_x(A OP B) = (Q_x A) OP B for either OP=AND/OR.
6. **Forbidden:** exists x (A AND B) = (exists x A) AND (exists x B) in general, or forall x (A OR B) distributing in general. For both x-dependent inputs under such a mismatched operator, fall back to exact guarded Shannon: Q_x F = F[x=0] OR/AND F[x=1], charging both.

Cache quantified subexpressions by (signed node, quantifier type, target x), rebuilding a live signed-edge DAG only after a complete bit. No swapping of quantifier blocks, no unproven action independence, and no hidden future board history traversal.

## Bounded, falsifiable test
- Run the previous source-only shared-first-action experiment and exact independent physical first-win/optimal-mask control on 4x3 Connect3 and 4x4 Connect4 full suffix positions, plus legal 223 adaptive-order counterexample and standard7x6 44444 depth1..6. Treat previous full source-derived Shannon/after-bit GC implementation as an independent algebraic regression.
- Test 44444 depth7 only AFTER small independent controls succeed; attempt k8 only if k7 completes. Report the first failed stage and nontrivial operations/peak nodes under original unchanged ceilings: 60,000 retained nodes, 300,000 nontrivial Boolean operations, 10,000 supports, 15 seconds/compile.
- Instrument: pushed universal-conjunction nodes, pushed existential-disjunction via duality, independent-variable factor eliminations, mixed-factor fallback Shannon operations, cofactor misses, live-compaction work separately, final root action values, per-action numeric thresholds, exact optimal set when all action intervals close.
- The comparator is an *already proven* mathematically exact projected Boolean function, not a universal lower bound; no solved-game oracle/policy inputs.
- Record **negative evidence** if local pushing creates more Boolean operations or fails earlier. Success is reduced **actual quantifier work and eliminated branching**, not merely smaller returned formula or more QBF construction.
No new IsoGraph game-theory authority, no policy search, no branch merge.
