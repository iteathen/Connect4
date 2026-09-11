# Connect4 Repository Status

**Updated:** 2026-09-11  
**Role:** shared-foundation dashboard and authority router

`main` is the accepted shared Connect4 substrate. It is not the canonical implementation head for any of the three active solver lines.

## Canonical durable lanes

| Lane | Canonical branch | Purpose | Current routing note |
| --- | --- | --- | --- |
| Shared product foundation | `main` | accepted domain/spec/oracle/benchmark contracts and repository routing | authoritative shared substrate |
| Minimax / alpha-beta | `solver/minimax-alpha-beta` | exact search implementation and search-specific evidence | first-class solver head |
| CUDA-BSFP | `solver/cuda-bsfp` | BSFP implementation and solver-specific qualification | first-class solver head |
| Hybrid confluence | `solver/hybrid-confluence` | exact minimax + CUDA-BSFP confluence implementation and hybrid qualification | first-class solver head; created from `ed26481faef9ec635d1fd0d790cf7030a29f64ee` |
| Semantic quotient research | `research/semantic-quotient` | solver-neutral future-behavior/minimum-description research | shared research lane |

Read each non-main lane's own `STATUS.md` and `next_step.yaml` before executing work there. Root status/next-step on `main` are routing records only.

## Main branch role

`main` owns facts that must be common and stable across solver lines:

- Connect Four rules, legality and state semantics;
- benchmark positions, fairness and measurement meaning;
- independent oracle/reference behavior;
- accepted shared contracts/conformance vectors;
- repository ownership/routing decisions.

`components/incumbent/` remains on `main` as a qualified reference/baseline comparator. It is not the active minimax solver head.

Solver-specific kernels and performance machinery must not accumulate on `main`. The solver branches are long-lived product heads, not feature branches awaiting wholesale merge.

## Cross-lane flow

Shared accepted changes flow from `main` into solver heads. When a solver discovers a fact that belongs to shared product semantics, the smallest shared change is extracted, qualified and deliberately promoted to `main`; the solver branch itself is not merged wholesale merely to carry that fact.

This makes `main` the common foundation and authority router while allowing the three solvers to optimize independently.

## Current high-level state

### Shared product foundation

C4-0001 through C4-0005 and the qualified incumbent/oracle baseline remain protected on `main`. Shared-domain and benchmark/oracle corrections belong here. Solver-specific contracts/specs remain on their owning solver branch until deliberately promoted as cross-lane authority.

### Minimax

`solver/minimax-alpha-beta` owns exact minimax/negamax/alpha-beta implementation and search-specific optimization/evidence. Its history may diverge substantially from `main`; only shared accepted facts should be promoted back.

### CUDA-BSFP

`solver/cuda-bsfp` owns searchless backward symbolic fixed-point implementation, CUDA qualification and BSFP-specific evidence. Its internal symbolic/quotient/recurrence structures are not `main` concerns unless an accepted consumer-neutral contract is extracted.

### Hybrid confluence

`solver/hybrid-confluence` is the dedicated third solver head for asynchronous exact cooperation between the minimax and CUDA-BSFP lines. It owns confluence transport/scheduling, hybrid proof exchange, hybrid-specific performance experiments and eventual hybrid implementation. It may consume accepted/public behavior from both solver lines without becoming owner of their private internal state.

### Shared semantic research

`research/semantic-quotient` remains the solver-neutral lane for minimum-description/future-behavior representation research. Research does not become shared architecture or solver implementation until deliberately promoted.

## Repository restructuring state

The 2026-09-10 lane restructure established `main`, minimax, CUDA-BSFP and semantic-quotient ownership. The emergence of hybrid confluence triggered the documented reopen condition for a new independently owned solver line. The 2026-09-11 main-role decision extends the topology to three peer solver heads while preserving the original cleanup, research and provenance rules.

Physical ref cleanup and archive evidence remain recorded under `research/`. Those historical cleanup records are not rewritten by this topology update.

## Governing rule

`main` is shared accepted truth, not "the winning solver." Solver heads own implementation. Historical checkpoints should eventually become immutable archive refs/tags plus committed evidence, not long-lived active-looking branches.
