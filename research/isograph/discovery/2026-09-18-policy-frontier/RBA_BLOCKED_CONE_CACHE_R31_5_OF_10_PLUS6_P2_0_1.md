# RBA blocked-cone cache checkpoint — rank31 5/10 + support6 P2

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint  
**Authority effect:** none

## Fifth rank31 support closed

```text
support [4,4,3,2,6,6,6]
rank 31
residual shapes 29
transformed bits 58

Upper 3,378
Lower 12,339

Upper SHA-256
71ff3019b0fc467da7f6f03d94e0206df6fed8e8c363eb20e41a414ca13eb47e

Lower SHA-256
24b46ddfa708a5478106c9e6ddb3f14f56fafac807a046cf0a40c8214bd7afcb

support wall ~6.42 s
```

## Sixth rank31 support in progress

```text
support [4,5,2,2,6,6,6]
rank 31
```

State Upper is exact and persisted:

```text
Upper 13,954
SHA-256
f78ec94ca8ff4bb95f6c74716ba11fd771eb35af6c548d613a4e6b445524aff6
```

Action Lower widths:

```text
6,744
7,901
2,967
4,994
```

Exact intermediates already closed:

```text
P1 22,483
SHA-256
a3b78a6bbe11dad8ee0232ec940d6828b748843d1a8fecc459bacddf0fcb3f30

P2 34,271
SHA-256
eb01dc364dde775a0fc75319899061e6d563ef373ff51b3ba8c3fafdb3787430
```

P1 metrics:

```text
6,744 x 7,901
raw 53,284,344
after absorption 3,327 x 7,895
local candidates 118,848
exact output 22,483
total ~5.91 s
```

P2 metrics:

```text
22,483 x 2,967
raw 66,707,061
after absorption 12,088 x 2,896
local candidates 296,565
exact output 34,271
total ~15.66 s
```

The bounded continuation entered final product:

```text
34,271 x 4,994
```

and ended before P3 was persisted.

## Rank31 progress

Five rank31 supports are closed; five remain.

## Recovery archive

```text
rba-block-cache-through-r31-5of10-plus6p2.tar.gz
SHA-256
961d31f3bcb488d04bb49408c4739164f7ff572c2e844c8cfeb7cdf24e3a92fd
size ~4.9 MiB
```

Next: isolate support6 final product at local/global phase boundaries, persist P3, finalize support6, then continue.
