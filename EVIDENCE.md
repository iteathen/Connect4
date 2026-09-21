# Evidence status

This repository follows the shared [iteathen evidence and validation policy](https://github.com/iteathen/.github/blob/main/EVIDENCE_POLICY.md).

## Current posture

Connect4 contains qualified repository-controlled domain, benchmark, oracle/reference, and solver-comparison machinery. Unless an evidence record identifies an independent public oracle/reference, those results are **INTERNAL-QUALIFICATION**.

The fact that Connect Four is solved makes this repository unusually suitable for stronger **REFERENCE-GROUNDED** validation, but that stronger classification is granted only to results that actually use an independently specified solved corpus/reference and preserve the comparison provenance.

## Registered claims

| Claim | Evidence class | Status |
| --- | --- | --- |
| `C4-INT-001` — the maintained domain/oracle/benchmark substrate on `main` provides the repository's accepted internal comparator | **INTERNAL-QUALIFICATION** | qualified repository authority |
| `C4-ISOMAX-PONS-001` — IsoMax matches externally sourced Pons parent-position W/D/L on deterministic published slices: first 32 rows of each L1 set plus first 64 rows of L2_R1 and L3_R1 | **REFERENCE-GROUNDED** | **192 unique positions; 192 matches; 0 mismatches** |
| `C4-EXT-001` — broad active-solver correctness/performance, including comparative performance and other solver families, has independent external validation | **UNVALIDATED** | broader external campaign remains open |

Machine-readable records: [`evidence/claims.json`](evidence/claims.json). External evidence belongs under [`evidence/external/`](evidence/external/README.md).

## What current evidence establishes

Current repository qualification can establish behavior relative to the pinned Connect4 semantics, oracle/reference implementation, benchmark protocol, and exact tested solver revisions.

In addition, IsoMax has **REFERENCE-GROUNDED parent-position W/D/L correctness evidence** whose sequence/parent-score pairs were reacquired directly from the pinned public Pascal Pons benchmark mirror before execution: first 32 rows of `Test_L1_R1` (32/32), first 32 rows of `Test_L1_R2` (32/32), first 64 rows of `Test_L2_R1` (64/64), and first 64 rows of `Test_L3_R1` (64/64). That is **192 unique external positions, 192 matches, 0 mismatches**. The L1 first-32 campaign used no solver-difficulty prefilter and completed with zero timeouts. The earlier 30-position L1 spot-check campaign is a subset retained only as historical corroboration. The frozen evidence lives on the authoritative `solver/isometric` branch.

## What it does not establish

The registered Pons campaigns establish only the scoped parent-position W/D/L result stated above. The slices are deterministic prefixes of named Pons benchmark sets, not a claim of statistical representativeness over all legal Connect Four positions. They do not establish Pons move-distance parity, correctness of the repository-generated per-move score vectors, comparative algorithmic superiority, cross-machine performance, CUDA-BSFP external correctness, or third-party reproduction.

## Path to stronger evidence

External qualification should use established solved positions and independently maintained reference material. Record exact positions/corpus revision, expected result, solver revision, configuration, hardware, Node/runtime, nodes/work performed, wall time, memory, raw output, and whether the compared systems perform equivalent work.

Correctness, search-work reduction, and machine performance are separate claims and must remain separately reported.

## Non-mutation rule

Evidence work may run solvers, oracles, benchmarks, and external comparisons. It must not modify solver logic, search semantics, scheduling, domain rules, hot paths, or production composition merely to make an evidence result pass.
