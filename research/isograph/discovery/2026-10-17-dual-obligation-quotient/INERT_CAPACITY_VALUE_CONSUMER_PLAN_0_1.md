# Frozen qualification: exact WDL and ALL optimal ties after dynamic inert-capacity branch elimination

**Date:** 2026-10-17 Pacific. **Live HEAD before benchmark:** `c0f536feca3d9ff1a92159cd0d97f7fd97ed0dc1`.
**Research owner:** `research/semantic-quotient`. **Status:** FROZEN BENCHMARK PLAN, not an exact runtime claim.

## What is already proved
The source-only `inert-capacity-bisimulation.mjs` classifies a legal gravity column as fully inert iff **ALL remaining cells in its suffix** are absent from both normalized residual winning requirement antichains. It proves that any placement there is a neutral move consuming exactly one future tempo token; every such column's future values are fully WDL-equivalent. Dynamically pooling neutral capacity preserves all later active labels, first-win, draw, and mover parity, even when individual neutral column capacities differ. A source-only certificate may also compare two different source q states with equal active labelled column heights, same R0/R1, same total neutral token count and mover.

The complete physical exact-q 4x3/4x4 board regressions already show 19/437 inert first-action equivalence pairs and 94 ADDITIONAL P1 scalar proof obligations beyond static column transporter on 4x4, with zero false WDL or tie-group claims. Standard `44444` source has no fully inert legal columns; unrestricted WDL remains UNKNOWN.

## Independent consumer and actual saved-work test
Implement a **separate benchmark consumer** of the PROVEN source-neutral theorem. This is expressly NOT a new game-solving theorem or a source-policy-discovery method. At each q state:
1. Obtain the source-only neutral-class certificate before any successor WDL computation.
2. For every active legal column, evaluate its successor by qualified exact q recursion; for all currently fully inert legal columns, evaluate ONE representative only, then fill the SAME exact numeric action value into EVERY original inert label.
3. Aggregate P0 max / P1 min, output the full exact `bestMoves` set and complete `actionValues` list in original labelled order. The proof of all neutral class ties is independent of the reference solver.
4. Memoize q by the exact preexisting `core.key(q)`. Instrument recursive calls, unique q states, transitions, terminal edges, classifier bitset work, candidate legal action labels and actual omitted successor evaluations.
5. Compare the entire reachable initial empty-board game WDL/action output against a SEPARATE unmodified `core.solve(empty)`, under the same caps, **without using its values as inputs to the neutral-aware consumer**.
6. On EVERY node reached by the neutral-aware solver, compare its full value and exact all-action vector with a separately computed baseline memo result; preserve tie labels and WDL for P0 and P1 turns.

Benchmark boards: full 4x3 Connect3 and 4x4 Connect4 (not a target opening-book or solved value premise). The consumer may recursively explore gameplay, **for the purpose of measuring actual branch-elimination effects only**. It must not be cited as the SOURCE mathematical certificate and must not be used to invent an unrestricted standard7x6 result.

Also run a dedicated generic neutral pool symmetry control: all-irrelevant residual families on abstract 4x4 supports with neutral pool partitions `1+3` vs `2+2`; compare independent exact core values and dynamic signature. A mutation adding a genuinely active future residual cell must be REJECTED by the source signature. On a REAL legal 4x4 prefix `1111222324334`, confirm differing post-choice neutral capacity profiles but same full-future source-neutral bisimulation certificate between P1 actions 3 and 4.

Budget/performance rules: 60k retained exact q nodes per root, 300k game state transitions/Boolean operations per root evaluator, ≤10k support representatives per source operator, 15 seconds per benchmark/compile unless runtime control explicitly records a partial. Count classifier work separately from visited q transitions and compare BOTH with baseline; a reduction in transitions but increased total proof work is not net speed. No merge, no game-theory authority promotion.
