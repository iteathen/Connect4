# Connect4 repository structure

This file defines the live organizational model of the repository. It is routing/documentation, not a replacement for accepted specifications.

## Durable branch topology

```text
main
├── solver/minimax-alpha-beta
├── solver/cuda-bsfp
├── solver/hybrid-confluence
└── research/semantic-quotient
```

`main` is the shared accepted substrate: domain semantics, benchmark/fairness authority, oracle/reference behavior, accepted cross-lane contracts and repository-level routing. It is **not** a fourth solver implementation line.

The three `solver/*` branches are intentionally long-lived peer product heads:

- `solver/minimax-alpha-beta` owns minimax/negamax/alpha-beta implementation and evidence;
- `solver/cuda-bsfp` owns CUDA-BSFP implementation and evidence;
- `solver/hybrid-confluence` owns the hybrid exact-confluence implementation and evidence.

`research/semantic-quotient` owns solver-neutral mathematical/representational research that can feed any solver line.

Long-lived branch names represent ongoing owners/product lines. One-off experiments should use short-lived work branches and land durable findings/evidence into the owning lane before the temporary ref is retired.

## Main branch contract

A change belongs on `main` when it is shared accepted product truth rather than one solver's implementation choice. Typical `main` ownership includes:

- Connect Four rules, legality and state semantics;
- benchmark positions, fairness rules and measurement meaning;
- independent oracle/reference behavior;
- shared product qualification contracts and conformance vectors;
- accepted cross-lane interfaces/identities;
- repository routing, ownership and release/promotion decisions.

A change does **not** belong on `main` merely because it is useful to more than one solver. Solver kernels, minimax scheduling/TT policy, BSFP recurrence/storage, hybrid confluence scheduling/transport and solver-specific performance machinery stay on their solver head unless a consumer-neutral shared contract is deliberately extracted.

The qualified incumbent under `components/incumbent/` is retained on `main` as a baseline/reference comparator. It is not the canonical minimax product implementation and must not be used to infer solver ownership.

## Cross-lane synchronization

The branch model is asymmetric on purpose:

```text
shared accepted change
main ----------------------> solver heads

solver discovery
solver head --selective promotion/qualification--> main
```

Solver branches are **not** expected to merge wholesale back into `main`. When solver work reveals a shared fact, extract the smallest shared semantic/contract/evidence change and promote it deliberately. This avoids turning `main` into whichever solver happened to move fastest.

Likewise, `solver/hybrid-confluence` may compose public/accepted behavior from minimax and BSFP without taking ownership of their private hot structures. Shared physical state is adopted only when measured benefit justifies the locality/synchronization cost.

## Filesystem ownership

### Shared maintained implementation on `main`

```text
components/domain/
components/oracle/
components/incumbent/   # qualified reference/baseline only
benchmarks/
```

`main` must not gain solver-owned maintained surfaces such as `components/bsfp/`, `components/minimax/`, or `components/hybrid-confluence/`.

### Solver maintained implementation

Solver-specific maintained code belongs on the owning `solver/*` branch under a coherent solver-owned component namespace. The exact internal topology may differ by solver; branch ownership is semantic, not a requirement to make all three directory trees visually identical.

### Accepted contracts

```text
docs/specs/
docs/decisions/
```

`docs/specs/` owns accepted/candidate contracts according to each file's stated status. `docs/decisions/` records explicit promotion, rejection, supersession and ownership decisions so architecture does not have to be reconstructed from the newest research report.

### Reference/provenance

```text
reference/legacy-source/
reference/conformance/
reference/oracles/
```

`reference/` is for provenance, frozen conformance/reference inputs and immutable oracle material.

Historical `reference/research-prototypes/` trees are grandfathered for reproducibility. **Do not add new experiments to that catch-all path.** New experiments should use the owning lane's `research/` namespace.

### New research packets

Future research should be organized as:

```text
research/
  <topic-or-lane>/
    <experiment-or-study>/
      README.md
      src/            # when executable research exists
      evidence/       # raw/structured evidence when practical
      manifest.json   # source identity, environment, commands, disposition
```

Solver-neutral future-behavior/quotient work belongs on `research/semantic-quotient`; solver-specific experiments belong on their solver branch. Hybrid-confluence research may remain on a research lane until it becomes implementation, at which point implementation belongs on `solver/hybrid-confluence`.

## Evidence discipline

A research packet should distinguish:

- question/falsifier;
- exact source/base identities;
- qualification scope;
- raw evidence versus derivative summary;
- positive, negative and adverse results;
- disposition: promote, retain candidate, reject tested form, superseded, or historical only.

A report does not become architecture authority just because it is recent. Promotion is explicit.

## Branch retirement

`research/MIGRATION_MANIFEST.json` freezes branch heads observed during the 2026-09-10 restructure. `research/BRANCH_RETIREMENT.md` classifies obsolete/duplicate refs and names the canonical descendant when known.

Deletion is allowed only after the exact source SHA is preserved and either:

1. the branch is a confirmed ancestor/duplicate of a canonical lane; or
2. its unique durable information is preserved by committed evidence/manifest/archive reference.

Physical cleanup results and exact archive tags are recorded in `research/RETIREMENT_PROOFS.json` and `research/BRANCH_RETIREMENT.md`. Historical classifications never override live dependency checks.
