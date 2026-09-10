# CUDA-BSFP research synthesis — exact state, scaling evidence, representation results, and flat-transfer direction

**Author:** Josh Oshiro  
**Date:** 2026-09-10  
**Repository:** `iteathen/Connect4`  
**Research branch:** `research/zdd-transfer-20260910`  
**Synthesis input head:** `4e563e4f2841f19151241e646b2b27943d4a3b34`  
**Contemporaneous production-lane head:** `feature/cuda-bsfp@093218ca55b37f9179d0ede8255ac1621f2e96f5`  
**Status:** research synthesis only; no production representation change, no dependency repin, no 6x5/7x6 solve claim.

This document consolidates the CUDA-BSFP solver work, exact qualification evidence, scaling failures, algebraic reducers, identified-winning-line quotient work, ZDD/BDD probes, and the current flat-vector / rolling-transfer hypothesis into one durable research state.

It is intentionally committed only to the research branch. `STATUS.md` and `next_step.yaml` still describe the production `feature/cuda-bsfp` lane and the outstanding C3/B2 native measurement gate. Those files remain authoritative for production work until deliberately reconciled. This document records what the research branch has learned beyond them.

---

## 1. Mission and hard boundaries

The product goal is unchanged:

```text
standard Connect Four
board: 7 x 6
connect: 4
root: empty board
result: exact W / D / L
objective: extremely fast CUDA solve
```

The primary method is **backward symbolic fixed point (BSFP)**. It is not move-tree search.

CUDA-BSFP must not be converted into:

- minimax;
- alpha-beta;
- MCTS;
- proof-number search;
- recursive legal-move traversal;
- a full colored-state table for standard 7x6.

The incumbent minimax/alpha-beta lane remains separate under `components/incumbent/`.

Ownership remains:

- **Connect4:** Connect Four semantics, CPC, WSL-625, NDC, BSFP W/D/L, terminal/first-win authority, proof/frontier/state identity, product CUDA profiles and evidence.
- **CUDA-Algorithms:** consumer-neutral ranked progression, bounded worksets, compaction, duplicate-idempotent activation and generic finite algorithms.
- **CUDA-JS:** runtime/compiler/Device-JS/module/function/device-memory/compatibility/lifecycle mechanisms.

No maintained CUDA C++/PTX/direct FFI/native-addon escape path is allowed.

The governing specifications remain:

- `docs/specs/C4-0006-control-parity-and-winspace-v1.md`
- `docs/specs/C4-0007-nested-dependency-closure-v1.md`
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md`
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md`

The pinned dependency pair remains:

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
package:         cuda-js@0.1.0-alpha.20
```

No research result in this document establishes a lower-repository capability gap.

---

## 2. What CUDA-BSFP currently is

The qualified C1 implementation is a device-owned compact exact recurrence over the support skeleton rank lattice.

For standard 7x6, the gravity/support skeleton has:

```text
(6 + 1)^7 = 823,543 support states
```

At one support, the current exact symbolic representation stores monotone W/L regions as ownership antichain boundaries over the occupied cells:

- minimal P0 ownership generators for P0-Win regions;
- maximal P0 ownership caps for P0-Loss regions.

The host freezes a finite rank/support schedule before ignition. Device work owns cofactor, terminal override/subtraction, pair generation, exact normalization and publication into rolling rank arenas. CPU solvers are qualification oracles, not semantic progression engines.

This distinction matters throughout the representation research: a C1 boundary record denotes a **set of compatible colorings**, not one concrete board position.

---

## 3. Qualified native baseline

### 3.1 P1 — first physical CUDA-BSFP correctness slice

Published evidence: PR #18.

```text
GPU: GTX 1660 Ti, 6 GiB
OS:  Windows 11
Node: 26.7.0
geometry: 4x3:c3
root: Win
reachable nonterminal states: 4,631
legal edges: 11,818
mismatches: 0
```

This established a real physical CUDA path before scaling work.

### 3.2 B1 — packed subset primitive

Published evidence: PR #19.

One pass compared:

```text
1,048,576 candidates x 568 frontier records
595,591,168 exact subset checks
median ~16.8488 ms
~35.349 billion exact subset checks/s
```

Conclusion: the raw two-u32 exact subset predicate is not the first performance wall.

### 3.3 C1 — device-owned compact closure

Published evidence: PR #20, run `20260910T100734116Z-e8de3c61`, qualified source `fc7c8cc233b3cf1670ef75fde69750c91dd6492b`.

Exact all-support agreement:

| Geometry | Supports | Root | Result |
| --- | ---: | --- | --- |
| 4x3:c3 | 256 | Win | zero frontier mismatches |
| 4x4:c4 | 625 | Draw | zero frontier mismatches |
| 5x5:c4 | 7,776 | Draw | zero frontier mismatches |

5x5 native measurements:

```text
boundary records:         1,044,159
GPU pair candidates:     85,934,909
reported subset checks:  ~2.1556 billion
submit/wait:              3299.957 ms
warm solve wall:          3568.618 ms
CPU reference observer:  11663.782 ms
maximum Win frontier:     562
maximum Loss frontier:    568
```

C1 is genuinely device-owned under the current CUDA-JS execution contract. The host does not read semantic rank progression after ignition.

---

## 4. The 6x5 scaling wall

Two bounded native C1 attempts timed out at 180 seconds.

The second attempt used 2,048 fresh candidates per tile. Its first 32-node static CUDA-JS epoch took:

```text
75.117652 seconds
```

That first epoch covers ranks 30 through 24 and the first seven shards of rank 23. The support-lattice width peak is much later at rank 15, so the wall appears in a high-occupancy / near-terminal region rather than at the widest support-count rank.

The owner observed roughly 95–100% GPU utilization during the expensive interval. This is evidence that the GPU is busy, not that the useful mathematical primitive is saturated.

Code review identified five plausible costs:

1. `packedNormalize42` scans the complete candidate interval through all **43 cardinality phases**;
2. same-cardinality duplicate elimination uses serial `prior < i` exact-equality scans;
3. one block owns one support through a long serialized pipeline;
4. B1 raw subset throughput is vastly higher than C1 effective reported subset throughput, indicating substantial surrounding control/data overhead;
5. generic terminal subtraction expands unaffected records through Cartesian complement products.

A sixth possibility remains: aggregate pair volume itself may be genuinely too large and require stronger semantic factorization, not merely a faster reducer.

This is the central performance problem the later research addresses.

---

## 5. Production-adjacent diagnostic and reducer candidates

These remain independent of the larger representation research and should not be discarded.

### 5.1 C3 — first-epoch workload diagnostic

Profile: `c4-0009-c3-compact-work-diagnostic-42`  
Exact source: `468611d9e2f743a6a30a55a2db23cc70a824f988`

C3 is a result-neutral, one-static-epoch 6x5 diagnostic. It records:

- pair candidate classes;
- subset checks;
- same-cardinality prior-scan iterations;
- duplicate hits;
- normalization inputs/calls;
- terminal versus aggregate pair work;
- rank summaries;
- hot-support skew.

Portable Windows/Ubuntu × Node 24.15/26.7 qualification passed. Native hardware measurement is still required before using C3 as causal authority.

### 5.2 B2 — cardinality-bucketed normalizer

Profile: `c4-0009-b2-packed-normalizer-bucketed-42`  
Exact source: `7298bbbaa5d761b0dd163f68aa00ba9baf9cb1e5`

The candidate replaces 43 full candidate rescans with:

```text
count -> prefix -> scatter -> exact per-cardinality processing
```

Two fixture families prevent promotion from one favorable workload:

1. equal-cardinality duplicate stress;
2. deterministic mixed-cardinality control with exact host-derived minimal/maximal survivor sets.

Portable qualification is green. A same-GPU native A/B is still required before C1 integration.

### 5.3 B3 — duplicate-first reducer

Profile: `c4-0009-b3-packed-dedup-first-42`.

After B2 bucketing, B3 changes local work order from:

```text
dominance -> equality
```

to:

```text
exact duplicate test -> dominance only for unique candidates
```

No probabilistic identity is introduced. The research fixture uses Cartesian OR/AND products so duplicate structure comes from the same algebraic class as BSFP intersections.

B3 must be conditioned on actual C3 duplicate/prior-scan evidence and native B3 A/B timing before promotion.

---

## 6. Exact semantic reducers

### 6.1 Distinct-playable double-threat absorber

Research source: `reference/research-prototypes/2026-09-10-bsfp-winspace-inference/double-threat-absorber.mjs`.

The exact seed rule is:

- on a P0 turn, two distinct currently playable P1 completions imply a downward P0-Loss region, after subtracting P0 immediate wins;
- on a P1 turn, the dual rule implies an upward P0-Win region, after subtracting P1 immediate wins.

Complete controls through 5x5 had:

```text
unsound seeds:             0
baseline frontier mismatch: 0
absorber frontier mismatch: 0
```

5x5:

```text
baseline aggregate pairs:        81,515,570
with absorber:                   79,580,610
direct pair reduction:               2.3737%
supports with seed:               6,468 / 7,776 (~83.18%)
seed boundary records:              147,873
post-combine candidates already
inside the proved region:         21,671,147 (~26.59% of baseline pairs)
```

Disposition:

- weak as a standalone operand-volume breakthrough;
- strong as a potential semantic pre-normalization filter;
- retain and compose with other reducers.

### 6.2 Terminal-subtraction specialization

Research source: `reference/research-prototypes/2026-09-10-bsfp-terminal-specialization/measure-terminal-subtraction.mjs`.

Current C1 performs terminal subtraction through a generic Cartesian complement product. The specialized exact identities are simpler.

For subtracting a P0 terminal-Win requirement `q` from a maximal P0-Loss cap `c`:

```text
if q is not subset of c:
    pass c unchanged
else:
    emit c with one required q-cell removed for each branch
```

Dually, for subtracting a P1 terminal region from a minimal P0-Win generator `g`:

```text
if g already intersects q:
    pass g unchanged
else:
    emit g plus one q-cell for each branch
```

Complete controls produced zero mismatches.

5x5:

```text
terminal applications:       28,656
input frontier records:    1,344,073
unaffected records:        1,065,332  (79.26%)
generic candidates:        4,032,219
specialized candidates:    1,901,555
candidate reduction:          52.840979%
```

This eliminates 2,130,664 candidate records before normalization on the complete 5x5 control.

Because the 6x5 wall appears near the terminal end of the lattice, terminal specialization has unusually good causal alignment with the observed failure region.

It is currently the strongest production-adjacent exact algebraic reducer.

---

## 7. Primitive winning-line structure

Standard 7x6 Connect Four contains exactly:

```text
24 horizontal winning lines
21 vertical winning lines
12 rising diagonals
12 falling diagonals
69 total geometric connect-4 lines
```

Each line contains four cells, yielding:

```text
69 x 4 = 276 line-cell incidences
```

A board cell participates in between 3 and 13 winning lines; central cells reach 13.

This geometry is static. Useful immutable tables include:

```text
lineId -> cells[4]
cellId -> incident line IDs
cellId -> 69-bit incidence mask
lineId -> local cell ordering / columns / intersections as needed
```

Line identity can be represented by bit position. There is no need to allocate one dynamic object merely to carry a `lineId`.

An important simplification follows from fixed support.

At a fixed support skeleton, the set of occupied cells is already known. If geometric line `L` remains viable for P0, then no occupied cell on `L` belongs to P1. Therefore every occupied cell on that line belongs to P0 and its remaining requirement is exactly:

```text
residual(L, support) = cells(L) \ occupiedCells(support)
```

The same holds symmetrically for P1.

Therefore the physical geometric layer does **not** require a persistent `{lineId, residualMask4}` record for every line. Residual detail is derivable from `(support,lineId)`.

---

## 8. Identified win-line hit quotient

Define immutable `I(x)` as the set of winning-line IDs incident to cell `x`.

For a concrete ownership assignment at fixed support:

```text
H0 = OR of I(x) for P0-owned cells
H1 = OR of I(x) for P1-owned cells
```

Then the candidate quotient is:

```text
Q = (support, H0, H1)
```

Equivalent viable-line form:

```text
P0Viable = ALL69 \ H1
P1Viable = ALL69 \ H0
```

A move is local and monotone:

```text
P0 plays x: H0' = H0 OR I(x); H1' = H1
P1 plays x: H0' = H0;         H1' = H1 OR I(x)
```

or, in viability form, the mover leaves its viable set unchanged while removing every incident line from the opponent's viable set.

This formulation carries line identity directly in the mask bits.

### 8.1 Why the quotient appears exact for physical game dynamics

For a legal nonterminal state:

1. support determines the legal landing cells;
2. `(H0,H1)` determines which identified geometric lines remain viable for each player;
3. support determines the residual unfilled cells of each viable line;
4. a move changes only the mover's hit set by `OR I(x)`;
5. a new win is detected from support filling a mover-viable line through the landing cell.

Thus hidden historical coloring appears unnecessary once `(support,H0,H1)` is known.

This is not merely intuition anymore: the exact qualification harness compared complete physical legal graphs with quotient graphs on four controls.

### 8.2 Exact physical quotient results

Across 1,681,808 physical nonterminal states:

```text
terminal predicate mismatches:          0
successor hit-signature mismatches:     0
reachable quotient-class mismatches:   0
exact W/D/L mismatches:                 0
```

| Geometry | Physical states | Quotient states | Collapse | Max physical / quotient class |
| --- | ---: | ---: | ---: | ---: |
| 4x3:c3 | 4,659 | 4,499 | 1.0356x | 28 |
| 4x4:c4 | 139,625 | 37,323 | 3.7410x | 5,336 |
| 5x3:c4 | 152,003 | 17,455 | 8.7083x | 4,440 |
| 4x5:c4 | 1,385,521 | 361,427 | 3.8335x | 37,080 |

The late-rank collapse becomes extreme. On 4x5:

```text
rank 16: 221,834 physical -> 19,405 quotient   = 11.43x
rank 17: 192,778 physical ->  5,882 quotient   = 32.77x
rank 18: 153,648 physical ->    968 quotient   = 158.73x
rank 19:  88,520 physical ->     64 quotient   = 1,383.13x
rank 20:  37,080 physical ->      1 quotient   = 37,080x
```

This is precisely the occupancy regime in which the current 6x5 CUDA path becomes expensive.

### 8.3 Mask sharing

Observed materialized hit-mask occurrences versus unique either-side masks:

| Geometry | Occurrences | Unique masks | Reuse |
| --- | ---: | ---: | ---: |
| 4x3:c3 | 8,998 | 484 | 18.59x |
| 4x4:c4 | 74,646 | 393 | 189.94x |
| 5x3:c4 | 34,910 | 59 | 591.69x |
| 4x5:c4 | 722,854 | 3,465 | 208.62x |

A bounded immutable integer-handle arena may therefore be worthwhile if lookup/canonicalization cost is cheaper than repeatedly moving full masks. If used, the handle must be an integer index, not a raw CUDA pointer.

For standard 7x6, one 69-bit line mask requires three u32 words when materialized directly.

---

## 9. Direct quotient enumeration was falsified

The physical quotient is exact on tested controls, but it is not itself the final architecture.

A direct quotient-only recurrence completed 4x5 with:

```text
quotient states:        361,427
transition edges:     1,063,472
terminal edges:         109,952
root: Draw
```

However, the 5x5 direct quotient graph exceeded a deliberate 8,000,000-state cap while still generating rank 15:

```text
observed states:       8,000,001
rank at stop:                 15
transition edges:      20,866,813
terminal edges:         1,520,458
```

Completed rank populations already included:

```text
rank 10:   134,872
rank 11:   274,102
rank 12:   546,924
rank 13:   941,559
rank 14: 1,572,737
```

Therefore:

> Do not replace C1 with a flat table of every concrete `(H0,H1)` quotient state.

The quotient removes irrelevant physical distinctions, but concrete quotient enumeration still explodes.

The opportunity is symbolic/factored line-hit algebra.

---

## 10. Product-order line-hit antichains

The next test asked whether the **symbolic C1 W/L regions themselves** compress in line-hit coordinates.

Define the P0-favorable order:

```text
(H0,H1) <= (K0,K1)
iff
  H0 subset_of K0
  and
  K1 subset_of H1
```

Moving upward means P0 has killed at least as many P1 lines while P1 has killed no more P0 lines.

Exact product boundaries are:

- minimal Win pairs under this order;
- maximal Loss pairs under this order.

The test covered the full C1 symbolic ownership domain, not merely reachable physical game states.

### 10.1 Complete-support controls

| Geometry | C1 records | Product-line records | Reduction | Assignment -> quotient collapse |
| --- | ---: | ---: | ---: | ---: |
| 4x3:c3 | 3,004 | 2,862 | 4.73% | 1.174x |
| 4x4:c4 | 6,591 | 4,879 | 25.97% | 4.931x |
| 5x3:c4 | 5,442 | 3,062 | 43.73% | 9.234x |

All quotient consistency and Win/Loss coverage falsifiers were zero.

### 10.2 Hot-support controls

For the largest C1 boundary support at every rank:

| Geometry | Selected C1 boundary | Product boundary | Reduction |
| --- | ---: | ---: | ---: |
| 4x5:c4 | 878 | 429 | 51.14% |
| 5x4:c4 | 1,517 | 547 | 63.94% |

Late/high-occupancy 5x4 examples:

```text
rank 13 support 2193: 155 -> 81
rank 14 support 2318: 168 -> 52
rank 15 support 2343: 293 -> 41
rank 16 support 2368: 202 -> 32
rank 17 support 2373: 153 -> 24
rank 18 support 2498: 110 -> 14
```

At support 2343, rank 15, heights `[3,3,3,3,3]`:

```text
C1:          284 Win generators + 9 Loss caps = 293
line-product: 32 Win minima      + 9 Loss maxima = 41
```

This is a ~7.15x boundary reduction exactly in the region relevant to the current scaling wall.

At rank 18 support 2498:

```text
110 -> 14
```

or ~7.86x fewer boundary records.

### 10.3 What remains unresolved

The product boundary was derived by exhaustively mapping C1-classified ownership assignments. That proves exact representability on the tested symbolic domains, but not yet a **direct closed recurrence** over arbitrary product-line boundary objects.

The hard unresolved constraint is **support-local realizability**. Arbitrary `(H0,H1)` pairs are not necessarily images of any ownership partition of that support.

A production representation must either:

- preserve realizability by construction;
- encode the residual correlation compactly;
- or use line-hit information only as an exact index/filter in front of ownership-space algebra.

Do not take a Cartesian product of arbitrary side hit masks and call it an exact symbolic state space.

---

## 11. ZDD-family algebra: useful mathematics, rejected generic realization

The ZDD investigation produced both reusable algebra and a negative implementation result.

At fixed support, complementing a maximal P0-Loss cap `C` into minimal P1 requirements `U \ C` lets both Win and Loss intersections use one minimal-family operation:

```text
MinJoin(A,B)
  = Min_subset({ a union b | a in A, b in B })
```

The attractive idea was to fuse Cartesian combination with subsumption elimination, rather than materialize all pairs and normalize afterward.

A canonical cell-variable ZDD implementation was tested against real C1 hard-intersection operands.

All tested outputs were exact, but the structure was not favorable enough.

For the 64 largest 5x4 operations:

```text
explicit pairs analyzed:          192,084
canonical ZDD nodes:             140,063
uncached MinJoin subproblems:    235,169
uncached notSuperset subproblems:539,055
```

Several hot operations produced more recursive ZDD work than explicit pair work.

Disposition:

> Reject a conventional generic cell-variable ZDD + recursive `MinJoin` as the direct C1 replacement.

Retain:

- canonical immutable family identity;
- operation caching keyed by exact references;
- one minimal-requirement family orientation;
- fused combination + semantic absorption as an abstract operator;
- variable/order optimization;
- geometry-aware factorization;
- bulk levelized construction instead of pointer recursion.

---

## 12. BDD probe: exact but administratively expensive

A separate ROBDD probe represented the **closed monotone Win/Loss functions** directly. BSFP aggregation then becomes ordinary Boolean OR/AND and move projection becomes restriction/cofactor.

This is mathematically elegant and reproduced exact C1 frontiers on tested complete games.

Representative results:

```text
4x3:c3 column-major:
  canonical nodes: 8,723
  apply misses:    12,071
  restrict calls:  15,126
  solve:           ~24.79 ms

4x4:c4 column-major:
  canonical nodes: 26,772
  apply misses:    41,241
  restrict calls:  56,484
  solve:           ~51.80 ms

5x4:c4 column-major:
  canonical nodes: 628,532
  apply misses:    901,330
  restrict calls:  966,224
  solve:           ~1.84 s on hosted CPU Node
```

The probe is valuable as an exact canonical-function oracle and as evidence that closed-region Boolean algebra fits BSFP. It is not evidence that a pointer/hash-consed ROBDD engine is the desired GPU representation.

The administrative costs are exactly the concern motivating the current direction:

- pointer-like node traversal;
- unique-table/hash-consing work;
- dynamic node creation;
- recursive Apply;
- operation-cache probes;
- irregular memory access.

The goal is now to preserve the **same Boolean mathematics** while deleting as much of that dynamic machinery as possible.

---

## 13. Incidence-frontier decomposition

The 42-cell / 69-line incidence hypergraph was measured in both orientations.

Simple deterministic orders gave:

| Orientation | Best measured max frontier |
| --- | ---: |
| process cells / carry crossing lines | 38 or worse |
| process lines / carry crossing cells | 21 |

A bounded deterministic ordering search then improved the line-first maximum to:

```text
20 crossing cells
mean frontier: 15.463768...
summed frontier over 69 cuts: 1067
```

The exact optimized line order is preserved in:

`reference/research-prototypes/2026-09-10-zdd-transfer/line-frontier-support-census.mjs`

The support-lattice census over all 823,543 supports confirmed:

```text
global max carried width: 20
global max scope width:   20
```

At rank 15:

```text
supports:            33,390
max carried width:       15
mean state-node upper bound per support: ~16,804
p50:                   8,146
p95:                  59,828
max:                  439,425
```

At rank 23:

```text
max carried width: 20
mean assignment-frontier state-node upper bound: ~204,523
p50: 91,933
p95: 772,779
```

The full-board support is the structural worst case for the naive assignment-frontier count, but that is before semantic suffix merging and is not the workload that determines the root solve.

Most importantly:

> Width 20 is a structural separator result, not a proof that any exact BSFP function requires only 20 bits of state or at most `2^20` decision-diagram nodes.

---

## 14. Current flat-vector / rolling-transfer hypothesis

The next representation idea should not be described as “put a BDD/ZDD on CUDA.”

The stronger candidate is:

> **Re-express the exact same closed BSFP relations as flat, fixed-width, rolling transfer algebra over the optimized line-first separator.**

The purpose is to eliminate data-structure/control-flow overhead rather than merely change node encoding.

### 14.1 What should be static

For standard 7x6, compile once:

```text
69 identified line constraints
42 cell -> incident-line 69-bit masks
optimized 69-line processing order
first/last line-incidence cut for each cell
support-local occupied-cell mask
support-local residual/completion facts derivable from geometry
```

No dynamic object is required for a geometric line.

### 14.2 What should be value-like

Possible directly materialized line-hit coordinates are:

```text
H0: 69 identified bits = 3 x u32
H1: 69 identified bits = 3 x u32
```

A crossing-cell frontier needs at most 20 binary ownership bits **if binary ownership is sufficient state at that cut**.

A prior rough proposal described two u64 line masks plus u32 frontier as “128-bit.” That arithmetic is incorrect for standard 7x6:

```text
69 + 69 + 20 = 158 logical bits
```

and two u64s cannot hold two independent 69-bit masks anyway.

This does not hurt the underlying idea. The central question is not whether the whole semantic state fits literally in 128 bits; it is whether the useful dynamic transfer key can be represented by a small fixed number of words and operated on by flat arrays.

### 14.3 Primitive update algebra

For a legal landing at cell `x`:

```text
P0: H0' = H0 OR incidence[x]
P1: H1' = H1 OR incidence[x]
```

or in viable-line form:

```text
P0 move: P1Viable &= ~incidence[x]
P1 move: P0Viable &= ~incidence[x]
```

Line completion is derived from support plus line geometry, not by pointer traversal.

These are fixed-width bit operations.

### 14.4 Dense rolling table shape

If the separator state is exactly `F` binary crossing cells, a full truth slice has:

```text
2^F entries
```

At `F = 20`:

```text
1,048,576 entries
128 KiB per bit-packed Boolean plane
~1 MiB per byte-valued plane
```

Two rolling planes or a small number of fixed planes are naturally GPU-friendly compared with a persistent pointer graph.

The intended execution shape is:

```text
fixed line cut k
    -> contiguous frontier-state array
    -> precomputed/static transition map for next line constraint
    -> branch-light bitwise update
    -> rolling next array
    -> discard prior cut
```

The persistent DD node graph disappears if equivalent residual functions can be represented directly by the flat frontier key.

### 14.5 Why flattening individual quotient states is not enough

The 5x5 8-million-state falsifier already proved that “store each `(support,H0,H1)` state in a compact struct” does not solve the combinatorics.

The target is therefore **not**:

```text
millions of compact structs instead of millions of graph nodes
```

It is:

```text
replace the symbolic graph operation itself with bounded transfer-table algebra
```

That is the material architectural distinction.

---

## 15. The decisive semantic falsifier: is the separator Markov-complete?

The strongest version of the flat-transfer claim is now precise.

For each cut in the optimized 69-line order, partition occupied cells into:

```text
L = cells whose relevant line incidence lies only in the processed prefix
X = crossing cells whose incidence touches both prefix and suffix
R = cells whose relevant incidence lies only in the unprocessed suffix
```

For a closed exact Win or Loss Boolean function `f(L,X,R)`, fix an assignment `x` to `X` and vary all assignments `l` to forgotten cells `L`.

The crossing frontier alone is sufficient exactly when every such `l` produces the same residual function over `R`:

```text
f(l1, x, R) == f(l2, x, R)
for all l1,l2 compatible with the support/domain
```

A canonical ROBDD ref can serve as an exact equality oracle for this experiment even though the ROBDD itself is not the target implementation.

### 15.1 Measurements to collect

For every tested support and cut:

```text
crossing width
number of crossing assignments
number of distinct residual Win/Loss function pairs behind each assignment
maximum history classes per crossing assignment
mean history classes
worst support/rank
worst cut
exact collision witnesses when >1 class occurs
```

Define:

```text
historyBits = ceil(log2(maxHistoryClasses))
```

Interpretation:

- `maxHistoryClasses = 1`: crossing-cell key is a complete Markov boundary;
- small bounded value such as 2,4,8: keep a tiny exact history accumulator and still use flat transfer;
- large/explosive value: the raw crossing assignment is insufficient and the missing semantic summary must be identified before CUDA design.

This experiment is stronger and more useful than guessing a fixed `FrontierBits` field.

### 15.2 Why a failure would still be useful

A counterexample is not a dead end. It identifies the minimum hidden information forgotten too early.

Candidate missing summaries include:

- whether a processed identified line has already become permanently dead for one side;
- a compact paired line-hit/killed-line accumulator;
- first-win-sensitive terminal state;
- support-local realizability correlation;
- a small class ID for exact residual suffix functions.

The goal is to discover the smallest exact finite accumulator, not to defend “20 bits” as an assumption.

---

## 16. Relation to CPC, WSL-625, and NDC

The newer line-hit quotient changes how WSL-625 should be viewed.

WSL-625 remains an exact residual-requirement vocabulary derived from the 69 geometric line system. It need not necessarily be the primary stored dynamic state.

A plausible factorization is:

```text
physical/support geometry
  -> identified line-hit / viable-line state
  -> residual requirements derived from support + line identity
  -> WSL/CPC/NDC inference or certificate state where needed
  -> exact BSFP closed regions
```

The identified line quotient handles basic geometric future equivalence. CPC/NDC may still carry richer control/proof facts that are useful for early inference, certificates, or factorization.

Do not assume that because `(support,H0,H1)` is exact for physical W/D/L dynamics, it automatically replaces all CPC/NDC proof structure.

Likewise, `625` is not a bound on arbitrary ownership-frontier records and does not imply a 625-state full solver.

---

## 17. What has been rejected or constrained

The following paths should not be repeated without materially new evidence:

### Rejected as primary architecture

- full colored-state enumeration;
- minimax/search substitution for BSFP;
- flat enumeration of all concrete `(support,H0,H1)` quotient states;
- conventional generic cell-variable ZDD + recursive `MinJoin` as the direct C1 replacement;
- treating a pointer/hash-consed ROBDD implementation as inherently GPU-friendly;
- assuming line-frontier width 20 implies `<= 2^20` total symbolic complexity;
- storing dynamic per-line residual 4-bit masks when support already derives them;
- raw CUDA pointers as semantic mask/family identity;
- arbitrary Cartesian products of side hit masks without support-local realizability proof.

### Retained only as evidence/oracles

- ROBDD implementation: exact canonical-function oracle and algebra probe;
- ZDD prototype: exact family-algebra proof and negative cost evidence;
- concrete physical graphs: qualification only;
- direct quotient graph: exact quotient proof and scaling falsifier.

---

## 18. What currently looks strongest

The research now points toward a layered solution rather than one magic compression.

### Layer 1 — preserve the exact support-rank BSFP outer recurrence

The support lattice, terminal semantics, first-win rules and backward W/D/L recurrence remain sound. Do not restart from search.

### Layer 2 — remove obvious algebraic waste

Terminal specialization has the strongest direct exact candidate reduction measured so far: **52.84% fewer 5x5 terminal-subtraction candidates**.

B2/B3 may remove 43-phase rescans and duplicate-before-dominance waste if native C3/B2/B3 evidence supports them.

Double-threat inference may remove ~26.59% of post-combine candidates from normalization when recognition/compaction is cheap enough.

### Layer 3 — change symbolic coordinates

The identified line-product boundary materially compresses C1 symbolic regions, especially late/high-occupancy supports, with examples around 7–8x smaller than ownership boundaries.

This is the strongest representation result so far.

### Layer 4 — avoid persistent graph machinery

The line-first separator reaches width 20. If exact residual-function sufficiency can be captured by the crossing assignment plus a small bounded accumulator, the symbolic region can potentially be executed as flat rolling transfer arrays rather than persistent BDD/ZDD nodes.

This is the current highest-upside research hypothesis.

---

## 19. Next research sequence

The representation lane should proceed in this order.

### R1 — separator sufficiency / hidden-history census

Use the already exact small-control closed Win/Loss functions as oracle material. For each support and each cut in the optimized 69-line order:

1. fix the crossing-cell assignment;
2. vary forgotten processed-only cells;
3. canonicalize the residual Win/Loss functions over the suffix;
4. count distinct residual-function classes;
5. emit the smallest exact counterexample when the class count exceeds one.

Run complete controls first. Then target 4x5/5x4 hot supports and selected 5x5 supports before attempting an all-7x6 census.

### R2 — infer the minimum exact accumulator

If crossing cells alone are insufficient, classify each collision by semantic cause and add only the missing information.

Candidate accumulator forms should be compared by domain meaning, not just bit count:

- paired killed/viable-line masks restricted to the active cut;
- processed-line completion/death summary;
- exact residual-function class ID;
- small realizability correlation state;
- first-win terminal guard state.

Re-run R1 after each proposed summary. The first exact bounded state wins only if its transition can also be computed locally.

### R3 — graph-free flat transfer reference implementation

Build a research-only Node reference with:

```text
fixed line order
fixed-width state key
precomputed cut remaps
rolling contiguous arrays
no dynamic graph nodes
no pointer recursion
no hash-consing in the hot transfer loop
```

Compare every resulting support Win/Loss function or boundary with the authoritative C1 oracle on complete small controls.

### R4 — direct symbolic BSFP recurrence in line coordinates

Demonstrate that move cofactor, terminal subtraction, existential/universal composition and support-local realizability are closed under the selected flat state.

This is the production-semantic gate. Exact function parity at every support is required; root-only agreement is insufficient.

### R5 — cost census against C1

Measure on 5x5 and hot 5x4/4x5 supports:

- bytes read/written;
- active frontier entries per cut;
- total transfer configurations;
- history-class count;
- branch/divergence shape;
- equivalent C1 pair candidates avoided;
- normalization work avoided;
- peak live memory;
- opportunities for bit-packing / word-parallel planes.

Do not infer GPU performance solely from CPU reference timing.

### R6 — CUDA research profile only after R1–R5 pass

Then build a Connect4-owned Device-JS research profile using public CUDA-JS mechanisms.

Prefer:

```text
flat bounded arrays
bulk levelized kernels
precomputed integer offsets
bitwise masks
sort/compact only when necessary
integer handles rather than raw pointers
```

Do not build a generic dynamic GPU BDD/ZDD manager first.

### R7 — integration gate

Only after native evidence shows material gain:

- differential-qualify all support frontiers for 4x3, 4x4 and 5x5;
- preserve capacity fail-closed behavior;
- preserve no-post-ignition-host-semantic-progression;
- then retry 6x5;
- attempt 7x6 only after 6x5 completes with credible resource/cost evidence.

---

## 20. Production lane remains independently actionable

The larger representation research does not invalidate the outstanding production-adjacent measurements.

In parallel, the production lane still needs:

1. native C3 cause profile on the authorized GTX 1660 Ti;
2. native B2 A/B on both fixed workload families;
3. conditioned B3 A/B if C3 shows duplicate/prior-scan pressure;
4. Device-JS terminal specialization qualification if terminal work is material;
5. exact all-frontier requalification after any C1 reducer change.

These optimizations can compose with a later flat line-transfer representation and therefore remain worth preserving.

---

## 21. Key durable conclusions

1. **The current BSFP mathematics is sound through complete 5x5 native closure.** The problem is scaling, not a reason to restart as search.
2. **Raw subset comparison is not the first wall.** B1 can perform ~35.35B exact checks/s on the target GPU.
3. **C1's 6x5 wall begins surprisingly early in high-occupancy ranks**, with one 32-node epoch taking ~75.1 s.
4. **Generic terminal subtraction contains large exact waste.** Specialized subtraction removes ~52.84% of 5x5 terminal candidates.
5. **Double-threat inference is exact but modest for direct pair reduction** (~2.37%); its stronger value is pre-normalization absorption (~26.59% of baseline 5x5 pairs recognized as already proved after combination).
6. **The identified 69-line hit quotient is exact on tested physical transition/WDL systems** and collapses histories strongly in late ranks.
7. **Concrete quotient enumeration still explodes** (>8M 5x5 states by rank 15), so compact structs alone are not the answer.
8. **The line-hit product order compresses the full tested symbolic C1 boundary**, often by 50–64% overall on hot supports and around 7–8x on selected late supports.
9. **A generic recursive ZDD realization failed the structural cost test** on real hard operands despite exact algebra.
10. **ROBDD closed-region algebra is exact but administratively heavy**, making it a good oracle and a poor default GPU runtime model.
11. **Line-first incidence processing reaches a measured maximum crossing frontier of 20 cells** on standard 7x6.
12. **The highest-upside current hypothesis is graph-free rolling transfer algebra**, not a GPU decision-diagram engine.
13. **The next decisive test is separator sufficiency**: determine whether crossing-cell assignments alone, or with a tiny exact history accumulator, uniquely determine the residual closed Win/Loss function.

---

## 22. Source map

The most important existing durable records feeding this synthesis are:

- `docs/research/2026-09-09-owner-searchless-connect4-findings.md`
- `docs/research/2026-09-09-backward-winline-fixed-point.md`
- `docs/research/2026-09-09-searchless-symbolic-backward-solver.md`
- `docs/research/2026-09-09-searchless-closure-test-results.md`
- `docs/research/2026-09-09-bsfp-terminology-and-attribution.md`
- `docs/research/2026-09-10-compact-cuda-vertical-slice.md`
- `docs/research/2026-09-10-packed42-scaling-observation.md`
- `docs/research/2026-09-10-bsfp-antichain-performance.md`
- `docs/research/2026-09-10-c3-diagnostic-implementation.md`
- `docs/research/2026-09-10-cardinality-bucketed-normalizer-candidate.md`
- `docs/research/2026-09-10-double-threat-absorber-results.md`
- `docs/research/2026-09-10-terminal-subtraction-specialization-results.md`
- `docs/research/2026-09-10-identified-winline-quotient.md`
- `docs/research/2026-09-10-identified-winline-quotient-exact-results.md`
- `docs/research/2026-09-10-winline-product-antichain-results.md`
- `docs/research/2026-09-10-zdd-transfer-analysis-for-cuda-bsfp.md`
- `docs/research/2026-09-10-zdd-fused-minjoin-results.md`
- `docs/research/2026-09-10-zdd-incidence-frontier-census-results.md`
- `reference/research-prototypes/2026-09-10-zdd-transfer/frontier-width.mjs`
- `reference/research-prototypes/2026-09-10-zdd-transfer/optimize-line-frontier-order.mjs`
- `reference/research-prototypes/2026-09-10-zdd-transfer/line-frontier-support-census.mjs`
- `reference/research-prototypes/2026-09-10-zdd-transfer/fused-minjoin.mjs`
- `reference/research-prototypes/2026-09-10-zdd-transfer/monotone-closure-bdd.mjs`
- `reference/research-prototypes/2026-09-10-identified-winline-quotient/qualify.mjs`
- `reference/research-prototypes/2026-09-10-identified-winline-quotient/solve-quotient.mjs`
- `reference/research-prototypes/2026-09-10-identified-winline-quotient/product-antichain.mjs`

This synthesis is derivative context. The formal C4-0006..0009 specifications and exact run/evidence artifacts remain stronger authority within their scopes.

---

## 23. Research disposition at this checkpoint

Keep this entire state on `research/zdd-transfer-20260910` while the flat-transfer hypothesis is falsified or refined.

Do **not** merge the representation experiments into `feature/cuda-bsfp` merely because the structural results are promising.

The research branch now owns the continuity point for:

```text
69 identified lines
-> exact line-hit quotient
-> product-order symbolic compression
-> generic DD negative evidence
-> <=20-cell line-first separator
-> graph-free fixed-width rolling-transfer hypothesis
-> separator-sufficiency falsifier
```

The next research mutation should add the exact separator-sufficiency/history-class experiment, not another broad architecture rewrite.

---

## 24. References and credits

### 24.1 Authorship and project contribution

**Author and research lead:** Josh Oshiro.

The CUDA-BSFP research program recorded in this repository—including the project-specific CPC -> WSL-625 -> NDC -> BSFP development path, the identified winning-line quotient and product-order experiments, the CUDA execution constraints, experiment selection, evidence standards, and the current flat rolling-transfer direction—is attributed to Josh Oshiro within this project record.

**AI research and engineering assistance:** OpenAI ChatGPT was used as an AI research/engineering assistant for literature discovery and synthesis, prototype and test-harness generation, repository documentation, experiment orchestration, code review, and adversarial analysis. AI output is working material rather than independent authority. The exact claims in this document are supported by the repository's governing specifications, source revisions, test harnesses, and qualification evidence, not by model agreement.

Prior literature is credited below for concepts, algorithms, and historical context that informed comparison or later experiments. Citation of prior work does not imply that the project-specific CUDA-BSFP formulation or its measured results are derived from those papers unless explicitly stated.

### 24.2 Connect Four prior work

1. **Victor Allis.** “A Knowledge-Based Approach of Connect-Four: The Game Is Solved: White Wins.” *ICGA Journal*, 11(4), 1988. DOI: `10.3233/ICG-1988-11410`.  
   Relevance here: earlier published Connect Four knowledge/rule framework used for historical comparison and blocker-algebra qualification. The repository's Allis comparison tests validate a mapping of already-certified solved-group representations into generic blocker closure; they do not claim that every Allis rule-selection or compatibility condition is subsumed automatically.

### 24.3 Binary and zero-suppressed decision diagrams

2. **Randal E. Bryant.** “Graph-Based Algorithms for Boolean Function Manipulation.” *IEEE Transactions on Computers*, 35(8), pp. 677–691, 1986. DOI: `10.1109/TC.1986.1676819`.  
   Relevance here: canonical reduced ordered BDD representation and Boolean Apply/cofactor machinery; directly relevant to the ROBDD closed-region oracle/probe.

3. **Shin-ichi Minato.** “Zero-Suppressed BDDs for Set Manipulation in Combinatorial Problems.” *Proceedings of the 30th Design Automation Conference (DAC '93)*, pp. 272–277, 1993. DOI: `10.1145/157485.164890`.  
   Relevance here: zero-suppressed canonical representation of sparse set families and the general idea of sharing equal family suffixes.

4. **Olivier Coudert.** “Solving Graph Optimization Problems with ZBDDs.” *Proceedings of the European Design and Test Conference (ED&TC 1997)*, pp. 224–228, 1997. DOI: `10.1109/EDTC.1997.582363`.  
   Relevance here: specialized ZBDD family operations that fuse combinational construction with extremal/subsumption filtering, motivating the BSFP `MinJoin` experiment rather than materialize-then-normalize execution.

5. **Philippe Chatalic and Laurent Simon.** “Multi-Resolution on Compressed Sets of Clauses.” *12th IEEE International Conference on Tools with Artificial Intelligence (ICTAI 2000)*, 2000. DOI: `10.1109/TAI.2000.889839`.  
   Relevance here: compressed clause-family operations and subsumption-aware family algebra, a close analogue for constructing antichain results without first retaining every redundant intermediate member.

6. **Masaaki Nishino, Norihito Yasuda, Shin-ichi Minato, and Masaaki Nagata.** “Zero-Suppressed Sentential Decision Diagrams.” *Proceedings of the Thirtieth AAAI Conference on Artificial Intelligence*, 30(1), pp. 1058–1066, 2016. DOI: `10.1609/aaai.v30i1.10114`.  
   Relevance here: a more structured decomposition alternative when a strict linear ZDD ordering is insufficient; retained as a secondary direction rather than the current implementation target.

7. **Jun Kawahara, Takeru Inoue, Hiroaki Iwashita, and Shin-ichi Minato.** “Frontier-Based Search for Enumerating All Constrained Subgraphs with Compressed Representation.” *IEICE Transactions on Fundamentals of Electronics, Communications and Computer Sciences*, E100-A(9), pp. 1773–1784, 2017. DOI: `10.1587/transfun.E100.A.1773`.  
   Relevance here: frontier-based decision-diagram construction and forgetting entities after their final incidence. This directly motivated measuring the dual Connect Four incidence decompositions and the line-first crossing-cell frontier.

8. **Randal E. Bryant.** “Chain Reduction for Binary and Zero-Suppressed Decision Diagrams.” In *Tools and Algorithms for the Construction and Analysis of Systems (TACAS 2018)*, LNCS 10805, pp. 81–98, 2018. DOI: `10.1007/978-3-319-89960-2_5`.  
   Relevance here: hybrid BDD/ZDD reduction ideas and compact representation of chains/ranges; retained as a possible optimization only if future measurements show long forced/skipped-variable runs.

9. **Steffan Christ Sølvsten, Jaco van de Pol, Anna Blume Jakobsen, and Mathias Weller Berg Thomasen.** “Adiar: Binary Decision Diagrams in External Memory.” In *Tools and Algorithms for the Construction and Analysis of Systems (TACAS 2022)*, LNCS 13244, pp. 295–313, 2022. DOI: `10.1007/978-3-030-99527-0_16`.  
   Relevance here: evidence that BDD Apply/Reduce need not be implemented as recursive pointer chasing; iterative levelized/time-forward processing informed the bulk-GPU interpretation of decision-diagram ideas even though the current direction goes further toward graph-free transfer arrays.

10. **Kengo Nakamura, Masaaki Nishino, and Shuhei Denzumi.** “Single Family Algebra Operation on BDDs and ZDDs Leads to Exponential Blow-Up.” *35th International Symposium on Algorithms and Computation (ISAAC 2024)*, LIPIcs 322, Article 52, 2024. DOI: `10.4230/LIPIcs.ISAAC.2024.52`.  
    Relevance here: an important negative theoretical bound. Canonical DD representation and favorable variable ordering do not guarantee that rich family-algebra operations remain polynomial in input DD size. This supports the project's empirical requirement to test actual Connect Four operands rather than assuming ZDD/BDD compression removes the combinatorial wall.

### 24.4 Software and implementation references

- **TdZdd** (Kunihiro Saitoh and contributors): top-down/breadth-first decision-diagram manipulation framework. It was consulted as an implementation example showing that DD construction/evaluation can be levelized and parallel rather than inherently depth-first recursive. The project does not import TdZdd code or its C++ runtime into CUDA-BSFP.
- **Adiar** (Sølvsten et al.): consulted as an implementation/reference point for iterative time-forward BDD operations and memory-structured Apply/Reduce. CUDA-BSFP does not depend on the Adiar software package.

### 24.5 Credit boundary

The literature above receives credit for the concepts it introduced or developed: knowledge-based Connect Four analysis, BDD/ZDD canonicalization, zero suppression, subsumption-aware family operations, structured/frontier decomposition, chain reduction, and levelized DD processing.

The following remain project-specific research claims and require this repository's own evidence:

```text
CPC / WSL-625 / NDC / BSFP formulation used here
CUDA-BSFP support-rank execution semantics
C1 native exact closure and measured scaling wall
terminal-subtraction specialization measurements
identified 69-line hit quotient qualification
line-hit product-antichain compression measurements
generic ZDD MinJoin negative result on actual BSFP operands
standard-7x6 line-first frontier-width census
flat rolling-transfer / separator-sufficiency hypothesis
```

No citation substitutes for the exact falsifiers and qualification gates attached to those claims.
