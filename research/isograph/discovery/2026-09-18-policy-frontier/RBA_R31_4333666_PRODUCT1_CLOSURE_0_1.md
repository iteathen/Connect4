# RBA rank31 first Lower product closure — support [4,3,3,3,6,6,6]

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact product closed / crash-safe resumable qualification  
**Authority effect:** none

## Product

Persisted fixed-action Lower factors:

```text
A0 = 6,808
A1 = 4,576
raw pair opportunities = 31,153,408
```

Core-relative absorption:

```text
absorbed rows      1,773
absorbed columns     378

residual factors
5,035 x 4,198
residual pairs = 21,136,930
raw work eliminated = 32.1521%
```

## Exact local phase

Using projection-tree local skylines plus vertical superset-union rare-tail fallback:

```text
outer queries            5,035
tree queries             5,031
vertical direct              3
tree->vertical switch        1

leaf scans          19,311,594
tree nodes           2,495,728

local occurrences      520,057
distinct candidates    402,887
local wall              ~2.64 s
local+serialization     ~2.88 s

distinct candidate SHA-256
af1447e6a44552dac5dbc2c128ae30e8e6ec0bd7f206a790dc2575566a48e8a0
```

## Exact global maximalization

The qualified static dominance-tree normalizer was run resumably over all 402,887 distinct candidates.

First bounded slice:

```text
classified 389,709 / 402,887
budget ~25 s
```

Second slice completed the remainder.

Aggregate exact-query work:

```text
tree nodes visited      557,188,065
leaf records inspected 2,701,805,218
```

Exact maximal product:

```text
32,389 generators
SHA-256
33d4c2527483fa1f3f15b2a82cb680b70899a15e82eb40e53eec2c0cf530b465
```

No candidate classification was lost across the budget boundary; the keep/reject bitmap and resume index were persisted.

## Correction to wall classification

For this product:

```text
local restricted-image wall       NO
global normalization high-cost    YES
exact bounded/resumable route     YES
```

The broader earlier-rank campaign still contains products where local projection itself was bounded, so this does not globally demote local-query scaling. It does show that phase attribution must be measured product by product.

## Next

Install the exact 32,389-generator stream as support product `P1` and resume the same support from product 2 without recomputing action fronts or this product.

Persist the next product intermediate immediately when it closes.
