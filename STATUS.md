# Connect4 Repository Status

**Updated:** 2026-09-10  
**Role:** repository-level dashboard and authority router

The repository now has multiple active solver/research lanes. This root file no longer owns the detailed execution state of all Connect4 work.

## Canonical durable lanes

| Lane | Canonical branch | Purpose | Head at routing cutover |
| --- | --- | --- | --- |
| Product baseline | `main` | accepted domain/spec/oracle/product baseline | restructure integrated at `27fdfed33c9b75fde84942fe36c7e9edc3fdccbf` |
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

`solver/cuda-bsfp` supersedes the old branch name `feature/cuda-bsfp`. Draft PR #25 is the canonical continuation of the old PR #14. The production-adjacent seam remains native C3 cause profiling and B2 bucketed-normalizer A/B before another 6x5 attempt.

### Shared semantic research

`research/semantic-quotient` supersedes `research/zdd-transfer-20260910` as the continuity branch for shared representation research. The current program is MQ1-MQ5: strong-score qualification, coarsest behavioral quotient, missing-information analysis, compiled action transitions, and serial alpha-beta A/B.

## Repository restructuring state

The repository lane restructure was integrated to protected `main` through PR #24 at `27fdfed33c9b75fde84942fe36c7e9edc3fdccbf` after `verify`, `strength-evidence`, and `benchmark-evidence` passed.

Completed:

- created canonical `solver/cuda-bsfp`;
- made minimax, CUDA-BSFP and semantic-quotient branches own their own status/next-step records;
- created first-class `research/<lane>/` namespaces on all three canonical non-main lanes;
- created solver-neutral `research/semantic-quotient`;
- froze the pre-restructure branch topology and exact SHAs in `research/MIGRATION_MANIFEST.json`;
- established `research/` and `docs/decisions/` as the future organizational surfaces;
- classified historical/duplicate branches for retirement;
- replaced CUDA-BSFP draft PR #14 with canonical draft PR #25 and closed #14 as superseded.

Physical ref cleanup archived and deleted 40 gate-passing stale branches; 33 immutable archive tags preserve their exact heads. The four canonical lanes remain intact. Three refs remain blocked: `research/zdd-transfer-20260910` (producer reservation), `research/live-q1-5min-20260910` (queued workflow 34518477566), and `feature/cuda-bsfp` (live Q1 bootstrap/producer dependency). See `research/RETIREMENT_PROOFS.json` for exact inventory, tags and release conditions. The frozen migration census is unchanged.

## Governing rule

Branches represent ongoing ownership/work. Historical checkpoints should eventually be immutable archive refs/tags plus committed evidence, not long-lived active-looking branches.
