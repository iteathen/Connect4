# Policy-frontier campaign run log

**Date:** 2026-09-18

1. Enumerated complete legal nonterminal state graphs for 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4 with first-win stopping.
2. Solved exact current-player W/D/L plus fastest-win / longest-loss distance by finite backward recursion; extracted exact best-action sets.
3. Reconstructed normalized per-player residual antichains and support q signatures.
4. Verified zero best-action inconsistency inside every q class on all controls.
5. Measured policy headroom using support + exact best-action set.
6. Built transition-closed Moore policy quotients over q; observed only 1.158x-1.335x collapse on the first three controls and 1.290x on 4x5.
7. Tested cheap local structural projections. Two successor-refinement layers became exact on the first three controls, but class counts nearly reconstructed q; classified as the wrong collapse direction.
8. Tested cross-support residual-formula action dominance; found false positives.
9. Added a simple cell-accessibility guard; false positives remained on 4x4 and 5x3, confirming timing/control guards are load-bearing.
10. Restricted comparison to equal support and defined the current-player favorable residual implication order.
11. Exhaustively checked state and fixed-action monotonicity under that order on all four complete controls: 6,300,753 comparable q pairs and 18,076,405 comparable action pairs, zero W/D/L or strong-distance violations.
12. Constructed exact minimal-antichain generators for Win and NonLoss action regions and for every strong-score upper threshold.
13. Tested direct best-action region monotonicity; falsified it on the first three controls.
14. Derived the support-local action-value isotony theorem candidate and action-value frontier method.
15. No frozen IsoGraph authority artifact was modified.
