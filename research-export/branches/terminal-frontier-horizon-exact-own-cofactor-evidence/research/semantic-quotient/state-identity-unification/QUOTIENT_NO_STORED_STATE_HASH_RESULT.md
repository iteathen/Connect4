# No-Stored-State-Hash Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34653321395`, job `103440188745`  
**Status:** exact and qualified; scaling option only, not current root-speed default

## Candidate

The scaled quotient state pool historically stored a full 32-bit hash per reserved q state in addition to the exact state triple:

```text
supportIndex
p0Class
p1Class
storedHash32
search bounds / best move
```

The candidate removes `storedHash32`. Lookup still computes the exact hash needed to select the open-addressed probe sequence and compares the full q triple on occupied slots. During rare hash-table growth, each state's hash is recomputed from the exact triple.

This saves 4 bytes per reserved q-state capacity entry without changing identity semantics.

## Qualification

Against the scaled packed-support + prefix4K term-ID baseline, no-hash reproduced on all complete bounded controls:

- complete q-state census;
- complete edge census;
- every residual class ID and term-ID sequence;
- every qID exact triple;
- every quotient edge;
- independent BSFP root and root-action W/D/L;
- identical Negamax expansions and calls.

## Timing

| Geometry | baseline | no stored hash | ratio |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 0.684 ms | **0.678 ms** | 0.992 |
| 4x4 c4 | **7.503 ms** | 7.617 ms | 1.015 |
| 5x3 c4 | **1.789 ms** | 1.954 ms | 1.093 |
| 4x5 c4 | **14.545 ms** | 14.649 ms | 1.007 |

On the governing 4x5 root, the runtime cost is only about **0.7%**.

## Memory

4x5 root search:

```text
state capacity:     16,384
bytes saved:        65,536 B
```

Complete 4x5 graph:

```text
state capacity:    524,288
bytes saved:     2,097,152 B
```

Standard 7x6 root construction currently starts with only the default 4,096 state capacity, so the immediate structural-root saving is only:

```text
16,384 B
```

Preferred packed-prefix4K total typed root construction:

```text
with stored hash:    4,924,397 B
without stored hash: 4,908,013 B
```

## Interpretation

Removing the stored hash is semantically clean and becomes increasingly valuable as q-state capacity grows. However, the result is not a universal speed improvement:

- 4x5 wall-clock is essentially neutral/slightly slower;
- 5x3 shows that unconditional full-triple collision checks can become measurably more expensive;
- root-only 7x6 memory saving is small because very few q states exist before search begins.

Therefore do not promote pure no-hash as the default hot-path representation yet.

## Disposition

Retain as a qualified scaling option and use it as one endpoint for the next state-hash experiment.

The next candidate should keep a compact collision precheck while reducing hash storage:

```text
16-bit stored hash fingerprint
```

Lookup still computes the full hash for bucket selection, but the u16 fingerprint filters almost all nonmatching occupied slots before loading/comparing the three u32 state fields. Rehashing can recompute the full hash from the exact triple.

This should save 2 bytes per reserved q state rather than 4, while potentially retaining most of the full-hash lookup economics.
