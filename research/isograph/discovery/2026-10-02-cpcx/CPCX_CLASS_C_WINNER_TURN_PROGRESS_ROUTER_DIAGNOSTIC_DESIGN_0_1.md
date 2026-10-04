# CPCX Class-C Winner-Turn Progress Router Diagnostic Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Parent:** `CPCX_CLASS_C_FORCED_NORMALIZATION_SEAM_DIAGNOSTIC_RESULT_0_1.md`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Apply the correct winner-turn quantifier to the 177 remaining Class-C
P0-to-move states with:

`NO_IMMEDIATE_OBLIGATION`.

At a P0 turn, CPCX does **not** need to preserve one preselected reservoir
response family. It needs only one already-qualified structural continuation.

The existing `classifyCpcxProgress` router is the canonical OR-selector over
the qualified CPCX theorem families.

This experiment asks how far the existing router closes those 177 states
without inventing any new action rule.

## Cohort

Reproduce exactly the retained rows from the preceding diagnostics:

1. Class-C D6/G4 gap-1 P1-to-move states carrying P1 C2 at support distance 1;
2. one current non-supply P1 event;
3. no P1 terminal;
4. zero support-release-qualified P0 reservation actions;
5. exact P0 child classified `NO_IMMEDIATE_OBLIGATION`.

The expected cohort size from the frozen predecessor result is 177.

## Existing winner-turn operator

At each exact P0 state call:

```
classifyCpcxProgress(position,{player:0})
```

No physical P0 move enumeration is permitted in this experiment.

Record the first structural class:

- `CERTIFIED_FIRST_WIN`;
- `CERTIFIED_FORCING_MACRO`;
- `DISJUNCTIVE_BLOCK_OBLIGATION`;
- `FORCED_NORMALIZATION` if unexpectedly present;
- `PROJECTION_ONLY`;
- `NO_CERTIFICATE`.

## Deterministic composition

For an exact progress result, compose only the already-defined operator:

- forcing macro -> `composeCpcxForcingMacro`;
- disjunctive block -> `composeCpcxDisjunctiveBlockObligation`;
- forced normalization -> `composeCpcxForcedNormalization`.

Repeat the existing deterministic router only while the resulting carrier is
exact and the next operation is already qualified.

This is the same bounded structural composition used by
`runCpcxFirstWinCertificate`; it is not a legal-move search.

Stop at:

- exact P0 first win;
- exact P1 first win / overload;
- concrete `NO_CERTIFICATE`;
- projection-only boundary;
- unresolved abstract successor.

## Output

For D6 and G4 report:

- retained state count;
- first progress-kind histogram;
- exact P0 first-win count;
- deterministic trace-signature histogram;
- final seam histogram;
- final concrete versus abstract boundary count;
- for concrete final states, exact state-key re-entry into the existing
  Class-C reservoir cohort;
- exact descriptor of matched states.

The diagnostic should expose whether the 177 rows reduce to a small number of
already-known proof seams.

## Acceptance

A useful positive result need not close all 177 states.

It is sufficient to reduce them, without new rules, to a much smaller
structural boundary class suitable for one new theorem.

A complete positive result would certify every retained state as P0 first win.

## Falsifier

If the existing router makes no structural progress on most states, preserve
that result. Do not enumerate arbitrary P0 moves to repair it.

## Search boundary

Forbidden:

- arbitrary legal P0 response enumeration after cohort selection;
- arbitrary later P1 frontier enumeration;
- minimax / negamax / alpha-beta;
- solved values / oracle;
- remoteness;
- recursive game-tree traversal.

Allowed:

- existing deterministic structural theorem composition;
- finite current-state polynomial operators;
- exact state-key comparison to already-generated structural cohorts.

Production CPC and production solver remain unchanged.
