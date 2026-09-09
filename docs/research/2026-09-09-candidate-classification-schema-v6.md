# Candidate classification schema v6 — universalization-aware

**Date:** 2026-09-09  
**Status:** current research classification extension; maintained source and `main` unchanged.

This revision retains v5 intrinsic axes, terminal proposition fields, confidence discipline, pairwise compatibility, dependency relations, and the signed interaction graph.

## New relation: universalization / derivability

The current research exposed a relation which is neither intrinsic candidate quality nor ordinary synergy/exclusion:

> Can candidate B's semantic effect be produced as a direct consequence/query of a more general mechanism U, so B no longer needs its own implementation path?

Represent this as:

```text
U => B
```

with separate fields:

- `mapping_kind`;
- `confidence`;
- `evidence_basis`;
- `semantic_preservation`;
- `implementation_displacement`;
- `remaining_special_logic`.

### Mapping kinds

- `exact-direct` — B is exactly one query/consequence of U;
- `derived-theorem` — B follows from U plus existing state facts;
- `shared-representation` — U owns B's representation but not its algorithm;
- `shared-primitive` — B and U use the same lower-level primitive but B remains distinct;
- `partial` — U absorbs only part of B;
- `projected` — plausible but not yet established;
- `not-unified`.

## Why this is not signed interaction

If U derives B exactly:

- semantically, B may remain a useful named theorem/certificate;
- architecturally, B's separate implementation can disappear.

The signed graph may therefore contain:

```text
U -> B_implementation = -3 substitution
```

while the universalization relation says:

```text
U => B_semantics = exact-direct
```

Those are different facts.

## Current universalizers

### `U1` — parity/response algebra

GF(2) event-rank parity plus response/resource/event-order constraints over the support-event poset.

Strong/projected mappings include:

- owner's future-target parity/Zugzwang count;
- Allis Zugzwang compatibility invariant;
- Claimeven fixed ownership;
- Baseinverse/Vertical split ownership;
- Lowinverse/Highinverse/Baseclaim response-pair consequences;
- projected generic compatibility for richer rule fragments.

### `U2` — strategic blocker lattice

Certified blocker subsets represented in the existing 625-ID RID lattice, with solved requirements obtained by upward closure.

Mechanically qualified mappings:

- A1-A9 named `Solutions` coverage relations -> U2 blocker closure: **331,955 generated rule instances, zero mismatches**;
- EXH/BEXH -> degenerate active-requirement queries;
- A10 strategic cover -> U2 terminal coverage query once U1 supplies a coherent blocker set.

U2 is not a new universe; it is a second semantic use of RID.

### Existing deterministic closure universalizer

The previously established tactical/forced normalization already forms another universalizer:

```text
IWIN + DTH + FBLK + repeated forced transit
    -> one deterministic closure operator
```

The semantic facts remain distinct by proof authority, but they should not require independent policy layers.

## Universalization confidence is local

Do not say “candidate is unified” without naming the mechanism and form.

Examples:

- `U2 => A1 coverage`: exact-direct, high confidence;
- `U1 => A8 response strategy`: projected/derived-theorem, medium confidence;
- `RID => IMPL`: shared-representation/shared-primitive, not algorithmic unification;
- `FMAC => AUTO`: not unified, even though FMAC changes AUTO's query volume.

## Decision consequence

When two or more candidates map to the same universalizer, future experiments should compare:

1. named/specialized implementations;
2. universal implementation;
3. combined semantic coverage;
4. total cost and state footprint.

A universal mechanism wins architecturally only if it preserves the candidates' useful semantics **and** costs less than the specialized collection it replaces.

## Current authority

Use with:

- `2026-09-09-universal-strategic-algebra.md`;
- `2026-09-09-unification-candidate-map.md`;
- `2026-09-09-universal-strategic-algebra-test-a.md`;
- v5 terminalization audit/schema;
- signed interaction graph.
