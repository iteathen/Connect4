# Reflection-orbit recurrence + eager bounded legal-slice propagation

**Status:** exact complete-control composition qualification passed.

**Research direction:** Josh Oshiro.

## Question

Two reductions were independently qualified:

1. horizontal-reflection support-orbit recurrence with exact support-local dictionary/frontier transport;
2. recursive bounded legal-slice pruning, with the strongest form applied to move-local, partially aggregated, and persistent frontiers.

This experiment asks whether they compose without semantic loss and measures their combined recurrence work against the original unfiltered, unquotiented support-local coverage recurrence.

## Authority

```text
full support lattice
+ unfiltered support-local coverage recurrence
```

## Candidate

```text
horizontal-reflection canonical support representatives
+ exact mirrored child-frontier transport
+ eager bounded legal-slice pruning
```

The candidate stores only canonical support representatives. Whenever a legal child lies in the opposite reflection orientation, the stored canonical child frontier is transported through the exact support-local dictionary permutation before cofactor application.

At the physical parent support, the already-qualified bounded legal-slice guard is applied:

```text
after cofactor / terminal handling
after partial move aggregation
at persistent support-frontier storage
```

## Semantic oracle

For every physical support in each complete control:

1. reconstruct the candidate frontier from its canonical support-orbit representative;
2. enumerate every P0 ownership subset with exact `ceil(rank / 2)` cardinality;
3. infer P1 as the support complement;
4. evaluate Winner0/Winner1 under the original unfiltered authority frontier;
5. evaluate Winner0/Winner1 under the reconstructed quotient/pruned candidate;
6. compare the exact three-way value class.

No frontier-identity equality is required because legal-slice pruning intentionally removes records that have no witness on the exact legal ownership slice.

## Complete controls

| Geometry | Supports | Reflection orbits | Exact ownership assignments | Value mismatches |
|---|---:|---:|---:|---:|
| 4x3 c3 | 256 | 136 | 12,933 | 0 |
| 4x4 c4 | 625 | 325 | 201,755 | 0 |
| 5x3 c4 | 1,024 | 544 | 174,683 | 0 |
| 4x4 c3 | 625 | 325 | 201,755 | 0 |
| 4x5 c4 | 1,296 | 666 | 3,039,959 | 0 |
| **Total** | **3,826** | **1,996** | **3,631,085** | **0** |

No authority or candidate dual-winner conflicts were observed.

The dense-overlap 4x4 connect-3 profile remains in the suite as an adverse clause-coverage control.

## Combined work shape

Candidate / original-authority ratios:

| Geometry | Support schedule | Persistent records | Cofactor inputs | Universal product pairs | Max frontier |
|---|---:|---:|---:|---:|---:|
| 4x3 c3 | 0.531 | 0.422 | 0.429 | 0.441 | 0.778 |
| 4x4 c4 | 0.520 | 0.384 | 0.396 | 0.419 | 0.615 |
| 5x3 c4 | 0.531 | 0.400 | 0.412 | 0.410 | 1.000 |
| 4x4 c3 | 0.520 | 0.432 | 0.441 | 0.428 | 0.970 |
| 4x5 c4 | 0.514 | 0.429 | 0.437 | 0.438 | 0.786 |

Thus, relative to the original recurrence on these controls:

```text
support occurrences solved:  about 47-49% fewer
persistent records:          about 57-62% fewer
cofactor record inputs:      about 56-60% fewer
universal Cartesian pairs:   about 56-59% fewer
```

This is measured composition evidence. Do not substitute a multiplication of independent headline percentages when estimating the combined solver.

## Interpretation

The reductions reinforce each other in the expected direction:

- reflection removes mirrored support occurrences and edges;
- legal-slice pruning shrinks the frontier carried by each retained occurrence;
- applying the legal-slice guard before partial universal products prevents impossible records from materializing later Cartesian work;
- exact orientation transport preserves the factorization rather than reconstructing a second mirrored recurrence.

The combined product-pair ratio staying near `0.41-0.44` across both favorable Connect-4 and adverse dense Connect-3 controls is particularly useful evidence.

## What this does not prove

- native GPU speedup;
- 6x5 or 7x6 full-rank traversal;
- a fixed maximum frontier size on larger geometries;
- that guard evaluation itself is free;
- profitability of clause coverage over equally optimized rank-slice ownership;
- generic antichain normalization performance.

The exact legal-slice guard itself has already been independently qualified with variable-word cell and coverage masks through 7x6 and 8x6. This composition qualifier uses smaller complete boards so every physical ownership partition can be exhaustively compared.

## Consequence

Reflection quotienting and eager legal-slice contraction may be treated as compatible components of the same exact coverage-BSFP candidate on the tested legal-state semantics.

The next useful scaling experiment should preserve this combined recurrence and measure rank-by-rank frontier/product growth on a larger Connect-4 geometry rather than reverting to either reduction in isolation.