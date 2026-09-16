# Shared dependency TT: failed prototypes, evidence, and corrected architecture

**Date:** 2026-09-09  
**Status:** research/evidence addendum; not maintained solver authority

## Purpose

This note preserves the unsuccessful attempts made while combining the successful global shared-TT experiment with dependency-based chunk cleanup. The failures are retained as evidence so later work does not rediscover the same mistakes.

The maintained solver remains authoritative. These prototypes are dirty research only.

## Baseline that must not be lost

Before dependency chunking was reintroduced, one flat global shared TT was materially better than equal-total-capacity worker-local TTs on real exact positions.

Representative 4-worker results already preserved in `2026-09-08-shared-tt-smaller-real-tests.md`:

- `663152175`, 256K total entries: local 4x64K ~1.868M nodes / 177.65 ms; global shared 256K ~1.139M / 105.67 ms.
- `41267575`, 512K total entries: local 4x128K ~16.77M / 1.469 s; global shared 512K ~10.94M / 1.149 s.

Any dependency architecture that loses most of this global reuse/locality advantage is moving backward unless it buys a larger lifecycle benefit elsewhere.

## Failed attempt 1: one physical 32K chunk per dependency family

### Idea

Map each bottom-row dependency signature directly to one 32K physical chunk.

### Evidence

On `663152175` with a 256K arena (8 x 32K chunks), the run reported:

- exact score: `-4`;
- dependency transitions: `0`;
- dependency allocations: `1`;
- nodes: `1,776,979`;
- wall: `195.57 ms`.

This position remained in one bottom-row dependency family, so only one 32K chunk was useful while the other seven chunks were stranded. The flat shared 256K baseline used the same total capacity and was ~1.139M nodes / 105.67 ms.

### Mistake

Logical dependency identity was incorrectly equated with a fixed physical allocation size.

### Solution

A logical chunk/family must not imply exactly one physical slab. Its current physical descriptor may own one or more 32K slabs, with capacity selected dynamically at coarse boundaries.

## Failed attempt 2: flat dependency families independently claim large contiguous regions

### Idea

Allow each dependency family to request a power-of-two multi-slab region directly from the physical arena.

### Evidence: uniform region sizing

On `41267575`, 512K total arena, 8-slab (256K) requested region per family:

- exact score: `3`;
- nodes: `34,482,026`;
- wall: `2.649 s`;
- allocations: `2`;
- dependency transitions: `234,127`;
- `noRegion`: `170,396`;
- allocator spins: `19,159`.

The position can create root plus two bottom-row ownership refinements. Uniform 256K requests exhaust a 512K arena before all three families can receive a region.

### Evidence: hand-scaled v2 sizing

A follow-up reduced descendant requests. On the same position and same 512K total arena:

- exact score: `3`;
- nodes: `13,438,654`;
- wall: `1.288 s`;
- allocations: `3`;
- `noRegion`: `0`.

That is much better, but still worse than the flat shared 512K baseline (~10.94M / 1.149 s), and the policy is a hand-coded physical-placement heuristic rather than a clean ownership model.

### Mistake

The dependency structure was being used as the physical allocator. Logical identity, capacity policy, and physical placement became entangled.

### Solution

Separate them:

- dependency topology owns logical identity and cleanup proofs;
- a chunk-map table owns logical -> physical placement/forwarding;
- a physical descriptor owns current slab list/span/state;
- the resource selector decides how much capacity a logical family gets.

## Failed attempt 3: nested dependency hierarchy directly carves parent TT regions

### Idea

Make dependency relationships hierarchical and split a parent's current physical TT region in half as child dependency nodes appear.

This correctly noticed that irreversible facts are nested, but assigned the wrong responsibility to the hierarchy.

### Initial evidence: catastrophic metadata path

Before leaf fallback was cached, deeper signatures repeatedly walked hierarchy/allocation metadata after reaching a 32K leaf.

`663152175`:

- exact score: `-4`;
- nodes: `15,951,728`;
- wall: `1.312 s`;
- dependency transitions: `987,663`;
- allocator spins: `673,813`;
- leaf fallbacks: `987,671`.

`41267575`:

- exact score: `3`;
- nodes: `280,543,343`;
- wall: `26.816 s`;
- dependency transitions: `32,751,424`;
- allocator spins: `149,941,277`;
- leaf fallbacks: `32,750,800`.

The search remained exact, but hierarchy coordination completely dominated the useful work.

### Alias fix evidence

A logical parent-alias cache removed the pathological repeated hierarchy work:

`663152175`:

- exact score: `-4`;
- nodes: `1,705,367`;
- wall: `250.19 ms`.

`41267575`:

- exact score: `3`;
- nodes: `18,097,273`;
- wall: `1.855 s`.

This restored normal execution but still lost badly to the flat shared-TT baseline. The hierarchy was physically partitioning capacity that was more valuable when shared.

### Mistake

The logical dependency tree was allowed to dictate physical TT subdivision. The alias fix also pointed descendants at physical placement too directly, which is incompatible with later relocation, dedupe forwarding, and safe reclamation.

### Solution

Keep the nested dependency tree/lattice only as logical metadata. All physical placement must go through the chunk map.

## Documentation mistake: forwarding/dedupe lifecycle was under-specified

The earlier reclamation note correctly said that canonical state owns chunk location and that the dependency chunk map is search-global, but it did not record the already-discussed forwarding lifecycle precisely enough. That omission allowed the prototypes above to drift into direct physical aliases and parent splitting.

The forwarding rule is now explicit below.

## Corrected architecture

### 1. Fixed physical arena

One `SharedArrayBuffer` TT arena is allocated at game initialization. It never grows during the game/search. 32K remains the leading physical slab-size candidate, not a specification constant.

### 2. Stable logical dependency IDs

Canonical irreversible board facts define a stable logical dependency identity. Nested dependency relationships may be represented as a tree/lattice for compatibility and cleanup reasoning.

The dependency hierarchy does **not** contain physical TT bases.

### 3. Search-global chunk map is the physical-placement authority

Conceptually:

```text
canonical board state
        -> canonical dependency identity
        -> logical chunk ID
        -> chunkMap[logicalChunkId]
        -> physical descriptor
        -> one or more TT slabs
```

A physical descriptor can include:

- slab base/list/span;
- active capacity;
- lifecycle state (`LIVE`, `RETIRING`, `FREE`);
- coarse write lease/publication ownership where needed;
- generation/epoch or equivalent coarse lifetime token if measurement shows it is necessary.

Workers must not derive physical placement from dependency parents or procedural search paths.

### 4. Resolution is coarse, not per node

A worker resolves the logical chunk ID through the chunk map at a coarse task/dependency transition, then runs the ordinary serial negamax kernel against the resolved physical descriptor.

No chunk-map polling, cleanup checks, allocator checks, or forwarding checks belong in every negamax node.

### 5. Duplicate discovery and forwarding

Concurrent search may temporarily allocate two physical descriptors for equivalent canonical logical dependency families. Cleanup/dedupe may prove them equivalent from canonical dependency header identity.

Then:

```text
chunkMap[A] -> physical 17
chunkMap[B] -> physical 42

prove B equivalent to A

chunkMap[B] -> physical 17
physical 42: LIVE -> RETIRING -> FREE
```

Rules:

- redirect directly to the final physical survivor;
- do not create redirect chains;
- do not require payload merge initially;
- losing unique cache entries is allowed and causes only recomputation;
- future tasks resolve to the survivor;
- a worker already holding the losing physical descriptor may finish its current coarse task;
- recycle the loser only after those coarse holders reach a quiescent/task boundary.

### 6. Nested dependency tree can forward to an ancestor without physical aliasing

If a deep logical dependency node does not yet justify dedicated capacity, its `chunkMap` entry may resolve to the same physical descriptor as a broader compatible ancestor. This is a **logical-map forwarding decision**, not a pointer stored in the dependency tree.

Later, the selector may give that logical node dedicated slabs by changing only its map entry. No parent TT carving or entry migration is required.

### 7. Cleanup uses the same indirection

Proof-of-impossibility cleanup retires a physical descriptor only when its logical dependency family is incompatible with every still-live coarse search region.

The cleaner updates chunk-map entries/descriptor lifecycle outside negamax, then returns the physical slabs to the fixed free pool after the coarse grace period.

False retention and recomputation are acceptable. False hits, stale reuse, and use-after-recycle are not.

### 8. Dynamic resource assignment stays separate

The active slab count assigned to a logical family is a dynamic resource decision informed by workload, remaining depth, previous null-window work, observed locality, and available memory/worker capacity.

The successful flat shared-TT sweep already showed different wall-time knees (~256K for the smaller tested position, ~512K for the larger one). Logical ownership must not hard-code those sizes.

## Next experiment

Build the smallest prototype that exercises the corrected indirection rather than another allocator heuristic:

1. stable logical dependency IDs;
2. shared `chunkMap` from logical ID to descriptor ID;
3. descriptor table mapping descriptor ID to physical slab span/list;
4. multiple logical IDs may intentionally map to the same descriptor;
5. cleaner/dedupe redirects only by changing `chunkMap`;
6. coarse task-boundary lifetime/grace handling;
7. no physical parent splitting;
8. compare against the already-qualified flat shared-TT baseline on `663152175` and `41267575` before attempting the empty board.

The key acceptance question for this research step is not whether hierarchy exists. It is whether the chunk-map indirection preserves the shared-TT node/time advantage while making dependency cleanup and forwarding possible.
