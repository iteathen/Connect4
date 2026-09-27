# IsoMax Phase-2 baseline search-shape census

Date: 2026-09-27
Status: diagnostic authority for first Phase-2 experiments; instrumented time is invalid.

## Provenance

Frozen Phase-2 experimental denominator:

`10380f79af68dc1f57455d535814ac0a7eacea33`

Dedicated push workflow:
- branch: `experiment/isomax-phase2-census-20260927`
- workflow run: `36355893287`
- artifact: `10944371158`
- digest:
  `sha256:9bd57671e129e1fd6f7553741fc215a1e66b3a873dadbe8a6a782594b6ac6115`

The source hook changes measurement behavior only. No elapsed-time or cycle result
from this run is admissible performance evidence.

Exact W/D/L/root witness and normal production counters matched the frozen
denominator controls.

## Long control — 353335714

Production:
- nodes: **11,755,731**
- cofactors: **11,813,310**
- exact-cache hits: **3,298,018**
- total cutoffs: **3,714,285**

Recursive CPC-only census:
- CPC calls after exact-cache miss: **8,457,713**
- CPC exact: **562,135**
- CPC bound: **2,427,250**
- CPC restrict: **2,179,175**
- CPC other/no restriction: **3,289,153**
- CPC window cutoffs: **774,871**
- forced events observed in recursive lane: **2,781,275**

Branch/order census:
- branching nodes: **4,339,432**
- sibling scores materialized: **14,510,561**
- children actually searched: **9,032,034**
- scored but never searched: **5,478,527**
- unsearched share of scored siblings: **37.755%**
- alpha-beta child cutoffs: **2,881,835**
- first-child cutoffs: **1,843,271**
- first-child share of alpha cutoffs: **63.962%**

Action-count distribution at branching nodes:

| actions after CPC | nodes |
|---:|---:|
| 1 | 241,474 |
| 2 | 912,142 |
| 3 | 1,325,467 |
| 4 | 1,074,348 |
| 5 | 571,472 |
| 6 | 188,053 |
| 7 | 26,476 |

Cutoff child ordinal:

| searched child ordinal | cutoffs |
|---:|---:|
| 0 | 1,843,271 |
| 1 | 799,608 |
| 2 | 180,933 |
| 3 | 40,188 |
| 4 | 13,518 |
| 5 | 3,960 |
| 6 | 357 |

### Interpretation

The current live-line order is effective: almost two-thirds of child cutoffs
occur on its first choice.

But that effectiveness is purchased by eagerly scoring/materializing every
surviving sibling **before** the first child is searched. Consequently 5.48M
score results are never consumed by search.

This is now a measured structural target, not a speculative micro-optimization.

## CPC interpretation

Broad CPC removal remains falsified.

CPC usefulness rises strongly with rank and is non-monotone in the middle:
- early ranks have mostly no-effect calls but low total traffic;
- ranks 31–37 carry heavy traffic with mixed useful/no-effect outcomes;
- ranks 38–41 are overwhelmingly useful.

Therefore a simple depth/rank cutoff is not justified by this census.

A useful CPC Phase-2 change needs either:
- a cheaper structural predicate that predicts no-effect calls;
- reuse of prior CPC-derived information;
- or removal of duplicated CPC work shared with another consumer.

## Exact/bound TT interpretation

The local exact cache already removes 3.30M recursive visits before CPC.

At the same time, millions of alpha/CPC cutoffs create non-exact search
information that the current exact-only TT intentionally discards.

Because mover-relative W/D/L has only two useful non-exact threshold states
(`>=0`, `<=0`), a shadow/local zero-bound experiment is justified.

The next diagnostic should measure repeat-bound hit/cutoff rates before a
canonical cache mutation.

## Short control — 45461667

- nodes: 62,031
- cache hits: 9,180
- CPC calls: 52,851
- branching nodes: 22,992
- scored actions: 93,551
- searched children: 53,365
- scored but unsearched: 40,186 (**42.956%**)
- alpha child cutoffs: 15,438
- first-child cutoffs: 8,535 (**55.286%** of alpha cutoffs)

The eager-ordering waste therefore appears on both controls.

## Phase-2 candidate order

### P2-A — shadow zero-bound TT

Measure, without changing search:
- candidate LOWER0/UPPER0 stores;
- repeat bound hits;
- hits causing immediate cutoff;
- hits merely tightening window;
- rank distribution;
- exact slots that would be protected from bound replacement.

Only implement if reuse is material.

### P2-B — lazy sibling-order materialization

Goal: preserve the current first-child quality while avoiding score work for
siblings never searched.

Do **not** repeat the rejected historical two-pass best-first implementation.

Promising forms must avoid transition recomputation and should exploit:
- current insertion-order/live-line state;
- cheap first-child evidence;
- exact/proof witness if available;
- staged scoring of remaining siblings only after the first child fails to cut.

### P2-C — CPC no-effect predictor/reuse

Defer until a cheaper predicate or reusable fact is identified. Rank-only
gating is not supported.

## Durability

This census and every follow-up candidate/result must be committed before moving
to the next material Phase-2 stage.
