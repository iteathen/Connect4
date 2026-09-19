# RBA blocked-cone resumable cache checkpoint — through rank32

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint; no new semantic claim  
**Authority effect:** none

## Target cone

```text
base support [4,3,2,2,6,6,6]
target rank 29 draw13
active wall: local restricted-image evaluation
```

The rebuilt durable Node runner `rba-draw-boundary-runner.mjs` was used with the new shared-target cover DP, core-relative absorption, projection-tree local skyline evaluation, vertical superset-bitset rare-tail fallback, and exact static global normalization.

## Control qualification before this run

The rebuilt runner reproduced the committed draw-boundary controls exactly by count:

```text
rank33 [5,5,2,3,6,6,6]
    Upper 1,116
    Lower 2,534

rank32 [5,5,1,3,6,6,6]
    Upper 1,368
    Lower   508
```

## Monotone cache state

The first blocked-cone run was bounded at 120 seconds.

At termination:

```text
all supports rank 42..32 complete
rank31 supports complete: 0
total completed supports: 285

rank32 19
rank33 30
rank34 40
rank35 46
rank36 46
rank37 40
rank38 30
rank39 19
rank40 10
rank41 4
rank42 1
```

Aggregate persisted cache content:

```text
Upper generators 156,976
Lower generators 194,684
```

No completed support needs to be recomputed in the current runner state.

## Cache archive

A complete local cache archive was produced before rank31 continuation:

```text
rba-block-cache-through-r32.tar.gz
SHA-256
1db52f9b3a0cd60111cc0a0efcf4bcb548997fb36077cce021f336a6fbf17df1
size ~1.5 MiB
```

This archive is a recovery artifact, not semantic authority. Exact support boundaries remain governed by the runner semantics and subsequent qualification.

## Next

Resume the identical cache through rank31 only. Checkpoint again before rank30.

Do not change local evaluator policy merely because the first rank31 support is expensive; first observe whether the vertical superset-bitset fallback activates on the previously problematic wide local traces.
