# RBA semiring orientation and projection checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** research/semantic-quotient  
**Status:** exact algebraic refinement + measured evaluation-policy evidence  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Scope

This checkpoint follows the exact closure of rank29 support [3,5,2,1,6,6,6] and the exact draw14 closure of rank28 support [3,5,2,0,6,6,6].
The semantic multiplication is unchanged:

~~~text
Max({a meet b | a in A, b in B})
= Max(union_a Max({a meet b | b in B}))
~~~

Only its exact evaluation orientation is studied here.

## Deductive result — outer-restriction skyline monotonicity

For fixed finite inner family B, define P_B(a) = Max({a meet b | b in B}).
If a <= a' in transformed-mask inclusion, then |P_B(a)| <= |P_B(a')|.
Reason: every member of {a' meet b} lies below a maximal member m. Restriction phi(x)=a meet x preserves that domination. Every maximal member after restriction is therefore the image of at least one maximal member before restriction, while images may merge or become dominated. Restriction can collapse a local skyline but cannot create more maximal projections than existed before.
This is exact. It does not by itself order two arbitrary operand families or prove which orientation is globally faster.

## Exact projection quotient test

For fixed inner B, the raw projection family depends only on a meet Union(B). If I=Intersection(B) and V=Union(B) minus I, the variable skyline skeleton depends only on a meet V; a meet I is constant across that outer projection family.

Rank29 final product:
~~~text
outer generators              41,133
inner generators             131,121
inner union bits                  64
inner intersection bits             0
unique outer restrictions     41,096
duplicate restriction classes     37
largest class                       2
~~~

Rank28 final product:
~~~text
outer generators              32,869
inner generators              57,909
inner union bits                  68
inner intersection bits             1
unique outer restrictions     32,869
duplicate restriction classes      0
~~~

Disposition: exact but not materially compressive on these products.

## Exact projection-index test

An exact balanced inner-family tree stores the bitwise union of each subtree. For outer a, if an already found skyline generator dominates a meet node_union, the entire node is safely pruned.
On the complete rank28 final product:
~~~text
raw implicit pairs            1,903,410,921
inner visits after pruning      691,043,700
visit fraction                       36.3%
pruned fraction                      63.7%
local candidates                 2,641,949
final generators                    78,546
exact final-set match                  YES
indexed local generation           13.416 s
indexed normalization               2.864 s
~~~
The original tuned streaming orientation took about 4.329 s local + 2.433 s normalization. The index exposes genuine projection structure but is slower in this implementation.

## Major correction — final-product orientation

Rank29 old orientation:
~~~text
41,133 outer x 131,121 inner
local candidates 4,393,899
median/p90/p99 36 / 280 / 896
final generators 140,454
measured local stage ~51.254 s
measured normalization ~5.909 s
~~~

Rank29 exact reversed orientation:
~~~text
131,121 outer x 41,133 inner
local candidates 1,353,069
median/p90/p99 1 / 25 / 135
max 24,083
distinct 1,169,283
after same-mover 640,912
after same-opponent 413,093
final generators 140,454
local generation 5.001 s
normalization 5.417 s
total 10.419 s
SHA-256 33fa501eb8ff6a7501079d131452d8f2807302ad74ce104b3ecea10a6e1349bc
~~~

Rank28 old orientation:
~~~text
32,869 outer x 57,909 inner
local candidates 2,641,949
median/p90/p99 38 / 194 / 661
final generators 78,546
local generation 4.329 s
normalization 2.433 s
~~~

Rank28 exact reversed orientation:
~~~text
57,909 outer x 32,869 inner
local candidates 253,413
median/p90/p99 1 / 1 / 40
max 26,599
distinct 235,635
after same-mover 172,901
after same-opponent 141,454
final generators 78,546
local generation 1.487 s
normalization 1.046 s
total 2.533 s
SHA-256 1aa22092bea4ff337f5fb114675da76c3ad7de969a877efd269cb02e34ae453e
~~~

Both reversed products return the byte-identical already-qualified final generator streams.

## Six-product orientation qualification

| Product | A size | B size | A-outer total | B-outer total | Faster |
|---|---:|---:|---:|---:|---|
| rank29 step1 | 30,430 | 31,397 | 3.397 s | 6.062 s | A |
| rank29 step2 | 92,989 | 8,821 | 5.572 s | 9.792 s | A |
| rank29 step3 | 131,121 | 41,133 | 10.419 s | ~57.16 s prior path | A |
| rank28 step1 | 6,474 | 20,292 | 0.894 s | 2.232 s | A |
| rank28 step2 | 51,208 | 6,423 | 1.635 s | 1.676 s | A / near tie |
| rank28 step3 | 57,909 | 32,869 | 2.533 s | 6.762 s | A |

For each row, A is the accumulated exact boundary and B is the next fixed-action Lower factor. Accumulated-boundary-as-outer is fastest on all six controls.
Minimum local-candidate count is not sufficient to choose orientation. Rank29 step2 is the explicit counterexample: A outer produces 1,537,353 local candidates and finishes in 5.572 s; B outer produces only 1,200,735 but takes 9.792 s because local skylines are much wider.

## Operand density observation

The accumulated boundary is consistently sparser in transformed-mask popcount than the next factor:
~~~text
rank29: 43.35<44.03, 41.27<43.62, 40.48<43.46
rank28: 45.29<46.90, 43.43<45.49, 42.85<46.16
~~~
This is consistent with outer-restriction monotonicity and meet accumulation reducing projection dimension. It is evidence, not a general runtime theorem.

## Sampling failure and repair

The earlier final-product estimate used ordered-prefix sampling. Generator order is highly nonrepresentative. At rank29 a 32-element prefix overestimated the two candidate totals by about 17.7x and 93.6x and selected the wrong orientation.
Deterministic hash sampling removes order bias. Retrospective 100-seed controls show median-of-three independent 32-generator hash samples selected the lower-candidate final orientation 100/100 times at both ranks.
Candidate count is not the runtime objective, so the executable chooser samples actual local-skyline work:
~~~text
3 independent deterministic hash samples
x 32 outer generators per orientation
-> estimate local query work
-> estimate candidate volume as normalization/memory guard
-> choose only on material separation
-> escalate sampling when close
~~~
One fixed deterministic control selected the measured faster A-outer orientation on all six products.

## Current interpretation

Measured cost is controlled by outer-mask restriction structure, induced local skyline width distribution, local dominance-maintenance work, and candidate volume entering global normalization.
Raw Cartesian size, operand cardinality, and local-candidate count alone are each insufficient.
The left-fold accumulated boundary has become progressively sparser on these controls, and using it as the outer projection family is the current best exact evaluation policy.

This is evaluation-policy evidence. It does not change Bellman semantics, authority 1.1, or the open proof/value bridge.

## Next

Apply accumulated-boundary outer orientation to the remaining selected rank28 strong thresholds. Record per-threshold skyline and normalization economics before any rank27 descent.
