# Evidence status

This repository follows the shared [iteathen evidence and validation policy](https://github.com/iteathen/.github/blob/main/EVIDENCE_POLICY.md).

## Current posture

Connect4 contains qualified repository-controlled domain, benchmark, oracle/reference, and solver-comparison machinery. Unless an evidence record identifies an independent public oracle/reference, those results are **INTERNAL-QUALIFICATION**.

The fact that Connect Four is solved makes this repository unusually suitable for stronger **REFERENCE-GROUNDED** validation, but that stronger classification is granted only to results that actually use an independently specified solved corpus/reference and preserve the comparison provenance.

## Registered claims

| Claim | Evidence class | Status |
| --- | --- | --- |
| `C4-INT-001` — the maintained domain/oracle/benchmark substrate on `main` provides the repository's accepted internal comparator | **INTERNAL-QUALIFICATION** | qualified repository authority |
| `C4-EXT-001` — active solver correctness/performance has been reproduced against an independent standard solved corpus/reference solver | **UNVALIDATED** | external campaign not yet registered here |

Machine-readable records: [`evidence/claims.json`](evidence/claims.json). External evidence belongs under [`evidence/external/`](evidence/external/README.md).

## What current evidence establishes

Current repository qualification can establish behavior relative to the pinned Connect4 semantics, oracle/reference implementation, benchmark protocol, and exact tested solver revisions.

## What it does not establish

Internal benchmark success alone does not establish independent external correctness, comparative algorithmic superiority, cross-machine performance, or third-party reproduction.

## Path to stronger evidence

External qualification should use established solved positions and independently maintained reference material. Record exact positions/corpus revision, expected result, solver revision, configuration, hardware, Node/runtime, nodes/work performed, wall time, memory, raw output, and whether the compared systems perform equivalent work.

Correctness, search-work reduction, and machine performance are separate claims and must remain separately reported.

## Non-mutation rule

Evidence work may run solvers, oracles, benchmarks, and external comparisons. It must not modify solver logic, search semantics, scheduling, domain rules, hot paths, or production composition merely to make an evidence result pass.
