# Checkpoint — closed blocker dual for exact Lower value boundaries

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Base live head:** `e8ff62a7376338af26145d6ac785676415f270ec`
**Status:** deductive lattice-dual candidate with exact reproduction of checkpointed rank-32 Lower boundaries; rank-31 application next
**Authority effect:** none
**Research direction:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

## Resume chain

Read:

1. `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`
2. `RANK32_MAX_COORDINATE_CHECKPOINT.md`
3. `RANK31_BOUNDARY_PRESSURE_CHECKPOINT.md`
4. this file

The rank-31 pressure checkpoint localized the first unresolved operation to exact Lower/downset intersection:

```text
support [4,5,2,2,6,6,6]
draw11 first action-Lower product
    6,744 x 7,901
    = 53,284,344 naive meet candidates
```

Blind Cartesian materialization was explicitly rejected.

## Exact score dual

At a fixed support, the finite strong-score levels are totally ordered and discrete.

For adjacent levels:

```text
theta < next(theta)
```

exact value semantics gives:

```text
Lower(theta)
    = { q | V(q) <= theta }

    = complement { q | V(q) >= next(theta) }

    = complement Upper(next(theta).
```

Thus Lower need not be constructed by intersecting every action Lower downset if the complement of the next Upper set can be dualized directly in the support-local state lattice.

## Transformed product order

For one support with `n` residual shapes, let:

```text
TOP = all n residual-shape bits
m   = mover residual-formula upset
o   = opponent residual-formula upset
```

The beneficiary-favorable state order is:

```text
(m1,o1) >= (m2,o2)

iff

m1 superset_eq m2
and
o1 subset_eq o2.
```

Transform a state to:

```text
T(m,o)
    = m
      | ((TOP xor o) << n).
```

Then:

```text
state A >= state B
iff
T(A) bitwise-superset T(B).
```

The valid transformed coordinates are not arbitrary `2n`-bit masks:

- the lower `n` bits are an upset of the residual-shape poset;
- the upper `n` bits are a downset of the same poset because they encode the complement of the opponent upset.

## Complement as a closed blocker

Let `G` be the minimal transformed generators of `Upper(next(theta))`.

A valid transformed state `T` lies outside that Upper set exactly when:

```text
for every g in G:
    g is not subseteq T.
```

Let the omission mask be:

```text
C = FULL xor T.
```

Then the condition becomes:

```text
for every g in G:
    C intersects g.
```

So `C` must hit every Upper generator.

But `C` is constrained by the residual-shape closure:

- a selected omission bit in the mover/lower half closes downward in the residual-shape poset;
- a selected omission bit in the opponent-complement/upper half closes upward.

Therefore Lower is obtained from **minimal closed hitting sets**, not ordinary unconstrained hypergraph transversals.

## Important negative result — ordinary blocker is wrong

A first implementation computed ordinary minimal hitting sets of the transformed Upper-generator hypergraph.

It was falsified immediately on a checkpointed rank-32 control:

```text
Upper generators       13
ordinary minimal hits  2,099
exact Lower boundary      28
```

The discrepancy is not numerical noise.

Ordinary hitting sets ignore the load-bearing closure requirement on valid transformed state coordinates.

Disposition:

```text
ordinary hypergraph blocker
    REJECTED
```

Do not revive it without the closure system.

## Closed-blocker recurrence

Represent a closed omission set `C`.

Start with:

```text
family = { empty omission }
```

Process each Upper generator edge `g`.

For every current minimal closed omission `C`:

- if `C intersects g`, retain `C`;
- otherwise, for each bit `v in g`:
  - add the principal closure of `v` to `C`;
  - retain only inclusion-minimal resulting closed omissions.

Principal omission closures are:

```text
mover/lower-half bit r:
    Down(r)

opponent-complement/upper-half bit r:
    Up(r)
```

At the end:

```text
Lower maximal generator T
    = FULL xor C
```

for each minimal closed hitting set `C`.

## Why the recurrence is exact — candidate proof

The valid omission sets form a finite closure system closed under union.

Every valid omission containing a selected bit must contain that bit's principal closure.

For one unhit edge `g`, every valid closed hitting extension must contain at least one bit `v in g`, hence must contain `closure(v)`.

Therefore branching on every `v in g`, closing, and inclusion-minimal-normalizing preserves exactly the minimal closed extensions that hit the processed edges.

Induct over the Upper-generator edges.

After all edges are processed, the family is exactly the inclusion-minimal valid omissions that hit every Upper generator.

Complement reverses inclusion, so their complements are exactly the maximal valid transformed states outside `Upper(next(theta))`, i.e. the exact `Lower(theta)` boundary.

This is a finite distributive-lattice / closure-system statement. It does not use physical-state realizability or solved labels.

## Exact implementation qualification against persisted rank-32 boundaries

The closed blocker was tested against already-checkpointed Lower boundaries produced by the independent two-sided recurrence.

Progressive controls:

```text
Upper(next) generators -> closed-blocker Lower generators

13      ->    28     EXACT
95      ->   211     EXACT
1,069   -> 2,001     EXACT
3,437   -> 6,422     EXACT
9,348   -> 8,722     EXACT
```

Exact means complete generator-set equality after conversion back to state coordinates, not merely equal counts.

The largest control is the checkpointed rank-32 maximum-coordinate support:

```text
[4,5,2,3,6,6,6]

Upper(draw10) = 9,348 generators
Lower(loss10) = 8,722 generators
```

The closed blocker reproduces all 8,722 exact Lower generators without constructing the prior multi-action Lower meet product.

## Implementation refinement — active-family index

A dynamic exact implementation maintains only the current minimal closed omission family plus per-bit membership indexes.

The first version accumulated IDs for every historical generator. At the largest control this inflated bitset queries even though only about ten thousand generators remained active.

Exact cleanup:

- retain tombstone semantics while mutations are in flight;
- when historical IDs materially exceed live IDs, compact the index to active generators only;
- rebuild per-bit membership indexes from the active family.

This changes no semantic candidate set.

Observed prototype diagnostics:

```text
1,069 Upper generators
    -> 2,001 exact Lower
    ~1.2 s

3,437 Upper generators
    -> 6,422 exact Lower
    ~6.6 s

9,348 Upper generators
    -> 8,722 exact Lower
    ~22.3 s
    max live closed-blocker family ~10,131
    max generated candidate batch   ~4,440
```

Timing is diagnostic only, not a universal performance claim.

## Structural consequence

The complete ordinary-value boundary recurrence can potentially be simplified from:

```text
child Upper
    -> action Lower
    -> Cartesian/intersection of action downsets
    -> parent Lower
```

to:

```text
parent Upper at next score
    -> exact closed blocker
    -> parent Lower at current score.
```

Combined with the already-qualified fixed-action Upper predecessor:

```text
child Lower
    -> coordinate-separable cofactor preimage
    -> action Upper
    -> union
    -> parent Upper
```

this yields a candidate one-primary-family rank recurrence in which Lower is a local exact dual of Upper rather than an independently propagated action intersection.

## What this does not establish

This checkpoint does not establish:

- root-scale economics;
- rank-31 closure yet;
- that only Upper need be persistently stored in every implementation;
- authority promotion of the candidate theorem;
- proof/certificate realizability collapse;
- any relation among C4-R0043/C4-R0069/C4-R0076;
- an empty standard-7x6 solution.

No IsoGraph relation edge is promoted.

## Next executable step

Apply the closed blocker to the selected rank-31 root:

```text
support
    [4,5,2,2,6,6,6]

known exact Upper widths
    1,8,54,404,3120,13954,19047,8428,1237,107,12,4

known exact Lower prefix
    loss2   7
    loss4  55
    loss6 504
    loss8 5224
    loss10 11350
```

For every adjacent level:

```text
Lower(level_i)
    = closed_blocker(Upper(level_(i+1))).
```

First require exact equality for the already-closed prefix through `loss10`.

Only then accept newly computed:

- `Lower(draw11)`,
- `Lower(win11)`,
- later win thresholds.

Do not materialize the 53,284,344 action-Lower Cartesian product.

## Reconnect marker

```text
new exact candidate
    closed-blocker Lower dual

largest exact control
    9,348 Upper -> 8,722 Lower

next
    rank31_closed_blocker_replay
    verify known prefix
    then close draw11 and remaining Lower thresholds
```

## Epistemic disposition

```text
ordinary blocker                             FALSIFIED
closed omission system                       DEDUCTIVE STRUCTURE
closed-blocker recurrence                     DEDUCTIVE CANDIDATE
rank32 exact boundary reproductions            PASS
rank31 application                             NEXT
empty root solved                              NO
new IsoGraph relation promoted                 NO
authority 1.1 mutated                          NO
```
