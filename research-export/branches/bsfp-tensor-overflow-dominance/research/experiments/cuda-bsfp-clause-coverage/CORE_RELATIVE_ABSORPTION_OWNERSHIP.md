# Core-relative absorption on ownership antichain BSFP

**Status:** standalone exact recurrence differential passed on five complete variable geometries. This independently confirms the law is useful in a second BSFP representation family, not only support-local clause coverage.

**Research direction:** Josh Oshiro.

## Scope

The maintained ownership-antichain recurrence uses two exact product forms:

```text
Win/upward intersection:
    candidate = a OR b
    normalize subset-minimal

Loss/downward intersection:
    candidate = a AND b
    normalize subset-maximal
```

The OR/minimal form uses the same core-relative absorption law already qualified for clause coverage.

The AND/maximal form uses the exact dual.

## OR/minimal law

For minimal antichains `A`,`B`:

```text
coreA = intersection(A)
coreB = intersection(B)
```

A row `a` collapses when some `b in B` satisfies

```text
b subseteq (a OR coreB)
```

and may be represented by the real product occurrence

```text
a OR coreB.
```

Columns are dual.

## AND/maximal dual

For maximal antichains `A`,`B`, define the union envelopes

```text
envA = union(A)
envB = union(B).
```

For fixed row `a`, every product `a AND b` is a subset of

```text
a AND envB.
```

If some witness `b0 in B` contains that row envelope,

```text
(a AND envB) subseteq b0,
```

then

```text
a AND b0 = a AND envB
```

is an actual product occurrence and is a superset of every other row product. Because the frontier is subset-maximal, the entire row may be replaced by that one record.

Columns use `b AND envA` symmetrically.

## Standalone complete-control differential

A standalone reference solver reproduced the maintained ownership recurrence semantics:

- minimal Win antichains;
- maximal Loss antichains;
- exact cofactors;
- terminal Win/Loss injection;
- terminal subtraction;
- mover existential/universal aggregation.

Authority used ordinary full Cartesian pair products.

Candidate changed only the two product operators to core-relative absorption before generating remaining products.

Every support frontier was compared exactly; no W/D/L database or search result was consumed.

| Geometry | Supports | Frontier mismatches | Upward raw pairs | Upward generated | Upward ratio | Downward raw pairs | Downward generated | Downward ratio | Total generated/raw |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 4x3 c3 | 256 | 0 | 5,305 | 1,728 | 32.6% | 6,392 | 2,466 | 38.6% | 35.9% |
| 4x4 c4 | 625 | 0 | 13,441 | 3,950 | 29.4% | 19,986 | 4,316 | 21.6% | 24.7% |
| 5x3 c4 | 1,024 | 0 | 13,371 | 2,526 | 18.9% | 7,643 | 192 | 2.5% | 12.9% |
| 4x4 c3 | 625 | 0 | 56,055 | 22,870 | 40.8% | 63,296 | 24,625 | 38.9% | 39.8% |
| 4x5 c4 | 1,296 | 0 | 226,170 | 65,312 | 28.9% | 361,219 | 89,081 | 24.7% | 26.3% |

The test completed in about 1.2 seconds, so no long-run scaling inference is being drawn from it.

## Consequence

Core-relative absorption is now consumer-backed inside Connect4 by two distinct exact symbolic representations:

```text
1. support-local clause-coverage antichains
2. ownership Win/Loss antichains
```

It therefore should not become a clause-specific production kernel.

The reusable algorithmic owner is CUDA-Algorithms. Connect4 retains:

- game semantics;
- frontier meaning;
- whether a product stage is authoritative;
- legal-slice predicates;
- terminal semantics;
- representation selection.

CUDA-Algorithms may own a bounded generic antichain-product reduction profile over fixed-width set records.

## Interaction with CUDA-Algorithms #11

This reduction acts **before** normalization:

```text
input antichains
-> core/envelope-relative absorption
-> generate remaining pair products
-> feasibility/filtering
-> duplicate collapse
-> subset-minimal/maximal normalization (#11)
```

Thus it complements rather than replaces the segmented antichain-normalization request.
