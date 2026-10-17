# Exact live-DAG quantifier projection: recovering k6 and isolating transient cofactor width

**Date:** 2026-10-16. **Canonical research owner:** `research/semantic-quotient`.  
**Status:** Exact bounded Boolean circuit equivalence and independent finite-horizon physical controls; **k6 repaired for the selected projector, k7 resource-INCOMPLETE**. This is **not** a new unrestricted WDL result, game-theory authority, polynomial projection theorem, or production optimization.

## 1. The mathematical distinction this experiment tests

Prior results already construct a **complete 37-ply truth-equivalent QBF formula** for `44444`, with a certified actual-CNF bilateral pathwidth upper bound 232, but no full quantified truth result. A hash-consed AND/NOT Shannon projector returned exact bounded values on 118 physical controls, yet its k6 lower Boolean function hit 60,000 *allocated* gates after 12/18 action bits. A separate live-root walk showed 17,990 reachable AND gates from 53,025 allocated IDs at the last successfully completed step; 35,017 gates were historical dead intermediates.

**Question:** Is the first resource wall due to failure to reclaim dead expression structure between quantifier blocks? If corrected, what is the next *measured* obstruction, and is it a theorem-level width limit or a construction-schedule artifact?

Frozen plan: `research/isograph/discovery/2026-10-16-algorithmic-core/GUARDED_QBF_LIVE_COMPACTION_PLAN_0_1.md`.

## 2. Exact live-compaction equivalence lemma

Represent each Boolean matrix by a signed-edge AND DAG: nodes are decision bits or binary AND gates, and a negative edge denotes exact negation. Let root r be the formula after completing a quantified bit, **after BOTH cofactors and their existential OR/universal AND have finished**. Define a map `M` by recursively copying the AND gates reachable from `r` in dependency order, retaining input bit IDs, replacing each internal node `AND(a,b)` with `AND(M(a),M(b))`, and transporting edge negations. Recreate input-support masks and hash-consing from the copied definitions.

**Lemma GC-SOUND.** The copied root computes exactly the same Boolean function on all remaining action bits as the original root.

**Proof:** For constants and input bits, M is identity. For a signed edge, negation is preserved. For an AND node, assume the child images compute identical functions by induction on acyclic dependency order. Their conjunction is identical. Every root-reachable node is copied once and every unreachable node has no causal path to r. Thus M(r) and r agree under every input assignment. The original Shannon quantifier step occurs *before* the copy, and no transitive cofactor memo/temporary handle survives it; no commutation or dependency simplification occurs. Therefore the exact quantified prefix truth is unchanged. This is a function-preserving representation compaction, **not a new quantifier theorem**.

The producer rechecks four deterministic input assignments on both sides of every compaction as an independent mutation-control layer; these finite samples are not the lemma's proof. It counts old/new live nodes, copied nodes, traversed edges, before/after evaluations, and retains the original nontrivial Boolean operation counter and the same 60k peak node limit.

## 3. Independent control and work accounting

Code: `research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf-project-live-compact.mjs`, hash-identical to locally tested Git blob `5d0b2c79f61999172d532bae2a78cd92398e0ce9`.
Independent physical finite-horizon falsifier: `guarded-action-qbf-projection-live-compact-control.mjs` (Git blob `f384ee5b1c885c3389fcf0d4d4af7441b818780a`); it searches the physical first-win game **only as validator**, never supplies policy/winner information to the producer. Canonical 44444 k6/7/8 standalone probe: `guarded-qbf-compact-probe.mjs` (Git blob `db02a8ba6d9bdeb2ca4161f991e044f1d612eaf6`). Evidence: `GUARDED_QBF_LIVE_COMPACTION_RESULTS_0_1.json`.

Direct local Node22.16.0 harness: 31 distinct source/depth configurations, 124 threshold projections; **120 EXACT with zero independently compared finite-horizon physical value mismatches**, and four `44444` k8 roots PARTIAL by unchanged node cap. These results include the previously failed k6 lower roots, now computed. A separate predeclared canonical probe specifically tested k7 and k8, retaining additional PARTIAL observations. The control-output SHA256 is `66a314ac0f860f71da67f1ef9b695c2460f6e18cb239fe040092a7eed4cda231`; canonical-probe-output SHA256 `8b89b41cb6f40daa1b07e4cc53f38091c3d89c5c53557aeb17e39c3a0bdccae1`.

| Canonical `44444` horizon / threshold | Quantified action bits finished | Peak retained nodes | Nontrivial Boolean operations | **Additional** compaction/validation work units | Result |
|---|---:|---:|---:|---:|---|
| k6 Wlo | 18/18 | 31,064 | 216,140 | 517,861 | EXACT FALSE |
| k6 Whi | 18/18 | 24,985 | 159,697 | 353,844 | EXACT TRUE |
| k7 Wlo | 12/21 | 60,000 | 207,236 | 478,573 | BUDGET_PARTIAL |
| k7 Whi | 12/21 | 60,000 | 237,668 | 619,546 | BUDGET_PARTIAL |
| k8 Wlo | 11/24 | 60,000 | 210,168 | 623,801 | BUDGET_PARTIAL |
| k8 Whi | 12/24 | 60,000 | 225,756 | 621,593 | BUDGET_PARTIAL |

Nlo duplicates Wlo and Nhi duplicates Whi in these specific early cutoffs; **do not extrapolate equality of all four strategic thresholds at arbitrary sources.** All completed k6 lower/upper truths remain FALSE/TRUE, i.e. **UNKNOWN [-1,+1]** unrestricted game value. No action-vector optimum proof arises from bounded roots.

**The 300,000 cap applies to nontrivial Boolean operations, NOT to uncounted total computation.** GC alone contributed 517,861/353,844 additional counted traversal, copy and before/after validation units for the two k6 thresholds. Both categories are explicitly exposed; it would be invalid to call 216,140 the total run work or to claim guaranteed performance improvement. Nevertheless peak retained memory and Boolean operation budget stayed within the unchanged research ceilings on k6.

## 4. The new measured within-bit obstruction

At `44444` k7 Wlo after 12/21 completed quantified bits, the post-compaction expression contains 26,783 reachable AND gates plus 21 original action bits (26,804 assigned IDs). k7 Whi has 30,848 reachable ANDs plus 21 inputs (30,869 IDs). The **NEXT quantified action bit** constructs a pair of cofactors and their Boolean meet/join; before that bit completes, retaining its temporary gate subexpressions reaches **60,000** nodes. Work at the abort is 207,236 (Wlo) or 237,668 (Whi) nontrivial operations, below the 300k work limit.

Thus:
- It is **proved by direct instrumented execution** that this post-bit-only compaction schedule cannot complete k7 within the fixed 60k *peak* node budget.
- It is **not proved** that a different within-bit cofactor materialization schedule, semantic cofactor quotient, structured-DNNF projection, or Ganian–Gründel resolution/strategy extension must use 60k or more memory. The partial cofactor pair itself may contain garbage, and the completed join/meet could be much smaller. No unconditional width lower bound follows.
- The original reflected source-owner interval BDD still reaches k11 with less work for present bounded-value approximation.

## 5. Next exact mathematical direction: guard-qualified localization

The most justified next test is *not another broad horizon increase*. Seek a true quantifier projection identity that performs local eliminations **inside factored circuits before materializing both full Shannon cofactor subgraphs**, using only proven variable independence.

For a Boolean factor `A(x,s)` with `B(s)` independent of x, and `OP\in{AND,OR}`, the exact sufficient law is:

    (Q_x x) ( A(x,s) OP B(s) )
       = ((Q_x x) A(x,s)) OP B(s),

for Q in EXISTS/FORALL (nonempty Boolean input domain). This follows from finite distributive Boolean lattice adjunction and is valid pointwise in s. For P0/P1 action-bit QBF, the quantifier's scope remains tied to its original action turn; **no movement past a dependent gate or opposite-player quantifier** is permitted. The source terminal, capacity and legality constraints can render a seemingly independent geometric factor actually dependent; measure **true support** on the fully guarded Boolean matrix, not only the source residual hypergraph.

Compare a tree/structured-DNNF quantifier-localization operator (Capelli & Mengel 2019; Ge-Ernst et al. 2022) with source-owner BDD using exact reachable **future cofactor-function diversity** as the width metric. Explicitly count created/intermediate gates and projected cofactor visits, not only final root truth or CNF size. If a smaller exact quantified carrier fails, preserve its first minimal falsifier and budgets.

**Bottom line:** Full-game formula existence is complete; bounded actual evaluation reaches one more ply after removing old garbage but hits a new transient cofactor-product wall at k7. The **unrestricted value after `44444` remains UNKNOWN [-1,+1]**, and the independently established recursive exact algorithmic core remains complete. No authority, merge or gameplay policy promotion.
