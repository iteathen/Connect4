# IsoMax decentralized worker-allocation campaign — assessment checkpoint 0.1

**Date:** 2026-09-19  
**Research owner:** `research/semantic-quotient`  
**Live research head before write:** `8b271af2f230879e40ca426a3541ec8e599a12e8`  
**Solver realization:** `solver/isometric@eb8928fe6f4c4b3dba6ad3e2d42f186947a6ebf2`  
**Candidate tracker:** #102

## Verified current structure

The handoff hypothesis contained one distinction that current source has already removed:

```text
task -> predetermined worker/core
```

is not the present executor contract.

`createSearchWorkerExecutor()` owns an idle-worker set and dispatches queued authoritative tasks to whichever worker becomes idle. Worker identity is execution machinery, not q identity.

The remaining coupling is:

```text
Branch Manager
  computes globally ready leaves
  submits only while pending.size < workerCount

Executor
  can dispatch queued work to any idle worker
  but often has no reserve queue because manager caps total outstanding tasks
```

Therefore the first exact question is narrower:

> Does manager refresh latency between a worker completion and publication of the next ready leaf create enough idle/straggler cost that a bounded ready reservoir improves real IsoMax economics?

## Semantic / occurrence separation

```text
canonical q_r dependency   semantic/global identity owner
ready leaf                 manager dependency state
task occurrence            distinct execution occurrence
worker assignment          execution-only
worker cache affinity      advisory/locality relation
CPU core                   execution resource
```

No worker-local residual/class ID is portable.

No new NEI SAME/DISTINCT result is required. The current question is admissibility/substitution plus scheduling economics.

## QU refinement

```text
QU-SCHED-01 future ready-work persistence
QU-SCHED-02 redispatch idle interval
QU-SCHED-03 queued-task obsolescence before claim
QU-SCHED-04 warm-worker TT/residual value
QU-SCHED-05 queue/serialization contention
QU-SCHED-06 optimum reserve depth
```

These remain separate; no scalar score is assumed.

## Bounded candidate 102-A

Preserve manager truth, task payload, worker solver, private caches, task quantum and exact retirement.

Change only admission depth:

```text
current:
    max outstanding authoritative tasks = workerCount

candidate:
    max outstanding authoritative tasks = workerCount + readyReserve
```

The existing executor queue becomes the first claimable-ready substrate. A worker completion immediately triggers the executor pump; if reserve work exists, the next task is dispatched in the same event turn.

This is intentionally tested before a SharedArrayBuffer/Atomics deque. If existing same-thread dispatch is already fast enough, worker-side queue ownership adds coordination without removing a measured bottleneck.

## Measurement plan

Instrument baseline and candidate for:

- manager ready-leaf samples and maxima;
- executor idle slots;
- worker completion -> next authoritative dispatch idle interval;
- submit -> dispatch queue wait;
- max queue depth;
- idle-with-ready events;
- exact/split/retire counts;
- zero-node retirement from queued obsolete tasks;
- aggregate nodes and per-worker nodes;
- result-ready and returned wall time;
- worker execution time distribution;
- RSS/heap where available.

First comparison:

```text
1 worker: reserve 0, +1
2 workers: reserve 0, +1, +2
4 workers: reserve 0, +1, +4
```

Use alternating fresh processes for timing.

## Falsifiers

Reject or narrow ready-reservoir decentralization if:

1. redispatch idle time is negligible;
2. ready leaves rarely coexist with idle workers;
3. queued obsolescence creates enough zero-node task transport to erase gains;
4. aggregate recursive work rises materially;
5. wall time fails to improve on real completed-root workloads;
6. the effect appears only in synthetic queue tests.

If 102-A succeeds, then test soft affinity as a preference over the eligible reservoir (#91). Do not wait materially for affinity.

If 102-A fails because same-thread executor dispatch itself is not the bottleneck, do not build a worker-side Atomics queue absent new evidence.
