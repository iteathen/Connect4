# RBA superset-union trace query qualification 0.2

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact criterion qualified; vertical bitset index promising; balanced aggregate tree rejected  
**Authority effect:** none

## Exact criterion

For fixed exact inner antichain `B`, outer mask `a`, and trace member `q=a AND b`:

```text
S_B(q) = { c in B | q subseteq c }
U_B(q) = OR over S_B(q)
```

Then:

```text
q is maximal in {a AND b | b in B}
iff
(a AND U_B(q)) = q.
```

Equivalent strict-domination form:

```text
q is nonmaximal
iff
exists selected bit x in (a \ q)
such that some c in B contains q union {x}.
```

This converts local skyline maintenance into static superset-existence/aggregation over the inner family.

## Exact differential

A vertical incidence implementation was tested on deterministic random antichains:

```text
universes       4..12 bits
cases           4,500
mismatches          0
```

Each item/bit owns a vertical row-bitset of inner records containing it. Superset rows for `q` are the bitwise intersection of the postings for every bit in `q`. Strict domination is detected by intersecting those rows with postings for selected bits in `a\q`.

No hash/fingerprint determines equality or dominance.

## Negative tree implementation

A balanced tree storing only subtree:

```text
Union_N
Intersection_N
```

was exact but ineffective on a dense 29,512-record synthetic pressure family. Subtree unions saturated the full universe while intersections became empty, forcing essentially every query through every leaf.

Disposition:

```text
superset-union criterion     retained
union/intersection tree      rejected for current dense regime
```

## Vertical bitset pressure control

Synthetic exact antichain:

```text
universe bits          76
inner records      29,512
record popcount        38
outer missing bits      5
distinct trace      29,512
maximal trace       29,512
```

Vertical bitset index:

```text
index build             ~0.281 s
full trace query         ~0.793 s
exact output            29,512
```

Direct one-shot batch maximalization control:

```text
~7.810 s
```

Exact set match:

```text
YES
```

So on this union-nearest pressure control the vertical superset-query form is roughly an order of magnitude faster after a small reusable index build.

This is synthetic performance evidence only; it is not yet a real Connect4 scaling claim.

## Literature correspondence

The data structure is the standard vertical incidence / transaction-bitset representation used in Eclat-family itemset mining and related set-containment workloads: one bitset records all rows containing an item, and conjunction intersects supporting rows. The RBA novelty here is the exact maximal-trace criterion using those superset rows.

## Next

Reconstruct a durable real-factor harness and test the vertical superset-query evaluator on:

1. committed rank33 real stress local projections;
2. union-nearest rare tails;
3. the blocked rank26-descent product `62,179 x 29,512`.

Persist the harness before the expensive real-factor run.

Frozen authority 1.1 is unchanged.
