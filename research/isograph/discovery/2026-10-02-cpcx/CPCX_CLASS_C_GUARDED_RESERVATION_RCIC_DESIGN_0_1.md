# CPCX Class-C Guarded-Reservation RCIC Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Target:** winner-existence / loser-outcome-equivalence

## Purpose

Re-solve the existing finite Class-C reservoir-gap proof DAG after adding only
the theorem state already qualified by the preceding experiments.

Do not expand the physical state cohort.

Do not add arbitrary P0 legal responses.

The question is whether the existing Class-C D6/G4 RCIC failed because it
discarded a qualified support-release reservation carried by some existing P0
repair edges.

## Fixed physical cohort

Use exactly the nodes already materialized by the capacity-instrumented
reservoir-gap RCIC for:

```
Class C -> D6 -> target C3
Class C -> G4 -> target C3
```

No new physical child position may be admitted unless it is:

- an exact terminal; or
- the result of deterministic forced normalization and exactly matches a
  physical node already in the cohort.

The capacity-extended descriptor is **not** used as proof authority. Its node
set is only the superset materialization from the falsifier run.

## Proof-state types

### N(q) — ordinary state

Exact P1-to-move physical RCIC node `q` with no carried reservation used by
the proof.

### T(q,r) — guarded reservation state

The same exact P1-to-move physical node plus one exact
`SUPPORT_RELEASE_RESPONSE_EDGE` certificate `r` established by the P0
event that entered `q`.

The token contains:

- protected P1 residual line provenance;
- one named P1 supply trigger;
- one named reserved P0 response.

The physical state is not altered by the token.

## Existing trigger coverage

The source RCIC already distinguished P1 triggers it could close immediately
from its unresolved triggers.

Those existing closed triggers remain closed.

This experiment evaluates only the source node's frozen
`unresolvedTriggers`.

## P0 response options for an unresolved P1 trigger

After the exact P1 event, allowed P0 proof routes are:

### A. Existing structural RCIC responses

Use exactly the existing `trigger.options` rows produced by the frozen
reservoir-gap RCIC.

A child may be used as:

- `N(child)`;
- `T(child,r)` if that exact existing P0 response independently qualifies a
  support-release response reservation for the live P1 C2 singleton.

No other physical P0 action is admitted by this experiment.

### B. Existing P0 first-win certificate

Run the existing bounded deterministic:

`runCpcxFirstWinCertificate(afterP1,{attacker:0})`.

If it returns exact P0 first win, the trigger is closed terminally.

A P1 first-win result is not usable.

### C. Existing deterministic forced normalization

If the P0-to-move child has an exact `FORCED_RESPONSE`, apply only
`closeCpcxForcedResponses`.

The trigger is closed if normalization proves P0 first win.

Otherwise an OPEN normalized state may be used only if:

- mover is P1;
- its exact physical key matches a node already in the fixed cohort.

That edge enters `N(q')`; the reservation is not inferred.

## Additional option in T(q,r)

For the token's named P1 supply trigger only, add the theorem-prescribed
reserved P0 response.

Execute:

```
P1 supply
-> reserved P0 response
-> deterministic forced normalization
```

The supply trigger is closed if the result is:

- exact P0 first win; or
- an OPEN P1-to-move state whose exact physical key is already in the cohort
  and whose `N(q')` state is certified.

If exact P1 first win is reached, that token route fails.

If the result is unresolved P0-to-move or lies outside the fixed cohort, the
token route fails closed.

The ordinary existing response options for the same trigger remain available;
the token is an additional theorem-backed OR option, not a mandatory move.

## AND / OR semantics

At a P1 node:

```
AND over every frozen unresolved current P1 trigger
```

Each trigger is covered if at least one admitted P0 proof route succeeds.

At the P0 response point:

```
OR over theorem-admitted structural responses only
```

This is not a best-delay or remoteness calculation.

## Bottom-up solution

Every nonterminal proof edge consumes at least one physical event and every
edge to another P1 RCIC node has strictly larger board rank.

Use:

```
remainingCapacity = 42 - rank
```

only as the well-founded termination coordinate for the already-certified
edges.

It is not treated as a safety/value descriptor; the earlier capacity-only
falsifier remains negative.

Solve states in decreasing physical rank.

For equal physical rank, `T(q,r)` and `N(q)` have no edges to one another,
so no same-rank fixed point is required.

## Output

For D6 and G4 report:

- physical node count;
- reservation-state count;
- certified N-state count;
- certified T-state count;
- root N-state status;
- count of repaired triggers by route:
  - existing RCIC child;
  - first-win;
  - forced normalization;
  - reservation child;
  - reservation discharge;
- remaining unresolved root triggers;
- minimum rank at which certification first appears;
- exact witness policy for the root if certified.

## Success

If either D6 or G4 root `N(q)` certifies, Class C gains an exact P0
winner-existence witness under the current theorem set.

That result must then be composed into the surrounding turn-6 recurrence before
claiming all-seven move equivalence.

## Falsifier

If neither root certifies, preserve the certified subgraph and remaining seam.
Do not widen P0 responses post hoc.

## Boundaries

No solved W/D/L data, oracle, minimax, remoteness, arbitrary future P0 move
enumeration, production CPC change, or production solver change.
