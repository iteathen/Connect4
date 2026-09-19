# RBA rank-29 post-disconnect qualification 0.3

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Qualifies:** `RBA_RANK29_CLOSED_CHECKPOINT_0_2.md` / `RBA_RANK29_CLOSED_RESULTS_0_2.json`  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Independent direct-maximal replay

The closed `draw13` result was replayed from the complete union of the persisted local-skyline shard candidates, bypassing the same-mover and same-opponent acceleration stages.

```text
local candidates loaded        4,393,899
direct global maximal set        140,454
checkpoint final set             140,454
exact set equality                    YES
elapsed                           27.59 s
peak RSS                         96,688 KiB
```

This independently confirms that the coordinate-specific absorption stages preserve the exact global maximal antichain on the 5.393B-product closure.

The final set also remains idempotently normalized:

```text
input                         140,454
duplicates                          0
renormalized                  140,454
same set                           YES
```

## Timing replay

A second 5-core replay of the exact chunked local-skyline generation produced the same 4,393,899 candidates and width shards.

```text
24 bounded structural shards
outer generators              41,133
local candidates           4,393,899
sum measured local wall      49,866.299 ms
max shard peak RSS              74,460 KiB

normalization replay:
deduplicate                       289.237 ms
same-mover                        399.151 ms
same-opponent                     211.714 ms
global maximal                  4,746.365 ms
total normalization             5,646.466 ms
peak RSS                           94,848 KiB
```

The original checkpoint timings (51,254.499 ms local; 5,909.037 ms normalization) remain valid first-run measurements. The replay is a second measurement, not a replacement.

## Structural concentration

Exact skyline widths remain:

```text
median 36
p90    280
p99    896
max 11,379
mean 106.8217489606885
```

Concentration:

```text
top 0.1% of outers -> 3.69% of local candidates
top 1%             -> 14.80%
top 10%            -> 52.22%

width >= 1,000     329 outers
width >= 2,000      68 outers
width >= 5,000       5 outers
width >= 10,000      2 outers
```

This strengthens the measured claim that cost is controlled by the skyline-width distribution and its concentration, not by raw pair count alone.

## Reverse support-edge correction

The rank-29 support `[3,5,2,1,6,6,6]` has **seven** immediate rank-28 support predecessors, not four. Every column height is positive, so reversing one placement may decrement any one of the seven columns.

Residual-shape counts across those seven predecessors are 35 or 36 (70 or 72 transformed bits).

This corrects only the predecessor enumeration used for next-step selection. It does not change the rank-29 value result.

## Epistemic disposition

```text
rank29 ordinary-value boundary          CLOSED
final draw13 global antichain           DIRECTLY REPLAYED
same-coordinate absorption exactness    REPLAY PASS ON REAL PRODUCT
raw-pair arithmetic correction          PRESERVED
predecessor count                       CORRECTED 4 -> 7
authority 1.1                           UNCHANGED
proof/value bridge                      OPEN SIDE SEAM
```
