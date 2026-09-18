# Decision: normalize all durable solver heads under `solver/*`

**Date:** 2026-09-17  
**Status:** owner-authorized repository organization decision  

> **Current research-routing authority:** `2026-09-17-single-research-owner.md` supersedes any wording in this historical decision that could be read as permitting solver-specific research ownership, multiple research authorities, or durable focused research branches. All durable research belongs on `research/semantic-quotient`.
**Amends current branch names from:** `2026-09-17-closed-durable-lane-topology.md`

## Trigger

The durable topology was conceptually correct but physically inconsistent: three solver families lived under `solver/*` while Isometric and SUT remained root-level branches.

That naming inconsistency made branch routing harder to reason about and left unnecessary room for agents to infer that root-level solver branches followed different ownership rules.

## Decision

Every durable solver-family head now lives under the `solver/*` namespace:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `solver/hybrid-confluence`
- `solver/isometric`
- `solver/sut`

The shared non-solver durable lanes remain:

- `main` — shared accepted product/domain/spec/oracle/benchmark substrate and repository router;
- `research/semantic-quotient` — canonical solver-neutral research/knowledge lane.

The prior root refs `isometric` and `sut` are superseded branch names. Their exact heads are preserved before retirement; no solver history or semantic authority is rewritten by the namespace change.

## Ownership

This decision changes branch names only. Solver-family ownership remains exactly as before:

- Isometric remains the structural-calculus/frontier-exact solver family;
- SUT remains the independent `S ∪ T` solver lineage;
- neither becomes a subfamily of another solver because it now shares the `solver/*` namespace.

## Branch creation rule

The durable solver namespace is closed.

Agents may not create a new long-lived `solver/*` branch merely because work appears distinct. A new durable solver-family head still requires explicit owner authorization and a repository-organization decision.

Temporary implementation work should use bounded `work/*`, `experiment/*`, or another explicitly temporary branch owned by one durable solver head, then integrate/archive/retire.

## Dependency/routing rule

Current configuration, workflows and documentation must reference `solver/isometric` and `solver/sut`, not the superseded root names.

Historical reports may retain old branch names where they are provenance facts about a historical checkpoint.

## Retirement condition

The old `isometric` and `sut` refs may be deleted only after:

1. `solver/isometric` and `solver/sut` point at descendants containing the exact old heads;
2. current repository authority and branch-local status route to the new names;
3. no open PR or active workflow depends on the old refs;
4. immutable archive tags preserve the old exact heads.
