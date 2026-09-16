# Decision: `main` as shared foundation with three peer solver heads

**Date:** 2026-09-11  
**Status:** owner-authorized repository organization decision  
**Amends:** `2026-09-10-repository-lane-restructure.md`

## Trigger

The 2026-09-10 lane decision required a repository-organization review when a new independently owned solver line emerged. `solver/hybrid-confluence` is that third solver line.

## Decision

Connect4 uses one shared foundation branch, three peer solver heads, and one solver-neutral research lane:

- `main` — accepted shared product/domain/spec/oracle/benchmark substrate and repository router; not a solver head;
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation and evidence;
- `solver/cuda-bsfp` — CUDA-BSFP implementation and evidence;
- `solver/hybrid-confluence` — hybrid exact-confluence implementation and evidence;
- `research/semantic-quotient` — solver-neutral minimum-description/future-behavior research.

The three `solver/*` branches are intentionally long-lived first-class product heads. They are not ordinary feature branches awaiting wholesale merge into `main`.

## Main ownership

`main` owns Connect Four rules and legality, benchmark/fairness semantics, independent oracle/reference behavior, accepted cross-lane contracts/conformance vectors, and repository routing/promotion/provenance decisions.

The qualified incumbent implementation retained under `components/incumbent/` is a baseline/reference comparator. It is not the canonical minimax implementation.

Solver-specific maintained kernels, schedulers, transposition policy, BSFP recurrence/storage, hybrid confluence machinery and solver-specific performance state remain on the owning solver head.

## Cross-lane synchronization

Shared accepted changes flow from `main` into solver heads.

When solver work reveals a shared product fact, promote it back to `main` selectively:

1. identify the smallest shared semantic, contract or evidence change;
2. qualify its cross-lane meaning independently of the solver-private mechanism that exposed it;
3. promote that shared change to `main`;
4. leave solver-private machinery on its solver head.

A solver branch is not merged wholesale to `main` merely to synchronize history.

`solver/hybrid-confluence` may compose accepted/public behavior from minimax and CUDA-BSFP without taking ownership of their private implementation state. Shared physical state is adopted only when measured benefit exceeds conversion, synchronization, locality and lifecycle costs.

## Consequences

- `main` remains the common accepted foundation rather than a fourth solver implementation;
- solver heads may diverge substantially in code and history while sharing accepted product semantics;
- shared fixes have one accepted owner and propagate outward;
- hybrid confluence can integrate solver capabilities without requiring physical-state unification;
- benchmark/release records should identify the solver line explicitly.

## Enforcement

Changes targeting `main` are checked for known solver-owned maintained component namespaces. The check is deliberately narrow so future shared components are still possible.

Documentation and routing records on `main` must name all canonical solver heads. Lane-local execution state remains owned by each non-main branch.

## Reopen conditions

Revisit if another independently owned solver line emerges, separate solver heads cease to provide isolation value, a solver-owned component becomes demonstrably consumer-neutral, or branch/tooling costs measurably exceed the isolation and provenance benefits.
