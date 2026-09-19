# RBA rank31 support6 final product local phase

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact local phase complete / final maximalization pending  
**Authority effect:** none

Support:

```text
[4,5,2,2,6,6,6]
rank 31
```

Final product:

```text
P2 = 34,271
A3 = 4,994
raw = 171,149,374
```

Core-relative absorption:

```text
absorber witnesses 22,542
residual factors 11,838 x 4,885
residual pairs 57,828,630
```

Exact local evaluation:

```text
outer queries 11,838
projection-tree queries 11,837
vertical switch queries 1
leaf scans 42,158,955
tree nodes 5,276,941

local occurrences 304,254
distinct candidates 276,101
local+serialization ~2.17 s

distinct SHA-256
413b27c0f502b377a1af598aca01d8caa39a01aa18290dac2c39414625858d3c
```

Next: exact resumable global maximalization, persist P3, finalize support6.
