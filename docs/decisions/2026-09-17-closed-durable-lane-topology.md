# Decision: closed durable lane topology with five solver heads

**Date:** 2026-09-17  
**Status:** owner-authorized repository organization decision  

> **Superseded for current solver membership by `2026-09-18-three-active-solver-topology.md`.** This file remains historical authority for the topology decision made on 2026-09-17.

> **Current research-routing authority:** `2026-09-17-single-research-owner.md` supersedes any wording in this historical decision that could be read as permitting solver-specific research ownership, multiple research authorities, or durable focused research branches. All durable research belongs on `research/semantic-quotient`.
**Supersedes topology count in:** `2026-09-11-main-shared-foundation-three-solver-heads.md`

## Trigger

The repository accumulated temporary research, work, experiment and handoff branches that agents began treating as continuity owners. Since the 2026-09-11 topology decision, two additional independently named solver families also became explicit:

- **Isometric** on `isometric`;
- **SUT** on `sut`.

The branch model therefore needs a closed durable set and an explicit rule that temporary branches cannot self-promote into permanent lanes.

## Decision

Connect4 has one shared foundation, one canonical solver-neutral research lane, and five durable solver-family heads:

- `main` — accepted shared product/domain/spec/oracle/benchmark substrate and repository router; not a solver head;
- `research/semantic-quotient` — canonical solver-neutral research/knowledge lane;
- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta solver implementation;
- `solver/cuda-bsfp` — CUDA-BSFP solver implementation;
- `solver/hybrid-confluence` — exact hybrid-confluence solver implementation;
- `isometric` — Isometric structural/frontier solver implementation;
- `sut` — SUT (`S ∪ T`) solver lineage.

The root-level names `isometric` and `sut` are intentional established solver-family names, not temporary exceptions awaiting renaming.

This durable set is **closed**. An agent may not create or treat another branch as a durable lane without explicit owner instruction and a corresponding repository-organization decision.

## Temporary branch rule

Temporary branches are allowed for bounded work, but they must declare an owner lane and a retirement condition.

Typical temporary prefixes include:

- `work/*`;
- `experiment/*`;
- noncanonical `research/*`;
- `feature/*`;
- handoff/staging/evidence refs.

A temporary branch:

1. does not become authority merely by accumulating commits;
2. must preserve valuable code, evidence, negative results and notes in its owning durable lane or an immutable archive before retirement;
3. must not redefine repository topology;
4. must be closed/deleted once its durable information has been integrated or archived;
5. must not become a dependency target when the owning durable branch can be referenced directly.

## Ownership

### Shared foundation

`main` owns shared Connect Four rules/legality, benchmark and fairness semantics, oracle/reference behavior, accepted cross-lane contracts, repository routing and promotion decisions.

### Canonical research

`research/semantic-quotient` owns solver-neutral research knowledge, normalized claims, hypotheses, falsifiers, evidence, provenance and cross-solver synthesis. Solver-specific implementation branches may consume that knowledge but do not fork a competing shared research authority.

### Solver heads

Each solver family owns its maintained implementation, solver-specific contracts, qualification and implementation-local evidence:

- Minimax: `solver/minimax-alpha-beta`;
- CUDA-BSFP: `solver/cuda-bsfp`;
- Hybrid Confluence: `solver/hybrid-confluence`;
- Isometric: `isometric`;
- SUT: `sut`.

Solver heads are peers. Historical ancestry does not transfer ownership between them.

## Cross-lane flow

- Shared accepted changes flow from `main` into solver heads.
- Shared research facts flow through `research/semantic-quotient`.
- Solver-specific implementation remains on its solver head.
- A shared fact discovered on a solver head is extracted and qualified before promotion to `main` or canonical research.
- Solver branches are not merged wholesale into `main` for history synchronization.
- SUT and Hybrid Confluence may compose other solver capabilities without absorbing ownership of those solvers' internals.

## Cleanup consequence

Historical `work/*`, superseded feature aliases and one-off implementation/research branches should be archived and retired after their durable information is preserved. Existing active bounded experiments may remain while they are genuinely active, but they do not become durable lanes.

## Reopen conditions

Reopen only when the owner explicitly authorizes a new independently owned solver family, retires an existing solver family, or changes the research/foundation ownership model.
