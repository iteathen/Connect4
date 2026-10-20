# OWNER CORRECTION — PERFECT PLAY MUST START AT THE EMPTY 7×6 BOARD

**Date:** 2026-10-19. **Owner direction:** explicitly reject selecting arbitrary middle/end game positions to "simulate perfect play" because those states may have been produced by imperfect prior moves. **Status:** governing methodological correction for the current 27/28-surviving-line and unfolded owner-wave studies. **Repository:** iteathen/Connect4; single canonical research branch research/semantic-quotient. **Geometry:** ONLY standard W=7,H=6,K=4 with gravity, P0/P1 alternation and FIRST-WIN stopping.

## 1. Retraction and correct scope of earlier measurements

Previous \`STANDARD7X6_158_SOLVED_ORACLE_PARENT_793_ACTION_69LINE_SURVIVAL_0_1.json\` measured 158 arbitrary solved-position prefixes and 793 one-ply continuations, 227 locally strongest-score actions. Its exact game rules, line counts and one-ply oracle labels remain valid, but no prior move in the randomly sourced parent history was qualified as optimal from the EMPTY ROOT. **Therefore those statistics MUST NOT be cited as empirical support, contradiction or approximation of the owner's conjecture about 27–28 lines under a game perfectly played by BOTH sides from empty board.** Retain them as *arbitrary-state geometric/oracle calibration controls* only.

Previous \`STANDARD7X6_30_VERIFIED_STRONG_OPTIMAL_ENDGAME_TAILS_138_PLIES_SURVIVORS_0_1.json\` contains 30 genuine exact strong-optimal tails, 138 scored moves from ten externally calibrated late positions; it was correct to label them \`conditionally perfect from those positions\`, but absolutely **NOT** perfect play *from the empty board*. Any claim that their terminal U∈{0,1,2,3} alone refutes the owner's root-perfect-play 27–28 conjecture is withdrawn: it refutes only a proposed UNIVERSAL terminal U=27/28 statement covering all positions/conditional tails, not the actual root-perfect-play hypothesis.

The WDL-class broadened tail experiment \`independent-true7x6-oracle-WDL-equivalent-tail-survivors.mjs\` has the same invalid root provenance and must NOT be run, summarized or promoted as a test of root-perfect-play unless its starting positions are themselves generated from the empty board by independently score-certified optimal actions.

All previous true physical four-ribbon geometry, exact K4 line incidence and P0/P1 owner-wave Fourier identities are unaffected; the methodological flaw concerns interpreting POSITION SELECTION as evidence for root-to-terminal perfect play.

## 2. Correct perfect-play trajectory construction

Initialize an **actually empty standard board** (h=(0,...,0), no P0/P1 stones, absolute ply=0). At each genuine playable state q_t reached so far, call the independently checkpoint-qualified exact standard7x6 oracle (only as an independent TEACHER/VALIDATOR, never fed to the proposed future-free source formula):

- Obtain the exact current per-action strong scores (Pascal Pons convention), including -1000 sentinel on genuinely illegal columns.
- Verify ordinary original rules independently: physical landing is lowest empty cell, P0 at even ply, P1 at odd ply; no earlier four-in-a-row, and stop at the FIRST terminal move or full DRAW.
- Define the PERFECT set \(\mathrm{Opt}(q_t)=\{c : s(q_t,c)=\max_{legal\,d}s(q_t,d)\}\). Take ONLY c in that set. This implements the external exact solver's **strong-optimal** game semantics: fastest wins and most-delayed losses, where their distances differ.
- For the separate weaker **WDL-class optimal** interpretation, label it separately: if max score positive, any winning-score legal action; if max 0, any 0; if max negative, any negative. For a forced-losing player this can include fast losses and is NOT strong-perfect under the score convention. Do not blend these with strong-perfect samples.
- If multiple EXACT strong-optimal actions exist, vary by deterministic reproducible tie choice, e.g. \(c=\mathrm{Opt}_{(\text{ply}+\text{seed})\bmod|\mathrm{Opt}|}\), or enumerate all if affordable. Seeds affect only the choice among already proven exact OPTIMAL actions—**never** which states appear or a future outcome guess.
- Keep a per-ply proof ledger: original literal move word from "" to terminal; current input q hash / heights / P0/P1 colors; all seven exact action scores; legal actions; exact maximizing tie set; chosen action; independent first-win terminal guard. **Every prefix** is thereby rooted in an empty-board continuous chain with every move checked. No import of arbitrary solved corpus histories, principal variation without independent validation, guessed opening or handcrafted terminal positions.
- If full empty-board root exact evaluation exceeds resource budget, call it a verified BLOCKER and preserve complete executable test harness/command and evidence; NEVER substitute convenient late-game nodes or a rank-local "center dominates" decision for a global solved-score certification. A complete root-perfect-play run is much better than a hundred weakly qualified conditional games, but falsely relabeling midgame samples is unacceptable.

## 3. What to observe at EVERY perfect-play ply, not just terminal

First build the actual original 37 ordered open finite strands, 42 four-way physical junctions, 168 alias appearances, 69 real K4 winning windows; no toroidal wrap. Separate original player occupancy layers then apply Fourier. At every certified perfect-play prefix compute these distinct, explicit observables:

- E: K4 lines containing no stone; A0: lines containing P0 but no P1; A1: containing P1 but no P0; D: both players have at least one stone on the same 4-cell line (dead for BOTH). E+A0+A1+D=69.
- U=E+A0+A1=69−D: DISTINCT K4 lines geometrically live for at least one player; L0=E+A0, L1=E+A1, S=L0+L1=U+E: owner-layer multiplicity. D is the strictly geometric BOTH-owner cancellation count.
- Original directional 4-ribbon line classifications and signed P0−P1 contrasts; count SAME 69 underlying K4 line IDs, do not treat 168 appearances as independent or count owner layers as distinct line IDs.
- Define and record separate strategic "survival" estimands only after their opponent-quantified semantics are formalized. Geometrically unblocked U is **not** the count of forceable winning lines under perfect play.
- For each random or deterministic variant store U,L0,L1,S,D vs ABSOLUTE PLY, first terminal, and frequency of EXACT 27 and 28. Look for structural modes/equivalence classes but do not SELECT an observable post hoc just because its dimension is 27 or 28.
- A single exact root-optimal terminal path is valid evidence of ONE variation, not an exhaustive claim about every optimal variation. Many root-verified tie variations plus independent proof are required for any universal perfect-play survivor theorem.

## 4. Strong-score oracle independence, reproducibility and current limits

Use the source \`components/oracle/exact7x6.mjs\` on the canonical current repo research branch. Its independent negamax solver is externally checkpoint calibrated for middle/end game states in \`docs/specs/C4-0005-solved-strength-oracle-v1.md\`; **that external calibration does not, by itself, qualify a particular expensive empty-board root analysis as having completed**. In particular report the root's actual computed seven per-action exact scores before calling any continuation root-perfect.

Oracle use is allowed ONLY as an external falsifier/teacher for this empirical claim; original aim remains a purely algebraic, non-strategic-branching exact WDL algorithm. This experimental use of game search to generate ground truth must not be described as the proposed solution and must not be used to infer necessary "first-win timing" in the structural formula.

**Current completed root-perfect-play trajectories in this lane: NONE until actually generated, scored at every ply and persisted.** Status INCOMPLETE rather than projecting from arbitrary states.

## 5. Protocol: freeze, test, and report

1. Preserve this owner correction and mark preceding corpus/tail studies as non-root controls in STATUS.md/next_step.yaml.
2. Freeze one empty-board generator/checker with exact source physical 69-line observer and independent cold-oracle legality and strong-score validation; checkpoint reproducible seeds and resource budget BEFORE expensive root solve.
3. Attempt one exact empty-root seven-action oracle valuation without previous solved TT/knowledge. If no full exact vector, record root resource wall and no perfect-play trajectories produced. Never silently switch to midgame roots.
4. Upon true root qualification, generate and retain fully scored root-to-first-terminal histories; measure original U/L0/L1/S/D and genuine per-strand Fourier effects at EVERY move. Vary only ties in the exact optimal action set.
5. Final interpretation must distinguish observed numerical regularity from proven source game-value invariant. Confirm true original game rules, statistical coverage and sample selection; preserve negative outcomes.

**Qualification:** methodological correction effective NOW. No change to qualified IsoGraph 1.2 gameplay/authority, no solver modification, no novel mathematical WDL theorem claimed.
