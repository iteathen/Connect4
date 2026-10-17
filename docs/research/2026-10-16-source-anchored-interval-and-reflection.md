# Source-anchored W/D/L intervals and reflection-quotiented support algebra

**Date:** 2026-10-16  
**Research owner:** research/semantic-quotient  
**Research direction:** Josh Oshiro  
**Qualification:** Finite-rank theorem and independent bounded controls. General arbitrary-depth computational branch elimination remains **OPEN**. No game-theory authority promotion or merge.

## Executive result

The exact Connect Four algorithmic core was already constructively complete, including the possibility of recursion and branching. This campaign studied the optional stronger goal: evaluating exact W/D/L and every optimal move without recursively searching **concrete future game states**.

We derived a source-q-anchored **interval Bellman algebra** that returns certified upper and lower game values. It builds a support DAG symbolically; all terminal guards and literal action choices remain exact. A nonterminal depth cutoff carries **unknown [-1,+1]**, not a guessed outcome. If bounds converge, the value is proved exact by interval induction.

On the canonical 7×6 position after 44444, the method was subsequently strengthened by a guarded reflection support quotient and a deterministic variable order based only on the source residual requirements. It completed **eleven additional plies** within the unchanged 60,000 BDD-node, 300,000-operation, 10,000-representative-support and 15-second per-compile limits. This computation represented 18,620 ordinary supports by 9,366 reflected support orbits, with 16,511 peak BDD nodes and 268,341 nontrivial Boolean operations. **Its root and action intervals remain [-1,+1]. The eventual game value has NOT been determined.**

## 1. Finite-horizon interval theorem

Let V(q) have absolute P0-relative W/D/L values -1 (P1 win), 0 (draw), +1 (P0 win). A source q=(h,R0,R1) is a valid nonterminal, first-win-stopped gravity position. For each support and each literal action, retain four Boolean thresholds:

- Wlo = lower-bound P0-win threshold; Nlo = lower-bound P0-nonloss threshold.
- Whi = upper-bound P0-win threshold; Nhi = upper-bound P0-nonloss threshold.

At a **nonterminal horizon cutoff**, set (Wlo,Nlo,Whi,Nhi)=(0,0,1,1), representing [-1,+1]. At a nonwinning filled-board draw, set (0,1,0,1). A terminal P0 first win has all four bits true; a terminal P1 first win has all four bits false. These are applied before continuing.

For a mover p and next cell x, compute the immediate-win Boolean guard from **original source residual requirements** and the ownership variables of cells filled AFTER the source state. Pull back all four continuing child thresholds by Shannon restriction to z_x=p. On P0's turn, combine an immediate P0 win with the restricted child threshold using OR; on P1's turn, conjoin with the complement of P1's immediate win. P0 aggregates action thresholds with OR, P1 with AND. All literal action-labelled roots remain separate.

**Proof:** At the cutoff, every legal nonterminal future value lies within [-1,+1]. The source residual owner-true/opponent-blocker cofactor and first-win guard are exact under qualified q_o semantics. Minimum and maximum are monotone in each input, so the bounded-child interval property lifts inductively to every parent action and root. Hence, for every root and every literal action, lower <= exact W/D/L <= upper. Increasing depth tightens lower upward and upper downward. If lower=upper, this certifies the **unrestricted** W/D/L value, without computing all deeper supports. The *complete* optimal action set is returned only when all action intervals can be classified: for P0, action lower equal to an exact root value guarantees optimality; for P1, action upper equal to that value guarantees optimality; strict separating bounds prove alternatives nonoptimal. Anything else stays UNKNOWN.

**Support cone count:** For future column capacities c_i = H - h_i, the exact number of support vectors using at most k additional pieces is the sum of coefficients 0..k in the generating polynomial product_i (1+x+...+x^c_i). This is a count of support states, NOT colored physical game states.

Implementation: research/isograph/discovery/2026-10-16-algorithmic-core/bounded-support-interval-bdd.mjs. Frozen plan: BOUNDED_SUPPORT_INTERVAL_BDD_PLAN_0_1.md.

## 2. Precise tactical closure at rank 20

The legal standard7×6 prefix 43214636342357317661 (rank20) has height vector [3,2,5,3,1,4,2], 22 empty cells and 14,400 complete future-support configurations—over the existing 10,000-support cap.

A depth4 source-anchored support cone used only 284 supports and 38 nontrivial BDD operations and correctly returned exact P0 WIN with **column 5 alone optimal**. The independent unrestricted exact q solver confirmed all seven action values, using 79,697 distinct q and 351,153 moves.

**Important correction to the initial interpretation:** a separate sensitivity test established that the root P0 win is already certified at depth **1**; the entire seven-action value vector is certified at depth **2**, using only 35 support configurations. This source position contains a short tactical decision. It is NOT evidence that the algorithm has eliminated a deep strategic branching problem. The earlier reported depth4 comparison was a correct computation, but not the shortest required computation.

Evidence: BOUNDED_SUPPORT_INTERVAL_RANK20_RESULTS_0_1.json and BOUNDED_INTERVAL_HORIZON_SENSITIVITY_RESULTS_0_1.json.

## 3. Earlier 7×6 positions and independent physical checks

The following source prefixes were chosen by occupied rank from the SAME frozen, independently legal physical history, not by examining their winning values.

| Rank | Future cells | Exact bounded result | W/D/L-optimal columns | Qualification |
|---|---:|---|---|---|
| 14 | 28 | P0 WIN, depth 2 | 1, 5 | Independent direct physical depth2 PASS |
| 16 | 26 | P0 WIN, depth 2 | 5 | Independent direct physical depth2 PASS |
| 18 | 24 | P0 WIN, depth 2 | 5 | Independent direct physical depth2 PASS |
| 20 | 22 | P0 WIN, value depth1, all actions depth2 | 5 | Complete exact q reference and physical depth4 PASS |
| 22 | 20 | P0 WIN, full-horizon symbolic | 2, 5 | Previously qualified complete exact q comparison |

At ranks14,16,18 the independent FULL q solver stopped at its fixed 800,000-move cap. Those cases are **not independently qualified by full-depth q search**. They are nevertheless exact under the interval theorem because bounds converged; moreover their literal action values were confirmed by a separate direct physical **two-ply** first-win checker. Across nine bounded physical falsifier cases, 2,089 physical move checks found zero bound/action discrepancies. Source symbolic generation never used these physically searched continuations.

Cross-horizon validation checked 90 compiled intervals across 19 physically legal positions: 12 frozen rank35 standard7x6 cases, four earlier rank30 prefixes, and 4x3 Connect3 sources. No exact-action containment or interval monotonicity failed. One predeclared 4x3 fixture 112233 was explicitly excluded because it had already terminated before the desired position. The empty 4x3 root remained UNKNOWN through symbolic depths1,3,5,8 before correctly becoming exact P0 WIN with all four W/D/L-optimal actions at depth12. **Not all positions have early bound convergence.**

Evidence: BOUNDED_INTERVAL_PHYSICAL_RESULTS_0_2.json, BOUNDED_SUPPORT_INTERVAL_CROSS_HORIZON_RESULTS_0_1.json and BOUNDED_SUPPORT_INTERVAL_RANK14/16/18_RESULTS_0_1.json.

## 4. Two actual unresolved early-game tests

- Rank10 prefix 4321463634: 141,120 full future supports. Its k9 bounded cone has **9,224** supports and returns root and all seven literal action intervals **[-1,+1]**. Depth10 would need 14,380 ordinary supports, beyond the existing limit.
- Canonical 44444, with P1 to move at turn6: 235,298 full future support states. The ordinary k9 cone has 7,798 supports and also returns **[-1,+1] for every legal action**. No P0/P1 perfect-play winner or turn7 outcome equivalence follows.

The unrestricted q reference also hit its fixed budget on these early inputs. Preserve all UNKNOWN values rather than inferring a draw/loss or reporting a purported optimized move.

Evidence: BOUNDED_SUPPORT_INTERVAL_RANK10_RESULTS_0_1.json, BOUNDED_SUPPORT_INTERVAL_44444_RESULTS_0_1.json, BOUNDED_INTERVAL_HORIZON_SENSITIVITY_RESULTS_0_1.json.

## 5. Exact reflection support-orbit quotient

Horizontal reflection J maps column c to W-1-c. **An exact source-q symmetry guard is mandatory:** h, R0 and R1 must each be invariant under J. Symmetric heights or an equal phase weight alone do NOT qualify. The physically legal 4x3 prefix 1234 has symmetric support [1,1,1,1] but asymmetric R0/R1 and is rejected by the quotient.

For an eligible source, compile only the lexicographically smaller representative of each (h,J(h)) support pair and retain every **literal action-labelled** interval. When a child support is reflected to its canonical representative, transport its owner variables back to actual coordinates before restricting the newly placed cell. An ROBDD cannot safely be transported by simply changing its variable identifiers, since reflection changes variable order. Use exact Shannon substitution:

    J(BDD(z_x,lo,hi)) = ITE(z_J(x), J(hi), J(lo))
    ITE(z,h,l) = (z AND h) OR ((NOT z) AND l).

This rebuilds a reduced ordered BDD using counted hash-consed Boolean operations. It is a valid algebraic quotient, not game-state search. A support cone with ordinary size S and reflection-fixed supports F has precisely **(S+F)/2** orbit representatives. The implementation enumerates canonical representatives directly rather than generating the discarded mirror half.

Independent exact q controls passed on both complete small-board roots and on physically legal mirror-invariant source 1243 in both geometries. All action intervals for canonical 44444 at k9 exactly match the nonquotiented algebra, with zero discrepancies.

Evidence: REFLECTION_BOUNDED_SUPPORT_INTERVAL_RESULTS_0_1.json, implementation reflected-bounded-support-interval-bdd.mjs.

## 6. Static source-only variable order and eleven-ply boundary

A BDD's variable order changes compilation work while preserving the Boolean function. Try two additional orderings determined **before** evaluating any W/D/L: column-major owner variables, and descending frequency of each future cell among original R0+R1 residual requirements (stable row-major tie break). The physical cell-ID <-> BDD rank permutation is applied to owner restrictions and Shannon mirror transport. Both static orders passed independent exact W/D/L/all-action validation on 4x3 and 4x4 empty roots and symmetric source 1243. They also matched ordinary k9 intervals and passed monotonic k9->k10->k11 checks.

| Canonical 44444 depth | Ordinary supports | Exact reflected orbit count | Owner-variable order | BDD operations | Peak nodes | Root interval |
|---|---:|---:|---|---:|---:|---|
| 9 | 7,798 | 3,934 | original row-major | 47,404 | 2,996 | [-1,+1] |
| 9 | 7,798 | 3,934 | source frequency | 41,312 | 3,083 | [-1,+1] |
| 10 | 12,341 | 6,216 | source frequency | 122,054 | 9,346 | [-1,+1] |
| 11 | 18,620 | 9,366 | original row-major | >300,000; PARTIAL after 8,809 orbits | 16,819 | NOT FINISHED |
| **11** | **18,620** | **9,366** | **source frequency** | **268,341** | **16,511** | **[-1,+1]** |

The eleventh-ply source-frequency run FINISHED within the **same** 60,000-node, 300,000-operation, 10,000 canonical support and 15-second limits. It did NOT determine an exact WDL value. Depth12 would require **13,524** mirror-orbit supports (26,908 ordinary), exceeding the existing 10k limit. We did not attempt it.

The source-frequency result and the failed column-major/row-major attempts are all retained, without discarding negative evidence.

Evidence: REFLECTED_INTERVAL_VARIABLE_ORDER_RESULTS_0_1.json, implementation reflected-bounded-interval-variable-order.mjs, plan REFLECTED_INTERVAL_VARIABLE_ORDER_PLAN_0_1.md.

## 7. Research interpretation and next target

**Achieved:** A sound bounded-depth source-q interval Bellman algebra with precise UNKNOWN semantics, exact terminal guards and complete action retention; owner-source anchoring and BDD lifetime management; legal full-game WDL convergence when intervals close; guarded horizontal-reflection support quotient and source-only static ordering. Source candidates do NOT traverse colored game-tree continuations or use search-discovered winning policies, though their support-DAG operator explicitly retains alternating strategic AND/OR fanout.

**Not achieved:** a polynomial-time arbitrary-depth Connect Four solver; general computational branch elimination; exact unrestricted WDL or optimal move-7/move-8 masks after 44444; or global minimality. The established original recursive/branching algorithmic core remains complete by the user's definition.

**Next mathematical seam:** an exact quotient or factored composition of **adaptive action-labelled response-cover families beyond horizontal reflection**, reducing the present 13,524-orbit depth12 source cone below the existing 10,000-support ceiling without deleting quantifier scope or first-win/capacity guards. Alternatively derive a source-level multi-ply predecessor operator that bypasses constructing every intermediate support orbit while retaining exact upper/lower Bellman values. Freeze that operator before consulting W/D/L examples, report ALL intermediate computation costs, and use the current BDD/q/physical controls strictly as independent falsifiers. Do not deepen forward policy search, inflate the fixed caps, or claim that 11 plies means a full-game outcome.

All new experimental executions were in isolated JavaScript V8 against exact committed source with minimal Node import shims. Maintained Node26 qualification and independent external reproduction remain separate; no game-theory authority promotion, production adoption or merge was performed.
