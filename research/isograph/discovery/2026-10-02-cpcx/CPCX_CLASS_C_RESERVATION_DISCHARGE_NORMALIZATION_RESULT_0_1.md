# CPCX Class-C reservation discharge normalization result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** strong partial positive; token semantics qualified on the Class-C cohort  
**Workflow:** `Research CPCX Class-C reservation discharge`  
**Run:** `37168694203` — SUCCESS  
**Target:** winner-existence / loser-outcome-equivalence

## Question

When a Class-C transition carries an exact
`SUPPORT_RELEASE_RESPONSE_EDGE` token, what happens if P1 later plays the
token's named supply event and P0 executes the reserved response?

## Cohort

The exact Class-C D6/G4 reservoir DAG contained:

```
407 theorem-certified reservation-bearing predecessor edges
186 distinct (child state, trigger, response) reservation states
```

Each token was discharged mechanically:

```
P1 supply trigger
-> reserved P0 response
-> deterministic forced normalization
-> existing CPCX progress/first-win classifier
```

No alternative response was enumerated.

## Aggregate result

Forced-normalization result immediately after token discharge:

```
OPEN                         146
CERTIFIED_FIRST_WIN(P0)       40
```

Normalization step counts ranged from 0 through 5.

At the resulting exact boundary, the existing P0 progress classifier reported:

```
CERTIFIED_FIRST_WIN           71
CERTIFIED_FORCING_MACRO       23
DISJUNCTIVE_BLOCK_OBLIGATION  11
PROJECTION_ONLY               16
NO_CERTIFICATE                65
```

The bounded existing first-win runner on the final boundary produced:

```
CERTIFIED_FIRST_WIN           74
NO_CERTIFICATE               112
```

Player direction matters:

```
reservation states ultimately certified P0 first win: 51
reservation states ultimately certified P1 first win: 23
still unresolved:                              112
```

No normalized state exactly re-entered the current target-C3 reservoir node
cohort.

## D6

```
distinct reservation states: 27
predecessor edges:            42
P0 first-win states:          10
P1 first-win states:           6
unresolved:                   11
```

## G4

```
distinct reservation states: 159
predecessor edges:            365
P0 first-win states:           41
P1 first-win states:           17
unresolved:                   101
```

## Interpretation

The response reservation is a real proof-state variable and its discharge is
load-bearing.

It cannot be treated as a universally safe token:

- 51 token states close positively for P0;
- 23 exact token states lead to a certified P1 first win after discharge and
  therefore must be excluded from any controller policy;
- 112 remain structurally unresolved.

Thus an augmented RCIC must select reservation-bearing P0 actions
**claim-relatively**. Token existence alone is insufficient.

The result also shows why the old scalar reservoir descriptor could not close
the recurrence: two child positions with similar reservoir geometry can differ
in the theorem state carried by the predecessor transition, and the exact
discharge outcome can differ in terminal direction.

## Next existing theorem to test

The owner-side dual,
`certifyCpcxSupportReleaseAcquisition`, is not currently routed by
`classifyCpcxProgress`.

The Class-C seam contains the stacked column:

```
P1 latent singleton: C2
P0 protected target: C3
```

so an exact P0 transition may carry an **acquisition** obligation even when it
cannot safely carry the P1-block reservation.

Before inventing a new primitive, test that theorem on the unresolved
P0-to-move Class-C cohort with the same frozen one-step current-frontier
discipline.

## Claim boundary

Still unproved:

- reservation-augmented RCIC closure;
- Class-C first win;
- all seven sixth-move losses;
- turn-6 outcome equivalence.

No solved values, oracle, minimax, remoteness, or unrestricted reply search were
used.
