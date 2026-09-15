# Clause-coverage support-edge cofactor

**Status:** deductive exact transform with complete variable-control support-edge qualification.

**Research direction:** Josh Oshiro.

## Result

Let

```text
S' = S union {x}
```

be a legal one-cell support extension and let `D(S')`, `D(S)` be the qualified support-local clause dictionaries.

A clause-frontier record is stored by its upward clause-coverage signature

```text
U_S(R)
  = { d in D(S) | exists minimal clause c in R with c subseteq d }.
```

The exact BSFP cofactor can be computed **directly from the complete coverage signature**. It is unnecessary to reconstruct the record's subset-minimal clause family first.

This turns cofactor into a precomputable Boolean support-edge transform plus one exact opponent-kill condition.

## Clause map

For each child clause `c in D(S')`:

### Beneficiary owns x

If

```text
x in c,
```

the clause is satisfied and contributes nothing to the parent record.

Otherwise

```text
c -> c,
```

and `c` belongs to `D(S)`.

### Opponent owns x

Map

```text
c -> c \ {x}.
```

If the result is empty then necessarily

```text
c = {x},
```

and the entire record is impossible.

Every other nonempty result belongs to `D(S)`.

## Why every coverage bit may be transformed

Coverage contains both the record's minimal clauses and dictionary clauses above them in the clause-subset order.

Suppose

```text
c subseteq d.
```

Under beneficiary=true:

- if `x in c`, then `x in d`, so both are satisfied/deleted;
- if neither contains `x`, both survive unchanged and the subset relation remains;
- if `c` excludes `x` but `d` contains `x`, `d` disappears while the load-bearing smaller clause `c` survives.

Under opponent=false:

```text
c \ {x} subseteq d \ {x}.
```

Therefore a nonminimal child clause can never create a stronger parent prerequisite than its mapped smaller clause.

Consequently it is exact to compute

```text
U_parent
  = OR over every set child coverage bit i
      ParentCoverageContribution(edge, relation, i),
```

rather than extracting only the minimal child clauses.

The sole record-level conflict is the opponent case where coverage contains singleton clause `{x}`. Because no nonempty clause is a proper subset of `{x}`, its coverage bit is set iff `{x}` is itself a minimal prerequisite. It is therefore an exact kill bit.

## Device forms

Two equivalent execution shapes are available.

### Scatter

For each set child coverage ID:

```text
parentCoverage |= precomputedContribution[edge][relation][childClauseId]
```

and test the opponent kill bit.

### Gather

For each parent coverage ID `j`, precompute a child source mask:

```text
Source[edge][relation][j]
```

such that

```text
parentCoverage[j] = any(childCoverage & Source[j]).
```

Scatter is attractive for sparse coverage signatures; gather gives fixed work per parent dictionary and may be preferable for dense signatures / GPU lanes. They are execution forms of the same exact transform.

## Structural qualification

Harness:

```text
research/experiments/bsfp-clause-cofactor/qualify.mjs
```

It checks every support edge of the selected variable geometries for:

1. beneficiary clause-map closure into `D(S)` or exact satisfaction;
2. opponent clause-map closure into `D(S)` or exact singleton conflict;
3. preservation of the clause subset/redundancy order for every comparable child dictionary pair.

Complete control totals:

```text
supports:                    7,612
legal support edges:        27,180
clause relation mappings: 1,039,590
comparable clause pairs:    747,076
closure failures:                 0
order failures:                   0
```

The tested geometries were:

```text
3x3 c3
3x4 c3
3x5 c3
4x3 c2
4x3 c3
4x4 c3
4x4 c4
4x5 c4
5x3 c4
5x4 c4
```

An independent recurrence-level observer additionally compared the direct clause-array cofactor against the coverage transform on 857,668 actual record/edge/relation cases from those complete solves, including 158,149 opponent-conflict cases, with zero mismatches. The deductive/order argument above is the general authority; the recurrence census is supporting qualification.

## Interaction with variable size

Nothing in the transform assumes a fixed coverage width.

For a support-local dictionary with `m=|D(S)|`:

```text
coverageWords = ceil(m / backendWordBits).
```

The Boolean map becomes a multiword matrix/OR transform when `m` exceeds one or two machine words.

Specialized one-word/two-word kernels are permitted execution profiles, not semantic limits.

## Interaction with reflection

Horizontal reflection maps the entire edge package equivariantly:

```text
parent dictionary
child dictionary
landing cell
kill bit
coverage contribution table.
```

Therefore the transform should be generated once per canonical support-edge orbit plus orientation metadata when the reflection quotient is enabled.

## Consequence for the CUDA profile

The principal hot operations of the clause-coverage BSFP candidate can now all remain in dense bitset form:

```text
universal composition:
    OR

frontier implication/dominance:
    subset

cofactor:
    precomputed Boolean coverage transform + kill bit

bounded legal-slice rejection:
    singleton popcount / coverage subset tests
```

Variable clause arrays are no longer required on the hot device recurrence after support/orbit preprocessing.

## Disposition

Promote the support-edge coverage cofactor as the device-facing exact cofactor for the clause-coverage profile.

Next qualify scatter versus gather execution shape on real BSFP frontier fixtures. Do not infer device profitability from the algebra alone.
