# RBA native semiring rank-30 root checkpoint 0.2

**Date:** 2026-09-18  
**Canonical branch:** `research/semantic-quotient`  
**Status:** post-1.1 research checkpoint; no authority promotion  
**Research direction:** Josh Oshiro

## Result

The previously bounded 32-residual-shape rank-30 case closes when descendant work is separated from root composition.

Target:

```text
support [3,5,2,2,6,6,6]
rank 30
residual shapes 32
transformed state bits 64
```

Four rank-31 children were solved/cached independently, then the parent root was composed directly.

## Exact root boundaries

Ordered levels:

```text
loss2
loss4
loss6
loss8
loss10
loss12
draw12
win11
win9
win7
win5
win3
win1
```

Upper:

```text
1,8,41,364,6460,38320,84371,31636,15367,1665,90,9,4
```

Lower:

```text
7,42,451,9521,31252,66013,55385,24366,3000,164,12,1,1
```

## Why the full-cone run had looked stuck

The expensive root products were large in their raw Cartesian form but still highly compressible.

Representative `loss12` product:

```text
164,890,797 raw pair opportunities
799,601 local-skyline candidates
615,305 distinct candidates
279,509 after same-mover absorption
199,005 after same-opponent absorption
42,990 exact global generators
```

Another `loss12` product:

```text
303,269,252 raw
567,577 local candidates
66,013 exact output
```

Representative `draw12` product:

```text
278,906,040 raw
564,183 local candidates
55,385 exact output
```

The root-only calculation completed in about:

```text
17.7 s
```

with about 1.07 s attributed to principal-cover calculations.

The earlier bounded full-cone failure therefore mixed root composition with repeated descendant construction.

## Exact multiplication structure

Current best large-product path:

```text
A x B raw lattice meet opportunities
    ->
for each outer generator:
    absorb dominated projected intersections immediately
    ->
union local skylines
    ->
deduplicate
    ->
same-mover exact absorption
    ->
same-opponent exact absorption
    ->
global maximal antichain
```

Every stage is semantics-preserving.

The local-skyline identity is exact:

```text
Max({a meet b | a in A, b in B})
 =
Max(
    union over a
        Max({a meet b | b in B})
   )
```

## Algorithm comparisons retained

### Streaming native local skylines

Best current path.

Real rank-33 stress product:

```text
530,700 raw
7,075 local skyline candidates
1,992 output
~4.3 ms
```

### Raw native materialization

Exact but higher memory.

Same product:

```text
~97.6 ms
```

Synthetic 53.28M 60-bit throughput:

```text
~5.4 s
~407 MiB
```

This is throughput evidence only.

### ZDD

Exact, but slower on the real rank-33 product.

### Closed-blocker dual

Exact identity but bounded prototype cost was worse than direct multiplication.

### Generic multi-posting/global-index experiments

Rejected: added overhead on already-solved controls and did not close the 32-shape case.

## Structural consequence

The raw Cartesian size is increasingly a poor predictor of exact RBA cost.

The more relevant quantities are:

```text
local skyline width
local skyline union size
same-coordinate redundancy
final antichain width
```

At rank 30 these remain orders of magnitude below the raw product.

## Current frontier

The current exact progression is now:

```text
rank 35 proof-product wall      BYPASSED
rank 34                         CLOSED
rank 33                         CLOSED
rank 32                         CLOSED
rank 31                         CLOSED
rank 30 / 31 residual shapes    CLOSED
rank 30 / 32 residual shapes    CLOSED
```

The next predecessor rank introduces more than 32 residual shapes in likely cases, so a single 64-bit transformed q-state mask is no longer universally sufficient.

The next task is therefore representation widening, not new semantic algebra:

```text
rank 29
    ->
128-bit / multiword exact transformed state masks
    ->
repeat the same RBA recurrence
```

Stop again if the first real wall becomes frontier width/product economics rather than word width.

## Epistemic guard

The rank-30 result is a new exact recurrence result from the independently reconstructed native engine. It is downstream of exact persisted rank-33/rank-32 controls and the rank-31 closure, but does not yet have a separate second-representation replay.

Authority 1.1 remains unchanged.

## Reconnect marker

Raw result:

`RBA_NATIVE_SEMIRING_ROOT30_RESULTS_0_2.json`

Current next command conceptually:

```text
widen_rba_state_masks_to_128_bits
-> qualify on rank30 64-bit controls
-> probe structurally informative rank29 predecessor
```
