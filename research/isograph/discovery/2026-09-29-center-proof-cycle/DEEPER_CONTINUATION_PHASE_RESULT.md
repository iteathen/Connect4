# Deeper continuation-phase audit — 4x4 Connect-4

**Status:** bounded exact structural evidence; phase law not yet identified  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `8fbb71de855be8b21bac2013e5b25078bb6db037`  
**Workflow:** `36597672280` — success  
**Solved/outcome labels used by producer:** no

## Question

The preceding late-action parity audit falsified ordinary action-permutation
sign as a Connect-Four-specific XOR signal. This audit removes that artifact
by requiring the current phase-free action profile to be exactly identical.

A candidate group must satisfy:

```text
same recursive action-unlabelled class
+ same ordered immediate phase-free child-class profile
+ different recursive action-labelled class
```

Thus no current-node action permutation is needed to align the candidates.
Any remaining difference is inherited from deeper continuation structure.

## Result

Across the direct 4x4 residual-orbit control:

```text
action-unlabelled fibers containing a deeper split    56
identical-profile deeper groups                       65
labelled-class excess across those groups             71
maximum deeper group size                              4

group size 2                                          61
group size 3                                           2
group size 4                                           2

binary groups                                         61
power-of-two groups                                   63
```

The groups occur only at ranks 9 through 12:

```text
rank 9      5 groups    5 binary
rank 10    15 groups   13 binary
rank 11    35 groups   33 binary
rank 12    10 groups   10 binary
```

For the 61 binary groups, compare their ordered recursive action-labelled
child profiles. The number of child slots whose labelled continuation class
changes is:

```text
1 changed slot    46 groups
2 changed slots   12 groups
3 changed slots    3 groups
```

Representative one-slot inheritance:

```text
phase-free profile:  C12,C12,I,I
recursive lift A:    L17,L17,I,I
recursive lift B:    L17,L42,I,I
```

and:

```text
phase-free profile:  C39,C50,C49,C39
recursive lift A:    L62,L85,L73,L86
recursive lift B:    L202,L85,L73,L86
```

The phase-free child class is unchanged in the differing slot; only its
action-labelled recursive lift changes.

## Interpretation

This is a stronger location for the owner's late-XOR hypothesis than raw
response incidence or current-node permutation parity.

The 61 binary groups are not created by permuting the current action slots:
their immediate phase-free profiles are already identical. The dominant
one-slot pattern (46/61) shows that a binary-looking distinction can propagate
recursively through one continuation branch while disappearing under the
action-unlabelled quotient.

That still does **not** establish XOR. A two-element fiber is only a set until
a composition law is derived. The next test must classify the changed child
pairs recursively:

```text
parent deeper phase
    -> child deeper phase
    -> child current-node transporter
    -> child multiplicity/inactive-action erasure
    -> other
```

If the binary residue forms a closed recursive two-sheet structure, then a
`Z2`/GF(2) covering or cocycle becomes a justified object to test. If it
terminates only in arbitrary action relabeling or branch erasure, the apparent
binary phase is representational rather than a latent game-control law.

## Non-claims

- no W/D/L formula;
- no nimber assignment;
- no generalized theorem;
- no claim that binary fibers compose by XOR;
- no polynomial-time construction;
- no production solver change.
