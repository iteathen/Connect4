# Quotient Term-ID Kernel Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34649770460`, job `103428944510`  
**Status:** exact and qualified on all complete bounded controls

## Representation

The residual class substrate was replaced with compact `u16` term IDs over the geometry-derived residual vocabulary.

Hot transition data:

```text
term ID -> exact residual mask/cardinality
(term ID, landing cell) -> same term | reduced term | terminal
(term A, term B) -> exact subset bit
residual class -> sorted u16 term-ID sequence
```

Class hashing/equality therefore operates on term IDs rather than two-u32 masks. The q state and Negamax control flow were intentionally unchanged so this campaign isolates the residual representation.

## Qualification

Against the qualified flat two-u32 kernel, the term-ID implementation reproduced on all controls:

- complete reachable q-state count;
- terminal/nonterminal/illegal edge census;
- residual class count;
- every residual class ID's exact mask semantics;
- every qID's support/P0-class/P1-class tuple;
- independent BSFP root W/D/L;
- independent BSFP per-root-action W/D/L.

No search-work difference was introduced.

## Timing

Median total time:

| Geometry | flat two-u32 | term-ID | term / mask |
| --- | ---: | ---: | ---: |
| 4x3 c3 | **0.272 ms** | 0.407 ms | 1.496 |
| 4x4 c4 | 3.090 ms | **3.007 ms** | 0.973 |
| 5x3 c4 | **0.592 ms** | 0.690 ms | 1.166 |
| 4x5 c4 | 11.582 ms | **10.526 ms** | **0.909** |

On the governing 4x5 proxy, term IDs improve total time by about **9.1%** and solve time by about 11%, with the same 15,054 expansions / 24,882 calls.

The tiny controls are dominated by vocabulary/setup overhead; they do not justify rejecting the representation for the larger/state-rich case.

## 4x5 memory/accounting

At the search footprint reached by the 4x5 root:

```text
q states:              15,728
residual classes:       7,470
stored residual terms: 34,276
vocabulary terms:         191
logical term-ID bytes: 68,552
```

Term-ID residual typed allocation:

```text
vocabulary:              13,977 B
class metadata:         147,456 B
class term slab:        131,072 B
transition cache:     1,310,720 B
class hash slots:        65,536 B
scratch:                    136 B
--------------------------------
residual typed total: 1,668,897 B
```

Including q-state/support typed structures gives a measured full term-ID typed footprint of about **2.143 MB** for this run.

This number is more complete than the older mask kernel's `1.845 MB` typed lower bound because the old pool retained significant logical term metadata in ordinary JavaScript arrays. Therefore those two byte totals are not directly evidence that term IDs use more real memory.

## Disposition

The term-ID substrate advances as the strongest current representation candidate for the larger quotient-native solver because it:

- preserves the complete exact q graph;
- improves 4x5 wall-clock;
- reduces logical term storage by 4x;
- replaces arbitrary residual masks with a finite compiled ontology;
- makes residual memory substantially more auditable;
- provides a standard-7x6-ready `u16` representation (625 terms / 10 bits).

The flat two-u32 kernel remains an exact performance/control reference, especially for very small geometries where term-vocabulary setup dominates.

## Next checks

1. rerun the exact physical-control comparison using the term-ID **full typed footprint** as the memory budget;
2. re-evaluate dense class-transition caching now that transition misses are cheaper;
3. remove one-time vocabulary construction from production timing by compiling immutable geometry tables where appropriate;
4. then test quotient-native proof-cost ordering / reflection and standard-7x6 scale.
