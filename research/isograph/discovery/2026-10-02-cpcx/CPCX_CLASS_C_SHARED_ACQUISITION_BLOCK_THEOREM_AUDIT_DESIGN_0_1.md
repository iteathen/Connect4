# CPCX Class-C Shared Acquisition/Block Theorem Audit Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Qualified theorem run:** `37171239091`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Apply the independently qualified
`SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE` theorem to the exact
remaining Class-C controller cohort.

This audit does not yet modify the recurrence solver.

It asks whether the 38 locally safe rows previously identified by an ad hoc
diagnostic are reproduced by the generic qualified theorem and whether any
additional exact instances appear.

## Frozen cohort

Consume exactly the same 177 P0-to-move Class-C states used by:

`CPCX_CLASS_C_SUPPORT_RELEASE_ACQUISITION_AUDIT_0_1`.

These states are:

- descendants of the D6/G4 Class-C target-C3 reservoir cohort;
- after one current non-supply P1 event;
- not already covered by a support-release reservation action;
- `NO_IMMEDIATE_OBLIGATION` for P0.

No later free P1 frontier is generated.

## Audit

For every source state:

1. enumerate current live P0 residual targets at support distance one;
2. enumerate only the current legal P0 frontier;
3. call the unchanged qualified theorem for each
   `(residual,target,pinned action)`;
4. record exact certificates and fail-closed seams;
5. for each exact certificate, execute only its named supply and shared
   response, then deterministic forced normalization;
6. record exact state re-entry into the fixed Class-C physical cohort and
   existing P0/P1 first-win classification.

Current P0 frontier enumeration is diagnostic theorem discovery only; no
resulting action is admitted to the proof until this audit is frozen.

## Expected falsifier relation

The prior manual structural diagnostic found:

```
38 locally safe shared discharges
all target B4
```

A mismatch is not repaired post hoc:

- fewer theorem certificates means the generic theorem is stricter;
- more theorem certificates require inspecting why the former diagnostic
  omitted them.

## Output

Report:

- cohort state count;
- states with at least one exact theorem certificate;
- exact certificate count;
- D6/G4 split;
- target/action histograms;
- normalization outcomes;
- P0/P1 first-win outcomes;
- exact re-entry count into fixed Class-C nodes;
- theorem rejection seam histogram.

## Boundary

No solved data, oracle, minimax, remoteness, arbitrary future legal-move
traversal, production CPC change, or production solver change.
