# IsoMax Phase-2 plan — packed private cache epoch/value tag

Date: 2026-09-28
Status: planned experiment from selected solver baseline `81c9475e94607cff9e777776157b82b3466c385b`.

## Trigger

The compact-private candidate qualified and is the selected experimental baseline.

On exact fixture `353335714`, the winning worker averages:
- nodes: about 1.265 M;
- exact private-cache hits: about 358.7 K;
- exact-hit rate: about 28.36%.

This excludes private LOWER0/UPPER0 hits, so private cache metadata is touched even
more often than the exact-hit count alone indicates.

## Current metadata path

Each private cache row owns:
- `stamp: Uint32Array`;
- `value: Uint8Array`;
- exact identity words.

Probe:
1. load stamp;
2. compare epoch;
3. compare exact identity;
4. on exact/same-q hit, load value byte.

Store:
1. write identity;
2. write value byte;
3. write stamp word.

The stamp and value are always consumed together as cache-row metadata.

## Candidate

Pack epoch and value into one private uint32 tag:

```
tag = (epoch << 3) | value
```

where value codes 0..5 fit in three low bits.

Use:
- low 3 bits = value / private bound code;
- high 29 bits = epoch.

Probe loads one tag:
- `tag >>> 3` tests current epoch;
- `tag & 7` is already available after an exact key match.

Store writes one tag instead of separate value+stamp stores.

Epoch reset remains exact:
- epoch range becomes 1..2^29-1;
- on wrap, clear the tag array and restart epoch at 1.

No logical cache capacity, key identity, locator hash, shared cache behavior,
private LOWER0/UPPER0 semantics, same-q coalescing, or search rule changes.

## Expected structural benefit

Selected 7x6:
- removes the separate 1-byte value array;
- removes one metadata load on exact/same-q hits;
- replaces two metadata stores with one on publications;
- keeps key arrays and full-q locator unchanged.

This is a local/private optimization only.

## Correctness gates

- exact values 1..3 round-trip;
- LOWER0/UPPER0 codes 4/5 remain private and public exact probe still filters them;
- opposite same-q zero bounds still coalesce to exact draw;
- exact rows still outrank weak bounds;
- epoch reset invalidates stale rows;
- forced epoch wrap clears tags and remains exact;
- 4x4/nonstandard full-key paths unchanged;
- generated behavior/root-frontier variants match source authority;
- cycle ledger/source seals updated in the same source work;
- no single-worker execution.

## Benchmark

A = `81c9475e...` selected compact-private baseline.

B = packed private tag candidate.

Fixed:
- 4 workers = 1 wide + 3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- full sharing / sharedSampleMask=0;
- Node 26.7.0.

Primary fixture `353335714`: eight balanced completed exact A/B blocks.
Authority: whole-process cycles.

Secondary fixture `35333571`: 120000 ms application ceiling; censored if
either arm times out.

Reject if correctness fails or completed exact whole-process cycles do not
establish improvement.

PR #84 remains draft/open and is not authorized for merge by this work.
