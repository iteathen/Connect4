# CPCX Class-C Opponent-Turn Reservation Audit Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Qualified theorem run:** `37171910003`  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Test whether the newly qualified
`SUPPORT_RELEASE_OPPONENT_TURN_RESERVATION` theorem is present on exact
P1-to-move states in the frozen Class-C physical cohort, especially the states
returned by the root `B3` forced-response normalization.

This is a diagnostic only. It does not yet change the recurrence solver.

## Frozen cohort

Use exactly the D6/G4 fixed physical nodes from the capacity-instrumented
Class-C RCIC.

No new physical state is generated except:

- the exact one-current-event root `B3` child;
- deterministic forced normalization already qualified by CPCX.

The normalized boundary must exactly re-enter the fixed cohort.

## Audit A — all fixed nodes

For every fixed P1-to-move node:

1. enumerate current live P1 singleton residuals at support distance one;
2. call the qualified opponent-turn reservation theorem;
3. record exact theorem tokens:
   - residual line;
   - trigger;
   - reserved response;
   - physical node rank/support.

No P0 action is selected.

## Audit B — root forced-normalization seam

For each Class-C root (D6 and G4):

1. apply current P1 `B3`;
2. require CPCX `FORCED_RESPONSE`;
3. close deterministic forced responses;
4. require OPEN P1-to-move exact fixed-node re-entry;
5. run Audit A on that exact normalized boundary.

Report whether the normalized root acquires a reservation token, and its exact
trigger/response.

## Output

- fixed node count;
- nodes with one or more exact opponent-turn reservations;
- token count;
- trigger/response/residual histograms;
- rank distribution;
- D6/G4 root B3 normalized child key;
- exact token set on each normalized root child.

## Boundary

No solved data, oracle, minimax, remoteness, arbitrary P0 action enumeration,
recursive free-response traversal, production CPC change, or production solver
change.
