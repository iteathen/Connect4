# Minimax master candidate map

This directory is the canonical *construction* for the complete minimax optimization candidate map.

It deliberately does **not** maintain a hand-ranked shortlist. The map is assembled from preserved evidence sources so promoted/current mechanisms remain ordinary candidates rather than privileged assumptions.

## Inputs

1. `docs/research/2026-09-09-historical-107-theory-ledger.md`
   - all 107 preserved historical candidates/forms;
   - parsed mechanically; IDs 1..107 are required with no gaps.
2. `docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json`
   - the later strategic/core candidate universe (`RWS`, `RID`, `SUP`, `AUTO`, `DEAD`, `SEWB`, `A1..A10`, proof memory, schedulers, controls, etc.);
   - all nodes and edges are retained;
   - absent edge means **unassessed**, never neutral.
3. `post-ledger-forms.json`
   - forms discovered or materially changed after the September 9 ledgers, including MQ1-MQ5 semantic state, event-native SEWB, exact DEAD pooling, role-generalized/compiled A1-A3, stage-order forms and current implication retests.
4. `adoption-metadata.json`
   - descriptive adoption/promotion state only.

## Bias firewall

Promotion/adoption is intentionally joined **after** the evidence map is constructed.

The builder asserts that assessment/form records do not contain adoption fields. Adoption state must not alter:

- evidence strength;
- confidence;
- test priority;
- synergy classification;
- negative/positive disposition;
- whether a candidate remains in the map.

A promoted mechanism can therefore appear in `active-or-open` test coverage just like an unpromoted one. Conversely, a historically adverse form is retained even when a newer form of the same mechanism succeeds.

## Mechanism versus form

The map separates underlying mechanisms from tested realizations.

Examples:

- `SEWB` is the mechanism;
  - `SEWB-SCAN` and `SEWB-EVENT-NATIVE` are different forms.
- `A10` is compatible strategic cover;
  - dynamic role-generalized A1-A3, physical-support + DEAD composition, and compiled U1/U2 A1-A3 are distinct forms.
- `RWS` is residual semantic state;
  - identified line-hit quotient, behavioral quotient, residual automaton, MQ5 semantic alpha-beta and WSL-625 representation are different forms/layers.

This prevents a slow implementation form from poisoning the parent idea and prevents a promoted form from erasing competing forms.

## Build / validation

```bash
node research/minimax/candidate-map/build-master-map.mjs
```

Hard validation includes:

- exactly 107 historical rows;
- historical IDs 1..107 with no gaps;
- unique signed-graph node IDs;
- unique post-ledger form IDs;
- relation endpoints must resolve;
- adoption metadata must resolve to existing candidate IDs;
- assessment/form records may not embed adoption/promotion fields.

Generate the merged JSON artifacts with:

```bash
CANDIDATE_MAP_OUT=/tmp/candidate-map \
  node research/minimax/candidate-map/build-master-map.mjs --write
```

Outputs:

- `master-candidate-map.json`
- `coverage-report.json`

The CI workflow uploads both as evidence artifacts.

## Completeness rule

The map is complete only relative to its declared evidence surfaces:

> all 107 historical rows + every signed-v2 node/edge + every explicitly enumerated post-ledger form.

Whenever research creates a materially new mechanism or implementation form, add it to `post-ledger-forms.json` before calling the map complete again.

Do **not** delete superseded or negative forms merely because a stronger form exists. Their evidence remains relevant to implementation-form risk and interaction reasoning.
