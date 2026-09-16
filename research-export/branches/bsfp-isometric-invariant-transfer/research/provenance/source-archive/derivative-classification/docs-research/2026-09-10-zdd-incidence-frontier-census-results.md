# 7x6 ZDD incidence-frontier census — exact research result

**Status:** research evidence only. This is not a production CUDA-BSFP representation, performance claim, or empty-board 7x6 solve claim.

## Question

Frontier-based ZDD construction can forget graph entities after their final incidence has been processed. Standard 7x6 Connect Four supplies a small fixed incidence hypergraph:

```text
42 cells
69 geometric connect-4 winning lines
276 line-cell incidences
```

This experiment asks which orientation/order gives the smallest number of entities simultaneously crossing a processed/unprocessed cut:

1. process cells, carry crossing winning-line IDs;
2. process winning lines, carry crossing cell IDs.

The result is a structural width census only. Frontier width does not by itself bound ZDD node count or BSFP runtime.

## Source and exact run

Harness:

```text
reference/research-prototypes/2026-09-10-zdd-transfer/frontier-width.mjs
```

Exact successful run:

```text
source/workflow head: 0f92978b78b1ce72aae6d06a4496b9b816be8990
GitHub Actions run:   34509908654
job:                  102981180770
runtime:              Ubuntu 24.04 / Node 26.7.0
```

The immediately preceding run `34509850679` failed during Actions setup because the temporary workflow used floating `actions/checkout@v4` and `actions/setup-node@v4`; repository policy requires full commit-SHA action pins. No experiment code ran in that failed attempt. The successful run used the repository's existing pinned action SHAs.

## Geometry checks

The harness independently asserted:

```text
winning lines:          69
line-cell incidences:  276
```

Cell-to-winning-line incidence counts:

```text
minimum: 3
maximum: 13
mean:    6.571428571428571
```

## Results

Sorted by maximum frontier width:

| Order | Orientation | Maximum frontier | Mean frontier |
| --- | --- | ---: | ---: |
| **line-x-center** | **process lines / crossing cells** | **21** | **16.5072** |
| line-y-center | process lines / crossing cells | 24 | 18.0580 |
| line-greedy-current-frontier | process lines / crossing cells | 24 | 18.6522 |
| line-diagonal-center | process lines / crossing cells | 25 | 19.2609 |
| cell-greedy-current-frontier | process cells / crossing lines | 38 | 22.3095 |
| column-major | process cells / crossing lines | 39 | 22.0714 |
| row-major | process cells / crossing lines | 45 | 24.2143 |
| edge-column-inward | process cells / crossing lines | 51 | 32.3571 |
| center-column-outward | process cells / crossing lines | 54 | 33.6429 |

The best tested order is therefore a **line-first decomposition**. The maximum live structural frontier is 21 cells, with the first maximum reached after processing line 26.

## Interpretation

This is a materially favorable signal for a Connect4-specific ZDD-inspired representation.

A conventional cell-first encoding asks a decision structure to carry many line identities across the cut. In the tested orders this required 38 to 54 simultaneously crossing lines at the widest point.

The dual orientation is substantially narrower: process the 69 line constraints and retain only cell state whose incidence reaches both the processed and unprocessed line suffix. The best simple deterministic order carries at most 21 cells.

This suggests a candidate construction shape:

```text
fixed ordered line stream
        |
        v
frontier state over <=21 crossing cells in the best tested order
        |
        v
canonical immutable suffix-family identity
```

The semantic state per crossing cell remains to be determined. It may need more than one bit, especially for paired P0/P1 line-hit/product-order families and first-win-sensitive transformations.

## Non-claims

Do **not** infer any of the following from the width 21 result:

```text
ZDD size <= 2^21
BSFP runtime is polynomial
all line-family operations stay bounded by frontier width
21 bits are sufficient state
line-x-center is globally optimal
```

Decision-diagram size also depends on semantic state cardinality, exact merge conditions, family operation structure, and variable/order effects. Rich family-algebra operations can exhibit exponential blow-up even when representation ordering is chosen well.

## Reassessment

The result changes the next experiment in two ways.

1. A line-first/crossing-cell decomposition is now the primary structural candidate for a canonical family representation.
2. A generic 42-cell ownership ZDD or 69-line flat ZDD should be treated as baselines, not defaults.

The next decisive experiment remains a fused exact minimal-family product (`MinJoin`) on **real BSFP operands**. It should compare explicit Cartesian union + normalization with a canonical recursive family operation that performs subsumption elimination during construction.

Only after that measurement should a production node format, CUDA primitive, or CUDA-Algorithms ownership decision be proposed.
