# Connect4 Status

**Updated:** 2026-09-09
**Phase:** CUDA-BSFP activation; incumbent search lane preserved

## Product role

Connect4 is the product-owned Connect Four solver/validation repository. It owns Connect Four domain truth, evaluator/oracle evidence, benchmark fairness, and two intentionally separate exact-solver lanes:

1. the incumbent minimax/alpha-beta/search implementation under `components/incumbent/`;
2. CUDA-BSFP under `components/bsfp/`, using backward symbolic fixed-point proof semantics rather than search semantics.

The lanes may share Connect4-owned domain/oracle authority, but neither may inherit the other solver's internal semantics merely for convenience.

## Protected baseline

Protected `main@de47d43f4f4133a68973d0876a402531ef5735da` preserves the qualified incumbent/search baseline and subsequent exact-solver research documentation. Existing incumbent evidence remains valid within its recorded identity and is not reopened by CUDA-BSFP activation.

## CUDA-BSFP branch

Active development branch:

`feature/cuda-bsfp`

The branch was created directly from protected `main@de47d43f4f4133a68973d0876a402531ef5735da` after verifying no pre-existing BSFP branch or commit lineage existed.

CUDA-BSFP owns Connect4-specific backward symbolic fixed-point semantics, including proof-state representation, Connect4-specific derivation/terminal rules, exact identity/canonicalization meaning, and solver-level fixed-point interpretation.

It must not be implemented as a minimax/search variant and must not depend on CUDA-MCGS search/session semantics merely because the incumbent lane does.

## CUDA-Algorithms dependency seam

CUDA-Algorithms is the reusable provider-neutral algorithm substrate. Its current ranked-closure work owns generic workset/frontier, bounded active-count/capacity, strict ranked progression, device-owned epoch/admin state, and reusable ordering/selection/compaction mechanics.

BSFP remains the consumer owner for proof/domain meaning. The first intended composition seam is the CUDA-Algorithms ranked-closure vertical slice, currently developed separately on `iteathen/CUDA-Algorithms` branch `feature/ranked-closure`.

The CUDA-MCGS #124 dependency applies only to the separate CUDA-MCGS/search comparison lane. It is not a blocker for CUDA-BSFP.

## Current BSFP objective

Establish the smallest exact BSFP consumer slice that can exercise generic ranked closure without importing search semantics:

- explicit finite rank owned by the BSFP state model;
- strict backward dependency descent;
- bounded deterministic derivation fanout;
- consumer-owned exact state/equality/proof semantics;
- generic CUDA-Algorithms-owned activation, workset progression and bounded administrative yields;
- Node administrative only during GPU-owned progression;
- qualification against independent Connect4 domain/oracle evidence and CPU/reference semantics where applicable.

## Non-claims

- no CUDA-BSFP 7x6 solve is yet claimed;
- no CUDA-BSFP GPU performance result is yet claimed;
- CUDA-Algorithms SPEC-0004 remains Working Draft and is not compatibility authority;
- the incumbent minimax/search lane is not being replaced or modified by the initial BSFP activation;
- CUDA-MCGS #124 does not block the BSFP lane.
