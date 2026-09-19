# RBA rank31 second Lower product closure — support [4,3,3,3,6,6,6]

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact intermediate product closed / crash-safe continuation  
**Authority effect:** none

## Input

Persisted first Lower product:

```text
P1 = 32,389
SHA-256
33d4c2527483fa1f3f15b2a82cb680b70899a15e82eb40e53eec2c0cf530b465
```

Next fixed-action Lower factor:

```text
A2 = 2,738
```

## Exact product

```text
32,389 x 2,738
raw pair opportunities = 88,681,082

core-relative absorber candidates = 17,862
residual factors = 14,572 x 2,693
residual pairs = 39,242,396

local candidate occurrences = 382,962
projection-tree queries = 14,572
vertical switch queries = 0
leaf scans = 31,773,699
tree nodes = 3,354,388

global maximalization ~29.239 s
total product ~31.704 s

exact output = 54,555
SHA-256
74664ce4cdbbb6cfc8f41107ca51801d8c849000e66b98652b5ac7af73d2d468
```

The exact product stream is persisted as support product `P2`; no recomputation is required after reconnect.

## Current support seam

State Upper remains exact and cached:

```text
Upper = 11,097
SHA-256
02e78e775c453192b7be4ecb45f98202a251fd09c19e5d6e3e696954b921b115
```

The only remaining Lower product for this support is:

```text
54,555 x 4,390
```

A bounded continuation entered that product and timed out before an exact `P3` stream was persisted. No result is claimed for it yet.

## Recovery archive

```text
rba-block-cache-r31-second-p2.tar.gz
SHA-256
a3e76e71e1cb51a25f0e67e2cebae618d383cefcd954dfa5bc9992863967ae89
size ~2.2 MiB
```

Next: isolate product 3 at the same exact phase boundaries. Persist local candidate union before global normalization.
