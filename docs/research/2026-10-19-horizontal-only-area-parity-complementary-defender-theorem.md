# Exact area-parity outcome SIGN bound for every horizontal-only finite gravity Connect-K

**Date:** 2026-10-19 Pacific. **Owner research:** Josh Oshiro, nested width/height/connection-length parity, non-search exact dimension WDL. **Research owner:** research/semantic-quotient. **Status:** new guarded deductive P0 response theorem + composition with frozen K-general P1 even-area theorem, written and source frozen BEFORE independent physical adversarial validation; NOT qualified IsoGraph gameplay authority and NOT total WDL sign for arbitrary boards.

## 1. General theorem and limits

For **every positive W,H, K>=3** with H<K, ALL possible original K-winning lines are horizontal (or none when W<K). Define P0-relative perfect-play empty-board scalar V_empty(W,H,K) in {-1,0,+1}.

**HORIZONTAL-ONLY AREA-PARITY BOUND THEOREM:**

    WH EVEN  =>  V_empty(W,H,K) <= 0.
    WH ODD   =>  V_empty(W,H,K) >= 0.

In either case there is an explicit **single, online, opponent-universal strategy yielding a filled-board DRAW** for the designated parity-favored defender:
- when WH even, P1 (second mover) follows the previously frozen K>=3 H<K, even-area horizontal pair response from docs/research/2026-10-18-general-k-horizontal-only-even-area-second-player-draw-policy.md;
- when WH odd, necessarily W and H both odd, P0 (first mover) uses the NEW response below.

This theorem does NOT imply V=0: WH even might favor a different P1 winning strategy (V=-1), while WH odd might favor a different P0 winning strategy (V=+1). No source game-state search, first-win timing optimization, compiled strategy graph or oracle label is used.

If W<K there are no horizontal lines either, and the prior independent two-player vertical-pair theorem gives exact DRAW; that stronger theorem is retained. If H=1, independently established dual horizontal response proves exact DRAW for K>=3; this general theorem overlaps but does not supersede it. K1/K2 are intentionally excluded.

## 2. Constructive P0 strategy for WH odd (new)

Assume W and H are BOTH odd, H<K and K>=3.

- Let E=W-1 be the even prefix of columns (zero-based 0,1,...,E-1).
- Fix disjoint adjacent **paired columns** (0,1),(2,3),...,(E-2,E-1).
- Leave the RIGHTMOST column u=W-1 unpaired.
- P0's FIRST original move is in the bottom cell of u, row0.

After each observed P1 move, P0 responds:
1. If P1 just occupied a paired column c at height r, P0 drops into the adjacent mate column (c XOR 1) at the SAME row r. Both paired columns had equal heights at the start of P1's turn, so the mate is physically gravity-playable. Their heights return equal at the next P1 turn.
2. If P1 just occupied the unpaired column u at height r, P0 drops into the **same** column u immediately above, row r+1. The unpaired height was always odd before P1 entered it: P0 initially made height 1 and every P1/P0 pair raises that height by 2. Thus r is odd. Since H is odd, r<=H-2 and r+1 is always a legal physical cell. Height returns odd at the next P1 turn.

Both contracts are compatible: paired-column responses do NOT affect the unmatched column, and unmatched-column responses do NOT alter paired equal-height invariants. As long as there is a P1 legal move, this deterministic policy produces a legal P0 reply, except when the game is already terminal; WH is odd, so the filled board has P0 as last player, and P1 cannot fill it on their turn.

## 3. Why the policy guarantees no winning K-line

No vertical or diagonal K-line can exist because H<K. For horizontal length K>=3, every contiguous K-column window includes a COMPLETE fixed adjacent paired-column block from the even prefix. Proof: every three consecutive columns contain some even-odd neighboring pair; a window ending at the odd-width unmatched last column still contains the preceding even-prefix pair. The policy ensures **every attained same-row paired block contains P0 in one cell and P1 in the other**; a partial current pair contains P1 and an unoccupied mate, never a monochromatic fully occupied pair.

Consequently neither player can form a horizontal K-line in any actual first-win-stopped play consistent with P0's response. Eventually every cell is filled and the game is DRAW. This implies V_empty>=0 because P0 has at least this guaranteed DRAW against every P1 action. It does NOT exclude the possibility that a different P0 strategy forces a win.

This is a two-dimensional **product** of parity resources: odd W supplies exactly one unmatched column for P0 to preoccupy, and odd H guarantees that the unmatched column has a legal upper mate after EVERY P1 use. The result is a genuine signed perfect-play bound, not just a static color pattern.

## 4. Comparison with even-area P1 counterpart

When WH is even, P1 had the frozen exact response:
- in a paired column, P1 mirrors P0 at the same row;
- if W odd, H must be even, so the unmatched last column is initially empty and P1 responds vertically above every P0 claim in that column, with upper mate always available.
This produces a full-board DRAW under one P1 policy against arbitrary P0 moves, giving V<=0.

The two cases cover EVERY finite H<K, K>=3 position because WH is either odd or even. Which side starts and finishes is determined by area parity. The policy is not an independently proved opponent-winning strategy; labels P0 WIN / P1 WIN remain UNKNOWN outside separate exact guarded subfamilies.

## 5. Frozen independent testing, no strategic source evaluations

1. Freeze source P0 first move, responsive same-row pair/mate policy, exact guards and no-branch implementation before running any physical oracle.
2. Freeze an independent ORIGINAL colored-grid physical simulator with all four K-line directions and first-win stopping. For fixed odd W,H, K>=3,H<K, check ALL possible P1 moves against this ONE deterministic P0 policy on bounded boards (W<=9, H<=7, board area <=23), including W<K and H=1 controls. Preserve every illegal gravity reply, premature P1/P0 K win, and resource exhaustion as FAIL/INCOMPLETE.
3. Combine with existing P1 even-area physical evidence, but do not count those old checked roots as new P0 findings. Cross-check overlapping H=1/W<K exact DRAW theorems. The 52 published K4 table with H>=4 is OUTSIDE H<K except small H<=3 already covered by prior thin-board proof; no newly solved standard 7x6 root implied.
4. New higher-dimension samples allowed as falsifiers only. Unknown overall WDL stays UNKNOWN except independently proven subcases.

## 6. Engine integration (secondary)

For generalized gravity Connect-K, H<K, K>=3:
- WH even implies a sound P0-relative upper bound 0;
- WH odd implies a sound P0-relative lower bound 0.
This is a constant-time source guard and compact dynamic response certificate, potentially useful as a safe interval bound in a search engine; by itself neither bound supplies an exact value except where combined with a separate theorem. Validate strict source guards and independent first-win behavior before any engine integration. No solver branch code changes authorized.

**Next missing dimension-WDL rule:** For H>=K, recover a similar signed owner-phase response dual using a compatibility interface that also blocks vertical and diagonal K-lines. Generalized Allis P1 even-H central-pair response exists for C(W,K)>=2; P0-side regular K4 W4/5 no-loss remains OPEN, and the naive P0 vertical-follower has independent P1 diagonal counterexamples. 
