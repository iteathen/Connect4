# CPCX Protected Diagonal Controller Saturation 0.1

**Status:** frozen theorem contract before implementation
**Scope:** experimental CPCX only
**Observation:** deterministic controller progress plus forced normalization

## Purpose

Compose two already-qualified CPCX mechanisms into one branch-free macro:

1. deterministic highest-row protected-diagonal descent on the controller turn;
2. deterministic forced-response normalization on the opponent turn.

If forced normalization returns the move to the controller, repeat step 1.
Stop only at:

- a certified controller first win; or
- an exact nonterminal opponent-to-move boundary with no immediate obligation.

No free opponent action is chosen inside this macro.

## Objects

Let S be one exact nonterminal position with controller A to move and one live
protected diagonal residual R owned by A.

Let

    mu(R) = (missingCount(R), supportDebt(R))

ordered lexicographically.

## Transition loop

### Controller step

Apply CPCX Protected Diagonal Highest-Target Descent.

It must return either:

    CERTIFIED_FIRST_WIN(A)

or an exact child with a live protected diagonal residual R' and:

    mu(R') < mu(R).

The child has opponent D to move.

### Opponent forced boundary

Classify the exact child.

If the boundary is NO_IMMEDIATE_OBLIGATION, stop and emit the normalized
opponent boundary.

If the boundary is FORCED_RESPONSE, apply CPCX Protected Residual Forced
Normalization. This consumes only unique forced events.

Forced normalization may:

- certify A first win;
- preserve or contract the protected residual and stop at an open boundary.

It may not increase protected missing cardinality or support debt.

If the normalized open boundary has D to move, stop.

If it has A to move, repeat the controller step.

Any opponent immediate terminal, controller response overload, protected target
kill by the opponent, unsupported immediate class, or failed protected
transition fails closed.

## Conclusion

Emit one of:

    CERTIFIED_FIRST_WIN(A)

or:

    PROTECTED_DIAGONAL_CONTROLLER_SATURATION
      finalPosition = exact normalized D-to-move boundary
      finalResidual = live protected diagonal residual
      sourceMeasure = mu(R)
      finalMeasure < sourceMeasure
      finalBoundary = NO_IMMEDIATE_OBLIGATION

Thus one macro application makes strict protected progress and returns to a
normalized opponent decision boundary without introducing an arbitrary reply.

## Termination and complexity

Every controller step strictly decreases mu.

Every forced-normalization event increases physical rank and cannot increase mu.

Therefore the deterministic loop terminates. With K<=4 and finite board
capacity:

    controllerSteps <= sourceMissingCount + sourceSupportDebt
    forcedSteps     <= remaining physical capacity

The implementation is polynomial in live-line count, board capacity and fixed
residual cardinality. It performs no legal-reply branching.

## First-win discipline

Every physical event is applied with exact first-terminal stopping.

NO_CERTIFICATE remains epistemic only.

## Required qualification controls

1. fresh source requiring no forced normalization after one controller descent;
2. fresh source whose controller descent creates one forced opponent response;
3. a source where forced normalization returns the turn to the controller and
   a second highest-target descent is required;
4. direct controller first-win termination;
5. rejection when the highest-target theorem rejects a support-release hazard;
6. production-CPC / solver / oracle / recursion isolation.

## Turn-6 application boundary

The current A-cycle evidence contains 84 exact controller decision states. The
highest-target operator is exact on all 84. Eleven selected protected progress
moves create a forced-response boundary; those are the target application for
this macro.

This theorem does not quantify free P1 replies and therefore does not by itself
prove Best(44444).
