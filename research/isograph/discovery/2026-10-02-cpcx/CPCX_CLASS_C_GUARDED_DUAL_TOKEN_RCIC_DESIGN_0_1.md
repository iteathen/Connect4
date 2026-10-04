# CPCX Class-C Guarded Dual-Token RCIC Design 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** frozen before execution  
**Target:** winner-existence / loser-outcome-equivalence  
**Parents:**
- `CPCX_CLASS_C_GUARDED_RESERVATION_RCIC_RESULT_0_1.md`
- `CPCX_CLASS_C_SHARED_ACQUISITION_BLOCK_THEOREM_AUDIT_RESULT_0_2.md`

## Purpose

Re-solve the same fixed Class-C physical proof graph after admitting the newly
qualified shared acquisition/block theorem as a second theorem-state token.

The failed reservation-only experiment established that proof-state memory is
real but insufficient.

The new experiment asks whether the missing controller transition is supplied
by exact shared acquisition/block edges while preserving the same finite
physical cohort and AND/OR proof semantics.

## Fixed physical cohort

Use exactly the capacity-instrumented Class-C reservoir nodes already frozen
for:

```
Class C -> D6 -> target C3
Class C -> G4 -> target C3
```

No new P1-to-move physical state is admitted.

A newly generated theorem edge may enter the recurrence only if its exact
P1-to-move physical child matches a node already in this cohort.

Terminal P0 exits remain allowed.

Deterministic normalization may re-enter only an exact fixed node.

## Proof-state types

### N(q)

Ordinary exact P1-to-move physical node with no theorem token used by the
current proof state.

### R(q,r)

Exact node plus one already-qualified
`SUPPORT_RELEASE_RESPONSE_EDGE` token:

```
P1 supply trigger -> reserved P0 block response
```

This is the token used in the previous guarded-reservation RCIC.

### A(q,a)

Exact node plus one qualified
`SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE` token established by the P0
event that entered `q`.

The token contains:

- one named P1 supply trigger;
- one named P0 shared response;
- protected P0 residual provenance;
- opponent singleton discharge provenance.

No token changes the physical board state.

## Current P1 node semantics

At every proof state:

```
AND over every frozen unresolved current P1 trigger
```

A trigger is closed if one permitted P0 proof route succeeds.

Previously selected exact base/terminal trigger closures from the source RCIC
remain closed and need not be re-proved.

## Ordinary P0 routes after an unresolved P1 trigger

### 1. Existing reservoir route

Use exactly the already-generated source RCIC response options.

A lower physical child may enter:

- `N(child)`;
- `R(child,r)` if that exact existing response establishes a qualified
  response-reservation token.

No other interpretation is added.

### 2. Existing direct P0 first win

Use the existing bounded first-win certificate on the exact P0-to-move child.

### 3. Existing deterministic forced normalization

If current immediate semantics require one forced response, use only
`closeCpcxForcedResponses`.

Accept:

- P0 first win; or
- OPEN P1-to-move exact fixed-node re-entry into `N(child)`.

### 4. New qualified shared acquisition/block route

On the exact P0-to-move child after the observed P1 trigger:

1. enumerate current live P0 residual targets at support distance one;
2. enumerate current P0 frontier actions only;
3. call the qualified
   `certifyCpcxSupportReleaseSharedAcquisitionBlock`;
4. accept only exact theorem certificates;
5. apply only the theorem's pinned P0 event;
6. require the resulting P1-to-move physical state to exactly match a fixed
   Class-C node;
7. enter `A(child,a)`.

This is a theorem-backed OR route, not arbitrary future move search.

## R-token semantics

For the token's named P1 supply trigger only:

```
P1 supply
-> reserved P0 response
-> deterministic forced normalization
```

Accept P0 first win or exact fixed-node `N(child)` re-entry.

On any other P1 trigger, R supplies no special response; use ordinary routes.

## A-token semantics

For the token's named P1 supply trigger only:

```
P1 supply
-> theorem-prescribed shared P0 acquisition/block response
-> deterministic forced normalization
```

The theorem itself has already certified:

- unique urgent opponent singleton is on the shared response cell;
- the P0 protected residual is acquired/contracted/completed;
- the urgent P1 residual is killed;
- no immediate P1 singleton remains afterward.

The recurrence accepts:

- P0 first win; or
- OPEN P1-to-move exact fixed-node `N(child)` re-entry.

If the discharge leaves the fixed cohort without a P0 terminal, the A-token
route fails closed.

On every P1 trigger other than the named supply, A supplies no extra response;
ordinary routes must cover the event.

## Token creation discipline

R tokens may be created only by the already-qualified
support-release-response theorem on an existing RCIC response edge.

A tokens may be created only by the newly qualified
shared acquisition/block theorem.

No theorem token may be inferred merely because the physical geometry looks
similar.

## Well-foundedness

Every edge between P1 proof states consumes at least one physical event and
increases board rank.

Solve all N/R/A states bottom-up in decreasing physical rank.

Tokens do not create same-rank transitions.

Remaining capacity is therefore used only as the finite proof-DAG termination
coordinate, not as a safety or value score.

## Output

For D6 and G4 report:

- physical node count;
- R-token count;
- A-token count;
- certified N/R/A state counts;
- certification by physical rank;
- root N status;
- root witness policy if certified;
- route histogram, including:
  - existing RCIC child;
  - direct P0 first win;
  - forced-normalization reentry;
  - response-reservation child/discharge;
  - shared-acquisition child/discharge;
- failure census for all three proof-state types.

## Success

If either Class-C root `N(q)` certifies, Class C obtains the missing
winner-turn existential witness.

A positive Class-C result must then be composed into the surrounding turn-6
recurrence before claiming all seven sixth actions are outcome-equivalent
losses.

## Falsifier

If neither root certifies, preserve the certified subgraph and failure census.

Do not widen the P0 response set after seeing the result.

## Boundaries

No solved W/D/L data, oracle, minimax/negamax/alpha-beta, remoteness, opening
book, prior best-move labels, arbitrary recursive future move enumeration,
production CPC mutation, or production solver mutation.
