# Issue 102 confirmation plan — independent full-grid pass

**Date:** 2026-09-19  
**Research head before write:** `9197cf5d7b3a5c98474cb046a748f2f2351aca6a`  
**Exact solver revision under measurement:** `1dc4411862a4bf6f11e4ed563f25e1fecc0f3b8b`  
**Scheduler qualification run:** `35480738389`  
**Correctness qualification run:** `35480738479`

## Candidate under confirmation

```text
workers = 4
taskNodes = 65,536 (incumbent policy)
readyReserve = 4
```

Control:

```text
workers = 4
taskNodes = 65,536
readyReserve = 0
```

The automatically triggered full grid also repeats serial, 1-worker and 2-worker negative controls.

## Source difference from initial screen

The scheduler semantics and reserve implementation are unchanged.

Revision `1dc44118...` adds cold-boundary observation only:

- worker retained class/TT-entry counts before and after each task;
- worker reset flag;
- manager aggregation of TT hits/stores;
- residual/TT growth;
- task execution-duration histogram;
- manager `required()` scan time.

No recursive-node branch, task quantum, q representation, readiness rule, priority, liveness rule or worker assignment rule changed.

## Benchmark inputs

Same established three completed roots:

- `717657616532237625`
- `466537327657277224`
- `616767454664457417`

Three alternating fresh-process samples per configuration.

Runtime gate remains Node v26.7.0.

## Confirmation falsifier

The 4-worker/full-reserve candidate does **not** survive if the independent pass fails to show a repeated advantage in both:

1. median wall/result-ready time, and
2. aggregate worker nodes,

with exact decisions unchanged.

A utilization-only gain is insufficient.

Also reject/narrow if:
- queued obsolete work rises without net end-to-end benefit;
- memory materially worsens;
- task-duration/cache measurements show the apparent screen win was an unrelated warm-state/reset artifact.

## Expected measurements

- exact decisions;
- wall and result-ready time;
- aggregate nodes;
- ready-leaf multiplicity;
- redispatch idle;
- queue wait/depth;
- zero-node and busy retirements;
- task-duration histogram;
- manager `required()` time;
- transition-cache hits/stores;
- retained TT/classes before tasks;
- local entry/class growth;
- worker resets;
- RSS/worker memory high water.

No worker-side Atomics/work-stealing structure will be implemented unless this lower-complexity candidate survives and leaves a residual mechanism that such a structure would address.
