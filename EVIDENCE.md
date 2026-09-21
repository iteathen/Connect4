# Evidence status

This repository follows the shared [iteathen evidence and validation policy](https://github.com/iteathen/.github/blob/main/EVIDENCE_POLICY.md).

## Current posture

Connect4 contains qualified repository-controlled domain, benchmark, oracle/reference, and solver-comparison machinery. Unless an evidence record identifies an independent public oracle/reference, those results are **INTERNAL-QUALIFICATION**.

The fact that Connect Four is solved makes this repository unusually suitable for stronger **REFERENCE-GROUNDED** validation, but that stronger classification is granted only to results that actually use an independently specified solved corpus/reference and preserve the comparison provenance.

## Registered claims

| Claim | Evidence class | Status |
| --- | --- | --- |
| `C4-INT-001` — the maintained domain/oracle/benchmark substrate on `main` provides the repository's accepted internal comparator | **INTERNAL-QUALIFICATION** | qualified repository authority |
| `C4-ISOMAX-PONS-001` — IsoMax matches externally sourced Pons parent-position W/D/L on the frozen first 64 `Test_L3_R1` and first 64 `Test_L2_R1` positions | **REFERENCE-GROUNDED** | **128/128 matched; 0 mismatches** |
| `C4-EXT-001` — broad active-solver correctness/performance, including comparative performance and other solver families, has independent external validation | **UNVALIDATED** | broader external campaign remains open |

Machine-readable records: [`evidence/claims.json`](evidence/claims.json). External evidence belongs under [`evidence/external/`](evidence/external/README.md).

## What current evidence establishes

Current repository qualification can establish behavior relative to the pinned Connect4 semantics, oracle/reference implementation, benchmark protocol, and exact tested solver revisions.

In addition, IsoMax has **REFERENCE-GROUNDED parent-position W/D/L correctness evidence** on 128 frozen positions whose sequence/parent-score pairs were revalidated against the pinned public Pascal Pons benchmark mirror before execution: 64/64 from `Test_L3_R1` and 64/64 from `Test_L2_R1`, with zero mismatches. The frozen evidence lives on the authoritative `solver/isometric` branch.

## What it does not establish

The registered Pons campaigns establish only the scoped parent-position W/D/L result stated above. They do not establish Pons move-distance parity, correctness of the repository-generated per-move score vectors, comparative algorithmic superiority, cross-machine performance, CUDA-BSFP external correctness, or third-party reproduction.

## Path to stronger evidence

External qualification should use established solved positions and independently maintained reference material. Record exact positions/corpus revision, expected result, solver revision, configuration, hardware, Node/runtime, nodes/work performed, wall time, memory, raw output, and whether the compared systems perform equivalent work.

Correctness, search-work reduction, and machine performance are separate claims and must remain separately reported.

## Non-mutation rule

Evidence work may run solvers, oracles, benchmarks, and external comparisons. It must not modify solver logic, search semantics, scheduling, domain rules, hot paths, or production composition merely to make an evidence result pass.
