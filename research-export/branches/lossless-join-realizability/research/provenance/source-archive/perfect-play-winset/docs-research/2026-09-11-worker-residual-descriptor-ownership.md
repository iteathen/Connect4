# Worker residual semantic descriptor ownership

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT  
**Status:** measured, corrected, and bounded-qualified; ready for one standard-7x6 measurement

## Measured owner

Standard-7x6 v5 run `34675467051` removed the previous shared proof-term lifetime boundary. At runner shutdown the v5 shared term arena was still only:

```text
291,948,495 / 460,000,000 words
```

while process RSS had reached `15,751,729,152` bytes.

The last complete worker snapshots showed roughly:

```text
worker 0: 10.19M residual classes, 103.37M cached term IDs, 3.84 GB V8 heap
worker 1: 11.27M residual classes, 116.17M cached term IDs, 4.22 GB V8 heap
worker 2: 10.94M residual classes, 111.37M cached term IDs, 4.09 GB V8 heap
```

The then-current worker semantic cache retained one JS residual-descriptor object plus one separately allocated `Uint16Array` of exact term IDs for every observed residual class. State descriptors were already ephemeral.

The canonical slot64 residual kernel did not need that representation: each residual class already existed canonically by stable class ID plus compact slot/chunk references. Its `termIds(classId)` reconstructed a new array only for semantic descriptor materialization. Therefore the worker cache was retaining millions of duplicated object/array owners over already-canonical residual classes.

This moved the measured resource boundary from shared proof storage back to worker-local host memory.

## Rejected shortcut

Changing `slice()` to `subarray()` is not sound ownership repair. Several residual stores grow by replacing typed-array backing storage, so retained views could pin historical large buffers. The active slot64 class representation also has no canonical contiguous term-ID slice to borrow.

The correction therefore keeps exact term ownership explicit instead of borrowing unstable backing arrays.

## Implemented ownership correction

The worker semantic cache now stores residual semantic metadata in flat typed structures:

```text
per class:
  start       Uint32
  length      Uint16
  hashLo      Uint32
  hashHi      Uint32

all class terms:
  one growable worker-local Uint16 arena
```

On first observation of a residual class, the kernel's exact term IDs are materialized once, copied into the flat arena, hashed, and the temporary array is released. Thereafter the class is represented by typed metadata plus its class ID.

The cache no longer retains:

- per-class semantic descriptor JS objects;
- per-class `Uint16Array` objects;
- per-class backing stores.

State descriptors remain ephemeral class-reference descriptors. One stable worker-local term-source authority provides exact term enumeration from current flat storage.

The shared semantic TT now accepts both:

- legacy array-backed synthetic descriptors used by adversarial controls; and
- worker class-reference descriptors.

It keeps one reusable scratch term buffer per TT view and materializes exact terms only when a 64-bit hash already matches or when installing a descriptor. Hash-mismatching lanes in the 8-way bucket scan do not reconstruct terms.

Exact proof identity remains:

```text
supportIndex + exact ordered P0 residual terms + exact ordered P1 residual terms
```

No CPC, WSL-625, NDC, move-order, forced-macro, Branch Manager, task-wire, or Negamax control semantics changed.

## Qualification

The coherent implementation head `33413500c2ff68f5e4c1c12e3ec430c86fc7e91f` passed the governing bounded campaigns:

- proof replacement: `34676281224` — success;
- dependency-aware proof: `34676281219` — success;
- idle ExploreHint: `34676281229` — success.

The executor telemetry commit `cec2e3e2e93649ed86034c93038484d594a02921` also passed:

- dependency-aware proof: `34676359852` — success;
- idle ExploreHint: `34676359849` — success.

The targeted ownership assertion at commit `7e4f88aba8f4d56ab598c284a8bd99cbac7623cd`, run `34676380760`, passed with exact constrained-game root/actions:

```text
root:    0
values:  [0, 0, 0, 0]
```

It additionally exercised generation-safe stale handles and v5 slot-owned chunk growth.

Active worker resource assertions were satisfied:

```text
worker 0:
  class builds:                  14,429
  exact term IDs cached:         66,465
  retained class objects:        0
  retained term-array objects:   0
  class metadata bytes:          229,376
  flat term arena bytes:         262,144
  descriptor retained bytes:     491,520
  V8 heap high-water:             13,730,920

worker 1:
  class builds:                  10,311
  exact term IDs cached:         47,001
  retained class objects:        0
  retained term-array objects:   0
  class metadata bytes:          229,376
  flat term arena bytes:         131,072
  descriptor retained bytes:     360,448
  V8 heap high-water:             11,162,496
```

The test asserts that reported retained descriptor typed bytes equal flat class metadata plus the single flat term arena.

## Remaining caveat

The correction still stores one exact flat copy of semantic term IDs per observed worker class. It removes the much more expensive millions-of-objects / millions-of-backing-stores ownership pattern; it does not yet prove that even the single flat term copy is the ultimate optimum.

Do not eliminate or compress that remaining exact copy without standard-7x6 evidence. If it becomes the next measured owner, investigate a stable exact class-ID accessor or other canonical representation while preserving ordered exact term identity.

## Next evidence boundary

Admit exactly one standard-7x6 measurement with the same isolation configuration used by the prior v5 run:

```text
workers:                 3
unresolved split depth:  8
autonomous explore:      disabled
proof entries:           8,388,608
shared term arena:       460,000,000 words
```

Compare at equivalent work/elapsed points:

- process RSS;
- worker V8 heap / external / ArrayBuffer high-water;
- local state/class counts and kernel typed bytes;
- flat descriptor metadata/term-arena bytes and capacities;
- shared v5 term-arena usage and replacement counts;
- exact root/action result if resolved.

Follow only the next measured owner.