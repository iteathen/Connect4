# UC4A I/P regime-subspace tomography result checkpoint 0.1

**Date:** 2026-10-01  
**Status:** completed label-free regime-subspace tomography; bridge comparison not yet executed  
**Branch:** research/universal-structural-policy-20260930  
**Design:** UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md  
**Structural source SHA-256:** 374d744378bf71b77db0711d1eb2ef4a21ec1cb4c80736aa206abd4520dd1aa9  
**Regime atlas SHA-256:** 7ce03e10c6ca122f51e44d817d23fc71270d35a9b826cce74a92e49a8f59ecbe  
**Evidence:** UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json

## Integrity

This result was generated using only the previously frozen 169-board label-free I/P structural atlas.

The producer did not open:

- any localization artifact;
- any W/D/L table;
- any solver or oracle result;
- any best-move table;
- any BSFP solved frontier.

Production CPC, JSMinSys, and BSFP remained unchanged.

## Census

~~~text
exact geometry regimes       51
controlled regime pairs      73
directed comparisons        146
recurring defect directions  38
extended-grid recurring      25
~~~

Controlled-pair counts:

~~~text
HEIGHT_BOUNDARY    17
HEIGHT_PARITY      17
SAFE_THRESHOLD     15
WIDTH_BOUNDARY      6
WIDTH_PARITY       18
~~~

Every directed residual quotient passed the exact identity:

~~~text
residual quotient rank
=
rank(A+B) - rank(A)
~~~

## Dominant label-free defect

The most recurrent projective defect direction is:

D-8c7a3367fd7b3e71

with exact support:

~~~text
I.coreReflection.rotation180Fixed.yCell = 3
I.coreReflection.rotation180Fixed.yLine = 1
~~~

It occurs in:

~~~text
controlled directed comparisons   21
producing curvature rows          241
axes                              HEIGHT_PARITY, WIDTH_PARITY
families                           HEIGHT2, WIDTH2
extended-grid recurrence           YES
~~~

This direction was generated entirely from parity-regime subspace quotients.

No outcome/localization target was available to the producer.

## Interpretation of the dominant defect

The rotation-180 fixed middle dimensions do not have one global linear dependency across the raw curvature atlas.

Instead, the 3:1 direction appears as a **defect between parity-sector subspaces**.

That is a materially different object from a raw curvature mode.

This explains why the prior raw-mode superposition experiment could fail even if the structural mechanism is real: quotient directions can be emergent relations between mode spaces rather than members of either raw mode list.

## Other strong recurring defects

### MIXED width-parity defects

Several extended-grid recurring MIXED directions combine left-right or top-bottom fixed-core exchange with the same rotation-180 sector:

~~~text
D-42421851a3322caf
  LR Y_cell  = 1
  LR Y_line  = 1
  rot Y_cell = -3
  rot Y_line = -1

D-af07c0452e8fcd50
  LR Y_cell  = 1
  LR Y_line  = 1
  rot Y_cell = 3
  rot Y_line = 1
~~~

### MIXED height-parity defects

~~~text
D-be71e4ec055a7dc6
  TB Y_cell  = 1
  TB Y_line  = -1
  rot Y_cell = 3
  rot Y_line = 1

D-ca0c421b99a94461
  TB Y_cell  = 1
  TB Y_line  = -1
  rot Y_cell = -3
  rot Y_line = -1
~~~

These are broad, repeated parity-sector exchange modes rather than one-board signatures.

### Safe-entry threshold defect

The regime atlas independently contains the pure safe-entry direction:

~~~text
P.safeEntryCount = 1
~~~

on safe-threshold comparisons.

It also contains related threshold defects coupling safe-entry count to safe derivative/phase-word counts.

Thus the finite width-8 safe-entry exhaustion is an exact member of the same label-free regime-defect algebra.

## Generic interior sector

Away from W=4/H=4 and after safe-entry exhaustion, the generic interior I/P ranks are:

~~~text
WIDTH2   rank 5
HEIGHT2  rank 3
MIXED    rank 4
~~~

Parity cells inside those families have:

~~~text
WIDTH2:  rank 3 each
HEIGHT2: rank 2 each
MIXED:   rank 1 each
~~~

So a substantial fraction of the apparent global curvature complexity is the union of a small number of parity-sector subspaces.

## Structural implication

The broad structural picture is now:

~~~text
raw I/P curvature
  -> low-rank parity/threshold regime subspaces
  -> exact quotient defects between regimes
  -> small recurring exchange directions
~~~

This is structurally compatible with the older UC4A pattern that hard information often lives in relations between layers or sectors, not in one scalar projection.

## Next frozen bridge question

A separate Phase-B bridge may now open the already-frozen localization result and test, without adding coordinates:

1. exact projective equality between localization directions and these regime-defect directions;
2. if no equality, every two-defect span;
3. if still absent, every three-defect span;
4. preserve failures and out-of-space directions.

The bridge must not reopen raw W/D/L sources.

## Claim boundary

This checkpoint does not establish:

- any W/D/L theorem;
- semantic meaning for the 3:1 direction;
- a final Outcome-Formation Triangle;
- an intrinsic outcome rank;
- an optimal-move theorem;
- a production CPC rule;
- a BSFP value premise;
- a Connect Four solution.
