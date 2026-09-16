# Slot64 Transition Locality Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34655409206`, job `103446601008`  
**Status:** complete; repaired v2 audit with histogram invariants

## Purpose

Measure how many of the ten fixed 64-bit ontology slots actually change on exact standard-7x6 quotient transitions before implementing selective slot materialization.

The audit expands the exact term-list quotient through support rank 8, caches q edges, and then compares parent and child residual classes without recomputing transitions.

Authoritative graph checkpoint:

```text
q states:            797,388
residual classes:  1,357,101
nonterminal edges: 1,772,397
terminal wins:        33,274
illegal probes:        4,627
```

Every histogram was required to total exactly 1,772,397 nonterminal edges. The repaired 10-bit popcount sanity checks also require `popcount(0)=0` and `popcount(0x3ff)=10`.

## Measured locality

| transition view | mean changed/affected slots | p50 | p90 | p95 | p99 |
| --- | ---: | ---: | ---: | ---: | ---: |
| mover direct source slots | 2.194 | 2 | 3 | 4 | 4 |
| mover final changed slots | 4.571 | 5 | 7 | 7 | 8 |
| mover normalization-only extra slots | 2.377 | 2 | 4 | 4 | 5 |
| opponent block direct slots | 2.222 | 2 | 3 | 4 | 4 |
| opponent block final slots | 2.222 | 2 | 3 | 4 | 4 |
| combined final changed slots | 4.997 | 5 | 7 | 7 | 8 |

Opponent block transitions are pure deletion, so direct and final slot masks are identical for **100%** of analyzed edges.

Mover direct affected slots equal the final changed-slot set for only about **0.0586%** of edges. Own reduction therefore requires substantial target insertion and antichain normalization beyond the directly hit source slots.

Across the complete sample every ontology slot is used somewhere, so there is no globally dead slot to remove. The opportunity is transition-local, not ontology-global.

## Interpretation

Selective slot materialization is justified:

- block transitions usually touch only 2-4 of ten slots;
- own transitions directly read roughly 2.2 slots, but exact normalization expands final change to roughly 4.6 slots on average;
- the union of mover/opponent final changes averages almost exactly five slots, with p95 seven.

This can remove a material fraction of current full-class loading/copying, but locality alone is unlikely to explain the entire slot64 runtime gap because own normalization still spans about half the ontology.

## Next optimization order

1. **Sparse strict-superset normalization first.** The current implementation probes all 20 ontology words for each reduced term even when most masks are zero. At the rank-8 target-scale run, about 5.99M reduced terms caused only about 13.52M nonzero superset-word clears, versus roughly 119.9M possible 20-word probes.
2. Re-qualify exactness and target-scale runtime/memory.
3. If the gap remains material, add selective chunk loading/reuse using the measured slot locality, beginning with block transitions where the changed-slot set is exact from direct incidence.

The slot64 persistent representation remains the strongest memory architecture; this result narrows the speed work to transition execution rather than representation viability.
