# RBA candidate — static superset-union trace query 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** deductive candidate; execution qualification pending  
**Authority effect:** none

## Target

For fixed exact subset-antichain `B` and outer mask `a`:

```text
Trace_B(a) = {a AND b | b in B}
P_B(a)     = Max(Trace_B(a))
```

The current wall is computing `P_B(a)` for many `a`.

## Superset-union aggregate

For any mask `q`, define:

```text
S_B(q) = {c in B | q subseteq c}
U_B(q) = OR over S_B(q)
```

For a trace member `q=a AND b`, `S_B(q)` is nonempty because `b in S_B(q)`.

## Exact maximality criterion

Claim:

```text
q in P_B(a)
iff
(a AND U_B(q)) = q.
```

Proof.

`q` is not maximal in `Trace_B(a)` iff some `c in B` has:

```text
q strict-subset (a AND c).
```

Because `q subseteq a`, this is equivalent to:

```text
q subseteq c
and
c contains some selected bit in (a \ q).
```

The first condition says `c in S_B(q)`. The second says some bit of `a\q` appears in the union of all such supersets, namely `U_B(q)`.

Therefore strict domination exists iff:

```text
(a AND U_B(q)) != q.
```

Negating gives the criterion.

## Consequence

A local restricted-image query no longer needs to maintain a skyline.

Exact evaluation can be:

1. build one static index for inner antichain `B`;
2. for outer `a`, emit/deduplicate projections `q=a AND b`;
3. for each distinct `q`, query `U_B(q)`;
4. keep `q` iff `a AND U_B(q) = q`.

The static index is reusable across every outer mask against the same `B`.

## Candidate tree index

A balanced static tree over `B` may store per node:

```text
Union_N        = OR of records
Intersection_N = AND of records
```

For aggregate query `U_B(q)`:

- if `q` is not a subset of `Union_N`, the subtree contains no possible superset and is skipped;
- if `q subseteq Intersection_N`, every record in the subtree contains `q`, so `Union_N` may be accumulated without descending;
- otherwise descend;
- leaves perform exact full-mask subset checks.

This returns the exact union of all supersets of `q`; no approximate signature determines acceptance.

## Expected regime

For union-nearest / wide-trace queries, each projected `q` is close to one or a few original antichain records. Superset families should therefore be sparse and tree queries selective.

For heavily restricted `q`, superset sets may be broad; the already-qualified projection-tree local skyline evaluator may remain preferable.

This suggests an exact hybrid indexed by the same `d_B(a)` / rare-tail preflight already used by the staged planner.

## Qualification plan

1. exhaustive/random exact differential against direct maximal trace;
2. large synthetic near-union control;
3. committed rank33 real stress product;
4. blocked rank26-descent factors after stream reconstruction.

Reject if superset-union queries visit enough of `B` that the total cost is comparable to flat pairwise projection.
