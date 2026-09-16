# Pre-alpha cleanup ledger

Date: 2026-09-12
Branch: `research/frontier-negamax-conformance`
Starting commit: `02ea9938128b8f6f42485f562f9fb5cffc605fad`

## Policy

This repository is pre-alpha. Dead implementations, superseded experiment harnesses, compatibility-only paths, duplicate adapters and unused scaffolding are deleted from the live tree rather than retained as in-tree archives. Git history is the archive. Evidence/research documents remain unless they are themselves incorrect or redundant; they may reference historical paths that no longer exist at branch head.

A deletion is eligible when it is not part of a current product/runtime path, current qualification gate, unresolved active experiment, or current specification contract. Do not add compatibility shims merely to keep a deleted path callable.

## Step 1 — retire closed one-off workflow scaffolding

Disposition: delete historical manual experiment workflows whose results are already represented by source history/research evidence and which are not current qualification gates. This reduces the Actions surface without changing product source or solver semantics.

Current workflows deliberately retained in this step:

- `benchmark-evidence.yml`
- `strength-evidence.yml`
- `verify.yml`
- all current CUDA-BSFP workflow lanes
- `frontier-canonical-class-hash-ab.yml` (active/unresolved optimization experiment)
- `semantic-quotient-explore-hints.yml`
- `semantic-quotient-online-dependency-parallel.yml`
- `semantic-quotient-proof-replacement.yml`
- `semantic-quotient-slot64-residual.yml`
- `semantic-quotient-standard7x6-root-attempt.yml` (full-root trigger intentionally unchanged)

Removed workflow scaffolding:

- `semantic-quotient-7x6-chunked-growth-summary.yml`
- `semantic-quotient-7x6-chunked-growth.yml`
- `semantic-quotient-7x6-forward-growth.yml`
- `semantic-quotient-7x6-residual-chunk-audit.yml`
- `semantic-quotient-7x6-residual-storage.yml`
- `semantic-quotient-chunked-class-first.yml`
- `semantic-quotient-chunked-residual-summary.yml`
- `semantic-quotient-chunked-residual.yml`
- `semantic-quotient-chunked-term-id.yml`
- `semantic-quotient-dependency-parallel.yml`
- `semantic-quotient-exhaustion-bounds.yml`
- `semantic-quotient-exhaustion-v2.yml`
- `semantic-quotient-fast-kernel.yml`
- `semantic-quotient-fast2-kernel.yml`
- `semantic-quotient-hash-width.yml`
- `semantic-quotient-lookahead-workers.yml`
- `semantic-quotient-mq1.yml`
- `semantic-quotient-mq2.yml`
- `semantic-quotient-mq3.yml`
- `semantic-quotient-mq4-flat-replay.yml`
- `semantic-quotient-mq4.yml`
- `semantic-quotient-negamax-optimization-campaign.yml`
- `semantic-quotient-negamax-optimization-refinement.yml`
- `semantic-quotient-nohash-state.yml`
- `semantic-quotient-online-semantic-workers.yml`
- `semantic-quotient-packed-record.yml`
- `semantic-quotient-packed-support-layout.yml`
- `semantic-quotient-packed-support-solver.yml`
- `semantic-quotient-quotient-best-child.yml`
- `semantic-quotient-quotient-class-cache.yml`
- `semantic-quotient-quotient-native-driver.yml`
- `semantic-quotient-quotient-native-negamax-refinement.yml`
- `semantic-quotient-quotient-native-negamax.yml`
- `semantic-quotient-quotient-vs-physical-v2.yml`
- `semantic-quotient-quotient-vs-physical-v3.yml`
- `semantic-quotient-quotient-vs-physical.yml`
- `semantic-quotient-scaled-7x6-memory.yml`
- `semantic-quotient-scaled-term-id-summary.yml`
- `semantic-quotient-scaled-term-id.yml`
- `semantic-quotient-search-campaign.yml`
- `semantic-quotient-shared-tt-workers.yml`
- `semantic-quotient-siu1-relational.yml`
- `semantic-quotient-slot64-7x6-growth.yml`
- `semantic-quotient-slot64-dense-dirty-own.yml`
- `semantic-quotient-slot64-direct-block-7x6.yml`
- `semantic-quotient-slot64-direct-block-paired.yml`
- `semantic-quotient-slot64-direct-block.yml`
- `semantic-quotient-slot64-direct-own-7x6.yml`
- `semantic-quotient-slot64-direct-own-paired.yml`
- `semantic-quotient-slot64-direct-own.yml`
- `semantic-quotient-slot64-locality-audit.yml`
- `semantic-quotient-slot64-own-locality.yml`
- `semantic-quotient-standard7x6-presearch.yml`
- `semantic-quotient-standard7x6-semantic-tt-sample.yml`
- `semantic-quotient-support-layout-kernel.yml`
- `semantic-quotient-term-id-cache-scaling.yml`
- `semantic-quotient-term-id-kernel.yml`
- `semantic-quotient-term-id-prefix-cache.yml`
- `semantic-quotient-term-vocabulary.yml`
- `semantic-quotient-transition-specialization.yml`
- `semantic-quotient-vs-physical-v4.yml`
- `semantic-quotient-vs-physical-v5.yml`
- `semantic-quotient-worker-negamax.yml`
- `zdd-transfer-one-shot.yml`

Qualification intent: current `verify.yml` and the retained bounded frontier lanes remain the live executable qualification surface. No solver source, specification, status/next-step state, or standard full-root trigger is changed by this step.

## Step 2 — retire orphaned campaign and audit executables

Disposition: delete historical one-shot campaign/audit executables whose workflow entrypoints were retired in Step 1 and which are not referenced by package scripts or the retained live qualification workflows. These files are experiment drivers, not shared runtime owners. Shared libraries remain for the next import-graph cleanup pass.

The benchmark/strength evidence workflows were checked before mutation: they use `benchmarks/incumbent.mjs`, `benchmarks/bsfp-performance.mjs`, and `npm run bench:strength`; they do not use the old semantic-quotient `search-method-evidence-campaign.mjs`. The retired SIU1 workflow was also checked and its sole executable entrypoint was `siu1-relational-dual-direction.mjs`.

Removed executables:

- `negamax-optimization-campaign-v2.mjs`
- `negamax-optimization-campaign.mjs`
- `quotient-7x6-chunked-forward-growth-campaign.mjs`
- `quotient-7x6-forward-growth-campaign.mjs`
- `quotient-7x6-residual-chunk-audit.mjs`
- `quotient-7x6-residual-storage-census.mjs`
- `quotient-chunked-class-first-campaign.mjs`
- `quotient-chunked-residual-campaign.mjs`
- `quotient-chunked-term-id-campaign.mjs`
- `quotient-dependency-parallel-campaign.mjs`
- `quotient-exhaustion-bounds-campaign.mjs`
- `quotient-exhaustion-bounds-v2.mjs`
- `quotient-fast-kernel-campaign.mjs`
- `quotient-fast2-kernel-campaign.mjs`
- `quotient-lookahead-worker-campaign.mjs`
- `quotient-native-best-child-campaign.mjs`
- `quotient-native-class-cache-campaign.mjs`
- `quotient-native-driver-campaign.mjs`
- `quotient-native-negamax-campaign.mjs`
- `quotient-native-negamax-refinement.mjs`
- `quotient-online-semantic-worker-campaign.mjs`
- `quotient-packed-support-layout-campaign.mjs`
- `quotient-packed-support-solver-campaign.mjs`
- `quotient-scaled-7x6-memory-summary.mjs`
- `quotient-scaled-hash-width-campaign.mjs`
- `quotient-scaled-nohash-state-campaign.mjs`
- `quotient-scaled-packed-record-campaign.mjs`
- `quotient-scaled-term-id-campaign.mjs`
- `quotient-shared-tt-worker-campaign.mjs`
- `quotient-slot64-7x6-forward-growth.mjs`
- `quotient-slot64-dense-dirty-own-campaign.mjs`
- `quotient-slot64-direct-block-7x6-growth.mjs`
- `quotient-slot64-direct-block-7x6-paired.mjs`
- `quotient-slot64-direct-block-campaign.mjs`
- `quotient-slot64-direct-own-7x6-growth.mjs`
- `quotient-slot64-direct-own-7x6-paired.mjs`
- `quotient-slot64-direct-own-campaign.mjs`
- `quotient-slot64-own-locality-audit.mjs`
- `quotient-slot64-worker-negamax-campaign.mjs`
- `quotient-standard7x6-presearch-profile.mjs`
- `quotient-standard7x6-semantic-tt-sample.mjs`
- `quotient-term-id-cache-scaling-campaign.mjs`
- `quotient-term-id-kernel-campaign.mjs`
- `quotient-term-id-prefix-cache-campaign.mjs`
- `quotient-term-id-support-layout-kernel-campaign.mjs`
- `quotient-term-vocabulary-campaign.mjs`
- `quotient-transition-specialization-campaign.mjs`
- `quotient-vs-physical-wdl-campaign.mjs`
- `quotient-vs-physical-wdl-campaign-v2.mjs`
- `quotient-vs-physical-wdl-campaign-v3.mjs`
- `quotient-vs-physical-wdl-campaign-v4.mjs`
- `quotient-vs-physical-wdl-campaign-v5.mjs`
- `siu1-relational-dual-direction.mjs`
- `search-method-evidence-campaign.mjs`

Explicitly retained for now because they remain wired into live qualification or current product/runtime work:

- `quotient-slot64-residual-campaign.mjs`
- `quotient-semantic-tt-replacement-campaign.mjs`
- `quotient-explore-hint-campaign.mjs`
- `quotient-online-dependency-parallel-campaign.mjs`
- `quotient-standard7x6-root-attempt.mjs`
- `quotient-residual-provider-control.mjs`
- `quotient-state-retention-comparison.mjs`
- `quotient-neutral-capacity-diagnostic.mjs`
- `quotient-terminal-boundary-campaign.mjs`
- `quotient-pruning-campaign.mjs`
- `quotient-legacy-frontier-study.mjs`
- `quotient-response-comparison.mjs`

The retained legacy comparison controls are not granted permanent status. They are deferred to a later ownership-bounded cleanup step that will simplify their live workflow at the same time, rather than deleting a still-invoked executable in isolation.

Qualification gate: run the general Node verification plus the retained slot64/proof/frontier bounded workflow lanes. Do not dispatch or modify the standard empty-board full-root workflow.
