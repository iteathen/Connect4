# Frozen source-only full-future simulation candidate: two-ply ownership-swap diamonds

**Date:** 2026-10-17 Pacific. **Before experiment HEAD:** `d3d6e6c7eda45b0f644f981824020f5fab802fc2`. **Owner:** `research/semantic-quotient`. **Status:** PLAN, not proof/evidence yet.

## Mathematical construction (before solved values)

Fix a legal, nonterminal original residual source q=(h,R0,R1) on a **P1-to-move** turn, with two distinct currently legal columns b,c and cells x_b=(b,h_b), x_c=(c,h_c). Consider two legal, first-win-stopped two-move histories:

    H_bc = P1 plays b, P0 plays c;
    H_cb = P1 plays c, P0 plays b.

Because b!=c, the landing cells x_b,x_c are the SAME original future cells under both orders, and each history yields exactly the SAME resulting support h'=h+e_b+e_c, and P1 to move again. The player-owner assignments differ. Require both histories nonterminal through each event (or handle terminal-value comparisons separately). If P1 wins on first placement, or P0 wins on second, or nonwinning second move draws, EXCLUDE from this nonterminal simulation test with explicit guard status.

Using only ORIGINAL SOURCE R0,R1 and exact owner-true/owner-false cofactors, the final antichains are

    R0_bc = Min({r \ {x_c} : r in R0 and x_b notin r})
    R1_bc = Min({r \ {x_b} : r in R1 and x_c notin r})
    R0_cb = Min({r \ {x_b} : r in R0 and x_c notin r})
    R1_cb = Min({r \ {x_c} : r in R1 and x_b notin r}).

For normalized residual antichains A,B on the SAME future support, their monotone upsets satisfy
    U_A subseteq U_B  iff  (forall a in A exists b in B: b subseteq a).
No game-state or future path enumeration is needed to check this finite **source generator implication**.

**Simulation theorem candidate:** if
    U_0(q_bc) subseteq U_0(q_cb)   AND
    U_1(q_cb) subseteq U_1(q_bc),
then `V(q_bc) <= V(q_cb)` for exact unrestricted P0-relative ordinary WDL. This is the existing same-support P0-favorable monotonicity order and must be *reproved/checked* under all first-win/terminal/legal cofactor guards for the chosen class. If both directions hold, the resulting q are strategically equal (and future WDL-equal) regardless of what their actual value is.

The producer may read source q and scan W(W-1)/2 column pairs and normalized generator containment, with source O(W * |R|^2) work; it MUST NOT build either successor q, enumerate game continuations, look up solved labels or infer root opponent-move equivalence just from one pair of second responses.

## Frozen controls and limits

1. Generic antichain upset-containment/normalization algebra truth-table controls, including empty pools, superset generators, terminal zero masks, and false swapped-owner cofactor mutations.
2. Independent full first-win physical/q reference for all legal P1 source states on **4x3-c3** (2208) with legal two-ply diamonds, and rank-stratified 4x4-c4 controls (bounded up to 10k P1 sources). For each certified relation, construct the two child q ONLY on the VALIDATOR side, check exact residual equality to source formula and compare qualified recursive exact WDL. Record false-positive dominance and equality, proof counts, skipped terminal guards, distinct nonmirror equal pairs, source operation cost.
3. Standard 7x6 canonical `44444` P1 move6/P0 move7 candidate, including full-column branch b=4 and wing c, all 21 unordered distinct legal column pairs, source-only inference. The proof certificate may be vacuous/incomplete; do not fill in false WDL.
4. Strict per source operator: 60,000 nodes, 300,000 counted generator subset/bitset operations, 10,000 supports, 15 seconds. Count *actual comparisons* and do not alter resources.
5. **CRITICAL**: the theorem compares TWO conditioned two-ply continuation values `V(q_bc)` and `V(q_cb)`, not the unrestricted value of P1 first action b vs first action c. To prune a complete first-action branch, one must additionally prove a matching relation covering ALL P0 replies of the relevant branch under the correct alternation. Weak dominance alone cannot remove tied optimal P1 literal labels. Do not claim generalized branching elimination from one diamond.

A positive output is a source-only **full-future branch comparison** certified without exploring its continuations, even if it does not close the full root move set. A negative result or only symmetry comparisons should be reported honestly. No new authority or merge.
