# Column canonicalization refinement — exact bounded controls

**Status:** bounded exact structural/canonicalization evidence  
**Research direction:** Joshua Oshiro  
**Experimental branch:** `research/nim-control-parity-algebra-20260929`  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Question

Direct residual-orbit construction originally canonicalized every structural
state by enumerating all column permutations. That is exact but contributes a
factorial width term to the implementation.

This campaign tests whether rule-derived column incidence can reduce that
search without using solved outcomes.

## First-order refinement audit — 4x4 Connect-4

On the rewritten 4x4 structural graph:

~~~text
structural states          9,441
nonterminal audited states 9,430
recursive classes          8,242
~~~

Iterated column-incidence color refinement certified an exact, search-free
canonical signature on:

~~~text
search-free states  9,412
fallback states         18
search-free fraction 99.8091%
canonical collisions     0
maximum iterations        3
~~~

Every fallback had two color classes, maximum tie size 2, and a naive
within-class permutation-search upper bound of 4.

The audit does not assume that equal refinement colors are freely swappable:
it verifies the tie automorphisms exactly before calling a state search-free.

## Second-order ordered-pair refinement

A stronger ordered column-pair refinement was qualified on the same graph.

Result:

~~~text
audited states       9,430
search-free states   9,412
fallback states          18
canonical collisions      0
maximum iterations         4
~~~

Thus it resolved **0 of the 18** first-order fallbacks.

This is negative evidence against the hypothesis that the remaining ambiguity
is merely missing local/pairwise incidence detail. Stronger local refinement
did not separate the family.

## Exact partitioned canonicalizer

The qualified exact canonicalizer uses first-order refinement only to partition
and order distinguishable column-color classes. It then exhaustively enumerates
permutations **inside each unresolved tie class**.

Therefore it does not assume that refinement is complete. The procedure remains
exact while reducing the candidate set from all width-factorial permutations to
the product of factorials of the unresolved color-class sizes.

Exact 4x4 qualification reproduced the full compact/full structural result,
including:

- residual state count;
- literal and duplicate-equivalent edge counts;
- recursive class count;
- W/D/L split count;
- root value and root child counts;
- earliest merge rank;
- complete frontier;
- complete dynamic-merge-by-rank data.

## Matched 5x4 benchmark

The original compact 5x4 run used all 120 column permutations and measured:

~~~text
elapsed 208.76 s
RSS     ~213.5 MB
~~~

The partitioned exact rerun, workflow `36554956756`, measured:

~~~text
elapsed                         27.26 s
RSS                            ~283.3 MB
total permutation candidates    1,934,011
maximum candidates/state               24
~~~

It reproduced the exact 5x4 semantic graph:

~~~text
states             289,852
edges             1,079,881
duplicate edges      28,827
recursive classes   251,222
W/D/L splits              0
root                    draw
earliest merge rank        9
~~~

Measured wall-time improvement:

~~~text
speedup              ~7.66x
wall-time reduction  ~86.94%
~~~

Heap use was nearly unchanged (~90.8 MB baseline versus ~92.3 MB refined);
RSS was higher on the refined run. The result is therefore an execution-time
improvement, not a memory or semantic-state reduction.

## Interpretation

The previous statement

~~~text
exact column canonicalization currently requires W! search
~~~

is too pessimistic as an implementation description on the measured controls.
Most column identity is recoverable from rule-derived residual/support incidence,
and exhaustive search can be confined to unresolved color classes.

However:

~~~text
empirically small tie classes
!=
polynomial generalized canonicalization
~~~

The exact partitioned method can still have factorial worst-case cost inside a
large unresolved color class. A generalized bound on tie-class size, or a
compact exact law for coupled tie orientations, remains open.

The 18 unresolved 4x4 fallbacks are therefore scientifically useful rather than
mere failures: they isolate the part of column identity not recovered by local
refinement and provide the next target for algebraic/orbit analysis.

## Non-claims

This result does not prove polynomial generalized Connect Four, polynomial
structural graph size, a polynomial worst-case canonicalizer, an XOR W/D/L
formula, or a production-solver optimization.

## Coupled fallback automorphisms — exact 4x4 audit

The complete 18-state first-order/pair-refinement fallback family was then
audited against all 24 literal column permutations.

For every one of the 18 states:

~~~text
exact automorphism-group size: 2
automorphisms:
  1. identity
  2. simultaneous swap of both unresolved two-column color classes
~~~

No fallback admitted either tied-pair swap independently.

Thus, if the two unresolved pair orientations are encoded as bits `a,b in
GF(2)`, the observed exact symmetry is the diagonal subgroup

~~~text
{(0,0), (1,1)}
~~~

equivalently the parity/equality constraint

~~~text
a xor b = 0
~~~

for the orientation action on each of these bounded states.

This explains why both first-order and ordered-pair local refinement fail: the
remaining ambiguity is not a missing local distinction inside either pair.
The symmetry is coupled across the two pairs. Flipping one pair alone changes
the structural state; flipping both together preserves it.

This is a direct bounded appearance of a GF(2)-like composition law inside the
residual/action-orbit canonicalization problem. It is materially narrower than
an XOR W/D/L law and must not be generalized beyond the audited family without
additional proof.

Open questions now include whether:

- analogous fallback components on larger widths decompose into binary
  orientation variables plus linear GF(2) constraints;
- the constraint graph has polynomially bounded rank/size;
- solving those constraints can replace factorial tie-class enumeration while
  preserving exact residual-state canonicalization.

Negative evidence remains important: the second-order local refinement resolved
none of these states, so any successful generalized rule must represent coupled
orientation transport rather than merely richer independent column features.
