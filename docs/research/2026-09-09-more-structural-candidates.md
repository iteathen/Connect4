# Additional structural candidate experiments

**Date:** 2026-09-09  
**Status:** research evidence only; no maintained-source promotion.

## Scope

This batch continued the structural/organic optimization search after the win-space antichain and rank-banked TT results. Tested independently:

1. forced-consequence compression;
2. residual-game column symmetry;
3. proof implication / dominance across non-identical win-space states;
4. explicit WDL-first score refinement;
5. ordinary board-reflection TT canonicalization;
6. TT move-hint replay;
7. interaction of compact exact keys with rank banking.

All tests retained exact negamax/minimax semantics for their respective harnesses. High-level win-space prototypes are mechanism tests; their absolute timings are not hot-kernel qualification.

## 1. Forced-consequence compression: recursion-only version does not reduce work

`solver_forced_chain.mjs` follows forced single-candidate chains iteratively instead of recursively while preserving every intermediate TT lookup/publication.

On `663152175`, at 256K/512K/1M TT capacities, score, nodes, hits and writes were **exactly identical** to baseline. Roughly 145K-154K forced transitions were observed and chains reached length 8, but the search graph did not shrink.

Interpretation: replacing recursive calls with a loop is only a control-flow optimization if intermediate states retain the same TT/search treatment. The current evidence does not justify more machinery merely to remove stack frames. A future macro-edge variant would need to deliberately omit/merge intermediate TT work and measure the recomputation tradeoff; that is a different idea.

## 2. Residual-game symmetry: strong semantic collapse; brute-force canonicalization was the wrong integration

Once the game state is represented as column frontiers plus minimal remaining winning requirements, arbitrary column permutations can describe equivalent residual games even when they are not geometric board symmetries. Full permutation canonicalization produced large exact state reductions:

| Geometry | Raw win-space states | Canonical residual-permutation states | Reduction |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 3,735 | 1,648 | 55.88% |
| 4x4 connect-4 | 34,095 | 10,497 | 69.21% |
| 5x3 connect-4 | 11,317 | 1,499 | 86.75% |

A refined canonicalizer was then implemented using iterative structural column signatures. It only enumerates permutations among columns that remain indistinguishable under the residual requirement hypergraph.

It reached **exactly the same canonical state counts as full permutation enumeration** while reducing average candidate permutations per visited key from:

- 24 -> ~1.79 on 4x3 connect-3;
- 24 -> ~1.62 on 4x4 connect-4;
- 120 -> ~3.70 on 5x3 connect-4.

On seven ordinary 7x6 late roots, state-count reductions ranged from ~4.3% to ~38.3%. The refined high-level implementation examined roughly 80-171 candidate permutations per key rather than all 5,040, but remained far slower than raw keys because it still uses BigInt arrays, strings, graph-like signature construction and sorting.

Interpretation: residual symmetry is a **real equivalence-class reduction**. The primary remaining problem is a machine representation/canonical-labeling problem, not combinatorial impossibility.

## 3. Proof implication / dominance: positive live-search result

For two residual win-space states with the same legal frontiers and side to move, define A as P0-favorable relative to B when:

- every P0 win possible in B is also possible (or easier) in A; and
- every P1 win possible in A is also possible (or easier) in B.

Using the minimal-requirement formulas, this is checked by implication between antichains. The intended bound is:

`V_P0(A) >= V_P0(B)`.

Exhaustive relationship audits found no exact-score or WDL violations in the tested complete small games. More importantly, a live alpha-beta prototype used **exact solved states as dominance-derived lower/upper bounds** for non-identical states.

| Geometry | Baseline nodes | Dominance nodes | Reduction |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 1,634 | 1,546 | 5.39% |
| 4x4 connect-4 | 11,285 | 10,390 | 7.93% |
| 5x3 connect-4 | 10,501 | 9,134 | 13.02% |

All exact root scores agreed. The naive group scan doubled elapsed time on the smallest case, was roughly neutral on 4x4, and was faster in the measured 5x3 run. This is not a timing qualification; it establishes avoided search work.

A 7x6 late-root mechanism test also produced real reductions where enough search remained. The largest tested root in that cohort dropped **156 -> 137 nodes (~12.18%)**, with 10 dominance cutoffs; trivial roots naturally showed zero benefit.

Interpretation: this is the first evidence that **proofs can be reused by implication, not only state equality**. A production candidate should not scan all solved states. The next structural problem is maintaining a compact Pareto/antichain frontier of useful bound certificates per compatible legal skeleton/rank.

## 4. WDL-first then distance refinement: negative in current exact-score solver

Explicitly proving outcome class around zero before refining the distance-sensitive score increased search work:

- `663152175`, 512K: 1,004,480 -> 1,236,730 nodes (**+23.1%**);
- `41267575`, 512K: 5,945,560 -> 6,273,761 nodes (**+5.5%**).

Some noisy wall-time runs were competitive, but the structural work metric is worse. The existing score-threshold sequence already exploits TT reuse in a way the explicit two-stage decomposition disrupts.

Disposition: negative for this integration. Do not infer that WDL is useless as a separate product query; it is not a better prepass for the current exact-distance solve.

## 5. Ordinary horizontal-reflection TT identity: negative/weak in direct-mapped layout

A fixed-width reflected state was canonicalized before TT lookup. On `663152175`, node effects ranged from ~1.7% fewer at 256K to essentially neutral/slightly worse at larger capacities. On `41267575` at 256K, reflection canonicalization **increased** nodes ~3.1% because the changed direct-mapped collision pattern outweighed symmetry reuse. It also added substantial arithmetic overhead in this prototype.

Interpretation: equivalence reduction does not guarantee a better bounded direct-mapped cache. Residual-game symmetry remains more interesting because it collapses equivalence classes after win-space reduction and is much broader than board reflection.

## 6. TT move hint: small node savings, current representation cost too high

A one-byte best/cutoff move hint was stored with TT entries and replayed first on validated hits.

Observed node reductions were small:

- `663152175`: ~0.7%-1.3% depending on capacity;
- `41267575`, 512K: ~0.6%.

The separate byte array and move-column bookkeeping made the prototype slower/noisy. The idea is not disproven if the hint can live in otherwise-unused packed bits (the compact-key layout has candidate room), but it has not shown enough avoided work to justify a standalone byte per entry.

## 7. Compact exact key + rank banking: positive interaction but weaker than old fine banking

The fixed exact residual key requires at least 17 implicit index bits, so a 512K table can be divided into at most four independent 128K banks without changing the encoding. Using four intrinsic rank bands on `41267575`:

- compact flat: 5,945,560 nodes;
- compact + 4 rank banks: 5,801,628 nodes;
- reduction: **~2.42%**.

On `663152175`, the same layout increased nodes ~2.73%.

Interpretation: rank banking survives the denser key representation but its profitable granularity changes. The earlier 16x32K full-key layout's ~11.2% node reduction cannot simply be carried across because the compact identity contract changes the minimum bank size. Layout must be re-derived in bytes and encoding constraints.

## Revised candidate disposition

### Strongly promote for further research

1. **Minimal remaining win requirements as search identity.**
2. **Residual-game symmetry**, using structural refinement rather than brute-force permutations.
3. **Dominance/implication proof reuse**, with a compact Pareto frontier instead of linear scans.
4. **Intrinsic rank banking**, retuned to the actual entry/key encoding.
5. **Compact exact residual key.**

These mechanisms attack distinct redundancies: historical state distinctions, residual automorphisms, proof implication, impossible cross-rank identity, and redundant stored key bits.

### Keep as conditional/minor candidates

- TT move hint, only if it can be packed nearly for free.
- forced-chain macro edges, only if a new version actually removes intermediate general-purpose TT/search work.

### Negative in tested integration

- explicit WDL-first prepass for exact distance score;
- ordinary board-reflection TT canonicalization in the current direct-mapped layout;
- recursion-only forced-chain compression.

## Next structural seam

The highest-value next design question is no longer whether win-space compression exists. It is how to represent three related objects cheaply and canonically:

1. the **minimal requirement antichain**;
2. its **residual column automorphism classes**;
3. a **dominance frontier** that can return lower/upper bounds without scanning arbitrary prior states.

A strong representation may make all three operations different views of the same compact structure. That is preferable to implementing three unrelated policy systems.
