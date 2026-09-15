# Scaled Quotient State-Hash Width Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34653549515`, job `103440920029`  
**Status:** exact and qualified; keep 32-bit stored hash as current speed default

## Question

The exact q-state pool stores `(supportIndex,p0Class,p1Class)` plus a 32-bit hash used as an occupied-slot prefilter during open-addressed state interning. Two storage reductions were compared:

1. **hash16** — retain only a 16-bit fingerprint; full hash is still computed for bucket selection and exact triple comparison remains authoritative;
2. **nohash** — store no per-state hash/fingerprint and compare exact triples on every occupied probe slot.

Fingerprint/hash collisions can never create false q identity because exact state equality always compares the full triple.

## Qualification

All three variants reproduced on all complete bounded controls:

- complete q-state census;
- complete edge census;
- every residual class and term-ID sequence;
- every qID exact triple;
- every quotient edge;
- independent BSFP root and root-action W/D/L;
- identical Negamax expansions and calls.

## Root timing

| Geometry | hash32 | hash16 | nohash |
| --- | ---: | ---: | ---: |
| 4x4 c4 | 4.264 ms | 4.245 ms | **4.204 ms** |
| 5x3 c4 | 0.972 ms | **0.930 ms** | 0.968 ms |
| 4x5 c4 | **14.458 ms** | 14.667 ms | 14.748 ms |

On the governing 4x5 proxy:

```text
hash16 / hash32 = 1.0144
nohash / hash32 = 1.0201
```

Thus shrinking/removing the hash costs about 1.4–2.0% wall-clock in the larger control.

## 4x5 root state memory

State capacity is 16,384 entries:

```text
hash32 state pool: 442,368 B
hash16 state pool: 409,600 B
nohash state pool: 376,832 B
```

Full scaled-kernel root footprint:

```text
hash32: 1,461,269 B
hash16: 1,428,501 B
nohash: 1,395,733 B
```

## Complete 4x5 graph memory

At complete-graph state capacity 524,288:

```text
hash32 state pool: 12,058,624 B
hash16 state pool: 11,010,048 B
nohash state pool:  9,961,472 B
```

So hash16 saves 1 MiB of state storage and nohash saves 2 MiB at that complete-graph capacity, while preserving exact graph semantics.

## Standard 7x6 root construction

At the initial 4,096-state capacity:

```text
hash32 scaled kernel: 4,924,397 B
hash16 scaled kernel: 4,916,205 B
nohash scaled kernel: 4,908,013 B
```

The root-construction savings are small because only one q state exists and capacity has not grown.

## Disposition

Keep **hash32** as the current 4x5/root-speed baseline.

Retain hash16 and nohash as qualified scaling options if future standard-7x6 state growth makes state-array memory dominant enough to justify a small lookup penalty.

The next state-layout candidate should target data that search actually consumes together:

```text
lower bound + upper bound + best move
```

These currently occupy three separate byte arrays but fit in seven bits total. A single packed record byte can save two bytes per reserved q state and may improve search locality rather than merely trade speed for storage.
