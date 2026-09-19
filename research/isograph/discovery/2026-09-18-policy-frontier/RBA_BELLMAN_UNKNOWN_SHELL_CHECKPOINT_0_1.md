# RBA Bellman-unknown shell checkpoint 0.1

**Date:** 2026-09-18  
**Canonical branch:** `research/semantic-quotient`  
**Status:** post-1.1 research checkpoint; no authority promotion  
**Research direction:** Josh Oshiro

## Motivation

Web research suggested that the current RBA problem may be better understood through:

- generalized strong preservation / forward-complete abstract interpretation;
- partial-information retrograde game solving;
- non-partitioning abstract domains;
- monotone predicate/value transformers.

The first partition-shell test showed that full raw-transition strong preservation is much too fine. This checkpoint tests a **value-specific Bellman refinement orbit** instead.

## Four-valued information domain

Initialize every nonterminal q state to:

~~~text
UNKNOWN
~~~

Use only four information values:

~~~text
UNKNOWN
WIN
DRAW
LOSS
~~~

Equivalent interval encoding:

~~~text
UNKNOWN = [-1,+1]
WIN     = [+1,+1]
DRAW    = [ 0, 0]
LOSS    = [-1,-1]
~~~

No partial values such as `[0,1]` or `[-1,0]` appeared on any complete control.

## Bellman information rules

For one action:

~~~text
immediate terminal win  -> WIN
final-board draw        -> DRAW
nonterminal child WIN   -> LOSS
nonterminal child LOSS  -> WIN
nonterminal child DRAW  -> DRAW
nonterminal child UNKNOWN -> UNKNOWN
~~~

For a state:

~~~text
if any action is WIN:
    WIN

else if any action is UNKNOWN:
    UNKNOWN

else if any action is DRAW:
    DRAW

else:
    LOSS
~~~

Iterate synchronously from the all-UNKNOWN nonterminal assignment.

## Complete controls

### 4x3 c3

~~~text
q states                         3,734
exact strong state classes          19
Bellman information trace classes   19

exact action-score classes        1,000
Bellman action trace classes      1,000

state resolution-distance mismatches   0
action resolution-distance mismatches  0
~~~

### 4x4 c4

~~~text
q states                        34,094
exact strong state classes          29
Bellman information trace classes   29

exact action-score classes        3,005
Bellman action trace classes      3,005

state resolution-distance mismatches   0
action resolution-distance mismatches  0
~~~

### 5x3 c4

~~~text
q states                        11,316
exact strong state classes          26
Bellman information trace classes   26

exact action-score classes        2,334
Bellman action trace classes      2,334

state resolution-distance mismatches   0
action resolution-distance mismatches  0
~~~

Aggregate physical controls remain the previously qualified:

~~~text
286,483 physical nonterminal states
49,144 reachable q classes
693,621 action cases
~~~

## Strong value falls out of information-resolution time

For every tested q state:

~~~text
first iteration where state != UNKNOWN
    ==
exact strong distance
~~~

and the resolved information value gives the sign:

~~~text
WIN  -> +1
DRAW ->  0
LOSS -> -1
~~~

So:

~~~text
exact strong score
    =
(resolved W/D/L outcome,
 first Bellman refinement iteration)
~~~

with zero mismatches on all complete controls.

The same equality holds action-by-action.

## Why this is theorem-shaped

Induct on the first refinement stage.

### Win

A state resolves WIN exactly when at least one action reaches a child already resolved LOSS.

Therefore:

~~~text
win resolution time
    =
1 + min(loss-child resolution time)
~~~

which is exactly faster-win preference.

### Loss

A state resolves LOSS only when every legal action reaches a child already resolved WIN.

Therefore:

~~~text
loss resolution time
    =
1 + max(win-child resolution time)
~~~

which is exactly slower-loss preference.

### Draw

A draw resolves only after all relevant continuations become exact and no winning action exists while at least one drawing continuation remains. In a finite acyclic board this happens after the unresolved continuation has been exhausted.

Thus the ordinary strong-distance convention is the refinement ordinal of the four-valued Bellman information fixed point.

## Monotone boundary compatibility

The information-refinement fronts were tested against the support-local favorable q order.

### State fronts

~~~text
geometry   WIN-up violations   LOSS-down violations   max WIN boundary   max LOSS boundary

4x3 c3            0                    0                    17                 11
4x4 c4            0                    0                    29                 15
5x3 c4            0                    0                     6                  3
~~~

### Action fronts

~~~text
geometry   WIN-up violations   LOSS-down violations   max WIN boundary   max LOSS boundary

4x3 c3            0                    0                    14                 14
4x4 c4            0                    0                    18                 25
5x3 c4            0                    0                     5                  6
~~~

Therefore the value-specific information refinement remains representable by the same monotone antichain machinery.

## Relation to the raw complete-shell test

The raw-transition partition shell was:

~~~text
4x3 c3   2,798 classes
4x4 c4  27,392 classes
5x3 c4   9,772 classes
~~~

By contrast the Bellman information traces have only:

~~~text
state:   19 / 29 / 26 classes
action: 1000 / 3005 / 2334 classes
~~~

and those equivalences exactly match the already-known strong state/action scores.

So the wrong abstraction target is now clear:

~~~text
complete for every raw transition observation
    -> preserves far too much

complete for the specific Bellman/value refinement
    -> matches exact strong semantics
~~~

## RBA consequence

The finite strong-score chain need not be primitive.

A smaller candidate value algebra is:

~~~text
information carrier:
    UNKNOWN / WIN / DRAW / LOSS

operator:
    Bellman refinement

strong distance:
    first resolution ordinal

symbolic representation:
    monotone WIN and LOSS boundary fronts
~~~

This is a substantial reduction of the candidate RBA operator basis.

## What remains open

This does not solve the empty 7x6 root.

The remaining compactness problem becomes:

> Can the evolving WIN/LOSS antichain fronts of this four-valued Bellman refinement be block-composed or normalized directly over the board-fiber graph without enumerating the intermediate support/rank boundaries?

That is narrower than the earlier strong-score-threshold formulation.

## Caution on terminology

The experiment strongly matches partial-information retrograde semantics and abstract-interpretation refinement.

It does **not** yet establish that the four-valued domain is the unique forward-complete shell in the full Ranzato/Tapparo sense. The tested claim is the value-specific refinement orbit and its exact equivalence to strong value on complete controls.

## Reconnect marker

Raw result:

`RBA_BELLMAN_UNKNOWN_SHELL_RESULTS_0_1.json`

Current next mathematical target:

~~~text
derive symbolic/block composition law for
WIN_k / LOSS_k monotone antichain fronts
over exact board-fiber transitions
~~~
