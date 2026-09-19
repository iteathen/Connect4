# Checkpoint — first rank-31 boundary pressure

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Base live head:** `bcd3e13789b30a27e0ebef0722ce2c3804802974`
**Status:** selected rank-31 root partially closed; first unresolved operation localized to Lower/downset intersection at draw threshold
**Authority effect:** none
**Research direction:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

## Resume chain

Read:

1. `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`
2. `RANK32_MAX_COORDINATE_CHECKPOINT.md`
3. this file

## Independent replay boundary

The persisted Node lattice implementation, modified only to use the exact transformed-product-order Lower normalizer, reproduced the rank-32 calibration support:

```text
[5,5,1,3,6,6,6]
99,364 antichains/player
```

exactly, including all root Upper/Lower widths and envelope maxima from `RANK32_LATTICE_RESULTS.json`.

When applied to the 226,537-antichain rank-32 maximum-coordinate target, that older implementation closed every rank-33 child but did not reach the rank-32 root inside the bounded run because it still explicitly enumerates the complete single-player antichain lattice.

Disposition:

```text
old explicit-antichain Node implementation
    exact on calibration
    scaling wall = explicit coordinate enumeration

residual-shape adjoint implementation
    avoids that enumeration
    closes the rank-32 root
```

Do not increase the Node timeout merely to enumerate 226,537 antichains. A second independent implementation should consume the residual-shape adjoint law directly.

## Rank-31 target selection

Immediate rank-31 predecessors of the closed rank-32 target have 28–30 residual shapes.

The first target was selected structurally:

```text
[4,5,2,2,6,6,6]
rank 31
residual shapes 30
```

Among the immediate predecessors it has the largest measured pairwise incomparability count in the support-local residual-shape poset.

This is a structural stress choice, not an external solved-value choice.

## Avoiding repeated cone work

A full rank-31 cone run exceeded its bounded window largely because it repeatedly recomputed known rank-32/rank-33 descendants.

The rank-31 root has only four legal children. They were therefore computed/cached independently and the root was composed directly.

Child boundaries:

### [5,5,2,2,6,6,6]

```text
Upper:
1,8,37,298,1996,6745,2280,598,57,9,4

Lower:
7,38,304,2074,4480,3483,773,120,12,1,1

max action Upper candidates   7,877
max action Lower candidates   1,632
max Lower meet product    1,712,812
```

### [4,6,2,2,6,6,6]

```text
Upper:
1,6,45,363,2292,7901,3661,793,82,11,3

Lower:
4,46,530,3575,9524,8173,1322,170,20,1,1

max action Upper candidates  20,026
max action Lower candidates   1,134
max Lower meet product    3,886,914
```

Once its rank-33 children were cached, this root itself closed in about 13 s in the prototype. The earlier long run was duplicate cone construction, not a new semantic wall.

### [4,5,3,2,6,6,6]

```text
Upper:
1,8,29,225,1445,3970,1351,541,51,8,4

Lower:
7,24,187,1311,2876,2349,899,117,12,1,1

max action Upper candidates   6,346
max action Lower candidates   1,529
max Lower meet product    1,386,456
```

### [4,5,2,3,6,6,6]

Previously checkpointed:

```text
Upper:
1,8,46,381,3223,9348,3437,1069,95,13,4

Lower:
8,51,564,3897,8722,6422,2001,211,28,1,1
```

## Rank-31 Upper result

All rank-31 fixed-action Upper predecessors and state Upper unions close.

Ordered score levels:

```text
loss2
loss4
loss6
loss8
loss10
draw11
win11
win9
win7
win5
win3
win1
```

Root Upper widths:

```text
1
8
54
404
3,120
13,954
19,047
8,428
1,237
107
12
4
```

Representative largest fixed-action Upper raw candidate counts:

```text
draw11:
    7,011
    8,174
   13,941
   24,216

win11:
   10,064
    9,525
   19,863
   37,610
```

Thus Upper propagation is not the first rank-31 closure failure.

## Rank-31 Lower through loss10

Lower closes exactly through:

```text
loss2      7
loss4     55
loss6    504
loss8  5,224
```

At `loss10`, action-Lower boundaries are:

```text
action 0   2,279
action 1   3,661
action 2     969
action 3   1,652
```

Sequential exact lattice meet-products:

```text
2,279 x 3,661
    raw 8,343,419
    -> 5,765 maximal generators

5,765 x 969
    raw 5,586,285
    -> 8,258 maximal generators

8,258 x 1,652
    raw 13,642,216
    distinct state pairs 6,230,982
    mover groups 47,532
    same-mover locally irredundant 579,106
    -> 11,350 exact maximal generators
```

The final transformed-mask global dominance pass over the 579,106 locally irredundant states retained 11,350 generators in about 7.5 s in isolation.

So:

```text
Lower(loss10) = 11,350
```

is closed.

## First unresolved rank-31 operation

At `draw11`, action-Lower boundaries are:

```text
action 0   6,744
action 1   7,901
action 2   2,967
action 3   4,994
```

The very first downset intersection would materialize:

```text
6,744 x 7,901
    = 53,284,344
```

lattice meet candidates.

The bounded isolated run did not complete this product.

This is the current first unresolved operation.

## Structural restatement

Under the transformed state coordinate:

```text
T(m,o) = m | ((TOP xor o) << n)
```

beneficiary-favorable order becomes ordinary bitwise superset order.

The state-lattice meet used to intersect Lower downsets becomes exactly:

```text
T(a meet b) = T(a) AND T(b).
```

Therefore the unresolved operation is now:

> Given two antichains A and B of maximal bitmasks, compute the maximal masks among `{a AND b | a in A, b in B}` without materializing the full Cartesian product.

This is more precise than “Lower is getting large.”

## Candidate alternate dual route

For adjacent score levels:

```text
Lower(theta)
    = complement Upper(next(theta))
```

The earlier complement/active-pattern implementation was rejected because it scanned or conditioned over the explicit antichain coordinate domain.

The residual-shape adjoint/lattice work materially changes that premise.

In transformed coordinates, an Upper generator is a bitmask `g`, and the complement Lower region is:

```text
for every Upper generator g:
    T does not contain all bits of g
```

i.e. a closed hitting-set / maximal-independent-set problem over the support-local residual-shape product lattice.

This is a **new candidate formulation**, not a revived result. It must be attacked against already-qualified rank-32 boundaries before use at rank 31.

## Next executable step

Two candidate routes should be compared on exact rank-32 controls:

1. **output-sensitive meet antichain**
   - compute maximal pairwise bitwise-AND masks without Cartesian materialization;

2. **closed blocker / complement dualization**
   - derive `Lower(theta)` directly from `Upper(next(theta)`;
   - operate over residual-shape closure, not enumerated antichain coordinates.

Require exact generator equality against checkpointed Lower boundaries.

Then apply the winning exact formulation to rank-31 `draw11`.

Do not build the 53,284,344 pair product merely with a larger timeout.

## Reconnect marker

```text
current target
    [4,5,2,2,6,6,6] rank 31

Upper
    CLOSED:
    1,8,54,404,3120,13954,19047,8428,1237,107,12,4

Lower
    CLOSED through loss10:
    7,55,504,5224,11350

first open operation
    draw11:
    intersect action Lower 6744 x 7901
    naive raw pairs 53,284,344

next
    derive output-sensitive Lower intersection
    OR closed complement dual
    qualify on rank32
    then close draw11
```

## Epistemic disposition

```text
rank32 maximum-coordinate target              CLOSED
rank31 Upper                                  CLOSED
rank31 Lower through loss10                   CLOSED
rank31 draw11                                 OPEN
first rank31 pressure                         LOWER DOWNSET INTERSECTION
53M Cartesian materialization                 DO NOT BUILD BLINDLY
output-sensitive meet                         CANDIDATE
closed complement dual                        CANDIDATE
empty root solved                             NO
new IsoGraph relation promoted                NO
authority 1.1 mutated                         NO
```
