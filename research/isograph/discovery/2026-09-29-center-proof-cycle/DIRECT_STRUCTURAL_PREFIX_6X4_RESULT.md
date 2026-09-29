# Direct structural prefix — 6x4 Connect-4 through rank 10

**Status:** bounded exact rule-only structural-growth diagnostic  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Producer head:** `00f22cc5e48b49a8aa6795fcdf0fcdc5323384c4`  
**Workflow:** `36558010011` — success  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Purpose

The full 6x4 Connect-4 compact structural run reached the ten-minute workflow
wall without a final result. Repeating that run unchanged would not identify
the source of the wall.

The exact prefix census therefore constructs only ranks 0 through 10 of the
same direct residual/action-orbit graph. The prefix producer was independently
qualified on rewritten 4x4: its complete-rank run exactly reproduced every
full-graph frontier state count, total literal structural edges, and duplicate
equivalent edge count.

This is therefore a bounded exact prefix of the same structural graph, not a
proxy metric.

## 6x4 rank-10 result

~~~text
board                           6x4 Connect-4
cells                           24
winning lines                   24
maximum included rank           10

cumulative prefix states        286,356
rank-10 frontier states         167,629
literal edges through rank 9    655,811
duplicate equivalent edges          777

canonicalization calls          642,849
permutation candidates          677,916
average candidates/call           1.05455
maximum candidates/call               8
nonbinary tie calls                   0
~~~

Measured GitHub-hosted execution:

~~~text
elapsed       40.4225 s
RSS           518,041,600 bytes
heap used     359,406,928 bytes
array buffers     137,615 bytes
~~~

## Exact frontier

| Rank | States | Nonterminal | Terminal |
|---:|---:|---:|---:|
| 0 | 1 | 1 | 0 |
| 1 | 3 | 3 | 0 |
| 2 | 18 | 18 | 0 |
| 3 | 78 | 78 | 0 |
| 4 | 330 | 330 | 0 |
| 5 | 1,125 | 1,125 | 0 |
| 6 | 3,845 | 3,845 | 0 |
| 7 | 10,925 | 10,924 | 1 |
| 8 | 30,418 | 30,417 | 1 |
| 9 | 71,984 | 71,983 | 1 |
| 10 | 167,629 | 167,628 | 1 |

The rank-10 frontier alone is already about:

~~~text
4.64x the completed 5x4 rank-10 frontier  (36,132)
9.34x the completed 4x6 rank-10 frontier  (17,952)
~~~

Cumulative states through rank 10 are:

~~~text
6x4: 286,356
5x4:  71,852
4x6:  32,455

6x4 / 5x4: ~3.99x
6x4 / 4x6: ~8.82x
~~~

The 4x6 comparison is especially useful because both boards have 24 cells and
24 raw winning lines. Their direct prefix growth nevertheless differs by almost
an order of magnitude by rank 10.

## Canonicalization workload by rank

Through rank 10, every unresolved refinement tie was binary. No size-3-or-larger
tie class was encountered by any transition canonicalization call.

~~~text
rank 3:   9 binary-tie calls
rank 7: 404 binary-tie calls
rank 8: 4,553 binary-tie calls
rank 9: 29,409 binary-tie calls
total: 34,375 binary-tie calls
nonbinary tie calls: 0
~~~

The root itself has three two-column classes:

~~~text
tie sizes: 2,2,2
exact partitioned candidates: 8
~~~

The maximum exact partitioned search at any measured transition is also only
8 candidates. Most calls have no unresolved tie and therefore exactly one
candidate.

This is strong negative evidence against the hypothesis that factorial or
nonbinary tie enumeration causes the **early** 6x4 growth wall.

It does not prove canonicalization is globally cheap: refinement, mask
transport, residual normalization, hashing/maps and later ranks still have
cost. But the measured candidate cardinality cannot explain the early state
multiplication.

## Interpretation

The primary visible distinction by rank 10 is structural state growth itself:

~~~text
same 24 cells
same 24 winning lines
different gravity/support orientation
    ->
6x4 rank-10 frontier ~9.34x 4x6 rank-10 frontier
~~~

This strengthens the earlier 4x5 versus 5x4 control and confirms that board
area plus raw line count are nowhere near sufficient to predict direct
structural graph size.

The ten-minute full 6x4 wall should therefore not be treated primarily as a
column-permutation problem. Before another full attempt, the useful questions
are:

1. how the 6x4 frontier grows at ranks 11 and 12;
2. whether residual-antichain sizes or transition costs grow with that frontier;
3. whether exact state-level closures can reduce the structural graph itself,
   rather than only canonicalization cost.

## Non-claims

This prefix does not provide the full 6x4 state count, recursive quotient, root
value, or asymptotic growth law. It does not prove exponential growth, does not
prove canonicalization is irrelevant at later ranks, and does not imply a
production-solver change.
