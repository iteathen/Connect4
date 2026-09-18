# Connect4 Repository Status

**Updated:** 2026-09-17  
**Role:** shared-foundation dashboard and authority router

`main` is the accepted shared Connect4 substrate. It is not the canonical implementation head for any solver family.

## Canonical durable lanes

| Lane | Canonical branch | Purpose | Current routing note |
| --- | --- | --- | --- |
| Shared product foundation | `main` | accepted domain/spec/oracle/benchmark contracts and repository routing | authoritative shared substrate |
| Research | `research/semantic-quotient` | **all Connect4 research**: normalized claims, derivations, hypotheses, experiments/results, research evidence, negative results, open questions, synthesis and provenance | single canonical research owner |
| Minimax / alpha-beta | `solver/minimax-alpha-beta` | exact search implementation and search-specific evidence | first-class solver head |
| CUDA-BSFP | `solver/cuda-bsfp` | backward symbolic fixed-point implementation and qualification | first-class solver head |
| Hybrid confluence | `solver/hybrid-confluence` | exact hybrid-confluence implementation and qualification | first-class solver head |
| Isometric | `solver/isometric` | structural-calculus / frontier-exact solver implementation | first-class solver head |
| SUT | `solver/sut` | SUT (`S ∪ T`) solver lineage | first-class solver head; intentionally early-stage |

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

See `docs/decisions/2026-09-17-solver-namespace-normalization.md`.

## Cross-lane flow

Shared accepted changes flow from `main` into solver heads. **All research, regardless of which solver produced it, is owned by `research/semantic-quotient`.**

When a solver discovers a shared fact, extract the smallest shared semantic/contract/research change and deliberately promote it to the appropriate shared owner. Solver branches are not merged wholesale to `main` merely to carry history.

## Current high-level state

### Shared product foundation

C4-0001 through C4-0005 and the qualified incumbent/oracle baseline remain protected on `main`. Shared-domain and benchmark/oracle corrections belong here.

### Shared research

`research/semantic-quotient` owns the complete Connect4 research corpus. Historical generic research refs and the former BSFP/Isometric transfer research branch are consolidated into it; no solver-specific durable research branch is valid current topology. Active experiments may remain temporary, but their durable research output belongs here.

### Minimax

`solver/minimax-alpha-beta` owns exact minimax/negamax/alpha-beta implementation and search-specific optimization/evidence.

### CUDA-BSFP

`solver/cuda-bsfp` owns searchless backward symbolic fixed-point implementation, CUDA qualification and BSFP-specific evidence.

### Hybrid confluence

`solver/hybrid-confluence` is a durable solver-family head for exact confluence/composition work. It is distinct from SUT and must have branch-local execution state rather than inherit `main`'s dashboard indefinitely.

### Isometric

`solver/isometric` owns the structural-calculus / frontier-exact solver family governed by its branch-local routing and C4-0011. Historical terminal-frontier experiment branches are provenance, not continuity owners.

### SUT

`solver/sut` owns the distinct SUT (`S ∪ T`) solver lineage. It is intentionally early-stage and currently carries a direction sketch rather than an established architecture or performance claim. SUT is not a rename of Hybrid Confluence, Isometric or BSFP.

## Repository restructuring state

The 2026-09-10/11 decisions established the shared-foundation and solver-head model. The 2026-09-17 decision reopens the topology after Isometric and SUT became explicit solver families and closes the durable set to prevent agent-created branch sprawl.

Historical migration/retirement records remain preserved under `research/`; they are provenance snapshots and are not rewritten to pretend the later topology existed earlier.

## Governing rule

`main` is shared accepted truth, not "the winning solver." Solver heads own implementation; `research/semantic-quotient` owns **all research**; temporary branches must terminate instead of becoming accidental permanent lanes or alternate research authorities.
