# UC4A latent-structure tomography result checkpoint 0.1

**Date:** 2026-10-01  
**Status:** completed broad tomography; descriptive discovery evidence only  
**Branch:** `research/universal-structural-policy-20260930`  
**Frozen design:** `UC4A_LATENT_STRUCTURE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md`  
**Corrected structural atlas SHA-256:** `49844e4772a337d92ab10735d8bc13d1c5570edb6a1b382d4fb0660205d21760`  
**Durable analysis evidence:** `UC4A_LATENT_STRUCTURE_TOMOGRAPHY_ANALYSIS_0_1.json`

## Result in one sentence

The first broad tomography does **not** expose a rank-3 outcome-boundary subspace.

Instead it shows that outcome-changing geometry transitions live inside the same first-order structural delta space already occupied by outcome-preserving transitions, while the strongest descriptive contrast is concentrated in the width-path / phase-control block and in interactions/growth-rate changes rather than in one isolated scalar coordinate.

No final Outcome-Formation Triangle is nominated.

## Execution integrity

The experiment was executed in two phases.

### Phase A — outcome-blind structural freeze

The 52-board K=4 geometry cohort was generated without loading any W/D/L-bearing source.

The structural producer reports:

- `oracleUsed: false`;
- `solvedInputsUsed: false`;
- `outcomeLabelsAccessibleToProducer: false`;
- `sealedHoldoutsAccessed: false`;
- production CPC unchanged;
- BSFP unchanged.

Only after the structural atlas and row hashes were committed were the 37 original and 15 fresh unsealed W/D/L labels joined.

### Structural correction before label analysis

The first atlas exposed an impossible `4x4 Y_line = -1`.

This localized a qualified-range defect in the inherited shortcut

`Y_line = kernelDimension - (W-1)`.

The actual pure-vertical-line parity quotient on `ker(B)` has rank 2, not 3, on 4x4 and 4x5.

The structural producer was therefore corrected outcome-blind to construct explicit GF(2) bases for `im(B)`, `ker(B)`, `Y_cell`, and `Y_line`.

Smallest witnesses after correction:

```text
4x4: kernelDimension 2, line quotient rank 2, Y_line 0
4x5: kernelDimension 4, line quotient rank 2, Y_line 2
```

Standard 7x6 is unchanged:

```text
winning lines             69
rank(B)                   35
dim ker(B)                34
Y_cell                    28
Y_line                    28
line phase quotient rank   6
degree-3 fragments        232
degree-2 fragments        282
degree-1 fragments         42
```

The corrected 7x6 reflection checkpoints also reproduce:

```text
left-right fixed:           Y_cell 14, Y_line 14
geometric top-bottom fixed: Y_cell 16, Y_line 14
180-degree fixed:           Y_cell 14, Y_line 14
```

### View-1 +2 correction

The first Phase-B result incorrectly reported zero same-parity-by-two trajectory edges because only consecutive available boards were emitted.

The implementation was corrected without changing any field or any other view.

Final View-1 counts are:

```text
fixed-width trajectories       8
fixed-height trajectories     10
unit geometry edges           85
same-parity +2 edges          67
```

## View 1 — growth trajectories

Across the 85 unit geometry edges:

```text
outcome-changing edges   44
outcome-preserving edges 41
```

Across the 67 explicit same-parity +2 edges:

```text
outcome-changing edges   20
outcome-preserving edges 47
width +2 edges           32
height +2 edges          35
```

The requested 8x6 / 9x6 / 10x6 trajectory is especially informative:

```text
board   outcome   pathRadius   phaseRadiusParity   phaseDim   pairNullity   maxImpactCount   coreDelta
8x6     P2_WIN        4               0                7          21               2              3
9x6     P2_WIN        4               0                8          28               3              6
10x6    P1_WIN        5               1                9          36               4              9
```

The preserving edge `8x6 -> 9x6` and the boundary edge `9x6 -> 10x6` have the same first-order increments in many geometry/residual quantities.

What changes in their **growth law** includes:

- path-radius increment: `0 -> 1`;
- phase-radius parity delta: `0 -> 1`;
- safe-derivative-word growth: `+26 -> +42`;
- pair-response/displacement nullity growth: `+7 -> +8`;
- left-right reflection/core fixed-space increments.

This supports the earlier diagnosis that the coarse `safeEntryCount + coreDeltaSign + top-boundary` cell had compressed away a load-bearing width/path distinction.

It does **not** establish which one of these projections is causal.

The direct +2 comparison is:

```text
8x6 -> 10x6
outcome: P2_WIN -> P1_WIN
pathRadius              +1
phaseDimension          +2
pair displacement rank  +2
pair nullity           +15
coreDelta               +6
maxImpactCount          +2
phaseRadiusParity XOR    1
```

## View 2 — outcome-boundary derivative census

The 85 unit edges contain 72 distinct exact scalar delta signatures.

Nine signatures repeat.

Within the current cohort, no repeated exact full scalar delta signature appears both on an outcome-changing and an outcome-preserving edge.

Examples of genuinely repeated structural exchange motifs include:

```text
6x7 -> 6x8
6x9 -> 6x10
6x11 -> 6x12
```

All three share one exact full delta signature and all are `P1_WIN -> P2_WIN`.

Likewise:

```text
6x8 -> 6x9
6x10 -> 6x11
```

share one exact full delta signature and both are `P2_WIN -> P1_WIN`.

The +2 family similarly has 60 distinct signatures over 67 edges, five repeated signatures, and no repeated signature with mixed boundary behavior.

This is descriptive evidence that recurring structural exchange modes exist.

However the full delta signature is high-dimensional and geometry-rich; signature purity is **not** a compact value theorem.

## View 3 — blind quotient refinement

The literal exact refinement singletonizes immediately:

```text
G alone -> 52 classes -> 52 singleton classes
```

The predeclared identity-suppressed refinement also remains:

```text
52 classes -> 52 singleton classes
```

even after direct `width`, `height`, `cells`, and start-domain dimensions are removed.

Every leave-one-block-out version also remains 52 singleton classes.

This is an important **negative methodological result**, not a perfect classifier.

The exact magnitude fields encode geometry so richly that they effectively reconstruct board identity.

Therefore exact-class purity cannot be treated as evidence for an outcome law.

The next useful structural reduction must quotient ordinary geometry-growth information rather than celebrate singleton purity.

## View 4 — latent rank and circuit analysis

### Integer/rational delta space

```text
all unit-edge delta rank             14
outcome-boundary delta rank          10
outcome-preserving delta rank        14

boundary-novel dimension              0
preserving-novel dimension            4
```

Per-block boundary ranks:

```text
G geometry/orientation    5
I incidence/core          8
R residual hierarchy      2
P phase/path/control      4
C response/capacity       5
D deadline/depth          6
```

Leave-one-family stability:

```text
leave-one-width-out boundary rank   8..10
leave-one-height-out boundary rank  9..10
```

### GF(2) delta space

```text
all unit-edge delta rank              6
outcome-boundary delta rank           4
outcome-preserving delta rank         6

boundary-novel dimension              0
preserving-novel dimension            2
```

Per-block boundary ranks:

```text
G parity geometry       3
I incidence/core parity 3
P phase-radius parity   1
C top-defect parity     1
```

Leave-one-family stability:

```text
leave-one-width-out boundary rank   3..4
leave-one-height-out boundary rank  4
```

### Main rank conclusion

There is no mechanically emerging rank-3 first-order outcome-boundary object in this encoding.

More importantly, in both natural algebras:

```text
span(outcome-boundary deltas)
is contained in
span(outcome-preserving deltas)
```

because the boundary contributes zero new dimension beyond the preserving span.

So the outcome boundary is **not characterized by entering a new first-order linear structural direction**.

This is consistent with the separate coupled-gauge CPC evidence in which degree-1 decoding fails but degree-2 interaction systems close.

## View 5 — contrast pairs / minimal separators

The cohort contains:

```text
same-outcome board pairs       469
different-outcome board pairs  857
```

The exact minimal-separator antichain exceeded its declared safety bound:

```text
reported incomparable separators 5000
search status                    TRUNCATED
```

Many size-2 separators such as pairs of exact orientation line counts separate every different-outcome pair.

That is not strong outcome evidence because those same exact magnitudes also distinguish almost every **same-outcome** board pair.

The most obvious example is `D.positiveDepthLineIncidenceTotal`:

```text
different-outcome pairs separated 855 / 857
same-outcome pairs separated      469 / 469
```

It is effectively a geometry-identity coordinate in this cohort.

### Contrast advantage by frozen field

A more useful descriptive statistic already contained in the pair census is:

```text
fraction of different-outcome pairs separated
minus
fraction of same-outcome pairs separated
```

The strongest fields are:

```text
P.pathRadius          +0.396
P.safeEntryClass      +0.312
P.safeEntryCount      +0.243
I.kernelParity        +0.229
I.yCellParity         +0.229
P.phaseDimension      +0.198
P response-path ranks +0.198
D.maxInitialImpact    +0.191
P.phaseRadiusParity   +0.143
D.maxImpactCount      +0.144
I.coreDeltaSign       +0.092
```

Averaged over each frozen block, the phase/path block has the largest positive contrast differential:

```text
P phase/path/control   about +0.208
C response/capacity    about +0.094
I incidence/core       about +0.048
D deadline/depth       about +0.048
G raw geometry         about +0.007
R residual counts      about -0.002
```

These are **not** fitted scores and do not promote a feature.

They are a broad indication that outcome differences are disproportionately associated with the width-path / phase-control subsystem rather than with raw residual-size growth.

## View 6 — triangle/circuit topology

There are 68 oriented L-triangles from complete unit geometry squares.

Every pair-delta triangle closes exactly over both the integer and GF(2) coordinates.

That closure is an algebraic identity of differences and is not evidence for a special game-theoretic triangle by itself.

Most triangle edges change all six available non-Q blocks.

Observed edge-block support topologies are dominated by:

```text
G + I + R + P + C + D on all three edges
```

with a smaller family in which one edge leaves P unchanged.

The W/D/L edge-count partition of a three-vertex triangle is 0, 2, or 3 boundary edges; one boundary edge cannot occur because equality of vertex labels is transitive. Therefore that count is combinatorial and must not be interpreted as a new topology theorem.

No semantic triangle axes emerge from View 6 yet.

## What has actually emerged

The broad tomography supports five conclusions.

### 1. The first-order boundary is not rank 3

The natural measured ranks are 10 over the integer encoding and 4 over GF(2).

Neither is a final intrinsic dimension, but rank 3 did not emerge.

### 2. Boundary transitions use ordinary structural directions

Outcome-changing deltas add no linear dimension beyond the outcome-preserving span.

This is stronger than merely saying the boundary rank is not 3.

It says a first-order linear-subspace discriminator is the wrong object for the current encoding.

### 3. Width-path / phase structure is the clearest recurring clue

The strongest pairwise contrast advantages are concentrated in P.

The 10x6 falsifier is therefore not isolated: its `phaseRadiusParity` repair appears to be a projection of a broader path/transport subsystem, exactly as suspected before tomography.

### 4. Exact magnitude purity is mostly identity

The blind exact quotient is already singleton at G and remains singleton after direct dimension fields are removed.

Likewise thousands of small exact separators exist.

These are warnings against mistaking geometry reconstruction for outcome semantics.

### 5. Interaction order is now the main open seam

The current evidence is compatible with:

```text
board geometry
 -> ordinary first-order growth directions
 -> coupled / second-order structural interaction regime
 -> W/D/L basin
```

rather than:

```text
board geometry
 -> one special rank-3 linear boundary subspace
 -> W/D/L
```

This matches the independent CPC/formula bridge where degree-1 response decoding contradicts but degree-2 interaction systems close.

## Next broad probe

The next experiment should remain outcome-blind and should not nominate candidate axes.

Use only the already-frozen structural fields and apply **second-order structural derivatives**.

For integer/count fields:

```text
pure width curvature:
F(W+2,H) - 2F(W+1,H) + F(W,H)

pure height curvature:
F(W,H+2) - 2F(W,H+1) + F(W,H)

mixed geometry curvature:
F(W+1,H+1) - F(W+1,H) - F(W,H+1) + F(W,H)
```

For GF(2) fields use the corresponding XOR second derivatives.

This operator removes many affine first-order growth directions and directly probes interaction/growth-rate changes without inventing a new structural coordinate.

Freeze the curvature rows and hashes before attaching outcomes.

Then compare:

- all curvature rows;
- curvature near outcome boundaries;
- curvature inside outcome-preserving regions;
- rank/nullspace and block support;
- recurrence across held-out width/height families;
- whether the 8x6 / 9x6 / 10x6 growth-rate change belongs to a recurring mode.

Do not ask for rank 3.

If a low stable rank emerges only after first-order geometry growth is quotiented away, that would be materially stronger evidence for an internal Outcome-Formation object.

If no such structure emerges, the board-level triangle hypothesis should be narrowed further toward state-local control/response dynamics.

## Claim boundary

This checkpoint does not establish:

- a universal W/D/L formula;
- a rank-3 Outcome-Formation Triangle;
- semantic meanings for `Bx/By/Bxy`;
- a production CPC rule;
- a BSFP value premise;
- an optimal-move theorem;
- a Connect Four solution.

The durable result is that broad first-order tomography has now mechanically localized the next question to **coupled / higher-order geometry-growth structure**, with width-path/phase control carrying the strongest current signal.
