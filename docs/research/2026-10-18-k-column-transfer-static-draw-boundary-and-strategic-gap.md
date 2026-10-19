# Exact width-column transfer of all safe colorings: nested parity, K-1 incidence boundary, and the missing strategy law

**Date:** 2026-10-18 (Pacific). **Canonical owner:** research/semantic-quotient. **Owner-directed research:** nested width/height/K parity and non-strategic dimension-to-WDL. **Epistemic status:** source mathematical deduction and predeclared falsification plan, not a universal Connect-K outcome theorem and not promoted IsoGraph 1.2 authority. Preserve any counterexamples. No chronological first-win-distance calculation is proposed.

## 1. Correct mathematical split: geometry has bounded width interface; strategy remains unproved

Fix integers W,H,K with W,H>=1, K>=2, original orthogonal gravity and alternating no-pass ownership. Take an entire **hypothetical full-board binary coloring** C=(s_0,...,s_{W-1}), with one H-bit column word s_c and bit1=P0. Distinguish:

- **terminal-free coloring:** every original geometric horizontal, vertical and both diagonal length-K window contains at least one stone of EACH owner (so no completed monochromatic K line exists in the final coloring).
- **reachable full-board DRAW:** some *actual first-win-stopped legal alternating gravity game* reaches a filled board with no earlier win. Such a DRAW produces a terminal-free coloring with the exact P0/P1 stone quota. The reverse implication is NOT known and is generally false without gravity/alternation feasibility.

Let A_{W,H,K} be the set of terminal-free **static** full-board colorings. Its study is legitimate source geometry/algebra, but NOT strategic game search.

## 2. Exact local K-1-column transfer

An original horizontal or diagonal length-K window touches precisely K consecutive columns (vertical windows touch one column). Thus, when appending the (c+1)-th fully assigned column word s_c, the ONLY newly decidable nonvertical windows have rightmost column c and depend on

    (s_{c-K+1},...,s_{c-1},s_c).

Each vertical window newly decidable depends only on s_c. No old winning line changes its color when another column is appended.

Define V_{H,K}(s) as the Boolean predicate that s contains no K consecutive equal bits (vacuously true when H<K). Define

    Cross_{H,K}(s_0,...,s_{K-1}) = TRUE

iff there is NO monochromatic K-line of any of the following forms across these K column words:

    horizontal:  s_i[r] for i=0..K-1, any 0<=r<H;
    rising:      s_i[r+i] for i=0..K-1, any 0<=r<=H-K;
    falling:     s_i[r+K-1-i] for i=0..K-1, any 0<=r<=H-K.

The two diagonal directions intersect the same physical column bits s_i; the predicate does not create independent diagonal copies.

The state σ at a width cut retains exactly the last min(K-1,c) words. To append s:
1. require V_{H,K}(s);
2. if there are already K-1 prior words, require Cross_{H,K}(σ,s);
3. retain the last K-1 words of (σ,s).

**Theorem STATIC-K-COLUMN-TRANSFER (deductive):** For every W,H,K, a full binary coloring C has no original monochromatic winning K-window iff EVERY one of its W successive column appends satisfies those local predicates. Proof: every original vertical K line is detected precisely when its sole column arrives; every horizontal or diagonal K line has exactly one rightmost column and is examined exactly when that column arrives. Conversely every rejection is one actual original K line. Induction on width completes equivalence.

The state space has at most 2^{H(K-1)} states (more precisely, distinct suffix sequences up to K-1 column words). For fixed H,K, the static coloring-language is regular in width. This does NOT imply that ordinary gravity Connect-K perfect-play WDL has a finite-state column classifier of that size. There is still a globally shared alternating move clock and opponent-adaptive selection among columns.

## 3. Nested height/width parity and exact draw-exclusion potential

The full-board quota required by a genuine DRAW is

    B0 = ceil(W*H/2),   B1 = floor(W*H/2).

Let A_{W,H,K}(z) = sum_{C terminal-free} z^{number of P0 cells in C}, with nonnegative integer coefficients. Each static transfer appending s multiplies its path weight by z^{popcount(s)}; addition over suffix states joins alternative STATIC COLORINGS (not legal strategic future games).

Define the **SOURCE STATIC BALANCED-DRAW FEASIBILITY PREDICATE**

    P_bal(W,H,K) = [ coefficient of z^{ceil(WH/2)} in A_{W,H,K}(z) is positive ].

**Theorem STATIC-DRAW-EXCLUSION (guarded exact):**

    P_bal(W,H,K) = FALSE
       => no legal first-win-stopped full-board DRAW is possible
       => V_empty(W,H,K) belongs to {P0_WIN,P1_WIN}, outcome SIGN still UNKNOWN.

This is a necessary condition for draw, not an exact value theorem. P_bal TRUE is inconclusive. No first-win-time computation or strategically alternative future-game valuation enters the source operator.

For fixed H and K, exact Boolean coefficient support can be calculated with one integer bitset per suffix state, whose bit n means some static coloring with exactly n P0 cells exists. If bitset B is at a state, appending s updates next bitset by OR(B << popcount(s)). This avoids constructing the exponential list of colorings and evaluates **static color-count reachability only**. Complexity O(W * 2^{HK} * ceil(WH/word_bits)) in an elementary bound; memory O(2^{H(K-1)} * ceil(WH/word_bits)) for fixed H,K. Do not describe these state bits as a strategy graph.

For odd H, adding ONE column changes WH parity and the floor/ceiling allocation; adding TWO columns preserves the parity of WH. When H is even, WH is always even independent of W. This yields an exact nested width/height *quota phase* separate from local seam parity and from strategic outcome.

**Polynomial recurrence corollary (fixed H,K only):** The weighted transfer matrix M_{H,K}(z) has finite dimension <= 2^{H(K-1)} (after finite-prefix handling), so the STATIC polynomials A_{W,H,K}(z) obey some constant-coefficient-in-W linear recurrence over the polynomial ring Z[z] via Cayley–Hamilton. Existence of this recurrence is an exact *static-coloring* fact; it does not establish eventual periodic perfect-play WDL, or even small recurrence coefficients.

## 4. Specific falsifiers and controls before any promotion

1. Freeze a pure Node ESM producer implementing V, Cross, suffix-shift and bitset counts. It must use only W,H,K; no minmax/negamax, first-win branching, oracle labels, solved-position database, full-game policies, or recursive future q.
2. Independently enumerate every static coloring for SMALL geometries (e.g. K=3 on 3x3 and 4x3; K=4 on 4x3, 4x4, 5x4) and independently detect all four original K-line types. Match the ENTIRE generating polynomial A coefficient-by-coefficient, not just one existence bit. Source optional integer coefficient-count DP allowed in small tests; larger checks may use only bitset support.
3. Run fixed H=4,K4 widths 4..12 and H=5,K4 widths 4..10, recording exact P_bal and number of source interface states and operations. Compare against the FROZEN 52 published K4 exact empty-board WDL values only AFTER source outputs have been committed.
4. The published 6x4 P1, 7x4 DRAW, 7x6 P0, 8x6 P1 are mandatory same-geometry contrast controls. If P_bal TRUE for both decisive and drawn roots, record that static transfer ALONE does not determine WDL and do not patch it by selecting an oracle label.
5. For any P_bal FALSE (if any), record a genuine new source-only no-DRAW theorem instance; combine with any independently established guarded no-win source strategy only if the proof genuinely applies to that same empty q and geometry. Otherwise root scalar WDL remains INCOMPLETE.
6. Preserve the original finite 52-table, negative tests, and any change to computational bounds. Do NOT broaden source comparison from terminal-free static colorings into allegedly complete strategic policies. Existing q_o oriented antichain/source semantics and first-win stopping remain controlling.

## 5. Search-engine applicability

A false P_bal can eliminate DRAW as a possible game outcome at an empty root, but cannot by itself produce an exact WDL node cutoff. A certified NO_FORCE_WIN_p plus static draw-exclusion yields an exact LOSS cutoff, under independently proved compatible source guards. For a practical engine, the potentially exponential factor 2^{H(K-1)} likely makes general suffix-DP too expensive; any performance proposal must measure wall time rather than only node savings. No solver modification or promotion is authorized.

**Open missing theorem:** find a compact, non-branching, STRATEGY-SUFFICIENT boundary contract for the globally alternating opponent-adaptive column game, possibly using local K-1 geometry + nested CPC phase + integral pair counts + guarded obligation-resources. The static K-1 interface derived above is a proper necessary substrate, not yet that strategy contract. The primary Level 1 universal q problem and empty-board V(W,H,K) remain OPEN.
