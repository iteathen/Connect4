# Direct structural growth — 5x4 Connect-4

**Status:** bounded rule-only structural growth result  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Producer head:** `ebb66e1dafcec9eab286dd67c9995459db859aaa`  
**Workflow:** `36553916023` — success  
**Evaluator:** compact direct residual growth  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no

## Exact result

~~~text
board                           5x4 Connect-4
cells                           20
winning lines                   17
column permutations            120

direct residual-orbit states      289,852
literal structural edges        1,079,881
duplicate equivalent edges         28,827
recursive classes                 251,222
W/D/L-split classes                     0

root value                            draw
root legal actions                       5
root distinct orbit children              3
root distinct recursive children          3

earliest dynamic merge rank               9
~~~

GitHub-hosted Node 26 measurement:

~~~text
elapsed       208.76 s
RSS           ~213.5 MB
heap used     ~90.8 MB
array buffers ~0.14 MB
~~~

The compact evaluator retained no full diagnostic graph objects.

## Frontier

The structural-state and recursive-class frontiers both peak at rank 12:

~~~text
rank 12: 64,718 states / 59,876 recursive classes
~~~

Late ranks:

~~~text
rank 15: 11,459 / 4,278
rank 16:  1,812 /   357
rank 17:    205 /    27
rank 18:     10 /     7
rank 19:      3 /     3
rank 20:      2 /     2
~~~

## Same-area / same-line-count gravity control

The previously measured 4x5 Connect-4 control also has 20 cells and 17 winning
lines, but its structural graph is:

~~~text
4x5 C4: 102,815 direct states / 86,791 recursive classes
5x4 C4: 289,852 direct states / 251,222 recursive classes
~~~

Thus the rotated board produces about 2.82x as many direct states and about
2.89x as many recursive classes despite identical board area and raw winning-
line count.

This strengthens the earlier 4x3 C3 versus 3x4 C3 control:

~~~text
board area + raw winning-line count
!=
sufficient structural-growth carrier
~~~

Gravity/support orientation and the induced future support topology materially
change the direct structural state system.

## Interpretation

Width growth also exposes the current canonicalization burden: five columns
admit 120 literal column permutations. The column-refinement campaign should
therefore be evaluated as a possible replacement for factorial permutation
enumeration, not merely as a cosmetic state-signature optimization.

The 5x4 count must not be compared with 4x5 as an asymptotic width-versus-height
law from a single pair. It is a topology control showing that equal area and
equal line count do not determine structural graph size.

## Non-claims

This result does not establish polynomial width growth, a general complexity
bound, an XOR W/D/L formula, or production-solver applicability.


## Partitioned exact canonicalization control

After the refinement-partitioned exact canonicalizer was qualified on 4x4, the
same 5x4 structural run was repeated at producer head
`2ac1df168ee935c6f4866eae16224bf93118a318`, workflow
`36554956756`.

It reproduced every semantic count and the complete rank frontier exactly:

~~~text
direct states       289,852
edges              1,079,881
duplicate edges       28,827
recursive classes    251,222
W/D/L splits               0
root value              draw
earliest merge rank         9
~~~

Canonicalization diagnostics:

~~~text
method                            refinement-partitioned exact tie search
total permutation candidates     1,934,011
maximum candidates for one state        24
~~~

Matched GitHub-hosted runtime:

~~~text
full 120-permutation canonicalizer   208.76 s
partitioned exact canonicalizer       27.26 s
speedup                                7.66x
wall-time reduction                   86.94%
~~~

Memory was not reduced in this run:

~~~text
baseline RSS        ~213.5 MB
partitioned RSS     ~283.3 MB
baseline heap used   ~90.8 MB
partitioned heap     ~92.3 MB
~~~

The runtime gain is therefore attributable to reduced canonicalization work,
not a smaller semantic graph. The method remains exact because refinement fixes
the order of distinguishable column-color classes and exhaustive search is
retained inside unresolved tie classes.

This is not yet a polynomial canonicalization theorem: a large unresolved tie
class can still require factorial search. The bounded result shows that the
factorial search space is highly avoidable on this control, not that it is
eliminated in the generalized worst case.
