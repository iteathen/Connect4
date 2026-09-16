# Exact One-Sided Residual Exhaustion Bounds

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact and qualified; conditional optimization, not current 4x5 default

## Exact rule

For side-to-move residual classes:

```text
opponent residual class empty -> side to move cannot lose -> lower bound >= 0
own residual class empty      -> side to move cannot win  -> upper bound <= 0
both empty                    -> exact draw
```

These facts follow directly from the exact residual winning-space semantics and require no child construction.

## Campaigns

Combined-bound campaign:
- run `34649100614`
- job `103426816347`

Split-bound campaign:
- run `34649184442`
- job `103427078530`

Every candidate preserved the independent BSFP root and per-root-action W/D/L results.

## Split result

Median total time on the qualified flat quotient-native kernel:

| Geometry | baseline | non-loss only | non-win only | both |
| --- | ---: | ---: | ---: | ---: |
| 4x4 c4 | 3.349 ms | 3.657 ms | **2.872 ms** | 3.413 ms |
| 5x3 c4 | 0.759 ms | 0.556 ms | 0.393 ms | **0.382 ms** |
| 4x5 c4 | **11.970 ms** | 12.067 ms | 12.344 ms | 11.924 ms |

Proof work changed as follows on the main controls:

```text
4x4 non-win:
  expansions 4,250 -> 4,084
  calls      7,014 -> 6,753
  states     4,392 -> 4,325

5x3 both:
  expansions 852 -> 426
  calls      1,592 -> 750
  states     905 -> 522

4x5 both:
  expansions 15,054 -> 14,763
  calls      24,882 -> 24,412
  states     15,728 -> 15,660
```

## Interpretation

The theorem is useful but its search economics are geometry/context dependent.

- The **non-win upper bound** is the useful component on 4x4.
- Both bounds are extremely effective on 5x3.
- On the governing 4x5 proxy, neither individual bound earns its per-state check cost; composing both is essentially wall-clock neutral despite reducing proof work.

Therefore the current 4x5 production-oriented baseline remains **without one-sided exhaustion seeding**. The rule should be retained as an exact optional/conditional mechanism and reconsidered when search driver, state representation, proof ordering, or standard-7x6 scale changes its economics.

This is an example of an exact semantic optimization that should not be promoted merely because it reduces node count.
