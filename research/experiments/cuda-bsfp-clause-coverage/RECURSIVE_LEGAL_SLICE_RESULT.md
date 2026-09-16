# Recursive bounded legal-slice propagation

**Status:** exact complete-control differential qualification passed for both conservative support-boundary propagation and eager move/aggregate propagation. The stronger eager form is the preferred candidate for a bounded CI qualifier.

**Research direction:** Josh Oshiro.

## Question

The support-local coverage work already established a cheap exact bounded legal-slice guard for a beneficiary with exact stone count `k`:

```text
forced singleton count > k
    -> reject

forced singleton count = k
and an unsatisfied clause remains
    -> reject

forced singleton count = k - 1
and no one remaining cell satisfies every residual clause
    -> reject
```

The earlier real-workload fixture deliberately applied this guard only to a captured merge so the candidate optimization could not generate its own benchmark provenance.

This experiment asks a different question:

> After the guard itself has been independently qualified, may rejected coverage records be removed from persistent support frontiers and allowed to disappear recursively from all predecessor work without changing exact legal-state W/D/L semantics?

A stronger candidate also applies the same exact guard to move-local and partially aggregated frontiers before later universal products.

## Authority and candidate

Authority:

```text
unfiltered exact support-local coverage recurrence
```

Candidate A — conservative propagation:

```text
complete support frontier
    -> bounded legal-slice filter
    -> stored child frontier for predecessor ranks
```

Candidate B — eager propagation:

```text
cofactor / terminal result
    -> bounded legal-slice filter
    -> aggregation
    -> bounded legal-slice filter
    -> completed support frontier
    -> bounded legal-slice filter
    -> predecessor ranks
```

Both candidates use the same recurrence, terminal precedence, support dictionaries, coverage algebra, and cofactor maps as the unfiltered authority.

## Semantic oracle

Frontier identity is intentionally **not** required to remain equal, because the optimization removes proof records that have no witness on the exact-cardinality legal ownership slice.

Instead, for every support on each complete control:

1. enumerate every P0 ownership subset with exactly `ceil(rank / 2)` stones;
2. infer P1 ownership as the exact support complement;
3. evaluate the unfiltered authority Winner0/Winner1 coverage frontiers on that ownership partition;
4. evaluate the recursively pruned candidate frontiers on the same partition;
5. compare the resulting exact three-way value class;
6. fail on any mismatch or contradictory dual-winner result.

This is a stronger semantic check than comparing frontier lengths or raw record identity.

## Complete-control evidence

Controls:

```text
4x3 connect-3
4x4 connect-4
5x3 connect-4
4x4 connect-3   (dense-overlap adverse profile)
4x5 connect-4
```

Exact ownership assignments checked:

| Geometry | Supports | Exact-cardinality assignments |
|---|---:|---:|
| 4x3 c3 | 256 | 12,933 |
| 4x4 c4 | 625 | 201,755 |
| 5x3 c4 | 1,024 | 174,683 |
| 4x4 c3 | 625 | 201,755 |
| 4x5 c4 | 1,296 | 3,039,959 |
| **Total** | **3,826?** | **3,631,085** |

Support total is `256 + 625 + 1024 + 625 + 1296 = 3,826`.

Both candidates:

```text
value mismatches:       0
authority dual-winner conflicts: 0
candidate dual-winner conflicts: 0
```

Thousands of supports changed frontier representation, so the zero mismatch result is not a trivial no-op comparison.

## Work-shape result — support-boundary-only propagation

Candidate / authority ratios:

| Geometry | Persistent records | Cofactor inputs | Universal product pairs | Max frontier |
|---|---:|---:|---:|---:|
| 4x3 c3 | 0.807 | 0.815 | 0.949 | 0.778 |
| 4x4 c4 | 0.745 | 0.765 | 0.925 | 0.615 |
| 5x3 c4 | 0.762 | 0.783 | 0.953 | 1.000 |
| 4x4 c3 | 0.842 | 0.854 | 0.943 | 0.970 |
| 4x5 c4 | 0.840 | 0.854 | 0.939 | 0.786 |

Interpretation:

- persistent record volume falls roughly **16–25%**;
- subsequent cofactor inputs fall roughly **15–24%**;
- universal product pairs fall only about **5–7.5%** when pruning is delayed until the completed support frontier;
- maximum frontier width can fall materially (for example 13 -> 8 on 4x4 c4).

## Work-shape result — eager exact propagation

The stronger candidate applies the same proven guard before later move aggregation/product work as well as at the persistent boundary.

Candidate / authority ratios:

| Geometry | Persistent records | Cofactor inputs | Universal product pairs | Max frontier |
|---|---:|---:|---:|---:|
| 4x3 c3 | 0.807 | 0.815 | **0.836** | 0.778 |
| 4x4 c4 | 0.745 | 0.765 | **0.806** | 0.615 |
| 5x3 c4 | 0.762 | 0.783 | **0.791** | 1.000 |
| 4x4 c3 | 0.842 | 0.854 | **0.833** | 0.970 |
| 4x5 c4 | 0.840 | 0.854 | **0.860** | 0.786 |

Thus eager placement captures the same persistent/cofactor reduction while also cutting raw universal product work by about **14–21%** across these controls.

The dense Connect-3 adverse profile also remains exact; the benefit is smaller but still positive.

## Important interpretation

This result does **not** authorize using a recursively filtered recurrence as the provenance source for an optimization benchmark whose purpose is to measure that same filtering step.

Keep the distinction:

```text
semantic qualification / production candidate:
    recursively filtered recurrence is admissible on the tested legal slice

independent benchmark provenance:
    derive comparison fixtures from an unfiltered authority unless the experiment
    explicitly studies whole-profile recursive propagation
```

That preserves the earlier 5x4 hot-workload provenance correction.

## Consequence

Recursive legal-slice cleanup is no longer merely a local rejection heuristic. On the tested complete controls it is an exact **state-space contraction** for legal-state BSFP semantics, and its savings compound into later cofactors and universal products.

The stronger eager placement is the more useful execution candidate because it removes impossible records before they participate in later products at the same support.

## What remains open

- bounded CI implementation of the stronger differential qualifier;
- composition with horizontal-reflection orbit recurrence in one whole-profile qualifier;
- variable-word / >31-cell recurrence execution (the guard itself is already separately qualified with multiword cells/coverage through 7x6 and 8x6);
- native device cost of applying the guard versus the avoided product/normalization work;
- whole-profile 6x5 / 7x6 profitability.

Do not infer a 7x6 rank result from these small controls alone.