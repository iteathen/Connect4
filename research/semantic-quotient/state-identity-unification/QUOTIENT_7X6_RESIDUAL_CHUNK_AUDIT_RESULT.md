# Standard 7x6 Residual Chunk-Sharing Audit

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34654140722`, job `103442740765`  
**Status:** storage-model audit complete; 128-bit persistent chunks promoted to exact implementation campaign

## Dataset

The scaled standard-7x6 quotient was expanded completely through rank 8, creating the complete rank-9 frontier:

```text
q states:          797,388
rank-9 frontier:   538,774
residual classes: 1,357,101
stored term IDs: 56,882,431
```

Current residual typed storage at this point:

```text
181,839,518 B
```

Current residual-class term capacity alone is 134,217,728 B; logical used u16 term IDs account for 113,764,862 B.

Each exact residual class was independently converted to its 625-bit ontology bitset (20 u32 words) for this audit. Solver semantics were not changed.

## Fixed bitset control

A naive fixed 625-bit class does **not** solve the memory problem.

Capacity-projected residual storage:

```text
~202,811,038 B
```

or about 11.5% larger than the current term-ID substrate.

The useful mechanism is therefore not “use bitsets”; it is **structural sharing between bitsets**.

## Chunk-sharing results

| chunk | chunks/class | unique chunks | occurrence reuse | practical projected residual | ratio to current |
| --- | ---: | ---: | ---: | ---: | ---: |
| 32-bit | 20 | 116,987 | 232.0x | 204,383,902 B | 1.124 |
| 64-bit | 10 | 419,989 | 32.31x | 127,313,566 B | 0.700 |
| **128-bit** | **5** | **1,045,891** | **6.49x** | **102,147,742 B** | **0.562** |
| 160-bit | 4 | 1,304,333 | 4.16x | 118,924,958 B | 0.654 |

The projection includes:

- power-of-two chunk payload capacity;
- global chunk hash-slot capacity;
- u32 chunk IDs in fixed-width per-class tuples;
- class hash + singleton metadata;
- current vocabulary;
- current prefix4K transition cache;
- current class hash-slot table;
- scratch storage.

It deliberately does not assume ideal compact u16 chunk IDs, because every useful candidate already exceeds 65,535 unique chunks.

## Why 128 bits wins

32-bit chunks have enormous reuse, but twenty u32 chunk references/class cost more than the saved payload.

160-bit chunks reduce references to four/class, but sharing drops too far and power-of-two chunk-pool capacity becomes expensive.

128-bit chunks balance both effects:

```text
5 chunk IDs/class
16 B/chunk payload
~1.046M unique chunks across 1.357M classes
6.49x average chunk reuse
```

The practical projection reduces residual storage by approximately:

```text
79,691,776 B
```

or about **43.8%** at the complete rank-9 frontier substrate.

The logical/ideal model is even smaller (~61.6 MB), but that number is not used as the implementation expectation.

## Zero-chunk behavior

128-bit chunks were all-zero in about 19.3% of chunk occurrences. Zero-chunk interning therefore contributes useful sharing but is not the sole reason for the result; nonzero structural chunks also repeat substantially.

## Exact transition opportunity

The chunk representation also enables a different transition algebra over the fixed ontology:

### Opponent placement

```text
resultBits = classBits & keepMask[cell]
```

because blocking only removes residual terms containing the landing cell.

### Own placement

```text
unchanged = classBits & ~containsMask[cell]
affected  = classBits &  containsMask[cell]
reduced   = map affected term IDs through exact one-cell reduction
result    = unchanged | reduced
result   &= ~strictSupersetMask[each newly reduced term]
```

This is the same previously qualified antichain theorem expressed directly over the ontology bitset. Reduced terms from a common landing-cell operation remain mutually incomparable; only newly reduced terms can dominate unchanged terms.

Therefore persistent chunks may improve not only memory but also transition locality.

## Disposition

Advance an exact **persistent 128-bit chunked residual-class pool**:

```text
625-bit canonical class
= 20 u32 words
= five 128-bit chunk IDs

chunk payloads hash-consed globally
class identity = exact 5-chunk tuple
```

Keep:

- packed support;
- u16 vocabulary/reduction tables;
- prefix4K class-transition cache;
- exact q-state triple;
- hash32 q-state interning;
- WDL-native fail-soft Negamax.

Promotion requires complete bounded graph/class/qID/edge identity plus independent BSFP root/action WDL before standard-7x6 growth is remeasured.
