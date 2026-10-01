# UC4A second-order structural curvature tomography experiment design 0.1

**Date:** 2026-10-01  
**Status:** frozen broad follow-up design; not yet executed  
**Branch:** `research/universal-structural-policy-20260930`  
**Predecessor:** `UC4A_LATENT_STRUCTURE_TOMOGRAPHY_RESULT_CHECKPOINT_0_1.md`

## Purpose

The first broad UC4A tomography found:

```text
integer unit-delta rank:
  all        14
  boundary   10
  preserving 14

GF(2) unit-delta rank:
  all         6
  boundary    4
  preserving  6
```

and therefore:

```text
boundary-novel dimension = 0
```

in both natural first-order encodings.

Outcome-changing transitions do not enter a new first-order structural direction. They occupy directions already used by outcome-preserving geometry growth.

The next broad question is therefore:

> After ordinary first-order geometry growth is removed, do outcome-boundary neighborhoods carry recurring low-dimensional structural **curvature / interaction modes** that are absent or rarer in outcome-preserving neighborhoods?

This experiment does not assume rank 3 and does not nominate triangle axes.

## Motivation

Three independent observations point toward interaction order rather than a new first-order coordinate:

1. the first tomography gives zero boundary-novel first-order dimension;
2. the 8x6 -> 9x6 preserving edge and 9x6 -> 10x6 boundary edge agree on many first-order increments but differ in path/reflection growth rate;
3. the independent CPC/formula coupled-gauge bridge fails at degree 1 and closes at degree 2 on its exact finite family.

The follow-up therefore applies only algebraically natural second-difference operators to the already-frozen structural fields.

No new primitive feature is introduced.

## Source boundary

Consume only the corrected outcome-blind structural atlas:

`UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_0_1.json`

with structural atlas SHA-256:

`49844e4772a337d92ab10735d8bc13d1c5570edb6a1b382d4fb0660205d21760`.

For Phase A, W/D/L-bearing files must not be opened.

The two sealed formula holdouts remain untouched:

- `3x6-k4`;
- `5x3-k4`.

Production CPC, JSMinSys and BSFP remain read-only.

## Frozen field registry

Use exactly the structural atlas's existing:

- integer scalar registry;
- GF(2) scalar registry;
- block assignments G/I/R/P/C/D/Q.

Do not add:

- outcome-derived thresholds;
- fitted scores;
- categorical-to-number encodings;
- new residual summaries;
- new path features;
- Bx/By/Bxy semantics.

Categorical fields may be carried as annotations but do not enter curvature rank matrices because there is no predeclared natural second-difference algebra for them.

## Phase A — outcome-blind curvature producer

Generate three structural neighborhood families.

### A1 — pure-width triples

For every available:

```text
(W,H), (W+1,H), (W+2,H)
```

compute integer curvature:

```text
K_W(F) = F(W+2,H) - 2F(W+1,H) + F(W,H)
```

and GF(2) delta-change:

```text
K_W2(F) =
  (F(W+1,H) xor F(W,H))
  xor
  (F(W+2,H) xor F(W+1,H))
```

which equals endpoint XOR in characteristic two but is retained explicitly as change of adjacent edge deltas.

### A2 — pure-height triples

For every available:

```text
(W,H), (W,H+1), (W,H+2)
```

compute:

```text
K_H(F) = F(W,H+2) - 2F(W,H+1) + F(W,H)
```

and the analogous GF(2) adjacent-delta change.

### A3 — mixed W/H squares

For every complete unit square:

```text
a = (W,H)
b = (W+1,H)
c = (W,H+1)
d = (W+1,H+1)
```

compute mixed integer curvature:

```text
K_WH(F) = F(d) - F(b) - F(c) + F(a)
```

and GF(2) mixed curvature:

```text
K_WH2(F) = F(a) xor F(b) xor F(c) xor F(d).
```

This is the discrete mixed derivative / interaction term.

## Required Phase-A outputs

For every curvature row record:

- family: WIDTH2 / HEIGHT2 / MIXED;
- board keys;
- integer curvature vector;
- GF(2) curvature vector;
- nonzero fields;
- nonzero typed blocks;
- exact signature hash.

Freeze:

- row ordering;
- field ordering;
- row hashes;
- whole-atlas hash.

Also report outcome-blind:

- row count by family;
- distinct curvature signatures;
- repeated signatures;
- zero-curvature rows;
- integer rank/nullspace by family and combined;
- GF(2) rank/nullspace by family and combined;
- per-block ranks;
- recurrence of signatures across distinct widths/heights.

The Phase-A artifact must contain no W/D/L tokens.

## Phase B — post-freeze outcome overlay

Only after the curvature atlas is committed may the already-approved 52 W/D/L labels be joined.

### B1 — pure-triple boundary classes

For WIDTH2 and HEIGHT2 triples, compute the two adjacent outcome transitions.

Classify the neighborhood by boundary-edge count:

```text
0 = both adjacent edges preserve outcome
1 = exactly one adjacent edge changes outcome
2 = both adjacent edges change outcome
```

Also retain the exact three-outcome word, for example:

```text
P2_WIN, P2_WIN, P1_WIN
```

No numeric W/D/L encoding enters structural algebra.

### B2 — mixed-square boundary classes

For each unit square, inspect the four unit perimeter edges.

Record:

- boundary-edge count 0..4;
- four-corner outcome word;
- horizontal boundary pattern;
- vertical boundary pattern.

Again, outcomes classify already-frozen curvature rows only.

## Curvature rank analysis

For each family separately and for the combined curvature system, compute exact ranks for:

- all curvature rows;
- boundary-adjacent rows: neighborhood has at least one outcome-changing unit edge;
- homogeneous rows: neighborhood has zero outcome-changing unit edges.

For integer fields compute exact rational rank.

For GF(2) fields compute exact rank and nullspace.

Report:

```text
boundary-novel curvature dimension
  = rank(all) - rank(homogeneous)

homogeneous-novel curvature dimension
  = rank(all) - rank(boundary)
```

These are descriptive subspace comparisons only.

Do not ask for rank 3.

## Repeated-mode test

Group exact curvature signatures before reading outcomes.

After overlay, report for every repeated structural curvature signature:

- row count;
- family;
- widths/heights represented;
- outcome-neighborhood classes represented;
- whether the signature occurs both in boundary-adjacent and homogeneous neighborhoods.

A repeated curvature mode that is boundary-pure across unrelated W/H families is a stronger clue than a unique board identity signature.

A repeated curvature mode that occurs in both boundary and homogeneous neighborhoods is a direct falsifier of treating that curvature mode alone as an outcome boundary rule.

## Block-support test

For every family report:

- blocks ever nonzero;
- blocks nonzero on every boundary-adjacent row;
- blocks nonzero on every homogeneous row;
- most frequent nonzero block combinations.

This asks whether curvature is concentrated in P/C/I interactions or remains dominated by raw G/R growth.

## Held-out stability

For every measured rank/signature claim, run:

- leave-one-width-out;
- leave-one-height-out.

Report rank ranges exactly.

Do not discard a family because removing one width lowers rank.

## 8x6 / 9x6 / 10x6 focus

The pure-width curvature row:

```text
8x6, 9x6, 10x6
```

must be present.

Report its nonzero fields and blocks.

Then search the frozen curvature atlas for exact repeated copies of that curvature signature before outcome labels are consulted.

Only after the search is frozen may outcomes of any matches be shown.

This directly tests whether the 10x6 repair clue is one instance of a recurring growth-rate mode.

## Success condition

A meaningful positive result would be one or more of:

- curvature rank is substantially lower than first-order delta rank and stable across held-out families;
- boundary-adjacent curvature contributes dimensions absent from homogeneous curvature;
- repeated curvature signatures recur across unrelated dimensions and are strongly aligned with boundary neighborhoods;
- nonzero curvature concentrates in a small coupled UC4A block set such as P/C/I rather than ordinary raw geometry magnitude;
- the 8x6/9x6/10x6 curvature repeats elsewhere with the same structural role.

If a stable rank of three emerges naturally, record it.

Do not prefer it.

## Failure condition

A useful negative result is any of:

- boundary curvature adds zero dimensions beyond homogeneous curvature;
- curvature rank remains high/unstable;
- repeated curvature modes routinely occur in both boundary and homogeneous neighborhoods;
- curvature is dominated by ordinary dimension-polynomial geometry terms;
- 8x6/9x6/10x6 curvature is unique board identity.

Such a result would narrow the Outcome-Formation Triangle hypothesis further toward state-local/control-level structure.

## Claim boundary

This experiment cannot establish by itself:

- a W/D/L theorem;
- a universal board formula;
- a final Outcome-Formation Triangle;
- a semantic decoder for Bx/By/Bxy;
- a production CPC rule;
- a BSFP solved premise;
- an optimal-move theorem.

It is a second broad structural probe whose only purpose is to determine whether the missing shape lives in **interaction / curvature order** after first-order geometry growth has been factored away.
