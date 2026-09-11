# Quotient-native residual-class transition-cache campaign

**Status:** complete; dense transition table retained as current speed baseline  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`

## Question

The first quotient-native 4x5 kernel used a dense residual-class transition table with only about 6.73% of its reserved entries populated during root search. Could sparse or bounded tagged memoization reduce memory and improve locality without changing exact semantics?

## Candidates

The campaign compared:

- current dense `class × cell × transition-mode` table;
- no residual-transition cache;
- exact sparse open-address cache;
- tagged direct-mapped caches with 1, 2, 4 and 8 slots per residual class.

Direct-cache collisions are **misses only**. They can cause recomputation but can never return an inexact transition.

## Qualification

Every cache policy rebuilt each complete control graph independently and matched the dense control on:

- reachable quotient-state count;
- reachable residual-class count;
- nonterminal edge count;
- terminal edge count;
- illegal edge count;
- deterministic complete quotient-edge checksum.

All modes passed on 4x4 c4, 5x3 c4 and 4x5 c4.

On 4x5 every mode reproduced:

```text
q states:          294,593
residual classes:   69,707
nonterminal edges: 814,300
terminal edges:     76,058
illegal edges:     288,014
edge checksum:   1,119,331,766
```

Authority:

- `src/quotient-native-class-cache-campaign.mjs`
- Actions run `34646665677`, job `103418974713`

## Search economics

All timed candidates used the same quotient-native full-window W/D/L fail-soft negamax, no per-state edge cache and no ETC.

### 4x5 c4

| Residual transition cache | Median total | Typed-memory lower bound | Search q states | Residual classes |
| --- | ---: | ---: | ---: | ---: |
| **dense** | **18.420 ms** | 1,844,704 B | 15,728 | 7,470 |
| none | 24.806 ms | **533,984 B** | 15,728 | 7,470 |
| sparse exact | 21.825 ms | 828,896 B | 15,728 | 7,470 |
| direct-1 | 25.152 ms | 574,944 B | 15,728 | 7,470 |
| direct-2 | 24.677 ms | 615,904 B | 15,728 | 7,470 |
| direct-4 | 23.561 ms | 697,824 B | 15,728 | 7,470 |
| direct-8 | 22.531 ms | 861,664 B | 15,728 | 7,470 |

The exact sparse cache preserved all dense-cache hits but paid enough hashing/probing overhead to lose about 18% wall-clock time on the largest control.

The direct caches reduced storage substantially but collision-driven recomputation remained costly. Direct-8 was the strongest bounded cache tested on 4x5, with 16,076 hits and 33,686 misses, but still lost to the dense table.

### Other controls

The result is not universal by geometry:

- 4x4 c4 favored direct-8: ~4.976 ms versus ~7.744 ms dense.
- 5x3 c4 favored dense: ~0.758 ms.
- 4x5 c4 favored dense: ~18.420 ms.

This reinforces the project rule that a physically smaller representation is not automatically faster.

## Disposition

For performance-first forward solving, retain the dense residual-class transition table as the current larger-control speed baseline.

Do **not** promote sparse/direct storage merely from occupancy or byte counts. They remain useful memory-pressure candidates if standard 7x6 scale makes dense class-transition storage materially constraining.

The campaign also reveals a more promising next target: preserve only the highest-value **state transition witness** rather than caching every quotient edge. A one-child cache associated with the TT best/refutation move may support:

- reuse of the most likely first transition;
- child-bound ETC without speculative child construction;
- far lower state-edge memory than a full `state × columns` edge table.

That selective child-witness hypothesis should be tested before returning to general edge caching.

## Non-claims

- typed-array memory remains a lower bound on total JS heap;
- no standard 7x6 memory conclusion follows from 4x5;
- dense is not declared globally optimal for every geometry;
- no equal-byte incumbent comparison has been completed.
