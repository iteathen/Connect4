# ORIGINAL W7 H6 K4 — follow exact oracle-optimal continuations from selected qualified endgame positions, measure 69 surviving lines along the paths

**Date:** 2026-10-19. **User goal:** test 27/28 surviving-winning-line hypothesis under perfect play and compare against unfolded owner-wave cancellations; avoid false assertion that static geometric live lines equal opponent-enforceable winning lines. **Qualification:** externally calibrated exact strong-score oracle as TEST-only teacher, no database/solved labels given to the prospective non-search formula. Original gravity/first-win stop strictly preserved, no alternate boards/K.

**Prior committed first test:** \`docs/research/2026-10-19-true7x6-perfectplay-surviving-K4-lines-27-28-wave-hypothesis.md\`, \`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STANDARD7X6_158_SOLVED_ORACLE_PARENT_793_ACTION_69LINE_SURVIVAL_0_1.json\`. The qualified 128+30 supplied parent scores and 793 physical single moves were verified against a source built from 37 finite ribbons; 27/28 did not concentrate. Those are one-step roots, not entire optimal game histories.

## Frozen next campaign: deterministic selected late parent continuations

Use ONLY accepted \`reference/oracles/solved-actions-v1.tsv\` and \`components/oracle/exact7x6.mjs\`. That exact solver has independently matched 128 external Pascal Pons parent test scores and additional beginning score calibration. **Selection independent of U or 27/28**:
- From \`Test_L3_R1\` end/easy rows, take first TEN available qualified nonterminal parent positions with rank≥34 in existing TSV order.
- For EACH, follow three deterministic tie-choice variants \`v∈{0,1,2}\`: at each original position call independent exact oracle \`analyzeSequence\`, identify all legal current action columns whose strong-score equals max; choose among them by cyclic index \`(ply+v)%number_tied\`. This explores some different STRICT STRONG-score optimal move choices, without ranking geometrical line counts.
- If an original winning line is first completed, STOP and record P0/P1 terminal. Never append moves to first-win-terminal original word.
- At every physical move, store U=69−DeadBoth, E,P0only,P1only, L0,L1, owner-layer multiplicity S, original-four-ribbon orientation breakdown, and full original history. Show 27/28 occurrence and WHICH plies/players, plus number of distinct optimum ways sampled.
- Compare terminal U among optimal tails and U at rank28/29 etc, never assume 27/28 at terminal. If no complete tail can be finished within bounded resource budget, explicitly record INCOMPLETE. Never silently claim original perfect play from EMPTY root: the qualified parent history may already contain suboptimal early decisions. What is exact is that EVERY chosen following move is strong-optimal conditioned on the given parent q and score convention.
- Parent action oracle score max MUST equal already frozen external-calibrated value. Every continuation uses ordinary firstwin stop and exact same standard 7x6 physical geometry.

**Limits:** a few selected easy late-game positions cannot establish a universal histogram of ALL optimal root-to-terminal paths. It can falsify a proposed UNIVERSAL 27/28 terminal survivor theorem if values differ, but cannot refute an unspecified layer of algebraic "27/28 asymmetry." Stratify rank and process corrections; include same-player statuses, no p-value fishing. The nonsearch algorithm remains OPEN; here oracle is only a source of independent game-theoretic labels for validation.

**Status:** source/test plan frozen prior to live exact oracle calls. No solver modifications/authority promotion.
