# RBA blocked-cone resumable cache checkpoint — rank31 1/10

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint  
**Authority effect:** none

## Prior durable cache

All 285 supports from ranks 42 through 32 were already complete.

## New completed support

```text
support [4,3,2,4,6,6,6]
rank 31
residual shapes 29
transformed bits 58

Upper 6,714
Lower 34,844

Upper SHA-256
b8b66bc17ebc5d7bffbee3644ca0a7cc6de61dbe3f0fdd2b692b77a51a05f969

Lower SHA-256
18864e0dc35ebe03f7a8218214966ee4c3fbff294212c33df9996a1ed12c0c12

support wall ~23.40 s
```

## Product observations

The three universal products closed:

```text
6,385 x 1,867
-> residual after core absorption 5,278 x 1,704
-> 290,750 local candidates
-> 15,818 exact

15,818 x 4,987
-> residual 4,962 x 4,979
-> 129,505 local candidates
-> 28,456 exact

28,456 x 1,565
-> residual 9,533 x 1,527
-> 154,199 local candidates
-> 34,844 exact
```

The second product triggered one adaptive local-query fallback from projection-tree skyline maintenance to the vertical superset-bitset trace evaluator and closed. This is the first real recurrence evidence that the new fallback can absorb a widening trace without changing the exact support result.

No claim of universal speedup is made from one support.

## Interrupted next support

The bounded run proceeded into rank31 support `[4,3,3,3,6,6,6]` and completed all four fixed-action preimages before the runner window ended. No state boundary from that support is claimed yet.

## Cache archive

```text
rba-block-cache-through-r31-1of10.tar.gz
SHA-256
1c1e0188f1c5f1ea2b8244563f04b44f5eb5c01535af936e4131b55846377627
size ~1.7 MiB
```

Next: resume the identical cache through the remaining nine rank31 supports. Checkpoint each completed-support advance if another runner bound is hit.
