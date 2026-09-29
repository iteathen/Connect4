# Recursive continuation-phase inheritance — 4x4 Connect-4

**Status:** bounded exact structural evidence; intrinsic phase law still open  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `7b141dbe7fefb7fa602ad4a2d03756b068c9903d`  
**Workflow:** `36598111645` — success  
**Solved/outcome labels used by producer:** no

## Purpose

The deeper-continuation audit found 65 groups that share both:

```text
same recursive action-unlabelled class
+ same ordered immediate phase-free child-class profile
```

yet retain multiple recursive action-labelled lifts. This removes the generic
current-node action-permutation explanation.

This follow-up traces every changed child pair in the 61 binary deeper groups
to determine whether the distinction recursively continues as the same kind of
deeper phase or terminates in ordinary representation effects.

## Result

Across the 61 binary deeper groups:

```text
changed child pairs                         79

binary deeper-continuation edges            31
nonbinary deeper-continuation edges          3
child action-transporter edges              23
child branch/multiplicity-erasure edges     22
terminal/unknown edges                       0
```

Number of binary-continuation edges emitted by one parent binary group:

```text
0 continuation edges    33 groups
1 continuation edge     25 groups
2 continuation edges     3 groups
```

The underlying deeper-group census remains:

```text
split action-unlabelled fibers    56
identical-profile deeper groups   65
group size 2                      61
group size 3                       2
group size 4                       2
```

and the binary changed-slot distribution is:

```text
1 changed slot    46 groups
2 changed slots   12 groups
3 changed slots    3 groups
```

## Interpretation

The deeper binary-looking distinction is not solely a one-level artifact.
Thirty-one changed child pairs enter another same-profile binary continuation
group, so part of the distinction is recursively inherited after current-node
action labels have already been factored out.

However, the inheritance is not globally closed:

- 23 changed child pairs reduce to ordinary child action transporters;
- 22 reduce through branch/multiplicity or inactive-action erasure;
- 3 enter nonbinary deeper groups.

Therefore:

```text
deeper binary fiber
    !=
globally closed Z2 covering
```

at least under the present carrier.

The surviving 31 binary-to-binary edges are the next relevant object. A useful
XOR/cocycle test must operate on their **recursive inheritance graph**, not on
raw response incidence and not on current-node permutation sign.

The next question is whether binary inheritance chains have a conserved
two-valued phase under composition until they terminate, and whether
reconvergent paths carry path-independent phase. A path-independent XOR
syndrome would be substantive; a contradiction at a reconvergence would
falsify this candidate placement.

## Relation to BSFP

No BSFP W/D/L fact is used here. BSFP remains relevant only as parallel
backward closure/proof machinery that may later help classify why a recursive
phase terminates or becomes irrelevant.

## Non-claims

- no XOR W/D/L law;
- no scalar nimber;
- no proof that the 31 edges form a group action;
- no generalized-board theorem;
- no polynomial construction;
- no production solver change.
