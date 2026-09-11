# Scaled Term-ID Quotient Kernel Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Composition run:** `34652891914`, job `103438851479` — success  
**Compact timing rerun:** `34653140923`, job `103439628827`  
**7x6 memory run:** `34653258059`, job `103439992701`  
**Status:** exact bounded composition qualified; preferred standard-7x6 scaling architecture, no 7x6 root-solve claim

## Architecture

The two independently qualified scaling optimizations were composed:

```text
u16 term-ID residual ontology
+ fixed 4K dense-prefix residual transition cache
+ packed u32 support descriptor
```

The current full-dense/table term-ID implementation remains the bounded-speed/reference control.

## Exact qualification

The original composition workflow completed successfully and required the composed variants to preserve:

- complete bounded q-state census;
- every residual class ID and term-ID sequence;
- every qID `(support,p0Class,p1Class)` tuple;
- every quotient edge;
- independent BSFP root W/D/L;
- independent BSFP root-action W/D/L;
- identical Negamax expansion and call counts.

The composition therefore changes storage/execution only.

## Compact bounded result

Truthfully-accounted refactored variants from the compact rerun:

| Geometry | table+dense | packed+dense | table+prefix4K | packed+prefix4K |
| --- | ---: | ---: | ---: | ---: |
| 4x4 c4 | **4.257 ms** | 4.437 ms | 4.667 ms | 4.597 ms |
| 5x3 c4 | 1.239 ms | **1.187 ms** | 1.291 ms | 1.407 ms |
| 4x5 c4 | 15.849 ms | **15.660 ms** | 15.728 ms | 15.975 ms |

4x5 measured typed root footprints:

```text
table+dense:      2,142,545 B
packed+dense:     2,116,629 B
table+prefix4K:   1,487,185 B
packed+prefix4K:  1,461,269 B
```

Thus on the governing 4x5 proxy:

```text
packed+prefix4K / table+dense time = 1.0080
```

or roughly **+0.8% wall-clock**, while measured typed memory falls by roughly **31.8%**.

Against packed+dense, prefix4K costs roughly 2.0% wall-clock while reducing measured typed memory by about 31%.

The older `reference` timings are retained as historical controls but should not be used as byte-for-byte comparisons because the historical support accounting omitted ranks/weights and the refactor changes provider shape.

## Standard 7x6 root-construction memory

No exact 7x6 game solve was attempted.

The compact structural run reported:

```text
support states:       823,543
residual vocabulary:      625 terms
```

### Table support + dense residual transition cache at root

```text
total typed:       32,374,827 B
support:           32,118,205 B
residual:             145,694 B
transition cache:        2,688 B
```

The small transition-cache figure here reflects root construction before residual-class growth; it is not a projected solve footprint.

### Packed support + dense residual transition cache at root

```text
total typed:        3,550,829 B
support:            3,294,207 B
residual:             145,694 B
```

### Table support + fixed prefix4K cache

```text
total typed:       33,748,395 B
support:           32,118,205 B
residual:           1,519,262 B
transition cache:   1,376,256 B
```

### Preferred packed support + fixed prefix4K cache

```text
total typed:        4,924,397 B
support:            3,294,207 B
residual:           1,519,262 B
transition cache:   1,376,256 B
```

The preferred scaled configuration therefore constructs the standard-7x6 root kernel in about **4.70 MiB typed memory**, while retaining a fixed 4K residual-transition cache whose size does not grow with total discovered residual classes.

## Interpretation

The two scaling changes compose cleanly:

- packed support removes the dominant 7x6 precomputed-support memory cost;
- the 4K prefix cache bounds residual transition storage;
- their combined bounded 4x5 time cost is approximately neutral relative to truthfully-accounted table+dense execution;
- exact q semantics and search work remain unchanged.

This is the strongest current architecture for moving toward standard 7x6 without allowing support or residual-transition storage to explode before search quality is understood.

## Current scaled baseline

For future scaling work, use:

```text
support: packed u32 descriptor
residual terms: u16 ontology
residual transition cache: direct dense prefix of 4096 classes
state identity: exact q triple
search: WDL-native fail-soft Negamax, tactical closure, no speculative ETC
```

Do not interpret this result as a solved or performance-qualified standard-7x6 root. Standard 7x6 remains structural/root-construction-qualified only.
