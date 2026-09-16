# Fixed Dense-Prefix Term-ID Transition Cache Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34651974754`, job `103435983231`  
**Status:** exact and qualified; prefix-4K advances as the strongest bounded-memory 7x6-oriented cache candidate

## Hypothesis

The exact residual classes created earliest during deterministic quotient traversal may also form the hottest transition working set. Instead of either:

- growing a dense `class × cell × {own,block}` cache with total class cardinality, or
- paying exact-tag hashing on every bounded-cache probe,

cache only a fixed prefix of residual class IDs:

```text
classID < prefixClasses -> direct dense-array transition lookup
classID >= prefixClasses -> recompute exact transition; do not cache
```

This retains the same arithmetic indexing as the full dense cache while making transition-cache memory independent of total residual-class growth.

## Qualification

Every candidate reproduced on all complete controls:

- complete q-state census;
- terminal/nonterminal/illegal edge census;
- exact residual-class count;
- every residual class ID's term-ID sequence;
- every qID `(support,p0Class,p1Class)` tuple;
- every quotient edge;
- independent BSFP root W/D/L;
- independent BSFP per-root-action W/D/L.

No cache candidate changed search work or exact semantics.

## 4x5 governing proxy

| policy | median total | ratio to dense | transition cache | root typed footprint | out-of-prefix transition probes |
| --- | ---: | ---: | ---: | ---: | ---: |
| **full dense** | **14.210 ms** | **1.000** | 1,310,720 B | 1,844,704 B | — |
| direct 32K tagged | 15.492 ms | 1.090 | 294,912 B | 828,896 B | 0 |
| prefix 1K | 14.982 ms | 1.054 | 163,840 B | 697,824 B | 25,180 |
| prefix 2K | 14.869 ms | 1.046 | 327,680 B | 861,664 B | 18,003 |
| **prefix 4K** | **14.504 ms** | **1.021** | **655,360 B** | **1,189,344 B** | **8,300** |
| prefix 8K | 14.612 ms | 1.028 | 1,310,720 B | 1,844,704 B | 0 |

The fixed 4K prefix loses only about **2.1% wall-clock** relative to the current full-dense speed baseline while:

- cutting transition-cache bytes by exactly **50%**;
- reducing total measured root typed footprint by about **35.5%**;
- avoiding hash/tag probe overhead;
- remaining fixed even if the total residual-class population grows far beyond 4K.

At similar memory, the fixed prefix materially outperforms the 32K tagged global cache.

## Complete-graph behavior

The complete 4x5 quotient contains 69,707 residual classes. The 4K prefix therefore intentionally caches only a small fraction of complete-graph class IDs. It still reproduced the complete exact graph.

This confirms that cache completeness is not semantically required: uncached transitions can be recomputed exactly.

## Standard 7x6 scaling

For 42 cells and own/block transition modes:

```text
full dense cost per reserved class = 42 × 2 × 4 B = 336 B
```

Fixed-prefix transition storage becomes:

```text
1K classes:   344,064 B
2K classes:   688,128 B
4K classes: 1,376,256 B
8K classes: 2,752,512 B
```

This is independent of how many residual classes standard 7x6 ultimately discovers.

The 4K prefix is therefore the strongest current **7x6-oriented transition-cache candidate**. It is not promoted over full dense for current small bounded speed benchmarking; full dense remains the fastest 4x5 control.

## Interpretation

Early deterministic class IDs do capture a useful hot working set. The result also shows diminishing returns:

- 1K/2K save more memory but surrender additional time;
- 4K captures most of the speed benefit;
- 8K stores every root-reached 4x5 class but its larger zero/fill/setup footprint erases any advantage over the dynamically grown dense baseline.

A fixed prefix therefore offers a clean production/scaling knob rather than an all-or-nothing cache choice.

## Disposition

Advance:

```text
term-ID quotient + fixed dense-prefix residual transition cache
```

as the bounded-memory scaling architecture for future standard-7x6 work.

Keep:

```text
term-ID quotient + full dense cache
```

as the current bounded-performance reference.

The next scaling bottleneck is the support transition representation: standard 7x6 currently precomputes per-support/per-column landing cells and child support IDs across 823,543 support states, dominating the structural-only root memory footprint.
