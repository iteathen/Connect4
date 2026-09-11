# Branch retirement ledger

This file is the human-readable companion to `MIGRATION_MANIFEST.json`.

## Keep as durable lanes

- `main`
- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `research/semantic-quotient`

The restructuring branch itself is temporary and should disappear after integration.

## Confirmed safe retirement candidates

These refs are confirmed ancestors or exact duplicates of a canonical lane at the time of the restructure:

### Minimax ancestors

- `research/exact-solver-perf-checkpoint-2026-09-08`
- `research/exact-solver-rethink-controls-2026-09-09`
- `research/forced-macro-implication-2026-09-09`
- `research/minimax-structural-cut-20260909`

### Shared semantic/OQS ancestor

- `research/zdd-transfer-20260910` — confirmed ancestor of `research/semantic-quotient`

### Exact duplicates

- `noop` — exact head match with `main` during the census
- `research/identified-winline-quotient-test-2`, `-3`, `-4` — same SHA
- `research/winline-cone-image`, `research/winline-product-antichain`, `research/winline-product-antichain-run`, `research/winline-product-dominance`, `research/winline-product-dominance-v2` — same SHA
- `research/winline-product-antichain-final` — exact old CUDA-BSFP head

## Renamed/superseded lane

`feature/cuda-bsfp` is superseded by `solver/cuda-bsfp`. The new canonical branch was created from the exact old head and then received lane-routing status updates.

## Retirement pending verification

Do not delete these merely because they look old. Their exact heads are frozen in the manifest and their unique content/ancestry should be checked first:

- `research/low-confidence-survival-2026-09-09`
- `research/residual-automorphisms-2026-09-09`
- `research/direct-line-product-bsfp-20260910`
- `research/live-q1-5min-20260910`
- legacy `feature/*` and `agent/*` branches
- historical `docs/*` work branches
- `tmp-do-not-use-c4diag`

## Evidence refs

The `evidence/cuda-bsfp-q1/*` refs are append-only evidence snapshots. They should be converted to immutable archive/tag/checkpoint form only after payload/hash/PR preservation is verified. They are not active development lanes.

## Deletion rule

A live branch may be removed only when:

1. its exact head SHA is preserved in the migration manifest;
2. it is a confirmed ancestor/duplicate of a canonical lane **or** all unique durable evidence is preserved elsewhere;
3. no open PR/workflow or external process still requires the branch name;
4. cleanup is verified after deletion.

The current connector cannot delete branches or create tags, so this file records intended disposition only. No unperformed deletion is claimed.
