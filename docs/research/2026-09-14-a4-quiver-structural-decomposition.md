# Connect-4 structural backbone as a type-A4 zigzag representation

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Record the canonical decomposition exposed after separating Connect-4 geometry before cross-board isomorphism search.

The important observation is that the principal empty-board linear maps form a finite type-A4 zigzag/quiver representation over `F2`, not a chain complex:

```text
P_phase  <-  L_lines  ->  C_cells  ->  U_axis
              P            B            A
```

Here:

- `L_lines` is the generated geometric winning-line coefficient space;
- `C_cells` is the board-cell space;
- `B` is the line-to-cell incidence map;
- `U_axis` is the row/column parity target space and `A` its boundary/parity map;
- `P_phase` is the width-column phase target and `P` records parity of vertical-line coefficients by column.

The composite `A B` is generally nonzero, so this is not toric-code/CSS homology. The correct standard comparison is a finite zigzag persistence/type-A quiver representation.

Finite-dimensional type-A quiver representations over a field decompose uniquely, up to ordering/isomorphism, into interval indecomposables. The orientation here is `1 <- 2 -> 3 -> 4`; its indecomposables are the contiguous intervals `[i,j]` of the four-node path.

## 1. Existing structural splits are barcode sectors

Number the nodes

```text
1 = P_phase
2 = L_lines
3 = C_cells
4 = U_axis.
```

Only six interval types touch the line node 2:

```text
[2,2]
[1,2]
[2,3]
[1,3]
[2,4]
[1,4].
```

Let `m_ij` be their multiplicities.

### Line kernel / phase split

A line coefficient belongs to `ker B` exactly when its interval does not continue from node 2 to node 3. Hence

```text
ker B = [2,2] ^ m_22  direct-sum  [1,2] ^ m_12.
```

The interval `[2,2]` is killed by both `B` and `P`, therefore

```text
m_22 = dim(ker B intersect ker P) = Y_line.
```

The interval `[1,2]` is killed by `B` but survives through `P`, therefore

```text
m_12 = rank(P | ker B) = rank(Q_phase).
```

Thus the existing exact split

```text
dim ker B = Y_line + rank(Q_phase)
```

is the line-node barcode decomposition into `[2,2]` and `[1,2]` sectors.

### Incidence image / axis split

An interval contributes to `im B` exactly when it crosses the arrow `2 -> 3`.

Intervals that cross `2 -> 3` but terminate at node 3 are

```text
[2,3], [1,3].
```

Their total multiplicity is precisely the cell core:

```text
m_23 + m_13
  = rank B - rank(A B)
  = dim(im B intersect ker A)
  = Y_cell.
```

Intervals that survive through `3 -> 4` are

```text
[2,4], [1,4],
```

with total multiplicity

```text
m_24 + m_14 = rank(A B) = rank(Q_axis).
```

Thus

```text
rank B = Y_cell + rank(Q_axis)
```

is the barcode decomposition of the B-active sector into features that die at the axis boundary and features that survive to it.

## 2. Exact total line-space decomposition

Every line coefficient belongs to exactly one of the six intervals touching node 2. Therefore

```text
L
 = m_22 + m_12 + m_23 + m_13 + m_24 + m_14
 = Y_line + rank(Q_phase) + Y_cell + rank(Q_axis).
```

This identity holds for every positive board dimension because it is simply the quiver decomposition of the same generated maps; narrow-board degeneracies set interval multiplicities to zero automatically.

Equivalently, it is the rank-nullity identity

```text
L
 = dim ker B + rank B
 = (Y_line + rank Q_phase)
   + (Y_cell + rank Q_axis),
```

but the quiver interpretation identifies the terms as canonical isomorphism sectors rather than arbitrary subtractions.

## 3. Standard 7x6 decomposition

For standard Connect-4:

```text
L = 69
Y_line = 28
rank Q_phase = 6
Y_cell = 28
rank Q_axis = 7.
```

Hence

```text
69 = 28 + 6 + 28 + 7.
```

The familiar line-side and cell-side splittings

```text
34 = 28 + 6
35 = 28 + 7
```

are two sides of one A4 interval decomposition.

The existing perfect beta/gamma pairing and natural `T:Y_line -> Y_cell` on 7x6 should now be interpreted as additional coupling data relating:

```text
[2,2] sector
```

to the aggregate death-at-node-3 sector

```text
[2,3] direct-sum [1,3].
```

Equal dimension alone does not imply this coupling; the earlier 5x9 and 13x5 pairing failures remain valid controls.

## 4. Refining the cell core by phase coupling

The aggregate `Y_cell` can itself be canonically split by whether its line-side preimage survives through the phase arrow.

Let `K_P = ker P` inside `L_lines`. Then

```text
m_24 = rank(A B | K_P)
```

and

```text
m_23 = rank(B | K_P) - rank(A B | K_P).
```

The remaining B-active multiplicities are

```text
m_14 = rank(A B) - m_24
m_13 = Y_cell - m_23.
```

Thus the entire line-originating A4 barcode is recoverable from exact rank/intersection invariants of the existing maps; no board-state search is required.

This refinement is a strong next target because it may reveal which part of the 28-cell core is already phase-coupled and which part is phase-neutral.

## 5. Why `L = 2Y + W + H` appears on 7x6

The exact all-board identity is

```text
L = Y_line + Y_cell + rank(Q_phase) + rank(Q_axis).
```

In the regular K=4 regime,

```text
rank(Q_phase) = W-1
rank(Q_axis)  = W+H-6,
```

so

```text
L = Y_line + Y_cell + 2W + H - 7.
```

If the board is core-balanced,

```text
Y_line = Y_cell = Y,
```

then

```text
L = 2Y + 2W + H - 7.
```

The remainder equals the literal dimension sum `W+H` exactly when

```text
2W+H-7 = W+H
<=> W=7.
```

Combining `W=7` with the already-proved regular balance equation

```text
(W-4)(2H-9)=9
```

forces

```text
H=6.
```

Therefore the standard board is the unique regular balanced shape for which

```text
L = 2Y + W + H.
```

On 7x6 this gives

```text
69 = 2*28 + 7 + 6.
```

This is a Connect-4 quiver-sector identity, not a generic toric-code formula.

## 6. Relation to proposed external analogues

### Toric/surface/CSS codes

Useful structural analogy:

- finite-field incidence maps;
- kernels/images;
- homological middle sectors;
- tensor-product/homological-product constructions.

But ordinary CSS/surface-code maps satisfy a chain-complex orthogonality/boundary condition (`boundary after boundary = 0`, equivalently the relevant check composition vanishes). Connect-4 has `A B != 0` in general. Therefore toric-code homology is not the exact native classification of the current maps.

### Cartesian grid graph incidence/Laplacian

Useful exact substrate:

- the rectangular grid is a Cartesian product of paths;
- ordinary graph operators decompose via Kronecker/tensor products;
- this matches the axis-product organization exposed in the incidence decomposition.

But ordinary grid incidence uses first derivatives. Connect-4 winning geometry uses third derivatives `partial_d^3` plus derived mixed diagonal terms. The grid graph is therefore a factor/substrate, not the complete Connect-4 structural system.

### Edge ideals/minimal free resolutions

Potentially useful analogy:

- kernels/syzygies and Betti numbers provide canonical algebraic measures of dependency;
- free resolutions naturally expose hidden relation modules.

No exact isomorphism to the Connect-4 maps or total-domain rank formulas is currently established. Treat this as a research lead, not an authority claim.

### Type-A quiver / zigzag persistence

This is currently the strongest exact comparison for the static linear backbone:

- the four existing Connect-4 spaces/maps already form a type-A4 quiver representation;
- finite-dimensional type-A representations over a field have unique interval decompositions;
- `Y_line`, `Q_phase`, `Y_cell`, and `Q_axis` are directly identifiable with exact interval sectors or sums of sectors.

No extra mathematical object was introduced merely to fit 28; the quiver is the existing map topology written in its standard classification language.

## 7. Neighborhood-preserving isomorphism target

For the static empty-board backbone, the A4 barcode is a canonical isomorphism invariant of the four-space linear representation.

For full game semantics it is insufficient by itself. The dynamic extension must also preserve:

```text
support-chain order
response consumption vector n(F)
phase transport tau(F)
global CPC release parity
resource sharing/exclusion
completion-before-deadline relations.
```

Thus the intended comparison hierarchy is

```text
static derivative/incidence system
  -> A4 interval decomposition
  -> response/support transport attached to sectors
  -> deadline/NDC topology
  -> game-value classification.
```

Whole-board isomorphism should not precede this decomposition.

## External mathematical references used for classification context

- Carlsson & de Silva, *Zigzag Persistence* (type-A zigzag/quiver foundations).
- De Gregorio, Guerra, Scaramuccia & Vaccarino, *Parallel computation of interval bases for persistence module decomposition* (finite-dimensional persistence modules as equioriented type-A quiver representations and interval decomposition).
- Standard CSS/homological-code literature is retained only as structural comparison, not proof authority for Connect-4.

## Proof boundary

The Connect-4 identities in sections 1-5 follow from exact linear maps already defined in the repository plus the standard interval decomposition theorem for finite type-A quiver representations over a field. No solved W/D/L label, optimal move, finite board census, or recursive search is used.

The relation between the A4 barcode and final game value/strong distance remains unproved. The dynamic support/deadline structure is not collapsed into the static barcode.
