# CPCX Class-C Forced-Normalization Seam Diagnostic Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Parent:** `CPCX_CLASS_C_SUPPORT_RELEASE_RESERVATION_DIAGNOSTIC_RESULT_0_1.md`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Classify the Class-C gap-1 rows that were not covered by the qualified
support-release reservation theorem.

The dominant negative seam was:

`SOURCE_OPPONENT_IMMEDIATE_SINGLETON`.

That means the exact P0-to-move child after the observed P1 event already has
an urgent P1 singleton. CPCX has an existing deterministic immediate-response
operator for precisely this situation.

This experiment asks whether those rows are ordinary forced-normalization
handoffs rather than a new proof primitive.

## Cohort

Use the same exact Class-C D6/G4 gap-1 states as the support-release
reservation diagnostic:

- P1 to move;
- live P1 singleton target `C2`;
- `supportDistance(C2)=1`.

For each current P1 event:

1. apply the exact P1 event;
2. exclude P1 terminal rows;
3. exclude the current `C1` supply row for the separate predecessor-
   reservation treatment;
4. perform the already-frozen support-release current-P0-action audit;
5. retain only rows with zero support-release-qualified P0 actions.

No new row is generated beyond this current P1 event.

## Immediate-boundary audit

For each retained exact P0-to-move child, record:

- `classifyCpcxImmediate`;
- `runCpcxFirstWinCertificate(...,{attacker:0})`.

If the immediate class is `FORCED_RESPONSE`, run only:

`closeCpcxForcedResponses`.

Record:

- exact normalization trace;
- terminal outcome if any;
- open normalized position if any;
- mover after normalization;
- P0/P1 playable singleton cells;
- whether the original P1 C2 residual survives;
- whether P0 target C3 is live and its support state;
- existing first-win/progress classification at the normalized boundary.

## Positive classes

A row may be classified as:

### DIRECT_P0_FIRST_WIN

An existing first-win certificate closes the P0 turn directly.

### FORCED_NORMALIZATION_P0_FIRST_WIN

Deterministic normalization itself reaches P0 first win.

### FORCED_NORMALIZATION_OPEN

The unique forced block resolves the current immediate obligation and reaches an
open P1-to-move boundary.

This is a structural handoff candidate only, not yet a proof, unless that
boundary is already independently certified.

### NO_FORCED_NORMALIZATION

The uncovered row has no existing deterministic immediate-response closure.

## Re-entry test

For an open normalized boundary, compare its exact physical state against the
already-materialized Class-C reservoir-gap node cohort.

Report:

- exact state-key re-entry;
- node gap/descriptor when matched;
- whether it is structurally lower than the pre-normalization node under the
  frozen obstruction coordinates.

This comparison does not solve the matched node.

## Falsifier

If most uncovered rows are not forced-normalization rows, or normalization
lands outside the known structural cohort without an existing certificate,
preserve the result.

Do not convert an open normalized state into a win by assumption.

## Search boundary

Allowed:

- one current P1 event;
- exact immediate classification;
- unique CPCX forced-response normalization;
- existing first-win/progress theorem calls;
- exact state-key comparison against already-generated structural nodes.

Forbidden:

- arbitrary P0 response enumeration for the retained rows;
- a second free P1 frontier;
- recursive legal-move traversal;
- solved values;
- oracle;
- minimax;
- remoteness.

Production CPC and production solver remain unchanged.
