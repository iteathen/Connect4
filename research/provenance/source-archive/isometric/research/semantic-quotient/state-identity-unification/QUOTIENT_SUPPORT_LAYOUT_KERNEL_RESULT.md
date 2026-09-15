# Whole-Kernel Packed Support Layout Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34652648657`, job `103438086249`  
**Status:** complete bounded semantic qualification; packed support promoted for scaled-kernel composition

## Purpose

Promote the previously qualified packed support descriptor from a structural microbenchmark into the actual quotient-native term-ID Negamax kernel without changing any quotient, residual, search, or proof semantics.

Three implementations were compared:

1. **reference** — the existing qualified term-ID quotient kernel;
2. **refactored table** — the new support-provider seam using the historical rank/landing/child table layout;
3. **refactored packed** — the same kernel using one packed support descriptor per support state.

The existing winner was not modified during this campaign.

## Qualification

On every complete bounded control, both refactored variants reproduced the reference exactly:

- complete reachable q-state census;
- exact residual-class count;
- every residual class ID's term-ID sequence;
- every qID `(support,p0Class,p1Class)` tuple;
- every terminal/nonterminal/illegal quotient edge;
- independent BSFP root W/D/L;
- independent BSFP per-root-action W/D/L;
- identical Negamax expansion and call counts.

The support representation therefore changes execution only, not exact solver semantics.

## Root benchmark

Median total time:

| Geometry | current reference | refactored table | packed | packed / table |
| --- | ---: | ---: | ---: | ---: |
| 4x3 c3 | 0.464 ms | 0.455 ms | **0.437 ms** | 0.959 |
| 4x4 c4 | **2.658 ms** | 3.204 ms | 2.670 ms | **0.834** |
| 5x3 c4 | 1.660 ms | 1.201 ms | **0.914 ms** | **0.760** |
| 4x5 c4 | **8.351 ms** | 8.715 ms | 8.835 ms | 1.014 |

The governing 4x5 proxy shows packed support essentially neutral relative to the truthfully-accounted refactored table (+1.4%). The variation relative to the older reference includes the refactor/provider shape and should not be read as a pure packed-layout cost.

## Corrected support-memory accounting

The historical base kernel's `memoryStats()` counted landing/child tables but omitted `support.ranks` and `support.weights`. The new support-provider accounting includes the complete support representation and reports bit masks separately.

For 4x5 root search:

```text
historical reference reported support bytes: 26,080 B
truthful table support bytes:                31,120 B
packed support bytes:                         5,204 B
```

The historical performance evidence remains valid under its recorded equal-budget contract; the byte totals should not be retroactively interpreted as complete support-memory accounting.

## Standard 7x6 structural/root result

No exact 7x6 root solve was attempted.

At root construction:

```text
support states:       823,543
residual vocabulary:      625 terms
```

Complete measured typed footprint:

```text
refactored table:  32,374,827 B
packed support:     3,550,829 B
```

Ratio:

```text
packed / table = 0.10968
```

So packed support removes about **89.0% of the total typed root-construction footprint** in this configuration, not merely 89.7% of the support substructure.

Support structure alone remains:

```text
table:  32,118,205 B
packed:  3,294,207 B
```

## Interpretation

The whole-kernel qualification confirms the structural result:

- packed descriptors are exact;
- the arithmetic access path does not materially damage bounded 4x5 runtime;
- target-scale 7x6 memory reduction is enormous;
- independent structural evidence already showed packed support faster than the 32 MB direct table on randomized 7x6 accesses because of working-set locality.

The correct policy remains scale-sensitive rather than universal:

```text
small support lattices -> table remains valid reference
large support lattices -> packed descriptor is the promoted scaling candidate
```

## Disposition

Advance the following combination to a single scaled-kernel campaign:

```text
u16 term-ID residual ontology
+ fixed dense-prefix residual transition cache (4K candidate)
+ packed u32 support descriptor
```

The next qualification must prove that composing the two independent scaling optimizations preserves the complete bounded quotient graph and exact BSFP root/action WDL before any standard-7x6 execution claim is made.
