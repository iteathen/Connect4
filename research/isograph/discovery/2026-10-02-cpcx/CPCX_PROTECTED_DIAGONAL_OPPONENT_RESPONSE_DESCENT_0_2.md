# CPCX Protected Diagonal Opponent-Response Descent 0.2

**Status:** frozen composition contract before implementation
**Scope:** experimental CPCX only
**Parent:** CPCX_PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT_0_1

## Purpose

Extend the qualified one-layer opponent-response descent automaton with two independently qualified CPCX edges while preserving its one-current-frontier scope and well-founded measure.

v0.2 changes only:

1. protected-target occupation transport order becomes SAME_TRACK -> ANCHOR_PIVOT -> TARGET_INHERITANCE;
2. deterministic controller closure uses Protected Diagonal Controller Saturation 0.2.

No second free opponent layer is consumed.

## State and measure

Use the same exact opponent-to-move position, one live protected controller diagonal, and lexicographic extended measure:

mu = (missingCount, supportDebt, remainingPhysicalCapacity).

## One current opponent event

For each current legal opponent frontier event:

- if the event does not occupy a protected target, use the unchanged protected support-transition theorem;
- if it occupies a protected target, try qualified same-track transfer;
- if that fails, try qualified anchor-pivot transfer;
- if that fails, try qualified target-inheritance handoff;
- if all three fail, fail closed.

After exact transport, the controller obtains the turn. Close only through:

- unique forced normalization; and
- Controller Saturation 0.2.

The row must end either in CERTIFIED_FIRST_WIN(controller) or at an exact open opponent boundary with strict extended-measure decrease.

## Full current-frontier theorem

Quantify exactly the current legal opponent frontier. Every row must be exact and must win or strictly decrease mu. This is the same finite current-response class as v0.1; no child frontier is recursively generated.

## Termination and complexity

Every accepted transfer/controller macro strictly decreases mu. Current response count is at most board width. Every component is polynomial in live-line count, board capacity, and fixed residual cardinality K<=4.

## Required qualification controls

- preserve the v0.1 fresh response-total source 2244422;
- preserve fresh same-track target-block closure;
- preserve fresh anchor-pivot target-block closure;
- add the fresh target-inheritance control 12222 after its E1 block;
- preserve source-immediate precedence rejection;
- preserve opponent-terminal target-block rejection;
- demonstrate one poison-release controller closure repaired by saturation v0.2;
- production CPC / solver / oracle / recursion isolation.

## Turn-6 boundary

The three one-window A6 seams are the target application. v0.2 may hand off A6-B5-C4-D3 to A2-B3-C4-D5 by target inheritance, then close controller progress through saturation v0.2.

This theorem establishes one response-total descent layer only. Universal turn-6 first-win closure still requires showing its smaller endpoints remain inside the finite admitted recurrence or terminate.
