# UC4A board-outcome structural triangle census 0.1

**Date:** 2026-10-01  
**Status:** frozen discovery experiment; outcome labels are post-hoc only  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Test the hypothesis that the unresolved three-part object from the Universal Connect-Four Algebra (UC4A) may describe structural conditions whose combined regimes give rise to the three possible root outcomes:

- first-player win;
- draw;
- second-player win.

The three coordinates are **not** assumed to be the three outcomes directly.

The experiment asks a weaker and safer question:

> Across many unsealed Connect-4 board geometries with independently known root W/D/L labels, do small triples of previously derived UC4A structural quantities form stable outcome-pure or near-pure regimes?

## Outcome boundary

Root outcomes are consumed only from the already-frozen descriptive table:

`research/isograph/discovery/2026-09-29-center-proof-cycle/BOARD_SIZE_ANALYSIS.json`

Those labels are external validation/discovery evidence, not theorem premises.

The sealed formula holdouts remain untouched:

- `3x6-k4`;
- `5x3-k4`.

Neither appears in the 37-row board-size table used here.

## Structural table must be built before label join

For every board geometry `W x H`, Connect-K remains 4.

The structural producer must compute its row without reading W/D/L.

The frozen exact / theorem-derived fields are:

### Generated geometry

[
a=(W-3)_+,quad b=(H-3)_+.
]

Winning-line counts:

[
L_H=Ha,quad L_V=Wb,quad L_D=2ab,quad L=L_H+L_V+L_D.
]

### Total-domain incidence algebra

For this census all boards have (W,Hge4), so (p=q=3) and diagonal residue rank is

[
d=min(2,ab).
]

Then:

[
operatorname{rank}B=WH-9+d,
]

[
dimker B=3ab-d.
]

Cell-side middle core:

[
Y_{cell}=operatorname{rank}B-(a+b).
]

Line-side middle core:

[
Y_{line}=dimker B-(W-1).
]

Core imbalance:

[
Delta_Y=Y_{line}-Y_{cell}.
]

The sign of (Delta_Y) is retained separately from its magnitude.

### Width-path / phase geometry

Phase dimension:

[
P=W-1.
]

Path-center count:

- 1 for odd width;
- 2 for even width.

Path radius:

[
r=lfloor W/2floor.
]

### One-move safe bulk entry

From the proved safe-entry condition, for (Wge4):

[
S=max(0,8-W).
]

This is the number of one-move setup columns that enter the pure-followup safe bulk.

### Initial event impact

For each zero-based column (c), compute the exact number of generated winning requirements incident to the initial bottom event:

[
I(c)=1+h_4(c)+[cle W-4]+[cge3].
]

Record:

- maximum impact;
- number of columns attaining the maximum;
- whether the maximum is unique.

### Elementary response frontier

The exact unresolved elementary response count is:

[
R_1=(W-3)leftlfloorrac{H-1}{2}ightfloor.
]

### Finite-boundary lift after one safe setup

For the one-setup pure-followup response substrate, record:

[
K_{pair}
=
leftlfloorrac{H-1}{2}ightfloor
+
(W-1)leftlfloorrac H2ightfloor
]

and unmatched-top defect weight

[
U
=
((H-1)mod2)
+
(W-1)(Hmod2).
]

This is a structural response-boundary quantity, not a value theorem.

## Frozen coarse feature vocabulary

The post-hoc outcome analysis may use only the following predeclared coarse features:

- `widthParity`
- `heightParity`
- `cellParity`
- `safeEntryCount`
- `safeEntryClass` = 0 / 1 / MULTI
- `phaseRadiusParity`
- `centerCount`
- `maxImpact`
- `maxImpactCount`
- `uniqueMaxImpact`
- `coreDeltaSign` = NEG / ZERO / POS
- `coreDeltaParity`
- `yCellParity`
- `yLineParity`
- `incidenceRankParity`
- `kernelParity`
- `lineCountParity`
- `elementaryUnresolvedParity`
- `topDefectParity`
- `topDefectClass` = ONE / EVEN_NONZERO / ODD_MULTI
- `neutralPairParity`

No feature may be added after looking at outcome collisions in this run.

Exact magnitudes are preserved in the raw structural rows for inspection but are not eligible for the three-feature subset ranking unless listed above.

## Predeclared architectural triangle

Before labels are joined, retain one historically motivated three-coordinate projection:

[
T_{arch}
=
(
	ext{safeEntryClass},
	ext{coreDeltaSign},
	ext{topDefectClass}
).
]

Interpretation:

- safe-entry class: bulk/phase accessibility;
- core-delta sign: line/cell structural orientation;
- top-defect class: finite-boundary lift.

This is a hypothesis probe, not the claimed UC4A triangle.

## Post-hoc outcome analysis

After structural rows are frozen, join W/D/L labels and compute:

1. outcome distribution by every coarse feature;
2. exact signature cells for `T_arch`;
3. every unordered three-feature subset from the frozen vocabulary;
4. for each triple:
   - number of signature cells;
   - number of mixed-outcome cells;
   - rows contained in pure cells;
   - pure-row fraction;
   - minimum support of any pure cell;
5. rank triples by:
   - highest pure-row count;
   - then fewest mixed cells;
   - then fewer signature cells;
   - then lexicographic feature name.

Also run leave-one-width-out and leave-one-height-out checks:

- fit the triple-to-outcome map only on remaining rows;
- predict a held-out row only if its signature appears in training with one outcome;
- report coverage and accuracy separately.

This does not turn the table into an inferential sample. It only tests whether a discovered structural regime repeats across unseen widths/heights represented in the frozen table.

## Strong falsifiers

The hypothesis is weakened if:

- the architectural triangle has many mixed cells;
- high-purity triples merely encode near-unique board IDs;
- leave-one-width/height-out coverage collapses;
- the best triples depend on raw width/height identity rather than derived structure;
- all three outcomes remain heavily mixed under every frozen triple;
- one apparently clean separator fails on same-parity nearby boards.

A failure is useful: preserve the smallest mixed structural signatures as targets for the next missing coordinate.

## What this experiment may establish

Only descriptive structural evidence such as:

- one three-coordinate structural regime is outcome-pure on all observed rows;
- a triple separates two outcomes but mixes the third;
- a specific mixed cell contains boards with different outcomes and therefore identifies a missing primitive;
- one coordinate is redundant once another two are known;
- the three outcomes occupy distinct but overlapping structural regions.

## What it cannot establish

It cannot prove:

- a universal W/D/L formula;
- that the selected triple is the historical unresolved triangle;
- generalized Connect Four;
- polynomial-time solvability;
- any outcome for an unseen board;
- any sealed holdout result.

Any candidate law discovered here must be rederived from the UC4A/RLC structural calculus without outcome labels before promotion.
