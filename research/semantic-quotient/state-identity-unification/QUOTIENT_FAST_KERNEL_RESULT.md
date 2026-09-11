# Flat Specialized Quotient-Native Kernel Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34648796525`, job `103425854486`  
**Status:** qualified on all complete bounded controls

## Change

The research quotient kernel previously used generic residual-antichain normalization on transition-cache misses: nested pair allocation, sorting by cardinality/mask, and general subset minimization.

For a single Connect Four placement this work is unnecessary.

- Opponent blocking only filters terms containing the landing cell. A filtered subset of a normalized antichain remains a normalized antichain in the original canonical order.
- Mover advancement partitions the source antichain into terms containing the landing cell and terms not containing it. Clearing the same bit from every affected term preserves the affected stream's order and mutual incomparability. The unchanged stream also remains an antichain. The only new possible dominance is `reduced term ⊆ unchanged term`, after which the two already-sorted streams can be merged.
- If the landing cell is absent from all terms, the transition returns the original class ID exactly.

The implementation in `src/quotient-native-negamax-fast-kernel.mjs` operates directly over the residual flat slabs. It avoids transition-time nested term arrays and generic sorting/minimization.

## Qualification

The fast implementation was compared with the qualified baseline over the **complete reachable quotient graph** for all four controls. It reproduced:

- the exact relational state count;
- the exact residual class count and class IDs;
- every state ID's support/P0-class/P1-class tuple;
- terminal, nonterminal, and illegal edge census;
- independent BSFP root W/D/L;
- independent BSFP per-root-action W/D/L.

Complete reachable censuses remained:

| Geometry | q states | terminal edges | nonterminal edges | illegal edges |
| --- | ---: | ---: | ---: | ---: |
| 4x3 c3 | 3,735 | 2,390 | 7,842 | 4,708 |
| 4x4 c4 | 34,095 | 6,256 | 94,508 | 35,616 |
| 5x3 c4 | 11,317 | 1,786 | 35,933 | 18,866 |
| 4x5 c4 | 294,593 | 76,058 | 814,300 | 288,014 |

## Same-search timing

Median total time, baseline versus flat specialized implementation:

| Geometry | baseline | flat specialized | fast/base |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 0.591 ms | 0.514 ms | 0.870 |
| 4x4 c4 | 6.708 ms | 3.475 ms | 0.518 |
| 5x3 c4 | 0.858 ms | 0.708 ms | 0.825 |
| 4x5 c4 | 20.063 ms | **13.269 ms** | **0.661** |

The 4x5 improvement is about **33.9%** under unchanged search work and exact semantics.

## Interpretation

This result falsifies the earlier concern that the residual quotient inherently carries too much transition cost. A substantial part of the cost was caused by the discovery-oriented generic antichain implementation, not by the quotient algebra itself.

The flat specialized transition law now becomes the forward-kernel implementation baseline for subsequent experiments. The older generic normalizer remains useful as a qualification/reference path.

## Remaining opportunities

The fast kernel still retains several non-final physical choices:

- residual metadata is held in JavaScript number arrays rather than a compact typed term-ID substrate;
- the q state pool stores separate lower/upper/best arrays and a stored hash;
- no horizontal reflection/residual automorphism canonicalization is active;
- no exact one-sided win-space-exhaustion bounds are seeded;
- no Connect4-specific quotient proof-cost ordering is active;
- standard 7x6 scale remains unqualified.
