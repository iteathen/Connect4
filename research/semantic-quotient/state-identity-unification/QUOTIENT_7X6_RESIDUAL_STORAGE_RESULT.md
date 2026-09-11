# Standard 7x6 residual storage census

**Status:** complete through full expansion of rank 8; storage-model evidence only  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34654252286`, job `103443088823`

## Question

At standard 7x6 scale, residual classes dominate memory. Which exact representation is worth implementing next: the current sparse u16 term list, a fixed 625-bit class bitset, a sparse/dense hybrid, or persistent hash-consed chunks over the fixed term ontology?

## Corpus

The current scaled quotient kernel was expanded exactly through support rank 8 using:

```text
packed u32 support
625-term residual vocabulary
u16 term IDs
4K fixed dense-prefix transition cache
```

The resulting exact bounded corpus contained:

```text
q states:          797,388
residual classes: 1,357,101
residual term IDs:56,882,431
```

No claim is made about the exact empty-board 7x6 root from this census.

## Residual class lengths

Across all 1,357,101 residual classes:

```text
mean:   41.91 terms
median: 42
p90:    47
p95:    49
p99:    52
max:    69
```

Newly created classes become shorter with rank:

```text
created expanding rank 0: mean 65.43
rank 1:                    62.14
rank 2:                    59.02
rank 3:                    55.79
rank 4:                    52.63
rank 5:                    49.49
rank 6:                    46.51
rank 7:                    43.60
rank 8:                    40.87
```

The corpus is therefore not sparse enough for a simple fixed bitset to dominate strongly, but it is dense enough that u16 lists have reached the fixed-bitset break-even region.

## Payload controls

Logical payload only, excluding metadata common to or specific to a production interner:

| Representation | Payload | Ratio to sparse u16 |
| --- | ---: | ---: |
| sparse u16 lists | 113,764,862 B | 1.000 |
| fixed 625-bit/u32 bitset (20 words = 80 B/class) | 108,568,080 B | 0.954 |
| best tested sparse/dense hybrid, threshold 40 | 105,661,726 B | 0.929 |

The simple hybrid saves only about 7.1% of payload, so it is not the strongest next architecture.

## Persistent chunk sharing

Each exact class was also converted to a 20-word bitset and divided into fixed vocabulary-position chunks. Chunk values were hash-consed **per slot**, so slot position supplies the vocabulary offset and only the exact chunk pattern needs an ID.

Production payload was modeled as:

```text
slot-local unique chunk dictionary payload
+
fixed tuple of the smallest u8/u16/u32 chunk IDs that each slot requires
```

Results:

| Chunk width | Slots/class | Total unique chunks | Tuple bytes/class | Payload | Ratio to sparse |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 u32 | 20 | 119,077 | 33 | 45,260,641 B | 0.398 |
| **2 u32** | **10** | **421,879** | **21** | **31,874,153 B** | **0.280** |
| 4 u32 | 5 | 1,046,726 | 14 | 35,747,030 B | 0.314 |
| 5 u32 | 4 | 1,304,803 | 12 | 42,381,272 B | 0.373 |

The strongest tested point is therefore **two-u32 / 64-bit chunks**.

For two-word chunks:

```text
chunk references: 13,571,010
unique chunks:        421,879
sharing factor:          32.17x
tuple bytes/class:          21
dictionary bytes:     3,375,032
tuple bytes:         28,499,121
total payload:       31,874,153
```

That is about **72% smaller than the current logical sparse term-list payload** and about **71% smaller than fixed 625-bit classes** on this real standard-7x6 corpus.

Only the final two-word slot exceeded u16 chunk-ID range at rank 8; one slot fit u8 and the remaining eight fit u16. This is why a slot-local dictionary matters: a single global chunk-ID width would throw away much of the compression.

## Interpretation

This is not merely bit packing. The large gain comes from **persistent structural sharing** between exact residual antichains.

The fixed 625-term ontology contains many repeated local 64-bit patterns even though complete residual classes are unique. The quotient transition algebra changes only a subset of requirements on each move, so parent/child and cross-state classes repeatedly reuse the same chunk patterns.

The result strongly supports making chunk identity part of the class representation rather than storing every term ID independently.

## Next implementation seam

Implement a drop-in exact residual class pool using:

```text
625 terms
-> 20 u32 bitset words
-> 10 fixed two-u32 slots
-> slot-local exact chunk interning
-> class identity = 10 chunk IDs
```

First implementation should deliberately keep the already-qualified sparse transition semantics:

1. enumerate set term IDs from the chunk tuple;
2. apply the existing own/block transition algebra and exact dominance rule;
3. convert the canonical result back to chunks;
4. intern the chunk tuple.

That isolates storage and class-interning economics. Only after exact graph identity and timing are established should dominance itself be replaced with bitset-native closure/kill operations.

## Promotion gate

The chunked pool must reproduce, with deterministic class/q-state identity where applicable:

- complete 4x4, 5x3 and 4x5 quotient graphs;
- independent BSFP root/action W/D/L;
- current Negamax search work;
- standard-7x6 bounded forward growth at the same rank/state boundary.

Promotion depends on end-to-end memory and wall-clock behavior, not modeled payload alone.
