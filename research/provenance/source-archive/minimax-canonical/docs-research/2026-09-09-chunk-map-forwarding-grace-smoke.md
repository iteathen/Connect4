# Chunk-map forwarding and coarse grace-period smoke test

**Date:** 2026-09-09  
**Status:** positive research evidence; not maintained solver authority

## Purpose

Exercise the forwarding lifecycle that was under-specified in the earlier cleanup note:

```text
logical dependency ID
    -> chunkMap[logical ID]
    -> physical descriptor
```

The test intentionally creates two duplicate physical descriptors for the same logical dependency family, redirects the logical map to a survivor while one worker still holds the loser, and recycles the loser only after coarse holders drain.

No forwarding check occurs inside the running negamax subtree.

## Test position

`4126757563`, exact score `3` in the research solver.

The bottom-row dependency signature used by the smoke test is logical ID `336522`.

Each duplicate descriptor owns an independent 256K-entry physical TT region. This is a functional lifecycle test, not a memory-efficiency benchmark.

## Sequence

1. `chunkMap[336522] = descriptor 1`.
2. Worker A resolves logical ID `336522` to descriptor 1 and pauses at the coarse task boundary.
3. Coordinator marks descriptor 1 `RETIRING` and directly publishes `chunkMap[336522] = descriptor 0`.
4. Worker A resumes without rereading the map and runs the entire subtree against stale descriptor 1.
5. Worker B starts after the redirect, resolves the same logical ID to descriptor 0, and runs concurrently.
6. Both coarse tasks return.
7. Only then is descriptor 1 marked `FREE` and its physical TT region cleared/recycled.
8. A later task resolves descriptor 0 and returns the same exact result.

There is no redirect chain and no payload merge.

## Evidence

Three independent repeats produced the same structural result:

- stale holder descriptor: **1**;
- future holder descriptor: **0**;
- stale-holder nodes: **1,036,919**;
- future-holder nodes: **1,036,919**;
- stale-holder score: **3**;
- future-holder score: **3**;
- post-recycle task descriptor: **0**;
- post-recycle score: **3**;
- descriptor 1 final state: **FREE**.

Representative timings were ~0.21-0.24 s per million-node proof, but timing is not the point of this test.

## What this proves

The intended grace-period model is viable:

> A worker may retain a physical descriptor resolved at a coarse task boundary while the shared chunk map is redirected for future tasks. Correctness does not require the worker to poll the map during negamax, provided the losing descriptor remains valid until all stale coarse holders drain.

This permits cleanup/dedupe to implement direct forwarding as:

```text
chunkMap[B] = survivorDescriptor
loser: LIVE -> RETIRING
wait for coarse holders to drain
loser: RETIRING -> FREE
```

without path IDs, per-node reference counts, redirect chains, or payload migration.

## Next step

Integrate the same lifecycle with conservative dependency cleanup:

- logical dependency tree/lattice supplies incompatibility proofs;
- chunk map performs physical forwarding;
- descriptor table owns slab capacity/lifecycle;
- logical IDs may share a descriptor until measurement justifies dedicated capacity;
- cleanup may remap an impossible/duplicate logical chunk to a compatible survivor or retire its dedicated descriptor after the coarse grace period.

The performance baseline remains the flat global shared TT. New cleanup behavior should be added without reintroducing physical parent splitting or fixed one-slab-per-family ownership.
