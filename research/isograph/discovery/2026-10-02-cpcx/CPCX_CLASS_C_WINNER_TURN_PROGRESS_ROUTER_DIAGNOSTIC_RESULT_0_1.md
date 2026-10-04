# CPCX Class-C winner-turn progress-router diagnostic result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** existing router exhausted; genuine missing recurrence theorem/state remains  
**Workflow:** `Research CPCX Class-C winner-turn progress router`  
**Run:** `37168466804` — SUCCESS  
**Target:** winner-existence / loser-outcome-equivalence

## Cohort

The input was exactly the 177 remaining P0-to-move Class-C rows that were:

- nonterminal after the current P1 event;
- not the current C1 supply case;
- not covered by any support-release reservation action;
- classified `NO_IMMEDIATE_OBLIGATION`.

No physical P0 move enumeration was allowed after cohort selection.

## Result

```
retained states: 177

first progress:
  NO_CERTIFICATE              152
  CERTIFIED_FORCING_MACRO      25

forcing macro kind:
  PLAYABLE_TWO_PIECE           25
```

The 25 exact forcing macros were composed using the existing CPCX successor
operator.

After composition:

```
P0 first wins:                  0
P1 first wins:                  0
OPEN_SEAM:                    177
final concrete states:        177
final abstract states:          0
exact re-entry to existing
  Class-C reservoir nodes:      0
```

Trace signatures:

```
NO_CERTIFICATE                                     152
PLAYABLE_TWO_PIECE -> NO_CERTIFICATE                25
```

Breakdown:

### D6 cohort

```
states: 80
NO_CERTIFICATE: 69
PLAYABLE_TWO_PIECE -> NO_CERTIFICATE: 11
```

### G4 cohort

```
states: 97
NO_CERTIFICATE: 83
PLAYABLE_TWO_PIECE -> NO_CERTIFICATE: 14
```

## Interpretation

The current generic CPCX progress router has now been exhausted on this layer.

The remaining seam is not:

- a missed existing immediate win;
- a missed forced-response normalization;
- a missed existing pair-hub / reservoir / CPC2 / vertical theorem selected by
  `classifyCpcxProgress`;
- a missed existing forcing macro composition.

A new recurrence composition is required.

## Important positive information from earlier diagnostics

The new composition does not start from nothing.

Already established on the same Class-C layer:

1. exact support-release reservation edges exist;
2. 407 existing RCIC transitions carry such a reservation;
3. 163 current C1 supply states have at least one incoming reservation-bearing
   predecessor edge;
4. 52 non-supply uncovered rows normalize deterministically to exact known RCIC
   states;
5. 18 uncovered rows are direct P0 first wins.

This strongly suggests the missing state is a **guarded response obligation**
carried across a transition, not another local scalar ranking feature.

## Next construction boundary

The next candidate RCIC must distinguish:

```
(position, no reservation)
(position, qualified support-release reservation)
```

A reservation is theorem evidence, not historical metadata.

It is created only by an exact
`SUPPORT_RELEASE_RESPONSE_EDGE` certificate and contains its exact named:

- trigger/support cell;
- reserved response cell;
- protected opponent residual provenance.

If the next P1 event is the reserved trigger, the P0 response is determined by
the certificate and may be followed only by deterministic forced normalization.

If the next P1 event is EXTERNAL, the old reservation is consumed; the next P0
event must independently establish whatever theorem state is needed for the
following boundary.

The existing reservoir-template/attachment responses remain available as
separate theorem-backed P0 OR choices.

## Claim boundary

Still unproved:

- reservation-augmented RCIC closure;
- Class-C first win;
- all seven sixth-move losses;
- turn-6 outcome equivalence.

No solved values, oracle, minimax, remoteness, or unrestricted reply search were
used.
