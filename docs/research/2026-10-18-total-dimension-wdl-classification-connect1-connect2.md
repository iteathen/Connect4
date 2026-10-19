# Total non-search empty-board WDL formula for gravity Connect-1 and Connect-2

**Date:** 2026-10-18 Pacific, canonical owner research/semantic-quotient. **Research direction:** Josh Oshiro, exact dimension/connection-length WDL. **Status:** new source deductive theorem, frozen before independent physical first-win-stopped original-game validation. No ordinary future strategic game-value search, no official IsoGraph gameplay-authority promotion or solver modification. For fixed parameter family K<=2 ONLY. Do not extrapolate to K>=3.

## Exact closed-form classification

For every finite positive integer width W, height H and ordinary gravity, alternating no-pass, first-win-stopped rules:

    V_empty(W,H,1) = +1 (P0 WIN).

For K=2:

    V_empty(W,H,2) =
       +1    if W>=2 AND (H>=2 OR W>=3),
        0    otherwise.

In particular, P1 cannot force victory for ANY positive finite W,H with K=2.

## Proof, W1

If W=1 and K=2, there is only one legal column and players alternate in it. Every two vertically adjacent occupied cells belong to different players, so no K2 win ever occurs, independent of H. Final board DRAW. If W=1,H=1, no K2 geometric line exists. Thus all W1 cases draw.

## Proof, one-row W2

When H=1, W=2 and K=2, P0 chooses one cell, P1 chooses the other, the board fills without same-owner horizontal pair, so DRAW. The subcase W=1 already handled.

## Proof, width >=3 and height=1

Choose P0's first cell at column c=1 zero-based (the second from the left). It has two horizontal neighbors c=0 and c=2. P1 has one stone on its sole reply and can occupy at most ONE of those two cells. Whichever neighbor P1 does not occupy remains immediately legal and P0 takes it on its second turn (absolute ply3), creating a horizontal adjacent same-owner pair. Therefore P0 forces WIN without inspecting or valuing any alternative games; simple one-move response rule. No P1 K2 win can occur on its first stone.

## Proof, width >=2 and height >=2

P0 opens at bottom-left (c=0,row0). There is an immediately adjacent column c=1.

On P1's single reply:
- If P1 claims bottom cell (c=1,row0), its same-column upper neighbor (c=1,row1) is now gravity-playable and unoccupied. P0 plays (c=1,row1), completing the rising K2 diagonal from P0's original (0,0) to (1,1).
- If P1 claims ANY other cell (including (0,1) above P0 or any distant column), (c=1,row0) remains unoccupied and gravity-playable. P0 claims it, completing a horizontal K2 pair with its original (0,0).

Thus P0 wins on its second stone, absolute ply3, against every opponent action. The policy is one deterministic conditional map on the *opponent's one landing cell*. P1 has at most one stone before that win and cannot win first. No minimax evaluation, implicit strategy tree, timing refinement or other game outcomes appear as premises.

For K=1, P0's first legal landing cell alone completes a length-1 line, so the game terminates immediately with P0 WIN.

## Source algorithm contract

Return only {W,H,K,V} according to the above closed formula. A compact P0 witnessing opener and optional single-opponent-reply response function may accompany WIN conditions. The formula is O(1) and has ZERO strategically inequivalent future-game valuations. This is a complete Level1 empty-board classifier for K<=2, not for arbitrary partially played q or for other connection lengths.

## Frozen independent physical validation

1. Freeze this proof and pure source classifier in research/isograph/discovery/2026-10-18-board-dimension-outcomes/.
2. Separately freeze an original colored-grid first-win-stopped physical checker generating all H/W original directional K windows. Exhaustively check legal P1 replies to P0's opener and resulting P0 winning response for every W,H in 1..30, K=1 or 2. For DRAW conditions W=1 or W=2,H=1, independently replay forced full-board original games and confirm no win. Include H1 vs H2 boundary, width2 vs width3 boundary, both orientations of diagonal, K1 first turn.
3. Include a small independently branching minimax outcome reference on bounded K2 positions only as a comparator AFTER original source outputs are frozen, recording its role as validation not source.
4. Preserve guard errors and raw independent failures; no false attribution of K3 outcomes, no gameplay authority promotion. Recheck exact live branch after mutation.

## Search-engine applicability

For generalized original Connect-K with K<=2, full empty-root exact WDL node cutoff by integer dimension comparisons, effectively O(1). No approximate evaluation or solved-position database required. For K>=3 and arbitrary source q, do NOT consume this theorem. Actual hot-path benefit only relevant if engine supports those K values; benchmark against ordinary immediate terminal checks before integrating. Disposition: ready for experimental research-side integration on supported original geometry, no solver changes authorized.
