# Direct structural prefix — 6x4 Connect-4 through rank 12

**Status:** bounded exact rule-only structural-growth diagnostic  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Producer head:** `c77eaf08cef83508f3ab6a544a71110434cedcb8`  
**Workflow:** `36573010586` — success  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Exact result

~~~text
board                              6x4 Connect-4
cells                              24
winning lines                      24
maximum included rank              12

cumulative prefix states        1,245,671
rank-12 frontier states           628,961
literal edges through rank 11   3,228,589
duplicate equivalent edges          7,887

canonicalization calls          3,122,715
permutation candidates          3,739,498
average candidates/call            1.19751
maximum candidates/call                 36
nonbinary tie calls                  9,560
~~~

GitHub-hosted execution:

~~~text
elapsed       125.6285 s
RSS         1,309,601,792 bytes
heap used   1,078,337,288 bytes
array buffers       137,615 bytes
~~~

## Rank-12 frontier

~~~text
states                         628,961
nonterminal states             628,960
terminal states                      1
total residual requirements  7,924,511
average residual requirements   12.5994
maximum residual requirements        22
max P0 residuals                     12
max P1 residuals                     13
~~~

The rank-11 to rank-12 frontier growth factor is:

~~~text
628,961 / 330,354 = ~1.9039x
~~~

while average residual requirements per nonterminal state again fall:

~~~text
rank 10  16.4772
rank 11  14.4469
rank 12  12.5994
~~~

From rank 11 to 12 the average residual load decreases by about 12.79%.

## Rank-11 transition workload

The transition from rank 11 to rank 12 accounts for:

~~~text
literal action edges               1,686,452
canonicalization calls             1,631,156
partitioned permutation candidates 2,088,172
produced distinct states             628,961

no-tie calls                       1,218,710
binary-tie calls                     402,902
nonbinary-tie calls                    9,544
~~~

Tie profiles:

~~~text
none       1,218,710
2            401,150
2x2            1,340
2x2x2            412
3              9,361
3x2              177
3x3                6
~~~

The nonbinary share is only:

~~~text
9,544 / 1,631,156 = ~0.5851%
~~~

and the average exact partitioned candidate count at rank 11 is:

~~~text
2,088,172 / 1,631,156 = ~1.2802
~~~

The maximum candidate count rises to 36 because a handful of `3x3` tie
profiles appear, but that is not representative of the dominant workload.

## Interpretation

The 6x4 structural frontier continues to multiply rapidly even while the
residual representation attached to each state becomes smaller on average.

Through rank 12:

~~~text
frontier cardinality       rising rapidly
average residual load      falling steadily
large tie search           sparse
candidate count/call       close to 1
~~~

This is increasingly strong bounded evidence that the current complexity wall
is **structural-state multiplicity**, not residual-antichain width and not
factorial column canonicalization.

Nonbinary ties are no longer absent, so they remain a real generalized
canonicalization issue. But their measured frequency and candidate work at
rank 11 are too small to explain the scale of the frontier.

The next useful research direction is therefore a state-level quotient law that
acts before or during generation. Candidate seams remain:

- opponent-obligation dominance;
- first-win deadline equivalence;
- future support-chain equivalence;
- branch-local action transport;
- shared resource identity;
- recursively generated implicit assertions.

A rank-13 prefix is a reasonable final bounded scale probe before investing
further in structural-collapse rules, provided its memory/time wall is recorded
as evidence rather than retried unchanged.

## Non-claims

This prefix does not give the full 6x4 graph, recursive quotient, root value, or
an asymptotic growth theorem. It does not prove exponential growth or rule out
future structural collapse. It does not make the affine canonicalizer a runtime
optimization and has no production-solver effect.
