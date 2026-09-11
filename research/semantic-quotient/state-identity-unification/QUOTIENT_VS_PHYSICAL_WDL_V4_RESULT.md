# Flat Quotient-Native versus Physical Exact W/D/L Control

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34648899005`, job `103426178175`  
**Status:** complete bounded-control evidence; not a standard-7x6 production claim

## Question

After replacing discovery-oriented residual normalization with the qualified flat transition algebra, does quotient-native W/D/L Negamax still lose its wall-clock advantage to a conventional physical ownership representation under a bounded memory control?

## Fairness contract

Both sides use:

- exact W/D/L fail-soft full-window Negamax;
- immediate-win, forced-response, and double-threat tactical closure;
- TT-best then center-first ordering;
- exact identity checks rather than probabilistic hash authority;
- independent BSFP root and per-root-action W/D/L qualification.

Quotient identity:

```text
supportIndex + exact P0 residual class + exact P1 residual class
side-to-move = support-rank parity
```

Physical identity:

```text
supportIndex + exact P0 ownership
P1 ownership derived from support
```

The physical solver uses a bounded 4-way exact-key TT. Replacement may lose cache information but cannot create a false exact hit.

For each geometry, the typed-memory budget was frozen from an isolated quotient root solve, including the fast kernel's fixed scratch arrays. The physical control then received the largest supported TT fitting that same typed-byte budget.

Caveat: quotient residual metadata is still stored partly in ordinary JavaScript number arrays, so the quotient byte figure remains a lower bound on total JS heap use. This is a bounded engineering comparison, not a final equal-total-memory 7x6 claim.

## Result

| Geometry | quotient median | physical median | q / physical | q expansions | physical expansions | expansion ratio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x4 c4 | **3.182 ms** | 4.270 ms | **0.745** | 4,250 | 9,403 | 0.452 |
| 5x3 c4 | **0.708 ms** | 2.086 ms | **0.340** | 852 | 4,315 | 0.197 |
| 4x5 c4 | **12.651 ms** | 17.715 ms | **0.714** | 15,054 | 36,826 | 0.409 |

On the largest complete bounded proxy, quotient-native Negamax is about **28.6% faster** while expanding about **59.1% fewer states**.

The 4x5 typed-memory control was:

```text
quotient lower-bound budget: 1,845,248 B
physical used:               1,745,668 B
physical TT slots:             131,072
physical TT load:                33.3%
physical replacements:              519
```

The physical control was therefore not obviously losing only because its TT was saturated.

## Interpretation

The earlier v3 result had already shown a large semantic-work advantage but a small wall-clock deficit:

```text
4x5 v3:
quotient 16.697 ms
physical 15.804 ms
quotient expansions 15,054
physical expansions 36,826
```

After specializing the quotient transition algebra, the same search moved to:

```text
4x5 v4:
quotient 12.651 ms
physical 17.715 ms
```

The architectural conclusion is therefore no longer merely that quotient identity reduces node count. On the qualified bounded controls, a quotient-native implementation can convert that reduction into an end-to-end wall-clock win.

This does **not** establish standard 7x6 production superiority. It does establish that the quotient approach has survived the key bounded physical-control challenge and merits continued optimization/scaling work rather than fallback to the old physical representation.

## Current forward baseline

```text
exact quotient qID
+ rank-derived side to move
+ flat two-u32 residual substrate
+ specialized one-cell residual transition algebra
+ dense residual-class transition cache
+ quotient-native tactical closure
+ W/D/L fail-soft full-window Negamax
+ exact qID bounds / best move
+ no speculative ETC
+ no per-state edge cache
```

## Next evidence seam

Before scaling claims:

1. test exact one-sided residual exhaustion bounds;
2. investigate compact term-ID/WSL substrate and full memory accounting;
3. test quotient-native structural/proof-cost ordering;
4. test horizontal reflection/residual automorphism canonicalization;
5. qualify reachable 7x6 scale and transition economics;
6. only then rebuild/promote the solver lane.
