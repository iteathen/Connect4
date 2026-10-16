# Standard-7x6 rank-local fusion falsifier — predeclared control

**Date:** 2026-10-16. Canonical owner `research/semantic-quotient`.
The rule-derived one-reply and two-own-move alternating cofactor identities
have exact independent finite qualification on 4x3 Connect-3 and 4x4 Connect-4.
This test adds **standard 7x6** validation without generating or consulting
solved WDL labels, winning policies, the 46/47-node searched certificates or
the game-theory oracle.

1. Replay the literal research prefix `44444` from physical rules alone,
   check that the one-reply P1 favorable-action mask equals exhaustive direct
   P1 reply / immediate P0 action testing.
2. For **all seven legal turn-6 P1 replies**, calculate all P0 next-two-own-
   move winning action masks by the parent-only direct source-residual
   pullback. Compare with the independently written exact q-cofactor/fused-
   opponent method and the direct physical bounded response evaluator.
   This is a short horizon, not a turn-six perfect-play proof.
3. Independently generate from legal gravity/first-win rules up to **12**
   deterministic random **rank-35 P1-to-move** states, each with its own
   legal rank-34 predecessor, using xorshift32 seed `0x4c2a7f16`.
   Reject immediate-terminal playout moves; no winning move selection
   or oracle WDL observations. Max **4000** attempts, maximum 12 samples,
   and 30 seconds total. No external solved dataset input.
4. For each sampled P1 state check the favorable response mask and polynomial
   against direct physical one-reply/one-immediate-response outcomes; for
   each rank-34 P0 predecessor check the exact direct two-move pullback
   action set against direct physical P0/P1/P0 checking and the independent
   one-step q cofactor/fusion method.
5. Include a zero-change horizontal-reflection control on the same positions
   and action masks. Preserve exact sampled legal sequence, q support,
   result masks and any counterexample. Do not infer WDL from short-horizon
   failure and do not treat random controls as proof of universal correctness.

Maximum 30,000 physical validation move transitions, 50,000 local residual
membership checks and 30 seconds. Check the budget before each complete
position; mark PARTIAL instead of expanding. No full game-tree solver calls,
no increase to earlier 60,000 symbolic gate budget, no minimality proof.
