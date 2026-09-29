# Direct structural prefix — 6x4 Connect-4 through rank 11

**Status:** bounded exact rule-only structural-growth diagnostic  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Producer head:** `4298b1d825361462eb03db7572bbe90991b06e4f`  
**Workflow:** `36558462364` — success  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Exact result

The exact prefix producer constructed the direct residual/action-orbit graph
through rank 11:

~~~text
board                              6x4 Connect-4
cells                              24
winning lines                      24
maximum included rank              11

cumulative prefix states          616,710
rank-11 frontier states           330,354
literal edges through rank 10   1,542,137
duplicate equivalent edges          3,543

canonicalization calls          1,491,559
permutation candidates          1,651,326
average candidates/call            1.10711
maximum candidates/call                  8
nonbinary tie calls                     16
~~~

GitHub-hosted execution:

~~~text
elapsed       65.6141 s
RSS           862,093,312 bytes
heap used     649,155,176 bytes
array buffers     137,615 bytes
~~~

## Frontier

| Rank | States | Nonterminal | Terminal | Avg residual requirements | Max residual requirements |
|---:|---:|---:|---:|---:|---:|
| 0 | 1 | 1 | 0 | 48.0000 | 48 |
| 1 | 3 | 3 | 0 | 43.3333 | 44 |
| 2 | 18 | 18 | 0 | 39.5556 | 41 |
| 3 | 78 | 78 | 0 | 36.0897 | 39 |
| 4 | 330 | 330 | 0 | 32.7636 | 37 |
| 5 | 1,125 | 1,125 | 0 | 29.4836 | 35 |
| 6 | 3,845 | 3,845 | 0 | 26.5064 | 33 |
| 7 | 10,925 | 10,924 | 1 | 23.6817 | 32 |
| 8 | 30,418 | 30,417 | 1 | 21.1064 | 32 |
| 9 | 71,984 | 71,983 | 1 | 18.6870 | 29 |
| 10 | 167,629 | 167,628 | 1 | 16.4772 | 26 |
| 11 | 330,354 | 330,353 | 1 | 14.4469 | 24 |

Rank-11 total residual requirements:

~~~text
4,772,578
~~~

Maximum per-player residual counts at rank 11:

~~~text
P0: 14
P1: 13
~~~

## Rank-10 transition workload

The transition from rank 10 to rank 11 accounts for:

~~~text
literal action edges             886,326
canonicalization calls           848,710
partitioned permutation candidates 973,410
produced distinct states         330,354

no-tie calls                     724,888
binary-tie calls                 123,806
nonbinary-tie calls                   16
~~~

Tie profiles:

~~~text
none      724,888
2         123,399
2x2           407
3              16
~~~

The first observed size-3 tie classes therefore occur at rank 10, but only
16 times among 848,710 canonicalization calls. Maximum exact partitioned search
remains six candidates at that rank and eight over the entire measured prefix.

## Interpretation

The rank-10 to rank-11 frontier growth factor is:

~~~text
330,354 / 167,629 = ~1.9707x
~~~

while the average number of residual requirements per nonterminal state falls:

~~~text
rank 10: 16.4772
rank 11: 14.4469
change:  -12.32%
~~~

So the current width-growth wall is not being driven by growing residual
antichain size per state. The representation attached to each state is becoming
smaller on average while the number of structurally distinct states continues
to multiply rapidly.

Likewise, large unresolved column-permutation classes are not the visible cause
through rank 11. Nonbinary ties have appeared, but they are extremely sparse and
the exact candidate count remains tiny relative to the number of states and
transitions.

The dominant measured burden is therefore the **cardinality of the structural
frontier itself** under the current exact realizability closures.

This sharpens the next research question away from canonicalization mechanics:

~~~text
Can additional rule-derived obligation / deadline / support equivalences
collapse structural states before the frontier multiplies?
~~~

The next bounded scale control is rank 12 only. It should be attempted once,
with its memory/time wall recorded if it does not complete.

## Non-claims

This prefix does not give the full 6x4 graph, recursive quotient, root value, or
an asymptotic growth law. Falling residual size does not imply falling state
complexity. Sparse nonbinary ties do not prove canonicalization is globally
irrelevant, and this result does not establish polynomial or exponential
generalized growth.
