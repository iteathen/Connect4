# Term-ID Quotient-Native versus Physical Exact W/D/L Control

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34649904580`, job `103429374928`  
**Status:** complete bounded-control evidence; full typed term-ID budget used

## Purpose

Re-run the physical exact W/D/L control after replacing residual masks with the qualified u16 term-ID substrate, and freeze the physical memory budget from the quotient's **full typed term-ID footprint** rather than the older residual-memory lower bound.

## Fairness contract

Both solvers use:

- exact W/D/L fail-soft full-window Negamax;
- the same immediate-win / forced-response / double-threat tactical semantics;
- TT-best then center-first ordering;
- exact identity checks;
- independent BSFP root and per-root-action W/D/L qualification.

The quotient uses:

```text
qID = supportIndex + exact P0 residual class + exact P1 residual class
residual class = sorted u16 term IDs
side to move = support-rank parity
```

The physical control uses:

```text
supportIndex + exact P0 ownership
P1 = support universe - P0
bounded 4-way exact-key TT
```

Physical replacement loses cache information only; it cannot publish a false exact hit.

## Result

| Geometry | quotient | physical | q / physical | q expansions | physical expansions |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x4 c4 | **3.082 ms** | 3.970 ms | **0.776** | 4,250 | 9,403 |
| 5x3 c4 | **1.369 ms** | 1.886 ms | **0.726** | 852 | 4,315 |
| 4x5 c4 | **10.183 ms** | 13.400 ms | **0.760** | 15,054 | 36,826 |

On the largest complete bounded proxy the quotient is about **24.0% faster** while expanding about **59.1% fewer states**.

## 4x5 memory control

The isolated term-ID quotient root run allocated:

```text
full typed quotient footprint: 2,142,545 B
```

The physical solver received that as its maximum typed budget and selected:

```text
physical typed use:   1,745,668 B
physical TT slots:      131,072
physical TT load:         33.3%
physical replacements:       519
```

The remaining budget was insufficient for the next power-of-two physical TT. The physical table was not saturated; replacement pressure was already modest.

The term-ID result therefore preserves the wall-clock advantage after moving substantially more of the quotient representation into explicitly counted typed storage.

## Conservative aspects

The quotient timing still reconstructs the immutable geometry term vocabulary during every solver setup. Standard 7x6 has a fixed 625-term vocabulary, so a production implementation can compile/cache this metadata once. No such setup cost is subtracted from the reported quotient time.

Small JS control objects are not modeled byte-for-byte on either side, so this remains bounded engineering evidence rather than final standard-7x6 memory qualification.

## Conclusion

The current evidence no longer supports a fallback to physical-board Negamax on performance grounds. The exact quotient has demonstrated both:

1. large proof-work compression; and
2. end-to-end wall-clock wins under increasingly strict physical controls.

The next bottleneck is scaling the residual-class transition/cache representation to standard 7x6 without surrendering the term-ID speed advantage.
