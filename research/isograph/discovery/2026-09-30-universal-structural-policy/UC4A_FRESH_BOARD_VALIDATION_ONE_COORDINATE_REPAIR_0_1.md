# UC4A fresh board validation and one-coordinate repair 0.1

**Date:** 2026-10-01  
**Status:** frozen post-census validation experiment  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Freshly test the structural triples discovered on the original 37-board UC4A census against solved board geometries not present in that training table.

The structural vocabulary remains exactly the one frozen in:

`UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS_0_1.md`

No new structural feature may be added in response to validation failures.

## Fresh external source

Use the published result table in:

`ChristopheSteininger/c4`

The source states that it extends John Tromp's board-size results with all board sizes satisfying (W+H=16) and additional larger cases.

Outcome labels are validation/discovery only.

Fresh rows absent from the original frozen 37-board table:

- 12x4  -> P2 win
- 11x5  -> P1 win
- 10x6  -> P1 win
- 9x7   -> P1 win
- 7x9   -> draw
- 8x9   -> P1 win
- 6x10  -> P2 win
- 7x10  -> P1 win
- 5x11  -> draw
- 6x11  -> P1 win
- 4x12  -> draw
- 5x12  -> draw
- 6x12  -> P2 win
- 4x13  -> draw
- 5x13  -> draw

The sealed formula holdouts remain untouched and are not in this set.

## Baseline discovered triples

The original 37-board census found two exact-pure triples:

[
T_1=(	ext{heightParity},	ext{safeEntryCount},	ext{coreDeltaSign})
]

and

[
T_2=(	ext{safeEntryCount},	ext{coreDeltaSign},	ext{topDefectClass}).
]

For fresh validation, a prediction is allowed only when the fresh signature occurred in the 37-board training set and that training signature was outcome-pure.

Unseen signatures are reported as uncovered, not guessed.

## Repair protocol

If a baseline triple develops a mixed signature after adding the fresh rows:

1. identify the complete mixed board family;
2. preserve it as the falsifier;
3. refine the baseline triple by adding exactly one feature from the **already frozen 21-feature vocabulary**;
4. test every eligible one-feature refinement;
5. rank refinements by:
   - zero mixed cells first;
   - then more pure rows;
   - then fewer signature cells;
   - then lexicographic feature name.

No new quantity may be introduced in this experiment.

## Interpretation boundary

A repaired four-field signature may still represent only **three conceptual UC4A objects** if two fields are coordinates of the same structural subsystem.

For example, `safeEntryCount` and `phaseRadiusParity` are both width-path / phase-geometry coordinates and may belong to one vector-valued phase object.

This possibility may be discussed only after the mechanical refinement audit.

## Falsifiers

- either original triple predicts a fresh known board incorrectly;
- all one-feature refinements retain mixed cells;
- a repair depends only on near-unique board identity;
- fresh signatures are mostly unseen, making apparent accuracy vacuous.

## Scope

This is discovery evidence only.

No repaired signature is a W/D/L theorem, generalized Connect-Four solution, production move-finder rule, or authorization to inspect sealed holdouts.
