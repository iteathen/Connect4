# RBA local restricted-image research start checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Live head before this checkpoint:** `81d96e67feed1d13528f9ddb7d0bd04501f9a04d`  
**Status:** execution start / crash-safe seam  
**Authority effect:** none

## Active blocked operation

Selected rank26 descent is blocked inside the first missing rank27 draw15 child.

Current blocked descendant:

```text
support [4,3,2,2,6,6,6]
rank 29
threshold draw13

Upper = 117,781
Lower unresolved

Lower factors:
f0 = 110,523
f1 =  34,867
f2 =  24,148
f3 =  56,637
```

The repeated active operation is:

```text
P_B(a) = Max({ a AND b | b in B })
```

for one fixed exact inner antichain `B` and many outer masks `a`.

## Already-falsified / insufficient continuations

Do not resume these by inertia:

- factor-order permutation alone;
- repeated core-relative absorption after its exact fixed point;
- existing projection-tree evaluator alone;
- parallel flat local-skyline evaluator alone;
- global-normalizer changes as the primary remedy;
- principal-cover/preimage optimization (that is already separately collapsed by shared-target DP).

Known bounded failures include absorbed residual products:

```text
62,179 x 29,512   indexed >180 s
62,179 x 29,512   parallel flat >240 s
129,662 x 56,605 indexed >240 s
102,950 x 73,215 indexed >240 s
60,097 x 53,185  indexed >240 s
```

## Exact question for this pass

Find a fundamentally different exact representation or evaluator for the maximal restricted-image query:

```text
P_B(a) = Max({a AND b | b in B})
```

that shares work across many outer masks or avoids enumerating most inner records, while preserving the exact output stream.

Promising classes to investigate include:

- family-trace / projection representations;
- ZDD/BDD restriction with maximal-element extraction;
- hypergraph / transversal or closure duals;
- concept-lattice / closure-system indexes;
- trie / DAG representations sharing intersections across nearby outer masks;
- batch algorithms that compute many `P_B(a)` together rather than one outer query at a time.

## Falsifier

A candidate is not progress if it merely rephrases the existing subtree-union projection tree or trades the same pairwise intersections for a slower symbolic structure.

Require exact differential against persisted RBA factors/outputs before promotion.

## Crash-safe rule

Checkpoint each new law, negative result, candidate rejection, or exact differential before switching approaches. Do not leave the only copy in chat or transient runtime state.
