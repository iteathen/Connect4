# BSFP rolling-rank and bounded-candidate execution checkpoint

**Date:** 2026-09-10  
**Status:** active compact-solver scaling work on `feature/cuda-bsfp`.

## Goal

Drive exact empty-board 7x6 connect-4 toward a super-fast CUDA solve without reverting to move-tree search or a monolithic colored-state table.

## Baseline scaling result

The first retained ownership-antichain scaling run was GitHub Actions `34450288860` at source revision `309c4ad52a1cca89564c069f86b5ca902b536116`.

Completed points:

- 5x4 c4: 1.531 s, 108,266 total boundary records, max Win/Loss frontier 284/194, ~100 MiB peak RSS.
- 5x5 c4: 58.326 s, 1,044,159 total boundary records, max Win/Loss frontier 562/568, ~243 MiB peak RSS.

Boundaries:

- 6x5 c4: 600 s timeout; ~887 MiB maximum RSS observed by `/usr/bin/time`.
- 7x5 c4: 600 s timeout; ~875 MiB maximum RSS.
- 7x6 c4: 600 s timeout; ~573 MiB maximum RSS.

The timeout runs did not finish, so their record/frontier totals are unknown. The important diagnosis is that none approached the 4 GiB JavaScript heap cap or host-memory exhaustion. The first scaling wall is therefore compute/frontier-manipulation cost, not retained-memory capacity.

## Execution correction

A root-only rolling executor is now the compact reference execution shape.

For rank `r`, only completed rank `r+1` is semantically required. The executor therefore:

1. retains the completed child rank;
2. produces rank `r` in bounded support shards;
3. reduces pairwise antichain intersections in bounded candidate tiles;
4. replaces the child rank with the completed current rank;
5. discards older ranks immediately.

This preserves exact BSFP semantics but intentionally gives up arbitrary post-solve state lookup. The production target is the empty-board root result, so retaining the complete solved lattice is unnecessary.

The rolling implementation reports total boundary work separately from peak simultaneously resident boundary records. This makes the memory reduction measurable instead of inferred.

## GPU capacity policy

Q1 now targets 95% of currently free VRAM, bounded by a 256 MiB hard floor and the existing absolute cap:

`allowed = min(floor(free * 0.95), free - 256 MiB, absolute cap)`

The 95% value is a reusable-arena capacity ceiling, not a monolithic allocation target. A compact CUDA profile should derive shard width from measured free VRAM, allocate bounded rank/frontier/candidate arenas, and reduce shard width rather than increasing total resident memory when a reservation fails.

## Performance hypothesis

Rolling ranks solve retained-memory growth but cannot by themselves fix the 5x5-to-6x5 runtime bend. The current BigInt/reference algebra repeatedly constructs, deduplicates, sorts and dominance-reduces candidate frontiers. Pairwise intersections are the clearest multiplication point.

The new rolling reference therefore tiles those pair products and records:

- generated pair candidates;
- number and maximum size of candidate tiles;
- normalization-call count;
- maximum normalization input;
- peak rank boundary records;
- peak simultaneously resident boundary records.

These counters are intended to separate irreducible frontier growth from implementation overhead. If frontier widths remain moderate while generated candidate counts explode, the next optimization belongs in packed dominance/reduction and GPU parallelization. If surviving frontier widths themselves explode, WSL/NDC/CPC/symmetry compression becomes necessary before CUDA optimization can make 7x6 fast.
