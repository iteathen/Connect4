# UC4A latent-structure tomography experiment design 0.1

**Date:** 2026-10-01  
**Status:** frozen broad discovery design; not yet executed  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Draw out the internal structural shape of the Universal Connect-Four Algebra (UC4A) without testing a favored candidate triangle.

The experiment is designed to answer:

> When board geometry changes and the root game-theoretic outcome changes among P1-win / draw / P2-win, what primitive UC4A structures change with it, what structures remain invariant, and what dimension/rank does the outcome-boundary structure actually have?

The number three must be allowed to emerge or fail. No rank-3 hypothesis is built into the producer.

## Motivation from the first outcome census

The first 37-board census found two outcome-pure three-feature signatures using only predeclared UC4A structural quantities.

Fresh validation on 15 additional solved geometries produced one decisive collision:

`8x6, 9x6 -> P2 win`
versus
`10x6 -> P1 win`

inside the same coarse cell for the strongest original triples.

One already-frozen coordinate, `phaseRadiusParity`, separates the combined 52-row table without adding a validation-invented feature.

This is evidence that the board-outcome classes carry real structural organization, but it is also a falsifier of treating the first coarse triangle as universal.

The next step should therefore widen the structural observation space rather than nominate another hand-selected triangle.

## Outcome discipline

Structural data are produced first.

W/D/L labels are joined only after the complete structural table and all comparison operators are frozen.

Sources may include only unsealed board outcomes.

The sealed formula holdouts remain untouched:

- `3x6-k4`
- `5x3-k4`

No label may select, tune, prune, discretize or normalize a structural coordinate.

## Cohort design

### Primary cohort: Connect-4, varying rectangle geometry

Use every unsealed solved `W x H, K=4` board available from frozen/public sources.

Prefer complete width/height strips where possible because adjacent geometries are especially informative.

### Secondary cohort: rule-length perturbation

Only after the K=4 analysis is frozen, repeat the same structural operators on unsealed complete small controls with altered `K`.

Do not mix K-values into the first fit. K-variation is a falsifier/generalization stage.

## Structural fingerprint blocks

Do not flatten immediately to one scalar vector. Preserve typed blocks.

### G — generated geometry / orientation

Record exact:
- horizontal line count
- vertical line count
- rising diagonal count
- falling diagonal count
- total line count
- orientation-resolved start-domain dimensions
- H/V intersection dimensions where defined
- diagonal residue rank
- symmetry/reflection fixed dimensions where already derived

H/V/D is therefore measured, but not privileged.

### I — incidence / core algebra

Record:
- `rank(B)`
- `dim ker(B)`
- axis quotient ranks
- `Y_cell`
- `Y_line`
- `Y_line - Y_cell`
- parity and sign of these quantities
- natural quotient/core dimensions already proved by total-domain formulas

### R — residual hierarchy

Where symbolic formulas exist, record:
- degree-4 line space
- degree-3 residual image/core dimensions
- CPC/frontier quotient rank exposed by residualization
- available degree-2 / degree-1 structural ranks
- connected/split residual topology counts if derivable without outcome labels

Preserve degree and attachment; do not reduce to total residual count alone.

### P — phase / path / control substrate

Record:
- column-path phase dimension
- center count
- path radius
- safe-entry set, not just its cardinality
- safe-entry cardinality
- phase-word/derivative automaton counts
- response-generator rank/nullity
- unmatched-defect charge class
- finite-boundary lift class
- neutral-pair reservoir counts

### C — response / capacity structure

Record:
- elementary response-frontier size
- pair-response resource counts
- response-relation rank/nullity
- safe bulk/top-boundary defect dimensions
- any exact symbolic response-matroid rank summaries available from geometry alone

### D — deadline / depth structure

Record:
- frontier-versus-positive-depth partitions that are derivable from the board family/setup
- support-depth periodicities
- earliest possible unmatched/boundary event ranks in canonical structural policies
- finite-height truncation quantities
- any exact max/min structural horizon formulas already established

### Q — quotient / recursive structural complexity

Only where constructible without outcome labels:
- action-unlabelled quotient dimensions
- recursive closure depth
- phase-cocycle rank
- cycle rank
- nonzero syndrome count
- structural graph/component counts

These are optional on large boards; missing values must remain missing, not imputed from outcome.

## View 1 — growth trajectories

For every fixed width W with multiple solved heights, order boards by H.

For every fixed height H with multiple solved widths, order boards by W.

Produce a trajectory:

[
F(W,H_1)	o F(W,H_2)	ocdots
]

or

[
F(W_1,H)	o F(W_2,H)	ocdots
]

where F is the typed structural fingerprint.

Afterward annotate the outcome sequence.

For every adjacent solved pair record:
- outcome stayed or changed;
- exact structural fields that changed;
- exact structural fields that did not change;
- signed/magnitude delta in every numeric coordinate;
- categorical transition in every finite class coordinate.

Special emphasis:
- same-parity dimension changes by 2;
- unit dimension changes by 1;
- outcome transitions versus stable-outcome transitions.

Goal:

Find structural transitions that recur when outcome changes, without asking in advance which field is causal.

## View 2 — outcome-boundary derivative census

For every neighboring board pair in the solved geometry lattice, define the complete structural difference:

[
Delta F = F(W',H')-F(W,H).
]

Partition edges only after construction into:

- P1 -> P1
- P1 -> Draw
- P1 -> P2
- Draw -> P1
- Draw -> Draw
- Draw -> P2
- P2 -> P1
- P2 -> Draw
- P2 -> P2

Do not fit a classifier first.

For each transition class compute:
- distinct delta signatures;
- repeated delta motifs;
- fields invariant across every member;
- fields that necessarily change;
- smallest common typed support of the delta;
- whether reverse transitions have algebraically related deltas.

This should reveal whether W/D/L boundaries are associated with a small set of structural exchange modes.

## View 3 — blind structural quotient refinement

Start with all boards in one class.

Refine outcome-blind using structural blocks in a fixed hierarchy:

1. generated geometry G;
2. incidence/core I;
3. residual hierarchy R;
4. phase/control P;
5. response/capacity C;
6. deadline/depth D;
7. optional recursive quotient Q.

At every refinement stage freeze the partition before joining outcomes.

Then report:
- number of structural classes;
- number of outcome-pure classes;
- number and identity of mixed classes;
- smallest pair of different-outcome boards still merged;
- exact structural fields that first split that pair at the next stage.

This turns every failure into a precise “missing coordinate” witness.

Also run leave-one-structural-block-out ablations after the hierarchy is frozen.

Goal:

Determine which *types* of primitive structure are required, rather than selecting a lucky scalar triple.

## View 4 — latent rank and circuit analysis

This is the main internal-shape probe.

Construct matrices from structural change vectors, not W/D/L codes.

### A. All geometry-growth deltas

Rows are (Delta F) for every adjacent solved geometry edge.

### B. Outcome-boundary deltas

Rows are the same vectors restricted to edges whose W/D/L class changes.

### C. Outcome-preserving deltas

Rows are edges whose W/D/L class stays unchanged.

For natural GF(2) fields, compute exact GF(2) rank and nullspace.

For integer/count fields, compute:
- rational rank;
- Smith normal form where tractable;
- exact integer dependencies/circuits.

For mixed typed blocks, analyze each natural algebra separately before any joint encoding.

Report:
- rank of all-delta space;
- rank of outcome-boundary subspace;
- rank of outcome-preserving subspace;
- quotient dimension between them where meaningful;
- inclusion-minimal circuits;
- whether boundary deltas occupy a low-dimensional subspace;
- whether the low-dimensional basis is stable under leave-one-width/height-out removal.

Critically:

**do not ask for rank 3.**

If the boundary space has rank 2, 3, 4, 7, etc., report it exactly.

If rank 3 emerges repeatedly under independent natural encodings, that becomes strong evidence that the historical unknown triangle is genuinely three-dimensional.

## View 5 — contrast pairs / minimal separators

For every pair of boards with different outcomes:
- record all primitive structural fields on which they differ;
- record all fields on which they agree.

For every pair with the same outcome:
- do the same.

From this construct, outcome-blind at first, a relation lattice of structural distinctions.

After labels are overlaid, identify:
- structural distinctions that never separate same-outcome boards but always separate certain outcome pairs;
- distinctions shared by many unrelated W/H contrasts;
- minimal mixed signatures that require one more coordinate.

Do not solve a minimum feature subset globally; preserve incomparable minimal separators.

## View 6 — triangle/circuit topology without naming coordinates

Use the old UC4A pair-delta methodology on board-family structural objects.

For triples of board geometries connected by simple dimension changes, compute pairwise structural deltas:

[
Delta_{ab},Delta_{bc},Delta_{ca}.
]

Check:
- exact circuit closure;
- signed exchange orientation;
- which primitive blocks contribute nonzero circuit residue;
- whether outcome-boundary triples differ topologically from outcome-preserving triples.

This directly reuses the unresolved triangular framework without guessing its semantic axes.

## Validation discipline

### No single training/test split

Use:
- leave-one-width-out;
- leave-one-height-out;
- leave-one-outcome-transition-family-out;
- chronological/source holdout where a later outcome source extends an earlier table.

### Preserve falsifiers

Every clean pattern must retain:
- earliest counterexample;
- smallest same-signature/different-outcome pair;
- smallest dimension perturbation that breaks it.

### Avoid singleton memorization

A pattern with many one-board signature cells is weak even when pure.

Report repeated-cell support and held-out coverage.

## Desired outputs

The experiment should not end with “best classifier.”

It should end with a structural report:

1. **Outcome-boundary atlas** — where W/D/L changes in the W/H lattice.
2. **Primitive-change atlas** — which UC4A blocks change at those boundaries.
3. **Mixed-class witnesses** — boards still indistinguishable under the current structure.
4. **Boundary delta rank** — dimensionality of the structural change space associated with outcome changes.
5. **Circuit basis** — recurring exchange relations among board geometries.
6. **Candidate internal shape** — only after the above, summarize what dimension/topology the unknown object appears to have.

## Strong success condition

A compelling result would look like:

- the outcome-boundary delta space has low stable rank;
- the same low-dimensional basis recurs under width and height perturbations;
- blind quotient refinement reaches near-purity when the corresponding primitive blocks are introduced;
- held-out dimension families reuse the same structural classes;
- the basis/circuits can be expressed in existing UC4A primitives;
- CPC/RLC can give operational meaning to those basis directions.

If those conditions hold and the stable dimension is three, then the historical “triangle” is no longer a visual analogy: it has emerged mechanically as a three-dimensional structural boundary object.

## Strong failure condition

If boundary deltas have high unstable rank, partitions require near-board-identity information, or different width/height families require unrelated primitives, then the triangle is probably not a universal board-outcome carrier.

That is equally useful because it redirects the search toward state-local/control-level structure rather than board-level outcome formation.

## Execution order

1. Freeze the complete structural-field dictionary and algebra/type for each field.
2. Generate all structural rows with labels inaccessible.
3. Freeze row hashes.
4. Join unsealed outcomes.
5. Run Views 1–6 without adding features.
6. Preserve every mixed/counterexample class.
7. Only then nominate candidate coordinates or a candidate triangle.

No production CPC, JSMinSys or BSFP modification is involved.
