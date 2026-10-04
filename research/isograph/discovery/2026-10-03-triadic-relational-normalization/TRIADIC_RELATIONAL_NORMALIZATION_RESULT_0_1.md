# Triadic relational normalization result 0.1

**Date:** 2026-10-03
**Branch:** `experiment/triadic-relational-normalization-20261003`
**Workflow:** `Research triadic relational normalization`
**Run:** 37165046727
**Status:** first-pass partial positive; insufficient because the CPCX sample did not traverse carrier-handoff seams

## Frozen normalization

The experiment was frozen before execution in
`TRIADIC_RELATIONAL_NORMALIZATION_EXPERIMENT_DESIGN_0_1.md`.

UC4A was normalized independently to:

- U-A: axis-core / LR-TB reflection channel;
- U-R: rotation/incidence-core channel;
- U-P: phase/path channel.

CPCX was normalized independently to:

- C-C: protected carrier identity/role;
- C-S: support profile/debt/phase;
- C-R: immediate/progress/response interface.

Only after both outputs were produced were all six anonymous channel permutations compared.

No solved value, oracle, remoteness, or three-body premise was used.

## UC4A result

Directed defect records: 133.

Extended-grid recurring defect records: 106.

Observed masks:

- 010: 32
- 110: 53
- 001: 37
- 111: 11

Recurring masks:

- 010: 28
- 110: 40
- 001: 31
- 111: 7

Cardinality:

- singleton: 69
- pair: 53
- triple: 11

Thus the frozen UC4A normalization is not one-channel-only. Pair and triple defect directions are common.

Every drop-one-channel projection produced at least one ambiguity class in the consumed defect cohort. This is finite-cohort evidence only; it is not a universal pairwise-nonclosure theorem.

## CPCX result

Turn-6 unresolved physical classes: 45.

Open P1 boundaries after v0.2 source normalization: 45.

Exact v0.2 response-descent nonterminal rows: 304.

Source failures: 0.

Descent failures: 0.

Observed change masks:

- 000: 4
- 010: 160
- 110: 2
- 001: 1
- 011: 136
- 111: 1

Recurring across all seven sixth moves:

- 010
- 011

Cardinality over nonzero rows:

- singleton: 161
- pair: 138
- triple: 1

Drop-one-channel ambiguity counts:

- drop carrier C: 15
- drop support S: 2
- drop response R: 12

Again, these are finite-cohort diagnostics rather than universal nonclosure theorems.

## Best anonymous mask alignment

The best permutation in this first probe was:

- U-A -> C-R
- U-R -> C-S
- U-P -> C-C

Under that permutation:

UC4A recurring masks become:

- 100
- 010
- 011
- 111

CPCX recurring masks are:

- 010
- 011

So both CPCX recurring masks are present in the mapped UC4A recurring set.

All-mask overlap is 3 masks over a 7-mask union.

Recurring overlap is 2 masks over a 4-mask union.

## Critical limitation

Every CPCX row in this first sample had:

`transportKind = SUPPORT_TRANSITION`

Therefore the probe did **not** exercise the CPCX mechanisms most relevant to the proposed triadic rearrangement interpretation:

- same-track carrier transfer;
- anchor pivot;
- target inheritance;
- vertical staged re-expression;
- pair-hub / latent-singleton re-expression;
- normalization handoff.

This means the first run tested the ordinary one-layer turn-6 response band, not the later moving-seam chain that motivated the experiment.

The result is therefore a partial positive signal only.

## Next test

Build a seam-transition census from the later CPCX recurrence diagnostics and theorem controls, explicitly including:

1. protected-target same-track transfer;
2. anchor-pivot transfer;
3. target-inheritance handoff;
4. v0.2 controller saturation;
5. vertical three-stage -> two-stage transition;
6. pair-hub formation / overload;
7. pair-hub forced-normalization re-entry.

Normalize these without certificate names to the same CPCX C/S/R channels.

Then repeat the six-permutation comparison against the already-frozen UC4A side.

A materially stronger positive result would require carrier-changing CPCX rows to populate pair/triple masks and preserve the same anonymous coupling topology rather than merely matching support-only transitions.

## Claim boundary

Established:
- both consumed systems are multi-channel under the frozen independent normalizations;
- pairwise channel projections are ambiguous in both finite cohorts;
- the dominant CPCX recurring masks occur in the mapped UC4A recurring mask set.

Not established:
- UC4A-CPCX triadic isomorphism;
- a common transition algebra;
- a three-body structural equivalence;
- pairwise nonclosure as a universal theorem;
- remoteness impossibility;
- turn-6 closure.
