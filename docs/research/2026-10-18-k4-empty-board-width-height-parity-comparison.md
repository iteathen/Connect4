# Original Connect-Four K=4: exhaustive published empty-board dimensional WDL comparison (5..12 widths)

**Date:** 2026-10-18; canonical owner `research/semantic-quotient`; **research evidence only**. Owner-directed analysis of board dimensions, not a new qualified theorem, not a total Level 1 q solver, not a claim that unknown cells are draws or losses.

## Source and frozen numeric authority

Use Christophe Steininger's `ChristopheSteininger/c4` original-gravity, alternating-player, first-win-stopped *perfect-play empty-board outcome* table. **Pinned original repository revision:** `fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c`; frozen README blob `274cb47fef75252c637b07982c96ad3cb2314aa9` at [pinned source](https://github.com/ChristopheSteininger/c4/blob/fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c/readme.md). Historical overlapping data in John Tromp's [Connect Four Playground](https://tromp.github.io/c4/c4.html). Raw board-value labels are **external solved-reference evidence**, not premises of a source-free structural derivation.

Machine-reconstructible source transcription and all comparisons: `research/isograph/discovery/2026-10-18-board-dimension-outcomes/SOLVED_K4_EMPTY_BOARD_WIDTH_HEIGHT_CENSUS_0_1.json`. 4≤W≤12, 4≤H≤13, K=4 only. Exactly 52 **published cells** (14 P0 WIN, 13 P1 WIN, 25 DRAW), **38 source-blank cells** in the 90-cell rectangle. Of requested widths 5–12, **42 cells known / 38 blank**. Source blank = not reported in this table; it does not prove no later/other result exists. Project theorem `min(W,H)<4 ⇒ DRAW` is separate and does not justify filling width 4 or width 5 beyond published heights. (Width 4 itself is observed DRAW at all listed heights 4–13.)

Notation: `P0` = first player wins; `P1` = second player wins; `D` = exact draw; `?` = NOT REPORTED, never guessed.

## A. Fixed WIDTH 5–12, varying HEIGHT 4–13

| Width ↓ / Height → | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | D | D | D | D | D | D | D | D | D | D |
| 6 | P1 | D | P1 | P0 | P1 | P0 | P1 | P0 | P1 | ? |
| 7 | D | D | P0 | D | P0 | D | P0 | ? | ? | ? |
| 8 | P1 | P0 | P1 | P0 | P1 | P0 | ? | ? | ? | ? |
| 9 | P1 | P0 | P1 | P0 | ? | ? | ? | ? | ? | ? |
| 10 | P1 | P0 | P0 | ? | ? | ? | ? | ? | ? | ? |
| 11 | P1 | P0 | ? | ? | ? | ? | ? | ? | ? | ? |
| 12 | P1 | ? | ? | ? | ? | ? | ? | ? | ? | ? |

## B. Fixed HEIGHT 4–13, varying WIDTH 5–12

| Height ↓ / Width → | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|
| 4 | D | P1 | D | P1 | P1 | P1 | P1 | P1 |
| 5 | D | D | D | P0 | P0 | P0 | P0 | ? |
| 6 | D | P1 | P0 | P1 | P1 | P0 | ? | ? |
| 7 | D | P0 | D | P0 | P0 | ? | ? | ? |
| 8 | D | P1 | P0 | P1 | ? | ? | ? | ? |
| 9 | D | P0 | D | P0 | ? | ? | ? | ? |
| 10 | D | P1 | P0 | ? | ? | ? | ? | ? |
| 11 | D | P0 | ? | ? | ? | ? | ? | ? |
| 12 | D | P1 | ? | ? | ? | ? | ? | ? |
| 13 | D | ? | ? | ? | ? | ? | ? | ? |

## C. Exact finite empirical comparisons (no extrapolation)

1. **Odd-row asymmetry:** of 24 published cells at odd H, **10 P0, 14 DRAW, ZERO P1**. Of 28 published cells at even H: **4 P0, 11 DRAW, 13 P1**. Narrow W=4,5 draws explain much of the draw volume; restricting to W≥6 still yields all 14 odd-H published outcomes in {P0,D}, none P1. This supports candidate `H odd ⇒ P0 at least DRAW` for K4, but NO proof exists and larger unsolved boards may falsify it.
2. **Height-two comparisons:** all available fixed-W pairs (W,H) versus (W,H+2): **32/35 same result**. The exact THREE differences are (6,5): DRAW→P0 at (6,7); (7,4): DRAW→P0 at (7,6); (10,4): P1→P0 at (10,6). After restricting to W≥6, **16/19** match; after W≥6 and starting H≥6, **10/10** match. These are finite pair counts, not an eventual period theorem.
3. **Width-two comparisons:** fixed-H (W,H) versus (W+2,H): **15/32 same**. Thus expansion across width is much less regular than the measured two-row extension, even before considering unequal information from missing cells.
4. **Gravity transpose:** among 20 comparisons where both (W,H) and (H,W) are reported (W>H), **7 equal, 13 unequal**. Examples: 8×5 P0 versus 5×8 DRAW; 6×9 P0 versus 9×6 P1; 10×6 P0 versus 6×10 P1. Bare geometric line count is symmetric but gravity event chains and CPC/support timing are not.
5. **Width-specific finite signatures:**
   - W5: all published H=4..13 DRAW.
   - W6: H4 P1, H5 DRAW, H6/8/10/12 P1, H7/9/11 P0.
   - W7: H4/5 DRAW, H6/8/10 P0, H7/9 DRAW.
   - W8: H4/6/8 P1, H5/7/9 P0.
   - W9: H4/6 P1, H5/7 P0.
   - W10: H4 P1, H5 P0, H6 P0 (fails unconditional H+2 equality).
   - W11: H4 P1, H5 P0 only.
   - W12: H4 P1 only.
6. **Fixed-height frontiers:** H4 has P1 for W6 and W8..12, but W7 is a DRAW. H5 is DRAW at W5..7 and P0 at W8..11. H6 is D,P1,P0,P1,P1,P0 for W5..10. H7 is D,P0,D,P0,P0 for W5..9. The response is not a monotone function of width and neither width parity nor area determines the winner.
7. **Sampling frontier is not representative:** the external table covers all W+H≤16 among regular 4≤W,H in the reported range, plus a handful beyond. Later upper-right cells are systematically blank. Hence observations about odd heights and eventual period two are provisional; 10/10 high-H agreements do not estimate truth on arbitrary sizes.

## D. Strong falsifiable research propositions, NOT theorem authority

**D-H-ODD-NOP1:** For standard K4, every finite empty board of odd H is P0 WIN or DRAW. Empirically 24/24 reported; a single independently solved odd-H P1 value disproves it. An attempted proof must construct a P0 no-loss strategy respecting gravity/support, adaptive P1 replies and first-win termination, not just a static colored full-board paving.

**D-EVENTUAL-H2:** For each fixed (W,K), there is a source-defined H0(W,K) such that V(W,H+2,K)=V(W,H,K) for all H≥H0. The table provides no uniform bound or finite-state closure theorem; it explicitly refutes H0≤4 for W7/W10 and H0≤5 for W6. Need a realizability- and first-win-preserving **height-extension strategy congruence**, rather than copying outcome labels.

**D-WIDTH-NONPERIODIC-CONTROL:** Global periodic W→W+2 at fixed H is already false within reported K4 values. Any width-extension theorem must have narrower, explicit applicability guards and preserve boundary interaction. Graph incidence equivalence alone insufficient.

**D-K-DEPENDENCE:** No K≠4 data is in this external table. Do not generalize parity propositions across winning length. K may change the pairing interface, minimal terminal cycles, support and threat structure.

## E. Falsification priorities and search-free application

Promising external UNKNOWN cases within the same matrix: **9×8** (transpose of known 8×9 P0), **10×7** (odd-H conjecture), **11×6** (even-H parity extension), **12×5** (wide odd-H conjecture); later **7×11**, **6×13**, **8×10**, **9×9**. Do not report conjectural predicted outcomes as actual outcomes.

The next structural theorem should start from geometry and CPC support phase, then show whether two extra rows supply a neutral-pair extension of *adaptive first-win/defender response contracts*, including top-boundary resource debt. A proof of WDL-preserving extension is required before promoting any periodic classifier. The empirical outcome table is validation-only.

**Search-engine applicability:** this census supplies NO independently certified runtime WDL theorem for unknown sizes; it is not a safe node cutoff or an opening-book substitute in a solved-knowledge-independent benchmark. Future exact guarded dimension theorem could give an empty-root cutoff, but only after proof and independent original-grid comparison. Current disposition: **deferred / mathematical discovery use only**.

**Research authority:** qualified IsoGraph 1.2 unchanged. No new C4-R claim ID, solver modifications, or merges. WDL dimension-classification law remains **OPEN**.
