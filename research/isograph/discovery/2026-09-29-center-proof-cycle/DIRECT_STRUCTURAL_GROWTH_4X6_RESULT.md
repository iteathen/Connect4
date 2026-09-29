# Direct structural growth — 4x6 Connect-4

**Status:** bounded rule-only structural growth result  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Producer head:** `4942017060186de86b66f624d48f1e323ec6efcf`  
**Workflow:** `36552138120` — success  
**Solved/outcome labels used by producer:** no  
**Physical board enumeration:** no

## Producer

The run uses the direct structural system only:

- normalized residual-antichain cofactor transitions;
- support/gravity legality;
- action-label orbit canonicalization with sparse on-demand mask transport;
- nonterminal frontier blocker elimination;
- mover final-event cap-parity elimination;
- one reverse-topological action-unlabelled quotient pass.

Fixed-point-round diagnostics were disabled for this growth measurement.

## Result

~~~text
board                          4x6 Connect-4
cells                          24
winning lines                  24

direct residual-orbit states   693,284
literal structural edges     2,197,552
duplicate equivalent edges      42,933
recursive classes              562,550
W/D/L-split classes                  0

root value                           draw
root legal actions                      4
root distinct orbit children             2
root distinct recursive children         2

earliest dynamic merge rank              9
~~~

GitHub-hosted Node 26 measurement:

~~~text
elapsed       56.23 s
RSS           ~1.19 GB
heap used     ~1.04 GB
array buffers ~0.14 MB
~~~

The tiny array-buffer count confirms that the former `2^cells` permutation-
remap tables are no longer responsible for the growth.

## Frontier

The structural state frontier peaks at rank 15:

~~~text
rank 15: 137,590 states / 111,001 recursive classes
~~~

The class frontier peaks one rank earlier:

~~~text
rank 14: 131,027 states / 117,087 recursive classes
~~~

Late ranks again collapse sharply:

~~~text
rank 18: 22,026 states / 8,675 classes
rank 19:  5,744 states / 1,627 classes
rank 20:    899 states /   180 classes
rank 21:    132 states /    25 classes
rank 22:     10 states /     7 classes
rank 23:      3 states /     3 classes
rank 24:      2 states /     2 classes
~~~

## Height-growth comparison at fixed width and K

| Board | Cells | Direct states | Recursive classes | Direct edges |
|---|---:|---:|---:|---:|
| 4x4 C4 | 16 | 9,441 | 8,242 | 29,351 |
| 4x5 C4 | 20 | 102,815 | 86,791 | 325,038 |
| 4x6 C4 | 24 | 693,284 | 562,550 | 2,197,552 |

Successive state-growth factors:

~~~text
4x4 -> 4x5: ~10.89x
4x5 -> 4x6:  ~6.74x
~~~

Successive recursive-class growth factors:

~~~text
4x4 -> 4x5: ~10.53x
4x5 -> 4x6:  ~6.48x
~~~

The second factor is materially smaller than the first, but three heights are
far too little evidence to infer an asymptotic law.

## Interpretation

The structural graph continues to be much smaller than the corresponding
physical game representation would be, and it can be generated without solved
labels or physical-board enumeration.

However, 693,284 structural states at only 24 cells remains entirely compatible
with exponential generalized growth. Nothing here establishes polynomial-size
state construction.

The relevant complexity question is now empirical and structural:

~~~text
How does the direct residual/action-orbit graph grow
after exact realizability closures and compact canonicalization?
~~~

rather than whether the physical game graph can be quotient-compressed after
enumeration.

## Next bounded control

A 4x7 Connect-4 run is now technically possible because the sparse transporter
removed the explicit exponential mask-remap tables. It should be treated as a
bounded growth probe with timeout/memory walls recorded as evidence, not as a
required success.

Before drawing any generalized complexity conclusion, additional dimensions and
rule-derived reductions are required.

## Non-claims

This result does not prove polynomial generalized Connect Four, an XOR W/D/L
formula, a standard-7x6 closed form, or production-solver applicability.
