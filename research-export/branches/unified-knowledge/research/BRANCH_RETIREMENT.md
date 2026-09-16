# Branch retirement ledger

This file is the human-readable companion to `MIGRATION_MANIFEST.json` and `RETIREMENT_PROOFS.json`.

`MIGRATION_MANIFEST.json` is the frozen pre-restructure census. `RETIREMENT_PROOFS.json` records post-migration ancestry/content checks and physical cleanup observations. Recheck live refs and dependents before any later deletion.

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

The historical preservation classifications below describe content safety. Physical deletion additionally requires live PR, workflow and producer gates; the latest execution found three retained dependencies.

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

There is no known **curated checkpoint** with an unpreserved unique-content gap. The earlier audit identified the incoming `research/zdd-transfer-20260910` ref as its only branch-level blocker. The physical execution found the additional workflow/bootstrap dependencies below.

The audit corrected the V8 rewrite gap, consolidated failed and successful CUDA evidence equally, routed post-census O2/O3 evidence, split mixed OQS work by ownership, and established a steady-state rule for later incoming commits.

## Physical cleanup rule

A live ref may be removed only when:

1. its exact head SHA is frozen in the migration/retirement records;
2. `RETIREMENT_PROOFS.json` or equivalent evidence proves canonical ancestry/duplication, curated artifact preservation, qualification-evidence consolidation, ownership-split handoff, or history-only archive ancestry;
3. no open PR/workflow/external producer still depends on the branch name;
4. post-delete branch inventory is verified.

The earlier connector limitation is resolved by authenticated Git/CLI access. Physical cleanup is now verified for every ref that passed the live deletion gate; dependencies below remain blocked. The frozen census is unchanged.

## Physical cleanup result — 2026-09-10 Pacific / 2026-09-11 UTC

40 historical/delivery/restructuring branches were physically deleted after creating 33 annotated archive tags. The remote inventory fell from 47 to 7 branches before the short-lived cleanup PR. All four canonical heads were unchanged. Tags are covered by existing immutable-tag ruleset 22700180.

Exact heads, tag names, alias sets, owner heads and immediate verification timestamps are in `RETIREMENT_PROOFS.json` → `physicalCleanup.deleted`. Six identified-winline/cone/product/dominance aliases at `b95ad87c...` share one tag; three quotient-test aliases at `900cfa80...` share one tag. All other deleted heads have their own tag. No tag was moved.

Qualification preserved all nine generated run trees byte-for-byte by Git tree identity and verified all 15 V8 manifest blobs against the original source and runnable packet. Each owner ancestry proof was recomputed from Git. No solver, kernel, dependency pin, mathematical source, generated evidence or lane status was changed.

### Retained dependency blockers

| Ref | Exact observed head | Dependency and release condition |
| --- | --- | --- |
| `feature/cuda-bsfp` | `093218ca55b37f9179d0ede8255ac1621f2e96f5` | Live Q1 bootstrap DEFAULT_REVISIONS.connect4 still depends on this branch in solver/cuda-bsfp, research/semantic-quotient and active incoming staging; local producer base checkout also tracks this name. Retain until consumers are deliberately rerouted. |
| `research/live-q1-5min-20260910` | `b8e15aa72c92fb58515a80340876e7df45b5316c` | Active workflow depends on branch: 34518477566 |
| `research/zdd-transfer-20260910` | `54d63ae9a066dba42b2748b3ad51353611a2c52a` | Incoming producer staging reservation remains in force; local producer checkout still uses this branch. |

The queued one-shot run is [34518477566](https://github.com/iteathen/Connect4/actions/runs/34518477566); its sole job had no executed steps. It was neither cancelled nor treated as completed. Retire its branch only after the run is terminal and any resulting payload is audited. The old feature ref must remain until the live `tools/bootstrap-cuda-bsfp-q1.mjs` default and producer checkout dependency are deliberately rerouted. Staging remains reserved until its producer is explicitly finished and the latest head is fully curated. No unrecognized live refs remain unaudited.

### Canonical checkpoint and PR surface

- `main`: `7c01e749a80c1c9ba6a64f75b7c0f71c2c26f8a2`
- `solver/minimax-alpha-beta`: `0d5894876e02609f4a78466d7ffa5c632e44c803`
- `solver/cuda-bsfp`: `5397e9c538ef5929b4ddf8bd173d5bf9f91e65cb`
- `research/semantic-quotient`: `312c84afede4427bedbab231e141da36a7fc3510`

Draft [PR #25](https://github.com/iteathen/Connect4/pull/25), `solver/cuda-bsfp` → `main`, is the only pre-cleanup open PR and remains open. Historical closed evidence and superseded implementation PRs were left intact. The cleanup PR contains only repository bookkeeping; its merge commit is the subsequent main checkpoint. The PR record supplies the exact resulting SHA and CI, avoiding an impossible self-referential commit SHA in this document.

### Verification and disposition

Local `node --test` passed 27/27 on Node 26.7.0. Integration must pass `verify`, `strength-evidence` and `benchmark-evidence`; final main receives its push verification. Archive/delete the temporary cleanup branch only after merge and terminal workflows, then verify all retained heads, all archive targets and PR #25 again. Existing local producer worktrees were preserved. The three explicit blockers prevent a claim that every historical ref is gone; all currently gate-passing stale refs are gone.
