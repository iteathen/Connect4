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


## Guarded binary-tie stabilizer theorem

The 18-state audit also exposes a general algebraic fact that does not depend
on those particular boards.

Assume a structurally refined residual state has `m` unresolved column-color
classes and every unresolved class contains exactly two columns. Give each
class one orientation bit:

~~~text
x_i = 0  -> keep the pair orientation
x_i = 1  -> swap the pair
~~~

The complete within-class permutation group is then

~~~text
G = (Z2)^m = GF(2)^m
~~~

because composing two pair-swap vectors is componentwise XOR.

For a fixed residual/support state `s`, let

~~~text
H_s = { x in G : x(s) = s }
~~~

be the set of within-class flips that preserve the exact structural state.
Because a stabilizer is a subgroup and every subgroup of `GF(2)^m` is a
vector subspace, `H_s` is exactly a binary linear subspace. Therefore there
exists a parity-check matrix `A_s` over `GF(2)` such that

~~~text
H_s = ker(A_s)
~~~

and all exact coupled-orientation symmetries satisfy

~~~text
A_s x = 0.
~~~

This is a guarded deductive result about the **orientation-stabilizer layer**.
It does not depend on solved outcomes or minimax labels.

For the complete 18-state 4x4 fallback family:

~~~text
m = 2
dim(H_s) = 1
H_s = {(0,0),(1,1)}
A_s can be represented by [1 1]
orbit size under G = 2
~~~

so the only surviving nontrivial orientation symmetry is exactly

~~~text
x_1 xor x_2 = 0.
~~~

This is an exact place where XOR composition is derived rather than assumed.

The constructive stabilizer question has now been closed under the same
binary-tie guard.

For each residual requirement, the implementation records only:

- its player;
- its orbit-invariant unordered row-pattern pair in each two-column class;
- the orientation bit for each asymmetric pair.

Requirements with the same invariant data form an explicit orientation block
`S_B <= GF(2)^m` on the coordinates they actually use. To recover the exact
translation stabilizer of one block, it is sufficient to choose one
`t_0 in S_B` and test only differences

~~~text
h = t xor t_0,  t in S_B
~~~

because any translation preserving `S_B` must send `t_0` to another member
of `S_B`. Valid translations are row-reduced over GF(2); inactive
coordinates are free; parity checks from all blocks are then intersected by
ordinary GF(2) elimination.

Thus the constructive method is polynomial in the explicitly represented
residual family and the number of binary tie coordinates. It does **not**
enumerate all `2^m` orientation assignments.

Exact 4x4 qualification over the complete 18-state fallback family produced:

~~~text
fallback states                 18
pair-count set                 [2]
stabilizer dimensions          [1]
parity-check sets             [11_2]
exact orientation sets        [{00,11}]
constructive matches exact     true
unrepresented exact autos         0
~~~

So the derived incidence construction independently recovers the same
`x_1 xor x_2 = 0` stabilizer on every fallback.

The remaining canonicalization question is narrower: use these affine
constraints to select an exact canonical orientation without binary
orientation enumeration, and retain an exact fallback for unresolved classes
larger than two. Tie classes larger than two remain non-abelian symmetric-group
problems in the general case.

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

- analogous fallback components on larger widths remain binary after
  refinement often enough to dominate the practical canonicalization cost;
- the number and size of nonbinary tie classes admit a useful generalized
  bound;
- the affine GF(2) canonicalizer can be implemented economically enough to
  improve large-width runs rather than only their asymptotic representation.

Negative evidence remains important: the second-order local refinement resolved
none of these states, so any successful generalized rule must represent coupled
orientation transport rather than merely richer independent column features.

## Exact affine binary-tie canonicalization

The binary stabilizer construction was then extended from symmetry detection
to exact canonical orientation.

Let `X <= GF(2)^m` be the affine set of pair-flip vectors still compatible
with canonical choices already made. For each invariant residual-orbit block
`S_B`, the canonicalizer:

1. projects `X` onto the block's active tie coordinates;
2. for every explicit `v in S_B`, finds the minimum member of the affine
   coset `v + proj(X)` by GF(2) row reduction;
3. tests only translations capable of attaining the minimum first block
   element, at most one candidate per explicit block vector before
   deduplication;
4. selects the lexicographically minimum translated block;
5. intersects `X` with the affine coset of the block's exact translation
   stabilizer that preserves that minimum image.

After all blocks are fixed, any remaining free directions are exact state
stabilizers, so every remaining solution serializes to the same residual state.

Therefore, when every unresolved refinement class has size at most two, exact
within-class canonical orientation is computed with polynomial work in the
explicit residual representation and the number of tie pairs. No `2^m`
orientation sweep is required.

If any refinement class has size greater than two, the implementation falls
back to the already-qualified refinement-partitioned exhaustive canonicalizer.
Thus the combined method is exact for every current input while the polynomial
claim is intentionally guarded to the all-binary-tie case.

The rewritten 4x4 control was qualified against both the full-permutation and
partitioned canonicalizers. It reproduced all scalar semantics, the complete
rank frontier, and the complete dynamic-merge-by-rank result.

## Matched 5x4 affine benchmark

The affine method was then run on the same 5x4 Connect-4 control at workflow
`36557049257`, producer head
`9d984e498b092fa13b5a289fe6b69d998a188372`.

It exactly reproduced the prior partitioned run:

~~~text
direct states          289,852
edges                 1,079,881
duplicate edges          28,827
recursive classes       251,222
W/D/L splits                  0
root                         draw
earliest merge rank             9
complete frontier            equal
dynamic-merge-by-rank        equal
~~~

Canonicalization work changed from:

~~~text
partitioned exhaustive permutation candidates   1,934,011
affine nonbinary fallback permutation candidates   517,038
reduction                                           73.27%

binary affine canonicalizations                    928,658
nonbinary fallback canonicalizations                80,680
binary share of those calls                         92.01%
binary block-translation candidates              2,353,268
maximum block candidates in one call                    34
~~~

So the structural objective succeeded: most 5x4 canonicalization calls were
handled without binary orientation enumeration, and exhaustive permutation
work fell by more than 73%.

The current implementation is **not** a speed optimization on this control:

~~~text
partitioned elapsed   27.2599 s
affine elapsed        38.3523 s
wall-time change        +40.69%

partitioned RSS       283,312,128 bytes
affine RSS            388,780,032 bytes
RSS change               +37.23%

partitioned heap       92,294,720 bytes
affine heap           100,626,544 bytes
heap change                +9.03%
~~~

The reason is visible in the diagnostics: the affine implementation replaces
about 1.42 million exhaustive permutation candidates but performs about
2.35 million explicit block-translation candidate checks plus repeated GF(2)
constraint work. Polynomial structure alone does not make the present
implementation cheaper at width five.

This is important negative evidence. The affine method should not be promoted
as a runtime optimization and does not yet justify rerunning the 6x4 timeout
case. The next execution question is whether its block/linear-algebra overhead
can be reduced or selectively invoked only when it beats the small exact
partitioned search.

## Non-claims

The guarded polynomial result concerns canonical orientation only when every
unresolved refinement class has size at most two. It does not bound the number
of direct structural states, eliminate nonbinary symmetric-group cases, prove
polynomial generalized Connect Four, derive W/D/L by XOR, or justify production
solver adoption.

