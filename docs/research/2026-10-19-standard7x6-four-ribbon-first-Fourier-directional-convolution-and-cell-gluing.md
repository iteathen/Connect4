# Standard 7×6 K4: UNFOLD first, Fourier transform second — four orientation ribbons, exact cell gluing and open-boundary spectral corrections

**Date:** 2026-10-19. **Owner new idea:** Unfold the TRUE standard Connect4 board's directional winning-line geometry *before* attempting Shor/QFT/Fourier algebra, particularly to avoid flattening diagonal interactions into rectangular coordinates. **Canonical owner:** research/semantic-quotient. **New active game test scope remains STRICT W7 H6 K4 only.** This develops the previously source-proved four-ribbon geometry from \`docs/research/2026-10-17-exact-four-ribbon-geometry-unfolding-and-phase-code-candidate.md\`; DO NOT claim to invent that earlier unfolding. All original gravity, alternation, shared cell identity, and first-win stopping remain controlling. **Status:** new exact spectral geometry theorem, frozen before independent original7x6 physical tests. No newly solved WDL, source best move, quantum speedup or official gameplay-authority change.

## 1. Directional lift, NOT four independent games

The original 42 physical cells x=(c,r) each have FOUR appearances on exactly one ordered strand in EACH orientation: horizontal 6 row-strands of length7, vertical 7 column-strands of length6, rising 12 varying-length diagonal strands, falling 12 varying-length strands: **37 strands, 168 appearances**. Each of the two diagonal directions has lengths \`1,2,3,4,5,6,6,5,4,3,2,1\`. The count of original contiguous length-4 winning windows is EXACTLY 24 H +21 V +12 rising +12 falling = **69**.

Among 37 strands, 25 have length >=4 and can contain a WINNING interval: 6+7+6+6. These 25 contain 144 physical cell appearances (42 horizontal+42 vertical+30 each diagonal). The 12 short diagonal strands contain 24 appearances, irrelevant to K4-window detection but still part of the FULL 168-appearance alias gluing model. A 4-point convolution on a short diagonal must NEVER invent a wrap-around K4 line.

Define the EXACT duplicate/alias matrix \`M∈{0,1}^{168×42}\`, with one 1 in every appearance row in the column of its literal underlying physical cell. Exactly FOUR appearances share each cell ID, so in integer arithmetic

    M^T M = 4 I_42,
    rank(M)=42.

Consequently \`M/2\` is an isometric embedding of the 42-dimensional PHYSICAL cell-function space into 168 directional appearances; the orthogonal projector onto consistent strands is

    P_phys = M (M^T M)^−1 M^T = (1/4) M M^T.

\`P_phys\` has rank42 and nullity126. This is a SOURCE geometric fact: **126 physical alias constraints remain**. Four independent ribbon transforms would have 168 apparent degrees of freedom and would be an invalid different game.

## 2. A FOUR-RIBBON-FIRST exact Fourier operator, with physical gluing retained

For each original physical strand σ of length \`ℓ_\sigma\`, let \`F_ℓ\` be the unitary ℓ-point discrete Fourier transform of its ordered actual cells. Define the block diagonal transform on ALL 37 strands

    F_rib = direct_sum_(σ=1..37) F_(ℓσ).

It is exactly unitary and makes no assumption about hypothetical cyclic PLAY. The Fourier-lift of a real physical owner/occupancy field v∈C^42 is

    v_hat=F_rib M v ∈ C^168.

The 42-dimensional subspace of valid Fourier ribbon tuples has orthogonal projector

    P_hat_phys=F_rib P_phys F_rib†
              =(1/4) (F_rib M)(F_rib M)†.

It is still rank42, nullity126, and the exact reconstruction is

    v=(1/4) M^T F_rib† v_hat.

A physical stone placed at a single original legal x changes ONE physical-cell indicator and FOUR linked Fourier ribbon waveforms simultaneously, with per-strand transformed impulse \`(F_ℓ e_t)_k=exp(2π i k t/ℓ)/sqrt(ℓ)\`. No diagonal alias can move independently. A separate original height vector \`h=(h0...h6)\` and source R0/R1 retain terminal, turn and gravity meaning.

## 3. The 4-cell window operator becomes Fourier-diagonal bulk + EXACT rank-3 boundary

For a strand of length ℓ>=4 and a supplied scalar physical strand field \`v_0,...,v_(ℓ−1)\`, valid original K4 consecutive WINNING window sums are

    (A_ℓ v)_t= v_t+v_(t+1)+v_(t+2)+v_(t+3),
    t=0..ℓ−4.

There are exactly ℓ−3 valid starts. Define the (ARTIFICIAL) circular 4-tap sum \`(C_ℓ v)_t = sum_(j=0..3) v_((t+j) mod ℓ)\`, for t=0..ℓ−1. Let \`Q_ℓ\` be the diagonal output mask with ones at t=0..ℓ−4 and zeros at LAST THREE slots. Then the **actual physical zero-wrapped valid-window linear operator** (output retained in ℓ slots) is

    W_ℓ = Q_ℓ C_ℓ = C_ℓ − B_ℓ,
    B_ℓ=(I−Q_ℓ) C_ℓ,
    rank(B_ℓ) ≤ 3.

The 4-tap C_ℓ is CIRCULANT and diagonalized by F_ℓ with multiplier

    λ_k = sum_(j=0..3) exp(−2πi k j/ℓ).

Thus **the actual finite Connect4 K4-window sums** equal Fourier-diagonal circular bulk, corrected by an **EXACT rank-at-most-three finite-strand boundary**; the wrap terms are CANCELLED, never introduced as legal winning lines.

At ℓ=4, the circular four-sum C_4 is rank1, so B_4 is rank1. At ℓ=5,6,7, B_ℓ is rank3 (source analytical rank prediction, independently falsifiable). With 25 ACTIVE original ribbons, 4 have ℓ=4, so the direct-sum correction has rank

    4×1 + 21×3 = 67

on the full 144 active appearances. It is an **operator rank statistic**, not a game-state rank or reduction of the 69 possible winner requirements. Full valid K4-window vector has exactly **69** scalar entries. Extra strand lengths 1..3 contribute ZERO possible K4 windows.

**Caution:** a physical K4 win is a NONLINEAR predicate. For one player's actual occupied-cell indicator v^p∈{0,1}^42, an original K4 window is complete when its four-site sum is exactly4. If a line's physical cells are unoccupied or opponent-owned, it is not a p win. Algebraic convolution and DFT alone do not account for which player can force that sum under alternating gravity, nor first-win priority. The source q=(h,R0,R1) antichains are needed.

## 4. Alternative boundary-faithful spectral basis: OPEN finite paths

Shor's QFT is naturally adapted to cyclic convolution; actual strands are FINITE PATHS rather than cycles. We can alternatively diagonalize each original strand's symmetric PATH adjacency using its sine eigenbasis. For a path of length ℓ, open-boundary adjacency \`A_path\` has exact eigenvectors

    u_k(t)=sqrt(2/(ℓ+1))*sin(pi*k*(t+1)/(ℓ+1)),
    eigenvalue µ_k=2*cos(pi*k/(ℓ+1)),
    k=1,...,ℓ, t=0,...,ℓ−1.

This needs ZERO cyclic/wrap correction to diagonalize symmetric strand adjacency, though it does NOT diagonalize forward gravity shift or nonlinear four-in-row simultaneously. Compare QFT/circulant-plus-3-boundary vs the path-sine basis on EXACT SAME 37 standard-board strands. Do not change the board; per-strand varying lengths are geometric fiber coordinates of the one 7×6 game.

## 5. Fourier slice / discrete Radon analogy: use with strict finite-grid guards

Known finite Radon transform literature relates directional line sums and 1D Fourier transforms to 2D Fourier slices; some discrete constructions treat lines on PERIODIC finite tori or square-prime grids. We have a FINITE 7×6 rectangle, four finite winning directions, and LENGTH-FOUR ordered windows. We may borrow Fourier-slice intuition about directional decomposition, but a toroidal finite Radon projection, line SUM over full strand (losing order), or arbitrary periodization is NOT the original Connect4 game. Preserve all original 42 site aliases, 69 four-point windows and first-win terminal.

Sources reviewed: \`https://www.sciencedirect.com/science/article/pii/S0262885606001119\` ("Generalised finite radon transform for N×N images", Kingston et al.) and \`https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/iet-cvi.2013.0101\` (number-theoretic discrete Radon transform). Literature analogy is not source WDL authority.

## 6. Current 444444 Fourier-pair adaptive response priority (do not interrupt)

User asked to file this idea WITHOUT stopping current meaningful quantum-math work. Continue frozen existing \`docs/research/2026-10-19-true7x6-444444-conditioned-moving-Pauli-pair-gauge-and-Fourier-policy-pilot.md\` on REAL first-win-free \`444444\` (P1 fills center after canonical \`44444\`, P0 to move). This already establishes a candidate **online one-pending vertical pair** response that can maintain 18 outer split-pair eigenvalues on nonterminal branches; a *Walsh bit-influence tie-break* for selecting a new pending pair is only a HYPOTHESIS of no-P1 win.

Next work in this turn: source-freeze actual Walsh-influence P0 reply, independently simulate all original 69 K4 winning lines and adversarial P1 choices on W7 H6 K4 only, preserve first P1-winning counterexample and correct epistemic dispositions. Algebraic unfold-first insight remains separately filed. If *new* Fourier-path data identifies a structural operator advantage, assess after the policy physical pilot.

## 7. Mandatory independent falsifiers, before any claims

- Independently construct original 42 physical cells and all 37 strands; check 168 appearances, every physical cell appears exactly 4, 25 K4-active strands/144 appearances, original winning intervals exactly 69.
- Verify M^T M=4I, directional Fourier reconstruction (at least 42 independent basis impulses and several deterministic physical owner-colored original states), no alias mismatch; validate transformed projector rank42/nullity126 by independent reconstruction and trace rather than 168×168 complex dense matrix.
- For every active strand compare exact integer 4-window sums to Q_ℓ C_ℓ, check every invalid wrap start masked, verify rank(B_ℓ) and total direct-sum67. Check Fourier multipliers numerically, including lengths 4,5,6,7 and exact K4 window count69.
- Check DST/path adjacency open-boundary eigenvectors/eigenvalues and orthonormality (all 37 strands), especially diagonals ℓ<4 which must have NO K4 windows.
- For sampled/frozen actual first-win-free original W7H6K4 positions (including \`44444\`, \`444444\`), independently compare source winline cofactor/residual geometry with Fourier-unfolded K4 window results, preserving terminal stop. No game WDL labels, game-tree oracle or invented quantum speedup.
- Treat failure as negative research evidence; preserve original source, checker, test and exact counterexample. Enforce single research ownership, qualified IsoGraph1.2 unchanged and no production solver modifications.

**Outcome status:** exact algebraic representation/geometry anticipated; true game strategy sufficiency STILL OPEN. A more compact spectral WIN projector is not equivalent to a solution unless a source-proven legally adaptive response invariant and first-win guards are derived.


## 8. Independent original7x6 qualification and active policy outcome (2026-10-19)

The frozen pure original7x6 Fourier/ribbon producer and SEPARATE physical original7x6 checker completed with **ZERO mismatches**:

- 37 strands / 168 directional appearances / 42 physical cell IDs, exactly four aliases per site;
- 25 strands support K4 windows, 144 appearance sites across active strands, exactly 69 distinct original K4 winning intervals;
- four-ribbon alias lift \`M^T M=4I\`, Fourier lift projects onto rank42 subspace and leaves 126 nonphysical unconstrained appearances;
- exact finite K4 directional 4-tap convolution \`Q_\ell C_\ell\`; invalid wrap windows canceled, combined rank of the Fourier-bulk discarded-end correction **67** across the 25 active strands;
- independent checker: **854 exact integer window-convolution comparisons, 854 circular Fourier diagonal-multiplier comparisons, 1,820 open-path sine-basis orthogonality/eigenvector checks, 7,056 linked physical impulse Fourier coefficient checks, 1,764 original-site reconstruction checks**;
- maximum numerical errors: circular DFT approx 3e-15, open-path sine approx 1.9e-15, physical alias reconstruction approx 7.3e-16;
- one separate genuine strictly FIRST-WIN-STOPPED 42-ply original 7×6 cooperative DRAW independently replayed, zero original physical winning intervals.

Validated original-only packet \`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_UNFOLD_FIRST_37_RIBBONS_FOURIER_ALIAS_FRAME_BOUNDARY67_0_1.json\`; frozen source and checker also in that folder. This gives a COMPLETE EXACT spectral GEOMETRY change-of-representation, not an opponent-universal WDL theorem.

**Continued independent active work as owner requested:** earlier frozen real \`444444\` Fourier-influence P0 response was independently refuted by legitimate P1 RISING K4 at absolute ply14, original history \`44444421122333\`. A separate signed singleton-Walsh priority, frozen BEFORE independent original physical opponent checking, was ALSO refuted by genuine P1 RISING K4 at absolute ply32, original history \`44444411117113333557553553777722\`. Independent original move-by-move replayer verified BOTH whole histories are gravity-legal, each P0 move matches its respective frozen Fourier source rule, one-pending-pair invariant holds at every pre-attacker turn, and first win occurs exactly on the final P1 move. Packet \`STANDARD7X6_UNFOLD_FOURIER_TWO_P0_POLICY_FAILURES_INDEPENDENT_FIRSTWIN_REPLAY_0_1.json\`. These disprove the SPECIFIC policies as first-win prevention, not the exact unfolded spectra, not all possible Fourier/ZH strategies, and do not establish that P1 can force an outcome.

**Next mathematical hypothesis, without more static scoring:** use four-ribbon alias-glued spectral windows as the exact source representation for an ONLINE signed blocker/response obligation graph. A legal P0 resource cannot be chosen only by marginal Fourier weight: preserving a vertical split pair may **create** the specific upper/lower owner literal pattern of a P1 diagonal K4 generator. Need guard direct observed FIRST-WIN threats, respond with gravity-safe capacity, and prove source inductive closure. If no guarded defense emerges, retain \`INCOMPLETE\`; do not hide future game WDL evaluation in Fourier tensor contraction, do not generalize board geometry, and do not modify game authority/solvers.
