# Quotient-native exact-search driver tournament

**Status:** complete; full-window W/D/L advances as current larger-control native driver  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`

## Question

Which exact Negamax driver is strongest after quotient child construction, state interning, residual-class transitions, tactical closure and W/D/L TT maintenance become real runtime work rather than precompiled DAG lookups?

All candidates used the same quotient-native machine representation:

```text
qID -> supportIndex + p0ResidualClassId + p1ResidualClassId
sideToMove = rank(supportIndex) & 1
```

with the current speed-winning dense residual-class transition table, no full quotient-edge cache, quotient-native tactical closure and fail-soft W/D/L bounds.

## Candidates

- `D0` full-window alpha-beta/negamax control;
- `D1` PVS/NegaScout;
- `D2` MTD(f), first guess 0;
- `D3` two-threshold W/D/L classifier;
- `D4` PVS + one exact best-child witness + witness-only ETC;
- `D5` MTD(f) + witness + witness-only ETC;
- `D6` threshold + witness + witness-only ETC.

Every candidate independently matched the BSFP oracle for root W/D/L and every legal root action before timing.

Authority:

- `src/quotient-native-driver-campaign.mjs`
- Actions run `34647110759`, job `103420431514`

## 4x5 c4 — governing bounded control

| Candidate | Median total | Expanded | Calls | Typed-memory lower bound |
| --- | ---: | ---: | ---: | ---: |
| **D0 full-window** | **18.759 ms** | **15,054** | **24,882** | 1,844,704 B |
| D1 PVS | 19.706 ms | 15,062 | 24,891 | 1,844,704 B |
| D2 MTD(f) | 19.282 ms | 15,058 | 24,885 | 1,844,704 B |
| D3 threshold | 19.111 ms | 15,159 | 25,041 | 1,844,704 B |
| D4 PVS + witness | 19.575 ms | 14,808 | 24,637 | 1,926,624 B |
| D5 MTD(f) + witness | 19.529 ms | 14,835 | 24,662 | 1,926,624 B |
| D6 threshold + witness | 19.573 ms | 14,890 | 24,772 | 1,926,624 B |

### Interpretation

The precompiled-DAG campaign had made PVS and MTD(f) look marginally stronger in proof work. That advantage does not survive the native quotient cost model:

- PVS issued 9,827 scout searches and required one re-search, yet expanded slightly more states than the full-window control.
- MTD(f) required two null-window passes and also expanded slightly more states.
- threshold search required two passes on this draw and expanded 105 more states.
- witness-composed variants reduced expansions by 164–246 states, but the extra witness lookup/storage cost and 81,920 additional typed bytes outweighed the saved work.

Therefore the simplest exact driver is also the fastest current 4x5 native driver.

## Smaller controls

The smaller controls do not establish one universal driver:

- 4x4 c4 favored threshold at ~4.321 ms, with MTD(f) effectively tied at ~4.341 ms.
- 5x3 c4 favored threshold at ~0.668 ms versus ~0.685 ms full-window.
- 4x3 is too small for timing differences to be authoritative; the nominal winner recorded no actual witness activity.

These results show that threshold/null-window control can be useful in small geometries, but the current forward-solver objective is not to optimize each toy geometry independently. The largest complete control remains the strongest bounded proxy for the production kernel until 7x6 evidence exists.

## Disposition

Advance the current native forward baseline as:

```text
quotient-native qID
+ rank-derived side-to-move
+ two-u32 residual substrate
+ dense exact residual-class transitions
+ quotient-native tactical closure
+ W/D/L-native fail-soft full-window negamax
+ exact lower/upper W/D/L bounds by qID
+ no full state-edge cache
+ no best-child witness
+ no forcing ETC
```

Keep PVS, MTD(f), threshold and selective witnesses as conditional evidence, not current defaults. Reopen them only if a materially different scale, TT layout, move-ordering mechanism, BSFP boundary, or hardware execution model changes their economics.

## Next gate

The quotient-native representation and driver are now stable enough for the comparison that has been intentionally deferred:

1. build a fair physical/incumbent exact-search control over the same W/D/L contract and tactical/oracle semantics;
2. use equal-byte or explicitly normalized memory controls;
3. include quotient transition/interner costs in the relational side;
4. compare nodes, transition work, memory and wall-clock time;
5. do not claim a quotient speedup until that comparison passes.

After that, standard 7x6 scale and packed/fixed-width memory economics become the next promotion questions.
