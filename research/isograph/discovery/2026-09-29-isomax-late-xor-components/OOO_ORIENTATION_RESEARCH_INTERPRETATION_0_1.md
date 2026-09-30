# IsoMax OOO Orientation Provenance — Research Interpretation 0.1

**Status:** EW-RS-071 complete; strong H/V/D source hypothesis rejected; orientation-specific organization remains only geometry-local  
**Date:** 2026-09-30  
**Scope:** 6x3-k3, 4x5-k4, 6x3-k4 discovery carriers  
**Holdouts:** EW-RS-059 PRIMARY 3x6-k4 and BACKUP 5x3-k4 remained sealed.

## Evidence authority

Final committed evidence:

- `EXPERIMENTAL_WARRANT_RS_071.json`
- `OOO_ORIENTATION_PROVENANCE_SPEC_0_1.md`
- `OOO_ORIENTATION_PROVENANCE_VOCAB_0_1.json`
- `OOO_ORIENTATION_PROVENANCE_0_1.isg`
- `OOO_ORIENTATION_PROVENANCE_SPEC_VERIFY_0_1.json`
- `OOO_ORIENTATION_PROVENANCE_0_1.json`
- `OOO_ORIENTATION_PROVENANCE_RESULT_VERIFY_0_1.json`

The verifier-gated workflow run 36746442264 completed successfully through:

1. orientation provenance unit tests;
2. specification/reflection verification;
3. the full three-carrier audit;
4. result verification;
5. research-integrity verification;
6. evidence publication.

The later cross-k repair preserves the verifier-gated values from that run.

---

# 1. Exact deductions

## 1.1 Reflection quotient

Raw directions were retained as

[
H,quad V,quad D_+,quad D_-.
]

Horizontal reflection was verified structurally with zero mismatches and maps

[
H	o H,qquad V	o V,qquad D_+leftrightarrow D_-.
]

Therefore for reflection-invariant scalar queries the diagonal sign may be quotiented exactly:

[
oxed{D_+sim D_-	o D.}
]

No scalar outcomes are needed for this deduction.

## 1.2 Provenance projection is semantics-preserving

The provenance-enhanced pipeline reproduces the ordinary mask-only pipeline exactly on all declared carriers:

- q_o mask mismatches: 0;
- RFG mask mismatches: 0;
- reflected provenance mismatches: 0;
- reflected T2 mismatches: 0;
- reflected exact-component mismatches: 0;
- reflected ROLE_CAPPAR mismatches: 0.

Thus orientation provenance is a parallel annotation of the frozen structural pipeline, not a changed game representation.

## 1.3 Strong cross-k H/V/D source hypothesis is impossible

The geometric winning-line catalogs are:

| carrier | H | V | D+ | D- |
| --- | ---: | ---: | ---: | ---: |
| 6x3-k3 | 12 | 6 | 4 | 4 |
| 4x5-k4 | 5 | 8 | 2 | 2 |
| 6x3-k4 | 9 | 0 | 0 | 0 |

On 6x3-k4, K=4 exceeds board height 3. Therefore V, D+, and D- winning lines do not exist.

But the already-frozen repaired-coordinate evidence on that same carrier has:

- degree-2 contradictions: 5;
- OOO structural rank gain: 16;
- OOO contradictions: 0;
- matched scalar dependency image dimension: 2.

Hence:

[
oxed{
	ext{a nontrivial OOO scalar correction exists on a carrier with H only.}
}
]

Therefore:

[
oxed{
	ext{OOO cannot generally be caused by a simultaneous H/V/D interaction.}
}
]

This is an exact geometric falsifier combined with previously frozen bounded OOO evidence.

## 1.4 DTS consequence

The three orientation channels do have different support-transition anatomy:

- H is transverse to vertical support chains;
- V lies wholly inside one support chain;
- D couples horizontal displacement to support depth.

But a universal closed **three-channel** H/V/D circuit cannot be the source of the scalar remainder, because the hard 6x3-k4 carrier has only the H channel while retaining the OOO correction.

A deeper support/exchange/circuit law may still admit H/V/D as one realization on taller geometries.

---

# 2. Bounded experimental results

## 2.1 HVD restriction test

### 6x3-k3

- OOO triple catalog: 297
- HVD-containing triples: 256
- non-HVD triples: 41
- HVD-only image rank: 74
- HVD-only scalar contradictions: 0
- HVD-only scalar factorization: exact
- non-HVD-only image rank: 31
- non-HVD-only scalar contradictions: 8

So HVD-containing triples are sufficient on this carrier.

### 4x5-k4

- OOO triple catalog: 677
- HVD-containing triples: 438
- non-HVD triples: 239
- HVD-only image rank: 217
- HVD-only scalar contradictions: 5
- non-HVD-only image rank: 152
- non-HVD-only scalar contradictions: 14

Neither subset alone is sufficient.

### 6x3-k4

- OOO triple catalog: 50
- HVD-containing triples: 0
- non-HVD triples: 50
- HVD-only image rank: 0
- HVD-only scalar contradictions: 8
- non-HVD-only image rank: 16
- non-HVD-only scalar contradictions: 0
- non-HVD-only scalar factorization: exact

Thus the HVD predicate has incompatible roles across the declared carriers.

## 2.2 Orientation-summary ladder

The frozen candidate order was:

1. ORI_PRESENCE
2. ORI_COUNTS
3. OWNER_ORI_COUNTS
4. ORI_ROLE_PHASE_COUNTS
5. ORI_DEPTH_HISTOGRAM
6. OWNER_ORI_DEPTH_HISTOGRAM
7. PAIR_ORI_INCIDENCE
8. OWNER_ORI_PHASE_DEPTH
9. EXACT_ORIENTATION_PROVENANCE
10. FULL_DESCRIPTOR_PLUS_EXACT_ORIENTATION

### 6x3-k3

The first passing candidate is ORI_COUNTS:

- ORI_PRESENCE: 2 contradictions
- ORI_COUNTS: 0
- later count/phase/depth candidates: 0

This is geometry-local evidence that orientation multiplicity can organize the k=3 carrier.

However every deterministic shuffle of ORI_COUNTS also remains exact, so this success is not orientation-label-specific.

### 4x5-k4

Every compressed orientation candidate fails:

- ORI_PRESENCE: 22 contradictions
- ORI_COUNTS: 54
- OWNER_ORI_COUNTS: 54
- ORI_ROLE_PHASE_COUNTS: 44
- ORI_DEPTH_HISTOGRAM: 44
- OWNER_ORI_DEPTH_HISTOGRAM: 41
- PAIR_ORI_INCIDENCE: 22
- OWNER_ORI_PHASE_DEPTH: 41

Only EXACT_ORIENTATION_PROVENANCE and the reconstruction control are exact.

The exact orientation representation has image rank 294, exactly the full OOO residue rank. It supplies no structural-rank compression.

### 6x3-k4

Every compressed orientation candidate also fails:

- ORI_PRESENCE: 8 contradictions
- ORI_COUNTS: 4
- OWNER_ORI_COUNTS: 3
- ORI_ROLE_PHASE_COUNTS: 3
- ORI_DEPTH_HISTOGRAM: 3
- OWNER_ORI_DEPTH_HISTOGRAM: 1
- PAIR_ORI_INCIDENCE: 8
- OWNER_ORI_PHASE_DEPTH: 1

Only exact orientation provenance/reconstruction is exact, again with full OOO rank 16.

Since this carrier contains only H winning lines, those exact labels are not evidence for an H/V/D interaction law.

---

# 3. Cross-k discriminator

The clean same-board comparison is 6x3-k3 versus 6x3-k4.

For every useful orientation candidate, the mechanically generated triple-key sets are disjoint across k:

| candidate | k3 keys | k4 keys | shared |
| --- | ---: | ---: | ---: |
| ORI_PRESENCE | 70 | 3 | 0 |
| ORI_COUNTS | 225 | 10 | 0 |
| OWNER_ORI_COUNTS | 262 | 21 | 0 |
| ORI_ROLE_PHASE_COUNTS | 232 | 20 | 0 |
| ORI_DEPTH_HISTOGRAM | 232 | 24 | 0 |
| OWNER_ORI_DEPTH_HISTOGRAM | 265 | 37 | 0 |
| OWNER_ORI_PHASE_DEPTH | 265 | 37 | 0 |
| EXACT_ORIENTATION_PROVENANCE | 297 | 50 | 0 |

PAIR_ORI_INCIDENCE has one shared key, but that candidate fails scalar factorization on both k values.

Moreover:

- ORI_COUNTS is exact on 6x3-k3;
- ORI_COUNTS is inexact on 6x3-k4;
- every compressed orientation candidate that is exact on k=3 remains inexact on k=4.

Therefore no common compressed H/V/D orientation law transfers across the same 6x3 geometry when K changes from 3 to 4.

This is strong evidence against the proposed orientation-family explanation as the cross-k invariant.

---

# 4. Orientation-shuffled controls

The deterministic descriptor-label shifts were 1, 3, and 7.

The exact orientation provenance candidate remains scalar-exact under every shuffle on every carrier, at the same full structural rank.

Examples:

- 6x3-k3: exact provenance rank 75; all three shuffled controls rank 75 and exact.
- 4x5-k4: exact provenance rank 294; all three shuffled controls rank 294 and exact.
- 6x3-k4: exact provenance rank 16; all three shuffled controls rank 16 and exact.

Several **coarser shuffled** candidates also outperform the true orientation assignment. On 4x5-k4, for example, shifted OWNER_ORI_PHASE_DEPTH reaches rank 294 and zero contradictions although the true orientation assignment leaves 41 contradictions.

Therefore exactness of fine orientation labels is explained by retained distinguishing capacity, not by special alignment of true H/V/D labels with the scalar map.

This satisfies the declared shuffled-control falsifier against orientation provenance as the primary organizing explanation.

---

# 5. DP / MSS disposition

The focused orientation MSS pass gives:

- **diagonal sign:** removable exactly by horizontal reflection;
- **absolute source-line identity:** not required by the passing exact-orientation candidate; raw orientation multiplicities suffice for the reconstruction control;
- **absolute cell identity:** not required; repaired local role/depth geometry remains sufficient for the base coordinate;
- **orientation presence alone:** insufficient on every carrier;
- **orientation multiplicity/counts:** not a common sufficient support;
- **owner separation:** does not repair the common failure;
- **role phase:** does not repair the common failure;
- **exact depth:** does not repair the common failure;
- **depth parity:** cannot repair a failure of the strictly finer exact-depth summary, so it is rejected deductively as a common replacement;
- **mask grouping / fine incidence:** removing it still leaves failures on 4x5-k4 and 6x3-k4;
- **exact orientation provenance:** scalar-exact, but reconstructive rather than compressive, and shuffle-insensitive.

Thus no nontrivial common orientation-derived MSS carrier was found.

The coarsest common passing rung is only the exact-orientation reconstruction level, which is not an explanatory compression.

---

# 6. Comparison with the non-orientation exchange carrier

EW-RS-069 already established a common non-orientation exchange realization:

[
	ext{EXCHANGE_EXACT_DELTA_TRIANGLE}.
]

Its image ranks are:

- 6x3-k3: 75
- 4x5-k4: 283
- 6x3-k4: 16

and it is scalar-exact on all three.

By contrast exact orientation provenance has ranks:

- 75
- 294
- 16

respectively.

So on 4x5-k4 the non-orientation exchange carrier is **strictly smaller** (283 versus 294) while preserving the same scalar image.

This satisfies the declared simpler-non-orientation-carrier falsifier at the structural-carrier level.

The current evidence therefore favors a deeper support/exchange relation over H/V/D orientation identity.

---

# 7. Where orientation information lives in the pipeline

## Preserved exactly

At geometric line generation:

[
H,V,D_+,D_-
]

are explicit.

In the provenance-enhanced q_o experiment, duplicate residual masks union all source-line provenance.

R/F/G preserves provenance precisely for masks that survive.

## Merged

At q_o duplicate-mask normalization, different source lines—and possibly different orientations—may map to one residual obligation.

The provenance-enhanced representation stores the union; the ordinary mask-only representation stores only the mask.

## Deleted

Strict-superset absorption removes an absorbed residual obligation together with its provenance.

R/F/G deletion likewise removes the attached provenance.

The production repaired component identity does not include source orientation labels.

## Reconstructibility

Coarse orientation presence is often reconstructible from a base descriptor occurrence class, but exact provenance is generally not.

Observed exact-orientation ambiguity among base descriptors:

- 6x3-k3: 14,561 / 14,615 descriptor identities have multiple observed exact-orientation variants;
- 4x5-k4: 70,786 / 73,587 are ambiguous;
- 6x3-k4: 3,212 / 16,452 are ambiguous.

Thus ordinary ROLE_CAPPAR does not generally reconstruct exact source-line orientation provenance.

---

# 8. Failed candidates

The following explanations are rejected for the declared corpus:

1. **Universal H/V/D triad as the source of OOO.**  
   Rejected exactly by horizontal-only 6x3-k4 plus nonzero OOO.

2. **Orientation-presence multiset alone.**  
   Fails all three carriers.

3. **Common orientation-count law across k.**  
   Passes 6x3-k3 but fails 6x3-k4 and 4x5-k4.

4. **Owner + orientation + phase + exact depth without fine incidence.**  
   Still fails 4x5-k4 and 6x3-k4.

5. **HVD-containing triples are universally the value-bearing subspace.**  
   True only as a sufficient restriction on 6x3-k3; false on 4x5-k4 and impossible on 6x3-k4.

6. **True orientation labels are uniquely aligned with scalar value.**  
   Rejected by deterministic shuffled controls.

7. **Orientation provenance is the smallest common structural carrier.**  
   Rejected by the smaller common non-orientation exact-delta exchange carrier.

---

# 9. Open QU objects

## QU-ORI-01 — H-only primitive

What creates the 16-dimensional OOO correction on horizontal-only 6x3-k4?

This is now the cleanest orientation-free control.

## QU-ORI-02 — geometry-local orientation organization

Why does ORI_COUNTS happen to be sufficient on 6x3-k3, and does that correspond to a useful local theorem despite failing transfer?

## QU-ORI-03 — deeper common exchange law

What support/release/exchange invariant explains both:

- mixed-orientation 6x3-k3 / 4x5-k4; and
- horizontal-only 6x3-k4?

EW-RS-069 exact pair-delta geometry is the current strongest common lead.

## QU-ORI-04 — transition/circuit semantics

Can the exact pair-delta carrier be derived from discrete support advancement and residual normalization as a native DTS circuit law?

## QU-ORI-05 — compact two-syndrome realization

How does the two-bit scalar image factor through the common non-orientation exchange carrier without outcome-selecting individual delta keys?

---

# 10. Final disposition

The original clue was worth testing because OOO remains triadic on both k=3 and k=4.

The experiment does **not** support the stronger conclusion that this triadicity is an H/V/D interaction.

The most important result is:

[
oxed{
6x3	ext{-}k4:quad V=D=0,qquad operatorname{rank}(OOO)=16,qquad dim(	ext{scalar image})=2.
}
]

Therefore H/V/D is not the cross-k invariant.

The evidence instead points back toward a more primitive structural relation involving support/release/exchange geometry—one that can exist even when every surviving winning line is horizontal.

The pair-delta/circuit campaign is therefore the preferred continuation after EW-RS-071.
