# Direct structural growth — 4x7 Connect-4

**Status:** bounded rule-only structural growth result  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Original full-graph producer head:** `f04b8611245dafdd07e0eb1cab0f3afeaab7f654`  
**Original workflow:** `36553254671` — success  
**Compact producer head:** `0f15b34c4bf578eaa5e853b40dd2a5b75503aee6`  
**Compact workflow:** `36553655094` — success  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no

## Exact result

Both the original full diagnostic evaluator and the compact growth evaluator
produced the same structural result:

~~~text
board                           4x7 Connect-4
cells                           28
winning lines                   31

direct residual-orbit states    3,534,913
literal structural edges       11,200,763
duplicate equivalent edges        220,743
recursive classes               2,747,043
W/D/L-split classes                     0

root value                            draw
root legal actions                       4
root distinct orbit children              2
root distinct recursive children          2

earliest dynamic merge rank               9
~~~

The peak frontier is rank 17:

~~~text
rank 17: 622,885 states / 502,839 recursive classes
~~~

Late-rank contraction remains strong:

~~~text
rank 18: 603,975 / 423,173
rank 19: 439,159 / 266,947
rank 20: 242,501 / 119,446
rank 21:  96,589 /  40,034
rank 22:  27,415 /   9,228
rank 23:   6,264 /   1,655
rank 24:     904 /     180
rank 25:     132 /      25
rank 26:      10 /       7
rank 27:       3 /       3
rank 28:       2 /       2
~~~

## Compact/full equivalence and economics

The original full-graph run measured:

~~~text
elapsed    491.85 s
RSS        ~3.96 GB
heap used  ~3.65 GB
~~~

The compact evaluator measured:

~~~text
elapsed    426.39 s
RSS        ~1.17 GB
heap used  ~0.86 GB
~~~

The semantic counts and complete rank frontier were identical.

Relative to the full diagnostic evaluator, the compact representation reduced
wall time by about 13.31%, RSS by about 70.38%, and heap used by about 76.46%.
This is an implementation-economics result only; it does not change the
structural graph being measured.

## Fixed-width height growth

| Board | Cells | Direct states | Recursive classes |
|---|---:|---:|---:|
| 4x4 C4 | 16 | 9,441 | 8,242 |
| 4x5 C4 | 20 | 102,815 | 86,791 |
| 4x6 C4 | 24 | 693,284 | 562,550 |
| 4x7 C4 | 28 | 3,534,913 | 2,747,043 |

Successive growth factors:

~~~text
states:
4x4 -> 4x5  ~10.89x
4x5 -> 4x6   ~6.74x
4x6 -> 4x7   ~5.10x

recursive classes:
4x4 -> 4x5  ~10.53x
4x5 -> 4x6   ~6.48x
4x6 -> 4x7   ~4.88x
~~~

The falling factors are useful bounded evidence, but four heights remain far
too little to infer a polynomial or other asymptotic law. The absolute graph
still reaches millions of states at 28 cells.

## Interpretation

The 4x7 success removes the previous uncertainty about whether sparse transport
would merely move the memory wall from 4x6 to the next height. It does not
remove the complexity wall: structural-state construction remains the dominant
burden.

The compact evaluator materially improves the feasibility of bounded growth
controls without altering their semantics. It is therefore the preferred
growth-only measurement path; the full evaluator remains useful for diagnostics.

## Non-claims

This result does not establish polynomial structural-state growth, polynomial
generalized Connect Four, an XOR W/D/L formula, or production-solver
applicability.
