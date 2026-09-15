# Canonical win-set / selection claims — C4-R0047..C4-R0056

This human-readable shard separates terminal-line output semantics from structural invariants. **Do not use the token `28` without naming the object.**

## C4-R0047 — exact set-valued perfect-play output algebra
For W/D/L-only perfection, `G(s)` is the set of P0 terminal winning-line identities possible on perfect continuations. P0 nodes union child sets; a P1 node is empty if any legal child is empty, otherwise it unions all child sets. `G(s)!=empty` is exactly P0-winning W/D/L value.

## C4-R0048 — W/D/L-only standard output: 61
The preserved coarse oracle experiment reports 61 terminal-line identities when all equally losing P1 replies tie. This is a **union over W/D/L-perfect trajectories**, not a per-variation count and not the distance-optimal answer. The raw run artifact is not normalized, so retain this as scoped historical empirical evidence.

## C4-R0049 — distance-sensitive standard output: exactly 28
Issue #41 supplies the qualified strong-solve result: 28 distinct P0 terminal line identities, all on ply 41, with 12 vertical + 8 horizontal + 8 diagonal. Matching structural upper bound and one legal optimal witness for each line close the census for this best-move criterion.

## C4-R0050 — structural common-core 28
Independently of solved play, the total-domain GF(2) line/cell incidence, axis quotient and gravity-oriented phase quotient derive `Y_cell=Y_line=28` on 7x6. This is a dimension, not a terminal-line census.

## C4-R0051 — maximal-delay extremal 28
P0's latest parity-compatible 7x6 terminal capacity is ply 41, which yields a 38-line top-two-row support envelope. At rank 5, no legal prefix can exclude more than 10 of those candidates; the unique maximizer is the five-high center stack, leaving 28. This is exact geometry/support, but it does not prove optimal play selects that prefix or horizon.

## C4-R0052 — missing semantic selection theorem
The remaining bridge is game-semantic: derive that distance-optimal play selects the unique center/maximum-impact/phase-center event, preserves the canonical center stack, and realizes longest resistance at the maximal-delay boundary. Deadline-valued CPC/NDC is the current candidate mechanism.

## C4-R0053 — why 7x6 is structurally exceptional
Core balance plus a unique maximum-impact initially legal event isolates `W=7,H=6` in the regular K=4 family. The common dimension 28 follows after the board shape is derived.

## C4-R0054 — 6x7 = 30 means support upper bound, not proven exact census
Given the cited strong terminal move 41, gravity yields `U_support(6,7,41)=30`. The current packet has no matching lower-bound witness set for all 30, so the correct status is **upper bound pending exact census**. This is a different object from `Y_cell=28` and `Y_line=29` on 6x7.

## C4-R0055 — simple scalar envelope/core equality is not the selector
`8x7` also satisfies `46-6=40=Y_cell`. Therefore that scalar equality cannot characterize the standard optimal terminal geometry. The missing rule must carry timing/control relations, not only cardinality.

## C4-R0056 — the two standard 28s are not the same vector space
The oracle 28-line coordinate set has incidence rank 26 and decomposes as `2 line-core + 20 cell-core + 6 axis-boundary` dimensions. Its line-core overlap with the structural `Y_line` is only dimension 2. Equal cardinality is real and interesting, but not identity.

## Object glossary

Use these names explicitly:

- `Lambda`: all geometric winning lines (69 on 7x6).
- `G_WDL(root)`: W/D/L-perfect P0 terminal-line support (reported 61 on 7x6).
- `G_strong(root)`: distance-sensitive best-move P0 terminal-line support (exactly 28 on 7x6).
- `Y_cell`, `Y_line`: structural quotient/core dimensions (both 28 on 7x6; 28 and 29 on 6x7).
- `E_max`: maximal-delay gravity support envelope (38 for 7x6 P0, 30 for 6x7 P0 under the cited terminal horizon).
- `E_rank5_min`: minimum surviving maximal-delay envelope after any legal rank-5 prefix (28 on 7x6, uniquely center; 25 on 6x7 in the finite audit).

These objects may share a number without being equivalent.
