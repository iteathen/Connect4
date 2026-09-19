# RBA rank27 staged-product qualification 0.2

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** qualified for rank26 progression  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Question

Are the repeated rank27 evaluator changes genuine progress, or are they cycling around the same wall?

Qualification criterion:

1. substituted stages preserve persisted exact streams;
2. no optimization is forced globally;
3. method selection occurs only at exact phase boundaries;
4. `loss14 / draw15 / win15` all retain bounded exact routes.

## Exact stage library

Qualified mechanisms:

- flat streaming local skylines;
- projection-tree subtree pruning;
- core-relative row/column absorption before pair materialization;
- static dominance-tree global normalization;
- block-signature global normalization;
- retained exact incremental normalization as a control.

These alter evaluation only, not Bellman semantics.

## Core-relative absorption sweep on win15

| product | raw pairs | pair work eliminated |
|---|---:|---:|
| f0 x f1 | 1,764,238,833 | 18.2476% |
| p01 x f2 | 4,121,006,336 | 55.0434% |
| p012 x f3 | 31,918,977,881 | 81.4017% |
| f0 x f2 | 610,657,152 | 5.8106% |
| p02 x f1 | 8,334,369,450 | 61.4545% |
| p02 x f3 | 19,159,474,950 | 73.2344% |
| f0 x f3 | 4,055,722,503 | 44.9799% |
| f1 x f2 | 1,166,753,664 | 23.1994% |
| p03 x p12 | 52,423,838,824 | 81.8324% |
| f2 x f3 | 2,682,193,024 | 53.3068% |

Absorption is structural and often large, but it is not a mandate to use one physical local evaluator afterward.

## Qualified win15 staged path

Action-Lower factors:

```text
f0  30,387
f1  58,059
f2  20,096
f3 133,469
```

### Step 1: f0 x f1

Absorption would remove only 18.25%. A deterministic union-nearest probe exposes a local width of 57,549 / 58,059 and an indexed query near 981 ms. The staged policy therefore retains the previously qualified streaming/control route.

Exact output: **205,066**.

### Step 2: p01 x f2

```text
raw pairs                  4,121,006,336
residual after absorption  1,852,664,681
eliminated                        55.0434%
combined candidates          3,251,193
projection leaf scans        504,129,002
exact output                   239,149
wall                           ~31.40 s
SHA-256
8ce37539d397aeb823f7b4a00e181831bba88791fc2093aada202ca99ab82189
```

Byte-identical to persisted `p012`.

### Step 3: p012 x f3

```text
raw pairs                 31,918,977,881
residual after absorption  5,936,389,460
eliminated                        81.4017%
combined candidates          1,718,644
projection leaf scans      1,013,041,309
exact output                   306,617
wall                           ~44.73 s
SHA-256
a361b50c801fe6bcb339d39d04e1f15452d1663a0778d606dbb327e519a406c9
```

Byte-identical to qualified `Lower(win15)`.

## Alternate reconvergence

The exact `f0 x f2` intermediate has 143,550 generators. Applying absorption to `p02 x f1` removes 61.45% of raw pairs and returns:

```text
239,149 generators
SHA-256
8ce37539d397aeb823f7b4a00e181831bba88791fc2093aada202ca99ab82189
wall ~36.48 s
```

Thus two exact parenthesizations reconverge to the same three-factor boundary.

## Rank27 disposition

```text
loss14  Upper 114,585 / Lower 158,402  -> ordinary streaming
draw15  Upper 161,398 / Lower 534,618  -> indexed projection
win15   Upper 235,107 / Lower 306,617  -> heterogeneous staged path
```

This does not prove a universally optimal planner. It establishes the narrower condition needed to move forward: all selected rank27 stress controls have bounded exact routes assembled from qualified phase-local transformations.

The active frontier should now move to rank26 rather than continue optimizing the same rank27 products.

Frozen authority 1.1 is unchanged.
