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

This is useful as the incumbent Node search baseline after removal of browser Worker/application plumbing.

### Optimized reversible board

`virtualBoard.js` contains useful implementation ideas:

- compact one-dimensional board storage;
- column-height gravity tracking;
- reversible apply/undo;
- last-move-local win checks;
- deterministic generated 64-bit Zobrist values;
- position-to-winning-line indexing;
- incrementally invalidated per-player winnable-line status.

Those mechanisms are source material. The new domain contract is specified independently in C4-0001.

### Custom evaluator concepts

The archive contains two generations of the custom evaluator. Reusable concepts include:

- positional value from still-winnable four-cell lines;
- immediate threats;
- multiple/fork threats;
- parity/zugzwang-style threat classification based on gravity and remaining move parity;
- asymmetric root-player/opponent weighting (`evalPlayerScoreRatio = 0.65` in the worker generation);
- depth-dependent score scaling (`depthDependantWeight = 1.01`);
- terminal values at approximately +/-1e13;
- the optimized generation packs tactical classes above positional score bits.

These concepts are promising, but the implementations are not interchangeable or self-authorizing.

## Confirmed semantic divergence

The older `Board.findZugzwang()` and newer `virtualBoard._computeThreatFlags()` do not classify all legal positions the same way.

A reproduced legal move sequence is:

`[5, 3, 4, 1, 3, 2, 3, 4, 6, 5]`

For player `1`, the older implementation reports one `blockableFork` plus `simpleThreat`. The actual board has one immediate threat line with empty winning cell `[0,0]`:

`[(0,0),(1,0),(2,0),(3,0)]`

The optimized `_computeThreatFlags()` reports `hasForkThreat: true`.

The cause is concrete: `_computeThreatFlags()` iterates each owned token and then each winning line containing that token, but does not deduplicate line indices before incrementing `immediateThreatCount`. A single three-token threat line is therefore visited once per owned token and can be counted multiple times. The `hasForkThreat` label is consequently not a trustworthy semantic oracle by itself.

This does not establish that the incumbent engine is weak or that its resulting ranking should simply be changed. The packed score may have benefited from the effective weighting. It establishes only that optimization labels and older intent have diverged and must be adjudicated deliberately.

## Bootstrap disposition

1. Preserve the archive/hash as provenance rather than importing UI/audio/graphics/browser structure.
2. Keep C4-0001 game semantics independent.
3. Specify evaluator behavior separately from implementation names such as `fork` or `zugzwang`.
4. Build independent evaluator conformance vectors from deliberately chosen legal positions, including ambiguous/multi-line threat cases.
5. Re-express the incumbent minimax control in Node only after the evaluator profile to be benchmarked is explicit.
6. Require the future CUDA-MCGS lane to match the same accepted evaluator vectors before performance/strength comparison.

No CUDA-MCGS implementation work is authorized by this extraction note.
