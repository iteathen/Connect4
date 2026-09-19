# RBA blocked-cone resumable cache checkpoint — rank31 2/10

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint  
**Authority effect:** none

## Newly closed support

```text
support [4,3,3,3,6,6,6]
rank 31
residual shapes 29
transformed bits 58

Upper 11,097
Lower 67,483

Upper SHA-256
02e78e775c453192b7be4ecb45f98202a251fd09c19e5d6e3e696954b921b115

Lower SHA-256
ede50b4e51b40cd25d61514856cb68c705d208148f70aa79eadf3f160af2f143
```

Exact Lower intermediates:

```text
P1 32,389
SHA-256 33d4c2527483fa1f3f15b2a82cb680b70899a15e82eb40e53eec2c0cf530b465

P2 54,555
SHA-256 74664ce4cdbbb6cfc8f41107ca51801d8c849000e66b98652b5ac7af73d2d468

P3 67,483
SHA-256 ede50b4e51b40cd25d61514856cb68c705d208148f70aa79eadf3f160af2f143
```

## Current rank31 cache

Two rank31 supports are complete:

```text
[4,3,2,4,6,6,6]  Upper 6,714   Lower 34,844
[4,3,3,3,6,6,6]  Upper 11,097  Lower 67,483
```

All ranks 42 through 32 remain cached.

## Recovery archive

```text
rba-block-cache-through-r31-2of10.tar.gz
SHA-256
a978a1052928aae9672eaac533ffc6b9257d99b81c3423c886985191c43b4c50
size ~2.7 MiB
```

## Phase finding

The two products that had appeared as opaque >120-second runner stalls were split at exact phase boundaries:

- local restricted-image work completed in about 3 seconds;
- exact global maximalization over ~400k distinct candidates consumed the material wall time;
- resumable static maximality queries closed both products exactly.

Therefore rank31 continuation should continue measuring phase ownership rather than attributing every opaque product timeout to local projection.

Next: continue the same cache through the remaining eight rank31 supports; persist any action/product intermediate that completes.
