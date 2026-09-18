# Coarse task dependency-family profile

**Status:** dirty research evidence.

The corrected reassessment profiled dependency identity only at the YBWC worker-task boundary while the physical search remained one flat shared TT. This separates logical task topology from TT-routing effects.

## Bottom-row identity

Representative 4-worker / split-depth-4 profile:

### `663152175`

All ~1.2M worker-task nodes belonged to one bottom-row logical family (`562258`). This explains why the earlier one-32K-chunk-per-family prototype effectively reduced the whole solve to one 32K table.

### `41267575`

Three bottom-row logical families appeared:

- `336394`: ~13.62M task nodes (~72%);
- `336522`: ~5.13M (~27%);
- `336458`: ~40.5K (~0.2%).

This shows why equal child-region sizing was a poor proxy for dynamic resource assignment.

## Two-row nested identity

### `663152175`

11 two-row child identities were observed. Work was highly concentrated:

1. `668757`: 44.6%
2. `668885`: 22.2%
3. `668781`: 13.1%
4. `1455189`: 9.6%
5. `670293`: 7.2%

Top 5: **96.7%** of task-node work.

### `41267575`

47 two-row child identities were observed. The distribution again had a heavy head and long tail; the top 13 accounted for about **95%** of task-node work.

This supports **selective nested promotion** rather than eagerly allocating equal physical capacity to every logical child.

The fair negative `coarse_nested32_bench.mjs` then showed that even the hot children generally need more than one 32K slab. Therefore the surviving interpretation is:

> nested canonical logical identity is useful; 32K is an allocation granule/locality unit; logical-node capacity must remain dynamic.