# RBA rank31 final Lower product local phase — support [4,3,3,3,6,6,6]

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact local product phase complete / global normalization pending  
**Authority effect:** none

## Input

Persisted second Lower intermediate:

```text
P2 = 54,555
SHA-256
74664ce4cdbbb6cfc8f41107ca51801d8c849000e66b98652b5ac7af73d2d468
```

Final fixed-action Lower factor:

```text
A3 = 4,390
```

Raw product:

```text
54,555 x 4,390
= 239,496,450 pair opportunities
```

## Core-relative absorption

```text
absorber witnesses 33,310

residual factors
21,255 x 4,380
= 93,096,900 residual pairs

raw pair work removed
~61.13%
```

## Exact local phase

Projection-tree local skyline evaluation with vertical superset-union fallback:

```text
outer queries              21,255
projection-tree queries    21,254
vertical switch queries         1

projection leaf scans      57,963,151
tree nodes visited          8,573,764

local candidate occurrences   460,830
distinct candidates            416,493
local wall                       ~2.67 s
complete local+serialization     ~2.90 s

distinct candidate SHA-256
f4442f0baf1da04fa753b9ec92fcf3d80920430b570dd98e66555528d7724364
```

## Current disposition

For both unresolved products of this rank31 support, local restricted-image evaluation is now measured at only a few seconds.

The active support wall is global maximalization of approximately 400k distinct candidates per product.

This does not erase the earlier larger-product local walls recorded during rank26 descent. It narrows the present support correctly.

## Next

Run the exact resumable static dominance-tree normalizer over these 416,493 distinct candidates, persist the final P3 stream, then close the full support from cached Upper/P1/P2/P3 without recomputation.
