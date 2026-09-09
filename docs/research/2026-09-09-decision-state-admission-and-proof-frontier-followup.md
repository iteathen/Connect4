# Decision-state TT admission, proof-frontier, and compact-rank follow-up

**Date:** 2026-09-09  
**Status:** research evidence only; no maintained-source promotion.

This follow-up began from research branch `66d5d26bfdde33c1545ffae21cf483c5fa1f79f3`. Before preservation, the remote branch had independently advanced to `fce02b3a10ea8a3dac053b3c04ba49238cccc5fd` with native win-space and additional structural-candidate evidence. That work is preserved unchanged. This note records only additional evidence that materially extends it.

## 1. Decision-state TT admission

The earlier recursion-only forced-chain control preserved every intermediate TT lookup and publication. It therefore preserved the exact node/hit/write counts and mostly traded stack overhead for loop bookkeeping.

A stronger variant treats certified single-choice states as **edges between decisions**:

- apply exactly the same tactical candidate filtering as the baseline;
- if exactly one surviving candidate remains, advance it without a TT lookup or publication for that intermediate state;
- preserve the same negamax window transformation and fail-soft result semantics;
- cache again when the search reaches a genuine branch state.

This does not change legal moves or exact-score semantics. It deliberately changes which states deserve general-purpose TT space.

### 512K single-worker results

| Position | Variant | Nodes | TT hits | TT writes | Forced transitions |
| --- | --- | ---: | ---: | ---: | ---: |
| `663152175` | baseline | 1,004,480 | 184,502 | 577,277 | 0 |
| `663152175` | decision-only | 1,010,950 | 173,338 | 425,040 | 161,571 |
| `41267575` | baseline | 5,945,560 | 1,119,606 | 3,383,162 | 0 |
| `41267575` | decision-only | 5,521,407 | 987,381 | 2,173,208 | 1,022,989 |

In a six-repeat CPU-time batch, median CPU was approximately:

- `663152175`: 228.3 ms baseline vs 198.2 ms decision-only (~13.2% lower);
- `41267575`: 1,278.7 ms baseline vs 981.7 ms decision-only (~23.2% lower).

Timing is sandbox evidence, not a portability claim. The structural effects are deterministic for these one-worker runs: the larger solve performs ~7.1% fewer nodes and ~35.8% fewer TT publications. The smaller solve performs ~0.64% more nodes but still avoids ~26.4% of publications.

### Independent qualification

A separate cell-array oracle generated 100 legal late 7x6 roots with no immediate current-player win. Baseline and decision-only variants agreed with the independent exact distance-sensitive value on all 100 cases. The oracle traversed 305,167 nodes in total. This does not replace a full early-game independent oracle or concurrent-publication qualification.

## 2. Admission threshold sweep

The decision-only result raised a broader question: how much branching uncertainty should a state have before it earns TT space?

With a flat 512K table:

### `41267575`

| Minimum surviving choices cached | Nodes | Hits | Writes | Median CPU ms |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 5,521,407 | 987,381 | 2,173,208 | 1,147.8 |
| 3 | 5,864,795 | 867,837 | 1,782,542 | 1,112.2 |
| 4 | 7,623,802 | 632,108 | 1,162,665 | 1,217.5 |
| 5 | 13,354,937 | 374,869 | 578,516 | 2,698.7 |

The 3+ threshold traded more recomputation for fewer writes and was slightly faster in this flat-table batch.

### `663152175`

The same 3+ threshold was clearly worse: 1,088,303 nodes vs 1,010,950 and ~233 ms vs ~214 ms median CPU. Therefore no universal branch-count threshold is supported.

## 3. Interaction with intrinsic rank banking

The 512K exact-16 rank layout uses sixteen 32K banks: ranks 21..34 receive their own banks, with low/high fallback ranges. Combined with decision-only admission:

### `41267575`

| Variant | Nodes | Hits | Writes |
| --- | ---: | ---: | ---: |
| flat baseline | 5,945,560 | 1,119,606 | 3,383,162 |
| rank only | 5,282,073 | 935,240 | 3,014,569 |
| decision + rank | **5,261,422** | 888,871 | **2,081,030** |

The combination searches ~11.5% fewer nodes and publishes ~38.5% fewer entries than the original flat table. In the first three paired larger-position runs, decision+rank CPU time was ~1.09-1.17 s versus ~1.54-1.73 s for baseline.

The admission threshold interaction changed after banking: 3+ branches was worse than caching every genuine 2+ branch. On `41267575`, rank+threshold2 searched 5,261,422 nodes while rank+threshold3 searched 5,654,221. This is evidence that the threshold was partly compensating for flat-table pollution; once rank removes that pollution, excluding 2-way decisions destroys useful reuse.

## 4. Rank-compatible compact exact key

The previously preserved 10-byte compact exact key used at least 17 implicit index bits, which prevented the profitable 32K (15-bit) banks. This follow-up changes the encoding rather than abandoning either structure.

For a 15-bit local bank slot, exact identity requires 34 explicit residual bits:

- 17 bits of `keyHi`;
- the 17 mixed-key bits not supplied by the local slot.

The low 32 residual bits remain in the existing 32-bit key array. The remaining two exact identity bits are stored in the high two bits of the existing writer/diagnostic byte; the lower six bits remain available for worker identity (up to 63 nonzero writer IDs). Bound and control storage are unchanged.

Thus the TT remains **10 bytes/entry** while supporting 32K rank banks. This is exact identity, not fingerprinting.

At 512K total entries, the compact-rank variant produced exactly the same nodes, hits, and writes as the 14-byte full-key rank-banked variant on both established positions:

- `663152175`: 1,006,240 nodes / 177,311 hits / 579,631 writes;
- `41267575`: 5,282,073 nodes / 935,240 hits / 3,014,569 writes.

The result removes the earlier encoding/layout conflict. Concurrent writer-ID limits and version/publication semantics remain separate qualification obligations.

## 5. Compact key + decision admission + fine rank banks

The three structural mechanisms were then composed without changing search semantics:

1. exact 10-byte residual key;
2. intrinsic 32K rank banks;
3. no TT traffic for certified single-choice intermediate states.

At 512K entries:

| Position | Variant | Nodes | Hits | Writes | Median CPU ms (5-run batch) |
| --- | --- | ---: | ---: | ---: | ---: |
| `663152175` | flat baseline | 1,004,480 | 184,502 | 577,277 | 393.5 |
| `663152175` | compact decision+rank | 1,014,754 | 167,269 | 427,015 | **241.5** |
| `41267575` | flat baseline | 5,945,560 | 1,119,606 | 3,383,162 | 1,357.1 |
| `41267575` | compact decision+rank | **5,261,422** | 888,871 | **2,081,030** | **1,070.2** |

The timing batches were noisy and are not claimed as stable percentages. The deterministic composition result is stronger: the compact representation preserves exactly the decision+rank search graph while reducing per-entry TT storage from 14 to 10 bytes.

## 6. Dominance Pareto frontier

Independent structural work already established proof implication/dominance between non-identical minimal-requirement states. This follow-up implemented explicit WDL proof frontiers per legal skeleton rather than treating all solved history as one unordered scan.

The frontier keeps:

- P0-minimal proven wins (harder winning certificates dominate easier redundant wins);
- P0-maximal proven losses;
- minimal and maximal draw certificates for lower/upper zero bounds.

On complete small games the frontier preserved the dominance search reduction:

| Geometry | Baseline expanded | Frontier expanded | Reduction | Max certificates in one skeleton |
| --- | ---: | ---: | ---: | ---: |
| 4x3 connect-3 | 234 | 215 | 8.1% | 7 |
| 4x4 connect-4 | 31,068 | 19,903 | 35.9% | 116 |
| 5x3 connect-4 | 10,688 | 8,702 | 18.6% | 19 |
| 4x5 connect-4 | 241,276 | 120,930 | **49.9%** | 388 |

The current frontier maintenance is still comparison-heavy and slower in the larger complete games. The result is therefore a representation bound: useful implication knowledge can be retained as a finite antichain/Pareto object rather than arbitrary solved history, but the frontier itself still needs a cheaper bit-indexed representation.

## 7. Residual symmetry and geometric reflection distinction

Separate exhaustive tests confirmed the independent branch's residual-symmetry result: after minimal-requirement reduction, arbitrary column-role permutations create exact residual-game equivalences. On 7x6 late roots, state reductions reached ~38.3% in the heaviest tested root. A fingerprint partition reduced brute 5,040 permutations to roughly 80-170 candidates per key, but remained far too expensive in high-level JS.

By contrast, ordinary physical-board reflection canonicalization was negative/weak in the direct-mapped TT. On `41267575`, it increased nodes at 256K, 512K, 1M and 2M in the tested layouts (for example 5,945,560 -> 6,578,685 at 512K). The changed direct-map collisions outweighed mirror reuse.

This reinforces that residual-game automorphisms and geometric board symmetry are different mechanisms.

## Disposition

### Strong additions to the active structural candidate set

- **Decision-state TT admission / forced macro-edges.** A deterministic chain state does not automatically deserve a general-purpose cache record.
- **Fine intrinsic rank banking + decision-state admission.** The mechanisms compose positively in the large exact solve.
- **Rank-compatible 10-byte exact key.** Removes the minimum-bank-size conflict without weakening identity.
- **Pareto dominance frontier** as the right semantic owner for implication proofs; implementation still needs indexing/compression.

### Interaction warnings

- Branch-count admission thresholds are layout-dependent. Do not bake in `3+` globally.
- More equivalence sharing can worsen a bounded direct-mapped TT through collision changes; physical reflection demonstrates this.
- Compact identity and physical banking must be designed together; address bits are part of the exact-key contract.

### Next seams

1. Encode decision-state admission in the native win-space candidate rather than only the colored-board control, to see whether forced macro-edges compound semantic-state reduction.
2. Derive a bit-indexed dominance frontier from the same minimal-requirement antichain used by win-space identity, rather than maintaining a separate comparison-heavy proof structure.
3. Re-derive rank-bank capacities after decision-only admission, using branch-state demand rather than all-node demand.
4. Qualify compact decision+rank under shared workers; the current evidence is single-worker only and the inherited publication protocol remains research-grade.
