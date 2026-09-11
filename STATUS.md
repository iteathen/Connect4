# Connect4 Minimax / Alpha-Beta Status

**Updated:** 2026-09-11  
**Canonical branch:** `solver/minimax-alpha-beta`  
**State:** MQ5 semantic-residual proof reduction qualified; typed exact interning optimization active

## Mission

This branch owns the exact minimax/negamax/alpha-beta solver line, its search-specific experiments, benchmark evidence, TT/scheduling work, and search-side structural optimizations. CUDA-BSFP remains a separate solver. Shared semantic-quotient research is routed through `research/semantic-quotient`.

## Consolidation state

The branch contains the complete identified minimax research lineage through the pre-BSFP structural cut plus the missing rethink-control history. Durable navigation starts at:

- `MINIMAX_BRANCH.md`
- `reference/research-prototypes/MINIMAX_INDEX.md`
- `docs/research/2026-09-10-minimax-branch-lineage-audit.md`

## Shared semantic result

`research/semantic-quotient` completed MQ1-MQ4 on complete bounded controls.

The qualified state law is:

```text
support / legal landing context
+ minimal current-player residual winning-requirement antichain
+ minimal opponent residual winning-requirement antichain
```

with local transition:

```text
semantic state + column
  -> immediate terminal score | next semantic state
```

MQ4 generated complete residual automata without colored ownership or line-hit history and reproduced reachable states, exact strong scores, every action score, and a materialized/serialized flat transition replay with zero mismatches on 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4.

The shared semantic mathematics remains owned by `research/semantic-quotient`; this branch owns search implementation and performance consequences.

## MQ5 structural result

Packet:

```text
research/minimax/semantic-residual-mq5/
```

Frozen exact-search control:

```text
reference/research-prototypes/2026-09-09-decision-state/solver_compact_decision_rank.mjs
```

The first fairness mode holds 512K TT slots and the exact16 intrinsic-rank bank layout fixed. Exact distance scoring, null-window convergence, center-first tie order, immediate threat/forced-block semantics, winning-cell-count move ordering, and decision-only TT admission are aligned as closely as the different state identity permits.

### Two-anchor proof-work qualification

| Anchor | Score | Baseline nodes | Semantic nodes | Ratio | Reduction |
| --- | ---: | ---: | ---: | ---: | ---: |
| `663152175` | -4 | 1,014,754 | 786,581 | 0.775145 | 22.48% |
| `41267575` | +3 | 5,261,422 | 4,138,812 | 0.786634 | 21.34% |

The semantic candidate also reduces TT writes to about 0.760x / 0.772x of the baseline while TT hits are about 1.058x / 1.013x.

The same semantic node counts survived both side-state factorization and conversion of residual requirements to WSL-625 u16 IDs. This establishes that the node reduction is a semantic-state effect rather than an artifact of the original string representation.

Durable evidence:

- `docs/research/2026-09-11-minimax-mq5-semantic-residual-anchor-results.md`
- `docs/research/evidence/2026-09-11-minimax-mq5-semantic-residual-anchors.json`

## Representation progression

The original lazy JS Map/string candidate was roughly 36x slower than the fixed-width loss-anchor control despite searching fewer nodes.

Factoring current/opponent residual antichains into shared side-state handles reduced whole-state duplication while preserving the search tree.

The WSL-625 candidate then replaces each native two-word requirement with a u16 ID from the fixed 625-requirement standard-7x6 universe. After correcting the native 49-bit sentinel-stride transition domain, it again preserves exact scores and the same semantic node counts.

Current WSL-625 hosted-run elapsed ratios:

```text
loss anchor: 11.21x baseline
win anchor:  15.41x baseline
```

These are research implementation measurements, not production forecasts.

## Coordinate-boundary defect retained

The first WSL-625 implementation incorrectly bounded the residual remove table by 42 playable cells rather than the native solver's 49-bit sentinel-stride coordinate space. It returned 0 instead of -4 on `663152175`.

Repair and regression guard:

```text
af ac9edc771f54ee976fe3bc359185878849e451  (without space: afac9edc...)
9fda600ecd5ca6be2b43409a73ce1dd1d3e4940c
```

The corrected table covers bit indices 0..48; playable cells reach bit 47. The qualified two-anchor run is `34572527527`, job `103177554442`.

## Current bottleneck

Requirement payload width is no longer the main cost. The implementation still relies on JS `Map` / BigInt machinery for millions of identities:

- side-state exact interning;
- mover transition cache;
- blocker transition cache;
- whole-state exact interning via BigInt tuple key.

On the win anchor the WSL candidate reaches approximately:

```text
side states:                2,028,848
whole states:               2,198,870
mover cache entries:        2,687,446
blocker cache entries:      2,898,179
prepare calls:             14,441,869
stored u16 requirement IDs:18,574,406
```

The transition caches clearly provide substantial reuse, but their generic JS map representation is now the primary optimization target.

## Current engineering seam

Replace JS identity/storage machinery with exact typed structures while keeping semantics and search policy unchanged:

1. open-address exact side-state interning over the u16 requirement pool;
2. open-address exact `(height,currentRef,opponentRef)` whole-state interning with no BigInt key;
3. typed sparse exact `(sideRef,cell)` mover/blocker transition caches;
4. full-record equality after hash match—never fingerprint-only semantic identity.

First acceptance gate:

```text
loss score/nodes = -4 / 786,581
win score/nodes  = +3 / 4,138,812
```

Only after semantic/search parity should wall time and memory decide whether to continue optimizing this representation.

## Correctness obligations retained

- exact distance-sensitive scores and action values remain authoritative;
- raw optimized board negamax entry requires its no-current-immediate-win precondition to be discharged at the public/task boundary;
- false TT misses are acceptable, false hits are not;
- experimental shared multiwriter publication is not needed for current serial MQ5 work;
- benchmark and oracle semantics remain Connect4-owned;
- equal-total-memory comparison is still required before any final solver-performance promotion.
