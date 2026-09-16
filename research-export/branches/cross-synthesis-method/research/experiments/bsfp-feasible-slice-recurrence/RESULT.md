# BSFP feasible-slice recurrence qualification

**Status:** completed differential semantic control; CUDA performance not yet measured.

**Research direction:** Josh Oshiro.

**Target:** unregistered hypothesis `BSFP_FEASIBLE_SLICE_REDUCTION.md`, with implications for `BSFP_CONSTRAINT_RELATIVE_ANTICHAIN.md`.

## Question

Can ownership-antichain BSFP discard frontier records that do not intersect the exact legal P0 stone-count slice at each support rank, while preserving the exact W/D/L classification of every legal ownership assignment?

At support rank `r`:

```text
k0 = ceil(r / 2)
```

For the P0-oriented ownership representation:

```text
minimal/upward generator g is infeasible if popcount(g) > k0
maximal/downward cap c is infeasible if popcount(c) < k0
```

The experiment applies those reductions throughout the backward recurrence, not merely as a final classification filter.

## Falsifier

Run two otherwise identical exact BSFP recurrences on complete small support lattices:

1. baseline full-support-cube antichains;
2. exact-cardinality-sliced antichains.

Then, at every support, enumerate every P0 ownership assignment with exactly `k0` stones and classify it through both frontier pairs.

Any W/D/L disagreement falsifies recurrence-completeness of the slice reduction.

## Oracle / reference semantics

The baseline is the same ownership-antichain BSFP algebra without slice pruning. This is differential property evidence, not an independent game solver oracle.

No minimax/Negamax traversal, solved database, opening knowledge, or external perfect-play result is consumed.

## Controls

- 4x3 connect-3;
- 4x4 connect-4;
- 5x3 connect-4.

The comparison covers every support and every exact-cardinality P0 assignment at that support.

## Correctness result

| Board | Exact-cardinality assignments checked | W/D/L mismatches | Supports whose stored frontier representation changed |
|---|---:|---:|---:|
| 4x3 c3 | 12,933 | 0 | 191 |
| 4x4 c4 | 201,755 | 0 | 412 |
| 5x3 c4 | 174,683 | 0 | 471 |
| **Total** | **389,371** | **0** | — |

The frontier representations often changed substantially, while their classifications remained identical on the entire legal ownership slice.

This is exactly the intended quotient: preserve behavior on the reachable rank slice rather than preserve the larger Boolean-family representation.

## Structural work result

Because infeasible records do not survive into earlier ranks, pruning compounds and reduces later Cartesian products even before any CUDA-specific optimization.

| Board | Baseline pair candidates | Sliced pair candidates | Recursive pair-count reduction | Pair candidates rejected before normalization inside sliced solve |
|---|---:|---:|---:|---:|
| 4x3 c3 | 11,697 | 10,052 | 14.06% | 6,592 (65.58% of sliced attempted pairs) |
| 4x4 c4 | 33,427 | 27,983 | 16.29% | 17,474 (62.45%) |
| 5x3 c4 | 21,014 | 16,642 | 20.81% | 10,936 (65.71%) |

Maximum frontier widths also contracted:

| Board | Max Win baseline -> sliced | Max Loss baseline -> sliced |
|---|---:|---:|
| 4x3 c3 | 19 -> 16 | 48 -> 12 |
| 4x4 c4 | 26 -> 26 | 54 -> 16 |
| 5x3 c4 | 19 -> 16 | 10 -> 8 |

These are structural workload counts from the small control implementation, not production CUDA timing claims.

## Source inspection against maintained CUDA-BSFP

The maintained compact CUDA path already computes a popcount for every pair candidate.

However, current normalization still ranges across the complete 0..42 cardinality domain and the pair-reducer job contract does not carry a legal ownership count. Therefore the exact rank-slice boundary is not presently used as semantic work elimination at that boundary.

For rank `r`, the exact specialization is:

```text
k0 = ceil(r / 2)

minimal/upward normalization:
    ignore cardinalities k0+1 .. 42

maximal/downward normalization:
    ignore cardinalities 0 .. k0-1
```

The compact rank kernel already has `rank`, so this information can be derived locally without adding solved-game knowledge or an external search dependency.

## Reassessment

This candidate should now be treated differently from the broader constraint-relative-antichain hypothesis.

### Stronger status

Rank-slice pruning has:

- an exact derivation from turn/rank cardinality;
- whole-recurrence differential evidence on complete small controls;
- zero mismatches over 389,371 legal ownership classifications;
- evidence of recursively shrinking frontier/product work;
- an obvious insertion point in the compact CUDA normalizer;
- essentially no semantic-side data requirement beyond the rank already present in the kernel.

### Still unqualified

The experiment does not establish:

- CUDA wall-time improvement;
- 6x5 or 7x6 production candidate distributions;
- the exact effect on the current 43-phase normalization kernel;
- whether changing stored frontier widths affects arena/capacity behavior elsewhere;
- whether the best CUDA form is phase-range restriction, candidate invalidation, or variable-length pre-compaction.

## Recommended CUDA qualification order

1. **Phase-range specialization first.**

   The compact kernel already knows `rank`. Restrict normalization to semantically possible cardinality phases without changing candidate layout.

   This is the least invasive test and directly removes repeated whole-interval scans over impossible cardinality phases.

2. **Record exact work counters.**

   Add or derive counts for:

   ```text
   impossible-cardinality candidates
   candidate phase-visits avoided
   subset/dominance checks avoided
   duplicate scans avoided
   resulting frontier counts
   wall time
   ```

3. **Require exact qualification.**

   On complete small controls, compare W/D/L on the legal ownership slice and retain existing root/result checks.

4. **Then test the 6x5 wall region.**

   Rank 23 has `k0 = 12`, so a minimal frontier needs only cardinalities `0..12` rather than `0..42`; a maximal frontier needs `12..42` rather than `0..42`. The expected work reduction must be measured, not inferred from phase count alone.

5. **Only after phase-range evidence, consider pre-materialization compaction.**

   True candidate compaction can reduce memory traffic and candidate capacity as well, but it requires a stronger CUDA scheduling/data-layout change and should not be the first experiment.

## Relation to Isometric

This is a clean example of the intended cross-project principle:

```text
physical/full-cube representation
    -> identify exact invariant relevant to the claim
    -> quotient only the semantically impossible region
    -> preserve exact behavior on the legal observation domain
```

It should not become a universal IsoMax state field. In IsoMax terms, exact rank/cardinality is a claim/transition guard where required; in BSFP it is especially valuable because it removes frontier and Cartesian work before later recurrence stages.

## Reproduction

Run:

```text
node research/experiments/bsfp-feasible-slice-recurrence/rank-slice-equivalence.mjs
```

A nonzero W/D/L mismatch sets a failing exit code.

## Disposition

**Supports** exact rank-slice reduction strongly enough to advance to a CUDA performance qualification. It does **not** support introducing the broader nonlinear constraint-relative implication engine yet.
