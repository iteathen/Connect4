# RBA rank31 final Lower product closure — support [4,3,3,3,6,6,6]

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact final product closed / support ready to finalize  
**Authority effect:** none

## Input

```text
P2 = 54,555
A3 = 4,390
raw = 239,496,450
```

Core-relative absorption and exact local projection had already produced:

```text
residual = 21,255 x 4,380
residual pairs = 93,096,900
absorber witnesses = 33,310

local candidate occurrences = 460,830
distinct candidates = 416,493
distinct SHA-256
f4442f0baf1da04fa753b9ec92fcf3d80920430b570dd98e66555528d7724364
```

## Resumable exact global maximalization

The qualified static dominance-tree normalizer ran in two bounded slices.

First slice:

```text
classified 358,699 / 416,493
budget ~25 s
```

Second slice completed the remainder.

Aggregate exact-query work:

```text
tree nodes visited       676,503,915
leaf records inspected 3,535,929,322
```

Exact maximal output:

```text
67,483 generators
SHA-256
ede50b4e51b40cd25d61514856cb68c705d208148f70aa79eadf3f160af2f143
```

The keep/reject bitmap and resume index preserved all first-slice work across the budget boundary.

## Support state now ready

Cached support data:

```text
Upper = 11,097
P1 = 32,389
P2 = 54,555
P3 = 67,483
```

Next: install the exact P3 stream in the support cache, finalize the rank31 support, persist its boundary/hash, then continue to the next rank31 support.
