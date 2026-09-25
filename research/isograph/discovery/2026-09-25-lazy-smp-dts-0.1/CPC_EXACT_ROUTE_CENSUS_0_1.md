# Lazy SMP DTS 0.1 — CPC_EXACT Route Census 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE first CPC_EXACT route census  
**Authority effect:** none  
**Solver-method effect:** none  
**Durable owner:** research/semantic-quotient

## Exact anchors

- IsoGraph integrated stack: iteathen/IsoGraph@419f3d13ab5480d72fcd78f51502e5928bf5280f
- JSMinSys production baseline: 04d37498607ace16dae33c79462ddfe1503c8a0d
- JSMinSys measurement head: 2bde34d4869c1c6d58525eef02db6412109cb03b
- JSMinSys Verify run: 36201497828 — PASS
- Connect4 measurement head: d0f7f6f61b4bb80a675baf964f85a5d1f0a216cd
- Connect4 workflow run: 36201556178 — PASS
- workers: exactly 4
- production shared mask: 7

The prior provenance census established that every measured shared exact publication and every measured consumed shared exact hit was produced by CPC_EXACT. This census decomposes that transition class into the existing CPC exact-return routes.

## Route vocabulary

1. no residuals remain
2. residual-side exhaustion interval collapse
3. mover immediate singleton
4. multiple opponent singleton threats
5. stacked single-threat loss
6. all-legal-moves lift into opponent singleton
7. fork-precursor exact loss
8. long-range paired/frontier response closure
9. non-CPC semantic interval exact
10. forced-terminal full-window exact
11. recursive full-window exact

Routes 9-11 remained absent from shared publication, consistent with the preceding provenance census.

## Solved control 45461667

Three exact four-worker samples were collected. Aggregate over the three:

| CPC exact route | stores | consumed hits | hits/store | store share | hit share |
|---|---:|---:|---:|---:|---:|
| no residuals | 3 | 204 | 68.0 | 0.02% | 0.07% |
| mover immediate singleton | 10,432 | 196,030 | 18.79 | 76.00% | 64.59% |
| multiple opponent threats | 1,204 | 16,176 | 13.44 | 8.77% | 5.33% |
| stacked threat | 1,907 | 57,280 | 30.04 | 13.89% | 18.87% |
| all-lift | 168 | 19,489 | 116.01 | 1.22% | 6.42% |
| long-range response | 12 | 14,305 | **1,192.08** | **0.09%** | **4.71%** |

Per-run long-range response reuse was approximately 1,179-1,199 consumed hits per committed store.

All three runs remained exact +1, move witness 3, cleanup true, four workers exited.

## Hard unresolved probe 13333111

| CPC exact route | stores | hits | hits/store | store share | hit share |
|---|---:|---:|---:|---:|---:|
| no residuals | 16 | 2,862 | 178.88 | 0.07% | 0.71% |
| mover immediate singleton | 16,403 | 278,309 | 16.97 | 75.82% | 69.25% |
| multiple opponent threats | 1,866 | 8,909 | **4.77** | 8.62% | 2.22% |
| stacked threat | 3,085 | 62,060 | 20.12 | 14.26% | 15.44% |
| all-lift | 251 | 40,695 | **162.13** | 1.16% | 10.13% |
| long-range response | 14 | 9,064 | **647.43** | 0.06% | 2.26% |

The 15-second probe timed out cleanly as intended.

## Empty-board unresolved probe

| CPC exact route | stores | hits | hits/store | store share | hit share |
|---|---:|---:|---:|---:|---:|
| no residuals | 10 | 5,622 | 562.2 | 0.10% | 1.31% |
| mover immediate singleton | 8,407 | 270,649 | 32.19 | 82.09% | 62.84% |
| multiple opponent threats | 686 | 8,037 | **11.72** | 6.70% | 1.87% |
| stacked threat | 999 | 36,369 | 36.41 | 9.75% | 8.44% |
| all-lift | 134 | 29,687 | **221.54** | 1.31% | 6.89% |
| long-range response | 5 | 80,327 | **16,065.4** | **0.05%** | **18.65%** |

The 15-second probe timed out cleanly as intended.

## DTS interpretation

### R1 — CPC_EXACT is not one performance transition class

The broad semantic result is the same: all routes yield an exact ordinary value for the same qualified cache scope. But their cross-worker reuse differs by orders of magnitude. Same CPC_EXACT result status does not imply the same sharing economics.

The most extreme exercised case is long-range response closure: roughly 0.05-0.09% of committed stores produced roughly 2.3-18.7% of consumed hits, ranging from hundreds to more than 16,000 hits per committed store.

**Discovery disposition:** STRUCTURE_ESTABLISHED.

### R2 — the rare long-range route is disproportionately reusable

Route 8 is consistently tiny in publication volume yet extremely large in reuse per publication. The all-lift route is the second consistently high-reuse class. This is an empirical performance result, not a semantic privilege; it does not alter CPC truth or q_r identity.

### R3 — multiple-opponent-threat publication is comparatively low-yield

Route 4 consumed about 13.4 hits/store on the solved control, 4.8 on the hard probe, and 11.7 on the empty board while accounting for about 6.7-8.8% of shared stores. It is the strongest first candidate for sparser producer admission, but hit/store alone is insufficient because route-specific replacement interactions are not yet known.

### R4 — producer and consumer route visibility differ

The producer knows its exact closure route at the CPC return point. The consumer does not know which route would produce a future shared hit before probing the cache. Route-aware producer admission/replacement is therefore directly available, while route-aware consumer probe gating would require another cheap predictor or added metadata/indexing.

### R5 — simple high-leverage densification cannot work with the current consumer gate

The current consumer probes shared memory only for the existing mask-7 key subset. Publishing route-8 facts outside that subset would not make them consumable because those consumers would not probe. The first route-aware optimization must therefore operate inside the existing probe-visible population, for example by selective admission or replacement protection.

## New structural lead — route-aware replacement

The direct-mapped shared table can discard a rare route-8/all-lift row when a more common lower-reuse route maps to the same slot. The previous collision census treated all exact rows as one class; DTS exposes a potentially load-bearing distinction among row-producing transitions.

Before adding replacement policy, measure incoming CPC exact route × displaced committed route × same-key refresh versus different-key collision. If rare high-reuse rows are materially displaced by common lower-reuse routes, a small producer-side admission/replacement rule becomes a justified A/B candidate. If they are not, route-aware protection is unnecessary machinery.

## QU refinement

QU-DTS-LSMP-06 is narrowed: CPC_EXACT route identity is established; cross-worker reuse disparity is established; long-range/all-lift high reuse is empirically supported; replacement interaction and the cheapest profitable route-aware policy remain open.

New focused unknown: QU-DTS-LSMP-07 — route-by-route shared-slot displacement topology.

## Next action

Run a measurement-only 12 × 12 route replacement matrix plus same-key-refresh/collision split on the existing measurement branch. Do not change production sharing policy until that matrix is known.
