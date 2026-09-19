# Checkpoint — independent Node rank-33 lattice probe

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Recovered predecessor checkpoint:** `2d9cf2bff8d9346452c006e74031c5d97adfe191`
**Status:** rank-33 49,682-antichain target closed; rank 32 is next
**Authority effect:** none
**Research direction:** Josh Oshiro

## Recovery

The disconnect occurred after the rank-33 lattice checkpoint had been written but before the planned independent Node implementation produced a result.

No other live branch contained newer research. The work was resumed from the exact executable seam recorded in `RANK33_LATTICE_BOUNDARY_CHECKPOINT.md`.

## Independent implementation validation

A separate Node implementation of the support-local residual-antichain lattice recurrence was built from the persisted mathematical checkpoint.

Before using it on the larger target, it was run on the already-persisted 12,929-antichain case:

```text
support
    [5,5,1,4,6,6,6]

residual shapes
    21

antichains/player
    12,929
```

It reproduced the checkpoint exactly:

```text
root Upper widths
    1,8,17,71,146,145,82,23,5,4

root Lower widths
    8,13,36,114,250,101,39,6,1,1

max fixed-action Upper candidates
    536

max fixed-action Lower candidates
    513

max Lower-intersection candidates
    41,307

max stored Upper
    359

max stored Lower
    372

mismatches against persisted checkpoint
    0
```

This makes the resumed implementation independent of the interrupted exploratory runtime.

## Large rank-33 target

Target:

```text
[5,5,2,3,6,6,6]
```

Domain:

```text
rank                         33
future cells                  9
residual shapes              24
antichains/player         49,682

explicit P0/P1 pair domain if enumerated
    49,682^2
    = 2,468,301,124
```

The pair domain was not materialized.

The complete rank-33..42 support cone contains 80 supports.

## Result

The generator-only lattice recurrence closed the entire cone.

Root Upper boundary widths:

```text
loss2       1
loss4       8
loss6      35
loss8     226
draw9    1116
win9     1251
win7      447
win5       69
win3        9
win1        4
```

Root Lower boundary widths:

```text
loss2       8
loss4      30
loss6     228
loss8     660
draw9    2534
win9      714
win7      119
win5       15
win3        1
win1        1
```

Construction envelope:

```text
max antichains/player                     49,682
max residual shapes                           24
max fixed-action Upper candidates          1,600
max fixed-action Lower candidates            787
max Lower-intersection candidates         530,700
max stored Upper boundary                  1,251
max stored Lower boundary                  2,534
```

Observed timings on the independent Node runtime:

```text
antichain enumeration     ~0.564 s
cofactor maps             ~0.568 s
boundary propagation      ~9.445 s
total                    ~10.582 s
```

These are prototype/runtime observations, not universal performance claims.

## Current scaling interpretation

The 49,682-antichain coordinate itself is not the current wall.

Neither is the one-cell cofactor-preimage step.

The largest growth is now:

```text
intersection of action Lower downsets
    ->
boundary-pair lattice meet/join candidates
    ->
maximal normalization
```

At this target that intermediate reached 530,700 candidates but collapsed to at most 2,534 stored Lower generators.

Thus the next falsifier should focus on lower/downset intersection growth, not on reconstructing legal q, pair states, ownership masks, or distributed proof alternatives.

## What is not established

- empty 7x6 root is not solved;
- root-scale economics are unknown;
- no claim that boundary widths remain small to rank 0;
- no new IsoGraph relation is promoted;
- C4-R0076 is not yet changed to proved/closed authority;
- proof/certificate realizability requirements are not erased by this ordinary-value result.

## Next executable seam

```text
derive_rank32_lattice_boundary_probe
```

Choose a rank-32 predecessor of `[5,5,2,3,6,6,6]` that maximizes structurally relevant pressure.

Measure separately:

1. residual-shape count;
2. antichains/player;
3. fixed-action Upper candidate width;
4. fixed-action Lower candidate width;
5. Lower-intersection candidate width;
6. stored Upper/Lower widths;
7. phase timing.

Do not enumerate the P0/P1 residual pair domain.

If rank 32 fails, identify whether the first true wall is:

- single-coordinate antichain enumeration;
- cofactor-preimage extremization;
- Lower-boundary pair product;
- boundary normalization;
- stored boundary width.

Do not increase memory/time until that first divergence is localized.

## Reconnect marker

Current durable raw result:

`RANK33_NODE_LATTICE_RESULTS.json`

Current branch head after raw result publication:

`f66a0ab5110cad9293afc9783088daf0a441a27f`

Next command conceptually:

```text
rank32_lattice_pressure_probe
```
