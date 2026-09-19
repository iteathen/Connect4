# RBA assertion-collapse checkpoint 0.1

**Date:** 2026-09-18
**Canonical branch:** research/semantic-quotient
**Status:** post-1.1 research checkpoint; no authority promotion
**Research direction:** Josh Oshiro

## Question

Can the structured RBA Quantifiable Unknown be narrowed by asserting candidate algebraic laws and attacking them on complete bounded controls plus the two documented standard-7x6 pathological supports?

## Tested assertions

A3/A4 — one-cell residual cofactor is completely determined by principal residual-shape images, with arbitrary formulas obtained by join extension and exact right-adjoint/preimage behavior.

A8 — support-local residual/upset state, exact one-cell cofactor, first-win terminal behavior, finite strong-score transform, and max over legal actions suffice for exact ordinary value on bounded complete games.

A9 — fixed action-word cofactor maps compose exactly and keep each principal residual image in the class principal residual / killed(bottom) / terminal.

A stronger candidate, full meet-and-join lattice homomorphism, was also attacked.

## Principal-generator result

Support [5,5,5,2,6,6,6]:

~~~text
residual shapes             16
antichains                 701
one-cell generator cases 5,608
mismatches                   0
~~~

Support [5,5,2,5,6,6,6]:

~~~text
residual shapes             16
antichains                 704
one-cell generator cases 5,632
mismatches                   0
~~~

Aggregate: 11,240 cases, zero mismatches.

## Two-ply composition and adjoints

Across every legal two-ply support path from both targets and both alternating ownership orientations:

~~~text
formula composition cases       36,530
formula composition mismatches        0

right-adjoint composition cases  4,988
right-adjoint mismatches              0
~~~

The tested adjoint identity is the expected reverse composition:

~~~text
R_(F2 o F1) = R_F1 o R_F2
~~~

under the nonterminal residual-coordinate semantics.

## Arbitrary fixed-word composition

Every nonempty legal future prefix from the two seven-empty-cell pathological supports was tested.

~~~text
support 1
    formula composition cases     951,958
    mismatches                           0
    principal cases                21,728
    non-principal images                 0

support 2
    formula composition cases     956,032
    mismatches                           0
    principal cases                21,728
    non-principal images                 0
~~~

Aggregate:

~~~text
formula composition cases       1,907,990
mismatches                              0
principal composition cases        43,456
non-principal images                    0
~~~

Every composed principal image was exactly one child residual-shape principal upset, killed/bottom, or terminal.

### Deductive candidate law

For one player's residual requirement r and a fixed legal future word whose cells are partitioned into cells assigned true to that player T and false/opponent F:

~~~text
if r intersects F:
    killed / bottom

else if r subseteq T:
    terminal
    terminal time = last word position required by r

else:
    residual r minus T
~~~

Thus fixed-word coordinate propagation remains in the same principal-image class. Arbitrary formulas extend by join and normalization.

This means transition composition itself is compact. The remaining rank-collapse question is specifically alternating branching/value-boundary composition plus terminal-distance grading.

## Complete physical controls

An independent upset-lattice q/value implementation was compared against direct physical perfect-play recurrence.

~~~text
4x3 c3
    physical states         4,631
    reachable q classes     3,734
    action cases           11,818
    all mismatches              0

4x4 c4
    physical states       134,289
    reachable q classes    34,094
    action cases          304,574
    all mismatches              0

5x3 c4
    physical states       147,563
    reachable q classes    11,316
    action cases          377,229
    all mismatches              0
~~~

Aggregate:

~~~text
physical states      286,483
reachable q classes   49,144
action cases         693,621

state mismatches           0
action mismatches          0
best-move mismatches       0
q-value conflicts          0
~~~

This is strong bounded evidence for A8, not yet a standard-7x6 completeness proof.

## Full lattice homomorphism was falsified

Join preservation:

~~~text
join cases       3,000,689
join mismatches          0
~~~

Meet preservation failed:

~~~text
support 1 meet cases       1,505,697
meet mismatches              148,758

support 2 meet cases       1,494,992
meet mismatches              155,018
~~~

So cofactor is not a full lattice homomorphism.

### Minimal structural counterexample

At support [5,5,5,2,6,6,6], play cell (0,5) true for the coordinate player.

One parent generator is:

~~~text
{(3,2),(3,3),(3,4),(3,5)}
~~~

Another is:

~~~text
{(3,2),(0,5)}
~~~

Their parent upset meet is empty in the support-local residual-shape lattice.

After cofactor at (0,5), the second contracts to singleton {(3,2)}, whose upset contains the first vertical residual.

Therefore:

~~~text
F(U meet V) = bottom
F(U) meet F(V) = F(U)
~~~

The failure mechanism is new comparability created by residual contraction.

## Order-collapse measurement

The same one-cell maps were measured for how often previously incomparable nonterminal formulas become comparable after cofactor.

~~~text
support 1:
    parent incomparable observations  1,044,409
    become comparable                   152,542
    fraction                             14.61%

support 2:
    parent incomparable observations  1,038,021
    become comparable                   143,598
    fraction                             13.83%
~~~

The maps therefore remove distinctions and create order.

## One-step image contraction

Each support has 701/704 abstract single-player formulas. One cofactor produced only:

~~~text
support 1: 157 .. 259 distinct nonterminal images
support 2: 157 .. 367 distinct nonterminal images
~~~

depending on column and ownership label.

Relative to the parent formula count, this is roughly a 48% to 78% one-step distinction reduction, with owner-true terminal absorption additionally present.

## Contraction with propagation depth

Every legal future prefix from the two pathological supports was evaluated as one direct fixed-word cofactor.

Average image classes, counting terminal as one absorbing class:

~~~text
depth     support 1     support 2

1           220.25        238.75
2            72.38         80.23
3            26.96         29.49
4            11.18         11.62
5             5.37          5.37
6             3.00          3.00
7             2.00          2.00
~~~

Because an extended word map is composition:

~~~text
F_(w+x) = F_x o F_w
~~~

its kernel can only coarsen:

~~~text
F_w(a) = F_w(b)
    implies
F_(w+x)(a) = F_(w+x)(b)
~~~

Therefore fixed-word image-class count is monotonically non-increasing along each path.

## Current RBA interpretation

The tests reject the simplest candidate:

~~~text
RBA transition = lattice isomorphism / full lattice homomorphism
~~~

The surviving structure is narrower:

~~~text
finite support-local distributive lattice
    |
    | join-preserving, distinction-collapsing cofactor
    v
finite child lattice / image join-semilattice

with
    right adjoint / Galois-style backward constraint map
~~~

This accounts for principal-generator sufficiency, natural adjoints, forward distinction collapse, and the need to handle meet through separate lattice/dual machinery rather than push meet naively through cofactor.

## QU refinement consequence

The broad rank-collapse unknown should be narrowed.

No longer open:

~~~text
Do fixed action-word transition maps compose compactly?
~~~

Answer: yes for the residual-coordinate transition layer, as a deductive candidate with exhaustive future-prefix controls.

Still open:

~~~text
Can alternating branching + value-boundary + terminal-distance
operators be composed compactly enough to eliminate explicit
rank-by-rank propagation?
~~~

That is now the load-bearing O3 question.

## Epistemic disposition

~~~text
principal-generator cofactor basis             DEDUCTIVE CANDIDATE / TEST PASS
join preservation                              DEDUCTIVE CANDIDATE / 3.0M PAIR PASS
meet preservation                              DISPROVEN
fixed-word transition composition              DEDUCTIVE CANDIDATE / 1.9M PASS
right-adjoint composition                      DEDUCTIVE CANDIDATE / 4,988 PASS
bounded ordinary-value completeness            STRONGLY SUPPORTED / 286,483 STATES
one-step order/distinction contraction         OBSERVED EXACTLY ON TARGETS
compact alternating-quantifier composition     OPEN
empty standard-7x6 root solved                 NO
authority 1.1 mutated                          NO
typed relation promoted                        NO
~~~
