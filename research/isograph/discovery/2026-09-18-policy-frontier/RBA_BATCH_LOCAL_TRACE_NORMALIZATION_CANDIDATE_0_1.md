# RBA candidate — batch local trace normalization 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** candidate exact evaluator; qualification pending  
**Authority effect:** none

## Trigger

The active rank26-descent wall is repeated evaluation of:

```text
P_B(a) = Max({ a AND b | b in B })
```

for one static exact antichain `B` and many outer masks `a`.

The current flat local-skyline and projection-tree evaluators both maintain a local maximal family during the query. They become expensive when the restricted-image skyline is wide.

## Set-family trace formulation

For fixed `B` and outer mask `a`, define the trace:

```text
Trace_B(a) = { a AND b | b in B }.
```

Then the required local result is exactly:

```text
P_B(a) = Max(Trace_B(a)).
```

This is the standard set-family trace/projection operation followed by exact maximal-element extraction.

## Candidate evaluator

For one query `a`:

1. emit all `|B|` projected masks `a AND b`;
2. exact-deduplicate the projected family;
3. maximalize the distinct trace using the already-qualified static dominance-tree normalizer;
4. emit the canonical maximal trace.

No incremental skyline is maintained during projection.

## Exactness

The candidate changes only evaluation order:

```text
incremental:
    Max(stream of a AND b)

batch trace:
    Max(Dedup({a AND b}))
```

Deduplication removes only equal projections. Static maximalization removes exactly strict subsets. Therefore both return the identical set `P_B(a)`.

## Why this is structurally different

When `a` is near `Union(B)`, restriction preserves much of the original antichain and `|P_B(a)|` may approach `|B|`.

In that regime:

- output itself is large;
- scanning `B` once is unavoidable;
- incremental skyline maintenance repeatedly compares against a large live skyline;
- projection-tree pruning may be ineffective because little is dominated;
- batch trace normalization can postpone all dominance work to a static exact index over at most `|B|` projected records.

This is especially relevant to the observed union-nearest rare tails.

## Literature correspondence

The family `{b AND a | b in B}` is a trace of a set family on the coordinate set selected by `a`. Set-family trace/Sperner literature studies these projected families. ZDD family algebra also treats set families as first-class objects with subset/restriction operations; it remains a secondary candidate if explicit trace materialization is still too expensive.

## Qualification plan

1. committed rank33 real stress product;
2. synthetic wide-trace control where restriction removes very few coordinates;
3. exact set equality against the existing local skyline;
4. only then reconstruct/apply to the blocked rank29 factors in the rank26 descent.

Reject this candidate if static per-query normalization merely moves the same wall without reducing total local-query work.
