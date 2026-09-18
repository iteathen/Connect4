# CPC–residual middle isomorphism checkpoint

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Result

The standard-7x6 GF(2) middle-dimension equality is no longer only a cardinality coincidence and no longer only a perfect dual pairing. There is now an explicit Connect4-defined natural isomorphism

```text
T : Y_line -> Y_cell
```

constructed from the two native proof-grammar ingredients already present in the repository:

- `R`: residual cofactor / deletion boundary;
- `P`/CPC: future-event rank parity under gravity support order.

The theorem remains target-free with respect to 28 and 69: the primitive structural inputs are GF(2), `K=4`, `H=6`, `W=7`; geometry derives the line universe.

## Corrected middle spaces

The earlier one-axis proposals remain falsified:

```text
rank(column parity | im(B)) = 4, not 7
rank(horizontal-row line parity | ker(B)) = 5, not 6
```

The corrected spaces are

```text
Y_cell = ker((row parity + column parity) | im(B)), dim 28
Y_line = ker(vertical-line parity | ker(B)),             dim 28.
```

No arbitrary Gaussian basis matching defines the theorem below.

## The CPC residual weight

Let `S` be a unique degree-3 residual fragment of an original Connect-4 winning line. Define:

```text
C(S) = size of the minimal gravity support closure of S
r(S) = highest row occupied by S
q(S) = C(S) + r(S) mod 2.
```

This `q` has a direct CPC meaning. Choose any highest cell `t` of `S` as the final event after all other cells in the minimal support closure. Immediately before `t`,

```text
ply = C(S) - 1.
```

For standard 7x6, CPC gives

```text
N(t) = (W-1)H - ply + r(t) + 1
     = 36 - (C(S)-1) + r(S) + 1
     = 38 - C(S) + r(S).
```

Therefore over GF(2):

```text
q(S) = N(t) mod 2.
```

The target column cancels exactly as in CPC, so the value is independent of which highest residual cell is chosen.

This is **event-rank parity**, not the eventual-owner bit `(N-1) mod 2`. The distinction is load-bearing: weighting the residual form by `q` has rank 28 on the line core, while weighting by `q XOR 1` has rank 16.

## R/CPC line self-pairing

Let

```text
D = partial_4 : C4 -> C3
```

be the residual cofactor boundary from winning lines to degree-3 residual fragments, and let `Q` be the diagonal operator with diagonal `q(S)`.

Define on `Y_line`:

```text
gamma(y,z) = (D y)^T Q (D z).
```

The executable control derives:

```text
rank(gamma | Y_line) = 28.
```

So `gamma` is a nondegenerate, gravity-aware, CPC-weighted residual self-pairing. This is the missing self-duality that the ordinary line dot product and unweighted `D^T D` failed to provide.

## Cross pairing and why both ingredients matter

For an incident cell `c` of winning line `l`, cofactor the cell and let

```text
S = l \\ {c}.
```

Let `connected(S)` be 1 exactly when the three residual cells remain contiguous along the original line (endpoint deletion), and 0 when the residual is split by deleting an interior cell.

Define the cell-line incidence weight

```text
w(c,l) = q(S) XOR connected(S).
```

The induced pairing

```text
beta : Y_cell x Y_line -> GF(2)
```

has rank 28. Neither ingredient is sufficient by itself:

```text
q only:                 rank 20
residual connectedness: rank 16
q XOR connectedness:    rank 28.
```

This makes the structural interaction explicit: CPC/event order and residual/cofactor topology are both load-bearing.

## Direct natural isomorphism

Use the two nondegenerate maps to the same dual space:

```text
gamma_flat : Y_line -> Y_line^*
beta_flat  : Y_cell -> Y_line^*.
```

Define

```text
T = beta_flat^{-1} o gamma_flat.
```

Equivalently, `T(y)` is the unique cell-core vector such that

```text
beta(T(y), z) = gamma(y, z)
```

for every `z in Y_line`.

The executable finite control proves:

```text
rank(T) = 28
T(Y_line) = Y_cell
beta_flat o T = gamma_flat
```

and verifies left-right reflection equivariance.

The control also independently changes the arbitrary Gaussian bases of both 28-spaces by invertible transvections and reconstructs the same ambient map. Therefore the Gaussian basis is only an execution representation; it is not the definition of `T`.

## Theorem boundary

The strongest justified statement is now:

```text
Y_line ~= Y_cell
```

through the explicit Connect4-defined `T` above. Thus the emergent `28` is **not merely a rank coincidence**.

This does **not** yet prove that `T` is the only possible natural isomorphism under every conceivable naturality axiom. The proved claim is existence and explicit construction from board incidence, gravity support, residual cofactor topology, and CPC event-rank parity.

No W/D/L premise is used and no W/D/L conclusion follows from this linear-algebra theorem by itself.

## Symmetry interpretation

Left-right board reflection is respected. Top-bottom reflection is intentionally not imposed: gravity/support order is part of the theorem data, and Connect4 is strategically asymmetric vertically. The earlier top-bottom fixed-space mismatch therefore remains only a falsifier for a bare-`B` incidence isomorphism, not for this support-graded Connect4 isomorphism.

## Consequence for the missing calculus

The previously observed gap can now be stated sharply:

```text
bare incidence alone        -> equal dimension but no natural direct map
residual topology alone     -> insufficient
CPC event parity alone      -> insufficient
R + gravity + CPC parity    -> nondegenerate self-pairing and direct T
```

The next structural question is no longer whether a natural 28-dimensional object exists. It is how this identified `Y` interacts dynamically with `P`, residual degree descent, and the proof calculus—and whether the corrected boundary quotients admit equally natural splittings.
