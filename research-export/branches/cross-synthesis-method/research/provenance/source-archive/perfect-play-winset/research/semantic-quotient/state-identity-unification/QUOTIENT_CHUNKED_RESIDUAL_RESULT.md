# Persistent 128-bit Chunked Residual Pool Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Qualification run:** `34654492966`, job `103443808809`  
**Compact timing rerun:** `34654619532`, job `103444184889`  
**Status:** exact bounded qualification passed; bounded performance rejects default promotion, target-scale 7x6 qualification remains required

## Representation

Each exact residual class is represented over the fixed ontology as:

```text
625-bit maximum canonical antichain bitset
= 20 u32 words
= five 128-bit chunks
```

Chunk payloads are globally hash-consed. A residual class stores five chunk IDs plus exact class hash and singleton metadata.

The same prefix4K class-transition cache is retained.

Transition algebra is ontology-native:

```text
block:
  classBits & ~containsMask[cell]

own:
  unchanged = classBits & ~containsMask[cell]
  affected terms -> exact one-cell reduction targets
  result = unchanged | reduced
  clear strict supersets of each reduced term
```

This is the same qualified antichain transition law expressed over term bits.

## Qualification

After correcting an initial bounded-vocabulary guard bug, the repaired campaign passed the strict exactness gate on every complete bounded control:

- complete reachable q-state count;
- terminal/nonterminal/illegal edge census;
- exact residual-class count;
- every residual class ID's exact term-ID sequence;
- every qID `(support,p0Class,p1Class)` tuple;
- every quotient edge;
- independent BSFP root W/D/L;
- independent BSFP root-action W/D/L;
- identical Negamax expansions and calls.

The representation therefore preserves the existing quotient exactly.

The first failed run was not a semantic mismatch. It incorrectly required every bounded vocabulary to occupy exactly 20 u32 words. The fixed representation is intentionally a maximum-capacity 20-word layout for any vocabulary of at most 640 terms.

## Bounded timing

| Geometry | term-list baseline | chunked | chunk / baseline |
| --- | ---: | ---: | ---: |
| 4x3 c3 | **0.831 ms** | 0.870 ms | 1.047 |
| 4x4 c4 | **4.499 ms** | 7.056 ms | 1.568 |
| 5x3 c4 | **1.144 ms** | 1.295 ms | 1.132 |
| 4x5 c4 | **15.424 ms** | 21.980 ms | **1.425** |

On the governing 4x5 bounded proxy the exact chunked implementation is about **42.5% slower** than the existing term-list scaled baseline.

## Bounded memory

The chunked implementation is also larger on the bounded controls:

```text
4x5 root:          +82,700 B
4x5 complete graph:+1,196,812 B
```

Negative `rootBytesSaved` / `fullGraphBytesSaved` in the campaign output mean the candidate consumed more memory than the baseline.

This is expected from the representation's fixed costs when the residual ontology and class population are small:

- every class reserves five u32 chunk references even when the bounded vocabulary occupies far fewer than 625 terms;
- chunk interning requires a second exact hash table;
- fixed `containsMask` / strict-superset ontology masks have little amortization on tiny controls;
- bounded classes are shorter, so the u16 term-list baseline is already compact.

## Why the 7x6 audit is not contradicted

The prior standard-7x6 audit used **1,357,101 real residual classes** discovered through complete rank-8 expansion and found:

```text
current residual typed storage: ~181.84 MB
128-bit chunk practical projection: ~102.15 MB
projected reduction: ~43.8%
chunk occurrence reuse: 6.49x
```

Those target-scale classes average roughly 40 term IDs each, and the chunk payloads exhibit substantial global sharing. The bounded controls do not reproduce those economics.

We have already observed a comparable scale crossover in the packed-support work:

- packed support was slower on tiny support lattices;
- on standard 7x6 its much smaller working set made randomized access substantially faster.

Therefore the correct conclusion is **not** that persistent chunks failed universally. It is:

> The exact implementation is too expensive for the bounded controls and must earn promotion specifically on the standard-7x6 class population that motivated it.

## Disposition

Do not replace the current term-list residual pool for bounded/root-speed work.

Proceed to a hard-capped standard-7x6 forward-growth comparison using the exact chunked implementation, under the same rank/state contract as the existing term-list census.

Measure:

- q states by rank;
- residual classes by rank;
- unique chunks and chunk capacity;
- residual and total typed memory;
- process RSS;
- class/chunk interning reuse;
- transition cost / elapsed time;
- prefix-cache behavior.

If target-scale chunked storage fails to materially reduce memory or its transition penalty is prohibitive, reject this implementation and fall back to simpler term-ID packing/compression. If the audit's memory reduction materializes and target-scale locality reduces the runtime penalty, continue optimizing the chunked transition/interner path.
