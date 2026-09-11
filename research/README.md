# Connect4 research namespace

`research/` is the canonical home for **new** experiment packets and cross-solver research records.

Historical experiments remain in their original committed paths for reproducibility. In particular, `reference/research-prototypes/` is grandfathered historical material and should not receive new experiments.

## Ownership

- search/minimax-specific experiments live on `solver/minimax-alpha-beta`;
- CUDA-BSFP-specific experiments live on `solver/cuda-bsfp`;
- shared state/equivalence/quotient research lives on `research/semantic-quotient`.

The branch owns the research first; the directory organizes the packet. Do not copy every experiment into every branch.

## Packet shape

Prefer:

```text
research/<topic>/<experiment>/
  README.md
  manifest.json
  src/
  evidence/
```

`README.md` should state the question, falsifier, result and disposition. `manifest.json` should capture exact source/base identities, environment, commands, evidence hashes and whether artifacts are authoritative, derivative, or missing.

## Required disposition vocabulary

Use one of:

- `promote_candidate`
- `retain_research_candidate`
- `reject_tested_form`
- `superseded`
- `historical_only`
- `incomplete_or_missing_artifact`

Do not delete adverse results simply because a later candidate wins.

## Current migration records

- `MIGRATION_MANIFEST.json` — exact pre-restructure branch census and disposition
- `BRANCH_RETIREMENT.md` — human-readable cleanup ledger

These records preserve topology/provenance; they are not solver-semantic authority.
