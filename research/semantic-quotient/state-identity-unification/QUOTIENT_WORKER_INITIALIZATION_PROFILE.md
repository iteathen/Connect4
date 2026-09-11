# Quotient Negamax Worker Initialization Profile

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** research architecture; bounded concurrency mechanisms qualified, online standard-7x6 integration pending  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

The quotient Negamax worker pool must not infer search parallelism from raw logical CPU count and must not distribute root branches blindly.

The current qualified architecture separates four responsibilities:

```text
hardware calibration
       |
       v
search-worker ceiling
       |
       v
quotient lookahead work DAG
       |
       +-------------------- search workers
       |                         |
       |                         v
       |                  shared exact TT/proofs
       |
       +-------------------- dedup / cleanup owner
                                 |
                                 +-- canonical task/state identity
                                 +-- work-DAG ownership
                                 +-- proof-arena lifecycle
                                 +-- dedup reconciliation
                                 +-- cleanup / reclamation
```

The recursive Negamax hot loop does not own cleanup policy, dedup bookkeeping, work-tree scheduling, or hardware-role selection.

## 1. Hardware-role calibration

Initialization measures available logical CPUs rather than assuming all hardware threads have equal search value.

Where platform affinity probing is available, a deterministic CPU microbenchmark is pinned to each logical CPU and repeated. The measurements are used only to identify a performance/efficiency split when that split is high-confidence.

A topology split is accepted only when:

1. median per-CPU throughput contains a material gap;
2. repeated measurements for every classified CPU are stable;
3. the slowest observed sample in the candidate performance cluster still exceeds the fastest observed sample in the candidate efficiency cluster by a configured safety margin.

If those conditions fail, the implementation reports the candidate pattern for diagnostics but **does not claim P/E topology**.

This is intentional. False P/E classification is worse than falling back to measured concurrency.

The current implementation is:

- `quotient-cpu-probe-worker.mjs`
- `quotient-cpu-role-calibration.mjs`
- `quotient-cpu-role-calibration.test.mjs`

The classifier has permanent controls for:

- homogeneous CPUs: no false E-core cluster;
- stable separated clusters: qualified P/E split;
- noisy bimodal samples: split rejected.

## 2. Search-worker ceiling

Even a valid logical P-core classification does not prove that every fast logical CPU should run a search worker simultaneously. SMT siblings, cache contention, memory bandwidth and the maintenance worker can lower the optimum.

Therefore initialization runs a second concurrent saturation test with:

```text
N search workers + 1 maintenance worker
```

and increases `N` up to the topology-derived ceiling.

`maxSearchWorkers` is the smallest count within a configured tolerance of the observed peak aggregate search throughput.

If P/E topology could not be established confidently, this saturation test becomes the authoritative worker-count mechanism.

This also gives a portable fallback on platforms where per-thread affinity is unavailable.

## 3. Search versus maintenance role

When a stable efficiency cluster is detected, the slow cluster is the preferred home for:

- canonical task/state deduplication;
- work-DAG planning;
- proof-arena lifecycle;
- cleanup / reclamation;
- other asynchronous maintenance.

The performance cluster is reserved for recursive search up to the calibrated search-worker ceiling.

### Current limitation

Standard Node `worker_threads` does not expose a portable CPU-affinity API. The current calibrator can identify preferred logical CPU IDs, but the research Node workers cannot yet be pinned to those IDs directly.

The calibration result therefore explicitly reports:

```text
affinityEnforcedForNodeWorkers = false
```

Actual P-core/E-core placement requires a platform/native affinity provider. Until that provider exists, CPU-role IDs are advisory and concurrent saturation remains the operational authority for worker count.

## 4. Lookahead work DAG

Workers are not handed root columns blindly.

The dedup owner creates a shallow exact quotient work DAG. It:

- performs tactical closure;
- follows forced responses;
- deduplicates canonical qIDs at every shallow layer;
- retains parent dependencies;
- estimates unresolved frontier work;
- prioritizes heavy/high-fan-in frontier states;
- gives workers coarse q-state tasks;
- reduces exact frontier results back through the DAG.

The currently tested split-depth band is:

```text
2, 3, 4, 5
```

Earlier work suggested depth 3-4 could be optimal on larger workloads. The qualified 4x5 bounded proxy instead preferred depth 2 because its graph is shallow and narrow.

Therefore split depth is an initialization-calibrated parameter, not a constant.

## 5. Bounded evidence

### Shared TT versus private worker state

Private worker-local TTs were decisively poor on 4x5: work duplication increased with worker count.

With one shared exact proof arena, two search workers reversed that result:

```text
sequential root split: 6.748 ms, 31,174 expansions
2 shared-TT workers:   3.289 ms, 25,532 expansions
```

Parallel search reduced both elapsed time and aggregate proof work.

### Lookahead tournament

On a runner reporting four available logical execution lanes, the best bounded result was:

```text
3 search workers
lookahead depth 2
median task + reduction: 4.070 ms
```

Four search workers were slightly slower. This is consistent with reserving execution capacity for dedup/cleanup/planning rather than occupying every logical lane with search.

This result is not authority for standard 7x6 depth; it validates the need for initialization calibration.

## 6. Intended initialization sequence

```text
1. enumerate logical CPUs allowed to the process
2. measure per-CPU throughput under affinity where supported
3. accept P/E clusters only when confidence gates pass
4. run concurrent saturation with one maintenance worker present
5. determine maxSearchWorkers
6. start dedup/cleanup owner
7. create shared TT/proof arena
8. run short exact worker-count / lookahead-depth calibration
9. retain the winning profile for the real solve
10. enter the exact solve with workers persistent
```

The hardware microbenchmark provides topology and an upper bound. The actual quotient workload remains the final authority for worker count and split depth.

## 7. Next seam

The bounded worker experiments currently use a complete prebuilt 4x5 canonical qID graph to isolate concurrency semantics.

Standard 7x6 cannot depend on prebuilding the full graph. The next implementation step is therefore an online quotient-task model that preserves the same ownership rules:

- packed quotient identity usable by the shared TT;
- shallow lookahead planning before task dispatch;
- dedup/cleanup ownership outside recursive Negamax;
- no per-node RPC from search workers to the dedup worker;
- coarse task synchronization only;
- fixed-capacity shared TT/chunk lifecycle as already proposed in the exact-solver reclamation design.

The worker architecture is promoted. The online 7x6 representation and native affinity provider remain to be earned experimentally.
