# Direct line-product BSFP — variable-geometry adversarial qualification

**Status:** extension of `RESULT.md`. Exact differential semantics only; not a performance qualification.

**Research direction:** Josh Oshiro.

## Purpose

The first direct line-product qualification covered 4x3 c3, 4x4 c4 and 5x3 c4. Because the engine is variable-size, the realizability-completion law was then tested on additional geometries chosen to vary:

```text
board dimensions
Connect-K target
line-overlap density
support count
completion branching
```

The same reference implementation and ownership-BSFP-derived product-boundary authority were used without geometry-specific semantic changes.

## Additional controls

| Geometry | Supports | W0 mismatches | W1 mismatches | Completion calls | Completion outputs | Product pairs | Maximum completion branching |
|---|---:|---:|---:|---:|---:|---:|---:|
| 3x3 c3 | 64 | 0 | 0 | 1,209 | 1,459 | 767 | 4 |
| 3x4 c3 | 125 | 0 | 0 | 6,645 | 8,520 | 5,444 | 8 |
| 4x4 c3 | 625 | 0 | 0 | 149,702 | 227,885 | 153,516 | 22 |
| 5x3 c3 | 1,024 | 0 | 0 | 225,218 | 320,195 | 235,437 | 21 |
| 3x5 c3 | 216 | 0 | 0 | 22,897 | 31,816 | 20,894 | 13 |
| 4x3 c2 | 256 | 0 | 0 | 11,039 | 11,039 | 4,986 | 1 |
| 4x5 c4 | 1,296 | 0 | 0 | 235,806 | 299,986 | 313,798 | 13 |
| 5x4 c4 | 3,125 | 0 | 0 | 818,380 | 1,066,114 | 1,287,168 | 17 |

Combined with the original controls:

```text
3x3 c3
3x4 c3
3x5 c3
4x3 c2
4x3 c3
4x4 c3
4x4 c4
4x5 c4
5x3 c3
5x3 c4
5x4 c4
```

all tested supports produced zero direct-product W0/W1 boundary mismatches.

## Reassessment

The completion law is not tied to:

```text
7x6
Connect-4
42 cells
one fixed line count
one fixed completion width
```

The most important variation observed is completion branching.

Denser overlapping Connect-3 geometries produced larger completion antichains than several Connect-4 controls:

```text
4x4 c3: max 22
5x3 c3: max 21
```

while the tested 4x3 c2 control had max branching 1.

Therefore the likely scaling driver is not simply cell count or smaller K. It is the structure of the support-local clause/transversal hypergraph.

No universal bound on completion width is established.

## Consequence for a variable-size engine

A production profile must treat realizability completion as a variable-width antichain operation with explicit capacity/overflow handling.

Do not hardcode a maximum completion count from these controls.

Useful geometry/support diagnostics should include:

```text
number of occupied-line hyperedges
number of forced owner cells
number of unsatisfied positive clauses
clause arity distribution
clause overlap/intersection profile
minimal-transversal count
post-map product-pair count
```

These quantities are stronger candidates for predicting closure cost than raw board dimensions alone.

## Performance boundary

These runs do not show that line-product BSFP is faster than ownership BSFP.

The reference implementation deliberately prioritizes exactness and repeatedly builds/caches completion objects in ordinary JavaScript.

The next phase should separate:

```text
semantic state reduction
completion-generation cost
product-antichain width
support-local precomputation opportunity
GPU suitability
```

before selecting a production representation.

## Reproduction

Use the same qualifier with the listed geometry triplets, for example:

```text
node research/experiments/bsfp-line-hit-realizability/direct-line-product-bsfp.mjs 4 4 3
node research/experiments/bsfp-line-hit-realizability/direct-line-product-bsfp.mjs 5 4 4
```

## Disposition

The direct line-product completion law remains supported across the expanded variable-geometry controls. The next research question is no longer whether the recurrence can be made exact on these examples; it is whether completion can be represented and executed with sufficiently bounded cost for the target geometries.
