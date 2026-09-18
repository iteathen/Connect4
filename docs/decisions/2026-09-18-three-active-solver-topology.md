# Decision: three active solver-family heads

**Date:** 2026-09-18  
**Status:** owner-authorized repository organization decision  
**Supersedes active-solver count in:** `2026-09-17-closed-durable-lane-topology.md` and `2026-09-17-solver-namespace-normalization.md`

## Trigger

The solver landscape has converged.

IsoMax/Isometric is now the active forward structural exact solver. CUDA-BSFP is the active backward symbolic fixed-point solver. SUT is intentionally retained as the future exact composition lane that will bring those two capabilities together.

The older Minimax/Negamax/alpha-beta solver branch and the never-matured Hybrid Confluence branch no longer justify independent durable solver ownership.

## Decision

The current durable topology is:

~~~text
main
    shared accepted domain / oracle / benchmarks / repository routing

research/semantic-quotient
    all Connect4 research
    + historical solver knowledge

solver/isometric
    active IsoMax / forward structural exact solver

solver/cuda-bsfp
    active backward symbolic fixed-point exact solver

solver/sut
    future exact composition of IsoMax + CUDA-BSFP
~~~

There are therefore **three active solver-family heads**.

## Retired solver-family branches

### Minimax / Negamax / alpha-beta

`solver/minimax-alpha-beta` is retired as an active solver family.

Its useful technical knowledge is preserved under:

`research/history/historical-only/solver-lineages/MINIMAX_ALPHA_BETA.md`

The qualified incumbent implementation retained on `main` remains a baseline/reference/conformance comparator. That retained component does not make Minimax an active solver-family lane.

### Hybrid Confluence

`solver/hybrid-confluence` is retired as an active solver family.

It never established a mature unique solver kernel. Its useful exact-composition questions are preserved under:

`research/history/historical-only/solver-lineages/HYBRID_CONFLUENCE.md`

Those questions become design inputs to SUT rather than a reason to maintain a second composition solver family.

## SUT role

SUT is retained deliberately.

Its future purpose is to bring the two active solver capabilities together without absorbing their private internals:

~~~text
IsoMax / Isometric
    forward structural exact knowledge

CUDA-BSFP
    backward fixed-point exact knowledge

            ↓

           SUT
    exact meeting / splice / composition
~~~

SUT remains early-stage. Keeping the lane does not imply that the exact meeting contract, shared representation, concurrency model or cancellation semantics are already established.

Historical Hybrid Confluence questions about exact shared identity, proof-strength ordering, stale exact information, safe supersession/cancellation and bounded falsification controls are now SUT inputs.

## Research ownership

`research/semantic-quotient` remains the single canonical owner of all research, including active IsoMax research, active CUDA-BSFP research, future SUT research, historical Minimax knowledge, historical Hybrid Confluence knowledge, and cross-solver synthesis/provenance.

Solver branches own implementation/contracts/qualification only.

## Branch retirement gate

The retired refs may be deleted after:

1. their useful knowledge and final heads are recorded in canonical research history;
2. current repository and surviving solver routing no longer names them as active owners;
3. no open PR or active workflow depends on them.

At this decision point:

- no open issue/PR reference was found that requires either retired branch;
- no pull-request-triggered workflow run was found on either final branch head;
- final observed heads are recorded in the canonical historical notes.

## Branch creation rule

The durable solver set remains closed.

A new active solver-family head requires explicit owner authorization and a new topology decision. Historical solver ideas do not self-promote back into active branches.

## Current ownership summary

~~~text
ACTIVE IMPLEMENTATION
    solver/isometric
    solver/cuda-bsfp
    solver/sut

HISTORICAL SOLVER LINEAGES
    Minimax / Negamax / alpha-beta
    Hybrid Confluence

REFERENCE IMPLEMENTATION
    components/incumbent on main

RESEARCH AUTHORITY
    research/semantic-quotient
~~~
