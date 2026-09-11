# Term-ID Residual Transition Cache Scaling Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34651769631`, job `103435321774`  
**Status:** exact and qualified; dense remains the bounded-control speed baseline, bounded cache scaling remains open

## Question

Can the term-ID quotient solver replace its dense `residual-class × cell × {own,block}` transition cache with a cache whose memory is independent of total residual-class cardinality, without surrendering the wall-clock advantage over physical Negamax?

The term-ID representation makes transition misses much cheaper than the earlier mask representation, so the old mask-cache result was not treated as authority for this question.

## Candidates

- existing dense exact transition table;
- no transition cache;
- bounded global direct-mapped exact-tag caches with 16K, 32K, 64K, and 128K slots.

Global-cache tags are `(classID, cell, transition-mode)`. A tag collision is a miss and recomputation only; it can never return the wrong transition.

## Qualification

Every policy reproduced, on every complete bounded control:

- complete q-state census;
- terminal/nonterminal/illegal edge census;
- exact residual-class count;
- every residual-class ID's term-ID sequence;
- every qID's `(support,p0Class,p1Class)` tuple;
- every quotient edge;
- independent BSFP root W/D/L;
- independent BSFP per-root-action W/D/L.

No cache policy changed proof work or game semantics.

## Search timing and memory

### 4x5 c4 governing proxy

| policy | median total | ratio to dense | transition cache | total typed root footprint |
| --- | ---: | ---: | ---: | ---: |
| **dense** | **13.816 ms** | **1.000** | 1,310,720 B | 1,844,704 B |
| none | 15.305 ms | 1.108 | **0 B** | **533,984 B** |
| direct 16K | 14.786 ms | 1.070 | 147,456 B | 681,440 B |
| **direct 32K** | **14.538 ms** | **1.052** | **294,912 B** | **828,896 B** |
| direct 64K | 14.686 ms | 1.063 | 589,824 B | 1,123,808 B |
| direct 128K | 14.633 ms | 1.059 | 1,179,648 B | 1,713,632 B |

The 32K global cache is the strongest bounded-memory compromise tested: about **5.2% slower** than dense while using about **77.5% less transition-cache memory** and about **55.1% less total typed root memory**.

Root-search 32K cache behavior:

```text
hits:       25,304
misses:     24,458
collisions:  8,442
```

Larger direct caches improved hit rate only modestly and paid additional setup/memory cost, so direct-map capacity alone does not close the speed gap.

### Other controls

Dense also remained fastest on 4x4 and 5x3. On tiny 4x3, no-cache won because transition reuse is too small to repay cache setup.

This reinforces that cache economics depend on useful reuse, not occupancy alone.

## Complete-graph memory signal

The root search reaches only 7,470 residual classes on 4x5, but complete graph qualification reaches 69,707 classes. Because the dense table grows by power-of-two class capacity, its complete-graph transition cache reaches:

```text
20,971,520 B
```

The bounded global caches remain fixed.

This distinction matters for standard 7x6 even though the current objective is root time-to-proof rather than full graph materialization.

## Standard 7x6 structural probe

No 7x6 root solve was attempted in this campaign.

Qualified structural facts from kernel construction:

```text
support states:       823,543
residual vocabulary:      625 terms
term-ID width:             10 bits
```

A dense own+block class-transition table costs:

```text
42 cells × 2 modes × 4 B = 336 B / reserved class
```

Projected transition-cache bytes:

```text
65,536 classes:      22,020,096 B
262,144 classes:     88,080,384 B
1,048,576 classes: 352,321,536 B
```

A 64K global tagged cache remains 589,824 B independent of class count.

The structural-only 7x6 kernel with that bounded cache used about 29.53 MB typed memory at root construction, dominated by support/geometry tables rather than residual transitions.

## Disposition

Do **not** replace the current term-ID dense cache on bounded performance evidence yet: it remains the fastest 4x5 implementation.

Do **not** conclude that dense is a safe 7x6 architecture either. Its `336 B × reserved-class-capacity` growth is a real scaling liability.

The next candidate should preserve dense-array access without unbounded class growth: a **fixed dense prefix cache** for early/hot residual class IDs, with later classes recomputed. This can cap memory at a chosen prefix size while avoiding hashing/tag checks for cached transitions.

Candidate prefix sizes should include 1K, 2K, 4K and 8K classes. On 7x6 these correspond to approximately 0.34, 0.69, 1.38 and 2.75 MB of transition storage respectively.
