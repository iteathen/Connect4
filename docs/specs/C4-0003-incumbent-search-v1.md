# C4-0003 — Incumbent Node alpha-beta search v1

**Status:** accepted incumbent-compatibility specification

## Purpose

Define the strong low-allocation Node/V8 incumbent search used as the CPU control for the Connect4 benchmark. This specification owns Connect4's product-specific incumbent only. It does not define generic CUDA-MCGS search semantics.

## Search model

The search is explicit-root-player minimax with alpha-beta pruning. It is not negamax because C4-0002 defines asymmetric root-relative utility.

At each node, in order:

1. detect an already terminal board;
2. at the fixed horizon, evaluate with C4-0002;
3. probe transposition state;
4. detect a current-player immediate win;
5. detect opponent immediate winning columns;
6. if the opponent has more than one immediate winning column, return the forced-loss shortcut;
7. if the opponent has exactly one, restrict recursion to that block;
8. otherwise recurse in ordered legal moves.

Terminal depth preference preserves the legacy behavior: quicker wins rank higher and unavoidable losses can be postponed. Internally the incumbent uses node-distance-normalized mate scores so transposition entries remain valid when the same position is reached at another root ply; the external fixed-depth score must still match the legacy numeric contract.

## Search modes

### Fixed-depth compatibility

`searchFixedDepth` performs one search at the requested depth. With `orderingPolicy: "legacy-qualified"`, inherited TT best moves are used for ordering only when the corresponding score entry is deep enough, matching the historical worker's qualification rule. Frozen search vectors and historical self-play use this lane as an integration oracle.

### Production incumbent

`search` performs iterative deepening through the requested maximum depth and defaults to `orderingPolicy: "persistent-best-move"`. It may use a shallower or opposite-root-perspective inherited best move for **ordering only** even when the corresponding score is not reusable.

Ordering changes may change tie-selected moves without changing a minimax score. Such changes are an explicit production optimization and are not silently folded into the compatibility oracle.

## Persistent transposition memory

The TT intentionally survives ordinary root moves and search requests. Rerooting moves into a subtree that was already explored; clearing that memory would discard useful work.

The v1 TT is fixed-size, preallocated and two-way bucketed. It stores primitive typed-array fields and performs no object allocation per node.

### Position identity

A table position is scoped to one engine/profile instance and is keyed by:

- two independent 32-bit deterministic Zobrist components;
- side to move.

Board dimensions/profile and frozen evaluator/search settings are engine-instance identity and cannot share a table accidentally.

### Perspective identity

Because utility is root-relative and asymmetric, each position has separate score/bound banks for root player 0 and root player 1.

An entry from the opposite root perspective is never used as a score or alpha/beta bound. Its stored best move may be used for ordering under the production policy.

### Depth identity

Stored depth is remaining searched depth from the tabled node. A score/bound is reusable only when stored remaining depth is at least the new request's remaining depth.

A shallower entry remains useful for move ordering while its score is rejected.

### Bound identity

Entries carry exact, lower or upper bound classification. Only a same-perspective, depth-sufficient entry may:

- return an exact score;
- raise alpha from a lower bound;
- lower beta from an upper bound;
- cause a bound cutoff.

### Reroot-safe terminal scores

Mate-like terminal scores are normalized relative to the tabled node on storage and restored for the probing ply. This prevents a root-ply distance embedded in an inherited score from corrupting faster-win/later-loss preference after reroot.

### Generations

A generation marks a top-level search request. Generation is a replacement/measurement fact, not a semantic validity requirement. Cross-generation reuse is expected and measured.

Replacement prefers an empty way, then an older generation, then the shallower resident position. Deeper score entries are not overwritten by shallower scores merely because the latter are newer; a missing best move may still be populated.

### Explicit benchmark isolation

`resetSearchMemory()` exists for isolated benchmark experiments and conformance setup. It is **not** normal production move policy.

## Move ordering

Base ordering is deterministic center-out by column. A qualified TT move, or under production policy a safe ordering-only inherited move, is tried before the remaining center-out columns.

No strings, JSON, sorting objects, closures, board clones or node objects occur in the hot recursive path.

## Required metrics

Each search reports at least:

- nodes and evaluator calls;
- tactical immediate-win, forced-block and double-threat-loss counts;
- alpha-beta cutoffs;
- TT probes and position hits;
- exact/lower/upper score-hit classes;
- exact returns and bound cutoffs;
- insufficient-depth hits;
- shallow and cross-perspective ordering reuse;
- cross-generation position, score and ordering reuse;
- stores and replacements;
- reached depth.

These metrics are observational and must not alter move/score decisions.

## Conformance authority

- `reference/conformance/search-v1.json` freezes exact fixed-depth move/score decisions from the supplied worker across tactical and adjustable-board cases.
- `reference/conformance/legacy-selfplay-v1.json` freezes complete historical self-play move sequences for depths 3 through 12.

A later CUDA-MCGS lane must not be introduced as an architecture-isolation benchmark until it matches the accepted evaluator workload and benchmark protocol. CUDA-MCGS issue #124 remains separately paused.
