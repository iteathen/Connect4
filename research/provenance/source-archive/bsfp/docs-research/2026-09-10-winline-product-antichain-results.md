# Identified win-line product antichain — exact results

**Status:** research evidence only. This is not a production CUDA-BSFP representation, native performance result, or empty-board 7x6 solve claim.

## Question

The identified win-line quotient research established a candidate exact physical-state quotient at fixed support:

```text
Q = (support, H0, H1)
```

where `H0` and `H1` are the sets of geometric winning-line IDs physically hit by P0 and P1 stones respectively.

Flat enumeration of all concrete quotient states does not scale sufficiently. This experiment asks a stronger symbolic question:

> Can exact C1 Win/Loss regions be represented as compact antichains directly in the product order over `(H0,H1)`?

Define the P0-favorable partial order:

```text
a <= b
iff
  a.H0 subset_of b.H0
  and
  b.H1 subset_of a.H1
```

Thus `b` is at least as favorable to P0 when P0 has hit every line already hit in `a` (and perhaps more), while P1 has hit no additional lines beyond those hit in `a` (and perhaps fewer).

Candidate symbolic boundaries are therefore:

- minimal Win pairs under this order;
- maximal Loss pairs under this order.

## Why the test uses the full C1 symbolic domain

The C1 ownership-antichain solver does not contain only physically reachable turn-count-correct histories. At each support it defines an exact symbolic W/D/L function over all ownership assignments represented by that support.

Therefore a valid replacement representation must preserve that full symbolic domain, not merely reachable game states.

For every analyzed support, the harness:

1. obtains the authoritative C1 ownership Win/Loss frontier;
2. enumerates every ownership partition of the occupied support cells for the bounded test geometry/support;
3. classifies that assignment from the exact C1 frontier;
4. maps the assignment to `(H0,H1)`;
5. requires every ownership assignment mapping to one quotient pair to have the same W/D/L value;
6. derives minimal Win and maximal Loss line-hit pairs under the product order;
7. exhaustively checks those product antichains against every induced quotient class, requiring zero false coverage and zero missing coverage.

The exhaustive assignment walk is qualification/oracle machinery only. It is not the proposed production recurrence.

## Source and run

Harness:

```text
reference/research-prototypes/2026-09-10-identified-winline-quotient/product-antichain.mjs
```

Exact successful source/run:

```text
source: 36a95ce955b76ce95d34c7cf8ea5b3ee4c3b927d
GitHub Actions run: 34505707527
job: 102967256690
runtime: Ubuntu 24.04 / Node 26.7.0
```

The previous attempt failed only in summary output because `maximumBoundaryRecordRatio` was returned under an incorrect variable name. No semantic assertion had failed. The source above contains the repaired observer and is the evidence key for the results below.

## Exact complete-support controls

These geometries were evaluated at **every support** and over **every ownership assignment represented by each support**.

| Geometry | Supports | C1 boundary records | Product line-hit boundary records | Boundary ratio | Reduction | Assignment → quotient collapse |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 256 | 3,004 | 2,862 | 0.9527 | 4.73% | 1.174x |
| 4x4 c4 | 625 | 6,591 | 4,879 | 0.7403 | 25.97% | 4.931x |
| 5x3 c4 | 1,024 | 5,442 | 3,062 | 0.5627 | 43.73% | 9.234x |

Across all complete controls:

```text
quotient W/D/L conflicts:       0
false Win product coverage:     0
false Loss product coverage:    0
missing Win product coverage:   0
missing Loss product coverage:  0
```

This establishes exact product-order monotonicity on the tested full C1 symbolic domains, not merely on reachable physical positions.

### 4x4 rank trend

The product boundary becomes progressively smaller in the middle/late ranks:

```text
rank  8:  799 / 1024 = 0.7803
rank 10:  691 / 1059 = 0.6525
rank 11:  552 /  906 = 0.6093
rank 12:  311 /  535 = 0.5813
rank 13:  146 /  254 = 0.5748
rank 14:   43 /   67 = 0.6418
```

### 5x3 rank trend

```text
rank  6: ratio 0.6175
rank  7: ratio 0.5953
rank  8: ratio 0.5251
rank  9: ratio 0.5378
rank 10: ratio 0.4667
rank 11: ratio 0.5321
rank 12: ratio 0.5812
rank 13: ratio 0.6000
```

## Bounded hot-support controls

For 4x5 and 5x4, the harness selected the support with the largest C1 boundary at each rank, then exhaustively evaluated every ownership assignment of those selected supports. This keeps the experiment bounded while deliberately targeting the difficult symbolic frontiers.

Each geometry examined 21 supports and 2,097,151 ownership assignments.

| Geometry | Selected C1 boundary | Product line-hit boundary | Boundary ratio | Reduction | Assignment → quotient collapse |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x5 c4 | 878 | 429 | 0.4886 | 51.14% | 19.713x |
| 5x4 c4 | 1,517 | 547 | 0.3606 | 63.94% | 21.427x |

Again, all quotient-consistency and product-boundary coverage falsifiers were zero.

### 4x5 late/hot supports

```text
rank 13 support 778: 122 -> 46   ratio 0.3770
rank 14 support 789:  92 -> 38   ratio 0.4130
rank 15 support 825: 118 -> 40   ratio 0.3390
rank 16 support 861:  88 -> 26   ratio 0.2955
rank 17 support 862:  75 -> 36   ratio 0.4800
rank 18 support 863:  39 -> 15   ratio 0.3846
```

### 5x4 late/hot supports

The strongest reductions appear exactly in the late/high-occupancy region relevant to the current CUDA-BSFP scaling problem:

```text
rank 13 support 2193: 155 -> 81   ratio 0.5226
rank 14 support 2318: 168 -> 52   ratio 0.3095
rank 15 support 2343: 293 -> 41   ratio 0.1399
rank 16 support 2368: 202 -> 32   ratio 0.1584
rank 17 support 2373: 153 -> 24   ratio 0.1569
rank 18 support 2498: 110 -> 14   ratio 0.1273
```

For support 2343 at rank 15, heights `[3,3,3,3,3]`, C1 had 284 Win generators + 9 Loss caps. The product-line representation needed 32 Win minima + 9 Loss maxima: **293 -> 41 total boundary records**.

For support 2498 at rank 18, the reduction was **110 -> 14**, about 7.86x fewer boundary records.

## Reassessment

The experiment answers an important question positively:

> The exact W/L regions induced by C1 can be represented, on every tested assignment, as monotone boundaries in the product order `H0 superset / H1 subset`.

This is stronger than the earlier observation that concrete physical states collapse under `(support,H0,H1)`. It demonstrates that the quotient can preserve and often substantially compress the **symbolic Win/Loss boundary** itself.

The improvement grows with occupancy and is strongest in the same general late-rank regime where the current C1 CUDA realization becomes expensive.

## What this does not prove

The harness obtains the product boundary by exhaustively mapping C1-classified ownership assignments. Therefore it does **not** establish that the boundary can yet be generated directly from child product boundaries without reconstructing ownership space.

In particular, a direct solver must preserve the support-local realizability correlation between `H0` and `H1`. The Cartesian product of arbitrary line-hit masks contains many pairs that are not images of any ownership partition of the support. Product-order closure over arbitrary pairs is not automatically a legal symbolic state space.

The unresolved production question is therefore:

> Is the image of the BSFP recurrence closed under a compact, directly computable line-hit representation that preserves realizability by construction?

## Next decisive experiment

Build a separate **reference direct line-product BSFP recurrence**. It should operate on line-hit boundary objects only and compare every produced support frontier with the product boundary derived by this harness.

The direct recurrence must test:

1. **Move preimage / cofactor** under the monotone forward update:

```text
P0 move at x: H0_child = H0_parent OR I(x); H1_child = H1_parent
P1 move at x: H0_child = H0_parent;          H1_child = H1_parent OR I(x)
```

2. **Terminal/first-win subtraction** from support plus identified line-hit masks.
3. **Existential/universal move composition** in the product order.
4. **Support-local realizability** of paired masks, without enumerating arbitrary concrete quotient pairs.
5. Exact equality with the derived product-boundary oracle on complete small controls before any CUDA implementation.

If direct recurrence cannot preserve realizability compactly, retain the product-line signature as an exact semantic filter/index in front of C1 rather than forcing a replacement representation.

## Current disposition

Promote the **line-hit product antichain** to the highest-priority representation experiment in the CUDA-BSFP lane.

Do not mutate C1 yet. Keep B2/B3, terminal specialization, and exact winspace filters intact: they remain independently valid and may compose with the line-product representation or remain useful if a direct line-product recurrence fails to close compactly.
