# Exact-solver TT chunk reclamation concept

**Date:** 2026-09-08  
**Status:** research/design note; conceptually mature direction, not an accepted specification

## Context

The exact 7x6 Node oracle in `components/oracle/exact7x6.mjs` uses a canonical compact board encoding and a transposition table. The current implementation stores TT entries in a JavaScript `Map` keyed by `Number(current + mask)`.

This note records the proposed direction for making the exact solver's TT reclaimable without adding cleanup policy or bookkeeping to the negamax hot loop.

The design discussion intentionally does **not** address move ordering yet. The immediate concern is TT lifetime/capacity and allowing the exact search to retain useful transpositions without monotonically retaining every discovered state.

## Core direction

### 1. Keep cleanup out of the search hot loop

The search path should not acquire cleanup-specific work such as:

- ages or generations;
- hit counters;
- work/value scores;
- LRU maintenance;
- cleanup flags;
- path identifiers;
- reference counts;
- per-node reachability bookkeeping;
- explicit yielding so a same-thread cleaner can run.

The cleaner is asynchronous relative to search and executes outside the synchronous negamax loop.

Its execution does not require a dedicated CPU lane. It may run opportunistically on a worker/background execution context or future shared worker pool. Search performance remains the priority; cleanup may make progress when scheduling capacity exists.

### 2. Reclaim by releasing chunks, not deleting individual TT entries

The desired reclamation unit is an independently releasable TT chunk/slab.

Rather than scanning arbitrary entries and deleting individual keys, the cleaner should be able to prove that a whole chunk can no longer contain a useful reachable state and release that chunk's backing storage as one lifecycle operation.

This avoids making reclamation depend on large numbers of hash-table mutations, tombstones, entry-by-entry deletes, or allocator operations.

### 3. Make chunk topology follow board-state dependency topology

TT chunks should group positions that share the same irreversible Connect Four board-state facts.

A chunk is **not** owned by the procedural search branch that first discovered its entries. It represents an intrinsic family of canonical states sharing a board-state projection/core.

Conceptually:

```text
canonical board state
        |
        +-- canonical TT key
        |
        +-- canonical chunk selector
                  |
                  +-- TT positions sharing irreversible state facts
```

This makes the unit of logical invalidity align with the unit of memory reclamation.

### 4. Derive chunk identity from algebra already native to the TT state

The current exact solver already carries the compact bitboard state and derives its TT key from:

```js
Number(current + mask)
```

The chunk selector should, if practical, be a cheap projection of the same canonical board encoding / existing bitboard algebra rather than a separately maintained cleanup representation.

The intended shape is approximately:

```text
canonical state/key
    -> chunk selector from existing state bits/algebra
    -> within-chunk TT lookup
```

The cleaner can then reason from chunk signatures using bitwise compatibility tests. Expensive object reconstruction, per-entry metadata, or a new search-side cleanup key should be avoided.

### 5. Use only proof-of-impossibility cleanup

Connect Four is monotonic: stones are added; occupied cells do not move, change owner, or become empty.

Cleanup should exploit that property conservatively. A chunk may be released only when its defining board-state facts are incompatible with **every** search region that can still reach a state in that chunk.

Typical contradictions are simple ownership/occupancy contradictions expressible with masks. The cleanup policy is not probabilistic and does not estimate usefulness.

If compatibility remains possible, retain the chunk.

### 6. Multiple paths to the same position are resolved by canonical state ownership

Connect Four's search space is a DAG because different move orders can transpose into the same board.

Therefore procedural ancestry cannot own TT lifetime. Releasing a chunk because one DFS branch finished would be unsound if another live path can reach the same state.

The proposed rule is:

> Same canonical position -> same canonical key -> same canonical chunk, regardless of which path discovered it.

A chunk is releasable only when its state family is incompatible with the **union of all still-live search regions**.

This preserves transposition sharing and avoids:

- duplicated entries by path;
- path IDs;
- parent lists;
- reference counting of search ancestry;
- assigning one procedural branch as the owner of a transposed state.

The state owns its location; no search path owns the transposition.

### 7. Batch compatibility and batch reclamation

The cleaner may test a chunk signature against multiple live regions in one pass. Because the live-region set can be small/coarse, one chunk-level decision may reclaim a large family of dependent positions.

The useful asymmetry is:

```text
small amount of cleaner work
    -> prove one state family impossible
    -> release a large TT chunk
```

This means cleaner throughput does not need to track TT insertion throughput entry-for-entry.

## Intended cleaner shape

Conceptually:

```text
repeat opportunistically:
    obtain/read a coarse snapshot of still-live search regions
    inspect a bounded set of TT chunk signatures
    for each chunk:
        if incompatible with every live region:
            release chunk backing storage
    yield / return worker capacity
```

The cleaner should be allowed to run behind the search. It is maintenance work, not latency-critical search work.

## Important distinction: asynchronous does not mean same-thread Promise cleanup

The exact solver's negamax recursion is synchronous and CPU-bound. A Promise/timer on the same Node event-loop thread would not run concurrently unless search deliberately yielded, which would contaminate the hot path.

Therefore the cleanup execution context must be genuinely separate from the synchronous search thread if cleanup is to make progress during search. This does **not** imply a dedicated or pinned CPU core.

## Desired concurrency property

Search should never wait for cleanup policy.

Any future shared-storage implementation must make chunk lifetime/publication safe so the search cannot use released storage incorrectly. That synchronization/lifetime protocol remains an implementation question and should be solved at the TT/chunk ownership boundary, not by spreading cleanup bookkeeping through negamax.

A cleanup race may at worst turn a potentially reusable transposition into recomputation; it must never manufacture a false hit for a different position or permit use-after-release.

## Explicit non-goals

This direction does not presently propose:

- LRU;
- age/generation scoring;
- work-weighted retention;
- heuristic eviction based on expected future value;
- move-order changes;
- search-side cleanup instrumentation;
- path-owned TT entries;
- per-entry reachability/reference counting;
- a dedicated cleaner CPU lane;
- a fixed chunk geometry before measurement.

## Open design questions

The concept is mature; these details remain deliberately unresolved:

1. **Chunk projection:** which subset/projection of the existing canonical board encoding best groups states that become invalid together while retaining cheap addressing?
2. **Granularity:** how large should chunks be so release has useful leverage without excessive allocation/metadata fragmentation?
3. **Live-region representation:** what is the coarsest correct representation the cleaner can observe without adding work to the negamax hot loop?
4. **Storage substrate:** whether the eventual implementation is shared typed storage, segmented storage, or another Node-native representation that supports independently releasable chunks and canonical lookup.
5. **Safe release protocol:** how search and cleaner establish chunk lifetime without turning cleanup synchronization into hot-path cost.
6. **Empirical reclamation:** how much of the exact solve's retained state becomes provably impossible soon enough for chunk release to materially reduce peak TT footprint.
7. **Search-work consequence:** how much recomputation, if any, results from conservative chunk release; correctness must remain exact even if node count changes.

## Working principle

The compact summary of the proposed design is:

> **Canonical state-based chunking + proof-of-impossibility asynchronous chunk release.**
>
> Group dependent/transposed branches by irreversible board-state facts, not procedural ancestry. Keep the negamax hot loop free of cleanup policy. Let an opportunistic background cleaner use the bitwise algebra already native to the TT state to release whole chunks only when no live search region can reach them.
