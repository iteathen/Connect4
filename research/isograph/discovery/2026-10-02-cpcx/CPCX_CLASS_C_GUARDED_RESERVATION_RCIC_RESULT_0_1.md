# CPCX Class-C Guarded-Reservation RCIC Result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** falsified in frozen form; Class C remains open  
**Workflow:** `Research CPCX Class-C guarded-reservation RCIC`  
**Run:** `37170511257` — SUCCESS  
**Target:** winner-existence / loser-outcome-equivalence

## Question

Can the existing fixed Class-C reservoir cohort be closed by augmenting physical
states with the already-qualified support-release reservation theorem state,
without adding new physical P0 responses?

The frozen proof-state types were:

```
N(q)      ordinary exact P1-to-move Class-C RCIC state
T(q,r)    same physical state plus one exact support-release reservation token
```

The physical cohort and response set were frozen before execution.

## Result

No.

### D6 candidate

```
physical nodes:          244
reservation states:       27
certified N states:        0
certified T states:        0
root certified:        false
```

Root failure remains the current P1 event:

```
B3
```

At that boundary the immediate class is `FORCED_RESPONSE`, but neither the
deterministic normalization route nor the frozen existing reservoir response
reaches a certified child.

### G4 candidate

```
physical nodes:          674
reservation states:      165
certified N states:        0
certified T states:        0
root certified:        false
```

The root again first fails on current P1 `B3`.

Across both candidates:

```
physical nodes:          918
reservation states:      192
certified N states:        0
certified T states:        0
Class-C root witnesses:    0
```

The theorem-state memory is real, but it is not sufficient with the frozen
reservoir response set.

## Failure census

### D6 ordinary states

```
P1_TERMINAL:                    74
NO_ADMITTED_CERTIFIED_ROUTE:   170
```

All exact P1 terminal failures are on line 18:

```
B2-C2-D2-E2
```

with terminal cell `C2`.

Immediate classes among the nonterminal failures:

```
FORCED_RESPONSE:            71
NO_IMMEDIATE_OBLIGATION:    42
FORCED_LOSS_OVERLOAD:       57
```

### G4 ordinary states

```
P1_TERMINAL:                   226
NO_ADMITTED_CERTIFIED_ROUTE:   448
```

P1 terminal line IDs:

```
line 18  B2-C2-D2-E2: 223
line 68  D6-E5-F4-G3:   3
```

Immediate classes among the nonterminal failures:

```
FORCED_RESPONSE:           208
NO_IMMEDIATE_OBLIGATION:   110
FORCED_LOSS_OVERLOAD:      130
```

### Reservation states

No reservation state certified.

D6 token-state first blockers are concentrated on:

```
B6, C1, E5, B5, B3
```

G4 token-state blockers are concentrated on:

```
B5, C1, B3, B6, E6
```

The token's own supply event is sometimes applicable, but external current P1
events still require a controller route not present in the frozen reservoir
response set.

## Interpretation

The negative result is stronger than “reservation was not enough.”

The fixed reservoir cohort contains exact states where P1 already has the
first-terminal `C2` move. Those states cannot be rescued by a rank change or
by attaching a token after the fact.

A successful P0 recurrence must avoid entering those states.

The guarded reservation can prevent some such entries when its named supply
event occurs, but it does not supply enough P0 controller transitions on the
other current P1 events to create a certified base layer.

Therefore the missing object is now localized to a **new theorem-backed
controller transition**, not another scalar descriptor and not token memory
alone.

## Existing candidate for the missing transition

The immediately preceding Class-C diagnostic established 38 exact locally safe
instances of a distinct structural event:

```
P0 protected target = t
P1 supply releases t
P1 urgent singleton = t
P0:t simultaneously
  acquires/contracts the P0 protected residual
  and blocks/kills the P1 singleton
```

All 38 safe Class-C instances use target `B4`.

This is the previously frozen
`shared acquisition/block discharge` candidate.

The broad relaxation was already falsified:

```
safe:                              38
protected residual not acquired: 310
another P1 singleton remains:    272
```

Therefore any next theorem must preserve the exact narrow guards rather than
weakening acquisition globally.

## Next target

Freeze and qualify a generic:

`SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE`

with the exact shared-cell and first-win guards already tested by the
diagnostic.

Only after that theorem is independently qualified should it be admitted as an
additional Class-C P0 OR response and the finite recurrence re-solved.

## Claim boundary

Still unproved:

- Class-C P0 first-win closure;
- P0 first win after every legal sixth action from `44444`;
- turn-6 P1 outcome equivalence.

Preserved:

- no solved W/D/L data;
- no oracle;
- no minimax / negamax / alpha-beta;
- no remoteness;
- no arbitrary future legal-move traversal;
- production CPC unchanged;
- production solver unchanged.
