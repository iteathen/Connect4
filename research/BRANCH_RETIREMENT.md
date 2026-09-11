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

These heads are preserved by canonical ancestry, exact duplication, curated artifact migration, qualification-evidence consolidation, or a history-only archive merge. Their live branch names are no longer required for information preservation.

### Minimax history

- `research/exact-solver-perf-checkpoint-2026-09-08`
- `research/exact-solver-rethink-controls-2026-09-09`
- `research/forced-macro-implication-2026-09-09`
- `research/minimax-structural-cut-20260909`
- `research/residual-automorphisms-2026-09-09`
- `feature/shared-evaluator-v1` — its previously missing Node/V8 candidate is now preserved as a runnable exact-blob snapshot under `research/minimax/incumbent-v8-rewrite/`; PR #5 is closed as superseded and the original branch head is a minimax ancestor.

### Shared semantic / searchless / OQS history

- `research/zdd-transfer-20260910`
- `research/low-confidence-survival-2026-09-09` — unique post-minimax searchless/BSFP history is preserved as semantic-lane ancestry without importing its obsolete working tree.
- `research/direct-line-product-bsfp-20260910` — exact unique solver/qualifier blobs were restored at their historical paths and its history is now an ancestor of the semantic lane.
- `research/live-q1-5min-20260910` — unique content was only a one-shot workflow; its sole run stayed queued and produced no durable measurement, while the commit is preserved as semantic-lane ancestry.
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

### CUDA-BSFP qualification evidence refs

All seven former `evidence/cuda-bsfp-q1/*` branches are now retirement-safe.

Commit `09e3db9631e79a068f658c9c6d91c4002ca7820f` on `solver/cuda-bsfp` has all seven evidence heads as merge parents and attaches each generated run directory by its exact Git tree SHA. Commit `ace8761461e490d01320ee01a2f3dd6b7cfbc049` adds a navigation index; generated run contents are unchanged.

Historical evidence PRs #15–#21 are closed. Their original bodies/conversations remain GitHub history. The canonical evidence paths are now directly under:

`docs/evidence/cuda-bsfp/qualification/`

This includes three failed runs, one `complete-with-boundaries` run, and the qualified B1, C1, and O1 runs. Failures were preserved with the same rigor as passes.

### Renamed / exact duplicate / contained refs

- `feature/cuda-bsfp` — superseded by `solver/cuda-bsfp`, created from the exact old head; PR #14 was closed as superseded by canonical draft PR #25.
- `research/winline-product-antichain-final` — exact old CUDA-BSFP head.
- `tmp-do-not-use-c4diag` — confirmed strict ancestor of the old CUDA-BSFP branch, zero unique commits, 34 commits behind.
- `noop` — exact pre-restructure `main` head.

### Legacy product/bootstrap/docs histories

The following divergent heads are preserved as **additional parents** of history-only archive commit `eeb054873dfb1f0dc69b22ace3d1d5d82539b070` on the retirement-ledger branch. That commit retains the cleaned current tree exactly; no obsolete parent tree is restored.

- `feature/incumbent-node-search` — maintained incumbent source/benchmark/spec/qualification blobs were audited against the product baseline and match the accepted product artifacts.
- `feature/shared-evaluator-v1` — additionally preserved as the runnable minimax packet described above.
- `feature/solved-strength-oracle` — oracle/strength artifacts are represented by the accepted product baseline; historical ancestry is retained here.
- `feature/cuda-mcgs-composition-assessment`
- `agent/benchmark-bootstrap`
- `docs/execution-efficiency-mutation-hygiene`
- `docs/global-agent-local-migration`
- `tmp-do-not-use-c4diag`

After this restructure branch is integrated to `main`, those live branch names are retirement-safe from a provenance perspective. Their old working trees remain historical, not current product state.

## Result of the audit

There are no remaining pre-restructure noncanonical refs blocked by a known unique-content preservation gap.

The one real gap found by the audit was `feature/shared-evaluator-v1`; it is now corrected. The qualification evidence refs were intentionally blocked until their full generated payloads were consolidated; that consolidation is also complete.

## Physical cleanup rule

A live ref may be removed only when:

1. its exact head SHA is frozen in the migration census;
2. `RETIREMENT_PROOFS.json` or an equivalent audit proves canonical ancestry/duplication, curated artifact preservation, qualification-evidence consolidation, or history-only archive ancestry;
3. no open PR/workflow/external process still depends on the branch name;
4. post-delete branch inventory is verified.

The current connector cannot delete branches or create tags. Therefore the repository is logically restructured and the pre-restructure stale refs are classified as retirement-safe, but physical stale-ref deletion is not claimed.
