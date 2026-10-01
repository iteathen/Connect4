# UC4A I/P regime-subspace tomography experiment design 0.1

**Date:** 2026-10-01  
**Status:** frozen label-free regime-subspace design before execution  
**Branch:** research/universal-structural-policy-20260930  
**Structural source:** UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json  
**Structural atlas SHA-256:** 374d744378bf71b77db0711d1eb2ef4a21ec1cb4c80736aa206abd4520dd1aa9

## Motivation

The label-free raw-mode bridge rejected the simplest model for the main localized curvature direction:

~~~text
localized quotient direction
=
one / two / three raw unlabeled curvature modes
~~~

The prior localization direction was originally created by quotienting one structural population by another structural span.

The next appropriate structural question is therefore not another raw-mode fit.

It is:

> What exact quotient/defect directions arise naturally between the already-frozen geometry-only parity, threshold, and finite-boundary regime subspaces?

This experiment is completely outcome-blind.

## Hard boundary

The producer may open only:

UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json

It must not open:

- UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json;
- UC4A_IP_SYMMETRY_PHASE_BRIDGE_0_1.json;
- any W/D/L table;
- any solver/oracle result;
- any best-move table;
- any BSFP solved frontier.

No structural field may be added.

Production CPC, JSMinSys, and BSFP remain unchanged.

## Vector space

Use exactly the frozen Phase-A integer I/P curvature fields:

structural.fieldRegistry.ipIntegerFields

Do not include outcome annotations or construct a new scalar score.

The natural field order remains fixed from the Phase-A atlas.

## Exact geometry-only regimes

Reuse exactly the tags already frozen on every Phase-A curvature row:

- family = WIDTH2 / HEIGHT2 / MIXED;
- anchorWidthParity;
- anchorHeightParity;
- touchesWidth4;
- touchesHeight4;
- safeEntryThresholdRelation = BELOW / CROSS / ABOVE.

No regime is selected after examining a localization artifact.

Each exact tag tuple defines one regime subspace as the rational row span of all I/P curvature rows carrying that tag.

## Part 1 — regime subspace census

For every exact regime:

- row count;
- exact rational rank;
- deterministic RREF basis;
- exact nullspace dimension;
- exact projective row-mode count.

Also record the family-wide parent rank.

Singleton regimes remain singleton regimes; do not merge them for convenience.

## Part 2 — controlled regime adjacencies

Within each curvature family, compare only regime pairs that agree in every tag except one declared axis.

### Width-parity adjacency

Same:

- anchorHeightParity;
- touchesWidth4;
- touchesHeight4;
- safeEntryThresholdRelation.

Opposite anchorWidthParity.

### Height-parity adjacency

Same:

- anchorWidthParity;
- touchesWidth4;
- touchesHeight4;
- safeEntryThresholdRelation.

Opposite anchorHeightParity.

### Safe-entry-threshold adjacency

Same:

- anchorWidthParity;
- anchorHeightParity;
- touchesWidth4;
- touchesHeight4.

Compare only adjacent threshold states in the frozen order:

BELOW <-> CROSS
CROSS <-> ABOVE

Do not compare BELOW directly with ABOVE in this adjacency class.

### Finite width-boundary adjacency

Same:

- anchorWidthParity;
- anchorHeightParity;
- touchesHeight4;
- safeEntryThresholdRelation.

Compare touchesWidth4 false versus true.

### Finite height-boundary adjacency

Same:

- anchorWidthParity;
- anchorHeightParity;
- touchesWidth4;
- safeEntryThresholdRelation.

Compare touchesHeight4 false versus true.

## Part 3 — exact subspace geometry

For every controlled regime pair A,B compute:

- rank(A);
- rank(B);
- rank(A+B);
- dim(A intersection B) = rank(A)+rank(B)-rank(A+B);
- A-only quotient dimension = rank(A+B)-rank(B);
- B-only quotient dimension = rank(A+B)-rank(A);
- Grassmann distance = rank(A)+rank(B)-2*dim(intersection).

These are exact rational subspace quantities.

## Part 4 — directed defect quotient directions

For every directed comparison A -> B:

1. build the deterministic RREF basis of A;
2. reduce every original B row modulo span(A);
3. retain every nonzero residual;
4. primitive-normalize each rational residual to a projective integer direction;
5. group repeated residual directions;
6. report the residual quotient rank.

The residual quotient rank must equal:

rank(A+B)-rank(A)

or the run fails.

Repeat B -> A independently.

The deterministic RREF complement is an analysis coordinate, not a canonical game invariant.

## Part 5 — recurring defect atlas

Across all controlled regime comparisons, group identical projective defect directions.

For every defect direction report:

- comparison-axis classes in which it occurs;
- curvature families;
- source/target regime tags;
- recurrence count;
- I/P field support;
- rows producing it;
- whether it occurs outside the old solved region.

Define old solved region only geometrically for this recurrence diagnostic:

~~~text
4 <= W <= 12
4 <= H <= 13
~~~

No solved-value membership is consulted.

A defect direction is "extended-grid recurring" iff at least one producing neighborhood contains a board with W>12 or H>13.

## Part 6 — interior generic sector

Define the generic interior sector outcome-blind as:

~~~text
touchesWidth4 = false
touchesHeight4 = false
safeEntryThresholdRelation = ABOVE
~~~

Do not restrict parity.

For each family:

- rank of the full generic interior sector;
- ranks of its four parity cells;
- pairwise parity-cell intersections/distances;
- directions added or removed across width-parity and height-parity changes.

This is the candidate background mode algebra for large boards after safe-entry exhaustion and away from finite lower-size boundaries.

## Strong success condition

A strong structural result would be:

- low quotient dimensions between parity/threshold regimes;
- a small set of defect directions recurring across many disjoint dimensions;
- the same defects reappearing beyond W=12/H=13;
- stable defect support concentrated in already-derived I/P primitives.

This would establish a compact label-free regime-transition algebra suitable for later bridge comparison.

## Strong failure condition

If regime comparisons produce high-dimensional, nonrepeating defect quotients with no extended-grid reuse, preserve that result.

Do not add a fitted coordinate.

## Phase-B bridge rule

Only after this regime-subspace atlas is frozen and committed may a separate bridge analyzer open:

- the regime-subspace result;
- UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json.

That later bridge may ask whether localized quotient directions equal or lie in small spans of **regime-defect directions**.

This structural phase must not know any localization direction ID, coordinate support, or ratio.

## Claim boundary

This experiment cannot establish:

- W/D/L from geometry;
- a final Outcome-Formation Triangle;
- an intrinsic outcome rank;
- semantic meaning for any later matched direction;
- a production CPC rule;
- a BSFP value premise;
- an optimal-move theorem;
- a Connect Four solution.
