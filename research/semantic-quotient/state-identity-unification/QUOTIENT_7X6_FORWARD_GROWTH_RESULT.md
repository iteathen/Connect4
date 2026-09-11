# Standard 7x6 Quotient Forward-Growth Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34653920835`, job `103442066356`  
**Status:** bounded growth census complete to hard cap; not an exact root solve

## Purpose

Measure actual standard-7x6 quotient-state and residual-class growth using the current scaled architecture without attempting an exact game solve.

Configuration:

```text
geometry:                7x6 connect-4
support:                 packed u32 descriptor
residual representation: u16 term IDs (625-term vocabulary)
transition cache:        fixed dense prefix, 4096 residual classes
q-state cap:             2,000,000
requested max rank:      12
```

The campaign stops at the rank/state boundary rather than continuing toward an accidental full solve.

## Result

The hard state cap was reached while expanding support rank 9:

```text
status:             capped
completed rank:     9 (partial expansion of rank-9 states)
q states:           2,000,001
residual classes:   2,946,478
stored term IDs:  117,732,328
typed memory:       438,889,453 B
campaign time:      4.935 s
```

The complete rank-9 frontier had already been discovered before rank-9 expansion began, so rank-state counts through rank 9 are authoritative for this traversal.

## Exact discovered q states by rank

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

Cumulative state population after completely expanding each preceding rank:

```text
after rank 0:       8
after rank 1:      57
after rank 2:     295
after rank 3:   1,415
after rank 4:   5,678
after rank 5:  22,100
after rank 6:  76,231
after rank 7: 258,614
after rank 8: 797,388
```

Rank 9 was only partially expanded before reaching 2,000,001 total q states.

## Residual-class growth

Residual class population rose much faster than q-state population:

```text
rank boundary   residual classes   stored term IDs
0                         16               985
1                         72             4,465
2                        548            32,560
3                      1,780           101,295
4                     10,304           549,938
5                     28,154         1,433,412
6                    135,109         6,407,784
7                    331,014        14,950,124
8                  1,357,101        56,882,431
rank-9 partial      2,946,478       117,732,328
```

At the hard cap, average stored antichain length is approximately:

```text
117,732,328 / 2,946,478 ~= 39.96 term IDs/class
```

At two bytes per u16 term ID, the logical term slab alone is therefore roughly 235 MB before class metadata and hash-table capacity.

## Memory decomposition at the 2M-state cap

```text
q-state storage:           56,623,104 B
residual-class storage:   378,971,806 B
packed support:             3,294,207 B
fixed transition cache:     1,376,256 B  (included in residual total)
bit helpers:                      336 B
------------------------------------------------
total typed:              438,889,453 B
```

Process RSS at the cap was about 612 MB.

The dominant standard-7x6 scaling problem has therefore moved decisively from support/state storage to **residual-class storage**.

## Transition-cache behavior

The fixed prefix4K cache is valuable in bounded Negamax search, but it showed essentially no reuse under exhaustive forward expansion:

```text
own transition hits:          0
block transition hits:        0
own misses:           4,597,880
block misses:         4,521,868
out-of-prefix own:    4,579,869
out-of-prefix block:  4,503,850
cached stores:            36,029
```

Prefix misses begin during rank-5 expansion, when the residual-class population has already exceeded 4K.

This does **not** falsify prefix caching for Negamax. Forward census visits each state once and has different transition-reuse economics from a transposition-heavy alpha-beta proof. It does show that the prefix is not a general-purpose graph-materialization cache and should remain search-oriented.

## State interning

At the cap:

```text
state intern lookups: 4,521,869
state hits:           2,521,868
state misses:         2,000,001
```

So the q interner eliminated about 55.8% of attempted nonterminal child-state insertions in this bounded forward traversal.

The q-state representation is therefore providing substantial graph convergence even before Negamax pruning.

## Transition work

At the cap:

```text
nonterminal quotient edges visited: 4,521,868
terminal wins:                         76,012
illegal/full-column probes:            22,213
cross-dominance checks:             555,678,944
```

The campaign remains a forward graph census, not a solver-time estimate.

## Main conclusion

The previous scaling work succeeded at its intended targets:

- packed support reduced standard-7x6 support storage from ~32 MB to ~3.3 MB;
- fixed prefix caching bounded transition-cache memory at ~1.38 MB;
- q-state storage is still moderate relative to the class substrate.

The new dominant cost is:

```text
millions of unique residual antichains
× roughly 40 u16 term IDs/class
```

Further one- or two-byte q-state optimizations are therefore lower priority.

## Next research seam

The strongest next candidate is a structurally shared residual-class representation.

A promising exact form is a **persistent chunked term bitset** over the fixed 625-term ontology:

```text
625 bits -> 20 u32 words
20 words -> e.g. five 128-bit chunks
chunks hash-consed globally
class -> small tuple of chunk IDs
```

A one-cell transition changes only terms involving the landing cell, so most bitset chunks may be reusable between parent and child classes. This could replace ~80 bytes of average raw term IDs per class with a much smaller shared chunk tuple if actual chunk reuse is high.

Before implementing it in the solver, measure chunk-sharing/compression on real standard-7x6 classes through a bounded rank (target: complete expansion through rank 8 / complete rank-9 frontier) and compare chunk sizes such as 1, 2, 4, and 5 u32 words.

Other possible residual encodings (10-bit packing, fixed 625-bit classes, delta coding) remain controls, but simple 10-bit packing can save at most 37.5% of term-slab bytes and does not exploit the strong parent/child structural similarity suggested by the transition algebra.
