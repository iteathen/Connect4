# Connect4 Repository Status

**Updated:** 2026-09-17  
**Role:** shared-foundation dashboard and authority router

`main` is the accepted shared Connect4 substrate. It is not the canonical implementation head for any solver family.

## Canonical durable lanes

| Lane | Canonical branch | Purpose | Current routing note |
| --- | --- | --- | --- |
| Shared product foundation | `main` | accepted domain/spec/oracle/benchmark contracts and repository routing | authoritative shared substrate |
| Research | `research/semantic-quotient` | **all Connect4 research** plus historical solver knowledge | single canonical research owner |
| CUDA-BSFP | `solver/cuda-bsfp` | backward symbolic fixed-point implementation and qualification | active solver head |
| Isometric / IsoMax | `solver/isometric` | forward structural/frontier exact solver implementation | active solver head |
| SUT | `solver/sut` | future exact composition of IsoMax + CUDA-BSFP | active solver head; intentionally early-stage |

This durable set is closed. Agents may not invent another durable lane or promote a temporary branch into a continuity owner without explicit owner instruction and an updated repository-organization decision.

Read each non-main lane's own branch state before execution. Root status/next-step on `main` are routing records only.

## Main branch role

`main` owns facts that must be common and stable across solver lines:

- Connect Four rules, legality and state semantics;
- benchmark positions, fairness and measurement meaning;
- independent oracle/reference behavior;
- accepted shared contracts/conformance vectors;
- repository ownership/routing decisions.

`components/incumbent/` remains on `main` as a qualified reference/baseline comparator. It is not an active solver-head ownership claim.

Solver-specific kernels and performance machinery must not accumulate on `main`.

## Branch hygiene

Temporary `work/*`, `experiment/*`, `feature/*`, handoff, staging and evidence refs are subordinate to a named durable owner. New durable focused `research/*` branches are prohibited.

A temporary branch is retired after useful implementation returns to its solver owner and **all durable research output** is integrated into `research/semantic-quotient` or its provenance archive. Accumulating commits does not make a temporary branch authoritative.

See `docs/decisions/2026-09-18-three-active-solver-topology.md`.

## Cross-lane flow

Shared accepted changes flow from `main` into solver heads. **All research, regardless of which solver produced it, is owned by `research/semantic-quotient`.**

When a solver discovers a shared fact, extract the smallest shared semantic/contract/research change and deliberately promote it to the appropriate shared owner. Solver branches are not merged wholesale to `main` merely to carry history.

## Current high-level state

### Shared product foundation

C4-0001 through C4-0005 and the qualified incumbent/oracle baseline remain protected on `main`. Shared-domain and benchmark/oracle corrections belong here.

### Shared research

`research/semantic-quotient` owns the complete Connect4 research corpus. Historical generic research refs and the former BSFP/Isometric transfer research branch are consolidated into it; no solver-specific durable research branch is valid current topology. Active experiments may remain temporary, but their durable research output belongs here.

### Isometric / IsoMax

`solver/isometric` owns the active forward structural/frontier exact solver. It consumes canonical research and uses recursive exact W/D/L only for unresolved structural residue.

### CUDA-BSFP

`solver/cuda-bsfp` owns the active backward symbolic fixed-point solver, CUDA qualification and BSFP-specific implementation evidence.

### SUT

`solver/sut` is retained as the future exact composition lane for IsoMax + CUDA-BSFP. It remains early-stage; the exact meeting surface, proof-strength exchange and cancellation/concurrency semantics are not yet established.

### Historical solver lineages

Minimax/Negamax/alpha-beta and Hybrid Confluence are no longer active solver-family owners. Their useful knowledge is preserved under `research/history/historical-only/solver-lineages/` on `research/semantic-quotient`.
## Repository restructuring state

The 2026-09-10/11 decisions established the shared-foundation and solver-head model. The 2026-09-17 decisions normalized five then-current solver-family heads. The 2026-09-18 topology decision retires Minimax and Hybrid Confluence, leaving IsoMax, CUDA-BSFP and SUT as the three active solver-family heads.

Historical migration/retirement records remain preserved under `research/`; they are provenance snapshots and are not rewritten to pretend the later topology existed earlier.

## Governing rule

`main` is shared accepted truth, not "the winning solver." Solver heads own implementation; `research/semantic-quotient` owns **all research**; temporary branches must terminate instead of becoming accidental permanent lanes or alternate research authorities.
