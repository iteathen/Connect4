# Instrumental GC batching for rank22 anchored symbolic Bellman composition

**Date:** 2026-10-16. Canonical owner: `research/semantic-quotient`.
**Existing qualified algebra:** `source-anchored-owner-bdd.mjs` derives exact WDL/action roots from source h,R0,R1 and future-cell ownership variables only. Original rank24/26/27/28/30/32/35 7x6 fixed-prefix controls all PASSED independent q-only WDL comparisons. Multi-position qualification: 12 legal rank35 + four rank30 controls passed with no mismatches. Negative P1 first-win and owner-restriction mutants both rejected.
**Observed performance wall:** rank22 support rectangle 8,640 vectors. Under SAME fixed 60k node / 300k BDD visits / 15s limits, the original implementation stopped after 1,346 supports, with **13,918** peak BDD nodes and about **132,987** nontrivial BDD operations—15-second clock budget, not semantic or held-node exhaustion. `SOURCE_ANCHORED_BDD_STANDARD7X6_RANK22_RESULTS_0_1.json`.

## Predeclared candidate

Current BDD manager performs a full global mark/sweep and intern/restrict/apply-cache reconstruction **after every compiled support**. This can dominate runtime at thousands of supports. Keep the SAME exact support formulas and node/intern structures, but perform garbage collection:
- after every **64 completed supports**, OR
- when simultaneously allocated BDD nodes reach **40,000** (below fixed 60,000 hard cap), OR
- immediately after the final root support is built.

**No other semantic change.** In-flight BDD roots remain alive and IDs valid between sweeps; all live compiled support W/N and per-action roots remain GC roots at each sweep. Clear caches only during sweep. Track GC cycles, source state/action result, retained-node peak, total BDD node creation, nontrivial apply/restrict/not work and elapsed. The hard **60,000 live nodes, 300,000 nontrivial visits, 10,000 supports, 15s** are unchanged; if a single support step exceeds them, record PARTIAL.

## Controls / falsifiers

1. With batching enabled, reproduce the empty 4x3 and 4x4 root WDL/all action vectors and compare against independently qualified source anchored base.
2. Reproduce 7x6 ranks 24 and 26 exact action vectors (fixed prefix), compare to separately computed q-only reference strictly AFTER algebraic compilation.
3. Attempt rank22 again with no larger cap; if it now completes, compare every literal action WDL, and report independent q reference PASS/PARTIAL strictly within 200k q states / 800k edges / 30s.
4. Never use searched winning policy, lookup oracle WDL values in the candidate, or interpret support-DAG action fanout as eliminated strategic branching.
5. On any discrepancy preserve exact first failing root and re-run a control with default every-support sweep. The earlier budget failure remains a valid historical negative, not overwritten.

A speedup under an identical resource envelope would be an implementation improvement to the existing exact algebraic core, NOT a new game-theory rule or a general nonbranching complexity theorem.
