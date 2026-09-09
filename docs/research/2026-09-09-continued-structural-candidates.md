# Continued structural candidates: semantic bounds, neutral tempo, and intrinsic banking controls

**Date:** 2026-09-09  
**Status:** research evidence only; maintained source and `main` unchanged.

This batch continued after `2026-09-09-resumed-structural-batch.md`. It deliberately tested new structural consequences of the win-space model rather than tuning the already-positive rank/decision layout.

## 1. Branching-factor TT banking: negative

Hypothesis: after tactical filtering, the surviving branch count is intrinsic to a state. States with different branch counts cannot be identical, so separate TT banks might prevent pointless cross-class eviction.

Decision-state admission remained enabled, so single-choice transit states were already uncached. Equal-total 512K layouts were tested for 2-way, 3-way, and wider decision states.

`663152175`:

- flat decision TT: 1,010,950 nodes;
- 2-bank layout: 1,039,511;
- 4-bank layout: 1,022,871;
- heavy-2 layout: 1,047,924.

`41267575`:

- flat decision TT: 5,521,407 nodes;
- 2-bank layout: 6,347,266;
- 4-bank layout: 5,683,420;
- heavy-2 layout: 6,920,534.

All exact root scores agreed.

Disposition: negative. Intrinsic disjointness alone is insufficient. Rank appears special because it is both an exact identity partition and a strong proxy for the search's changing working set; branch count only provides the former.

## 2. One-sided win-space exhaustion as exact alpha-beta bounds

The combined win-space representation gives stronger facts than the previous both-empty draw terminal:

- if P0 has no remaining winning requirements, `V_P0 <= 0`;
- if P1 has none, `V_P0 >= 0`;
- if both are empty, `V_P0 = 0`.

These are semantic bounds, not heuristics. The prototype tightens alpha-beta windows when either one-sided condition becomes true.

Complete small-game results:

| Geometry | Baseline nodes | Bound nodes | Change |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 845 | 846 | -0.1% |
| 4x4 connect-4 | 15,394 | 15,028 | +2.4% |
| 5x3 connect-4 | 2,999 | 1,974 | **+34.2%** |
| 4x5 connect-4 | 111,003 | 113,089 | -1.9% |

Exact root scores agreed in every complete game.

Seven ordinary late 7x6 roots were also tested with the same exact win-space alpha-beta engine. Six were too small for the new bound to activate materially. The heaviest root, `12715327646521274261131547452374`, dropped 156 -> 130 nodes (**16.7%**) with 14 exhaustion cutoffs and the same exact score.

Disposition: semantically valid and conditionally useful, but not universally beneficial. Keep as a nearly-free bound if the low-level win-space representation already exposes empty-side status without extra scanning; do not build a separate subsystem for it.

## 3. Neutral-tempo compression under alpha-beta: positive

A column whose remaining cells occur in no surviving winning requirement for either player can no longer affect which player completes a win. Its remaining cells still consume turns, so they cannot simply be deleted. The exact abstraction retires such columns into a finite neutral-tempo pool:

- active winning structure retains addressed columns/cells;
- each neutral move consumes one remaining neutral slot and flips the side to move;
- several physically distinct filler columns can therefore become one semantic action.

This had only modest whole-state effects in earlier full-enumeration tests. Under alpha-beta it changed proof shape much more:

| Geometry | Baseline nodes | Neutral-pool nodes | Reduction |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 845 | 832 | 1.5% |
| 4x4 connect-4 | 15,394 | 9,316 | **39.5%** |
| 5x3 connect-4 | 2,999 | 2,784 | 7.2% |
| 4x5 connect-4 | 111,003 | 103,955 | 6.3% |

All exact root scores agreed.

The previously preserved late-7x6 full-enumeration mechanism test also showed state reductions of roughly 4%-28% and call reductions of roughly 4%-32% across seven roots, reinforcing that neutral physical choices can collapse before search.

Disposition: promote. This is a direct consequence of searching the remaining win structure rather than the historical board. Its value is proof-shape dependent, so low-level integration should be measured under alpha-beta rather than judged only by raw state counts.

## 4. Neutral tempo + one-sided exhaustion bounds: valid but non-additive

Because both mechanisms come from the same win-space representation, they were composed without extra semantic machinery.

| Geometry | Baseline | Neutral | One-sided bounds | Combined |
| --- | ---: | ---: | ---: | ---: |
| 4x3 connect-3 | 845 | 832 | 846 | 832 |
| 4x4 connect-4 | 15,394 | **9,316** | 15,028 | 12,382 |
| 5x3 connect-4 | 2,999 | 2,784 | 1,974 | **1,731** |
| 4x5 connect-4 | 111,003 | **103,955** | 113,089 | 105,763 |

The 5x3 game shows strong composition: **42.3% fewer nodes** than baseline. But in 4x4, the bound changes alpha-beta cutoffs in a way that reduces the larger benefit of neutral-pool ordering; neutral alone is better. 4x5 shows the same weaker interference.

Interpretation: organic mechanisms can share the same structural source without being monotonically additive. They may answer the same proof obligation at different times and alter subsequent alpha-beta order/cutoffs. Composition must remain evidence-driven.

## 5. Structural move-order and two-tier TT controls remain negative

The real 7x6 move-order experiment added opponent-win destruction to the existing winning-position ordering. Node counts, TT hits, and TT writes were exactly unchanged on both established roots while runtime increased.

The previous-pass-read/current-pass-write two-tier TT was worse than a flat TT at equal total memory. Even when each tier received 512K entries, a flat 1M table still searched fewer nodes on `41267575` (5,155,879 vs 5,362,423).

These controls reinforce the current direction: remove semantic distinctions or cache traffic structurally; do not add layers unless they eliminate real work.

## Revised active candidate set

Highest-value structural candidates now include:

1. fixed 625-ID minimal win-requirement antichain;
2. neutral-tempo compression for cells/columns outside both win spaces;
3. decision-state TT admission / forced macro-edges;
4. intrinsic move-rank TT banking;
5. compact exact key integrated with bank width;
6. dominance/implication proof reuse derived from the same requirement bitsets;
7. residual-game automorphisms using structural refinement;
8. one-sided win-space exhaustion bounds as a cheap optional consequence of the representation.

The key integration principle is unchanged: prefer a representation that makes several operations cheap consequences of the same structure rather than independent policy systems.

## Evidence identities

- branch-factor banking raw evidence: SHA-256 `5d472cba3fdd1e89b25931a344d6c95995c681347e9232adc45d4c8bdaf6299e`
- one-sided complete-game bounds: `88ded777091f4043c4275546fa3e0b151b06f526708d7149e21387a2e8acc6e3`
- one-sided late-7x6 bounds: `d3327f3b8440d970ad0e8f915a0cf09f7f8b0990e6814ef8825e6b9bd1f4c1a8`
- neutral-pool alpha-beta: `45167d782d2a6f97720c2f3e8950d282dea9335062c1c7e238167aed6138acda`
- neutral + bounds composition: `b6cb18a420cbc5e5fb7544d125c81c1437e5f3947cbc3d4ef93c29d958014d5a`
