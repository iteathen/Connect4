# Quotient Residual Term Vocabulary Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34649516355`, job `103428136340`  
**Status:** complete; structural vocabulary derived from geometry

## Construction

No remembered vocabulary size was used as authority. For each geometry, the candidate term universe was constructed as the deduplicated set of every non-empty subset of every Connect winning line.

This construction is exact for residual win-space terms: mover placements remove cells from a still-live winning requirement, while opponent placements delete a requirement entirely. Therefore every live residual requirement remains a non-empty subset of an original winning line.

Closure under one-cell reduction was checked exhaustively with zero mismatches.

## Structural vocabulary

| Geometry | winning lines | unique residual terms | ID bits |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 14 | 65 | 7 |
| 4x4 c4 | 10 | 126 | 7 |
| 5x3 c4 | 6 | 69 | 7 |
| 4x5 c4 | 17 | 191 | 8 |
| **7x6 c4** | **69** | **625** | **10** |

Thus the previously remembered WSL-625 figure is independently recovered rather than assumed: standard 7×6 has exactly **625** structural residual terms and fits comfortably in `u16` term IDs.

7x6 cardinality distribution:

```text
singletons: 42
pairs:      282
triples:    232
full lines: 69
```

## Precompiled exact term algebra for 7x6

A universal `u16` layout can precompute:

```text
term ID -> two-u32 mask                  5,000 B
term ID -> cardinality                     625 B
(term ID, cell) -> same/reduced/terminal 52,500 B
subset/dominance bitset                  49,375 B
```

Total with dense subset bitset: about **107.5 KB**.

The subset relation is extremely sparse:

```text
subset pairs:        3,547
strict subset pairs: 2,922
density:             0.908%
```

A sparse u16 dominance representation would require only about **9.6 KB**, reducing the static core to about **67.7 KB**, although the dense bitset provides O(1) subset checks and remains a runtime candidate.

## Reachable bounded evidence

Every residual term actually reached in each complete bounded q graph belonged to the structural vocabulary.

| Geometry | structural terms | observed terms | stored class terms |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 65 | 57 | 9,032 |
| 4x4 c4 | 126 | 94 | 28,337 |
| 5x3 c4 | 69 | 69 | 2,479 |
| 4x5 c4 | 191 | 143 | 367,080 |

For the complete 4x5 quotient graph, replacing two-u32 term storage with u16 IDs changes logical class-term bytes from:

```text
2,936,640 B -> 734,160 B
```

before class metadata and transition tables.

## Architectural implication

Residual terms are now a qualified finite ontology rather than arbitrary masks. The production-oriented quotient can therefore compile the exact algebra around term IDs:

```text
termId
  + reduction-by-cell table
  + exact subset relation
  + sorted residual classes of compact term IDs
```

This is also a natural stable feature vocabulary for later quotient-native NN work, without giving the NN proof authority.
