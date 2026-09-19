# RBA shared-target principal-cover transformer and rank26 predecessor assessment 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact coordinate-preimage evaluation law + selected rank26 predecessor  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Trigger

After rank27 staged product evaluation became bounded, the first rank26 predecessor-interface sweep did not finish its first fixed-action case inside the bounded window.

The new wall was coordinate preimage construction, not semiring multiplication.

The selected rank27 `win15` boundary contains:

```text
Lower generators 306,617
Upper generators 235,107

distinct ownGE targets from child Lower      89,032
distinct oppGE targets from child Upper     117,692
```

The previous `minCover(target)` evaluator solved each requested target independently except for top-level result caching.

## Exact shared-target recurrence

Fix one support edge and one coordinate cofactor.

For each usable parent principal residual shape `i`:

```text
P_i = parent principal upset
I_i = child cofactor-image upset
```

Let `MC(T)` be the inclusion-minimal parent upset unions whose image union covers child target upset `T`.

Base:

```text
MC(empty) = { empty }
```

For nonempty `T`, choose any child bit `b in T`. Every cover contains some principal image `I_i` containing `b`. Therefore:

```text
MC(T)
  =
Min(
  union over i with b in I_i
    { P_i union U | U in MC(T \ I_i) }
)
```

This is exact:

1. each generated union covers `T`;
2. every cover contains a chosen `i` covering `b` and a cover of the remainder;
3. final `Min` preserves exactly the minimal parent-cover frontier.

The recurrence depends only on the uncovered child target mask. Memoization therefore shares subproblems across every `>=` coordinate-preimage query on one fixed cofactor edge.

Owner-true terminal principals remain outside the nonterminal recurrence and retain the existing terminal branch.

## Differential qualification

The shared-target transformer was compared against the prior exact `EdgeMap::minCover` implementation on every immediate rank26 predecessor edge:

```text
6 edges
x 2 modes (ownGE / oppGE)
x 48 target upsets
= 576 exact comparisons

mismatches = 0
```

## Complete target-family economics — first predecessor

Parent:

```text
[2,4,2,0,6,6,6]
39 residual shapes
78 transformed bits
```

Mover `ownGE`:

```text
requested targets            89,032
memoized uncovered targets  141,871
recursive calls             291,600
memo hits                   149,730
maximum cover frontier            2
sum requested output widths 132,649
wall                          ~141.8 ms
```

Opponent `oppGE`:

```text
requested targets           117,692
memoized uncovered targets 163,346
recursive calls             289,514
memo hits                   126,169
maximum cover frontier            1
sum requested output widths  69,252
wall                           ~95.1 ms
```

The prior >120-second first-interface wall was duplicated cover search, not intrinsic cover-frontier growth.

## Rank26 predecessor assessment

Closed child:

```text
[3,4,2,0,6,6,6]
rank 27
```

Two independent threshold probes were used.

### Child win15 -> parent fixed-action loss16

| column | parent support | shapes | bits | Upper | Lower | max own cover |
|---:|---|---:|---:|---:|---:|---:|
| 0 | [2,4,2,0,6,6,6] | 39 | 78 | 177,036 | 111,041 | 2 |
| 1 | [3,3,2,0,6,6,6] | 40 | 80 | 75,920 | 49,724 | 2 |
| 2 | [3,4,1,0,6,6,6] | 40 | 80 | 134,818 | 128,724 | 8 |
| 4 | [3,4,2,0,5,6,6] | 41 | 82 | 218,009 | 144,461 | 2 |
| 5 | [3,4,2,0,6,5,6] | 41 | 82 | 233,985 | 187,533 | 2 |
| 6 | [3,4,2,0,6,6,5] | 41 | 82 | 326,205 | 235,107 | 4 |

### Child loss14 -> parent fixed-action win15

| column | parent support | shapes | bits | Upper | Lower | max own cover |
|---:|---|---:|---:|---:|---:|---:|
| 0 | [2,4,2,0,6,6,6] | 39 | 78 | 120,412 | 70,506 | 2 |
| 1 | [3,3,2,0,6,6,6] | 40 | 80 | 59,798 | 44,706 | 2 |
| 2 | [3,4,1,0,6,6,6] | 40 | 80 | 86,027 | 71,507 | 8 |
| 4 | [3,4,2,0,5,6,6] | 41 | 82 | 167,173 | 112,884 | 2 |
| 5 | [3,4,2,0,6,5,6] | 41 | 82 | 173,370 | 112,884 | 3 |
| 6 | [3,4,2,0,6,6,5] | 41 | 82 | 187,318 | 114,585 | 4 |

The complete twelve-interface run, including shared-cover evaluation, candidate generation and exact static antichain normalization, took about **25.8 seconds**.

## Selected rank26 control

Selected:

```text
[3,3,2,0,6,6,6]
rank 26
residual shapes 40
transformed bits 80
```

It does not minimize representation width, yet it has the smallest measured Upper and Lower interface under both threshold probes. Principal-cover width remains 2.

Complementary pressure control:

```text
[3,4,1,0,6,6,6]
max own principal-cover frontier = 8
```

## Next exact seam

The selected rank26 central threshold is `draw16`.

Legal rank27 children:

```text
[4,3,2,0,6,6,6]   missing draw15
[3,4,2,0,6,6,6]   draw15 already closed
[3,3,3,0,6,6,6]   missing draw15
[3,3,2,1,6,6,6]   missing draw15
```

Next:

```text
cache and qualify the three missing rank27 draw15 children
-> compose selected rank26 draw16
-> localize the next exact wall
-> reassess before rank25
```

Do not infer missing child boundaries from these one-edge interfaces.

Frozen authority 1.1 is unchanged.
