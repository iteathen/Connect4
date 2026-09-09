# Dependency-TT reassessment prototypes

Dirty research only; not maintained solver authority.

These files retest the dependency-TT ideas after correcting the task/lifetime boundary.

- `ybwc_regionfixed_worker.mjs` — worker receives one physical TT region for a coarse task and uses it unchanged until task completion.
- `coarse_family_split_bench.mjs` — compares flat shared TT with a first-level canonical dependency split at the coarse YBWC task boundary. For `41267575`, logical family `336522` uses one half and the root/tiny sibling use the other half. For `663152175`, the single bottom-row family receives the whole table.
- `coarse_family_dynamic_split_bench.mjs` — starts broad and activates the same split only after a mandatory null-window pass has drained, exercising a quiescent parent/child physical split rather than live repartitioning.
- `coarse_nested32_bench.mjs` — fair negative retest of the deeper nested idea: hot two-row task-root identities receive dedicated 32K slabs while the long tail uses a fallback slab. It demonstrates that 32K is too small as a universal logical-family capacity even when routing occurs at the correct boundary.

Representative commands:

```sh
node coarse_family_split_bench.mjs 41267575 4 18 5
node coarse_family_split_bench.mjs 41267575 4 19 5
node coarse_family_split_bench.mjs 41267575 4 20 5
node coarse_family_split_bench.mjs 41267575 4 21 5
node coarse_family_split_bench.mjs 41267575 1 20 3
node coarse_family_dynamic_split_bench.mjs 41267575 4 20 7
node coarse_nested32_bench.mjs 663152175 4 18 7
node coarse_nested32_bench.mjs 41267575 4 19 7
```

See `docs/research/2026-09-09-dependency-tt-failed-idea-reassessment.md` and `docs/research/evidence/2026-09-09-dependency-tt-reassessment-summary.json` for interpretation and preserved summary results.

Important: `coarse_family_split_bench.mjs` deliberately uses a known heavy logical family from an earlier profile. It is a controlled architecture retest, not the final dynamic selector.