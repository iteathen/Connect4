# Branch retirement ledger

This file is the human-readable companion to `MIGRATION_MANIFEST.json` and `RETIREMENT_PROOFS.json`.

`MIGRATION_MANIFEST.json` is the frozen pre-restructure census. `RETIREMENT_PROOFS.json` records post-migration ancestry/content checks and should be used before physical cleanup.

## Keep as durable lanes

- `main`
- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `research/semantic-quotient`

Short-lived restructuring/work branches should disappear after integration once the ref-management surface permits it.

## Verified retirement-safe refs

These heads are now preserved by canonical ancestry or exact duplication. Their live branch names are no longer needed for information preservation.

### Minimax history

- `research/exact-solver-perf-checkpoint-2026-09-08`
- `research/exact-solver-rethink-controls-2026-09-09`
- `research/forced-macro-implication-2026-09-09`
- `research/minimax-structural-cut-20260909`
- `research/residual-automorphisms-2026-09-09`

### Shared semantic / searchless / OQS history

- `research/zdd-transfer-20260910`
- `research/low-confidence-survival-2026-09-09` — its unique post-minimax history was preserved as a history-only parent of `research/semantic-quotient`; its old minimax working tree was intentionally not imported.
- `research/direct-line-product-bsfp-20260910` — exact unique solver/qualifier blobs were restored at their historical paths and the old head is now a merge parent of `research/semantic-quotient`.
- `research/live-q1-5min-20260910` — only unique content was a one-shot workflow; its sole run (`34518477566`) remained queued and produced no durable measurement. The attempt commit is now preserved as semantic-lane history.
- `research/identified-winline-quotient-test`
- `research/identified-winline-quotient-test-2`
- `research/identified-winline-quotient-test-3`
- `research/identified-winline-quotient-test-4`
- `research/winline-cone-image`
- `research/winline-product-antichain`
- `research/winline-product-antichain-run`
- `research/winline-product-dominance`
- `research/winline-product-dominance-v2`

The `-2/-3/-4` identified-winline refs share one exact SHA. The cone/product/dominance group shares another exact SHA. Both heads are confirmed ancestors of the canonical semantic branch.

### Renamed / exact duplicate refs

- `feature/cuda-bsfp` — superseded by `solver/cuda-bsfp`, created from the exact old head; PR #14 was closed as superseded by canonical draft PR #25.
- `research/winline-product-antichain-final` — exact old CUDA-BSFP head.
- `noop` — exact pre-restructure `main` head.

## Still requires unique-content audit

Do not delete these merely because they are old. Their heads are SHA-frozen but their divergent history still needs explicit disposition:

- `feature/incumbent-node-search`
- `feature/shared-evaluator-v1`
- `feature/solved-strength-oracle`
- `feature/cuda-mcgs-composition-assessment`
- `agent/benchmark-bootstrap`
- `docs/execution-efficiency-mutation-hygiene`
- `docs/global-agent-local-migration`
- `tmp-do-not-use-c4diag`

## Evidence refs

The `evidence/cuda-bsfp-q1/*` refs are append-only evidence snapshots. Do not retire them until payload hashes, evidence PRs and any external references are verified. They are not active development lanes, but evidence preservation has a higher bar than ordinary branch cleanup.

## Physical cleanup rule

A live ref may be removed only when:

1. its exact head SHA is frozen in the migration census;
2. `RETIREMENT_PROOFS.json` or an equivalent audit proves canonical ancestry/duplication, or all unique durable content is migrated;
3. no open PR/workflow/external process still depends on the branch name;
4. post-delete branch inventory is verified.

The current connector cannot delete branches or create tags. Therefore the repository has been logically restructured and refs classified, but physical stale-ref deletion is not claimed.
