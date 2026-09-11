# Rejected BSFP streaming incremental dominance reducer

**Date:** 2026-09-10  
**Status:** rejected performance candidate; retained as evidence, not production direction.

## Candidate

Commit `307e2ab8222c5e3669f66381bd7e9368aa920213` replaced the rolling ownership-antichain solver's ordered unique/popcount/sort normalization with an online incremental dominance reducer. Each incoming minimal/maximal generator was compared against the live frontier, immediately dropped if dominated, or used to remove retained generators it dominated. Pair-intersection candidates were still generated in bounded tiles.

The candidate preserved exact BSFP semantics. Repository verification passed, and 5x4/5x5 produced exactly the same root W/D/L, total Win/Loss boundary counts, and maximum frontier widths as the retained reference.

## Performance result

GitHub Actions scaling run `34452165316`:

- 5x4 c4: 1.518 s wall, 108,266 boundary records, ~94 MiB max RSS. This was roughly equal to the retained 1.531 s baseline and slightly faster than the first rolling implementation's 1.678 s.
- 5x5 c4: **73.806 s wall**, 1,044,159 boundary records, ~165 MiB max RSS.

Comparisons:

- retained ordered reference 5x5: 58.326 s;
- rolling ordered/tiled 5x5: 62.486 s;
- rolling streaming incremental 5x5: **73.806 s**.

The no-sort incremental reducer therefore regressed 5x5 by about 18% versus the first rolling implementation and about 27% versus the retained reference.

## Interpretation

The candidate removed large sort inputs but exposed too many pairwise subset tests when candidates arrived in unfavorable order. The problem is not merely the cost of sorting. The 5x5 rolling workload already generated approximately **81.5 million pair candidates**. At that volume, JavaScript BigInt subset/dominance work is the wrong execution substrate even when transient memory is bounded.

This result strengthens the CUDA direction:

1. keep the rolling two-rank memory architecture and bounded support/candidate sharding;
2. restore the faster ordered reducer for the CPU reference/control;
3. represent 7x6 ownership masks as packed fixed-width machine words (42 bits, naturally two u32 lanes or an exact u64-capable device representation);
4. parallelize candidate generation, dominance marking, survivor compaction, and rank-local frontier production on GPU;
5. use Q1's 95%-of-current-free-VRAM budget to size reusable arenas rather than a monolithic board table.

Do not rediscover the no-sort BigInt incremental reducer as a presumed optimization without materially changing its comparison/indexing strategy.
