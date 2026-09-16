# Standard 7x6 Persistent-Chunk Forward-Growth Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Qualification run:** `34654732608`, job `103444532946`  
**Compact rerun:** `34654830967`, job `103444837088`  
**Status:** target-scale semantic qualification passed; memory win is real, runtime implementation is currently unacceptable

## Contract

This campaign re-ran the same hard-capped standard-7x6 forward quotient census used for the term-list baseline:

```text
MAX_STATES      = 2,000,000
MAX_RANK        = 12
prefix classes  = 4096
support         = packed u32
residual class  = five persistent 128-bit chunk IDs
```

It is a growth/storage experiment, **not an exact 7x6 root solve**.

The campaign included rank-by-rank regression assertions against the qualified term-list standard-7x6 census.

## Target-scale semantic qualification

The chunked representation reproduced the authoritative term-list q-state counts exactly:

```text
rank 0:       1
rank 1:       7
rank 2:      49
rank 3:     238
rank 4:   1,120
rank 5:   4,263
rank 6:  16,422
rank 7:  54,131
rank 8: 182,383
rank 9: 538,774
```

It also reproduced the recorded residual-class counts after complete expansion through every rank 0..8, including:

```text
after rank 8: 1,357,101 residual classes
```

The run then hit the same hard q-state cap while partially expanding rank 9:

```text
q states:          2,000,001
residual classes:  2,946,478
```

So target-scale semantic equivalence is established through the measured boundary.

## Memory result at the identical 2M-state cap

### Existing u16 term-list representation

```text
total typed:      438,889,453 B
residual typed:   378,971,806 B
q-state typed:     56,623,104 B
packed support:     3,294,207 B
process RSS:       ~612 MB
```

### Persistent 128-bit chunks

```text
total typed:      279,559,129 B
residual typed:   219,641,482 B
q-state typed:     56,623,104 B
packed support:     3,294,207 B
process RSS:       449,069,056 B (~428.3 MiB)
```

Therefore the exact implementation saves:

```text
typed total:     159,330,324 B  (~36.3%)
residual typed:  159,330,324 B  (~42.0%)
RSS:             roughly 163 MB
```

This confirms that the prior 1.357M-class chunk-sharing audit identified a **real target-scale structural compression**, not merely an optimistic storage model.

## Per-rank chunk growth

```text
rank   classes      unique chunks   total typed
0          16               30        4.78 MiB
1          72              123        4.78 MiB
2         548              847        4.78 MiB
3       1,780            2,494        4.87 MiB
4      10,304           12,977        5.73 MiB
5      28,154           33,189        7.83 MiB
6     135,109          138,894       21.48 MiB
7     331,014          314,108       39.36 MiB
8   1,357,101        1,045,891      127.61 MiB
9*  2,946,478        2,036,560      266.61 MiB
```

`rank 9*` is partial expansion until the 2M q-state cap.

Chunk capacity at the cap is 2,097,152 payload entries, close to actual 2,036,560 unique chunks.

## Runtime result

This implementation is currently much too expensive:

```text
term-list census: ~4.935 s
chunked census:  ~36.207 s
ratio:           ~7.34x slower
```

Rank-8 expansion alone takes about 10.45 s and partial rank-9 expansion about 21.47 s.

The representation therefore **does not advance as the runtime implementation in its current form**, despite its substantial memory success.

## Dominant implementation cost

At the cap:

```text
chunk intern hits:    43,130,305
chunk intern misses:   2,036,560
--------------------------------
chunk lookups:        45,166,865
```

Class interning:

```text
class hits:    6,086,895
class misses:  2,946,478
```

Every candidate class currently decomposes to five chunks and performs five independent global chunk-hash lookups **before** the class hash table can determine whether that class already exists.

This means the representation pays global chunk canonicalization repeatedly even for the >6 million class-intern hits that do not create a new class.

That is the first optimization target.

## Strongest next optimization

Invert the interning order:

```text
current:
  class bits
    -> intern 5 chunks
    -> obtain 5 chunk IDs
    -> hash/probe class tuple

candidate:
  class bits
    -> compute exact 625-bit class hash
    -> probe class hash/equality directly against existing chunk payloads
    -> if class hit: return existing class ID with zero chunk interning
    -> only on class miss: intern the five chunks and store their IDs
```

Class equality can compare the 20 candidate words against the five referenced chunk payloads without allocating a dense per-class bitset.

Given the measured class-intern counts, this can theoretically remove the five chunk-table lookups for **6,086,895 class hits**, i.e. up to about **30.4 million unnecessary chunk-intern probes** at this boundary.

The exact representation and memory model are unchanged.

## Disposition

Persistent 128-bit chunks are now:

- **validated as exact at target scale**;
- **validated as a major memory reduction**;
- **rejected as currently implemented for runtime**.

Do not discard the representation until class-first interning is tested, because the current 7.3x slowdown is dominated by an avoidable canonicalization order rather than by the five-chunk storage shape itself.

If class-first interning remains far slower than the u16 term-list substrate, stop optimizing chunks and move to the simpler packed-term-list fallback (three 10-bit term IDs per u32 word).
