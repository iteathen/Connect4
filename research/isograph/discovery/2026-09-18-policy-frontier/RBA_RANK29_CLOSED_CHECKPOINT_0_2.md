# RBA rank-29 exact closure checkpoint 0.2

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Base live head before this checkpoint:** `3353ff413e18ff755b31335195d98c2611ea9a3c`  
**Status:** rank-29 ordinary exact-value boundary CLOSED  
**Authority effect:** none; frozen Connect4 logic authority 1.1 is unchanged  
**Research direction:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Result

Target support:

```text
[3,5,2,1,6,6,6]
rank               29
remaining cells    13
residual shapes    33
transformed bits   66
```

The previously open `draw13` Lower product is closed exactly, and the complete rank-29 strong-value boundary sequence is now known.

### Complete rank-29 boundaries

| score | Upper | Lower |
|---|---:|---:|
| loss2 | 1 | 4 |
| loss4 | 6 | 16 |
| loss6 | 26 | 160 |
| loss8 | 223 | 2,114 |
| loss10 | 2,262 | 16,787 |
| loss12 | 18,399 | 44,864 |
| draw13 | 47,472 | **140,454** |
| win13 | 66,024 | 68,522 |
| win11 | 30,923 | 11,917 |
| win9 | 9,120 | 779 |
| win7 | 537 | 84 |
| win5 | 44 | 8 |
| win3 | 7 | 1 |
| win1 | 3 | 1 |

The loss prefix and `Upper(draw13)=47,472` were persisted before this continuation. The new exact results are `Lower(draw13)=140,454` and the seven win-threshold suffix pairs.

## Draw13 operand recovery and qualification

The prior checkpoint persisted operand cardinalities but not the exact generator streams. To avoid rebuilding every strong-value descendant, recovery regenerated only the draw-threshold slice through the future support cone.

The reconstructed adjoint/minimal-cover recurrence reproduced these persisted controls exactly:

```text
rank33 [5,5,2,3,6,6,6]     Upper(draw9)  = 1,116
                               Lower(draw9)  = 2,534

rank32 [4,5,2,3,6,6,6]     Upper(draw10) = 9,348
                               Lower(draw10) = 6,422

rank30 [4,5,2,1,6,6,6]     Upper(draw12) = 37,906
                               Lower(draw12) = 12,818

rank30 [3,5,2,2,6,6,6]     Upper(draw12) = 84,371
                               Lower(draw12) = 55,385
```

The recovered rank-29 fixed-action Lower frontiers then matched the prior checkpoint exactly:

```text
column 0   30,430
column 1   31,397
column 2    8,821
column 3   41,133
```

The first two universal products independently reproduced:

```text
30,430 x 31,397 -> 92,989 exact generators
92,989 x 8,821  -> 131,121 exact generators
```

## Arithmetic correction

The previously stated final raw Cartesian opportunity count contained an arithmetic error.

Exact multiplication is:

```text
131,121 x 41,133 = 5,393,400,093
```

not `5,393,996,493`.

The operand cardinalities and semantic seam were correct; only the multiplication result was wrong.

## Final draw13 semiring product

Orientation:

```text
outer = 41,133
inner = 131,121
workers = 5
```

Exact output-sensitive pipeline:

```text
raw implicit pair opportunities    5,393,400,093
local-skyline candidates               4,393,899
distinct candidates                     3,195,849
after same-mover absorption             1,563,781
after same-opponent absorption            683,923
exact global maximal generators           140,454
```

Local skyline width distribution:

```text
median       36
p90         280
p99         896
maximum  11,379
mean      106.8217489606885
```

The prior ~6.8M local-candidate estimate was conservative. The exact count is 4,393,899.

### Pathological outer generators

The widest observed local projections were concentrated near the high-popcount end of the selected outer family:

```text
outer index 0      width 11,379   q 3f7bfbff7fffffffe
outer index 1      width 10,867   q 1cfffffbffffffffe
outer index 2      width  8,697   q 3ffffedffffffffd8
outer index 5      width  8,697   q 37efff9ffffffffd8
outer index 768    width  6,405   q 376ffbbffffe7eb90
```

The first 10,000 outers generated 2,099,474 local candidates (47.78% of the total); the first 20,000 generated 71.64% of the total. Raw pair count alone therefore remains a poor cost predictor. Projection/local-skyline width distribution is materially more informative.

## Timings and memory

The exact local stage was checkpointed in bounded structural shards after a long monolithic run hit the execution envelope. Summed measured shard wall time:

```text
local skyline generation    51,254.499 ms
```

Global normalization:

```text
deduplicate                    307.038 ms
same-mover absorption          409.695 ms
same-opponent absorption       222.140 ms
global maximal antichain     4,970.164 ms
---------------------------------------
global normalization         5,909.037 ms
```

Peak observed RSS:

```text
local generation shards    74,332 KiB
normalization              94,848 KiB
```

The principal remaining normalization cost is the final cross-coordinate maximal-antichain pass, not deduplication or same-coordinate absorption.

## Exact stream hashes

Serialization for these hashes is one lowercase hexadecimal transformed q-mask per line, no `0x` prefix, newline terminated.

```text
action Lower c0  30,430
sha256 c218ad863d4f65731c19c9a636be57fa9601ec3b870af0f442a61bf1824cc108

action Lower c1  31,397
sha256 33e0604fd55e8643f0e036026f29c10de2baab81173dd0e1541d0f19c599bf9d

action Lower c2   8,821
sha256 34423f6e476d4676fce94b43db5ef4a582ddfc1cf62781ff73988a8c04541244

action Lower c3  41,133
sha256 7cbe2dfece5ba683a2a446e5a9022695a3b3cb5d0ab1226232bf93d36bc629d5

after c0*c1      92,989
sha256 28048c8ceaa7cace43bd316cacaa0261d8a208a1c783492d5ede8c3c3b1038a4

after *c2       131,121
sha256 985dc1026f68246fe41872460903a1e0b471c91a7f5abafb98d1c51d38cacdc6

final draw13    140,454
sha256 33fa501eb8ff6a7501079d131452d8f2807302ad74ce104b3ecea10a6e1349bc
```

These hashes repair identity/provenance for the regenerated operand/result streams. Future durable execution should also preserve the compact payloads or a qualified deterministic generator so cardinalities are not the only surviving state.

## Internal qualification

The final 140,454-generator draw frontier was re-normalized from itself:

```text
input generators          140,454
duplicates                      0
renormalized generators   140,454
same generator set             YES
```

Every newly computed win-threshold slice also reproduced the already-persisted rank-30 boundary counts at its score-reversed child seam, including both difficult rank-30 controls where applicable. This cross-check covers each new suffix threshold from `win13` through `win3`; `win1` is the exact immediate-terminal maximum boundary.

## Structural conclusion

The 5.393B implicit product is not a semantic or representation-width failure.

Measured cost is governed primarily by:

1. orientation-sensitive local projection/skyline width;
2. concentration of wide outer generators;
3. final cross-coordinate maximal-antichain normalization after large same-coordinate reductions.

The exact product remains output-sensitive: 5.393B implicit pairs collapse to 4.394M local candidates and then 140,454 global generators without Cartesian materialization.

This materially strengthens RBA-REL-04 and the evidence behind C4-R0083/C4-R0084, but it does not establish a root-scale frontier-width law or compact root normal form.

## Next

Reassess the four legal rank-28 predecessor supports structurally before choosing one. Use residual-shape count and the measured rank-29 frontier economics to select one informative predecessor. Do not descend repeatedly without re-measuring the frontier-growth law.

The proof/value bridge C4-R0043 / C4-R0069 / C4-R0076 remains a separate open side seam.
