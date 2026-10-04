# CPCX Class-C Support-Release Acquisition Audit Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Qualified theorem:** `CPCX_SUPPORT_RELEASE_ACQUISITION_0_1.md`  
**Qualification run:** `37168820777` — 7/7 PASS  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Test whether the remaining 177 Class-C P0 controller states admit an exact
owner-side support-release acquisition edge that is not currently routed by
`classifyCpcxProgress`.

Do not fit the test to C3.

For each state, inspect every live P0 residual and every missing target in that
residual whose exact support distance is one.

## Cohort

Use exactly the 177 P0-to-move states frozen by the winner-turn progress-router
diagnostic:

- source is a Class-C D6/G4 gap-1 P1 boundary carrying P1 C2 at support distance
  one;
- one current non-supply P1 event has occurred;
- the event is nonterminal;
- no P0 support-release-response reservation action covers the state;
- immediate class is `NO_IMMEDIATE_OBLIGATION`.

No later state is generated to define the cohort.

## Flat acquisition audit

For each cohort state:

1. scan exact live P0 residuals;
2. enumerate every residual missing cell with support distance exactly one;
3. enumerate the current legal P0 frontier;
4. call the already-qualified
   `certifyCpcxSupportReleaseAcquisition` for each
   `(residual,target,current P0 action)` tuple;
5. retain only exact `SUPPORT_RELEASE_ACQUISITION_EDGE` certificates.

The row is acquisition-covered if at least one exact certificate exists.

This is winner-turn OR over current theorem-certified controller actions.

## Output

Report for D6 and G4:

- cohort state count;
- count containing any P0 depth-one residual target;
- total distinct P0 depth-one targets;
- acquisition-covered state count;
- exact certificate count;
- target-cell histogram;
- pinned P0 action histogram;
- theorem rejection seam histogram;
- overlap with the 25 existing playable-two-piece rows.

## Optional exact discharge classification

For each exact acquisition certificate, mechanically execute only the theorem's
named SUPPLY branch:

```
P0 pinned action
-> P1 supply trigger
-> P0 target acquisition
```

and then run deterministic forced normalization plus existing first-win
classification.

This does not erase the theorem's EXTERNAL class; it only characterizes the
named acquisition branch.

## Falsifier

If no or few cohort states admit an acquisition edge, preserve that result.
Do not broaden the target set after execution.

## Search boundary

Allowed:

- current P0 frontier audit;
- exact theorem call;
- named theorem SUPPLY branch;
- deterministic forced normalization.

Forbidden:

- arbitrary later P1 reply enumeration;
- recursive legal-move search;
- solved values;
- oracle;
- minimax;
- remoteness.

Production CPC and production solver remain unchanged.
