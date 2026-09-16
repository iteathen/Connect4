# Logical chunk-map indirection smoke test

**Date:** 2026-09-09  
**Status:** positive research evidence; not maintained solver authority

## Purpose

After the shared-dependency dead ends, test the corrected separation with the smallest possible change:

```text
canonical dependency identity
    -> logical chunk ID
    -> shared chunkMap[logical ID]
    -> physical descriptor ID
    -> full flat shared TT
```

For this smoke test, every logical ID intentionally maps to descriptor `0`, and descriptor `0` owns the entire physical shared TT. There is no cleanup, forwarding, or physical partitioning yet. The goal is to isolate chunk-map indirection cost and semantic correctness while preserving the already-successful flat shared-TT geometry.

## Map read rule

The final smoke-test form uses an ordinary 32-bit shared typed-array read for an already-published chunk-map entry. CAS is used only to install a previously unseen logical ID.

This is deliberate: during future forwarding, seeing either the old or new descriptor is safe because the old descriptor remains valid through the coarse retirement grace period. An atomic read on every dependency transition is therefore unnecessary synchronization.

## Four-worker comparison

Same lazy YBWC shell, split depth 4, lane cap 2.

### `663152175`, 256K TT

The position has no bottom-row dependency transition under this projection. Each coarse worker task resolves the same logical ID once. Representative medians across forward/reverse ordering batches were in the same ~0.12-0.13 s class with ~1.14-1.15M nodes for both flat and chunk-map modes. Exact score was `-4` throughout.

### `41267575`, 512K TT

The chunk-map mode performed about **280K-287K logical map resolutions/dependency transitions** per run while preserving the same ~10.8-10.9M node search-tree class as the flat shared table. Four-worker wall-time batches were noisy (~1.0-1.3 s class, with occasional scheduler outliers), so they are useful only as confirmation that the map did not recreate the severe dead-end regressions.

## Deterministic single-worker isolation

To remove parallel scheduling/write-race variance, both modes were rerun with one worker and split depth 0.

### `663152175`, 256K

Both flat shared and chunk-map modes produced exactly:

- score: `-4`;
- nodes: **1,051,323**;
- TT hits: **181,534**;
- TT writes: **604,651**.

Chunk-map mode additionally performed:

- map resolves: **10**;
- dependency transitions: **5**;
- logical IDs installed: **2**.

### `41267575`, 512K

Both modes produced exactly:

- score: `3`;
- nodes: **5,945,560**;
- TT hits: **1,119,606**;
- TT writes: **3,383,162**.

Chunk-map mode additionally performed:

- map resolves: **234,170**;
- dependency transitions: **234,164**;
- logical IDs installed: **3**.

No node-count or TT-hit divergence occurred. Median timing in this sandbox was ~1.294 s for flat and ~1.175 s for chunk-map in that batch; the sign of that difference should not be interpreted as a speedup. The important evidence is that hundreds of thousands of map resolutions did not create a measurable structural regression and produced exactly the same search work.

## Conclusion

The corrected indirection is viable:

> stable logical dependency IDs can resolve through a shared chunk map to a physical descriptor without forcing physical TT partitioning or changing the exact search tree.

This validates the separation needed for cleanup/dedupe forwarding. The next experiment should mutate `chunkMap[logicalId]` from one physical descriptor to a survivor descriptor at a coarse boundary, keep the losing descriptor valid through a grace period, then recycle it. No redirect chain or per-node map polling is needed.
