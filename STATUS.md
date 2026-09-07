# Connect4 Status

**Updated:** 2026-09-06
**Phase:** benchmark bootstrap / evaluator-semantic extraction

## Product role

Connect4 is an independent Node benchmark/validation product. It owns Connect Four domain/evaluator/benchmark meaning and consumes generic CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS contracts only through public surfaces.

It is not a CUDA-family semantic library and does not own generic search/runtime/Tensor mechanisms.

## Current integration candidate

The bootstrap candidate establishes:

- C4-0001 standard 7x6 Connect Four domain semantics;
- a clean Node reference domain with reversible play/undo and all 69 winning lines;
- tests for gravity, legality, horizontal/vertical/diagonal wins, full-column rejection and exact undo restoration;
- legacy archive provenance without importing UI/assets/browser application structure;
- an explicit evaluator-semantic extraction gate after confirming that two legacy evaluator generations diverge.

No incumbent minimax port, CUDA-MCGS lane, benchmark timing, performance result or strength claim exists yet.

## Legacy source material

Owner-supplied `Connect4.zip` SHA-256:

`3dee57256552c2a0c8104cdc76c6b103e7de4a2bc69332a6723d4a5d1e543f20`

The archive contains useful alpha-beta/transposition search, reversible-board, Zobrist and custom threat/parity evaluation ideas. It is evidence/provenance, not the target repository structure or evaluator oracle.

A confirmed divergence in the optimized threat counter prevents either legacy evaluator implementation from silently becoming normative. See `docs/research/2026-09-06-legacy-engine-extraction.md`.

## Next executable seam

Define and qualify the shared evaluator profile before porting the incumbent minimax control or implementing a CUDA-MCGS comparison lane.

The evaluator work must:

1. separate semantic classes from incidental legacy names/bit packing;
2. decide which incumbent ranking behavior is intentionally retained;
3. freeze independent legal-position conformance vectors, including immediate threats, shared-cell multi-line threats, true distinct winning moves, parity threats and terminal positions;
4. provide a deterministic host reference;
5. make any later Device-JS realization match those vectors before benchmark timing.

CUDA-MCGS #124 remains paused under its existing owner instruction. This repository bootstrap does not resume it.

## Repository governance

The repository now has a `main` branch only because the bootstrap seed commit was required to initialize the previously empty repository. Live settings still do not match the selected CUDA-family baseline: merge commits remain enabled and auto-merge/update-branch remain disabled. Main protection must be read back after repository-admin alignment; do not claim parity before that evidence exists.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four engine exists here yet;
- no benchmark result exists yet;
- no evaluator generation from the legacy archive is accepted as normative merely because it is newer;
- no Python or cross-language comparison is in scope for the first benchmark gate.
