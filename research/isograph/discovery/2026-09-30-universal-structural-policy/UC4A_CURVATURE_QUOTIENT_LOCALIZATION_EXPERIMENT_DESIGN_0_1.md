# UC4A curvature quotient localization experiment design 0.1

**Date:** 2026-10-01  
**Status:** frozen localization design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source evidence

Consume only:

- `UC4A_SECOND_ORDER_CURVATURE_STRUCTURAL_0_1.json`
- `UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_0_1.json`

with the curvature rows and labels already frozen in that order.

No new board outcome is introduced and no structural coordinate is added.

## Purpose

The second-order curvature experiment found a nonzero integer boundary quotient but no corresponding combined GF(2) quotient.

Full-cohort integer dimensions are:

```text
WIDTH2:   all 9, boundary 8, homogeneous 6, boundary-novel 3
HEIGHT2:  all 5, boundary 3, homogeneous 4, boundary-novel 1
MIXED:    all 6, boundary 4, homogeneous 4, boundary-novel 2
COMBINED: all 12, boundary 11, homogeneous 10, boundary-novel 2
```

The goal is to locate those quotient directions inside the already-frozen UC4A vocabulary without naming semantic axes in advance.

## Part 1 — exhaustive block-subset localization

For each family and COMBINED, and separately for integer and GF(2) curvature:

1. enumerate every nonempty subset of available blocks G/I/R/P/C/D;
2. project every frozen curvature row to exactly those block fields;
3. compute:
   - all rank;
   - boundary-adjacent rank;
   - homogeneous rank;
   - boundary-novel dimension = all rank - homogeneous rank;
4. preserve every inclusion-minimal block subset that attains the full-space boundary-novel dimension.

No block subset is hand-selected.

If the full novelty is zero, report all singleton/block ranks but do not manufacture a carrier.

## Part 2 — canonical quotient residuals

For each family and COMBINED over the integer curvature algebra:

1. compute exact rational RREF of the homogeneous row span H using the frozen integer field order;
2. reduce every boundary-adjacent row modulo H;
3. retain the exact rational residual vector as a deterministic coordinate in the chosen RREF complement;
4. verify that residual rank equals the measured boundary-novel dimension;
5. normalize every nonzero residual projectively by dividing through its first nonzero coordinate;
6. group exact normalized quotient directions.

For every quotient direction report:

- row count;
- frozen curvature row IDs;
- families represented;
- outcome-neighborhood words represented;
- nonzero field support;
- nonzero UC4A block support.

This coordinate is a deterministic analysis representation, not a claimed canonical game invariant.

## Part 3 — primitive-field subset census

For integer curvature, exhaustively enumerate all frozen field subsets of sizes 1, 2, and 3.

For each family and COMBINED:

- compute the boundary-novel dimension of every subset;
- preserve all inclusion-minimal subsets of size <=3 that attain the full-space boundary-novel dimension;
- if none attain it, report the maximum achieved at each subset size and do not extend the search order in this experiment.

Do not select one “best” subset.

Every surviving field subset is a descriptive candidate only and must retain its full list of alternatives.

## Part 4 — held-out reuse

For every inclusion-minimal block subset and every inclusion-minimal field subset from Part 3:

- recompute its boundary-novel dimension after leaving out each width;
- recompute after leaving out each height;
- report exact min/max and every fold.

Do not discard unstable candidates.

## Part 5 — relation to the 8x6 / 9x6 / 10x6 witness

Reduce the frozen WIDTH2 curvature row:

`8x6|9x6|10x6`

modulo the WIDTH2 homogeneous span.

Report:

- whether its quotient residual is zero;
- its quotient direction ID if nonzero;
- other boundary rows sharing the same normalized quotient direction;
- whether the direction survives after excluding height 6 or any one of widths 8, 9, 10.

This tests whether the 10x6 witness is an instance of a broader quotient mode rather than merely a unique full curvature signature.

## Success condition

Useful evidence would include:

- a small inclusion-minimal block carrier for the full boundary quotient;
- a small field subset reproducing the quotient without identity-like geometry magnitudes;
- recurring quotient directions shared across unrelated W/H families;
- survival under held-out dimensions;
- agreement between the 10x6 witness and other boundary neighborhoods in quotient space.

## Failure condition

Useful negative evidence includes:

- full novelty requiring most blocks;
- no <=3-field subset reproducing the quotient;
- quotient directions unique to individual geometry neighborhoods;
- loss of the direction under ordinary width/height holdouts;
- localization dominated by raw board-identity fields.

## Boundary

This experiment does not establish a final Outcome-Formation Triangle or a value theorem.

It uses W/D/L only to define the already-frozen boundary/homogeneous partition. Any localized field relation must later be rederived structurally without W/D/L premises before gameplay use.

Production CPC, JSMinSys, and BSFP remain unchanged. The sealed formula holdouts remain untouched.
