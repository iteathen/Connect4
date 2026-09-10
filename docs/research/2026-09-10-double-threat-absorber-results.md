# Exact double-threat absorber results

**Date:** 2026-09-10  
**Branch:** `feature/cuda-bsfp`  
**Research source:** `reference/research-prototypes/2026-09-10-bsfp-winspace-inference/double-threat-absorber.mjs`  
**Measured source head:** `80f6d20f10a40ce95882e091665cac901a091d73`  
**Status:** exact research candidate; not integrated into C1.

## Question

Can cheap inference over the currently playable winning requirements prove ownership regions early enough to reduce the expensive universal BSFP antichain intersections?

The first candidate is a **distinct-playable double-threat absorber**. Multiple winning lines through the same landing cell count as one threat; the proof requires two different currently playable completion cells. The mover's own immediate-win region is subtracted so first-win termination retains authority.

For P0 to move, two independently playable P1 completions define an exact downward P0-Loss region. For P1 to move, two independently playable P0 completions define the dual exact upward P0-Win region.

The candidate is used only as a known subset of the eventual universal-intersection result. Intermediate ownership cones already contained in that proved region may be omitted while the seed is carried separately and rejoined at the end.

## Qualification method

For each complete test geometry the harness first runs the maintained packed42 CPU BSFP solver with an all-support frontier observer. It then independently reconstructs only the expensive intersection side from those authoritative child frontiers.

The harness must satisfy all of the following before its savings numbers are accepted:

1. its reconstructed baseline frontier equals the maintained exact frontier at every support;
2. its reconstructed aggregate pair count equals the maintained CPU solver's pair count exactly;
3. every inferred seed cone is contained in the maintained exact Win/Loss region;
4. carrying the seed as an absorber and rejoining it after the intersection reproduces the exact maintained frontier at every support.

The 5x5 baseline replay reproduced **81,515,570 generated aggregate pairs exactly**. All tested geometries had zero baseline frontier mismatches, zero absorber frontier mismatches and zero unsound inferred seeds.

## Results

| Geometry | Supports with seed | Baseline pairs | Absorber pairs | Pair reduction | Post-combine candidates already proved | Seed sound |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 4x3 c3 | 175 / 256 | 11,697 | 10,524 | 10.03% | 6,116 | yes |
| 4x4 c4 | 292 / 625 | 33,427 | 31,884 | 4.62% | 6,742 | yes |
| 5x3 c4 | 116 / 1,024 | 21,014 | 20,471 | 2.58% | 1,082 | yes |
| 4x5 c4 | 889 / 1,296 | 587,389 | 571,477 | 2.71% | 120,130 | yes |
| 5x4 c4 | 2,028 / 3,125 | 2,298,403 | 2,210,760 | 3.81% | 463,989 | yes |
| 5x5 c4 | 6,468 / 7,776 | 81,515,570 | 79,580,610 | **2.37%** | **21,671,147** | yes |

For 5x5, the seed exists on about **83.18%** of support skeletons. The 147,873 normalized seed records average about 22.86 records over supports that have a seed.

The direct reduction in generated pair operations is only 1,934,960 pairs, so this certificate family by itself is not a large enough search-space reduction to justify treating it as the main 6x5 breakthrough.

The more interesting result is different: **21,671,147 generated 5x5 pair results, about 26.59% of the baseline pair count, are recognized after combination as already contained in the exact inferred final region.** Those candidates need not participate in subsequent antichain dominance/dedup work if the production implementation can recognize and compact them cheaply.

This effect is separate from the 2.37% pair-count reduction. The latter comes from narrower carried frontiers compounding into later pair products; the former identifies candidates whose OR/AND result can be discarded before normalization.

## Cost interpretation

Do not use the research harness wall time as the inference cost. The 5x5 run took about 153 seconds because the harness deliberately performs the maintained solve, an independent baseline aggregate replay, and a second absorber replay with JavaScript normalization. Production inference would not repeat the CPU solve.

The important production predicate can be cheaper than scanning the normalized seed frontier.

For a P0-turn maximal Loss candidate cap `c`, the entire downward cone under `c` is inside the double-threat Loss certificate exactly when:

- `c` admits at least two distinct playable P1 completion cells; and
- `c` admits no immediate P0 completion.

For a P1-turn minimal Win candidate generator `g`, the entire upward cone over `g` is inside the double-threat Win certificate exactly when:

- `g` guarantees at least two distinct playable P0 completion cells; and
- `g` intersects every currently playable P1 completion requirement, so P1 has no immediate terminal win first.

These checks can be made directly against the already-present per-support terminal requirement data (`terminalOffsets` / terminal masks), avoiding a scan over 147,873 seed records. The number of legal landing cells is bounded by board width and the local winning requirements are small fixed-width 42-bit masks.

## Reassessment

### What is established

- The distinct-playable double-threat certificate is exact on six complete-game controls through 5x5 under the maintained ownership-frontier semantics.
- It integrates algebraically as a known subset of the final universal Win/Loss region without changing the result.
- It produces only a modest direct pair-count reduction on 5x5.
- It identifies a much larger class of post-combination candidates that can potentially bypass expensive normalization.

### What is not established

- No CUDA implementation exists yet.
- No native timing gain is claimed.
- The 26.59% post-combine absorption rate is not automatically a 26.59% solver speedup; the recognition/compaction cost must be paid.
- This one local certificate family is not enough evidence to replace ownership frontiers with WSL/NDC records.
- No 6x5 or 7x6 result follows from this experiment.

## Interaction with the C3 diagnostic

This result makes the C3 first-epoch counters more valuable rather than less necessary.

If C3 shows duplicate/prior-scan or 43-phase normalization work dominates the 6x5 epoch, double-threat inference is a natural **front-end filter** for a revised compacting normalizer: recognize the proved candidate, omit it from the normalization workset, and carry the small exact seed to final publication.

If C3 instead shows raw aggregate pair formation dominates, this certificate is too weak by itself because its 5x5 direct pair reduction is only 2.37%; broader WSL/CPC/NDC inference would be required.

If terminal subtraction dominates, fix that algebra first; the double-threat certificate can remain a subsequent exact filter.

## Disposition

Retain this candidate. Do not promote it alone as the 6x5 optimization.

The next physical datum remains the portable-qualified C3 one-epoch native 6x5 diagnostic. After that datum, choose whether the first production intervention is:

- cardinality bucketing / exact dedup;
- specialized terminal subtraction;
- multi-block heavy-support decomposition;
- double-threat filtering combined with compaction;
- or broader winspace/NDC inference.

The selection criterion remains **exact candidate/proof work eliminated before expensive normalization/materialization per unit of inference and compaction cost**.
