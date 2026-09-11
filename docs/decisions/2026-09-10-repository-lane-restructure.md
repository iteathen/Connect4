# Decision: explicit Connect4 solver and semantic-research lanes

**Date:** 2026-09-10  
**Status:** owner-authorized repository organization decision

## Decision

Connect4 uses four durable ownership lanes:

- `main` — accepted product/domain/spec/oracle baseline and repository dashboard;
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation and search-specific evidence;
- `solver/cuda-bsfp` — CUDA-BSFP implementation and BSFP-specific evidence;
- `research/semantic-quotient` — solver-neutral research into the exact minimum-description/future-behavior representation of the remaining game.

Historical experiment branches are not durable architecture owners. Once their exact SHA and durable evidence are preserved and ancestry/duplication is verified, they should be retired from the live branch namespace.

## Rationale

The repository accumulated product code, search experiments, BSFP experiments, OQS/quotient research and evidence snapshots across many branches whose names no longer reliably encoded ownership. This repeatedly caused context reconstruction, stale status routing and cross-pollination risk.

The minimax and BSFP solvers are intentionally distinct algorithms, while win-space/quotient/support/future-behavior research is shared mathematics. A separate solver-neutral research lane prevents one solver branch from becoming the accidental owner of discoveries relevant to both.

## Consequences

- each canonical non-main lane owns its own `STATUS.md` and `next_step.yaml`;
- root status/next-step on `main` are routing/dashboard state only;
- `feature/cuda-bsfp` is superseded by `solver/cuda-bsfp`;
- `research/zdd-transfer-20260910` is superseded as continuity owner by its descendant `research/semantic-quotient`;
- new one-off experiments should not create permanent long-lived research branches;
- `reference/research-prototypes/` is frozen as historical/reproducibility structure; new research uses first-class `research/` packets;
- research becomes solver implementation only through deliberate promotion/qualification into the owning solver branch.

## Preservation

`research/MIGRATION_MANIFEST.json` records the observed pre-restructure branch heads and intended dispositions. No branch deletion is considered complete until exact-SHA preservation, unique-content/evidence checks and actual ref deletion are verified.

## Reopen conditions

Revisit this organization if a new independently owned solver/product lane emerges, or if a shared semantic-research topic becomes sufficiently stable to deserve accepted product/spec ownership rather than research ownership.
