# CPCX Class-C support-release acquisition audit result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** mostly negative; isolates shared-discharge candidate  
**Workflow:** `Research CPCX Class-C support-release acquisition audit`  
**Run:** `37168925096` — SUCCESS  
**Qualified theorem run:** `37168820777` — 7/7 PASS

## Question

Do the 177 unresolved Class-C P0 controller states admit the qualified
owner-side support-release acquisition theorem on any live P0 depth-one
residual target?

## Result

All 177 states contained at least one P0 depth-one residual target.

However:

```
cohort states:                  177
acquisition-covered states:       4
exact acquisition certificates:   6
```

Every positive certificate used target:

```
B6
```

with pinned P0 actions drawn from:

```
F6, G5, G6
```

Only 2 of the 4 covered states overlapped the existing playable-two-piece
progress rows.

The named acquisition SUPPLY branches produced no P0 or P1 terminal in the
qualified positives.

## D6 / G4 split

### D6

```
states:                       80
depth-one target occurrences: 210
covered states:                2
exact certificates:            3
```

### G4

```
states:                       97
depth-one target occurrences: 249
covered states:                2
exact certificates:            3
```

## Rejection structure

The dominant theorem failures were:

```
SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON  620
PINNED_CONTROLLER_ACTION_SUPPLIES_TARGET      459
POST_CONTROLLER_OPPONENT_IMMEDIATE_SINGLETON  111
EXTERNAL_CLASS_INTERSECTS_PROTECTED_RESIDUAL   24
PINNED_CONTROLLER_ACTION_ALTERS_PROTECTED_RESIDUAL 34
```

The first seam is now the strongest new clue.

The acquisition theorem currently fails whenever the opponent SUPPLY event
creates any immediate opponent singleton before P0 acquires the target.

That guard is necessary in general.

But there is a narrower safe possibility:

> if the unique newly urgent P1 singleton is on the same physical cell that
> P0 is already licensed to acquire, then P0's acquisition event may
> simultaneously contract its protected residual and discharge the opponent
> singleton.

This is the shared-discharge pattern already observed elsewhere in CPCX/UC4A
work, but it has not been established for the present Class-C cohort.

## Next falsifier

On every
`SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON` rejection:

1. record the exact urgent P1 singleton cells;
2. test whether there is exactly one and it equals the planned P0 acquisition
   target;
3. if so, execute that already-planned P0 target event;
4. verify exact first-win ordering;
5. verify the protected P0 residual contracts/completes;
6. verify the P1 urgent singleton is killed;
7. reject if any other P1 immediate singleton remains.

Do not relax the acquisition theorem globally.

## Claim boundary

The existing acquisition theorem remains qualified exactly as written.

No Class-C closure, turn-6 equivalence, or new shared-discharge theorem is
claimed here.
