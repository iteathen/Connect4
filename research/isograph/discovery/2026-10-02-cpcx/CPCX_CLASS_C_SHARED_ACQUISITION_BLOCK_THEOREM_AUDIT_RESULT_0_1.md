# CPCX Class-C Shared Acquisition/Block Theorem Audit Result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** positive theorem reproduction; recurrence closure not yet tested  
**Qualified theorem run:** `37171239091`  
**Audit workflow:** `Research CPCX Class-C shared acquisition-block theorem audit`  
**Audit run:** `37171349934` — SUCCESS

## Result

The independently qualified generic theorem exactly reproduces the previously
observed manually-audited safe subset.

Across the frozen 177-state Class-C controller cohort:

```
states audited:                 177
states with theorem instance:    20
exact theorem certificates:      38
```

Every exact certificate has:

```
protected target: B4
opponent supply:  B3
shared response:  B4
```

Pinned P0 actions:

```
E6: 13
F6: 10
G5:  6
G6:  9
```

This exactly matches the prior structural diagnostic count of 38 locally safe
shared discharges.

## D6 cohort

```
controller states:          80
covered states:              9
exact certificates:         18
target B4:                  18
supply B3:                  18
response B4:                18
```

Pinned actions:

```
E6 6
F6 6
G5 2
G6 4
```

All 18 contract the protected P0 residual; none completes it.

All 18 named supply/response transactions remain nonterminal and normalize
OPEN.

11/18 resulting normalized boundaries exactly match physical states in the
fixed Class-C cohort.

## G4 cohort

```
controller states:          97
covered states:             11
exact certificates:         20
target B4:                  20
supply B3:                  20
response B4:                20
```

Pinned actions:

```
E6 7
F6 4
G5 4
G6 5
```

All 20 contract the protected P0 residual; none completes it.

All 20 normalize OPEN.

7/20 resulting normalized boundaries exactly match physical states in the
fixed Class-C cohort.

## Total post-discharge characterization

```
exact fixed-cohort reentries: 18
existing P0 first wins:        0
existing P1 first wins:        0
```

Therefore the theorem provides a genuine new controller transition but not a
terminal base by itself.

## Rejection structure

The theorem continues to fail closed on the broader Class-C candidate space.
Dominant seams include:

- `SUPPLY_ALTERS_PROTECTED_RESIDUAL`;
- `PINNED_CONTROLLER_ACTION_SUPPLIES_TARGET`;
- `POST_SHARED_DISCHARGE_P1_SINGLETON`;
- `POST_CONTROLLER_OPPONENT_IMMEDIATE_SINGLETON`;
- `EXTERNAL_CLASS_INTERSECTS_PROTECTED_RESIDUAL`;
- `PINNED_CONTROLLER_ACTION_ALTERS_PROTECTED_RESIDUAL`;
- `SHARED_URGENT_CELL_MISMATCH`.

No broad acquisition relaxation is licensed.

## Interpretation

The former 38-row observation is now promoted from diagnostic coincidence to
instances of a separately qualified generic CPCX theorem.

The theorem supplies a new stateful controller edge:

```
P0 pinned progress
-> guarded P1 supply B3
-> prescribed P0 shared response B4
```

A recurrence may use this edge only where the theorem certifies it.

Because the token-entry physical state and the post-discharge state must be
tracked separately, the next experiment must explicitly test whether these
theorem tokens can be embedded into the fixed Class-C proof-state graph.

## Claim boundary

Still unproved:

- Class-C first-win closure;
- all seven sixth-move P1 losses;
- turn-6 outcome equivalence.

No solved data, oracle, minimax, remoteness, or unrestricted future move
traversal was used.
