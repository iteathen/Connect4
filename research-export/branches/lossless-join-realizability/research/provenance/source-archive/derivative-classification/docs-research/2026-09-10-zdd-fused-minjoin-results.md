# Fused ZDD-style MinJoin on real BSFP operands — exact research result

**Status:** research evidence only. The algebraic transformation passed; the tested generic cell-variable ZDD realization is rejected as a direct C1 performance replacement.

## Question

Can the C1 hard family intersection be changed from:

```text
Cartesian pair generation
-> exact duplicate/dominance normalization
-> minimal/maximal boundary
```

to a ZDD-style family operation that performs union-of-requirements and subsumption elimination during canonical construction?

At fixed support `U`, maximal P0 Loss caps `C` were complemented to minimal P1 requirements `U \\ C`. This makes both Win and Loss hard intersections instances of one exact operation:

```text
MinJoin(A,B) = Min_subset({a union b | a in A, b in B})
```

## Source and run

Harness:

```text
reference/research-prototypes/2026-09-10-zdd-transfer/fused-minjoin.mjs
```

Exact successful run:

```text
GitHub Actions run: 34510602601
job:                102983482123
runtime:            Ubuntu 24.04 / Node 26.7.0
```

The harness independently replayed the C1 ownership-antichain recurrence and compared every generated support frontier with the authoritative solver before using the captured hard-intersection operands. It then compared a canonical ZDD `MinJoin` result with explicit Cartesian union plus exact minimal-under-subset normalization.

## Correctness

All tested geometries passed with:

```text
captureFrontierMismatches = 0
zddMismatches             = 0
```

Tested complete games:

```text
4x3:c3
4x4:c4
5x3:c4
4x5:c4
5x4:c4
```

Therefore the following are retained as exact useful algebraic results:

1. complementing Loss caps into minimal P1 requirements is valid at fixed support;
2. Win and Loss hard intersections can share one minimal-family `MinJoin` abstraction;
3. subsumption-free/fused family construction can be implemented exactly.

## Work results

The prototype analyzed the 64 largest hard operations per geometry.

| Geometry | Explicit pairs analyzed | Output records | Canonical ZDD nodes | uncached MinJoin subproblems | uncached notSuperset subproblems | pairs / MinJoin misses |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3:c3 | 4,762 | 767 | 3,840 | 11,061 | 10,511 | 0.4305 |
| 4x4:c4 | 8,806 | 960 | 6,375 | 14,171 | 19,989 | 0.6214 |
| 5x3:c4 | 4,219 | 563 | 1,341 | 3,722 | 3,139 | 1.1335 |
| 4x5:c4 | 89,748 | 3,199 | 58,704 | 116,523 | 218,439 | 0.7702 |
| 5x4:c4 | **192,084** | **5,225** | **140,063** | **235,169** | **539,055** | **0.8168** |

The counts are not identical-cost units: one recursive ZDD subproblem is not the same operation as one packed C1 subset comparison. They are nevertheless decisive against the hoped-for structural result. The generic ZDD did **not** turn hundreds of thousands of explicit pairs into a much smaller set of canonical family subproblems. On the larger controls, recursive subsumption work substantially exceeded the explicit pair count.

Selected 5x4 operations show the same pattern:

```text
support 1998 rank 14:
  75 x 76 = 5,700 explicit pairs
  4,777 uncached MinJoin subproblems
  15,279 notSuperset calls (4,635 cache hits)
  3,264 new nodes

support 2398 rank 14:
  42 x 134 = 5,628 explicit pairs
  5,972 uncached MinJoin subproblems
  21,014 notSuperset calls (5,471 cache hits)
  4,135 new nodes

support 2343 rank 15:
  127 x 33 = 4,191 explicit pairs
  9,396 uncached MinJoin subproblems
  36,834 notSuperset calls (10,068 cache hits)
  4,719 new nodes
```

There are isolated cases with excellent canonical reuse. For example, a symmetric 5x3 operation with 169 explicit pairs collapsed to one uncached MinJoin subproblem through exact reference identity. That proves the mechanism can pay when operands share the right structure, but the actual larger C1 operand distribution does not exhibit enough of it under this representation/order.

## Interpretation

### Rejected

Do **not** replace C1 packed ownership boundaries with a conventional cell-variable ZDD plus this recursive `MinJoin` implementation merely because ZDD family algebra is mathematically natural.

The test gives no evidence of the order-of-magnitude reduction in materialized work required to justify that change.

### Retained

The following ideas survive the negative performance result:

- canonical immutable `familyRef` identity;
- operation caches keyed by canonical references;
- one minimal-requirement family orientation for both players;
- fused combination + semantic absorption as an abstract operator;
- testing family algebra before materializing Cartesian members;
- looking for a representation aligned to Connect4 geometry rather than generic ownership variables.

### Promoted

The separate 7x6 incidence-frontier result is now more important. Processing identified winning lines while carrying only crossing cells had a maximum live frontier of 21 in the first deterministic census, much narrower than the tested cell-first orientations. A later bounded deterministic order search improved this to 20 crossing cells. That indicates the promising ZDD transfer is likely **frontier decomposition over the 42-cell/69-line incidence graph**, not ordinary cell-variable ZDD storage of current ownership antichains.

## Next research seam

Two exact candidates deserve priority:

1. a line-first frontier/canonical-DAG representation that forgets a cell immediately after its last incident winning line;
2. a monotone-function BDD representation of the *closed* Win/Loss regions, where BSFP aggregation is ordinary `OR`/`AND` and move projection is a cofactor, avoiding explicit `MinJoin` entirely. This mirrors implicit logic-minimization work where Boolean functions and their minimal prime/cut-set boundaries use different DD forms.

Both must be tested against authoritative C1 support frontiers before production design.
