# Connect4 Repository Status

## Current IsoMax distribution on main — 2026-10-06

The owner requested the tested NEES-remediated IsoMax as the current solver on
main. Version 0.2.0-rc.5 is packaged under `isomax/`; `npm start` launches it.
JSMinSys remains the support-library and worker-kernel owner, frozen in package
provenance. Main owns this runnable distribution, setup and qualification.
Earlier statements that main only links to an implementation branch are
superseded for this package. Research, CUDA-BSFP and the reference comparator
remain unchanged. See [the current setup](README.md) and
[promotion qualification](docs/qualification/20261006-nees-promotion/README.md).

The organization records below preserve their historical scope and do not select
the current executable or defaults.

**Updated:** 2026-09-18  
**Role:** shared-foundation dashboard and authority router

`main` is the accepted shared Connect4 substrate. It is not the canonical implementation head for any solver family.

## Current IsoMax routing — 2026-10-06

The existing `work/isomax-jsminsys-rebuild` implementation now distributes the
promoted IsoMax 0.2.0-rc.2 package at `isomax/`, replacing its old adapter default.
[Solver setup](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/README.md)
and [qualification](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/docs/qualification/20261006-isomax-package-replacement.md)
are on that solver head, integrated through PR178. The old `solver/isometric`
ref is preserved at `archive/lazy-smp-retirement-20260926/solver/isometric`.

The lane table below preserves the September organization record; use the current
solver link above for executable IsoMax. This routing update does not create a
new solver family or move its kernel into main/research. BSFP and research remain
unchanged.

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

The active IsoMax package and application entry point are on
`work/isomax-jsminsys-rebuild`. The former `solver/isometric` ref is archived.
The current package computes exact W/D/L through its qualified structural
certificates and unresolved native search; it does not consume solved research
answers as runtime inputs.

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
