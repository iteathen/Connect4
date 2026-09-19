# RBA candidate — sequential antichain trace deletion 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** deductive candidate; execution qualification pending  
**Authority effect:** none

## Target

For fixed exact antichain `B` and outer mask `a`:

```text
P_B(a) = Max({a AND b | b in B})
```

Let:

```text
X = Union(B) \ a.
```

Then `P_B(a)` is the maximal trace obtained by deleting every coordinate in `X` from the set family `B`.

## One-coordinate deletion theorem candidate

Let `F` be a subset-antichain and delete coordinate `x`.

Partition:

```text
F0 = {s in F | x notin s}
F1 = {s in F | x in s}
D1 = {s \ {x} | s in F1}
```

Then:

1. `F0` is an antichain.
2. `D1` is an antichain. If `u\{x} subset v\{x}` for two x-containing members, then `u subset v`, contradicting antichainhood.
3. No `c in F0` can be a strict subset of `d in D1`. If `c subset d=s\{x}`, then `c subset s`, again contradicting antichainhood.
4. Equality `c=d` is likewise impossible because then `c subset s=c union {x}`.

Therefore unchanged members always survive. The only possible new domination is:

```text
d in D1
    dominated by
c in F0 with d subset c.
```

Hence the exact projected maximal antichain is:

```text
DeleteMax_x(F)
  =
F0
union
{ d in D1 | no c in F0 has d subset c }.
```

No comparisons inside `F0` or inside `D1` are required.

## Multi-coordinate trace

Projection by `a` is deletion of all coordinates in `X=Union(B)\a`.

Because coordinate deletion commutes as a set projection and `DeleteMax_x` returns the exact maximal trace after each step:

```text
P_B(a)
  =
DeleteMax_xk(
  ...
  DeleteMax_x2(
  DeleteMax_x1(B)))
```

for any ordering `x1...xk` of `X`.

Each intermediate is again an antichain, so the one-coordinate theorem applies inductively.

## Evaluation shape

For one deletion coordinate:

1. partition current antichain into `F0/F1`;
2. build/reuse an exact superset-existence index for `F0`;
3. remove x from each member of `F1`;
4. retain a changed member iff no exact superset exists in `F0`;
5. concatenate with `F0`.

Candidate exact indexes include the already-qualified static dominance tree and block-signature superset index.

## Why this targets the observed rare tail

The deterministic rare-tail guard already measures:

```text
d_B(a) = popcount(Union(B) AND NOT a).
```

When `d_B(a)` is small, the current projection query often has a very wide output and weak subtree pruning.

Sequential deletion performs only `d_B(a)` one-coordinate antichain updates and never maintains a wide incremental skyline over all `a AND b` projections.

For large `d_B(a)`, the existing projection tree may remain preferable. This naturally yields an exact hybrid local evaluator.

## Qualification plan

1. exhaustive random/small-antichain differential against direct `Max({a AND b})`;
2. committed rank33 real stress-product local queries;
3. synthetic union-nearest large-antichain pressure controls;
4. blocked rank26-descent factor queries once exact factor streams are reconstructed.

Reject if the one-sided superset tests remain as expensive as the existing restricted-image query on real factors.
