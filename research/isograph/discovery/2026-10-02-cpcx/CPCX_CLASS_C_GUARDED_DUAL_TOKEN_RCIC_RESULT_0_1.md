# CPCX Class-C Guarded Dual-Token RCIC Result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** falsified in frozen form; Class C remains open  
**Workflow:** `Research CPCX Class-C guarded dual-token RCIC`  
**Run:** `37171672022` — SUCCESS

## Question

Does the fixed Class-C physical cohort close when proof states may carry either:

- an exact support-release response reservation token; or
- an exact shared acquisition/block token?

No new physical P1-to-move nodes were permitted.

## Result

No Class-C proof state certified.

Aggregate:

```
physical nodes:                    918
response-reservation states:       192
shared-acquisition states:         241

certified ordinary states:           0
certified response-token states:     0
certified acquisition-token states:  0

certified Class-C roots:             0
```

### D6

```
physical nodes:              244
response tokens:              27
shared-acquisition tokens:    50
certified N/R/A:           0/0/0
root:                      false
```

### G4

```
physical nodes:              674
response tokens:             165
shared-acquisition tokens:   191
certified N/R/A:           0/0/0
root:                      false
```

## Root seam

Both roots still first fail on:

```
P1:B3
```

The exact immediate class after that event is:

```
FORCED_RESPONSE
```

For D6 the old reservoir layer has one current response option.
For G4 it has three.

No route available in the frozen dual-token graph reaches a certified child.

## Why the new theorem did not seed a base

The shared acquisition/block theorem creates many exact theorem states inside
the finite cohort, but all of those theorem states still have at least one
current P1 trigger with no certified continuation.

Route use remained sparse:

```
D6 direct P0 first-win rows used:  3
G4 direct P0 first-win rows used: 49
```

No theorem-token state became globally response-total.

## Important forced-normalization observation

The root `B3` seam is qualitatively different from the new shared-discharge
controller rows.

At the root:

1. P1 plays `B3`;
2. CPCX immediate semantics force P0 to answer;
3. deterministic normalization returns to an exact Class-C physical node.

The current recurrence records only the returned **physical state**.

It does not record whether the forced P0 response established a new guarded
support-release reservation for a still-latent P1 singleton.

This is a missing composition between:

```
FORCED_RESPONSE
-> forced P0 block
-> OPEN P1 boundary
```

and the already-qualified support-release reservation logic.

## Next target

Before adding any new physical response move, test whether deterministic forced
normalization establishes a theorem-state reservation at its returned P1
boundary.

The natural candidate is a direct opponent-turn reservation object:

```
P1-to-move q
+ latent P1 singleton t at support distance one
+ unique supply s
=> token:
   if P1:s then P0:t
```

under the same exact first-win/transport guards already used by
`SUPPORT_RELEASE_RESPONSE_EDGE`.

This object must be independently frozen and qualified before use.

## Claim boundary

Still unproved:

- Class-C first-win closure;
- P0 first win after every sixth move;
- turn-6 loser-equivalence.

No solved values, oracle, minimax, remoteness, or unrestricted future game-tree
traversal was used.
