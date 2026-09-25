# Lazy SMP DTS 0.1 — Route Replacement Matrix Result 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE first displacement census  
**Authority effect:** none  
**Solver-method effect:** none

## Exact anchors

- IsoGraph integrated stack: `iteathen/IsoGraph@419f3d13ab5480d72fcd78f51502e5928bf5280f`
- JSMinSys production baseline: `04d37498607ace16dae33c79462ddfe1503c8a0d`
- JSMinSys measurement head: `0bb979c61c012290fdbd4d69dd845f4896f70877`
- JSMinSys Verify: `36202180202` — PASS
- Connect4 measurement head: `6242c5dafc9ee355a3645ef56f57b4ab5c01a332`
- Connect4 workflow run: `36202225328` — PASS
- workers: exactly 4
- production shared mask: 7
- identity check: complete qualified q_r key equality; hash/slot equality is not identity authority

## Main result

Every observed successful store into an already committed slot was a **different-key collision**.

```text
same-key refreshes: 0
different-key collisions:
    solved control aggregate: 1,046
    hard 13333111:           6,794
    empty:                    1,881
```

Thus the occupied-slot store topology measured here is actual direct-map replacement, not repeated refresh of the same q_r fact.

## Solved-control aggregate

Three exact +1 / witness 3 samples:

```text
incoming collisions by route:
    mover immediate singleton (3): 772
    multiple opponent threats (4): 109
    stacked threat (5):            159
    all-lift (6):                     6
    long-range response (8):          0

displaced collisions by route:
    mover immediate singleton (3): 795
    multiple opponent threats (4):  88
    stacked threat (5):             163
    all-lift (6):                     0
    long-range response (8):          0
```

The rare high-reuse routes were not displaced in these solved samples.

## Hard unresolved probe 13333111

```text
different-key collisions: 6,794

all-lift route 6:
    committed stores: 294
    displaced generations: 82
    incoming 3 -> displaced 6: 54
    incoming 4 -> displaced 6: 14
    incoming 5 -> displaced 6:  9
    incoming 6 -> displaced 6:  5
    consumed hits/store: ~193.7

long-range route 8:
    committed stores: 18
    displaced generations: 8
    incoming 3 -> displaced 8: 1
    incoming 4 -> displaced 8: 6
    incoming 5 -> displaced 8: 1
    consumed hits/store: ~3557.6
```

Route 8 is especially asymmetric: it is extremely reusable, rare to publish, and in this workload it was displaced by lower-reuse routes more often than it displaced other occupied rows.

## Empty-board unresolved probe

```text
different-key collisions: 1,881

all-lift route 6:
    committed stores: 143
    displaced generations: 28
    incoming 3 -> displaced 6: 24
    incoming 4 -> displaced 6:  4
    consumed hits/store: ~258.9

long-range route 8:
    committed stores: 5
    displaced generations: 0
    consumed hits/store: ~25,828
```

Again the all-lift route is disproportionately reusable yet can be displaced by common lower-reuse routes. Long-range rows were stable in this workload.

## DTS interpretation

### R1 — replacement topology is transition-class asymmetric

The direct map does not merely have an abstract collision rate. Incoming and displaced CPC exact transition classes have materially different reuse economics.

A collision:

```text
common lower-reuse incoming route
    -> overwrites
rare higher-reuse committed route
```

is not economically equivalent to the reverse transition even though both rows carry exact q_r scalar facts.

**Discovery disposition:** STRUCTURE_ESTABLISHED.

### R2 — route-aware protection now has a concrete target

The first justified narrow candidate is not general route ranking.

It is:

```text
when an occupied shared slot holds:
    route 8 long-range response
    or route 6 all-lift

and an incoming exact CPC row is a common lower-reuse route:
    3 immediate singleton
    4 multiple opponent threats
    5 stacked threat

prefer retaining the existing high-reuse row
```

The strongest evidence is route 8 on the hard probe and route 6 on hard/empty probes.

### R3 — same-key refresh protection is unnecessary

No same-key refresh was observed. Any mechanism specifically optimizing refresh is unsupported by this census.

### R4 — protection must remain narrow

The solved control showed no route-6/8 displacement. A broad priority system would add hot-store cost where there is nothing to protect.

The next candidate should therefore inspect priority only after:

1. the store already passed the existing mask-7 publication gate;
2. the target shared slot is occupied;
3. writer ownership has been acquired or otherwise race-safe inspection is established.

## Next candidate

Build one isolated A/B candidate:

```text
protect committed routes {6,8}
against incoming routes {3,4,5}
only on occupied-slot replacement
```

Use the smallest encoding possible. Prefer reusing/packing the existing atomic value word over adding a separate shared provenance array if exact semantics remain transparent.

Required gates:

- operation-level cycle ledger updated in the same work;
- JSMinSys Verify green;
- four-worker same-runner B/C/C/B solved control;
- hard `13333111` and empty-board probes;
- exact result/witness/cleanup unchanged;
- reject if CPU/cycles regress materially even if hit count improves.
