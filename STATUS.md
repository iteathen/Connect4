# Connect4 Repository Status

**Updated:** 2026-09-10  
**Role:** repository-level dashboard and authority router

The repository now has multiple active solver/research lanes. This root file no longer owns the detailed execution state of all Connect4 work.

## Canonical durable lanes

| Lane | Canonical branch | Purpose | Current branch head at routing cutover |
| --- | --- | --- | --- |
| Product baseline | `main` | accepted domain/spec/oracle/product baseline | `de47d43f4f4133a68973d0876a402531ef5735da` |
| Minimax / alpha-beta | `solver/minimax-alpha-beta` | exact search implementation and search-specific evidence | `66fe2fc8dd15f954a37f328950f352d06bbe8f89` |
| CUDA-BSFP | `solver/cuda-bsfp` | BSFP implementation and solver-specific qualification | `0d8b4d5633e0485ac1bb96ed4f77509bc1217d80` |
| Semantic quotient research | `research/semantic-quotient` | solver-neutral future-behavior/minimum-description research | `16a4ca51ed39a93451414bfa9dc4b5aee8091837` |

Read each lane's own `STATUS.md` and `next_step.yaml` before executing work there.

## Current high-level state

### Product baseline

C4-0001 through C4-0005 and the qualified incumbent/oracle baseline remain protected on `main`. Later solver-specific contracts/specs live on their owning solver branches until deliberately accepted/integrated.

### Minimax

The complete identified minimax research lineage is consolidated on `solver/minimax-alpha-beta`. New maintained-kernel promotion is intentionally paused while the shared semantic-quotient lane tests whether a smaller exact action-labelled state can replace historical colored-board identity without sacrificing distance-sensitive values.

### CUDA-BSFP

`solver/cuda-bsfp` supersedes the old branch name `feature/cuda-bsfp`. The production-adjacent seam remains native C3 cause profiling and B2 bucketed-normalizer A/B before another 6x5 attempt.

### Shared semantic research

`research/semantic-quotient` supersedes `research/zdd-transfer-20260910` as the continuity branch for shared representation research. The current program is MQ1-MQ5: strong-score qualification, coarsest behavioral quotient, missing-information analysis, compiled action transitions, and serial alpha-beta A/B.

## Repository restructuring state

The branch topology and authority routing are being normalized under `restructure/repository-organization-20260910`.

Completed in this migration:

- created canonical `solver/cuda-bsfp`;
- made minimax, CUDA-BSFP and semantic-quotient branches own their own status/next-step records;
- created first-class `research/<lane>/` namespaces on all three canonical non-main lanes;
- created solver-neutral `research/semantic-quotient`;
- froze the current branch topology and exact SHAs in `research/MIGRATION_MANIFEST.json`;
- established `research/` and `docs/decisions/` as the future organizational surfaces;
- marked historical research branches for retirement rather than treating branch names as permanent archive storage.

The GitHub connector used for this migration does not expose branch deletion/tag creation. Stale refs are therefore classified and preserved by exact SHA in the migration manifest, but their physical deletion must not be claimed until performed through an authorized ref-management surface.

## Governing rule

Branches represent ongoing ownership/work. Historical checkpoints should eventually be immutable archive refs/tags plus committed evidence, not long-lived active-looking branches.
