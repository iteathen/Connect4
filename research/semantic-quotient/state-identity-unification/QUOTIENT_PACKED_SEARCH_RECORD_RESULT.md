# Packed Search-Record Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34653733278`, job `103441495618`  
**Status:** exact and qualified; scaling option, not current 4x5 speed default

## Candidate

The scaled quotient state pool historically stores three separate byte arrays for search metadata:

```text
lower bound : Int8
upper bound : Int8
best move   : Int8
```

For W/D/L Negamax these fit in seven bits total:

```text
lower:    {-1,0,+1} -> 2 bits
upper:    {-1,0,+1} -> 2 bits
bestMove: {0..6, none} -> 3 bits
```

The candidate replaces the three arrays with one `Uint8Array` record per reserved q state. State identity and the 32-bit stored state hash remain unchanged.

## Qualification

Against the scaled packed-support + prefix4K term-ID baseline, the packed-record implementation reproduced on every complete bounded control:

- complete q-state census;
- complete edge census;
- every residual class and term-ID sequence;
- every qID exact state triple;
- every quotient edge;
- independent BSFP root W/D/L;
- independent BSFP root-action W/D/L;
- identical Negamax expansions and calls;
- identical final root lower bound, upper bound, and best move.

The record packing therefore changes storage only.

## Timing

| Geometry | baseline | packed record | ratio |
| --- | ---: | ---: | ---: |
| 4x3 c3 | **0.538 ms** | 0.597 ms | 1.109 |
| 4x4 c4 | **3.765 ms** | 3.827 ms | 1.016 |
| 5x3 c4 | **2.066 ms** | 2.284 ms | 1.106 |
| 4x5 c4 | **14.368 ms** | 14.541 ms | **1.012** |

On the governing 4x5 proxy, packed records cost about **1.2% wall-clock**.

## Memory

### 4x5 root search

State capacity: 16,384.

```text
baseline state pool: 442,368 B
packed state pool:   409,600 B
bytes saved:          32,768 B
```

Full scaled root footprint:

```text
baseline: 1,461,269 B
packed:   1,428,501 B
```

### Complete 4x5 graph

State capacity: 524,288.

```text
baseline state pool: 12,058,624 B
packed state pool:   11,010,048 B
bytes saved:          1,048,576 B
```

### Standard 7x6 root construction

At the initial 4,096-state capacity:

```text
baseline scaled kernel: 4,924,397 B
packed record kernel:   4,916,205 B
bytes saved:                8,192 B
```

The root-only saving is small because the q-state pool has not yet grown.

## Comparison with state-hash shrinking

The packed search record and a 16-bit state-hash fingerprint each save two bytes per reserved q state, but they trade different execution costs:

- hash16 keeps three search arrays but weakens the collision prefilter;
- packed record retains the 32-bit state hash and compresses data the search consumes together.

On 4x5:

```text
hash16 slowdown:       ~1.4%
packed-record slowdown: ~1.2%
```

The packed record is therefore the stronger two-byte-per-state scaling candidate, although neither replaces the current 4x5 speed baseline yet.

## Disposition

Keep the ordinary three-array search record for the current bounded/root-speed reference.

Retain the packed record as a qualified scaling option when q-state capacity becomes a material memory cost. Its spare eighth bit remains available for a future load-bearing boolean if one emerges; do not assign it speculatively.

Do not stack packed records with hash16/nohash merely to maximize byte reduction without a separate end-to-end qualification, because their small individual runtime costs may compound.

## Next seam

Further one- or two-byte q-state micro-optimizations are lower priority than measuring actual standard-7x6 state growth.

The next campaign should exercise the scaled architecture on real standard 7x6 through bounded support ranks and measure:

- q states discovered by rank;
- residual classes and residual terms by rank;
- transition-cache prefix hit/miss/out-of-prefix behavior;
- q-state interning hit/miss/growth;
- typed memory growth;
- elapsed expansion cost;
- a hard state/memory cap to prevent an accidental unbounded solve.

This provides the missing evidence needed to size the prefix cache and state representation for standard 7x6 without claiming an exact root solve.
