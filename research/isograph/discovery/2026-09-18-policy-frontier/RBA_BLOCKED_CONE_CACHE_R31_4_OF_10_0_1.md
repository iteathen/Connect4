# RBA blocked-cone cache checkpoint — rank31 4/10

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint  
**Authority effect:** none

## Newly closed fourth rank31 support

```text
support [4,4,2,3,6,6,6]
rank 31
residual shapes 30
transformed bits 60

Upper 11,066
Lower 70,536

Upper SHA-256
354ceffa1513bc283cffc64df2e636fc6268c60e08fa81c1dd5b913d5c297848

Lower SHA-256
17111d19766d35ceccf72e9fda470748efb1e929156f3c2c60b0b0db11e614dd
```

Exact Lower intermediates:

```text
P1 31,230
SHA-256 3395dc933bcb150063481422259cd7557aee0679892b0c114a62c379806e3c79

P2 59,200
SHA-256 0052439fba0652a0114f74080150c5fd94bb9f8d757839f7066f133c4df0fed9

P3 70,536
SHA-256 17111d19766d35ceccf72e9fda470748efb1e929156f3c2c60b0b0db11e614dd
```

## Rank31 closed supports

```text
1. [4,3,2,4,6,6,6]  U 6,714   L 34,844
2. [4,3,3,3,6,6,6]  U 11,097  L 67,483
3. [4,3,4,2,6,6,6]  U 4,431   L 19,652
4. [4,4,2,3,6,6,6]  U 11,066  L 70,536
```

Six rank31 supports remain.

## Recovery archive

```text
rba-block-cache-through-r31-4of10.tar.gz
SHA-256
7f608f7045053f1e7562295681f76573e082fa483ff7b73ce0c9d609c88c8b83
size ~4.2 MiB
```

## Current phase observation

On the two widest recent rank31 supports, exact local restricted-image work is only a few seconds after core absorption. The material wall is often global maximalization of 350k-500k distinct candidates. The resumable static normalizer converts that wall from opaque timeout into monotone exact progress.

This is a rank31 observation only; previously documented larger rank29/rank27 products may still be local-query dominated.

Next: continue the same cache through rank31 support 5/10 without changing semantics.
