# Residual transposition automorphisms

**Date:** 2026-09-09  
**Status:** research evidence only; maintained source and `main` unchanged.  
**Research lineage:** branch rooted at preserved structural commit `6fc9c8f3522abc45cdfdd21226591269c59eed12`.

## Question

Can the residual win-space representation identify legal moves that are exactly interchangeable even when the historical colored board is not globally symmetric?

This experiment tested a deliberately narrow, exact form of residual automorphism before attempting broader graph canonicalization.

Two currently legal columns `a` and `b` are placed in the same move orbit only when:

1. their current heights are equal; and
2. swapping those columns leaves P0's residual minimal-requirement antichain exactly unchanged; and
3. the same swap leaves P1's residual minimal-requirement antichain exactly unchanged.

The search then evaluates only the first move in each proven orbit.

This is stronger than a structural-color heuristic: the permutation must preserve the actual residual state. It is also narrower than full automorphism discovery because this prototype tests transpositions only, not arbitrary multi-column cycles.

## Important harness defect found during falsification

The first 7x6 run produced an apparent correctness failure on sequence:

`24763565123272565531172315`

The incumbent residual solver returned `+2`, while the orbit version returned `+6`.

That initially looked like evidence that `(heights, R0, R1)` omitted a physical fact. The falsification sequence showed otherwise:

- independent maintained 7x6 oracle: `+2` from P0's perspective;
- residual search with TT disabled: `+2`;
- residual-orbit search with TT disabled: `+2`;
- TT-disabled nodes: 43,455 -> 18,997 with orbit pruning.

Instrumentation then exposed a contradictory cached interval. The research interval-TT code treated `{lo: v, up: v}` like a generic interval. If `v` lay inside the caller's window, it tightened both `alpha` and `beta` to `v` but failed to return. Search continued with `alpha === beta`, and later writes could manufacture an impossible interval such as `{lo: 5, up: -3}`. The changed proof order from orbit pruning made this latent defect visible.

The repair is simple and semantic: **an exact TT entry (`lo === up`) returns immediately**. The prototype also asserts `lo <= up` after every write.

This is a research-harness defect. It is not evidence that the maintained Connect4 exact oracle has the same problem. However, earlier structural experiments that used this interval-TT implementation should be treated as requiring requalification when their result depends materially on TT proof shape.

## Complete small-game qualification after TT repair

All four modes returned the same exact root score in each complete game.

| Geometry | Base nodes | Orbit nodes | Cardinality nodes | Both nodes | Orbit reduction | Both vs cardinality |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 connect-3 | 812 | 808 | 513 | 511 | 0.49% | 0.39% |
| 4x4 connect-4 | 12,935 | 11,796 | 11,670 | 10,728 | 8.81% | 8.07% |
| 5x3 connect-4 | 2,628 | 978 | 1,477 | 504 | **62.79%** | **65.88%** |
| 4x5 connect-4 | 57,944 | 53,658 | 53,698 | 49,931 | 7.40% | 7.02% |

The 5x3 result is especially strong evidence that residual transposition symmetry can be much larger than ordinary board symmetry in some game geometries.

## Frozen baseline-selected 7x6 cohort

All scores were checked against the maintained exact 7x6 oracle, converted to P0 perspective.

| Sequence | Oracle | Base | Orbit | Cardinality | Both | Orbit reduction | Both vs card |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `764353221241721325116531` | -2 | 28,731 | 26,753 | 23,443 | 21,992 | 6.88% | 6.19% |
| `5563576621726752473477144213` | +7 | 804 | 786 | 264 | 260 | 2.24% | 1.52% |
| `3253472274311154254412135` | -9 | 2,115 | 1,344 | 1,398 | 786 | **36.45%** | **43.78%** |
| `24763565123272565531172315` | +2 | 2,687 | 2,233 | 1,744 | 1,480 | 16.90% | 15.14% |
| `544111352647536626717444135` | -8 | 809 | 796 | 320 | 320 | 1.61% | 0.00% |
| `3412761563244125763551573` | -9 | 1,932 | 1,910 | 6 | 6 | 1.14% | 0.00% |
| `1174534625627233274533652316` | -6 | 5,179 | 4,201 | 3,772 | 3,084 | 18.88% | 18.24% |
| `463141571213634656162165252` | +7 | 1,012 | 950 | 724 | 678 | 6.13% | 6.35% |
| **Total** | | **43,269** | **38,973** | **31,671** | **28,606** | **9.93%** | **9.68%** |

The combined cardinality + orbit solver therefore removes **33.89%** of baseline nodes on this cohort, versus **26.80%** for cardinality alone.

## Representation cost matters

The first exact implementation rebuilt and sorted transformed BigInt requirement masks on every symmetry check. It reduced nodes but was slower.

The intended 625-ID implementation precomputes, for each column transposition and each residual requirement ID, the transformed requirement ID (or `-1` if the transformed mask is not a valid requirement). Runtime checks then operate on compact requirement IDs and existing sorted antichains.

Eleven rotating-order cohort repetitions were run. Repetitions 0-2 were treated as warm-up; the median over repetitions 3-10 was:

| Mode | Median cohort time |
| --- | ---: |
| Base | 63.47 ms |
| Orbit | 63.74 ms |
| Cardinality | 50.42 ms |
| Cardinality + orbit | **47.60 ms** |

At this prototype level:

- orbit alone is essentially runtime-neutral: **+0.42%** despite 9.93% fewer nodes;
- adding orbit pruning to cardinality is a measured **5.59% speedup** while removing another 9.68% of nodes;
- combined is about **25.0% faster** than the repaired baseline in these repeated runs.

Absolute JavaScript timings are mechanism evidence only, not a production/GPU performance claim.

## Interpretation

**Promote residual transposition automorphisms as a research candidate.**

The key result is not merely the current ~10% node reduction. The candidate composes positively with cardinality bounds and becomes a real runtime win once it uses the fixed 625-ID substrate rather than reconstructing masks. This supports the broader hypothesis that several useful search operations should become cheap consequences of the same residual representation.

The current implementation remains intentionally narrow. It can miss valid automorphisms that require a 3-cycle or larger column permutation even when no single transposition is itself a symmetry. Therefore this experiment establishes a lower bound on useful residual symmetry, not the ceiling.

## Next seams

1. Test a cheap refinement that can discover non-transposition residual automorphisms without factorial permutation search.
2. Explore maintaining symmetry-class information incrementally as requirement IDs are transformed/removed, rather than rediscovering it at every node.
3. Requalify earlier TT-sensitive research candidates under the exact-entry repair before using their old node counts as comparative authority.
4. Keep full support/event-frontier representation work as a synthesis candidate rather than freezing architecture yet.

## Preserved evidence

- prototype: `reference/research-prototypes/2026-09-09-residual-automorphisms/residual_automorphism_625.mjs`
- structured evidence: `docs/research/evidence/2026-09-09-residual-automorphisms.json`

The experiment changes no maintained solver code and does not touch `main`.
