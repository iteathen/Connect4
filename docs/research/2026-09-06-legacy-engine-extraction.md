# Legacy Connect Four engine extraction — 2026-09-06

## Source identity

Project-owner supplied archive: `Connect4.zip`

SHA-256: `3dee57256552c2a0c8104cdc76c6b103e7de4a2bc69332a6723d4a5d1e543f20`

The archive is source material and provenance only. It is not copied wholesale into this repository and is not specification authority.

Relevant source hashes:

- `scripts/abpWorker.js` — `c549b065a3ece1a57c5085b3acc2e3e682d16c283ca9cf39b00d409cb81be604`
- `scripts/virtualBoard.js` — `506fa4aa5303c8118ec7a5cb7b1a2bed9115bf008a24c619270a128cc0c6642e`
- `scripts/classDefinitions.js` — `e7b3a2337e1c84cc6da97686ae8a6c1314c383f7327f6d458a6d9a5193070033`

## Reusable material identified

### Incumbent search

`abpWorker.js` contains a real minimax/alpha-beta control rather than a toy opponent:

- default search depth 13 from `globalDefinitions.js`;
- center-first move ordering;
- deterministic transposition keys backed by a Zobrist hash;
- exact/lower/upper transposition-table bounds;
- a 200,000-entry retained table cap;
- immediate-win recognition;
- forced single-block restriction and double-threat loss shortcut;
- depth-dependent terminal/evaluator weighting.

The module-scope TT is intentionally retained across turns. After a played move, the next root lies inside the previously searched subtree, so persistence is a valid search-memory design goal. The legacy depth gate prevented most retained next-root best moves from being used for ordering; C4-0003 separates ordering reuse from numeric-bound reuse rather than deleting persistence.

### Optimized reversible board

`virtualBoard.js` contains useful implementation ideas:

- compact one-dimensional board storage;
- adjustable columns/rows;
- column-height gravity tracking;
- reversible apply/undo;
- last-move-local win checks;
- deterministic generated 64-bit Zobrist values;
- position-to-winning-line indexing;
- incrementally invalidated per-player winnable-line status.

Those mechanisms are source material. C4-0001 owns the standard 7x6 benchmark game contract; later implementation profiles must not silently erase the legacy engine's adjustable-board design.

### Custom evaluator concepts

The archive contains two generations of the custom evaluator. Reusable concepts include:

- positional value from still-winnable four-cell lines;
- immediate threats;
- multiple/fork-like tactical classes;
- parity/zugwang-style threat classification based on gravity and remaining move parity;
- asymmetric root-player/opponent weighting (`evalPlayerScoreRatio = 0.65` in the worker generation);
- depth-dependent score scaling (`depthDependantWeight = 1.01`);
- terminal values at approximately +/-1e13;
- the optimized generation packs tactical classes above positional score bits.

The live-line evaluator is not a conventional center/piece-square table: geometry, connectivity, blocking value and future opportunity emerge from the still-available winning-line solution space.

The parity mechanism also performs domain-specific forward reasoning at the search horizon. The historical source explicitly notes that its apparently unusual parity relation accounts for evaluation happening before the next recursive move is applied.

## Observed evaluator-generation divergence

The older `Board.findZugzweng()` and newer `virtualBoard._computeThreatFlags()` do not classify all legal positions the same way.

A reproduced legal move sequence is:

`[5, 3, 4, 1, 3, 2, 3, 4, 6, 5]`

For player `1`, the older implementation reports one `blockableFork` plus `simpleThreat`. The board has one immediately playable 3+1 winning target at `[0,0]`. The optimized `_computeThreatFlags()` reports its high `hasForkThreat` tier because the same line is revisited through each owned token.

This is an implementation/classification difference, **not a demonstrated gameplay defect**. The repeated traversal materially affects the optimized packed score and can function as horizon tactical weighting. C4-0002 therefore freezes the actual optimized score behavior without requiring the repeated traversal or treating historical variable names as semantic authority.

Similarly, the odd-looking parity relation is intentional and must not be "fixed" by local pattern matching.

## Disposition

1. Preserve the archive/hash as provenance rather than importing UI/audio/graphics/browser structure.
2. Keep domain/game authority independent of the legacy implementation.
3. Freeze the actual optimized evaluator as C4-0002 before semantic cleanup.
4. Remove redundant scans/traversals only under exact score regression evidence.
5. Preserve TT lifetime and fix its reuse semantics rather than deleting it.
6. Use solved Connect Four evidence to judge any later evaluator semantic revision.
7. Require a future CUDA-MCGS lane to match the selected evaluator profile before architecture-isolation performance comparison.

No CUDA-MCGS implementation work is authorized by this extraction note.
