# Direct structural growth — 4x5 Connect-4

**Status:** bounded rule-only structural growth result  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Initial workflow:** `36551642428` — success  
**Sparse-transporter rerun:** `36551912434` — success  
**Sparse producer head:** `5b3084095ed4a7e4fabde8da444d832be4df8686`  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no

## Purpose

Push the validated direct residual-orbit producer beyond the exhaustive small-
board matrix without constructing physical board states.

The run uses:

- normalized residual-antichain transition semantics;
- action-label orbit canonicalization;
- nonterminal frontier blocker elimination;
- mover final-event cap-parity elimination;
- recursive action-unlabelled branch closure.

## Result

~~~text
board                         4x5 Connect-4
cells                         20
winning lines                 17

direct residual-orbit states  102,815
literal structural edges      325,038
duplicate equivalent edges      7,698
recursive classes              86,791
W/D/L-split classes                 0

root value                          draw
root legal actions                     4
root distinct child classes             2

earliest dynamic merge rank             9
local closure rounds to full             9
~~~

Runtime on the GitHub-hosted Node 26 control:

~~~text
elapsed      16.12 s
RSS          ~686 MB
heap used    ~241 MB
array buffers ~101 MB
~~~

## Closure trajectory

~~~text
102815
101107
 99211
 96502
 92483
 89521
 87536
 86893
 86797
 86791
~~~

## Frontier

The structural-state frontier peaks at rank 12:

~~~text
rank 12:
23,247 residual-orbit states
20,503 recursive classes
~~~

Late ranks compress sharply:

~~~text
rank 15: 3,982 states / 1,451 classes
rank 16:   821 states /   177 classes
rank 17:   131 states /    25 classes
rank 18:    10 states /     7 classes
rank 19:     3 states /     3 classes
rank 20:     2 states /     2 classes
~~~

## Growth observation

The rewritten 4x4 C4 direct graph has 9,441 structural states. The 4x5 graph
has 102,815:

~~~text
4x4 C4   9,441
4x5 C4 102,815
growth   ~10.9x for four additional cells
~~~

This is substantially smaller than a physical-game expansion, but the observed
state growth does not support a polynomial-size claim.

## Canonicalizer correction and rerun

The initial run used an implementation convenience that precomputed one
`2^cells` mask-remap table per column permutation. That preprocessing was not
semantic and was itself exponentially sized.

It has since been replaced by sparse, on-demand residual-mask transport. The
same 4x5 control was rerun with **identical semantic counts**:

~~~text
states             102,815
edges              325,038
recursive classes   86,791
root value             draw
closure rounds             9
~~~

but with materially lower implementation cost:

~~~text
                         dense remap   sparse remap
elapsed                     16.12 s       12.48 s
RSS                         ~686 MB       ~319 MB
heap used                   ~241 MB       ~136 MB
array buffers               ~101 MB       ~0.14 MB
~~~

The explicit `2^cells` preprocessing artifact is therefore removed from later
growth measurements. The remaining state growth belongs to the direct
structural graph and ordinary object/storage overhead rather than a full-mask
permutation table.

## Interpretation

The result strengthens the claim that the residual/action-unlabelled system can
be generated independently of physical-board enumeration. It also sharpens the
remaining complexity burden: direct structural state growth is now the dominant
question, not minimax or quotient correctness.

## Non-claims

This does not establish polynomial generalized Connect Four, a closed-form
value function, or a production solver optimization.
