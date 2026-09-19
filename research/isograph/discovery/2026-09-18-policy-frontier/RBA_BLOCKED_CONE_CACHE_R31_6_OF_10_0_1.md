# RBA blocked-cone cache checkpoint — rank31 6/10

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint  
**Authority effect:** none

## Sixth rank31 support closed

```text
support [4,5,2,2,6,6,6]
rank 31
residual shapes 30
transformed bits 60

Upper 13,954
Lower 49,105

Upper SHA-256
f78ec94ca8ff4bb95f6c74716ba11fd771eb35af6c548d613a4e6b445524aff6

Lower SHA-256
5952aff9a7e8421accfcaf181efd3db87cb237599e5212d0e95696bc52d4c35e
```

Exact Lower intermediates:

```text
P1 22,483
P2 34,271
P3 49,105
```

## Rank31 closed supports

```text
1. [4,3,2,4,6,6,6]  U 6,714   L 34,844
2. [4,3,3,3,6,6,6]  U 11,097  L 67,483
3. [4,3,4,2,6,6,6]  U 4,431   L 19,652
4. [4,4,2,3,6,6,6]  U 11,066  L 70,536
5. [4,4,3,2,6,6,6]  U 3,378   L 12,339
6. [4,5,2,2,6,6,6]  U 13,954  L 49,105
```

Four rank31 supports remain.

## Recovery archive

```text
rba-block-cache-through-r31-6of10.tar.gz
SHA-256
53594cb0a20f6db367476d64108c1630af7723c37923dbbcc63232c7caccba04
size ~5.3 MiB
```

Next: continue unchanged through the remaining four rank31 supports. Preserve action/product checkpoints at each bounded stop.
