# External full-equivalence oracle selection

Date: 2026-09-30

## Selected oracle

Primary external oracle: Pascal Pons's official exact Connect Four solver:

- repository: https://github.com/PascalPons/connect4
- interactive solver: https://connect4.gamesolver.org/
- CLI analysis mode: `-a`
- API: `Solver::analyze(const Position&, bool weak=false)`

The important property for this research is that `analyze()` returns one exact score per column, using `INVALID_MOVE` only for unplayable columns. The CLI `-a` mode prints all seven per-column scores for each supplied move sequence.

This is preferable to an oracle that exposes only one preferred move or one principal variation.

## Equivalence extraction

Given the full exact score vector `s[1..7]`:

- W/D/L-equivalent moves are grouped by sign of the score.
- Exact-strong-equivalent moves are grouped by identical score.
- Project-acceptable perfect moves are:
  1. all legal moves with positive score, if any;
  2. otherwise all legal moves with zero score, if any;
  3. otherwise all legal moves whose score equals the maximum (least-negative score, i.e. longest delayed forced loss).

Thus solver-internal move ordering or arbitrary representative choice never becomes oracle semantics.

## Example invocation

```sh
echo 44444 | ./connect4 -a
```

The output line begins with the supplied sequence followed by seven column scores. Equal scores are exact-strong equivalent.

## Independence boundary

Pascal Pons's solver is an external exact reference implementation and is used only after structural candidates are frozen. Its values are validation/falsification evidence and may not be used as premises for an independently claimed structural derivation.

The repository-local wrapper `oracle-equivalence-report.mjs` mirrors the same full-vector reporting contract for convenience, but external qualification should use the Pascal Pons implementation or its public interactive solver rather than a single displayed best move.
