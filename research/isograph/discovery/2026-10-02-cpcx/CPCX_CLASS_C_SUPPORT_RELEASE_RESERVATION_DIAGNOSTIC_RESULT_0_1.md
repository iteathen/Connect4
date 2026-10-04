# CPCX Class-C support-release reservation diagnostic result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** partial positive; reservation state is real but insufficient alone  
**Target:** winner-existence / loser-outcome-equivalence  
**Workflow:** `Research CPCX Class-C support-release reservation`  
**Run:** `37168138709` — SUCCESS

## Question

Is the recurring latent P1 singleton at `C2` in the remaining Class-C
reservoir recurrence already governed by the qualified
support-release-response-neutralization theorem, such that CPCX is missing a
guarded response reservation rather than another scalar rank coordinate?

## Method

The diagnostic consumed the exact Class-C D6/G4 reservoir-gap structural DAGs.

For every exact gap-1 P1-to-move state with:

```
P1 singleton target = C2
supportDistance(C2) = 1
```

it audited one current P1 event.

For a nonterminal, non-supply event, the exact P0-to-move child was formed and
every current legal P0 action was tested with the already-qualified theorem:

`certifyCpcxSupportReleaseResponseNeutralization`.

The theorem itself was unchanged.

No later free P1 frontier was enumerated.

## Aggregate result

Across both Class-C candidates:

```
gap-1 C2 depth-one states:                 250
current supply rows:                       250
current supply rows with incoming token:   163
exact reservation-carrying RCIC edges:     407
```

Thus the response-reservation object is mechanically present in the exact
Class-C recurrence.

However:

```
all candidates cover every non-supply row = false
```

so reservation alone does not close Class C.

## D6 candidate

```
gap-1 C2 states:                    70
current P1 events:                 224
P1 terminal events at source:        0
current C1 supply rows:             70
supply rows with incoming token:    26

nonterminal non-supply rows:       154
covered by >=1 qualified P0 action: 56
all covered:                      false

tested RCIC transition edges:      289
exact reservation edges:            42
```

Qualified P0 action labels occurred at:

```
B3, B5, B6, E4, E5, F6, G5, G6
```

Negative theorem seams among tested edges:

```
SOURCE_OPPONENT_IMMEDIATE_SINGLETON       96
PINNED_DEFENDER_ACTION_SUPPLIES_TARGET    87
POST_BLOCK_OPPONENT_SINGLETON_TRANSPORT   64
```

## G4 candidate

```
gap-1 C2 states:                    180
current P1 events:                  587
P1 terminal events at source:         0
current C1 supply rows:             180
supply rows with incoming token:    137

nonterminal non-supply rows:        407
covered by >=1 qualified P0 action: 258
all covered:                       false

tested RCIC transition edges:       817
exact reservation edges:            365
```

Qualified P0 action labels occurred at:

```
B3, B5, B6, D6, E4, E5, E6, F6, G5, G6
```

Negative theorem seams:

```
SOURCE_OPPONENT_IMMEDIATE_SINGLETON       176
PINNED_DEFENDER_ACTION_SUPPLIES_TARGET    230
POST_BLOCK_OPPONENT_SINGLETON_TRANSPORT    40
POST_DEFENDER_OPPONENT_IMMEDIATE_SINGLETON 6
```

## Interpretation

The diagnostic establishes a real missing state component:

> an exact P0 transition can carry a guarded reservation stating that if P1
> later supplies the support below C2, P0 has the reserved C2 discharge.

This cannot be represented faithfully by the scalar reservoir obstruction
descriptor alone.

That is a stateful proof obligation: two physically similar P1-to-move
boundaries can differ according to whether the predecessor P0 transition
established the reservation.

This result does **not** yet justify calling the mechanism a flip-flop or
latch. It does establish finite proof-state memory.

## Remaining seams

The residual failures separate into structurally meaningful classes.

### 1. SOURCE_OPPONENT_IMMEDIATE_SINGLETON

After the observed current P1 event, P0 is already under an exact immediate
P1 singleton obligation.

The support-release theorem correctly refuses to ignore it.

This suggests composition with existing deterministic CPCX forced
normalization before any reservation theorem is applied.

### 2. POST_DEFENDER_OPPONENT_IMMEDIATE_SINGLETON

A candidate pinned P0 event creates or leaves a P1 immediate singleton before
the support-release transaction.

Such an event is not admissible unless the immediate boundary itself has an
exact deterministic closure.

### 3. POST_BLOCK_OPPONENT_SINGLETON_TRANSPORT

The reserved support-release block kills the named C2 residual but exposes
another immediate P1 singleton.

This is not neutralization under the current theorem and remains a genuine
transport seam.

### 4. PINNED_DEFENDER_ACTION_SUPPLIES_TARGET

This is an expected theorem-domain exclusion, not independently evidence of a
proof failure. Other P0 actions may cover the row.

## Next question

Before inventing another primitive, test whether the uncovered rows in classes
1 and 2 close under the already-qualified deterministic forced-normalization
operator.

For each uncovered current P1 event:

1. form the exact P0-to-move child;
2. classify its immediate CPCX boundary;
3. if the response is forced, apply only deterministic forced normalization;
4. accept a direct P0 first win if certified;
5. otherwise test whether the normalized P1-to-move boundary re-enters an
   already-qualified smaller Class-C structural state or carries a qualified
   support-release reservation.

Treat `POST_BLOCK_OPPONENT_SINGLETON_TRANSPORT` separately; do not erase it.

## Claim boundary

Still unproved:

- Class-C closure;
- all seven sixth-move losses;
- turn-6 outcome equivalence.

Preserved:

- no solved data;
- no oracle;
- no minimax;
- no remoteness;
- no arbitrary future move traversal;
- production CPC unchanged;
- production solver unchanged.
