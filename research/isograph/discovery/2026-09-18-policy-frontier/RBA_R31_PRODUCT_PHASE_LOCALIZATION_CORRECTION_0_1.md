# RBA rank31 product phase localization correction 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact phase-localization checkpoint  
**Authority effect:** none

## Product

Rank31 support in progress:

```text
[4,3,3,3,6,6,6]
```

Persisted Lower action factors:

```text
A = 6,808
B = 4,576
raw = 31,153,408
```

Core-relative absorption:

```text
absorbed rows     1,773
absorbed columns    378

residual factors
A' = 5,035
B' = 4,198

residual pairs = 21,136,930
pair work eliminated = 32.1521%
```

## Exact local phase replay

The residual product was evaluated independently from the support runner using the same exact projection-tree local semantics plus the qualified vertical superset-union rare-tail fallback.

Result:

```text
outer queries                  5,035
projection-tree queries        5,031
vertical direct queries            3
tree->vertical switch queries      1

projection leaf scans     19,311,594
tree nodes visited         2,495,728

local candidate occurrences  520,057
distinct candidates          402,887

local wall                     ~2.64 s
complete local+serialization   ~2.88 s
distinct stream SHA-256
af1447e6a44552dac5dbc2c128ae30e8e6ec0bd7f206a790dc2575566a48e8a0
```

The local occurrence union includes the exact core-absorber witnesses.

## Rare-tail behavior

Only four outer queries require the vertical fallback under the current policy.

The real-factor differential still contains a pathological near-envelope outer:

```text
local width 4,198 / 4,198
tree query ~52.8 ms
vertical query ~28.9 ms
```

but this tail is too sparse to explain the support runner's >120-second product wall.

## Correction

For this exact rank31 product:

```text
hard local restricted-image phase      NO
local phase bounded                     YES
global exact maximalization unresolved  YES
```

The prior rank26-descent checkpoint remains correct that some larger products were bounded inside local evaluation. It must not be generalized to this smaller rank31 product.

The support-runner timeout after `product_start` is now localized to global maximalization of the 402,887 distinct candidate family.

## Next

Run the already-qualified global normalizers independently on this exact candidate stream:

1. static dominance tree;
2. block-signature maximalizer.

Require identical canonical output before resuming the support recurrence.

Do not alter the local evaluator based on a wall that has now moved to the next exact phase.
