# Connect4 IsoGraph logic authority 1.1 — successor profile candidate

**Status:** candidate; authority 1.0 remains frozen historical qualification evidence pending successor qualification.

## Goal

Represent the entire current Connect4 logic corpus without repeating authority 1.0's under-complete manually selected boundary.

## Corpus boundary construction

The corpus universe is role- and dependency-closed.

### Root authority/routing set

Start from the frozen repository revision with:

- root `AGENTS.md`, `README.md`, `AGENT_LOCAL.md`, `STATUS.md`, `next_step.yaml`;
- all current `docs/decisions/**`;
- all `docs/specs/**`;
- `docs/research/RESEARCH_INDEX.md`;
- `research/AGENTS.md`, `research/README.md`;
- `research/canonical/**`;
- `research/maps/**`;
- `research/hypotheses/**`;
- `research/open-questions/**`;
- `research/confidence/**`;
- current taxonomy/policy surfaces under `research/evidence/`, `research/experiments/`, `research/history/`, `research/provenance/`, and `research/untriaged/`;
- current solver-neutral research routing under `research/semantic-quotient/`.

### Dependency closure

Recursively include repository-local objects referenced by a current-logic/current-policy object when the reference is load-bearing for:

- theorem/claim meaning;
- guard/scope definition;
- evidence interpretation;
- epistemic classification;
- ownership/routing;
- experiment disposition;
- negative-result meaning;
- active research continuation.

References into implementation code or raw evidence are included at least as exact provenance/evidence objects and classified explicitly; they need not be promoted to current logical assertions.

### Role accounting

Every object in the closure receives exactly one primary role:

- `current_logic`
- `current_policy_or_routing`
- `source_native_unresolved_logic`
- `normalized_evidence`
- `raw_evidence_or_provenance`
- `historical_only`
- `implementation_qualification`
- `non_logic_implementation`
- `classification_unresolved`

`classification_unresolved` is an explicit migration uncertainty. It cannot be dropped and blocks authority promotion until resolved or justified as source-native ambiguity.

## Evidence lineage model

The successor graph distinguishes:

```text
citation occurrence
artifact identity
evidence event
evidence lineage / independence group
reproduction event
claim-support relation
```

Two claim source entries may be two distinct artifacts but one evidence lineage.

No confidence update, support count, reproduction count, or synthesis rule may use artifact count as a proxy for independent evidence.

Every empirical normalized evidence event must bind:

- affected claim(s);
- event kind;
- exact workload/conditions;
- immutable artifact/provenance identity;
- evidence-event identity;
- independence-group identity;
- direction;
- reproduction relationship where applicable;
- source-derived/summary relationship where applicable.

## Qualification additions over 1.0

Authority 1.1 must pass all 1.0 gates plus:

1. dependency-closure completeness;
2. omitted-router/adversarial file controls;
3. evidence-lineage identity and independence-group audit;
4. zero unresolved migration classifications;
5. cold reconstruction that asks for citation count, artifact count, and independent-lineage count separately;
6. negative control proving two artifacts from one experiment are not counted as two independent evidence events.

## Promotion rule

Authority 1.0 is not edited in place. Authority 1.1 can supersede it only through a new immutable manifest, fresh qualification review, and explicit promotion decision.
