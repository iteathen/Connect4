# CPCX Class-C Reservation Discharge Normalization Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Parent:** `CPCX_CLASS_C_WINNER_TURN_PROGRESS_ROUTER_DIAGNOSTIC_RESULT_0_1.md`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Test the operational meaning of the support-release reservation token already
observed in the exact Class-C recurrence.

A token is created only by an exact:

`SUPPORT_RELEASE_RESPONSE_EDGE`.

The token names:

- one P1 supply trigger cell;
- one reserved P0 response cell;
- one protected P1 residual.

This experiment consumes the token on the exact child P1-to-move state.

## Frozen macro

For each reservation-bearing RCIC transition:

1. reconstruct the exact child state reached after the predecessor current P1
   event and the theorem-qualified P0 action;
2. verify the child is the state named by the RCIC edge;
3. apply the token's exact P1 supply trigger;
4. apply the token's exact reserved P0 response;
5. preserve first-terminal stopping;
6. from the resulting exact state run only deterministic
   `closeCpcxForcedResponses`;
7. classify the resulting boundary with the existing CPCX progress/first-win
   router.

No alternative P0 response is considered.

## Why forced closure is separate

The support-release theorem proves that its reserved P0 block kills the named
P1 singleton and leaves no immediately playable P1 singleton.

It does not erase a newly exposed P0 singleton.

When the reserved block exposes a P0 immediate completion, the next P1 event is
a deterministic forced block. That event is part of CPCX immediate
normalization and may transport the proof into a new structural class.

This is exactly the state transition the reservation token is intended to
represent.

## Output

For every exact reservation edge report:

- predecessor/current event;
- P0 action that created the token;
- child state key;
- token trigger and reserved response;
- exact two-event discharge;
- forced-normalization step count and cells;
- terminal player if any;
- open normalized rank/mover/support;
- existing P0 first-win/progress classification;
- exact re-entry into the current Class-C reservoir cohort if present.

Deduplicate identical reservation states by:

`(child state key, trigger cell, response cell)`.

## Positive result

A strong positive result is that reservation discharge consistently maps the
token-bearing state to:

- a P0 first win; or
- a deterministic open boundary with an existing certificate; or
- an exact smaller structural state suitable for the augmented RCIC.

## Falsifier

Preserve any token whose exact discharge:

- produces P1 first terminal;
- violates its own theorem provenance;
- reaches an unresolved boundary with no structural descent.

Do not repair the token semantics after seeing the result.

## Search boundary

Only theorem-certified token events and deterministic forced normalization are
executed.

No arbitrary legal response enumeration, minimax, solved value, oracle,
remoteness, or recursive game-tree traversal is permitted.

Production CPC and production solver remain unchanged.
