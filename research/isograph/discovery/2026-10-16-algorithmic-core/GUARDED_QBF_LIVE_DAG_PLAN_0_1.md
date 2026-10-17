# Frozen live-frontier diagnostic after quantified projection k6 node limit
**Date:** 2026-10-16. **Branch HEAD before this experiment:** `460a5d52844904c96c55cc5d70830c4d1e2ebba7`.
**Status:** PLAN, no result claimed. Owner `research/semantic-quotient`.

A prior exact alternate action-bit Shannon projector completed `44444` k5 but exhausted 60k retained AND gates on k6 lower threshold (12 of 18 bits completed, 147,262 nontrivial operations). Those gates are not garbage collected, so **retained** nodes do not lower-bound the true live interface.

Research question: after each completed quantified bit, DFS only the current signed-edge AND/NOT root and count distinct reachable non-input AND gates and reachable quantified input variables. Count every diagnostic edge visit and node marking in addition to the source projector's AND/cofactor work. On the canonical `44444` k6 Wlo, preserve the exact 60k/300k/15sec limits. Report the last successfully completed stage and the current difference between total retained and reachable AND gates. Do not use solved policies or game-state continuations in candidate. The already independently validated finite QBF semantics are unchanged.

If live nodes are much smaller, measure a local garbage-collection hypothesis separately; a measured live count alone is NOT proof that garbage collection is cheap or solves the game. If live nodes are large, retain the result without extrapolating to minimal Boolean/circuit width. All independent small-board and `223` controls must remain intact. Never raise budgets or promote gameplay authority.
