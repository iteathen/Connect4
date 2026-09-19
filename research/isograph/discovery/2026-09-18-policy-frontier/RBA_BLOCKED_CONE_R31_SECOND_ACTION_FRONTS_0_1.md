# RBA blocked-cone resumable cache checkpoint — rank31 second support action fronts

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe sub-support checkpoint  
**Authority effect:** none

## Support in progress

```text
support [4,3,3,3,6,6,6]
rank 31
```

The previous runner lost action-preimage work whenever a Lower product timed out. The durable runner was corrected before this run to persist:

- every fixed-action Upper/Lower front;
- normalized state Upper;
- every completed Lower product intermediate.

The correction is committed in `rba-draw-boundary-runner.mjs`.

## Exact persisted action fronts

| column | Upper | Lower | Upper SHA-256 | Lower SHA-256 |
|---:|---:|---:|---|---|
| 0 | 6,002 | 6,808 | 0e97a3138de431c0bde3ff6bd2bccc61d965607492bb5d6080b580a34d127236 | e40d4c9ae0091caf24545237df502268d113832adbd0b630983fa6d50c0caf20 |
| 1 | 1,650 | 4,576 | 7af20909c6b2a5dbb86a1980c8802fd063d6cc8396065f4a37a7ee292cb06823 | 4bb4e8e0c0ba2bb961ed48fda2cbaf0ba45983c8693855d3e12bd50616916258 |
| 2 | 1,803 | 2,738 | d5216d895e666255ccf96b300aaea7fdb1d17c44a7c27a9e44d0fc55764d9949 | 1dded567712887b10dd71cc7f7ddef0bd57d62f500feaad486791ca12087e277 |
| 3 | 2,916 | 4,390 | 3c17696e1a24167f193fbea1d4bdfb824c4c7e4ca0ff270ad3a6f760de88e033 | 7bd681f90c054991bdd644198bf5897ec546aa44cc9f1a37813bb424eac4e606 |

Normalized state Upper:

```text
Upper = 11,097
SHA-256
02e78e775c453192b7be4ecb45f98202a251fd09c19e5d6e3e696954b921b115
```

## Current exact wall

The first Lower product is now isolated without any need to recompute preimages:

```text
6,808 x 4,576
= 31,151,? implicit pairs
```

The bounded support run timed out inside this product before an exact product stream was persisted. No Lower/support result is claimed.

## Recovery archive

```text
rba-block-cache-r31-second-actions.tar.gz
SHA-256
58842e5df1b29d42eb8e076661bfb37089dfea1e55e74c9a55b0ee950d97d7a0
size ~1.8 MiB
```

## Next

Work only on the exact persisted `6,808 x 4,576` product.

Use this product as the first real Connect4 qualification target for the vertical superset-union trace evaluator. Compare exact output against an independently exact product route when one closes. Persist candidate/product progress before returning to the support recurrence.
