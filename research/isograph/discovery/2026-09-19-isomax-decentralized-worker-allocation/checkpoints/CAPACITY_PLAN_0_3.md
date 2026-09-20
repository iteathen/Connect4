# Issue 102 capacity-aligned confirmation plan

**Date:** 2026-09-19  
**Research head before write:** `fe25dc0fb2b6671cdd9c7c2ebcabb327416f74fa`  
**Solver/benchmark head:** `d0781d37d084d958ba456418799de54987d6f328`

## Purpose

Determine whether the qualified full-reserve benefit follows logical execution capacity or exists only in the explicit four-worker oversubscription stress case.

The current runner reports `availableParallelism=4`. Current default IsoMax worker selection would choose three workers, leaving one logical slot available for manager/runtime work.

## Frozen variants

Control:

```text
workers = 3
readyReserve = 0
taskNodes = 65,536
```

Candidate:

```text
workers = 3
readyReserve = 3
taskNodes = 65,536
```

No priority or affinity change.

## Inputs

Same three completed roots:

- `717657616532237625`
- `466537327657277224`
- `616767454664457417`

One fresh serial oracle process plus seven alternating fresh-process samples for each 3-worker variant.

## Falsifier

The capacity-aligned full-reserve hypothesis fails if reserve 3 does not produce a repeated end-to-end advantage without increased aggregate recursive work.

A decrease in idle-with-ready events alone is insufficient.

## Measurements

- exact value/root move;
- wall/result-ready time;
- aggregate nodes;
- max RSS;
- submitted / retire / zero-node / busy-retire counts;
- manager `required()` calls/time;
- transition-cache hits/stores;
- retained entry/class starts and local growth;
- worker resets;
- idle-with-ready count;
- redispatch idle and queue wait;
- queue/pending maxima;
- task-duration histogram.

## Decision rule

If 3/full-reserve qualifies, test a bounded capacity-aware reserve policy.

If it fails, do not generalize the 4/full-reserve result; retain it as a four-worker stress-regime candidate and move to the already-authorized soft-affinity experiment (#91) with **hard availability/no waiting**.
