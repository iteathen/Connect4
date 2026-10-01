# Oracle validation correction — ply 6

Date: 2026-09-30
Branch: research/universal-structural-policy-20260930

## Frozen candidate provenance

The pre-oracle structural policy was frozen before this observation:
- PRE_ORACLE_FREEZE.md
- PRE_ORACLE_RESULT_0_1.json
- frozen candidate commit c4f35ba2ad2106459426d9b46239f903959c737d
- recorded pre-oracle checkpoint a00426632d45f1e81fba63c80846ee3d1f150761

The frozen policy predicted, after prefix `44444`, the reflection orbit `{3,5}` for ply 6.

## Oracle observation

Owner reports that the exact line solver selects column `6` at ply 6 after prefix `44444`.

The position after `44444` is horizontally reflection-symmetric. Therefore exact game value and strong distance are invariant under reflection, so columns `2` and `6` form the same action-value orbit. If column 6 is strong-optimal, column 2 must have the same exact strong score; a displayed choice of 6 may be deterministic tie-breaking.

Thus the relevant oracle-vs-candidate comparison is:

- frozen structural candidate: `{3,5}`
- exact perfect-play orbit implied by the reported line-solver move plus reflection: `{2,6}`

## Disposition

The candidate is falsified at ply 6, earlier than the later non-symmetric tie at ply 15.

Do not treat the generated continuation `44444333333661` as a perfect-play line. It is a structural-policy trajectory after the first oracle mismatch.

The later ply-15 observation remains useful only as an independent structural warning: a hard phase-safety filter can discard a winning move. It is not evidence about the true perfect-play continuation from ply 6.

## Immediate diagnosis

The ply-6 failure is specifically in the comparison layer that used *incremental landing-cell live-line counts* after phase closure.

At `44444`, the frozen rule preferred `3/5` because it counted direct mover-side line incidence more favorably while treating the opponent-side killed-line count as tied. The exact solver instead prefers the adjacent-outer orbit `2/6`.

Therefore a universal formula must compare the complete post-move structural state, including correlations/deadlines/resource competition among residual requirements, rather than only line incidence through the newly landed cell.

This oracle evidence is validation/falsification only. Any formula repair derived from it is oracle-informed and requires a fresh predeclared validation target before independent qualification.
