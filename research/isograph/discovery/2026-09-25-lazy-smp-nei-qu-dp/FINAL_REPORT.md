# Lazy SMP IsoGraph / NEI / QU / DP — Final Report

**Date:** 2026-09-25  
**Status:** COMPLETE  
**Authority effect:** none

Lazy SMP has been rendered as a successor operational/search-method graph and DP-01..DP-45 has been run over it.

The solver method did not change. The search method did.

## Established shape

```text
one exact Connect4 value dependency
+ N complete private demand traversals
+ optional exact-fact shared materialization
+ first-exact-finisher termination
```

No Branch Manager or global work partition is required.

## Strongest discoveries

- private exact evaluation is the correctness owner;
- shared exact cache is acceleration only;
- exact fact truth is stable while physical bounded cache materialization is lossy;
- worker roles are equivalent but worker occurrences are NEI-distinct;
- scalar W/D/L equality does not establish move/proof witness identity;
- order policies repeat modulo board width, so policy diversity can saturate before worker count;
- the JSMinSys cache key must not be called q_o/q_r without a separate exact mapping proof;
- current control profiling says solver-kernel cost dominates search coordination cost, so added coordination machinery must prove net savings.

## Open QU

- QU-LSMP-01 — worker diversity economics
- QU-LSMP-02 — shared evidence density and capacity
- QU-LSMP-03 — duplicate-work topology
- QU-LSMP-04 — first-finisher witness distribution
- QU-LSMP-05 — worker-count scaling
- QU-LSMP-06 — lossy cache materialization economics
- QU-LSMP-07 — implementation key to q_o/q_r correspondence

## Leads

1. measure exact-key overlap and publication latency;
2. attribute shared facts by depth/rank/root leverage;
3. quantify order-rotation diversity before adding new worker diversifiers;
4. test cache policy changes only under equal solver correctness/work controls;
5. prove or falsify the implementation-key -> q_o/q_r mapping.

DP-01..DP-45: COMPLETE.
