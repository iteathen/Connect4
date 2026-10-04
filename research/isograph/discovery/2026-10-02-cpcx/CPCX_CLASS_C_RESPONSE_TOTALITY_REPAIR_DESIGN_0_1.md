# CPCX Class-C response-totality repair design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Parent:** `CPCX_CLASS_C_EXISTING_THEOREM_AUDIT_0_1.md`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Close or further localize the one remaining Class-C seam after the canonical
`44444` turn-6 reduction.

The current post-macro Class-C controller state has no certified direct P0
first win and no existing protected-diagonal response-total handoff.

The strongest existing candidates are:

```
D6 -> P0 singleton target C3 -> reservoir coverage gap 2
G4 -> P0 singleton target C3 -> reservoir coverage gap 2
```

Both currently fail only with:

```
COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE
```

The next experiment asks exactly which current P1 frontier events remain
uncovered and why the already-admitted structural P0 responses fail.

## Quantifier discipline

This experiment uses the current CPCX proof semantics:

```
P0 controller turn: existential
  one qualified P0 witness is enough

P1 opponent turn: universal
  every current legal P1 event must be covered
```

It does not rank P1 losing moves and does not use remoteness.

## Existing structural proof class

The consumed theorem is:

`certifyCpcxReservoirCoverageGapRcic`.

Its allowed response set is already frozen:

1. the response prescribed by one best partial target-reservoir template;
2. a currently playable cell attached to one uncovered live P1 residual;
3. exact handoff to an existing CPCX first-win certificate or ordinary
   target-reservoir certificate;
4. otherwise a same-target reservoir-gap child only when the frozen
   lexicographic obstruction descriptor strictly decreases.

No arbitrary P0 response is admitted.

## Diagnostic extension

Do not change the theorem or its response set.

Expose, for each failed Class-C target-reservoir RCIC:

- unresolved root P1 triggers;
- unresolved lower-rank nodes;
- for each unresolved trigger:
  - P1 event cell;
  - whether P1 is immediately terminal;
  - admitted P0 response options;
  - rejected P0 responses;
  - rejection seam;
  - child gap and child descriptor;
  - residual attachment provenance where present.

The diagnostic must preserve the exact current-state fields already produced
inside the RCIC implementation.

## Candidate outcomes

### A. Missing existing handoff

A rejected response reaches a state already covered by another qualified CPCX
first-win theorem but `baseHandoff` does not consume it.

Action: compose that existing theorem explicitly and requalify.

### B. Descriptor too coarse / wrong order

An otherwise valid same-target child is rejected only because
`COVERAGE_RANK_NOT_DECREASING`, while a strictly smaller already-derived
structural resource exists.

Action: freeze a new descriptor before implementation and test globally on the
finite RCIC cohort.

### C. Missing structural response class

One P1 trigger has no admitted repair even though a rank-local response is
forced by CPC2, pair-hub, support-release, carrier transfer, or another existing
primitive.

Action: add only that theorem-backed response class and require universal
current-frontier qualification.

### D. Genuine new seam

No existing structural object provides a response and no sound strictly
decreasing descriptor is visible.

Action: preserve the negative result. Do not introduce search or outcome
labels.

## Acceptance for this diagnostic phase

The experiment succeeds as a localization step if every unresolved Class-C
RCIC trigger is mechanically assigned to one of A-D with exact evidence.

It closes Class C only if one of D6 or G4 becomes an exact P0 first-win
certificate under the unchanged winner-existence / loser-equivalence proof
rules.

## Prohibitions

- no solved W/D/L data;
- no oracle values;
- no minimax / negamax / alpha-beta;
- no arbitrary future legal-move DFS/BFS;
- no remoteness;
- no prior best-move labels;
- no production CPC changes;
- no production solver changes.

Current P1 frontier enumeration and structurally admitted P0 repair options are
part of the theorem quantifier and are allowed.
