# Standard 7x6 quotient Negamax presearch profile — result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Solver authority:** `docs/specs/C4-0010-quotient-native-negamax-v1.md`  
**Workflow run:** `34664840273`  
**Job:** `103474560719`

## Purpose

Measure the actual standard-7x6 shallow quotient work shape before choosing worker count and split depth.

This is a presearch/profile, not an empty-root solve.

## Exact shallow growth

```text
depth   layer q states   cumulative q states
0                 1                  1
1                 7                  8
2                49                 57
3               238                295
4             1,120              1,415
5             4,263              5,678
6            15,239             20,917
```

The exact shallow build through depth 6 took about `326 ms` on the hosted runner and occupied about `7.25 MB` of typed storage before the later cost probe.

## Transposition growth

Transposition collapse becomes visible immediately after depth 2 and grows quickly:

```text
from depth   nonterminal edges   next unique q   duplicate edges
2                      343             238              105
3                    1,666           1,120              546
4                    7,840           4,263            3,577
5                   27,168          15,239           11,929
```

At depth 4, 2,807 next-layer q states had multiple incoming shallow paths. At depth 5 that rose to 9,734.

This strongly supports deduplicated quotient planning rather than move-sequence task identity.

## Tactical closure

No exact tactical closures or forced responses occurred through depth 4 from the empty root.

At depth 5:

```text
45 forced-loss states
393 forced-response states
```

At depth 6:

```text
69 forced-loss states
964 forced-response states
```

So tactical closure begins to matter after the likely 3-4-ply split region rather than determining the initial split itself.

## Frontier width

Candidate unresolved q states:

```text
depth 2:    49
depth 3:   238
depth 4: 1,120
depth 5: 4,218 after tactical closure
depth 6: 15,170 after tactical closure
```

Even depth 3 provides substantial coarse work relative to a small/medium CPU worker pool. Depth 4 provides very large scheduling slack.

## Bounded cost-shape probe

A two-ply structural work estimate was applied after the exact layers were fixed.

Depths 1-3 were completely uniform under this shallow estimate. Depth 4 remained low-skew:

```text
depth 4 estimated cost:
  min   31
  p50   57
  p90   57
  p95   57
  max   57
  CV    0.120
```

Longest-processing-time simulation at depth 4 was essentially perfectly balanced for 2-8 workers; for four workers estimated scheduling efficiency was `0.99986`.

Depths 5-6 had more cost variation because tactical/forced-response structure had started to appear, but the large frontier still made idealized balancing essentially perfect.

## Important profiling-cost result

The exhaustive two-ply cost probe was itself too expensive to use as ordinary initialization:

```text
exact shallow build through depth 6: ~0.326 s
exhaustive cost probing:             ~4.064 s
```

The probe also expanded retained local state materially:

```text
before probe:
  20,917 q states
  27,766 residual classes
  ~7.25 MB typed

after exhaustive probe:
  226,246 q states
  312,060 residual classes
  ~33.47 MB typed
```

The work is not semantically wasted because those quotient states/classes can be retained, but the probe cost is disproportionate to the information gained for initial worker/depth selection.

## Disposition

Use **cheap structural presearch** as the normal first profile:

- quotient frontier width;
- transposition/fan-in rate;
- tactical/forced-response closure;
- actual available search capacity;
- optionally a small sampled work probe when structural evidence is ambiguous.

Do not exhaustively probe every frontier task merely to initialize scheduling.

Current standard-7x6 evidence supports depth 3 and depth 4 as the meaningful initial split candidates:

- depth 3 is already wide (`238` q states) and cheap to construct;
- depth 4 is much wider (`1,120`) and already benefits substantially from quotient transposition collapse;
- the bounded online dependency-aware campaign also favored depth 3 on the small hosted runner.

No fixed depth is promoted. Actual search-capacity and early exact-search behavior remain part of selection.
