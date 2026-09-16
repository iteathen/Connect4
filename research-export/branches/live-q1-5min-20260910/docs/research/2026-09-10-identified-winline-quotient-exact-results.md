# Identified win-line quotient — exact falsification and scaling results

**Status:** research evidence only. This is not a production CUDA-BSFP representation, native performance result, or empty-board 7x6 solve claim.

## Candidate under test

At fixed support skeleton `S`, let `I(x)` be the immutable set of geometric winning-line IDs incident to cell `x`. Let:

```text
H0 = OR of I(x) for cells physically occupied by P0
H1 = OR of I(x) for cells physically occupied by P1
```

Then the candidate physical-game quotient is:

```text
Q = (support, H0, H1)
```

For player P0, a geometric line is viable exactly when it is absent from `H1`; for P1, exactly when it is absent from `H0`. At a fixed support, the residual cells of any viable identified line are derivable from line geometry minus the occupied support. A separate per-line residual mask is therefore unnecessary for this physical geometric layer.

The forward transition after a legal landing at cell `x` is monotone and local:

```text
P0 move: H0' = H0 OR I(x); H1' = H1
P1 move: H0' = H0;         H1' = H1 OR I(x)
```

The bit position in the line-hit mask preserves winning-line identity.

## Exact falsification harness

Source:

```text
reference/research-prototypes/2026-09-10-identified-winline-quotient/qualify.mjs
```

Qualified research commit/run:

```text
source: 037704fdcd0a3c19785566a3bbae28c33f1581d9
GitHub Actions run: 34503912227
job: 102961231004
runtime: Ubuntu 24.04 / Node 26.7.0
```

The harness independently constructs:

1. a complete legal physical ownership graph from the empty root, stopping at first wins; and
2. a quotient graph generated only from `(support,H0,H1)` transitions.

It then requires all of the following to agree exactly:

- physical terminal detection versus support/line-hit terminal detection;
- successor hit signatures computed from the physical child versus the OR-only quotient transition;
- complete reachable quotient-class sets at every rank;
- bottom-up exact W/D/L for every physical nonterminal state versus its quotient class;
- root W/D/L.

The physical graph is qualification/oracle machinery only; it is not proposed as the production BSFP architecture.

## Exact results

Across the four complete controls there were **1,681,808 physical nonterminal states**. Observed mismatches were:

```text
terminal predicate:          0
successor hit signature:     0
reachable quotient classes:  0
exact W/D/L:                 0
```

| Geometry | Physical nonterminal states | Quotient states | Collapse | Max physical states / quotient class | Root |
| --- | ---: | ---: | ---: | ---: | --- |
| 4x3 c3 | 4,659 | 4,499 | 1.0356x | 28 | Win |
| 4x4 c4 | 139,625 | 37,323 | 3.7410x | 5,336 | Draw |
| 5x3 c4 | 152,003 | 17,455 | 8.7083x | 4,440 | Draw |
| 4x5 c4 | 1,385,521 | 361,427 | 3.8335x | 37,080 | Draw |

These counts exclude terminal-winning children from the nonterminal state population; terminal edges are tested as observations. They therefore differ from earlier reconnaissance counts that included a broader reachable-state population.

### Late-rank collapse on 4x5

The collapse strengthens sharply as support fills:

| Rank | Physical states | Quotient states | Collapse |
| ---: | ---: | ---: | ---: |
| 13 | 123,822 | 70,976 | 1.745x |
| 14 | 174,754 | 64,376 | 2.715x |
| 15 | 204,136 | 41,808 | 4.883x |
| 16 | 221,834 | 19,405 | 11.432x |
| 17 | 192,778 | 5,882 | 32.774x |
| 18 | 153,648 | 968 | 158.727x |
| 19 | 88,520 | 64 | 1,383.125x |
| 20 | 37,080 | 1 | 37,080x |

This shape is relevant to the existing CUDA-BSFP 6x5 wall, which appears in a late/high-occupancy region rather than at the support-lattice width peak.

## Mask sharing / handle evidence

The exact quotient graph also measured distinct single-side hit masks versus materialized mask occurrences.

| Geometry | Materialized mask occurrences | Unique either-side masks | Occurrences / unique mask |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 8,998 | 484 | 18.59x |
| 4x4 c4 | 74,646 | 393 | 189.94x |
| 5x3 c4 | 34,910 | 59 | 591.69x |
| 4x5 c4 | 722,854 | 3,465 | 208.62x |

All observed controls fit a 16-bit integer handle for a canonical mask arena. This supports the earlier `maskRef` idea as a potentially useful implementation factorization, but does not yet establish that arena lookup/canonicalization is faster than carrying words directly on the target GPU.

Use integer handles into immutable/bounded arenas, not raw CUDA pointers, if this path is promoted.

## Direct quotient recurrence scaling probe

Source:

```text
reference/research-prototypes/2026-09-10-identified-winline-quotient/solve-quotient.mjs
```

This second experiment intentionally asks whether the quotient should simply replace C1 with a flat concrete state graph.

### 4x5 control

The direct quotient-only recurrence reproduced the exact 361,427-state quotient graph and Draw root:

```text
quotient states:          361,427
transition edges:       1,063,472
terminal edges:           109,952
maximum support frontier:   1,580
root:                         Draw
unique side hit masks:       3,465
mask occurrence reuse:      208.62x
```

Research-run generation time was about 315 ms and full generation+solve about 605 ms on the hosted Ubuntu/Node runner. These are not native CUDA performance measurements.

### 5x5 falsifier for flat enumeration

The direct concrete quotient graph was capped at 8,000,000 states. It exceeded that cap while generating rank 15:

```text
status:                    bounded-state-cap
state cap:                 8,000,000
observed before stop:      8,000,001
rank when stopped:         15
transition edges:         20,866,813
terminal edges:            1,520,458
maximum support frontier:      4,789
```

Completed rank totals before the cap included:

```text
rank 10:   134,872
rank 11:   274,102
rank 12:   546,924
rank 13:   941,559
rank 14: 1,572,737
```

The cap was a deliberate falsifier, not a timeout. No 5x5 root claim is made by this direct recurrence because the graph was intentionally not completed.

## Reassessment

The experiments support two different conclusions that must not be conflated.

### Supported strongly

`(support,H0,H1)` is a strong candidate exact quotient for the **physical geometric Connect Four transition/WDL state**. It survived complete transition-system and W/D/L comparison on all tested complete controls, not merely endpoint/root comparison.

The quotient also exhibits very high reuse of individual line-hit masks, and its collapse grows dramatically in late ranks.

### Rejected as the immediate architecture

Do **not** replace C1 with a flat table of every concrete `(H0,H1)` pair. The 5x5 probe exceeded eight million concrete quotient states by rank 15, while the already-qualified C1 ownership-antichain representation uses about 1.044 million boundary records across 5x5. The quotient removes irrelevant physical distinctions but does not by itself solve the combinatorics of enumerating every remaining concrete class.

The useful direction is therefore **symbolic/factored quotient representation**, not concrete quotient enumeration.

## Consequence for the `lineId + maskRef` idea

The basic physical layer does not need 69 records of `{lineId, residualMask}`. Line identity is already the bit position in `H0/H1`, and the residual requirement for a viable line is derived from `(support,lineId)`.

A better candidate is:

```text
support skeleton                       // outer BSFP coordinate
P0 physical-line-hit mask or maskRef   // 69 identified bits on 7x6
P1 physical-line-hit mask or maskRef   // 69 identified bits on 7x6
+ separate CPC/NDC certificate state only where semantically required
```

For standard 7x6 a materialized hit mask needs only three u32 words. A canonical arena may reduce repeated materialization if measured reuse survives at the actual symbolic frontier/candidate seam.

## Next decisive experiment

Do not run a larger flat quotient graph.

C1 boundary records are symbolic ownership cones, not concrete boards, so an authoritative C1 Win/Loss boundary mask cannot safely be replaced by the hit signature of one arbitrary completion. The next representation test must map an **ownership cone to its exact image in line-hit space** and determine whether that image has a compact closed form.

For a minimal P0-Win ownership generator `A` at support universe `U`, the represented region is:

```text
A subset_of X subset_of U
```

and its line-hit image contains:

```text
H0(X) = OR_{x in X} I(x)
H1(X) = OR_{x in U \\ X} I(x)
```

The next experiment should characterize these paired monotone/antitone images and test candidate exact representations such as:

- shared canonical hit-mask refs plus a compact residual relation;
- minimal/maximal line-hit antichains;
- a support-local factored relation/DAG over line-hit generators;
- an exact line-signature index used before existing ownership dominance, without treating signature equality as proof equality unless equivalence is established.

The success criterion is reduction of symbolic candidate/pair/normalization work without re-expanding the quotient into concrete pair states.

## Current disposition

**Promote the identified line-hit quotient from speculative idea to high-priority exact representation research.**

Do not yet change C1 production representation. Preserve B2/B3/terminal-specialization work because those optimizations can compose with a symbolic quotient and remain useful if the quotient-image representation does not close compactly.
