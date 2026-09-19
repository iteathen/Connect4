# RBA real-factor vertical trace differential — rank31 product 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact real-factor differential / hybrid-policy evidence  
**Authority effect:** none

## Product

Persisted fixed-action Lower factors for rank31 support:

```text
support [4,3,3,3,6,6,6]

A = 6,808
B = 4,576
raw pairs = 31,153,408
transformed bits = 58
inner union bits = 57
```

## Evaluators compared

For identical outer masks:

1. existing exact projection-tree local skyline evaluator;
2. vertical superset-union trace criterion using a reusable inner incidence bitset index.

Every sampled query returned the same local skyline width.

## Deterministic union-nearest samples

Representative observations:

```text
missing 6:
    width 167
    vertical ~23.9 ms
    tree      ~2.8 ms

missing 7, pathological wide trace:
    width 4,576 / 4,576
    vertical ~29.8 ms
    tree     ~63.5 ms

missing 7:
    width 125
    vertical ~19.7 ms
    tree      ~0.61 ms

missing 8:
    width 1
    vertical ~17.4 ms
    tree      ~0.04 ms

missing 9:
    width 2,016
    vertical ~24.4 ms
    tree     ~16.2 ms
```

Wider-missing ordinary samples continue to favor the tree strongly when the exact skyline is narrow.

## Outer missing-bit distribution

```text
missing  6:   1
missing  7:   2
missing  8:   5
missing  9:  12
missing 10:  30
missing 11:  67
missing 12: 142
missing 13: 204
missing 14: 321
missing 15: 442
missing 16: 494
missing 17: 631
missing 18: 759
missing 19: 801
missing 20: 702
missing 21: 615
missing 22: 524
missing 23: 408
missing 24: 281
missing 25: 185
missing 26:  90
missing 27:  54
missing 28:  23
missing 29:  13
missing 30:   2
```

## Disposition

The vertical superset-union evaluator is **not** a universal replacement for projection-tree evaluation on this real RBA factor.

It is a qualified candidate rare-tail fallback:

- projection tree remains preferred for narrow restricted images;
- vertical trace becomes competitive or superior when the restricted image approaches the full inner antichain and tree pruning collapses.

The current fixed `traceMissing` threshold is therefore only a provisional proxy. The next probe should measure core-absorbed factors and actual local skyline pressure so the hybrid switch is based on expected/query work rather than missing-bit count alone.

No semantic relation is promoted.
