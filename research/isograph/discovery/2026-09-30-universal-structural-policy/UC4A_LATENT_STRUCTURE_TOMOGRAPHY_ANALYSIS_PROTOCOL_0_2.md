# UC4A latent-structure tomography analysis protocol 0.2

**Date:** 2026-10-01  
**Status:** frozen Phase-B analysis protocol after pre-label structural correction; no analysis operator changed  
**Structural atlas:** `UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_0_1.json`  
**Structural atlas SHA-256:** `49844e4772a337d92ab10735d8bc13d1c5570edb6a1b382d4fb0660205d21760`

## Supersession note

Protocol 0.1 pinned the first structural atlas. Before any Phase-B label analysis executed, `UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_CORRECTION_0_1.md` found a qualified-range defect in the shortcut used for `Y_line` on 4x4 and 4x5. The structural producer was corrected outcome-blind and regenerated.

The old atlas hash `bfcc2e0c8fc2675070e281554ea5385b50f118e894cd6ce308de2975e09febed` is superseded. Protocol 0.2 changes only the pinned structural atlas identity; Views 1–6, neighbor definitions, quotient normalization, rank methods, separator rules, and holdout discipline are unchanged from 0.1.

## Purpose

Execute Views 1–6 from the frozen tomography design against the already committed 52-board outcome-blind structural atlas. Outcome labels are joined only in this phase and may classify already-constructed rows/edges; they may not create, tune, discretize, or remove structural coordinates.

## Label sources

Only the two previously approved unsealed descriptive sources may be consumed:

- `UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS_RESULT_0_1.json` — 37 frozen original rows;
- `UC4A_FRESH_BOARD_VALIDATION_ONE_COORDINATE_REPAIR_RESULT_0_1.json` — 15 fresh rows.

The analysis must require exactly 52 distinct labels matching exactly the 52 structural row keys.

The sealed formula holdouts remain forbidden.

## Scalar registry

Rank/circuit/separator analysis consumes exactly the scalar integer, GF(2), and categorical registries already frozen inside the structural atlas. Vector fields remain typed objects for equality/change/support attribution and are not silently flattened into fitted scalar coordinates.

The standard-only 7x6 middle metadata, null response-matroid field, and unavailable Q block stay outside cross-board matrices.

## Neighbor relation

A **unit geometry edge** is a pair of cohort boards differing by exactly one in W or H and equal in the other dimension.

These unit edges define the primary delta matrices for View 2 and View 4.

View 1 additionally records consecutive available boards along each fixed-width or fixed-height solved strip, even when a source gap makes the dimension jump exceed one. Each trajectory edge records its dimension step so unit, gap, and same-parity-by-two changes remain distinguishable.

## View 1 — growth trajectories

Freeze fixed-W and fixed-H trajectories from structural rows first. Afterward attach outcomes and record:

- outcome transition;
- dimension step;
- complete scalar delta;
- changed/unchanged scalar fields;
- changed/unchanged typed blocks;
- vector-field equality changes.

Special reports are emitted for unit changes and same-parity changes of two.

## View 2 — outcome-boundary derivative census

For every unit geometry edge, compute the frozen structural delta first and then classify it into one of the nine W/D/L transition classes.

For each transition class report:

- edge count;
- distinct exact scalar delta signatures;
- repeated signatures;
- scalar fields invariant across the class;
- scalar fields nonzero on every member;
- smallest common typed block support;
- orientation distribution (width/height).

Reverse transition classes are not algebraically identified by label. Their signed deltas are retained exactly for comparison.

## View 3 — blind structural quotient refinement

Two refinements are reported.

### 3A literal exact block refinement

Apply G → I → R → P → C → D → Q using complete frozen block objects. This is required by the design even though complete G contains W/H identity and can therefore singletonize the cohort. Singletonization is reported as an anti-memorization warning, not as a successful outcome theorem.

### 3B identity-suppressed structural refinement

To expose reusable structure rather than board identity, run a second outcome-blind partition with a predeclared identity-suppression projection:

- remove G.width, G.height, G.cells, G.startDomainDimensions;
- retain all other frozen G structural fields;
- retain I/R/P/C/D exactly except fields explicitly null/missing;
- keep Q unavailable.

This projection only removes direct board-name encodings. It adds no feature and is frozen before labels are joined.

At every stage, freeze the partition first, then overlay outcomes and report mixed/pure cells, singleton cells, smallest mixed witnesses, and the fields/blocks that first split a witness at the next stage.

Leave-one-block-out ablations use the same identity-suppressed signatures.

## View 4 — latent rank and circuit analysis

For scalar integer delta matrices compute exact rational rank. Also compute Smith-normal-form diagonal invariants where the integer matrix dimension is tractable.

For GF(2) delta matrices compute exact rank and nullspace.

Run each algebra on:

- all unit edges;
- outcome-changing unit edges;
- outcome-preserving unit edges.

Report:

- all rank;
- boundary rank;
- preserving rank;
- boundary-novel dimension = rank(all) - rank(preserving);
- preserving-novel dimension = rank(all) - rank(boundary);
- per-block ranks;
- leave-one-width-out and leave-one-height-out boundary-rank stability.

Circuits are dependencies among frozen scalar coordinate columns. Enumerate inclusion-minimal GF(2) dependency supports when the nullspace dimension permits exact enumeration; otherwise preserve the exact nullspace basis and mark minimal-circuit enumeration bounded. For rational/integer columns, preserve exact nullspace basis supports and remove basis supports that strictly contain another discovered support; do not claim completeness unless exhaustive enumeration is performed.

No rank target, including rank 3, is supplied to the algorithm.

## View 5 — contrast pairs and minimal separators

For every pair of boards, record scalar fields equal/different. Split only afterward into same-outcome and different-outcome pair families.

Build an exact antichain of inclusion-minimal scalar-field hitting sets that separate every different-outcome board pair. Preserve all incomparable minimal hitting sets up to a declared safety bound; if the antichain exceeds that bound, emit the bound and truncation status rather than selecting one "best" feature set.

Also report per-field same-outcome and different-outcome separation frequencies. These are descriptive only.

## View 6 — triangle/circuit topology without axis naming

Use every unit W/H square with all four vertices present. Form both oriented L-triangles in each square.

For each triangle record:

- exact pair deltas;
- exact numeric circuit closure;
- GF(2) circuit closure;
- changed primitive block support on each edge;
- union/intersection of contributing blocks;
- signed width/height exchange orientation;
- whether zero, one, two, or three triangle edges cross an outcome boundary;
- vertex outcome pattern.

Group triangles by outcome-boundary count and structural block-support topology.

Circuit closure is an identity of pairwise differences; its value is in the recurring support/orientation topology, not in treating closure itself as evidence of a special rank.

## Holdout/stability reports

The analysis emits:

- leave-one-width-out boundary ranks;
- leave-one-height-out boundary ranks;
- source chronology split (original 37 versus fresh 15) for separator reuse where applicable;
- explicit 8x6 / 9x6 / 10x6 trajectory report;
- earliest/smallest repeated-delta counterexamples for any apparent class invariant.

No feature may be added during this phase.

## Result boundary

The output is descriptive tomography evidence. A low-rank boundary, pure quotient, or minimal separator is not a theorem of Connect Four value. Any candidate internal shape must later be rederived from UC4A/RLC current-state structure without W/D/L premises.
