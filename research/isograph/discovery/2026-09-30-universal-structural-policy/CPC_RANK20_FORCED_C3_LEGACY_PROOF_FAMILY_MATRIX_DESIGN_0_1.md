# RLC rank-20 forced-c3 legacy proof-family matrix 0.1

**Date:** 2026-10-01  
**Status:** frozen proof-library monotonicity matrix before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume the exact rank-28 forced-c3 children frozen by:

- `CPC_RANK20_FORCED_C3_TARGET_DISTANCE_LEGACY_REENTRY_PROBE_0_1.json`.

The source already establishes:

- exact JSMinSys ↔ semantic-quotient q identity for each child;
- source CPC restriction to defender c3;
- immediate Player-1 terminals on every non-c3 defender reply;
- the older repair-capacity and target-distance/resolved-tail-lexicographic routes do not close these children.

## Purpose

Before introducing a new proof primitive, query the remaining reusable legacy theorem engines whose declared guards can apply to the exact current states.

The matrix is route-union discovery, not a new theorem.

## Engines

### Lambda — generic target-distance / repair-capacity rank

`createGenericTargetDistanceMuProofEngine`

Measure:

[
lambda=(d_t,mu).
]

Use:

- `maxTargetDistance=5`;
- `maxProofStates=100000`;
- unrestricted root actions.

### Theta — target distance + auxiliary C/G capacity + repair capacity

`createGenericTargetAuxLexProofEngine`

Measure:

[
	heta=(d_t,chi,mu).
]

Use:

- `maxTargetDistance=5`;
- `maxProofStates=100000`;
- unrestricted root actions.

### Distance-2 target-support reentry

`proveDistance2TargetSupportReentry`

Applicable only when the exact target distance is 2.

Instantiate the existing resolved-tail lexicographic engine fresh and test the fixed target-support action followed by exact reply discharge.

### Distance-1 resolved-tail capacity

`createResolvedTailCapacityProofEngine`

Applicable only when target distance is 1 and the live target is one of the qualified standard C3/G3 targets.

## Exactness

For every engine execution:

- replay the exact child sequence in a fresh semantic-quotient kernel;
- verify the target singleton and declared guard;
- preserve logical rejection separately from resource failure;
- do not infer applicability merely from support;
- do not treat an inapplicable family as a theorem rejection.

The source q bridge is consumed as an exact identity premise; no alternate physical state is substituted.

## Output

For each child and engine record:

- applicable / not applicable and reason;
- target distance and starting measure;
- proof completed / resource failure;
- proved;
- proof kind;
- witness / witness kind;
- obligations / forced defense where exposed;
- first rejected branches;
- engine statistics.

Also report the union:

[
	ext{LegacyUnionClosed}(q)
=
igvee_i 	ext{Engine}_i(q).
]

If any engine closes a child, record the enclosing odd-rank source state as composition-ready because all non-c3 defender replies are already independently terminally closed.

## Success interpretation

A positive result identifies a concrete router omission: the proof already existed in an older generic family.

## Failure interpretation

If every applicable legacy engine completes and rejects all three exact states, the current obstruction has survived the generic legacy proof-library audit. That is materially stronger evidence that a new composition or theorem mechanism is required.

Resource failure is neither positive nor negative theorem evidence.

## Boundary

No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.
