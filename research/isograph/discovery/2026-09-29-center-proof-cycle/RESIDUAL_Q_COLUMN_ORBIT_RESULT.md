# Residual-q column-orbit carrier audit — exhaustive 4x4

**Status:** bounded exact rule-derived evidence  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `1b2e1e71cbe5b3d075f93dffe1056a2717f1f5d5`  
**Workflow:** `36547940338` — success  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Question

The current qualified Connect4 semantic package defines the orientation-sensitive
ordinary carrier `q_o` from:

```text
support
+ normalized P0 residual antichain
+ normalized P1 residual antichain
```

with literal column orientation retained.

The exhaustive 4x4 action-unlabelled quotient shows that literal action labels
are much finer than perfect-play/value behavior. This experiment asks whether a
large part of that gap can be removed **structurally**, without W/D/L labels, by
canonicalizing the residual carrier under action-label permutations.

This is a bounded 4x4 control using the same residual-antichain semantics. It
does not extend the qualified standard-7x6 authority by itself.

## Producer

For every legal first-win-stopped 4x4 Connect-4 state:

1. derive support heights;
2. derive each player's live residual winning requirements;
3. normalize each residual family by duplicate removal and strict-superset
   absorption;
4. preserve shared future cells exactly;
5. form the orientation-sensitive residual signature;
6. apply all 24 permutations of the four column labels to support and residual
   cells together;
7. select one canonical representative of that column orbit.

No minimax value or solved outcome is used to form the signatures.

The resulting signature is compared afterward with the independently
constructed recursive action-unlabelled class.

## Result

```text
physical states                              161,029

orientation-sensitive residual-q classes     34,105

column-permutation residual-q orbits          10,507

recursive action-unlabelled classes            8,242

orbit signatures spanning >1
recursive class                                    0

states in a split orbit signature                  0

recursive classes containing >1
residual-q orbit                               1,050

maximum residual-q orbits inside one
recursive class                                    30
```

Thus every tested residual-q column orbit is contained wholly within one
recursive action-unlabelled class.

In the finite control:

```text
equal column-orbit residual-q signature
    -> equal recursive action-unlabelled class
```

with zero counterexamples across all 161,029 states.

## Compression decomposition

Static action-label erasure removes most of the orientation-sensitive residual
distinctions:

```text
34,105 orientation-sensitive classes
   -> 10,507 global column-orbit classes
   ->  8,242 recursive unlabeled classes
```

The first step removes about 69% of the orientation-sensitive residual classes.

The static orbit carrier is still finer than the recursive quotient:

```text
10,507 - 8,242 = 2,265
```

and 1,050 recursive classes contain multiple static orbit signatures.

Therefore a **single global column permutation** explains a large fraction, but
not all, of the observed branch equivalence.

## Structural interpretation

This suggests a useful decomposition:

```text
orientation-sensitive q-like behavior
    -> erase one fixed global action transporter
    -> static residual-q orbit
    -> permit branch-local re-identification of actions
    -> recursive unlabeled fixed point
```

The final step is more general than ordinary geometric symmetry or one fixed
column permutation. The recursive quotient may match one action to another at
one node and use a different matching after the successor transition.

That makes the residual gap naturally resemble a **local action-transporter
system / bisimulation**, rather than a single global symmetry group.

This is compatible with the owner's branch-and-collapse requirement:

```text
one value/control class
    -> multiple physical actions
    -> successor-specific action correspondence
    -> later collapse/reconvergence
```

It also explains why the earlier linear `partial^2` sibling-delta gauge failed:
the relevant identification need not be one fixed GF(2) subspace of physical
move coordinates.

## Relation to the XOR hypothesis

This result neither proves nor falsifies XOR/GF(2) composition.

It narrows where such a law could live. If XOR participates in the final hidden
control algebra, it is more likely to compose **guarded residual/control
objects after action identity has been quotiented**, rather than directly
quotienting literal move coordinates.

The remaining 2,265-class static-to-recursive gap is now a concrete target for
control parity, obligations, shared resources, deadlines and recursive implicit
assertions.

## Complexity discipline

The present canonicalizer enumerates all `4! = 24` column permutations. That is
acceptable for this finite control but is not a polynomial generalized-width
construction.

Accordingly:

```text
sound finite column-orbit carrier
!=
polynomial generalized canonicalizer
```

A future construction would need either a direct canonical form or a
partition/refinement procedure whose complexity is established independently.

## Next experiment

Analyze the 1,050 recursive classes that contain multiple static residual-q
orbits.

Measure:

- rank distribution of those residual merges;
- number of static orbits per recursive class;
- whether the different static orbits admit a consistent permutation only
  **after** one or more actions;
- whether the merge is explained by duplicate child-class sets;
- whether control parity, residual requirement multiplicity, shared-resource
  incidence or deadline structure is invariant across the merged orbits.

The decisive question is whether branch-local transporter changes can be
generated by a compact rule-derived closure rather than by recursive traversal
of the full game graph.

## Non-claims

This is a finite 4x4 structural result. It is not a generalized theorem, not a
polynomial-time solver, not an XOR W/D/L formula, and not a production
optimization.
