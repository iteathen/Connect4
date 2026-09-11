# Branch retirement ledger

This file is the human-readable companion to `MIGRATION_MANIFEST.json` and `RETIREMENT_PROOFS.json`.

`MIGRATION_MANIFEST.json` is the frozen pre-restructure census. `RETIREMENT_PROOFS.json` records post-migration ancestry/content checks and is the authority before physical cleanup.

## Keep as durable lanes

- `main`
- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `research/semantic-quotient`

Short-lived restructuring/work branches should disappear after integration once the ref-management surface permits it.

## Verified retirement-safe refs

Historical heads are preserved by canonical ancestry, exact duplication, curated artifact migration, qualification-evidence consolidation, ownership-split handoff, or history-only archive merge. Their live branch names are not required for information preservation.

### Minimax history

The exact-solver research chain, residual-automorphism work, and old shared-evaluator/V8 branch are preserved on `solver/minimax-alpha-beta`. The previously missing V8 candidate is retained as a runnable exact-blob packet under `research/minimax/incumbent-v8-rewrite/`; PR #5 is closed as superseded.

### Shared semantic / searchless / OQS history

`research/zdd-transfer-20260910` is superseded as a continuity lane. Its **latest audited head is `5dfe1312a357c48eee53168e82fd6eba27814a06`**, and that head is ancestry-preserved by both canonical successor lanes after ownership curation:

- `research/semantic-quotient` owns shared quotient/OQS mathematics, exact residual-pair equivalence/reuse semantics, strengthened factored-reuse controls, seed scaling, and minimum-description/behavioral-quotient research;
- `solver/cuda-bsfp` owns O1/O2/O3 CUDA layouts/plans/programs, O3 occurrence mapping, profiles, qualifier integration, experiments, generated native qualification evidence, and solver-specific device composition.

Frozen OQS/R3 source copies on the CUDA lane are qualification/reproduction oracles only. The mixed branch's stale `STATUS.md` and `next_step.yaml` were intentionally not imported wholesale.

Older searchless/OQS refs (`low-confidence-survival`, `direct-line-product-bsfp`, `live-q1-5min`, identified-winline aliases, and winline product/dominance aliases) are likewise preserved by semantic-lane ancestry, exact duplication, or curated source restoration. Their detailed SHAs/proofs remain in `RETIREMENT_PROOFS.json`.

### CUDA-BSFP qualification evidence refs

All **nine** known Q1 evidence delivery refs are retirement-safe. Their generated directories are consolidated into:

`docs/evidence/cuda-bsfp/qualification/`

Generated run contents are attached by exact Git subtree SHA and are not rewritten. The canonical corpus contains failed runs, a `complete-with-boundaries` run, qualified B1/C1/O1, bounded O2 7x6 seed-slice evidence, and bounded O3 residual-reuse/occurrence-mapping evidence.

The newest run is `20260911T050640911Z-b3554293`, source `5dfe1312...`, profile `c4-0009-o3-oqs-residual-reuse`. It qualified 4x4 and the selected bounded 7x6 reuse cut on the GTX 1660 Ti. O3 is not a complete 7x6 quotient or root solve claim.

Historical evidence PRs #15–#21 and #28 are closed. O3 was consolidated directly before an evidence PR was published. Q1's default evidence PR base is now `solver/cuda-bsfp`, not `main`; evidence branches are delivery surfaces rather than durable development lanes.

### Renamed / exact duplicate / contained refs

- `feature/cuda-bsfp` — superseded by `solver/cuda-bsfp`; PR #14 closed in favor of canonical draft PR #25.
- `research/winline-product-antichain-final` — exact old CUDA-BSFP head.
- `tmp-do-not-use-c4diag` — strict ancestor of the old CUDA-BSFP branch with no unique commits.
- `noop` — exact pre-restructure `main` head.

### Legacy product/bootstrap/docs histories

Divergent legacy product/bootstrap/docs heads are preserved as additional parents of the history-only archive commit recorded in `RETIREMENT_PROOFS.json`. The cleaned current tree was retained; obsolete parent trees were not restored. The incumbent/oracle artifacts were audited against the accepted product baseline before classification.

## Result of the audit

There is no known noncanonical ref blocked by an unpreserved unique-content gap at the latest audited heads.

The audit found and corrected the V8 rewrite gap, consolidated failed and successful CUDA evidence equally, routed post-census O2 and O3 evidence, and absorbed concurrently advancing mixed OQS work into the correct semantic/CUDA owners.

## Physical cleanup rule

A live ref may be removed only when:

1. its exact head SHA is frozen in the migration/retirement records;
2. `RETIREMENT_PROOFS.json` or equivalent evidence proves canonical ancestry/duplication, curated artifact preservation, qualification-evidence consolidation, ownership-split handoff, or history-only archive ancestry;
3. no open PR/workflow/external process still depends on the branch name;
4. post-delete branch inventory is verified.

The current connector cannot delete branches or create tags. The repository is therefore logically restructured and known stale refs are classified as retirement-safe, but physical stale-ref deletion is not claimed.
