# RBA rank-27 win15 adjacent-threshold checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** selected rank27 `win15` threshold CLOSED  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Target

```text
support            [3,4,2,0,6,6,6]
rank               27
remaining cells    15
residual shapes    38
transformed bits   76
threshold          win15
```

This is the second adjacent-threshold test after exact `draw15` closure and follows the exact `loss14` checkpoint.

## Exact rank28 loss14 children

The rank27 `win15` threshold maps by one-ply strong-score negation to rank28 `loss14`.

| child support | Upper(loss14) | Lower(loss14) |
|---|---:|---:|
| [4,4,2,0,6,6,6] | 40,104 | 31,912 |
| [3,5,2,0,6,6,6] | 72,737 | 110,931 |
| [3,4,3,0,6,6,6] | 36,055 | 43,802 |
| [3,4,2,1,6,6,6] | 153,209 | 206,099 |

The second row exactly matches the previously closed selected rank28 strong boundary at `loss14`.

## Rank27 fixed-action fronts

| column | action Upper | action Lower |
|---:|---:|---:|
| 0 | 29,226 | 30,387 |
| 1 | 54,062 | 58,059 |
| 2 | 19,311 | 20,096 |
| 3 | 177,051 | 133,469 |

Upper union:

```text
raw action-Upper candidates  279,650
Upper(win15)                 235,107
```

Lower left fold:

```text
30,387 x 58,059
    = 1,764,238,833 implicit
    -> 205,066 exact

205,066 x 20,096
    = 4,121,006,336 implicit
    -> 239,149 exact

239,149 x 133,469
    = 31,918,977,881 implicit
    -> 306,617 exact

aggregate root Lower opportunities
    = 37,804,223,050
```

## Exact result

```text
Upper(win15) = 235,107
Lower(win15) = 306,617
```

Canonical stream hashes:

```text
Upper  0e7af9d6ae271925a98995795ba2c1e11266d2000c905a7e2417bcc6dc243621
Lower  a361b50c801fe6bcb339d39d04e1f15452d1663a0778d606dbb327e519a406c9
```

Serialization is one lowercase hexadecimal transformed q-mask per line, sorted numerically, newline terminated.

## Independent antichain qualification

The completed streams were independently re-read and normalized from scratch using the exact subset-order antichain normalizer.

```text
Upper input       235,107
Upper renormalized 235,107
byte-identical       YES
fresh normalize     ~7.45 s

Lower input       306,617
Lower renormalized 306,617
byte-identical       YES
fresh normalize    ~11.72 s
```

This independently confirms:

- no duplicate generators;
- no internally dominated Upper generators;
- no internally dominated Lower generators;
- stable canonical generator sets under exact normalization.

## Root execution economics

With exact rank28 children cached:

```text
preimage/action construction      ~14.350 s
Lower local/indexed generation   ~240.736 s
global normalization             ~103.956 s
total root execution             ~365.537 s

all Lower raw opportunities      37,804,223,050
local skyline candidates              8,104,773
projection-tree leaf scans         2,226,085,644
projection-tree nodes visited        248,917,009
```

The indexed evaluator is used on the final 31.919B product.

For that final product alone:

```text
implicit pairs             31,918,977,881
inspected leaves            2,226,085,644
scan fraction                       6.97%
pruned                             93.03%
```

## Negative factor-order control

An alternate exact parenthesization began with action factors 0 and 2:

```text
30,387 x 20,096
= 610,657,152 implicit pairs
```

Despite having only about one third as many raw pair opportunities as the qualified first product `30,387 x 58,059`, this alternate first product did not close within the bounded 420-second run.

No semantic result was taken from the timed-out path.

This is a strong falsifier for pair-cardinality-based factor ordering:

```text
smaller Cartesian product
!=
cheaper exact antichain product
```

The relational restricted-image geometry of the selected factors is load-bearing.

## Three-threshold comparison on one support fiber

| threshold | Upper | Lower | raw product pressure | evaluation behavior |
|---|---:|---:|---:|---|
| loss14 | 114,585 | 158,402 | 7.59B aggregate root | ordinary streaming closes |
| draw15 | 161,398 | 534,618 | 89.58B final product | 98.54% indexed pruning required |
| win15 | 235,107 | 306,617 | 37.80B aggregate root | 93.03% final-product pruning; normalization heavy |

Important non-monotonicities:

- `win15` has a smaller final Lower frontier than `draw15` but takes materially more root time;
- `win15` has much less raw Cartesian pressure than `draw15` but emits far more local skyline candidates;
- `loss14`, `draw15`, and `win15` on the same support require materially different evaluation economics.

Therefore none of these alone is the frontier law:

```text
support rank
transformed bit width
raw Cartesian pair count
final antichain width
projection-pruning percentage
```

The current cost object must include at least:

```text
threshold-specific action-front geometry
+ restricted-image skyline distribution
+ certifiable leaf-pruning volume
+ local dominance-maintenance work
+ global normalization geometry
```

## Reassessment

The adjacent-threshold campaign rejects a fiber-wide constant pruning/evaluation model.

The next research question should not be rank26 descent by inertia. First extract a cheap structural predictor for **pair-product query cost** from the already available fixed-action factors, using the observed catastrophic `0 x 2` factor-order control as a falsifier.

A useful predictor must distinguish:

```text
30,387 x 58,059     closes
30,387 x 20,096     bounded >420 s
```

without performing the full product.

Then decide whether the resulting query planner is stable enough to carry into rank26.

Frozen authority 1.1 is unchanged. The proof/value bridge remains a separate OPEN side seam.
