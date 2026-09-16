# C4-0003 — Incumbent Node/V8 search v1

**Status:** accepted pre-benchmark implementation specification

## Purpose

Define the optimized Node/V8 incumbent search lane that retains the legacy-current evaluator semantics while removing browser plumbing, high-level hot-path transformations, mutable board/undo state, and ineffective transposition-table reuse.

This is a Connect4 product implementation, not generic search semantics and not CUDA-MCGS authority.

## Position profile

The first fast profile compiles adjustable `columns x rows` geometry into two unsigned 32-bit lanes and admits up to 64 cells.

Search state is carried as primitive player bit lanes plus ply. Child positions are derived from parent primitive values; search does not mutate a board object and does not require undo.

Cold-path geometry compilation may allocate tables. Active search/evaluation must not transform the position into a second representation.

## Legacy-compatible fixed-depth search

The compatibility lane preserves:

- root-relative minimax/alpha-beta;
- center-first baseline move order;
- immediate current-player win shortcut;
- opponent double-immediate-threat forced-loss shortcut;
- opponent single-immediate-threat forced-block restriction;
- exact/lower/upper transposition bounds;
- C4-0002 root utility and depth scaling.

With cross-root retained ordering disabled, the maintained implementation must reproduce the frozen legacy move and score traces.

## Persistent transposition-table semantics

The table intentionally survives across move searches because the next game position is a descendant of the previously searched subtree.

Persistence has two distinct semantic classes:

### Ordering memory

A retained `bestMove` from an exact matching board identity may be used as a move-ordering hint even when its numeric value cannot be reused. This is safe because ordering changes pruning efficiency/tie presentation but is not accepted as a bound by itself.

The optimized lane enables this retained ordering across roots.

### Numeric value/bound memory

A stored score/bound is root-relative and depth-scale-relative. It is therefore reusable only when all of the following match:

- exact board identity;
- root player;
- root ply (search origin);
- stored remaining depth is at least the requested remaining depth.

A table entry that fails these value conditions may still contribute its retained move for ordering.

This split fixes the legacy implementation's ineffective next-turn reuse without silently applying stale root-relative values.

## TT representation

The v1 table is preallocated typed storage with exact board-lane key verification. Each entry stores:

- player-0 low/high lanes;
- player-1 low/high lanes;
- remaining depth;
- score;
- exact/lower/upper flag;
- best move;
- root player;
- root ply;
- generation.

Cache mutation is an explicitly owned performance resource and is not game-state mutation.

## Hot-path restrictions

Evaluator/search/TT hot paths must avoid representation churn and general collection helpers. In particular, the maintained v1 source does not use `map`, `filter`, `reduce`, `sort`, `push`, `pop`, JSON transforms, `Map`, `Set`, cloning, board copies, or apply/undo mutation during search.

Per-node result arrays/objects and per-node closures are prohibited. Recursive nodes return a numeric score; node-local best-move state is stored directly into the TT and the root move is retained as one search-local scalar.

## Evidence separation

- **compatibility mode:** historical move/score reproduction; no claim that every historical search choice is game-theoretically perfect;
- **optimized persistent-ordering mode:** search optimization candidate; may change tie/order-dependent behavior and requires solved-position/strength evidence before promotion;
- **performance:** exact runtime/host evidence required; local development measurements are diagnostic only.
