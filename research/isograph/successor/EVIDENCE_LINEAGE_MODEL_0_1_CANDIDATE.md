# Evidence lineage model 0.1 candidate

**Status:** successor-authority candidate; motivated by the C4-R0044 cold-reconstruction discrepancy.

## Invariant

```text
citation occurrence != artifact identity != evidence event != independent evidence lineage
```

A normalized evidence file and the raw provenance report from which it was derived may be two distinct artifacts while carrying one evidentiary event/lineage.

## Required graph roles

- **citation occurrence** — one claim-to-artifact reference occurrence;
- **artifact identity** — immutable Git/content identity of a file/report/code/evidence object;
- **evidence event** — the observation/derivation/qualification act that bears on a claim;
- **evidence lineage** — common causal/provenance origin for evidence events/artifacts;
- **independence group** — events that must not be multiplied as independent Bayesian evidence;
- **reproduction event** — a later execution intended to reproduce/qualify an earlier event;
- **supports/contradicts/constrains/qualifies** — claim/evidence semantic direction;
- **derived_from/summarizes** — artifact-to-artifact transformation relation.

## C4-R0044 motivating case

Two source entries are present and both are correct:

1. normalized `representation-algebra.json`;
2. detailed OQS residual-reuse provenance report.

Both resolve to the same native source/run/evidence commit. Therefore:

```text
source array length            = 2
distinct artifact identities   = 2
independent evidence lineages  = 1
```

The cold decoder's `source_count = 1` was wrong under the requested mechanical field, but it exposed a semantic quotient the existing graph does not represent explicitly.

## Confidence rule

Only evidence events/lineages with explicit independence authority may contribute as independent empirical updates.

File count, citation count, geometry count, repetition count, or normalized/raw duplication never establish independence by themselves.

## Successor qualification control

The 1.1 cold decoder must answer three separate questions for C4-R0044:

- number of claim citation occurrences;
- number of distinct evidence artifacts;
- number of independently countable evidence lineages.

Expected result for the frozen motivating lineage is `2 / 2 / 1`.
