# Checkpoint — rank-32 maximum-coordinate boundary closure

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Base live head:** `e98749ba5500b52d4872d80221278eebbbe43bab`
**Status:** rank-32 maximum-coordinate target closed in the boundary-only residual-shape lattice prototype; independent durable rerun still required before stronger promotion
**Authority effect:** none
**Research direction:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

## Resume chain

Read, in order:

1. `RANK32_LATTICE_RESULTS.json`
2. `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`
3. this file

The persisted rank-32 calibration had closed support:

```text
[5,5,1,3,6,6,6]
99,364 antichains/player
```

and routed next to the largest immediate coordinate case:

```text
[4,5,2,3,6,6,6]
27 residual shapes
226,537 normalized antichains/player if explicitly enumerated
```

The shape-lattice construction does not enumerate that antichain set.

## Root child inputs

The four legal rank-33 children close under the same generator-only lattice recurrence:

```text
[5,5,2,3,6,6,6]
Upper  1,8,35,226,1116,1251,447,69,9,4
Lower  8,30,228,660,2534,714,119,15,1,1

[4,6,2,3,6,6,6]
Upper  1,6,36,259,1220,1521,540,81,12,3
Lower  5,43,530,2419,5361,1734,200,27,1,1

[4,5,3,3,6,6,6]
Upper  1,8,38,280,977,1129,631,69,9,4
Lower  7,37,348,717,2991,1247,137,12,1,1

[4,5,2,4,6,6,6]
Upper  1,8,26,201,659,895,420,63,8,4
Lower  8,29,260,696,2472,923,133,12,1,1
```

No P0/P1 residual-pair domain was constructed.

## Lower-normalization wall and exact repair

The first root attempt localized the bounded-run failure to Lower/downset intersection normalization.

At threshold `loss10`, action-Lower boundaries were:

```text
action 0: raw 1,250 -> boundary 1,250
action 1: raw 1,521 -> boundary 1,301
action 2: raw 1,129 -> boundary   870
action 3: raw 1,035 -> boundary   521
```

Sequential lattice meet-products:

```text
1,250 x 1,301 = 1,626,250
    distinct pairs 917,545
    exact maximal boundary 3,774

3,774 x 870 = 3,283,380
    distinct pairs 1,749,604
    exact maximal boundary 5,700

5,700 x 521 = 2,969,700
    distinct pairs 1,500,311
```

The prior grouped streaming maximal-normalizer stalled on the last product.

### Product-order transform

For a support-local residual-shape lattice with `n` shapes and full upset mask `TOP`, map a state pair:

```text
(mover upset m, opponent upset o)
```

to:

```text
T(m,o) = m | ((TOP xor o) << n)
```

Then beneficiary-favorable state dominance:

```text
(m1,o1) >= (m2,o2)
iff
m1 superset m2
and
o1 subset o2
```

is exactly:

```text
T(m1,o1) bitwise-superset T(m2,o2).
```

Therefore maximal Lower generators are exactly maximal transformed masks under ordinary bitwise set inclusion.

### Exact hybrid normalizer

The exact implementation uses two stages:

1. group by identical mover upset and keep only inclusion-minimal opponent upsets;
2. transform the remaining states to `T` masks and process by descending popcount with a retained-candidate per-bit index.

For the final `loss10` product:

```text
raw lattice meet pairs           2,969,700
distinct state pairs             1,500,311
mover groups                        16,362
same-mover locally irredundant      178,711
exact global maximal generators       8,722
```

An independent direct transformed-mask pass over all 1,500,311 distinct states returned the same 8,722 generators.

The hybrid route completed the three `loss10` intersections in the prototype in approximately:

```text
2.0 s
4.2 s
4.0 s
```

respectively.

These are prototype observations, not universal performance guarantees.

## Full rank-32 root result

Support:

```text
[4,5,2,3,6,6,6]
rank 32
remaining cells 10
residual shapes 27
explicit antichains/player if enumerated 226,537
```

Ordered strong-score levels:

```text
loss2
loss4
loss6
loss8
loss10
draw10
win9
win7
win5
win3
win1
```

Exact generator-only root Upper widths:

```text
1
8
46
381
3,223
9,348
3,437
1,069
95
13
4
```

Exact generator-only root Lower widths:

```text
8
51
564
3,897
8,722
6,422
2,001
211
28
1
1
```

Construction maxima at the root continuation:

```text
largest fixed-action Upper candidate set   13,548
largest fixed-action Lower candidate set    1,521
largest Lower meet-product              3,283,380
largest stored Upper boundary               9,348
largest stored Lower boundary               8,722
```

Prototype root continuation:

```text
elapsed ~26.9 s
peak RSS ~321 MiB
```

The child cones had already been computed separately. These timings are diagnostic only.

## Structural interpretation

The first rank-32 maximum-coordinate pressure was not:

- pair-domain enumeration;
- explicit single-player antichain enumeration;
- q realizability recognition;
- one-cell cofactor semantics;
- stored-boundary impossibility.

It was exact maximal normalization of a large Lower lattice product.

That wall is removed by exploiting the already-present state product order directly.

The boundary sizes are now in the low thousands rather than hundreds, so root-scale economics remain open, but rank 32 is not a semantic closure failure.

## What remains unproved

This checkpoint does not establish:

- that the rank-32 result has an independent second implementation;
- that all rank-32 predecessors close economically;
- that boundary widths remain controlled toward rank 0;
- that the empty standard 7x6 root is solved;
- that C4-R0076 should yet be marked closed;
- that proof/certificate realizability can be discarded;
- any new IsoGraph relation edge.

## Next executable step

First independently reproduce this rank-32 root with the transformed Lower normalizer.

Then move to one structurally maximal rank-31 predecessor of this support and measure:

```text
residual-shape count
principal-cover preimage widths
fixed-action Upper/Lower candidates
Lower meet raw/distinct/local/global widths
stored Upper/Lower widths
time/memory
```

Do not enumerate the single-player antichain lattice or P0/P1 pair domain merely for census.

If rank 31 fails, classify the first divergence before increasing timeout/memory.

## Reconnect marker

```text
current closed target
    [4,5,2,3,6,6,6] rank 32

root Upper
    1,8,46,381,3223,9348,3437,1069,95,13,4

root Lower
    8,51,564,3897,8722,6422,2001,211,28,1,1

next
    independent_rank32_max_coordinate_replay
    -> structurally_maximal_rank31_probe
```

## Epistemic disposition

```text
rank35 distributed proof wall                  BYPASSED on value-boundary path
rank34 immediate predecessor envelope          CLOSED
rank33 49,682-coordinate target                CLOSED
rank32 99,364-coordinate calibration           CLOSED
rank32 226,537-coordinate maximum target       CLOSED IN PROTOTYPE
transformed Lower dominance normalization      EXACT ALGORITHM / PROTOTYPE PASS
rank31                                          NEXT AFTER INDEPENDENT REPLAY
empty root solved                              NO
new IsoGraph relation promoted                 NO
authority 1.1 mutated                          NO
```
