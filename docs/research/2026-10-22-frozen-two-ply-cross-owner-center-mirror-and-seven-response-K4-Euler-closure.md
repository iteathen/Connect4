# Frozen: two-ply original7x6 opposite-owner phase mirror and action-indexed K4/Euler rank closure

Research date 2026-10-22 Pacific. Branch `iteathen/Connect4@research/semantic-quotient`. Research owner: Josh Oshiro. **Status: pre-execution preregistration, mathematical predictions not yet independently checked.** Qualified IsoGraph1.2 and production solvers untouched. No prior solved game labels, historical 28 terminal lines, oracle action values, or optimal opening premises.

## Context and strict scope

The previous source-only six-anchor result generated six firstwinfree rank12 original 7x6 ensembles. For anchor `a ∈ {1,2,3,5,6,7}`, c4 is EMPTY and all six peripheral columns have exactly two stones, opposite owner in bottom/top row; c_a bottom P0/top P1 is fixed, and the five remaining peripheral bottom-owner bits range over all `2^5=32` possibilities, each with a genuine alternating, firstwinfree 12-ply realization. Fixed physical heights `[2,2,2,0,2,2,2]`. Source native moment family F: every complete ternary owner pattern for each of the original 69 physical K4 windows plus both owners' 438 gravity-frontier Euler directional subset hazards (876 source slots). Previous independent source result: rank(F)=18/16/13 by anchor 1/7,2/6,3/5, and F plus action-indexed P0 CENTER c4 (row1) firstwinner-absorbed pullback rank=24/22/19: a +6 gain for all six anchors. Offcenter P0 actions add0 on that face.

## New exact two-turn predictions — both FIRSTWIN and full observable update

1. Take P0's actual PLY13 action center c4 row1, discarding every P0 firstwinner in a dedicated sink. On survivors, P1 takes any of the SEVEN gravity-legal PLY14 columns separately (in center c4 upper row2; in each outer c row3). Predicted: **P1 has ZERO firstwinning transitions in every anchor × P1 column combination**. For off-center P1 actions, a newly placed row3 cell cannot produce a four-in-row in any orientation on the original board, because all other row3-or-above cells are empty and each column had at most two stones. For same-center P1 c4 upper row2, P1's true horizontal row2 four-window through c4 is completed iff P0's PREVIOUS lower row1 four-window on the same four consecutive columns was completed, as every outer-column top owner is the opposite of its bottom owner. There is no possible same-center vertical/diagonal four-win. Therefore, if P0 survived under firstwinner stopping, P1's matching upper H WIN is impossible. This is an exact **cross-owner, same-column, first-win precedence/mirror** claim, not an assertion of P0 strategic advantage.
2. Let `T^L_{0,4}` denote the genuine absorbing P0 center action and `T^L_{1,d}` the subsequent genuine absorbing P1 action for d=1..7. Compute `F0 = F(q)`, `F1 = F(T^L_{0,4}q)`, and `F2_d = F(T^L_{1,d}T^L_{0,4}q)` as evaluation vectors on all original 32 inputs (zero on firstwins), keeping each of the 69 complete line-pattern indicators and 876 Euler slots, both players. Measure `rank_Q(F0 + F1 + F2_d)` and `rank_Q(F0 + F1 + ALL F2_d)` for each anchor. **Exploratory prediction:** At least one P1 action in at least one anchor introduces additional moment directions beyond F0+F1, despite no P1 firstwinning sink. The falsifier is ZERO new directions for all 42 anchor/action pairs. No numeric rank counts are preassumed. It is acceptable and informative if the prediction fails.
3. For anchor pairs related by horizontal reflection (1,7),(2,6),(3,5), the complete rank and terminal table under action d must reflect as d→8−d. Distinct actual all69 physical K4 and independent directional ray checks must agree on every transition; never sum raw line incidences as terminal counts. Two primes can be used as rank controls but the claimed rational ranks require exact Q elimination.
4. To test **strategy-sensitive observation stability**, report center P1 reply separately from the six outer replies. The previous +6 emission leakage is at P0 action c4 and is not to be confused with any new second-ply leakage. If extra directions occur on offcenter P1 actions, source-locate them in exact postaction K4 vs Euler observables, and identify whether their physical-owner multilinear degree is ≤4 or 5 on the original five-switch family.

## Permanent falsifiers / guards

- One generated source history is illegal, already terminal or not alternating.
- P1 firstwins on an absorbing P0-surviving child (the strict mirror prediction is false).
- Original 69-source WIN evaluator disagrees with separately generated physical rays or wrong-turn owner.
- False reflection transport, Q versus independent prime rank discrepancy, or firstwinning sink double counted.
- Uniform action average is silently substituted for separate P1 actions.
- Post-P0-firstwin boards accidentally propagate into P1 source features.
- Native moment rank interpreted as universal game-semantic information-minimality or a P0-from-empty adversarial invariant.
- Historic September EW-RS-070 signed descriptor pair-deltas, current signed source slacks, and two-turn mirrored hazard channels are silently identified; a specific role/transition-preserving map is still required.

## Reproducibility target

Freeze this note first. Then implement a **source-only independently checkable Node/JavaScript runner** generating all six original rank12 legal faces, actual 69 windows and directional ray firstwin, full original K4 ternary patterns, two-owner 438 Euler hazard subsets, and exact fraction-free rational rank (with independent modular checks) on all seven genuine P1 reply masks per anchor. Commit exact program, deterministic integer JSON results and theorem/negative controls. Reconcile the result into the global field synthesis/index/map. Never modify qualified gameplay authority. Nothing here assumes an empty-root winner theorem.
