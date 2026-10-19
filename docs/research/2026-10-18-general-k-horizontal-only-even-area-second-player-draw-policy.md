# General Connect-K: exact second-player DRAW policy on horizontal-only even-area boards

**Date:** 2026-10-18 Pacific. **Owner mathematical research direction:** Josh Oshiro — nested parity and W,H,K outcome classification. **Status:** newly derived guarded exact source theorem, frozen before physical branching validation. Not a universal dimension-WDL formula, not official IsoGraph authority promotion. Canonical owner: research/semantic-quotient.

## Statement and scope

For arbitrary finite positive W,H and connection length K>=3 with

    H<K   AND   W*H even,

ordinary gravity Connect-K starting on the EMPTY board admits a deterministic online strategy for SECOND PLAYER P1 that makes the final outcome **DRAW against EVERY possible legal P0 continuation** (provided P0 and P1 alternate, gameplay stops at first win, and no passes occur).

Consequently exact perfect-play outcome is bounded:

    V_empty(W,H,K) <= 0      (P0 cannot force WIN).

This is an exact one-sided outcome bound, NOT a proof that V=0: P0 may be forced to lose against another P1 strategy. The distinction matters because the 6x4 K4 perfect-play P1 WIN lies outside the guard (H=K).

For W<K, the earlier general narrow-width theorem independently establishes exact DRAW under any H, so this result is most interesting when W>=K, H<K and WH even. General H<K odd-W/odd-H is NOT covered, nor is any line with H>=K.

## Geometry and horizontal pairing

Because H<K, no original vertical or rising/falling diagonal K-line is possible. Every possible win is a horizontal length-K interval along one row.

Let E = 2 floor(W/2). Pair adjacent columns (0,1),(2,3),...,(E-2,E-1). If W odd, leave only the last column c=E unpaired.

Every contiguous K>=3 columns contains at least one complete paired column block: every 3 consecutive integers contains an even-odd neighbor pair; when W is odd the final column E is unpaired, but any K>=3 run ending there includes the immediately preceding complete pair (E-2,E-1). Therefore if, in every row, P0 and P1 always split each paired column block, NO horizontal K-line can be completed by EITHER player, regardless of the owners of the unpaired final column.

## Uniform online P1 policy

At the beginning of each P0 turn, all paired columns have equal height within each fixed pair, and in every *fully occupied row* of a pair, its two cells are split one P0 and one P1.

1. If P0 drops into paired column c at its current height r, the mate column c XOR 1 has the SAME height r, because heights were equal before the move. P1 immediately drops into that mate column, filling the same row r with the opposite owner, and restoring pairwise equal heights.
2. If W is odd, WH even forces H even. On P0's first use of the rightmost unpaired column c=E, the row r must be even by induction: on every previous P0 use of that column P1 immediately claimed the next row. P1 replies in the SAME unpaired column at row r+1, which is gravity-legal because r<H-1 (H even). The new column height is even, and paired-column height invariants remain untouched.

No discretionary moves occur: on every P0 turn P1 has exactly one available legal mate. Because WH is even, P0 never plays the final overall cell; the board can fill only after P1's matching response. Every paired row is always split, including partially occupied rows at the P0-to-P1 boundary; no K-line can complete after the P0 move because each horizontal K-window contains a complete pair whose two cells were either previously split or whose P0 member has just been played while its partner is (as yet) empty. No K-line can complete after P1's response either, since every fully occupied pair is split.

Therefore P1's deterministic source policy forces a filled-board DRAW against arbitrary P0 choices. No recursive game-value calculation or first-win distance evaluation is needed.

**Special case W=1:** then H must be even and H<K. P0 plays successive even-indexed rows, P1 replies in the odd-indexed immediately above; with no horizontal K-line and no vertical K-line this is a draw. All guards remain valid.

## Relation to existing partial theorems

- Narrow-width W<K => DRAW has both-player no-win proofs; this new result extends to arbitrary W but yields only P1's DRAW strategy and V<=0.
- The earlier K4 thin-board theorem min(W,H)<4 => DRAW is stronger for K4 H<=3. This theorem is an independent general-K guarded one-sided extension, and must not be presented as new WDL coverage over that special case.
- The earlier legal cooperative draw word exists for all K>=4 without a force guarantee. This P1 policy is an actual opponent-universal forced DRAW on its guarded family and therefore strictly stronger.
- Full-board balanced no-monochrome coloring alone cannot imply a forcing policy; here the per-row pair/equal-height invariant makes actual response legality and alternate-owner split provable.

## Frozen independent physical falsification

1. Freeze source P1 responder that receives only current original height array and P0's literal column, and returns a single original legal reply, never enumerating alternative q or game-value children.
2. In an INDEPENDENT original gravity simulator, construct all actual geometric K-lines and explore ALL P0 legal actions recursively under this ONE FIXED P1 responder on bounded original small boards (W up to 8, H<K, WH even, K3..6, state budget explicit). Reject if either player wins or a mate is illegal. Report bounded budget as INCOMPLETE, not success.
3. Include even W/odd H, odd W/even H, odd W/odd H guard-rejection and H=K guard-rejection, plus forced original first-win stopping. Preserve any validation-source coupling and negative evidence.
4. Compare with independently recorded perfect-play board outcomes only after the source theorem/policy are frozen; a published counterexample under the declared exact guards falsifies the theorem, while cases outside guards do not.
5. Do not mutate gameplay solvers or claim exact WDL DRAW from the bound V<=0 without separate P0 no-loss theorem.

**Engine assessment:** constant-time dimension guard and O(1) response map give an exact P0-nonwin bound usable as an admissible upper bound at an empty-root generalized Connect-K node. Not a sufficient root exact cutoff unless additional source proof excludes P1 win. Disposition research-only, integration deferred pending independent general-K/guard correctness and measured net engine cost.
