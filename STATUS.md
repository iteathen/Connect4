# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** quotient-native exactness, proof-work compression, and bounded forward wall-clock speedup qualified

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game and determine which forward/backward exact reasoning forms exploit it best. This branch owns solver-neutral semantic and comparative research, not production solver implementation.

Product lanes remain:

- preserved historical `solver/minimax-alpha-beta`;
- `solver/cuda-bsfp`;
- `solver/hybrid-confluence`;
- future forward solver generation only after standard-7x6 scale/memory qualification.

## Exact relational identity

Logical state:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

For ordinary legal Connect Four, `sideToMove` is derived from support-rank parity and need not be stored in the hot state.

SIU-1 checked 1,681,808 complete-control physical states with zero projection, transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

Common algebra:

```text
forward:  T(q,a) -> q' | terminal
backward: Pre_a(Q) -> exact predecessor set/frontier
hybrid:   exact W/D/L or sound proof facts keyed by q
```

State-level inverse transition is intentionally set-valued; reversibility is not required.

## Quotient-native forward kernel

The current forward research kernel is genuinely quotient-native:

```text
qID -> supportIndex + p0ResidualClassId + p1ResidualClassId
sideToMove = rank(supportIndex) & 1
```

Search carries numeric qIDs only. No recursive colored-board state, BigInt state, string key, or precompiled game DAG is used in the timed kernel.

Complete reachable q census remains exact:

| Geometry | reachable q states |
| --- | ---: |
| 4x3 c3 | 3,735 |
| 4x4 c4 | 34,095 |
| 5x3 c4 | 11,317 |
| 4x5 c4 | 294,593 |

Root and every legal root-action W/D/L match the independent BSFP oracle.

## Flat specialized residual transition algebra

The major hot-path result is that generic antichain normalization is unnecessary for a one-cell placement.

- opponent blocking is an order-preserving filter;
- mover advancement splits the antichain into an unchanged stream and a landing-bit-reduced stream;
- each stream remains internally canonical;
- the only new dominance possible is `reduced term ⊆ unchanged term`;
- after removing those dominated unchanged terms, the two sorted streams are merged;
- if the landing cell affects no term, the original class ID is returned exactly.

The implementation in `state-identity-unification/src/quotient-native-negamax-fast-kernel.mjs` operates directly on the residual slabs and avoids transition-time nested term arrays plus general sort/minimize.

It reproduced the complete reachable graph with identical state IDs, class IDs, state tuples, and edge census on every control, plus independent BSFP root/action W/D/L.

Same-search median timing versus the prior qualified generic transition path:

| Geometry | generic | flat specialized | ratio |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 0.591 ms | 0.514 ms | 0.870 |
| 4x4 c4 | 6.708 ms | 3.475 ms | 0.518 |
| 5x3 c4 | 0.858 ms | 0.708 ms | 0.825 |
| 4x5 c4 | 20.063 ms | **13.269 ms** | **0.661** |

Authority:

- `state-identity-unification/QUOTIENT_FAST_KERNEL_RESULT.md`
- run `34648796525`, job `103425854486`

## Governing bounded quotient-vs-physical result

The fair physical control uses:

```text
physical state = supportIndex + exact P0 ownership
P1 = support universe - P0
```

It has the same exact W/D/L fail-soft full-window Negamax contract, same immediate-win/forced-response/double-threat closure, same TT-best/center-first order, exact key equality, and a bounded 4-way exact-key TT. The physical typed arrays are required to fit under the quotient's frozen isolated-root typed-array lower-bound budget.

With the flat quotient transition kernel:

| Geometry | quotient | physical | q/physical | q expansions | physical expansions |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x4 c4 | **3.182 ms** | 4.270 ms | **0.745** | 4,250 | 9,403 |
| 5x3 c4 | **0.708 ms** | 2.086 ms | **0.340** | 852 | 4,315 |
| 4x5 c4 | **12.651 ms** | 17.715 ms | **0.714** | 15,054 | 36,826 |

On the largest complete bounded proxy, quotient-native Negamax is about **28.6% faster** while expanding about **59.1% fewer states**.

4x5 memory control:

```text
quotient typed lower-bound budget: 1,845,248 B
physical used:                     1,745,668 B
physical TT slots:                   131,072
physical TT load:                      33.3%
physical replacements:                    519
```

The quotient residual metadata still includes ordinary JavaScript number arrays, so this is not yet complete heap accounting. It is nevertheless a qualified bounded wall-clock win, not merely a node-count win.

Authority:

- `state-identity-unification/QUOTIENT_VS_PHYSICAL_WDL_V4_RESULT.md`
- run `34648899005`, job `103426178175`

Earlier v1-v3 physical comparisons remain historical evidence only.

## Search-control conclusions

Current largest-control baseline:

```text
W/D/L-native fail-soft full-window Negamax
+ quotient-native tactical closure
+ exact qID lower/upper/best-move records
+ dense residual-class transition cache
+ flat specialized residual transitions
+ no full per-state edge cache
+ no speculative ETC
```

Native driver tournament retained full-window W/D/L over PVS, MTD(f), and the two-threshold driver. Precompiled-DAG ETC reduced proof work, but native speculative child construction cost more than it saved. Witness-only ETC also failed to earn its cost on 4x5.

Dense residual-class transition caching remains the speed default on 4x5 despite sparse occupancy; sparse/direct caches are memory-pressure candidates only.

## Exact one-sided exhaustion bounds

Exact rules were qualified:

```text
opponent residual empty -> side to move cannot lose -> LB >= 0
own residual empty      -> side to move cannot win  -> UB <= 0
```

They are geometry/context dependent as optimizations.

Split campaign median timing:

```text
4x4: baseline 3.349 ms, non-win 2.872 ms
5x3: baseline 0.759 ms, both    0.382 ms
4x5: baseline 11.970 ms, both   11.924 ms  # effectively neutral
```

Thus no one-sided exhaustion bound is a 4x5 default today. Preserve the theorem as an exact conditional mechanism and reconsider if the driver/representation/7x6 cost model changes.

Authority:

- `state-identity-unification/QUOTIENT_EXHAUSTION_BOUNDS_RESULT.md`
- combined run `34649100614`, job `103426816347`
- split run `34649184442`, job `103427078530`

## Current next seam

Do not reopen search-driver or generic ordering campaigns. The next strongest structural target is the residual **term vocabulary / term-ID substrate**.

Every residual requirement is a non-empty subset of a winning line. Instead of carrying two-u32 masks as the primary residual-term representation, discover and qualify the finite geometry-specific vocabulary, assign compact IDs, and compile transition/dominance metadata.

Target shape:

```text
termId -> exact residual mask / cardinality / cell membership
(termId, landingCell) -> unchanged | terminal | reducedTermId
(termIdA, termIdB) -> subset/dominance fact
residual class -> sorted compact term IDs
```

Measure:

1. exact term vocabulary size for all bounded controls and standard 7x6;
2. whether standard 7x6 confirms the expected small finite residual universe rather than hard-coding a remembered bound;
3. class memory and complete heap/typed-slab accounting;
4. transition miss cost versus the current flat two-u32 implementation;
5. class hashing/equality bandwidth;
6. resulting fair quotient-vs-physical timing.

After term-ID/memory economics stabilize, proceed to quotient-native structural/proof-cost ordering, reflection/residual automorphism, then standard-7x6 reachable scale. Actual BSFP boundary build/publication/query cost remains required before any hybrid speed claim.

## Hard non-claims

- no standard 7x6 production performance claim yet;
- no complete equal-total-JS-heap memory claim yet;
- no global claim that dense class-transition storage remains optimal at 7x6 scale;
- no default ETC claim on the native kernel;
- no default one-sided exhaustion claim on the governing 4x5 proxy;
- no end-to-end hybrid speedup claim until actual BSFP cost is included.
