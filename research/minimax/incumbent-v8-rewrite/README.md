# Incumbent V8 rewrite — historical minimax candidate

**Original branch:** `feature/shared-evaluator-v1`  
**Original head:** `77c5c0da57ddb65cd7aff9ce131481a19414931a`  
**Original PR:** #5  
**Disposition:** `historical_only` / exact comparison candidate, not current maintained incumbent.

This packet was migrated during the repository restructure after a completeness audit found that the old branch contained a distinct executable minimax/alpha-beta implementation that had not been placed in the consolidated minimax working tree.

The packet preserves the exact original source/test/evidence blobs without reviving the old branch layout or treating its historical specs as current authority.

## What this candidate was

The branch rewrote the incumbent Connect4 evaluator/search specifically for Node/V8 around primitive fixed-width state and typed transposition storage. Its stated qualification included large evaluator differentials, frozen fixed-depth/search/self-play vectors, persistent cross-root ordering behavior, and hot-path source restrictions. It was a competing/earlier implementation line, not the later September 8–9 exact-solver research kernel.

## Preserved content

- `src/` — exact `components/incumbent-v8` implementation blobs.
- `test/` — exact evaluator/search/hot-path regression tests.
- `evidence/` — frozen evaluator/search/self-play regression vectors; gzip files are preserved byte-for-byte by Git blob identity.
- `historical/` — the branch's research note and candidate C4-0002/C4-0003 specifications, retained as historical evidence only.
- `manifest.json` — exact source branch/commit/blob identities.

## Authority boundary

Current accepted/product incumbent semantics remain owned by the accepted C4-0002/C4-0003 line on `main`, and the consolidated minimax research branch remains the authority for later exact-search experiments. Files in this packet must not be imported as current specs merely because their original names begin with `C4-`.

The purpose of this packet is completeness: future minimax comparisons can still execute or inspect this V8 candidate without keeping `feature/shared-evaluator-v1` alive as a branch.
