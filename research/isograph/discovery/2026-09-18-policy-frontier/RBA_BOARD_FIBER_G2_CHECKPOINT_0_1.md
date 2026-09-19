# RBA board-fiber G2 checkpoint 0.1

**Date:** 2026-09-18  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exhaustive rank-30..35 structural test; no authority promotion  
**Research direction:** Josh Oshiro

## Candidate

G2:

> Isomorphic support-conditioned residual-incidence + gravity/frontier structures induce isomorphic residual lattices and legal one-step cofactor neighborhoods.

The tested support fiber contains:

- every future/unoccupied cell;
- directed gravity-chain cover structure;
- a frontier marker on each currently playable cell;
- every unique nonempty residual winning-line hyperedge;
- residual-to-cell incidence.

Rank is derivable from future-cell count.

## Exhaustive census

All standard-7x6 support vectors at ranks 30 through 35 were enumerated.

```text
supports                     43,128
reflection-only classes      21,692
exact structural fibers      20,685

support / fiber ratio         2.085x
reflection / fiber ratio      1.049x
classes removed beyond
horizontal reflection         1,007
largest fiber class              12
```

By rank:

```text
rank   supports   reflection   fibers   reflection/fiber

30      15,330       7,702      7,593       1.014x
31      10,906       5,476      5,335       1.026x
32       7,420       3,736      3,563       1.049x
33       4,809       2,420      2,223       1.089x
34       2,954       1,494      1,294       1.155x
35       1,709         864        677       1.276x
```

The structural quotient beyond reflection becomes stronger near the terminal ranks in this census.

## Exact isomorphism validation

A deterministic structural signature was used only as a bucket/index.

Every bucket was checked by exact colored directed graph isomorphism.

```text
signature buckets split by exact isomorphism      0
non-representative member isomorphism checks  22,443
```

No signature collision survived as a false structural equivalence.

## Load-bearing neighborhood test

For every non-representative member of every exact structural fiber:

1. recover an exact fiber isomorphism;
2. map each legal frontier cell through that isomorphism;
3. play the corresponding legal child move on both supports;
4. verify the remaining future-cell gravity structure;
5. verify the entire child residual-hyperedge family;
6. verify every parent principal residual under both owner-true and owner-false cofactors.

Results:

```text
mapped legal frontier actions                     101,743
static fiber-isomorphism failures                       0
child-fiber failures                                    0
principal true/false cofactor correspondence failures   0
```

Therefore the tested structural isomorphism is not merely a static residual-hypergraph coincidence. It transports the legal one-step residual/cofactor neighborhood exactly.

## Non-reflection example

One rank-30 fiber contains:

```text
[0,1,6,6,6,5,6]
[0,1,6,6,6,6,5]
[5,6,6,6,6,1,0]
[6,5,6,6,6,1,0]
```

These occupy two horizontal-reflection orbits, so the fiber equivalence is strictly stronger than board reflection.

## Structural consequence

For the tested ranks, the support-local residual lattice and one-step coordinate morphisms do not need to be treated as independent primitive objects.

They are recoverable from the smaller board-derived object:

```text
support-conditioned
gravity-chain structure
+
future-cell / residual-line incidence
```

Thus a more board-native RBA factorization is plausible:

```text
board incidence + gravity support fiber
        ↓
residual lattice
        ↓
cofactor / adjoint maps
        ↓
value-boundary algebra
```

## Epistemic status

The implication is also theorem-shaped: an exact isomorphism of the colored incidence/gravity fiber relabels future cells, residual hyperedges, frontier cells, and legal one-cell transformations, so the induced residual-poset/lattice and principal cofactor structure are transported by that relabeling.

The exhaustive census validates the implementation and demonstrates that nontrivial repeated fibers actually occur.

## What is not yet established

- exact strong-value boundary invariance across distinct non-reflection fibers has not yet been independently tested;
- a complete all-rank fiber census has not been run;
- the support-fiber quotient is not yet proved to be the minimal board factorization;
- compact root RBA remains open;
- no authority relation is promoted.

## Next strongest candidate

G3:

> Exact value-boundary semantics depend only on the board-derived structural fiber, not on its concrete embedding in the 7x6 coordinates.

A useful falsifier is to take non-reflection supports in one exact G2 fiber, transport complete abstract q states through the isomorphism, and compare:

- exact action-score vectors;
- Upper/Lower threshold boundaries;
- best-move correspondence under mapped actions.

## Reconnect marker

```text
G2
    PASS on all 43,128 supports ranks 30..35
    22,443 exact member-isomorphism checks
    101,743 mapped legal actions
    zero structural/cofactor failures

next
    G3 exact value-boundary invariance
    on non-reflection G2 fibers
```
