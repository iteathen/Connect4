# Connect4 Minimax / Alpha-Beta Status

**Updated:** 2026-09-18  
**Branch:** `solver/minimax-alpha-beta`  
**State:** RETIRED — historical-only; no further implementation work

The Minimax/Negamax/alpha-beta solver family is no longer an active implementation lane.

Active forward exact solving is owned by `solver/isometric`. The qualified incumbent on `main` remains a baseline/reference/conformance implementation only.

Useful Minimax mechanisms, measurements, negative results, the MQ5 residual-state result, the 42-vs-49 coordinate defect, and the pre-retirement branch head are preserved in canonical research history:

`research/history/historical-only/solver-lineages/MINIMAX_ALPHA_BETA.md` on `research/semantic-quotient`.

Pre-retirement active head: `c25de7ddab5dcae525a250331cd6c74bd94beb4e`.

Do not resume implementation on this branch. Historical mechanisms must be reassessed against current canonical research and implemented only in the current owning solver if still appropriate.
