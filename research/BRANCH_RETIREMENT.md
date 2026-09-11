# Branch retirement ledger

This file is the human-readable companion to `MIGRATION_MANIFEST.json` and `RETIREMENT_PROOFS.json`.

`MIGRATION_MANIFEST.json` is the frozen pre-restructure census. `RETIREMENT_PROOFS.json` records post-migration ancestry/content checks and is the authority before physical cleanup.

## Keep as durable lanes

- `main`
- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `research/semantic-quotient`

Short-lived restructuring/work branches should disappear after integration once the ref-management surface permits it.

## Active incoming staging ref

`research/zdd-transfer-20260910` is **not** a continuity owner anymore, but it is still being advanced by an authorized concurrent producer. Therefore its branch name is not currently retirement-safe even though all content through the latest curated checkpoint is preserved.

Curated through `54d63ae9a066dba42b2748b3ad51353611a2c52a`. Git comparison proves that exact commit is the merge base and a strict ancestor of both `solver/cuda-bsfp` and `research/semantic-quotient`.

Ownership routing through that checkpoint is:

- `research/semantic-quotient`: shared quotient/OQS mathematics, exact residual-pair equivalence/reuse semantics, behavioral-quotient interpretation, active semantic prototype evolution;
- `solver/cuda-bsfp`: O1/O2/O3 CUDA implementation, occurrence mapping, qualifier profiles/tests, native evidence, and solver-specific OQS composition;
- `iteathen/CUDA-Algorithms`: generic checked scan/select, grouping mechanics, record offsets/compaction and related reusable sequence primitives.

The latest incoming commit adds dependency evidence only. Direct verification confirms CUDA-Algorithms issue #9 owns the checked-device-scan acceptance work; isolated branch `codex/oqs-segment-scan` preserves experiment source `7d923eb5...` and evidence checkpoint `3aa4f6eb...`. The experiment is not yet an adopted library API, and Connect4's dependency pin remains unchanged.

Do not delete or repoint `research/zdd-transfer-20260910` until the concurrent producer stops. Any later commits are incoming staging work and must be audited/routed by ownership; they do not regain authority over either canonical lane.

## Verified retirement-safe refs

All other historical refs classified in `RETIREMENT_PROOFS.json` are preserved by canonical ancestry, exact duplication, curated artifact migration, qualification-evidence consolidation, or history-only archive merge.

### Minimax history

The exact-solver research chain, residual-automorphism work, and old shared-evaluator/V8 branch are preserved on `solver/minimax-alpha-beta`. The previously missing V8 candidate is retained as a runnable exact-blob packet under `research/minimax/incumbent-v8-rewrite/`; PR #5 is closed as superseded.

### Shared semantic / searchless / OQS history

Older searchless/OQS refs (`low-confidence-survival`, `direct-line-product-bsfp`, `live-q1-5min`, identified-winline aliases, and winline product/dominance aliases) are preserved by semantic-lane ancestry, exact duplication, or curated source restoration. Their exact SHAs/proofs remain in `RETIREMENT_PROOFS.json`.

### CUDA-BSFP qualification evidence refs

All **nine** known Q1 evidence delivery refs are retirement-safe. Their generated directories are consolidated unchanged into:

`docs/evidence/cuda-bsfp/qualification/`

The corpus includes failed runs, a `complete-with-boundaries` run, qualified B1/C1/O1, bounded O2 7x6 seed-slice evidence, and bounded O3 residual-reuse/occurrence-mapping evidence. O3 evidence head `e9968050...` is a strict ancestor of the canonical CUDA lane; its exact run tree is `5878ff0a...`.

Historical evidence PRs #15–#21, #28, and #30 are closed after preservation. Q1's default evidence PR base is now `solver/cuda-bsfp`, not `main`; evidence branches are delivery surfaces rather than durable development lanes.

### Renamed / exact duplicate / contained refs

- `feature/cuda-bsfp` — superseded by `solver/cuda-bsfp`; PR #14 closed in favor of canonical draft PR #25.
- `research/winline-product-antichain-final` — exact old CUDA-BSFP head.
- `tmp-do-not-use-c4diag` — strict ancestor of the old CUDA-BSFP branch with no unique commits.
- `noop` — exact pre-restructure `main` head.

### Legacy product/bootstrap/docs histories

Divergent legacy product/bootstrap/docs heads are preserved as additional parents of the history-only archive commit recorded in `RETIREMENT_PROOFS.json`. The cleaned current tree was retained; obsolete parent trees were not restored. The incumbent/oracle artifacts were audited against the accepted product baseline before classification.

## Result of the audit

There is no known **curated checkpoint** with an unpreserved unique-content gap. The only branch-level retirement blocker is the intentionally moving incoming `research/zdd-transfer-20260910` ref.

The audit corrected the V8 rewrite gap, consolidated failed and successful CUDA evidence equally, routed post-census O2/O3 evidence, split mixed OQS work by ownership, and established a steady-state rule for later incoming commits.

## Physical cleanup rule

A live ref may be removed only when:

1. its exact head SHA is frozen in the migration/retirement records;
2. `RETIREMENT_PROOFS.json` or equivalent evidence proves canonical ancestry/duplication, curated artifact preservation, qualification-evidence consolidation, ownership-split handoff, or history-only archive ancestry;
3. no open PR/workflow/external producer still depends on the branch name;
4. post-delete branch inventory is verified.

The current connector cannot delete branches or create tags. Therefore logical restructuring is complete for the canonical lanes and curated history, but physical stale-ref deletion is not claimed. The active incoming staging branch has an additional independent deletion block until its producer stops.
