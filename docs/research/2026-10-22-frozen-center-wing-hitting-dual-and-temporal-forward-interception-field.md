# Frozen experiment: exact center-first two-wing blocker dual versus time-oriented future-interception field

**Date:** 2026-10-22 Pacific. **Research owner:** research/semantic-quotient; **direction:** Josh Oshiro. **Pretest HEAD:** 06c8873c2746f91300d3c56c51ea57e8f3c1f047. **Status:** hypotheses frozen before source-code control. **NO** full root WLD theorem or optimal-move selector. Preserve strict zero-strategic-fanout and original7x6 H/V/R/F site geometry. No prior solved-game knowledge as premises. Read October22 causal WSL/tropical root twelve-window note and October20 first-entry response matroid.

## H1: one-site center ownership creates a mandatory TWO-wing bottom-row hitting-set dual

After actual P0 FIRST move c4r1, all four original bottom-row H4 windows contain that P0-owned center site. To block EVERY such H4 eventually on a *fully occupied bottom row* without P0 already having firstwon, P1 must own a hitting set of \(\{[1,4],[2,5],[3,6],[4,7]\}\) not containing c4. Predict all minimal hitting sets are EXACTLY six TWO-site wing pairs:

\[
(1,5), (2,5), (2,6), (3,5), (3,6), (3,7).
\]

Each has one P1 bottom cell in L={1,2,3}, one in R={5,6,7}. In the six-vertex bipartite incidence graph with these six edges, predict connectedness and a unique 4-cycle (cyclomatic rank1), with primitive oriented dependence \((2,5)+(3,6)-(2,6)-(3,5)=0\) for edge-to-vertex incidence. Do NOT equate that 4-cycle with October C6 signed SIX-board cohomology, and do not claim P1 must supply both blockers BEFORE an earlier P1 FIRSTWIN or before bottom row is completed. The exact static complement/source constraint here is over **six free bottom sites** only; testing all2^6 Boolean blocker masks is geometry/field algebra, not game-state enumeration.

## H2: true original-root temporal interception theorem for a fixed 4-cell bottom H window

Take ANY of the four genuine original bottom-row H4 intervals W and ANY ordering \(a=(a_1,a_2,a_3,a_4)\) of its four distinct columns (96 scripts); fix the center-first subfamily \(a_1=4\) (24 scripts) as the user-preferred root opening geometric control. P0 on its plies1,3,5,7 selects those ordered columns regardless of P1; P1 replies \(b_1,b_2,b_3\) are any legal columns.

Let \(I_{jk}=[b_j=a_k]\) for \(1\le j<k\le4\) (six directed "future P0 bottom target intercepted before P0 arrival" edges). A P0 stone at \(a_k\) lands at physical row1 iff **no earlier P1 reply** chose \(a_k\). On original7x6, through rank7 each prescribed P0 move is legal: at most3 P1 stones occurred beforehand, one P0 visit per target.

**Freeze strongest proposed exact theorem, not merely sufficient:** because P0 has precisely one new stone in EACH of four distinct adjacent columns, only an original H4 along row1 can firstwin on ply7: a horizontal H4 at row≥2 needs ≥4 previous P1 support stones, diagonal spanning row1..4 needs ≥6, and a vertical winner is impossible (only one P0 per column). P1 cannot firstwin before ply7 with at most3 P1 stones. Therefore

\[
\boxed{\mathrm{P0FirstWinByPly7}=\prod_{j=1}^{3}\prod_{k=j+1}^{4}(1-I_{jk}).}
\]

This is an EXACT physical/causal source WDL **through ply7 only**, not a perfect-play WDL from empty. Its Boolean complement is a strict time-oriented defense-resource condition:

\[
\boxed{\mathrm{NoP0FirstWinByPly7}=\bigvee_{j<k}[b_j=a_k].}
\]

A P1 **off-column reply to some unrelated column** generates a parity defect but does **not** block the planned line. To prevent this fixed-script P0 win, P1 must make at least one **productive forward interception** of a future target. This is stronger than the previous \`P0 WIN or first phase dipole\` lemma and does not assume a meaningful mate Q already exists.

Since b_j has seven legal column labels during this short prefix, the exact no-interception word-family count is predicted \(4\times5\times6=120\) and interception family count \(7^3-120=223\) (earliest productive interception partition 147 at j1, 56 at j2, 20 at j3). Count by pure choice-set combinatorics, do NOT generate/evaluate all 343 game histories or imply uniform random perfect play. A short physical two-ray/69 K4 witness for each temporal stratum is permissible as a local control. A proof using only per-target precedence / total P1 support and 69 source winning-line geometry is mandatory.

## H3: first-dipole GF2 height alone cannot encode *which player owns the bottom of an intercepted column*

Give two explicitly legal original center-first four-ply histories:
- A: P0 c4, P1 c3, P0 c3, P1 c5 = \`4335\`;
- B: P0 c4, P1 c5, P0 c3, P1 c3 = \`4533\`.

Predict SAME support heights: c3=2,c4=1,c5=1; same GF2 residual-height parity u with odd columns c4,c5; same mover P0 and no firstwinner. But owner at c3r1 differs: A P1 bottom/P0 upper, B P0 bottom/P1 upper. After P0 c2 actual same action, B has immediate playable P0 winning-line singleton at c1r1 (bottom H c1..4); A does not. Therefore a phase dipole field alone is NOT a future-behavior quotient or an online opponent-commitment certificate. The missing variable is *who owns which real site within the gravity column*, exactly the owner-depth/role information preserved by historical WSL/RBA and ROLE_CAPPAR descriptors. This is a bounded true original-board counterexample to coarse **phase-only** closure; no extrapolation from smaller boards.

## H4: no false identification

The six STATIC two-wing blocker pairs and six TEMPORALLY oriented future-interception edges are different sets (6 vertices left/right vs4 planned-target time sites, 4-cycle vs K4 tournament/DAG). The C6 six-board signed circuit is a third typed object. Numerically matching six is NOT a mathematical identification. The new invariant structure is a *coupled obligation/resource field* with distinct static hitting, adaptive temporal interception, column-support GF2 parity and owner-labeled Shannon cofactor.

Pass boundaries: independently enumerate 69 original geometric lines, abstract six-site Boolean subsets and ≤one concrete 7-ply witness per temporal class; derive full H2 analytically without enumerating 7³ opponent histories. If exact equality fails (e.g. diagonal P0 four by ply7), preserve true physical counterexample and downgrade to one-sided implication. Do NOT claim P0 root forced WIN from source scripted four moves.
