# Chunk-map proof-only cleanup smoke test

**Date:** 2026-09-09  
**Status:** positive research evidence; not maintained solver authority

## Purpose

Exercise conservative dependency cleanup through the corrected logical chunk-map indirection, without direct physical aliases or parent-region splitting.

## Sibling dependency families

From root position `41267575`:

- root logical dependency ID: `336394`;
- live family `412675753`: logical ID `336458`, where P0 owns the previously empty bottom cell in column 3;
- incompatible family `4126757563`: logical ID `336522`, where P1 owns that same irreversible cell.

Because Connect Four stones never change owner or become empty, once the live region requires P0 ownership in that cell, the P1-owned sibling is unreachable from the live region.

## Test lifecycle

1. Root and live family map to broad survivor descriptor 0.
2. Incompatible sibling maps to dedicated descriptor 1.
3. Run the incompatible sibling and populate descriptor 1; exact result is score `3` over **1,036,919 nodes**.
4. Let that coarse holder drain.
5. Cleaner compares the sibling's immutable ownership anchor against the live region and proves an opposite-owner contradiction.
6. Mark descriptor 1 `RETIRING`.
7. Directly publish `chunkMap[336522] = descriptor 0`.
8. Mark descriptor 1 `FREE` and recycle its physical region.
9. Verify the live family through descriptor 0: exact score `11`.
10. Artificially retry the retired sibling; it now resolves descriptor 0 and still returns exact score `3` over **1,036,919 nodes**.

The artificial retry is not expected in the actual live search after the impossibility proof; it is a safety check showing the forwarding target remains semantically valid even if a late/coarse request appears.

## Repeat evidence

Three independent repeats produced exactly the same structural results:

- contradiction proof: `true`;
- dead family before cleanup: descriptor 1, score `3`, 1,036,919 nodes;
- map after cleanup: descriptor 0;
- descriptor 1 final state: `FREE`;
- live family: descriptor 0, score `11`, 6,193 nodes;
- artificial dead-family retry: descriptor 0, score `3`, 1,036,919 nodes.

## Conclusion

This validates the intended cleanup path:

```text
logical dependency proof
    -> chunkMap redirect
    -> descriptor RETIRING
    -> coarse-holder grace
    -> descriptor FREE / slabs recycled
```

No entry-by-entry deletion, payload merge, redirect chain, path reference count, or per-node cleanup check is required.

The next integrated prototype should preserve the flat global shared-TT baseline by default: logical IDs share a broad physical descriptor until measured pressure justifies dedicated capacity. Dedicated descriptors are optional resource assignments that the cleaner can later forward/reclaim through the same map.
