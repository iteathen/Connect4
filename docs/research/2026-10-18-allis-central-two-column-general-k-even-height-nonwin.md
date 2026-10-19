# General K>=4, even H, K<=W<=2K-2: exact P1 source response excludes P0 first win

**Date:** 2026-10-18 Pacific; research owner research/semantic-quotient; research direction Josh Oshiro. **Status:** new guarded symbolic generalized-source theorem, frozen before physical controls; current qualified IsoGraph gameplay 1.2 unchanged. This is an empty-board P0-NONWIN bound V<=0, NOT automatically exact DRAW or P1 WIN. No game-value search, future policy tree or distance-to-first-win calculation is required.

## Prior art and attribution

Victor Allis, *A Knowledge-Based Approach of Connect-Four* (1988), §2.2, proved by original adaptive response rules that the second player can secure at least DRAW on width W<=6, any even height H, K=4. The original source is retrievable at https://paperzz.com/doc/7286686/a-knowledge-based-approach-of-connect-four ; key discussion lines 435–467. The K4 theorem and use of outer same-column followups + two central reactive columns are **prior published Allis research**, not newly invented here.

This note derives a symbolic width-threshold and diagonal-parity argument extending the same response principle to **all K>=4** with K<=W<=2K-2. The extension is an independently testable research claim (not automatically accepted by the old K4 publication), and does not purport to solve total WDL.

## 1. Why the width bound is exactly 2K-2 for this interface

Assume K<=W<=2K-2, K>=4 and even H>=2. Every horizontal or diagonal original winning K-line spans a contiguous set of K columns, with start s between 0 and W-K. The intersection of ALL possible length-K column spans is

    I = { W-K, ..., K-1 }, with |I|=2K-W >=2.

Choose the TWO adjacent central response columns

    u=W-K, v=u+1.

Since v<=K-1, every K-column span contains BOTH u and v. All other columns are 'outer' for this particular strategy.

For every K>=4, any length-K column interval containing these two adjacent center columns also contains at least TWO outer columns with OPPOSITE column-index parity:
- remove adjacent central columns; the K-2 remaining columns form one left interval and one right interval;
- if either interval has length at least two, it contributes two adjacent outer columns of opposite parity;
- the only non-adjacent-two-outer case is K=4 with one outer at each end of the K interval; these are three columns apart, and therefore have opposite parity.
This **opposite-parity outer pair lemma** is the exact diagonal obstruction in the generalized theorem. It fails in general for K=3.

## 2. One deterministic original P1 response policy

The policy starts with all columns empty. After EACH P0 original placement, P1 makes EXACTLY ONE legal placement according to:

OUTER c not in {u,v}: reply in the SAME column c immediately above P0's stone. With H even, P0's row there is always an even zero-based row and P1's reply is the odd row above, legal. Thus outer columns remain even-height before each P0 turn, and P0 owns only even zero-based row coordinates in outer columns.

CENTER pair c in {u,v} before either has ever been touched: after P0 first takes bottom row0 in c, P1 plays bottom row0 in the OTHER center column. Now both center heights are exactly 1, with their bottom cells split.

CENTER after initiation, while both center columns still have odd heights: if P0 plays at odd zero-based row r<H-1 in either center column, P1 plays immediately above it in the SAME column at row r+1, restoring odd height. If P0 instead plays the TOP cell r=H-1 (necessarily odd since H even), filling that center column, P1 plays the current next cell in the OTHER center column (whose height is odd <H). This switches the remaining active center column to even height.

CENTER after one has filled: P0 can only enter the other center column, now at even current height r. P1 responds in the SAME column at row r+1, legal since H even, until this column fills on a P1 response. The already full center column remains filled.

Source contract invariants are checked BEFORE each P0 move; any premise failure means INCOMPLETE, never an invented response.

## 3. Why the policy always has one legal response

Outer heights are even at P0 turns and at most H-2 when a drop is legal. Same-column mate r+1 always exists.

Before a center column completes, the two initiated center heights stay odd and are at most H-1. For P0 playing at r<H-1, P1 takes r+1. When P0 occupies the last top odd row in one center, the other remains odd (hence <H even) and is available for P1's migration move. Its height becomes even. Thereafter each P0 placement in the remaining center occurs at even row r<=H-2, and P1 immediately takes row r+1. The remaining center always fills, if at all, on a P1 move. Therefore no original move by P0 ever lacks its prescribed P1 response before board completion (WH may be even/odd; if W odd and H even, WH is even).

## 4. P0 cannot make any original K line under this response

VERTICAL: every outer column alternates P0/P1 by row and has no adjacent P0 pair. In a center column, its bottom 1–2 rows may include P0, but each subsequent pair of rows induced by the response has a P1 stone; after migration the remaining center has a P1 row separating any two P0 placements. Thus no center column has more than 2 consecutive P0 stones, strictly less than K>=4.

HORIZONTAL: every length-K horizontal line intersects BOTH center columns u,v. In an even zero-based row, P0 cannot own both central cells: the first row0 is split, each higher even center row is initially P1-owned under immediate responses, and after migration any possible P0 even row in the remaining center is opposed by an already P1-owned cell at the same row in the full center. In an odd zero-based row, P0 cannot own any OUTER cell, and there are K-2>=2 outer cells in the line. Consequently P0 cannot occupy an entire horizontal K-line, regardless of the move order.

DIAGONAL: every length-K diagonal intersects u,v and includes two outer columns with opposite column-index parity (lemma §1). Along either diagonal, row parity alternates with column parity, so the two opposite-parity outer columns have OPPOSITE row parity. At least one occupies an odd zero-based row, never P0-owned under the outer response. Therefore no P0 winning diagonal can be completed.

This exhausts all original winning orientations. In any first-win-stopped real play against the source responder, P0 cannot FIRST WIN. If P1 completes a winning line earlier, P1 wins; otherwise legal play ends drawn. Therefore P1 can ensure at least DRAW and

    V_empty(W,H,K) <= 0

under exact preconditions K>=4, H even, K<=W<=2K-2. The source policy does not claim to prevent P1 itself winning, nor does it determine whether an independent P1 strategy can force a win.

## 5. Canonical K4 special case and dimension significance

For K=4, 2K-2=6. The new symbolic guard covers W=4,5,6 for every even H. This is precisely the key width threshold in Allis's published second-player no-loss theorem, whose original proof and authorship must be credited. The established K4 7x6 P0-WIN is outside that bounded center-overlap domain because the intersection of all length-4 column intervals at W=7 has only one common column. Therefore the formula reveals a structural *reason a two-center response scheme stops at width six*, not a claim that every W>=7 is P0-winning.

For K5 the guard includes width 5,6,7,8 at any even height; for K6 includes width6..10. No K5/K6 perfect-play WDL labels are inserted; the conclusion is only the P0 non-win bound.

## 6. Frozen physical validation and rejection tests

1. Freeze the source responder (only current original height vector, source center mode inferred from heights and fixed center columns) and mathematical proof BEFORE running original 69-line-style physical checker. No oracle WDL inputs.
2. Independent physically first-win-stopped original colored-grid checker generates all K-windows, enumerates as many P0 moves against the ONE deterministic P1 policy as finite budget allows for K4 W4..6, even H4/6 and K5 W5..8, H4/6, plus K6. Report any incomplete finite budget honestly. Also run large seeded adversarial FIRST-WIN-free trajectories on K4,5,6 with H even to stress release/migration.
3. Negative controls: reject W>2K-2 (e.g. 7x6 K4), H odd, K3, W<K where the different vertical-pair theorem is the correct owner. Preserve a counterexample to the response if any move reaches forbidden illegal mate or P0 K-line.
4. Compare computed source WDL upper-bound guards with the pinned 52 K4 published exact outcomes as **independent validation**: K4 W4/5/6 even-H outcomes must never be P0 WIN. Do not use table values to construct the source guard or infer outcomes for unknown cells.
5. Node26 maintained CI, third-party formal proof-assistant verification, and official IsoGraph 1.2 authority promotion are not claimed without execution.

## 7. Engine optimization applicability

Guard cost O(1) in W,H,K; the P1 defensive source policy is constant-time per opponent event with a tiny central height-mode state. An exact P0-nonwin upper bound may tighten alpha-beta/generalized-solver root interval and is meaningful for width<=2K-2, even H. This is NOT an exact node WDL cutoff; P1 forced win versus draw remains unknown. No solver changes authorized. Benchmark end-to-end solve time and independent on-board validation before production integration.
