# UC4A I/P regime-defect bridge protocol 0.1

**Date:** 2026-10-01  
**Status:** frozen before bridge execution  
**Branch:** research/universal-structural-policy-20260930

## Frozen sources

Structural mechanism source:

UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json

Required regime atlas SHA-256:

7ce03e10c6ca122f51e44d817d23fc71270d35a9b826cce74a92e49a8f59ecbe

Descriptive localization source:

UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json

Required curvature atlas SHA-256:

58ac628a545a434f176e84c834b03f145a7efaf86f2389abb106465b13ea99b3

## Boundary

The bridge may open only the two frozen files above.

It must not open raw W/D/L sources, solvers, oracle outputs, best-move tables, or BSFP solved frontiers.

No structural coordinate may be added.

The bridge coordinate space is exactly:

regime.fieldRegistry.fields

which is the previously frozen integer I/P curvature vocabulary.

A localization field absent from that registry makes the direction out-of-space.

Do not project it away and do not repair the structural experiment.

## Target translation

Localization direction coordinates already using I/P names are copied exactly.

No coefficient is fitted.

Fractions are retained exactly over Q.

Every nonzero target vector is primitive-normalized only for projective comparison.

## Structural defect vocabulary

Use exactly:

regime.part5.recurringDefects

Every defect direction is embedded in the frozen I/P field order.

No defect is selected by target proximity before the test.

## Test order

For every in-space localization direction:

1. test exact projective equality against every structural defect;
2. if absent, test every unordered pair of defects for exact span membership;
3. if absent, test every unordered triple;
4. stop at the first successful order and preserve every minimal spanning set at that order;
5. if absent through order 3, preserve failure.

Do not inspect or optimize toward a named target before this order is frozen.

## Same-family report

For each target also run a stricter comparison using only defects whose occurrence families contain the target curvature family.

For COMBINED localization directions, the same-family report equals the global report because COMBINED contains all curvature families.

## Recurrence report

For every matched/spanning structural defect report:

- occurrence count;
- producing row count;
- adjacency axes;
- curvature families;
- extended-grid recurrence.

For every minimal spanning set report whether every member is extended-grid recurring.

## Focus report

The previously held-back row:

WIDTH2:8x6|9x6|10x6

is identified only from the frozen localization result.

Report:

- its localization direction ID;
- exact target coordinates;
- exact structural defect match if one exists;
- otherwise minimum defect-span order <=3;
- recurrence of every matched defect.

No additional 10x6-specific feature is permitted.

## Success condition

A compelling bridge result is an exact match or low-order span between a localized descriptive quotient direction and a defect direction independently generated from geometry-only regime subspaces, especially if the defect recurs beyond W=12/H=13.

That would establish a structural mechanism candidate without making the localization label itself a theorem premise.

## Failure condition

If a bridgeable localization direction is absent through three structural defects, preserve the failure.

If it uses fields outside the frozen I/P regime space, report out-of-space.

## Claim boundary

Even an exact bridge match does not establish:

- W/D/L from geometry alone;
- causality of the matched defect;
- a final Outcome-Formation Triangle;
- an intrinsic outcome rank;
- an optimal-move theorem;
- a production CPC rule;
- a BSFP value premise;
- a Connect Four solution.
