# External structural-isomorph audit for the Connect-4 decomposition

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Audit proposed mathematical systems that appear to share the Connect-4 decomposition. The word **isomorph** is used only when the actual vector spaces/maps/couplings can be identified, not merely when dimensions or polynomial counts look similar.

The current Connect-4 static backbone is

```text
P_phase <- L_lines -> C_cells -> U_axis
```

with the additional derivative/tensor decomposition

```text
A_n = span of length-4 windows in F2^n
Q_n = F2^n / A_n
H/V span = A_W tensor F2^H + F2^W tensor A_H
full geometry = H/V span + diagonal mixed-derivative residues.
```

The dynamic extension adds support-chain transport, response consumption, CPC parity and deadline/NDC structure.

## 1. Tensor/check-product codes over F2 — exact subsystem isomorphism

Let

```text
C_W = A_W subset F2^W
C_H = A_H subset F2^H.
```

Coding theory defines the check-product/sum code

```text
C_W boxplus C_H
 = C_W tensor F2^H + F2^W tensor C_H.
```

This is exactly the Connect-4 horizontal/vertical winning-line span:

```text
Hspan + Vspan
 = A_W tensor F2^H + F2^W tensor A_H.
```

Therefore the quotient has the standard tensor-product form

```text
(F2^W tensor F2^H)/(Hspan+Vspan)
 ~= (F2^W/A_W) tensor (F2^H/A_H)
 = Q_W tensor Q_H.
```

This is a genuine structural isomorphism of the axis-only incidence subsystem.

For Connect-4,

```text
dim Q_n = min(n,3),
```

because the one-dimensional code/window generator is

```text
1+x+x^2+x^3 = (1+x)^3 over F2.
```

The Connect-4-specific extra structure is that diagonal line classes inject the two mixed-derivative residue directions into this product-code quotient:

```text
partial_+^3 = XY^2 + X^2Y
partial_-^3 = XY^2 + X^2Y + X^2Y^2.
```

Thus product/check-product coding theory is an exact substrate, but the full Connect-4 geometry is the product-code subsystem plus derived diagonal residue constraints and then game-semantic support/deadline structure.

The frequently suggested identity

```text
L = 2Y + W + H
```

is **not** imported as a generic product-code dimension theorem. In Connect-4 it follows only at the standard balanced 7x6 point from the A4 sector identity.

## 2. Type-A quiver / zigzag persistence — exact classification language

The four Connect-4 spaces/maps themselves form the type-A4 zigzag representation

```text
1 <- 2 -> 3 -> 4
```

with

```text
1=P_phase, 2=L_lines, 3=C_cells, 4=U_axis.
```

Finite-dimensional type-A representations over a field decompose uniquely into interval indecomposables. The resulting interval multiplicities give the exact static barcode already derived in

```text
docs/research/2026-09-14-a4-quiver-structural-decomposition.md.
```

This is currently the strongest exact *whole-static-backbone* comparison. It classifies the existing maps rather than introducing an analogy from outside.

## 3. Toric/surface/CSS codes — close homological analogy, not the same map topology

Surface and CSS codes genuinely use finite-field chain complexes, boundary/coboundary maps, tensor/homological products and kernel/image middle sectors.

However their defining check maps satisfy a chain-complex/orthogonality condition of the form

```text
d_next d_prev = 0
```

(or the equivalent CSS check orthogonality).

Connect-4 generally has

```text
A B != 0.
```

Therefore its static backbone is not a chain complex and its 28 is not a toric logical-qubit count. The useful import is the discipline of decomposing kernels/images and tensor-product residual sectors, not the numerical topology.

## 4. Cartesian-grid incidence/Laplacian systems — exact tensor substrate, incomplete operator

A rectangular grid is a Cartesian product of paths and ordinary graph boundary/Laplacian operators admit Kronecker/tensor decompositions.

This matches the Connect-4 axis-product organization and the interpretation of the row/column parity map as a graph boundary.

But graph incidence is first-order. Connect-4 winning geometry is third-order:

```text
partial_d^3.
```

Diagonals further contribute derived mixed terms. Thus ordinary grid incidence is a factor/substrate rather than an isomorphism of the complete Connect-4 operator.

## 5. Stanley-Reisner rings / independence complexes of grid graphs — research lead, no exact isomorphism established

Stanley-Reisner and edge-ideal methods associate canonical free resolutions and graded Betti/syzygy modules to grid-derived simplicial complexes. This makes them plausible comparison systems for dependency structure and boundary-sensitive homology.

However known rectangular-grid independence-complex results are typically recursive/periodic and can have highly nontrivial width-dependent homotopy behavior. No source inspected so far establishes the specific Connect-4 maps

```text
A_W tensor F2^H + F2^W tensor A_H,
partial_d^3,
A4 zigzag barcode,
response/support transport,
```

as the boundary maps of the relevant Stanley-Reisner resolution.

Therefore claims that their Euler characteristic directly realizes

```text
F(W,H)=sigma(W,H) M(W,H)
```

or that their Betti numbers obey the Connect-4 positive-part formulas are **not established**. Keep this family as a possible source of useful boundary/syzygy invariants, not proof authority.

## 6. Kasteleyn/dimer systems — strong boundary-sector/sign analogy, not outcome-sign isomorphism

Dimer models on periodic lattices use Kasteleyn matrices/Pfaffians. On a torus, different periodic/antiperiodic boundary twists produce distinct Pfaffian sectors, with signs determined by the Kasteleyn/homology structure.

This is a legitimate example of

```text
local periodic bulk operator
+ boundary/topological sector
-> signed global quantity.
```

That architecture is relevant to the current finite-Connect-4 hypothesis that a periodic non-losing bulk response system may leave a finite top-boundary defect.

But a Kasteleyn/Pfaffian sign is not a player-to-win sign, and the dimer partition polynomial is not the Connect-4 line-count polynomial merely because both separate horizontal/vertical/diagonal contributions. No direct isomorphism to `sigma(W,H)` is established.

## 7. Resulting comparison hierarchy

The current strongest relationships are:

```text
EXACT SUBSYSTEM ISOMORPHISM
  check-product code
    ~= horizontal/vertical Connect-4 incidence span

EXACT STATIC CLASSIFICATION
  type-A4 zigzag/quiver barcode
    ~= complete static four-space Connect-4 backbone

EXACT SHARED SUBSTRATE
  Cartesian-product path/grid incidence
    -> first-derivative/tensor infrastructure

CLOSE HOMOLOGICAL ANALOGY
  CSS/surface/homological product codes

BOUNDARY-SIGN ANALOGY
  Kasteleyn/Pfaffian sectors

SYZYGY/BOUNDARY RESEARCH LEAD
  Stanley-Reisner / grid independence complexes.
```

This hierarchy prevents equal-looking formulas from being promoted to isomorphisms without map-level evidence.

## 8. Consequence for the finite-board formula program

The check-product identification explains why positive-part threshold dimensions and tensor residuals appear naturally: they are the dimensions of the one-dimensional length-4 window codes and their quotients.

The A4 barcode then canonically organizes how those geometric dependencies survive phase and axis boundaries.

The remaining unknown is not another static rank decomposition. It is the dynamic operator that attaches

```text
support-chain response transport
+ CPC parity
+ resource compatibility
+ completion-before-deadline
```

to those static sectors and produces the signed game result.

The infinite/semi-infinite paving literature is therefore the most relevant next external comparison: it supplies explicit never-losing response flows whose finite top-boundary truncation may expose the missing signed obstruction.

## Sources / evidence boundary

External references consulted include:

- standard tensor/check-product code descriptions, where `C_A boxplus C_B = C_A tensor F^n + F^m tensor C_B`;
- type-A/zigzag persistence interval decomposition literature;
- grid independence-complex literature showing nontrivial periodic/recursive homotopy behavior;
- Kasteleyn/Pfaffian sign results for periodic boundary sectors;
- CSS/hypergraph-product code literature using tensor products and Kunneth-type homology decompositions.

These sources are comparison evidence only. Connect-4 theorem claims remain derived from the repository's own generated maps and symbolic proofs.
