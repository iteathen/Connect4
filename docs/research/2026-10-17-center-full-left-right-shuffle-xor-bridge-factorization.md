# Exact split-word shuffle and Boolean bridge coupling across the filled center column

**Date:** 2026-10-17 Pacific. **Research owner:** research/semantic-quotient. **Owner's objective:** unfold genuine W=7,H=6,K=4 board geometry into a linear computation without changing the game, preserving row and filled-column phase shifts. **Status:** mathematically derived SOURCE-ONLY EXACT DECOMPOSITION, FROZEN before independent actual 7×6 controls. No IsoGraph promotion, no claim of unrestricted V/M* or new general zero-strategic-fanout solver. Retain W,H,K symbolically; current proof/test specifically actual center column c0=(W-1)/2=3 zero-based, so odd W and a FULL center are explicit guards for this two-region split.

## 1. Phase factorization is a shuffle of two linear words

Fix a legal first-win-stopped q=(h,R0,R1) with h_center=H and **no other middle columns** between L={0,1,2} and R={4,5,6} on the standard 7×6 board. From q, the allowed future word alphabet is partitioned into left symbols L and right symbols R; there are NO future center-column moves.

For any gravity-legal hypothetical future word w, let w_L be the subsequence of left letters, and w_R the subsequence of right letters. Original global word w is one shuffle/interleaving of these two internally ordered words. For each future event e in L:

    j_L(e) = 1-based relative rank of e among ALL left moves in w;
    b_R(e) = number of right moves occurring STRICTLY before e;
    t(e)=j_L(e)+b_R(e).

For e in R use j_R(e), b_L(e) analogously. The event owner phase is EXACT:

    χ(e) = (n+j_region(e)-1) mod2 XOR (b_opposite(e) mod2).

This is the **precise row/column phase-shift interaction**: an extra move on the right toggles the owner phase of subsequent left events, and vice versa. The two regional words may not be treated as independent or awarded local side-to-move bits. Both derive their actual player owners from the SINGLE shared global turn clock.

The phase formula follows from counting literal symbols before e, requires no game continuation valuation, and is independent of the detailed K-line winning incidence. It preserves the original append-one-legal-symbol move process exactly. A shuffle of entire fixed full suffixes is only a validation schedule, NOT a perfect-play strategy solver.

## 2. Geometric bridge incidence survives elimination of the center symbol

For each player p and each source viable original minimal residual generator G∈R_p, classify its FUTURE required cell IDs by side:
    G_L=G∩futureCells(L);
    G_R=G∩futureCells(R).

Since h_center=H, there are no future center cells in any G. Every viable G is therefore:
- LEFT-only (G_L≠empty, G_R=empty),
- RIGHT-only (G_R≠empty, G_L=empty),
- BRIDGE (G_L≠empty and G_R≠empty).

For the specific first-win-stopped legal history 444444, the qualified q core has |R0|=42, |R1|=42, and **12 bridges per player**. The bridges are real original-line residual requirements that pass through a filled center cell of the appropriate owner. Without those bridge factors the source game would gain spurious wins/draws and change its ordinary value.

For a supplied full valid hypothetical future word w, define region occurrence conjunctions:

    A_{p,G,L}(w)=PRODUCT_{e∈G_L}(1 XOR χ(e) XOR p),
    A_{p,G,R}(w)=PRODUCT_{e∈G_R}(1 XOR χ(e) XOR p).

Then the source completion predicate is EXACTLY

    C_{p,G}(w)=A_{p,G,L}(w) * A_{p,G,R}(w).

For LEFT-only or RIGHT-only generators, the empty side's conjunction is one; for BRIDGE, both factors are nonconstant. Thus the static source win-potential OR over generators is a sum-of-products over
    F_p(w) = OR_{G∈R_p} [A_{p,G,L}(w) AND A_{p,G,R}(w)].

The FIRST winning relative rank is **not** simply the OR of final completions; for each completed generator it is max_{e∈G} t(e), and actual game terminates at the minimum such rank across both players. This timing, and exact shared global turn phase, remain prerequisites for the source theorem.

This is an exact **Boolean-semiring bilinear coupling** between the two regional word predicates, rather than a GF(2)-linear separable left-plus-right game. It does not assert low matrix rank; Boolean OR/AND is not XOR and can be nonlinear.

## 3. Boundary transition at the historic sixth center move

Immediately before filled-center q, at canonical history 44444, the center has ONE remaining future event. The future word alphabet still has center c4 plus all left/right columns; κ outside-column phase is [1,1,1,0,1,1,1]. If move6 is again center, then its symbol becomes exhausted and no longer occurs in future words, κ becomes all zeros, and 24 bridge generators remain. Other first moves leave center still available, and generally change the source residual families by contraction/blocker deletion.

This identifies TWO distinct mechanisms at the user's boundary:
1. a **clock and release-boundary change**: center symbol removed and its future interleaving availability disappears; every noncenter κ flips at the one placement, no extra ad hoc clock;
2. **nonlocal geometric persistence**: even when the future-event center symbol is gone, residual K-line requirements retain left-right bonds through the historical center stones.

No split into two solved 3-column games or simplified XOR sum follows, because local choices remain adaptively interleaved and the 24 bridge generators link both regions.

## 4. Frozen independent true-7×6 controls

1. From original physical legal history 444444 reconstruct h, exact R0/R1 antichains and the 69 original K-win windows independently.
2. Source classify EVERY surviving R_p requirement as left-only, right-only or BRIDGE; assert all source required future cells avoid completed center and that each bridge corresponds to an original K-window intersecting both left/right.
3. For deterministic sampled hypothetical COMPLETE 36-event gravity-legal words after 444444, partition them into w_L and w_R. Independently compute local j_region and opposite side prefix counts b; verify χ(e) equals actual global turn parity for every future event, and every residual G's exact per-region Boolean AND product equals direct whole-G owner conjunction.
4. Recover exact earliest first-win time/winner by the minimum rank of the first completed residual source bridge/left-only/right-only generator and compare a **separate physical 7×6 array-grid first-win observer**. First-win stops actual play; hypothetical post-terminal symbols are validation bookkeeping.
5. Include explicit source counts and representative bridges, record whether conditional geometry creates different outcomes for two distinct interleavings with the same projected regional words w_L and w_R. A witness would establish nontrivial coupling via opposite-side parity/order even holding both regional internal orders fixed. If not found, preserve as sample-negative, not universal equality claim.
6. All references and controls on real 7×6 Connect4, no small-board geometry. Source theorem frozen before test, and no minimax/recursive strategic evaluation from producer. If a claim requires evaluating two inequivalent strategic future words separately to determine root (V,M*), it is INCOMPLETE.

**Next mathematical challenge:** Discover if the exact 24-bridge predicate family and binary interleaving phase admit a guarded source **interface closure** deciding both COMPLETE action zero-locus sets simultaneously without separately evaluating inequivalent future games. Merely computing one representative word, a transfer-matrix over all interleavings, a tensor contraction or minmax over the two subwords would violate the strict owner's zero-branch intent if it hides strategic alternatives. Standard 44444 unrestricted (V,M*) remains UNKNOWN.
