# Connect4 repository structure

This file defines the live organizational model of the repository. It is routing/documentation, not a replacement for accepted specifications.

## Durable branch topology

```text
main
├── research/semantic-quotient
├── solver/minimax-alpha-beta
├── solver/cuda-bsfp
├── solver/hybrid-confluence
├── solver/isometric
└── solver/sut
```

`main` is the shared accepted substrate: domain semantics, benchmark/fairness authority, oracle/reference behavior, accepted cross-lane contracts and repository-level routing. It is not a solver implementation line.

`research/semantic-quotient` is the **single canonical owner of all Connect4 research**, including solver-specific research observations, hypotheses, experiment results, research evidence, negative results, open questions, maps, synthesis, and provenance.

The five solver-family heads are peers:

- `solver/minimax-alpha-beta` — minimax/negamax/alpha-beta implementation and evidence;
- `solver/cuda-bsfp` — CUDA-BSFP implementation and evidence;
- `solver/hybrid-confluence` — hybrid exact-confluence implementation and evidence;
- `solver/isometric` — Isometric structural/frontier implementation and evidence;
- `solver/sut` — SUT (`S ∪ T`) implementation lineage.

The durable set is closed by `docs/decisions/2026-09-17-solver-namespace-normalization.md`. An agent may not create another durable lane without explicit owner instruction.

## Temporary branch lifecycle

One-off implementation/research work should use temporary branches only when isolation is useful. Typical temporary refs include `work/*`, `experiment/*`, `feature/*`, handoff/staging and evidence refs. Do not create another durable focused `research/*` branch.

Every temporary branch must have:

- one durable owning lane;
- one bounded question/change;
- acceptance or falsification criteria;
- a retirement condition.

Before retirement, durable implementation goes to the owning solver lane, while every durable research result, hypothesis, falsifier, research-evidence packet, negative result and unresolved question goes to `research/semantic-quotient`. Historically useful source state is preserved as provenance or an immutable archive ref. A temporary branch never gains authority simply because more work accumulated on it.

## Main branch contract

A change belongs on `main` when it is shared accepted product truth rather than one solver's implementation choice. Typical `main` ownership includes:

- Connect Four rules, legality and state semantics;
- benchmark positions, fairness rules and measurement meaning;
- independent oracle/reference behavior;
- shared product qualification contracts and conformance vectors;
- accepted cross-lane interfaces/identities;
- repository routing, ownership and release/promotion decisions.

A change does not belong on `main` merely because it is useful to more than one solver. Solver kernels, scheduling, TT policy, BSFP recurrence/storage, structural consequence execution, confluence machinery and SUT composition remain on their owning solver head unless a consumer-neutral shared contract is deliberately extracted.

The qualified incumbent under `components/incumbent/` is retained on `main` as a baseline/reference comparator. It is not the canonical minimax implementation.

## Cross-lane synchronization

The branch model is asymmetric:

```text
shared accepted change
main ----------------------> solver heads

all research
research/semantic-quotient ------> solver consumers

solver discovery
solver head -- selective qualification/promotion --> shared owner
```

Solver branches are not expected to merge wholesale back into `main`. When solver work reveals a shared fact, extract the smallest shared semantic/contract/research change and promote it deliberately.

Historical ancestry does not transfer ownership. In particular, Isometric remains distinct from its Negamax/minimax ancestry, and SUT remains distinct from Isometric, BSFP and Hybrid Confluence.

## Filesystem ownership

### Shared maintained implementation on `main`

```text
components/domain/
components/oracle/
components/incumbent/   # qualified reference/baseline only
benchmarks/
```

`main` must not gain solver-owned maintained kernels merely for history synchronization.

### Solver maintained implementation

Solver-specific maintained code belongs on its durable solver-family branch under a coherent solver-owned component namespace. Internal topology may differ by solver.

### Canonical research

**All research** is normalized and preserved on `research/semantic-quotient`:

```text
research/canonical/
research/evidence/
research/hypotheses/
research/open-questions/
research/maps/
research/provenance/
```

Solver-specific research experiments may live on an explicitly temporary `experiment/*` or `work/*` branch while active, but every durable research artifact and semantic result must route back through canonical research. Solver branches own implementation and implementation qualification, not separate research corpora.

### Accepted contracts

```text
docs/specs/
docs/decisions/
```

`docs/specs/` owns accepted/candidate contracts according to each file's declared status. `docs/decisions/` records explicit promotion, rejection, supersession and ownership decisions.

### Reference/provenance

```text
reference/legacy-source/
reference/conformance/
reference/oracles/
```

Historical `reference/research-prototypes/` trees are grandfathered for reproducibility. Do not add new work there by default.

## Evidence discipline

Research/implementation packets should distinguish question, exact source/base identity, qualification scope, raw evidence, negative/adverse results and disposition.

A report does not become architecture authority because it is recent, and a branch does not become durable because it is large.

## Branch retirement

A temporary ref may be removed only after its exact head is preserved and either:

1. it is a confirmed ancestor/duplicate of a durable lane; or
2. its unique durable code/research/evidence is preserved by the owner lane or an immutable archive.

Historical cleanup ledgers remain under `research/`. They are provenance snapshots and do not override current live dependency checks.
