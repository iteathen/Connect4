# Frozen root first-dipole OR firstwin formation lemma (NOT an empty root WDL proof)

**Date:** 2026-10-22 Pacific. **Pretest HEAD:** 3b8a0be11cdddc92b9c26edf1b77a1cb46eb7266. **Research direction:** Josh Oshiro. **Status:** candidate uniform SHORT finite prefix implication before control; not P0's optimal policy and not completion of root WDL.

On ORIGINAL EMPTY 7×6,K4 with true gravity, fix P0's next FOUR chosen column labels as \`4,3,5,2\` on P0 plies1,3,5,7, regardless of P1's adaptive actions. The labels are four distinct *contiguous bottom row* cells c2,c3,c4,c5 if P1 doesn't preempt them. The first chosen c4 matches the center opening but the complete four-move script is **not** claimed WDL-optimal.

Let P1 reply at plies2,4,6 with arbitrary legal columns \`b1,b2,b3\`. Define \`a=(4,3,5)\`, deviation bits \(d_j=[b_j\ne a_j]\). Before the earliest j with d_j=1, all preceding P0/P1 pairs have placed one bottom P0 stone and one upper P1 stone into DIFFERENT fresh target columns, so all remaining column-height parities are EVEN. At j, P0 enters untouched a_j, and if P1 replies b_j≠a_j, then its immediately resulting full two-player source parity field has exactly two odd-height columns \(\{a_j,b_j\}\); over GF2 the defect is \(u=e_{a_j}+e_{b_j}\), with seam gradient \(\delta=\partial u\). This is a **genuinely adversarially forced** first phase dipole, irrespective of which alternate legal b_j was selected, not a random position.

If d1=d2=d3=0, after six plies P0 owns bottom c4,c3,c5, P1 occupies second row over each; P0 next move in c2 lands bottom and FIRSTWINS the original horizontal K4 c2,c3,c4,c5 at ply7. All P0 target columns are legal even if P1 previously deviated, because by ply7 no new target column can be full (at most three P1 placements before P0's single visit to it). P1 has at most three stones by then, so cannot already have formed K4 firstwinner.

Thus the proposed exact Boolean prefix statement on ALL P1 adaptive replies, not a numerical game-state list:

\[
\boxed{ \mathrm{P0FirstwinByPly7}\;\;\lor\;\; \bigvee_{j=1}^3 [b_j\ne a_j].}
\]
And whenever P1 avoids the first disjunct while the script remains firstwinner-free, the **first** deviation supplies one 2-support GF2 parity dipole at its completion.

**Check without searching P1 continuations:** physical original69 K4/winner rays on the all-follow policy \`4,4,3,3,5,5,2\`; algebraic parity-vector proof of same/different initial column entry for each possible first deviation stage j=1,2,3, with five-column/capacity legality argument; do not enumerate 7^3 D/A games. This result does not prove any continuation after the first deviation is winning for P0, and the two odd columns need not form an eligible odd-base Q of the earlier responder theorem if one already has a latent trap C. It is a necessary FIRST formation event, not a total root control certificate. Compare with old rank-causal GF2 dipole in \`docs/research/2026-10-20-interference-odd-pair-matroid-rank-strategy-mechanism-and-empty-root-gap.md\`.

Independent possible stronger hypothesis (NOT claimed here): the P0 player can use the forced dipole or WIN alternative to construct a monotone Γ>0 protected corridor against every subsequent P1 legal choice. That is the next missing long-range formation theorem; do not infer it from this bounded prefix.
