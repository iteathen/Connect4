# UC4A latent-structure tomography field dictionary 0.1

**Date:** 2026-10-01  
**Status:** frozen structural dictionary before outcome join  
**Design:** `UC4A_LATENT_STRUCTURE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md`

## Boundary

This dictionary is frozen before tomography execution. The structural producer may consume only board dimensions from the 52-board unsealed K=4 geometry cohort. It does not load either outcome-bearing source artifact, a solver, an oracle, a best-move table, BSFP values, or production CPC.

The two sealed formula holdouts are outside the cohort. `Q` remains missing rather than being inferred from W/D/L. Standard-7x6-only middle-core results are preserved as scoped metadata but are excluded from cross-board rank matrices because they have no frozen generalized construction.

## G — generated geometry / orientation

For each W x H board, generate every exact length-4 horizontal, vertical, rising-diagonal and falling-diagonal winning line. Record W, H, cell count, orientation start-domain dimensions, orientation line counts, total line count, width/height/cell parity, and exact fixed-line/fixed-cell counts under left-right reflection, geometric top-bottom reflection, and 180-degree rotation.

Left-right reflection is the gameplay-compatible board symmetry. Top-bottom reflection is retained only as a geometric diagnostic because gravity breaks it strategically.

## I — incidence / core algebra

Build the GF(2) winning-line-to-cell incidence family and compute its rank directly. Cross-check the previously frozen closed form

`rank(B) = W*H - 9 + min(2,(W-3)(H-3))`.

Record incidence rank, kernel dimension, diagonal residue rank, the row/column axis quotient ranks, the actual vertical-line-parity quotient rank on `ker(B)`, `Y_cell`, `Y_line`, core delta/sign, and fixed-subspace dimensions of both cores under left-right reflection, geometric top-bottom reflection, and 180-degree rotation.

The producer constructs bases for `im(B)` and `ker(B)` mechanically. `Y_cell` is the kernel of row-plus-column parity restricted to `im(B)`. `Y_line` is the kernel of pure-vertical-line parity restricted to `ker(B)`. Closed-form rank identities are runtime cross-checks only where their hypotheses hold; the producer never obtains a core dimension by subtracting an assumed quotient rank.

## R — residual hierarchy

From the generated C4 line family, construct every unique degree-3, degree-2 and degree-1 residual fragment by exact face deletion. Record C4/C3/C2/C1 counts and exact GF(2) ranks/nullities of the aggregate boundary maps `d4->d3`, `d3->d2`, and `d2->d1`. Verify mechanically that the aggregate boundary squares to zero.

These are homological aggregate residual summaries only. They are not promoted to marked/sequential cofactor semantics. The qualified standard 7x6 `28 -> 21` middle result is retained only at 7x6 as scoped metadata; no generalized 28/21 coordinate is invented.

## P — phase / path / control

Record width-path phase dimension `W-1`, path radius, center columns, the complete one-move safe-entry set, safe-entry count/class, safe derivative-word count and terminal automaton state counts, safe phase-word count, path-boundary rank/nullity, all unordered two-column displacement generator count/rank/nullity, the top-defect module dimension, charge-quotient dimension, phase-radius parity, and exact safe-entry boundary-lift vectors.

Safe derivative words are generated from the exact forbidden-subword criterion: neither `000` nor `111` may occur. One-move safe entries are therefore computed rather than read from a board-outcome table.

## C — response / capacity

Record the frozen elementary response-frontier count, neutral-pair capacity, unordered pair-response generator count/rank/nullity, one-setup top-defect weight/parity/class, and the two unconstrained defect-charge orbits.

A generalized exact response-matroid summary is not currently frozen for every board geometry. That field remains null; no surrogate is fitted from W/D/L.

## D — deadline / depth

From exact generated winning lines, record bottom-frontier line incidence by column, total frontier incidence, positive-depth line incidence, maximum initial impact/count/columns, the complete line-cell incidence depth histogram, even/odd row incidence totals, maximum support depth, vertical parity period, finite physical event horizon, post-one-setup horizon, same-column pair-layer capacities, and unmatched one-setup top weight.

These are current geometry/support-depth quantities. They are not exact game remoteness.

## Q — recursive structural quotient

`Q.available = false` for tomography 0.1. No outcome-blind scalable recursive root quotient has been frozen across the complete 52-board cohort. Missing values remain missing.

## Frozen cross-board analysis registry

The structural output contains an explicit registry of scalar integer fields, GF(2) fields, categorical fields, vector fields and block order. Phase-B tomography must consume that registry exactly. It may not add a coordinate after reading W/D/L.

The standard-only 7x6 middle metadata, null Q fields, and other nonuniform fields are excluded from cross-board rank matrices. Vector and typed-block objects remain intact for equality/change/circuit attribution rather than being silently flattened into fitted scalar scores.
