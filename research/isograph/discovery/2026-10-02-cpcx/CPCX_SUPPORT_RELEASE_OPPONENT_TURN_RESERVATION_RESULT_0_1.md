# CPCX Opponent-Turn Support-Release Reservation Result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** qualified generic theorem  
**Workflow:** `Research CPCX opponent-turn reservation theorem`  
**Run:** `37171910003` — SUCCESS

## Qualified theorem

`certifyCpcxSupportReleaseOpponentTurnReservation`

derives, directly from an exact current-player boundary:

```
owner-to-move q
+ live owner singleton t at support distance one
+ unique support s
+ first-win/transport guards
=>
SUPPORT_RELEASE_OPPONENT_TURN_RESERVATION
  owner:s -> controller:t
```

No preceding freely selected controller event is part of the theorem.

## Qualification

All five frozen controls passed:

1. fresh positive `11221`;
2. supply-overload negative `11222`;
3. post-response transported-singleton negative `121121`;
4. source immediate-singleton precedence control;
5. production/solver/oracle/search isolation.

## Significance for Class C

This theorem can be derived from a P1-to-move physical state itself.

Therefore a deterministic forced-normalization edge may preserve more proof
information than:

```
physical child q
```

alone.

If the normalized q satisfies this theorem, the recurrence may instead record:

```
q
+ exact conditional reservation
```

without requiring the earlier forced P0 block to satisfy the older
pre-pinned support-release theorem.

This is precisely the composition missing from the root `B3`
forced-response seam.

## Claim boundary

Qualification does not establish that the Class-C normalized roots satisfy the
theorem and does not close Class C.
