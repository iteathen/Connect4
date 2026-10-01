# UC4A I/P symmetry-phase mechanism rederivation experiment design 0.1

**Date:** 2026-10-01  
**Status:** frozen label-free structural rederivation design before execution  
**Branch:** research/universal-structural-policy-20260930

## Motivation

The completed curvature localization narrows the descriptive integer boundary quotient to:

~~~text
WIDTH2    I + P
HEIGHT2   I
MIXED     I
COMBINED  I + P
~~~

and exposes one recurring RREF-complement direction supported by rotation-180 fixed dimensions of Y_cell and Y_line.

That direction was discovered through a W/D/L-defined boundary/homogeneous quotient and is therefore not a gameplay premise.

The next task is to determine whether the observed localization can be explained by independently generated, outcome-free geometry modes.

## Hard boundary

Phase A must not open:

- any W/D/L table;
- UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_0_1.json;
- UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json;
- any solver/oracle result;
- any best-move table;
- any BSFP solved frontier.

Phase A consumes geometry only.

Only after the extended structural mode atlas and hashes are committed may Phase B read the localization result for bridge comparison.

Production CPC, JSMinSys, and BSFP remain unchanged.

The sealed formula holdouts are irrelevant to this geometry-only grid and remain untouched.

## Extended control grid

Generate every K=4 rectangle:

~~~text
4 <= W <= 16
4 <= H <= 16
~~~

for 169 board geometries.

No root outcome is requested or inferred for any board.

This deliberately extends beyond the solved 52-board descriptive cohort.

## Phase-A structural vocabulary

### G context

Record only geometry/symmetry context needed to classify modes:

- W, H;
- width parity;
- height parity;
- cell parity;
- left-right fixed cell count;
- top-bottom fixed cell count;
- 180-degree fixed cell count;
- left-right fixed winning-line count;
- top-bottom fixed winning-line count;
- 180-degree fixed winning-line count.

### I — exact middle/core symmetry

Mechanically rebuild from generated winning lines:

- rank(B);
- dim ker(B);
- row/column axis quotient rank;
- vertical-line phase quotient rank on ker(B);
- Y_cell dimension;
- Y_line dimension;
- core delta;
- left-right fixed dimensions of Y_cell and Y_line;
- geometric top-bottom fixed dimensions of Y_cell and Y_line;
- 180-degree fixed dimensions of Y_cell and Y_line.

Do not recover these fields from the old 52-board JSON.

Recompute them independently from explicit GF(2) bases.

### P — path/phase structure

Record:

- phase dimension;
- path radius;
- center count;
- safe-entry count;
- safe-entry columns;
- safe derivative-word count;
- safe phase-word count;
- pair-displacement generator count;
- pair-displacement rank;
- pair-displacement nullity;
- top-defect module dimension;
- phase-radius parity.

## Curvature operators

After all 169 board rows are frozen, generate:

- WIDTH2 curvature for every W,W+1,W+2 at fixed H;
- HEIGHT2 curvature for every H,H+1,H+2 at fixed W;
- MIXED curvature on every unit W/H square.

Use ordinary integer second derivatives and XOR second derivatives exactly as in the prior tomography.

No outcome annotation exists in Phase A.

## Frozen geometry-only regime tags

Every curvature row receives tags derived only from its board coordinates:

- family;
- anchor width parity;
- anchor height parity;
- whether any board touches W=4;
- whether any board touches H=4;
- safe-entry threshold relation:
  - BELOW if every involved width is <8;
  - CROSS if the neighborhood contains widths on both sides of 8;
  - ABOVE if every involved width is >=8.

These tags are frozen before any localization artifact is opened.

## Phase-A mode census

Using the complete frozen I+P integer curvature vector and its natural GF(2) subset:

1. compute exact rank by family;
2. compute exact rank by frozen geometry-only regime;
3. group exact curvature signatures;
4. group projective integer directions;
5. preserve row IDs and regime tags for every mode;
6. repeat a dedicated reflection-sector census using all six core-reflection fixed dimensions together, not a hand-selected pair;
7. report all exact linear dependencies among the reflection-sector columns;
8. identify safe-entry curvature support without using outcome information.

No target ratio, including 1:1/3, is supplied to Phase A.

## Phase-A strong question

Does the extended unlabeled geometry itself collapse into a small parity/threshold mode algebra inside I/P?

Strong positive structural evidence would be:

- a small finite set of recurring projective curvature modes;
- exact recurrence by width/height parity sectors;
- special modes localized to known structural thresholds such as finite safe-entry exhaustion;
- stability across the expanded unsolved grid.

Strong negative evidence would be high mode proliferation or failure to reuse modes outside the old solved cohort.

## Phase-B bridge comparison

Only after the Phase-A atlas is committed may the bridge analyzer read:

- UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json;
- UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json.

It must not read raw W/D/L sources.

Define a bridge coordinate space before reading the localization file from the Phase-A vocabulary:

- G symmetry fixed-cell/fixed-line counts;
- all I middle/core dimensions and all six core-reflection fixed dimensions;
- all P path/safe-entry integer quantities.

For every canonical localization quotient direction whose support lies entirely inside this bridge space:

1. test whether it exactly equals a raw unlabeled projective mode;
2. if not, test whether it lies in the span of one unlabeled mode;
3. then every unordered pair of unlabeled modes;
4. then every unordered triple;
5. preserve every inclusion-minimal spanning mode set of size <=3;
6. report the geometry-only regimes represented by those modes.

If no size <=3 mode set spans the direction, report failure and stop at order 3.

Directions with support outside the frozen bridge coordinate space are reported as out-of-space rather than projected or repaired.

## Required focus

The prior 8x6/9x6/10x6 localization direction is a held-back bridge target only in Phase B.

Phase A must not know its direction ID, support, ratio, or outcome word.

Phase B reports:

- whether the target is a raw unlabeled mode;
- its minimum unlabeled mode-span size <=3;
- every minimal spanning mode combination;
- whether those modes recur outside all widths 8,9,10 and outside height 6.

The point is to determine whether the prior quotient direction is a general structural parity/threshold combination rather than a special outcome coordinate.

## Success condition

A compelling rederivation would show that the localized I/P quotient directions are generated by a small, independently frozen unlabeled mode algebra that recurs widely outside the solved cohort.

That would explain the primitive mechanism without using W/D/L as a premise.

## Failure condition

If the localization directions cannot be generated by the extended unlabeled mode algebra at order <=3, or require modes unique to the old solved geometry region, preserve that failure.

Do not add a fitted structural coordinate.

## Claim boundary

This experiment cannot establish:

- W/D/L from geometry alone;
- a final Outcome-Formation Triangle;
- an intrinsic outcome rank;
- a production CPC rule;
- a BSFP value premise;
- an optimal-move theorem;
- a Connect Four solution.
