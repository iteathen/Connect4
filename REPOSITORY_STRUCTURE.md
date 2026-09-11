# Connect4 repository structure

This file defines the live organizational model of the repository. It is routing/documentation, not a replacement for accepted specifications.

## Durable branch topology

```text
main
├── solver/minimax-alpha-beta
├── solver/cuda-bsfp
└── research/semantic-quotient
```

`main` owns accepted baseline/domain/spec/oracle state. Solver branches own solver-specific implementation and evidence. `research/semantic-quotient` owns shared mathematical/representational research that can feed either solver.

Long-lived branch names must represent an ongoing owner or product lane. One-off experiments should use short-lived work branches and land durable findings/evidence into the owning lane before the temporary ref is retired.

## Filesystem ownership

### Maintained implementation

```text
components/
benchmarks/
tools/
```

These contain maintained/product implementation on the branch where they are authoritative. Research-only code should not be promoted here merely because it became large.

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

Solver-neutral future-behavior/quotient work belongs on `research/semantic-quotient`; solver-specific experiments belong on their solver branch.

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

`research/MIGRATION_MANIFEST.json` freezes branch heads observed during this restructure. `research/BRANCH_RETIREMENT.md` classifies obsolete/duplicate refs and names the canonical descendant when known.

Deletion is allowed only after the exact source SHA is preserved and either:

1. the branch is a confirmed ancestor/duplicate of a canonical lane; or
2. its unique durable information is preserved by committed evidence/manifest/archive reference.

The migration tooling available in this session cannot delete Git refs or create tags. Classification is therefore authoritative for intended disposition; physical ref cleanup remains a separate verified operation.
