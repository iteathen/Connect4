# Incumbent V8 rewrite — historical minimax candidate

**Original branch:** `feature/shared-evaluator-v1`  
**Original head:** `77c5c0da57ddb65cd7aff9ce131481a19414931a`  
**Original PR:** #5  
**Disposition:** `historical_only` / exact comparison candidate, not current maintained incumbent.

This packet was migrated during the repository restructure after a completeness audit found that the old branch contained a distinct executable minimax/alpha-beta implementation that had not been placed in the consolidated minimax working tree.

## Runnable snapshot

`snapshot/` preserves the original internal path relationships needed by the branch's tests:

```text
snapshot/
  components/incumbent-v8/
    *.mjs
    test/*.test.mjs
  reference/
    legacy-evaluator-regression.json
    legacy-search-vectors.json.gz
    legacy-selfplay-vectors.json.gz
```

The files reuse the exact original Git blobs. Nothing was rewritten to make the snapshot run.

From the repository root, the historical tests can be invoked with Node's test runner against:

```text
research/minimax/incumbent-v8-rewrite/snapshot/components/incumbent-v8/test/*.test.mjs
```

The original relative imports are preserved by the snapshot layout. The gzip fixtures are also preserved byte-for-byte by Git blob identity.

## What this candidate was

The branch rewrote the incumbent Connect4 evaluator/search specifically for Node/V8 around primitive fixed-width state and typed transposition storage. Its stated qualification included large evaluator differentials, frozen fixed-depth/search/self-play vectors, persistent cross-root ordering behavior, and hot-path source restrictions. It was a competing/earlier implementation line, not the later September 8–9 exact-solver research kernel.

## Historical documents

`historical/` preserves the branch's research note and its candidate C4-0002/C4-0003 documents. They are intentionally outside live `docs/specs/` so their old filenames cannot be mistaken for current authority.

## Authority boundary

Current accepted/product incumbent semantics remain owned by the accepted C4-0002/C4-0003 line on `main`, and the consolidated minimax research branch remains the authority for later exact-search experiments.

The purpose of this packet is completeness: future minimax comparisons can still execute or inspect this V8 candidate without keeping `feature/shared-evaluator-v1` alive as a working branch.
