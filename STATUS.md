# Connect4 Status

**Updated:** 2026-09-07
**Phase:** incumbent Node/V8 rewrite qualification

## Product role

Connect4 is an independent Node benchmark/validation product. It owns Connect Four domain/evaluator/benchmark meaning and consumes generic CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS contracts only through public surfaces.

It is not a CUDA-family semantic library and does not own generic search/runtime/Tensor mechanisms.

## Current integration candidate

The candidate adds two accepted compatibility specifications above C4-0001:

- **C4-0002** freezes the actual optimized 2025 custom evaluator behavior, including adjustable-board parity semantics, live-line positional investment, root-side weighting, depth scaling, and the current packed tactical score behavior;
- **C4-0003** defines the low-overhead Node/V8 incumbent search with primitive value state, no board apply/undo mutation, no per-node result objects/arrays/closures, and a typed persistent TT.

The first fast position profile is adjustable by `columns x rows` and uses two `uint32` lanes up to 64 cells. The 64-cell bound is an implementation profile, not a redefinition of adjustable-board product semantics.

## Legacy source material and regression truth

Owner-supplied `Connect4.zip` SHA-256:

`3dee57256552c2a0c8104cdc76c6b103e7de4a2bc69332a6723d4a5d1e543f20`

The archive contains the incumbent alpha-beta/transposition search, adjustable `virtualBoard`, deterministic Zobrist identity and custom threat/parity evaluator. It remains evidence/provenance rather than specification authority.

The previous extraction note's immediate-threat divergence is now classified more carefully: it is an **observed optimized scoring quirk, not a demonstrated gameplay defect**. The unusual parity relation is intentionally coupled to evaluation-before-recursive-move timing and is preserved exactly in C4-0002.

Durable archive-derived regression fixtures include:

- 400 evaluator positions across 4x4, 5x4, 6x5, 7x6 and 8x7;
- adjustable-board fixed-depth search vectors;
- complete legacy 7x6 self-play move+score traces for depths 4 through 8.

## Qualification result before protected integration

Local differential work demonstrated:

- more than 462,000 player-position evaluator score comparisons matched the optimized `virtualBoard.score()` exactly across five board sizes;
- compatibility-mode fixed-depth search reproduces legacy move and score vectors;
- standard 7x6 compatibility mode reproduces complete legacy self-play traces depth 4 through 8;
- retained TT best-move ordering participates across roots while numeric bounds remain restricted to the same root player/root ply/sufficient depth;
- hot-path source rejects high-level collection/transformation helpers such as `map`, `filter`, `reduce`, `sort`, `Map`, `Set`, JSON transforms, board copies and apply/undo mutation.

Local Node 22.16.0 timing showed roughly 1.9x-3.8x lower wall time than an archive-derived Node control on the exact-compatible depth 4-8 self-play traces. **This is diagnostic only**, not qualified Node 26.7.0 performance evidence.

## Persistent TT ownership

TT persistence is intentional: after a move, the next root is a descendant of the prior search tree.

The legacy worker retained the table but gated `bestMove` use behind the same remaining-depth test as numeric bounds, preventing most next-turn ordering reuse at constant depth. C4-0003 separates:

- exact-board retained move -> reusable ordering hint;
- numeric bound -> same root player + same root ply + sufficient remaining depth only.

This preserves the intended search memory without moving the goalpost to TT deletion or accepting stale root-relative values.

## Next executable seam

1. qualify the candidate on repository CI at exact Node 26.7.0;
2. review and protect the incumbent rewrite;
3. define the Node-local benchmark protocol and exact host timing evidence;
4. add a solved Connect Four oracle/position suite to measure game-theoretic strength and identify the depth/profile at which play becomes perfect;
5. evaluate any semantic evaluator revisions only as new profiles against the frozen legacy-current baseline;
6. add the CUDA-MCGS lane only after explicit owner resumption and public dependency readiness.

CUDA-MCGS #124 remains paused. This work does not resume it.

## Repository governance

Live repository controls still do not match the selected CUDA-family baseline: `main` remains unprotected and repository-admin settings require the separate governance issue. Do not claim governance parity before live readback proves it.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four engine exists here yet;
- no Node 26.7.0 qualified performance number exists yet;
- no claim is made that depth 12 or lower is perfect play;
- the optimized persistent-ordering lane is not promoted as stronger until solved-position evidence exists;
- no Python or cross-language comparison is in scope for the first benchmark gate.
