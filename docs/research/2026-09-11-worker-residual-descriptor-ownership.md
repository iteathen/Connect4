# Worker residual semantic descriptor ownership seam

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Investigation:** OpenAI ChatGPT  
**Status:** source-localized candidate; **no implementation change admitted until standard-7x6 v5 run `34675467051` closes and measures the next resource owner**

## Finding

The worker-local semantic descriptor cache retains one residual semantic descriptor per observed residual class. Each descriptor currently owns a materialized `Uint16Array` of exact term IDs:

```text
classDescriptor(classId)
  -> kernel.classes.termIds(classId)
  -> new exact term-ID array
  -> createResidualSemanticDescriptor(classId, ids)
  -> retain descriptor in worker-local classCache[classId]
```

State semantic descriptors are already ephemeral. They point at these retained class descriptors.

For the active standard-7x6 slot64 residual kernel, the canonical residual class is **not** stored as that term-ID array. The slot64 pool stores an exact class as a stable class ID plus a tuple of references into slot-local 64-bit chunk dictionaries. `termIds(id)` reconstructs the class into scratch bits, counts active bits, allocates a fresh `Uint16Array`, and enumerates active term IDs into it.

Therefore the semantic descriptor cache duplicates residual payload already represented canonically by the kernel. This is a real ownership boundary, not merely object-wrapper overhead.

The prior `34674060855` high-water telemetry is consistent with this becoming material at large scale: workers retained roughly 9.59-11.11 million residual class descriptors and reported roughly 96.8-114.0 million cached term IDs. That establishes scale but does **not** by itself prove this cache is the next failure owner after the v5 shared proof-store correction.

## Why `slice` -> `subarray` is not an admissible fix

A borrowed typed-array view is only safe if its backing storage remains stable for the full descriptor lifetime.

Several exact residual storage implementations grow by allocating a larger typed array, copying prior contents, and replacing the pool's current backing array. A cached `subarray()` created before such growth would remain attached to the old backing buffer. Even when logical contents stay correct, old large buffers would be pinned by retained descriptors, recreating an unbounded lifetime problem in another form.

The slot64 pool is even clearer: its canonical representation is chunk dictionaries plus class-to-chunk references, not one contiguous term-ID backing array. There is no canonical stable term-ID slice to borrow.

Therefore **do not** replace copied term arrays with borrowed views unless the owning store first supplies a lifetime-stable representation contract.

## Exact boundary that can be changed later

The shared semantic TT does not intrinsically require ownership of a `Uint16Array`. For exact identity it currently needs only:

- residual length for P0 and P1;
- exact indexed term access while hashing/comparing/installing a descriptor.

The current TT loops iterate `p0.ids[index]` / `p1.ids[index]` and store exact IDs into shared slot-owned descriptor chunks. This can be generalized without changing the shared proof identity itself.

A promising ownership-correct shape, **only if the active v5 run confirms this worker cache as the next limiter**, is:

```text
worker residual descriptor
  = classId
  + exact length
  + exact precomputed hash
  + reference to one worker-local term-access authority

term-access authority
  = stable object shared by all class descriptors in that worker
  + termCount(classId)
  + termAt(classId, index)
```

The class descriptor must not allocate a closure or access object per class; millions of per-class functions would merely replace one retained-memory owner with another. A single worker-local accessor can resolve current canonical storage by class ID on demand.

The semantic identity / shared-TT boundary can then use small helpers equivalent to:

```text
residualLength(descriptor)
residualTermAt(descriptor, index)
```

with compatibility for synthetic array-backed descriptors used by bounded qualification.

## Required invariants if admitted

Any implementation must preserve:

- exact `supportIndex + P0 residual sequence + P1 residual sequence` semantic identity;
- exact descriptor equality after hash match;
- same residual term ordering used by current canonical identity;
- generation-safe shared proof handles and replacement behavior;
- non-allocating ordinary proof probes;
- worker task wire format unchanged unless separately justified;
- exact 4x5 root/action WDL controls;
- dependency-aware and idle-ExploreHint composed controls.

No CPC, WSL-625, NDC, move-order, forced-macro, Branch Manager, or Negamax control semantics belong in this ownership change.

## Admission rule

Do not implement from this note alone.

First close and inspect standard-7x6 v5 run `34675467051`. If the shared term arena remains healthy and worker residual-class retention / isolate memory becomes the measured limiting slope, this note identifies the narrow ownership seam to test next. If another resource owns the next failure, follow that evidence instead.
