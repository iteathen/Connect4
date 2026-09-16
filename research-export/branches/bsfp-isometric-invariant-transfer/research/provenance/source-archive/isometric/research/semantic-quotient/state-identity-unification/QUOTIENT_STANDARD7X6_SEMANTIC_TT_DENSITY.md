# Standard 7×6 semantic-TT density sample

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** measured sizing evidence for the online quotient Negamax runtime  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

The exact semantic shared-TT key is the quotient descriptor:

```text
supportIndex
+ exact P0 residual-term sequence
+ exact P1 residual-term sequence
```

The current exact table stores 29 bytes of fixed entry metadata per reserved slot plus 2 bytes per residual term ID in the descriptor arena.

A standard 7×6 slot64 forward expansion through rank 8 reproduced the established checkpoint exactly:

```text
q states through rank 9: 797,388
residual classes:       1,357,101
rank-9 frontier:          538,774
local kernel typed bytes: 118,099,719
```

A deterministic sample of 53,678 q states / 97,469 residual classes measured descriptor density. Mean combined P0+P1 term IDs decline steadily with rank:

```text
rank 0: 138.00
rank 1: 130.86
rank 2: 124.53
rank 3: 118.05
rank 4: 111.80
rank 5: 105.27
rank 6:  99.18
rank 7:  93.08
rank 8:  87.29
rank 9:  81.65
```

Weighted across the 797,388 checkpoint states, the estimate is **84.2598 term IDs per state**. The observed maximum was the exact root maximum of 138 term IDs; no sampled state exceeded that hard bound.

At 65% target table load, representing all 797,388 checkpoint q states would select 2,097,152 entry slots. Using the observed descriptor density:

```text
entry metadata:       60,817,416 bytes
estimated term IDs:   67,187,769
term storage:        134,375,538 bytes
estimated TT total:  195,192,954 bytes  (~186.2 MiB)
```

Capacity models at the observed mean density are approximately:

```text
1,048,576 slots  -> 145 MB at 65% target load
2,097,152 slots  -> 291 MB at 65% target load
4,194,304 slots  -> 581 MB at 65% target load
8,388,608 slots  -> 1.162 GB at 65% target load
```

The rank-8 checkpoint itself needs less than the generic 65%-load model because it has only 797,388 live entries; the larger models are capacity planning for deeper search.

## Interpretation

The descriptor payload is significant but not prohibitive on the target research machines, and density improves with depth as winning requirements disappear. The next useful evidence is therefore an actual standard-7×6 online dependency-aware root attempt with a fixed shared arena and explicit memory/progress reporting, rather than more shallow descriptor extrapolation.

The failed allocation-free `termCount()` census was superseded by this sampling method and is not part of the active design.