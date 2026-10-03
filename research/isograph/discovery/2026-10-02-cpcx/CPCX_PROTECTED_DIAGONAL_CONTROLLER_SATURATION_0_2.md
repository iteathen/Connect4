# CPCX Protected Diagonal Controller Saturation 0.2

**Status:** frozen composition contract before implementation
**Scope:** experimental CPCX only
**Parent:** CPCX_PROTECTED_DIAGONAL_CONTROLLER_SATURATION_0_1.md

## Purpose

Extend the qualified controller-saturation automaton by one independently qualified fallback edge without changing v0.1.

v0.1 repeatedly applies highest-target protected descent followed only by deterministic forced normalization and stops at the first open opponent boundary.

v0.2 preserves that order. The only addition is: if and only if highest-target descent fails with HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON, apply the qualified Protected Diagonal Playable-Target Fallback 0.1. No other v0.1 failure is repaired.

## State and measure

Use the same exact nonterminal controller-to-move source, one live protected diagonal, and lexicographic measure mu(R)=(missingCount(R), supportDebt(R)).

## Controller step

1. Invoke qualified highest-target descent.
2. If exact, use it exactly as v0.1.
3. If it certifies controller first win, stop.
4. If it fails with any seam other than HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON, fail closed.
5. On exactly that seam, invoke the qualified playable-target fallback.
6. The fallback must return controller first win or an exact same-line contraction with strict mu decrease.
7. After the controller step, use the unchanged v0.1 forced-normalization logic.

## Conclusion

Emit CERTIFIED_FIRST_WIN(controller), or PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2 with an exact normalized opponent-to-move boundary and final live protected diagonal satisfying mu(final) < mu(source). The trace records whether each controller step used HIGHEST_TARGET_DESCENT or PLAYABLE_TARGET_FALLBACK.

## Termination and complexity

Every accepted controller step strictly decreases mu. Forced normalization cannot increase protected missing cardinality or support debt and consumes physical capacity. The same polynomial termination bound as v0.1 applies. No free opponent action or recursive reply traversal is introduced.

## Required qualification controls

- v0.1 fresh one-step positive remains exact with the same final physical boundary.
- v0.1 forced-normalization multi-step positive remains exact.
- fresh poisoned-highest fixture 23355162534364 closes through PLAYABLE_TARGET_FALLBACK.
- a non-poison highest-target failure still fails closed.
- direct controller first win remains preserved.
- production CPC / solver / oracle / recursion isolation.

## Turn-6 boundary

The target-inheritance A6 seam with A2-B3-C4-D5 missing {B3,C4}, support [0,3] is the consumed application target. v0.1 rejects hidden C4 support because it releases an opponent singleton; v0.2 may acquire playable B3.

This theorem is controller closure only. It does not by itself establish opponent response totality or Best(44444).
