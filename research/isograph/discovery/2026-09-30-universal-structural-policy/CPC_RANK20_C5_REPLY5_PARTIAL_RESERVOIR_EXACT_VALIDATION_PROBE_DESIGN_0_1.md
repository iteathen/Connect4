# CPC rank-20 c5/reply-c5 partial-reservoir exact validation probe 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded structural probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source evidence

Consume:

- `CPC_RANK20_C5_REPLY5_TARGET_RESERVOIR_REJECTION_LOCALIZATION_0_1.json`.

Reconstruct every source state and every maximum-coverage pairing/prefix candidate independently at pinned JSMinSys authority.

## Motivation

The current target-reservoir synthesizer rejects a template unless every active Player-2 residual receives a static `coverageWitness`.

Localization found that four rank-27 states miss only:

- minimal singleton `{c3r5}`;
- nonminimal superset `{c1r5,c3r5}`.

The existing exhaustive `validateTemplate` checker is stronger operational evidence than the static coverage screen: it replays every legal defender trigger under the deterministic pairing response policy with first-win stopping.

Therefore test whether any maximum-coverage pairing is dynamically sound despite the syntactic coverage gap.

This does **not** change the target-reservoir acceptance rule.

## Candidate reconstruction

For every source state:

1. reconstruct the exact target-truncated capacity vector;
2. reconstruct each maximum-coverage synchronized-pair/prefix candidate recorded by the localization artifact;
3. build the exact `mate` and `role` arrays using the existing `buildPairMap`;
4. attach the original P1 singleton target;
5. run the unchanged exhaustive `validateTemplate` policy checker.

## Required evidence per candidate

Record:

- source state;
- target;
- pairing signature;
- syntactically uncovered residuals;
- validator pass/fail;
- defender node count;
- response pair count;
- max pair depth;
- P1 terminal count;
- target terminal count;
- complete first validator failures, capped only by the existing validator's diagnostic limit.

If a candidate passes, independently verify that its uncovered residuals are still genuinely uncovered by the frozen `coverageWitness` predicate. A pass must not result from accidentally changing the syntactic screen.

## Interpretation

### Positive

A candidate that:

- lacks full static coverage;
- but passes exact policy validation;

is evidence that the missing relation is temporal/race-like rather than an additional static blocker.

It becomes a candidate for an explicit `Before`/deadline theorem; the target-reservoir constructor remains unchanged until such a theorem is separately frozen and qualified.

### Negative

If every candidate fails exact validation, preserve the earliest failure kinds. A repeated `defender-terminal` at c3r5 would show that the uncovered singleton is a real safety obstruction rather than merely a conservative static-screen artifact.

## Boundary

No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.

The only recursion is the existing deterministic target-reservoir policy validator already used to qualify RCIC templates.

Production CPC, JSMinSys, target-reservoir acceptance semantics, and BSFP remain unchanged.

This is discovery evidence only.
