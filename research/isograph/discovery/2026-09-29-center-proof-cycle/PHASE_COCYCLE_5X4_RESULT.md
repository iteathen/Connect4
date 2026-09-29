# 5x4 Connect-4 binary phase cocycle falsifier

**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Workflow:** `36607300107` — SUCCESS  
**Job:** `109539467036` — SUCCESS  
**Tested head:** `909574c54dca139e732a4a7872e3ef869af82501`  
**Producer uses solved W/D/L labels:** no  
**Physical-board enumeration:** no  
**Authority effect:** none

## Purpose

The 4x4 and 4x5 Connect-4 binary continuation carriers were integrable over
GF(2), with respectively 1/1 and 40/40 independent cycle syndromes equal to
zero.

This width/height perturbation keeps 20 cells and Connect-4 but changes the
geometry from 4x5 to 5x4.

The experiment uses:

```text
width=5
height=4
k=4
nonterminalFrontierBlocker=true
moverFinalCapParity=true
measureLocalBranchClosure=false
```

No solved outcomes, opening books, best-move tables, or solved databases are
producer inputs.

## Structural result

```text
residual-orbit states                 289,852
literal structural edges            1,079,881
recursive action-unlabelled classes   251,222
recursive action-labelled classes     262,713
labelled class excess                  11,491

deeper groups                           5,152
binary deeper groups                    4,464
deeper labelled-class excess            6,271
maximum deeper group size                  17
```

Across the 4,464 binary groups:

```text
changed child pairs                   7,306

binary continuation                   4,221
nonbinary continuation                1,364
action transporter                    1,458
branch/multiplicity erasure             263
terminal/unknown                          0
```

## Relative GF(2) inheritance graph

The 4,221 binary continuation edges are exact two-sheet bijections.

Under the deterministic local gauge:

```text
delta = 0    3,104 edges
delta = 1    1,117 edges
```

There are many repeated same-map directed transitions:

```text
parallel directed pairs                169
duplicate same-map edges               195
conflicting parallel pairs               0
```

After collapsing duplicate same-map edges:

```text
reduced inheritance edges            4,026
active binary phase nodes            3,665
active weak components                 283
largest weak component               2,383 nodes

branching points                        932
joining points                          899
active sources                        1,569
active sinks                            761
longest inherited chain                   6 edges
```

## Decisive falsifier

Unlike 4x4 and 4x5, the 5x4 carrier is **not globally integrable**:

```text
reconvergent source/target pairs        568
topological reconvergences              568

path-independent reconvergences         556
contradictory reconvergences             12

cycle rank                              644
zero cycle syndromes                    619
nonzero cycle syndromes                  25

global phase potential exists         false
```

The gauge-flip invariant check still passes, so the obstruction is not caused
by the arbitrary naming of local sheets.

Therefore the current scalar GF(2) phase-potential hypothesis does not survive
this width perturbation.

## Interpretation

This is strong negative evidence and must narrow the hypothesis.

The earlier positive results remain exact within their measured scopes:

```text
4x4 Connect-4:  cycle rank   1, nonzero syndromes  0
4x5 Connect-4:  cycle rank  40, nonzero syndromes  0
5x4 Connect-4:  cycle rank 644, nonzero syndromes 25
```

So:

```text
finite width-4 integrability
!=
general Connect-4 integrability
```

At least one of the following is true:

1. the binary continuation phase is intrinsically geometry/width-guarded;
2. the 5x4 carrier is missing an additional variable needed to lift the
   obstructed cycles into a larger flat phase space;
3. a scalar GF(2) phase is too small and the correct late algebra has higher
   dimension or non-binary structure;
4. the width-4 zero-syndrome behavior is a special structural property rather
   than the generalized Connect-Four law.

The result does **not** invalidate the already-established binary stabilizer XOR
law or the raw response-incidence GF(2) relation; those are different scoped
objects.

## Performance

GitHub-hosted Node 26:

```text
structural run elapsed      179.945 s
RSS                         757,510,144 bytes  (~723 MiB)
heap used                   576,460,048 bytes  (~550 MiB)
```

The run completed inside the unchanged 10-minute bound.

## Immediate follow-up

The next step is not to add a patch that forces flatness.

Extract explicit witnesses for:

- at least one contradictory reconvergent pair;
- at least one nonzero cycle syndrome;
- the involved deeper-group ranks/profiles and edge maps.

Then ask whether the obstruction is explained by:

- a missing realizability/support/deadline variable;
- loss of a transport orientation;
- a higher-dimensional GF(2) phase;
- or genuinely non-abelian late continuation structure.

A corrected carrier must explain the 25 obstructions structurally; it may not
discard them by destructive normalization or outcome labels.
