# UC4A second-order curvature held-out quotient correction 0.1

**Date:** 2026-10-01  
**Status:** frozen analysis-completeness correction before rerun  
**Branch:** `research/universal-structural-policy-20260930`  
**Source result:** `UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_0_1.json`

## Trigger

The frozen curvature design requires held-out stability for measured rank/subspace claims.

The first Phase-B curvature analysis correctly computed, on the full cohort:

```text
boundary-novel dimension = rank(all) - rank(homogeneous)
```

but its held-out section recorded only the rank of boundary-adjacent rows after removing each width or height.

That is insufficient to test the actual quotient claim under holdout because the all-row and homogeneous spans can also change when a family is removed.

## Correction

For every:

- algebra: integer / GF(2);
- family: WIDTH2 / HEIGHT2 / MIXED / COMBINED;
- held-out axis: width / height;
- held dimension value;

recompute from the already-frozen curvature rows:

```text
rank(all kept rows)
rank(boundary-adjacent kept rows)
rank(homogeneous kept rows)

boundaryNovel = rank(all) - rank(homogeneous)
homogeneousNovel = rank(all) - rank(boundary)
```

Also report exact min/max boundary-novel dimension over the held-out family.

## Boundary

No curvature row changes.

No field changes.

No signature changes.

No W/D/L label changes.

No threshold or candidate coordinate is introduced.

This correction only completes the robustness calculation already required by the frozen second-order experiment design.
