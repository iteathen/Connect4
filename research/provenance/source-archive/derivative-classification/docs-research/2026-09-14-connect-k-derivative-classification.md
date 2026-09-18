# Connect-K derivative classification and why Connect-4 is special

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Classify which parts of the current Connect-4 difference algebra are consequences of general Connect-K geometry and which are genuinely special to K=4.

This is an independent structural branch. It does not consume solved W/D/L data and does not modify the active solved-database discovery lane.

## 1. General one-dimensional winning-window polynomial

For Connect-K define

```text
S_K(T)=1+T+...+T^(K-1).
```

Write

```text
K=2^s m
```

with `m` odd. Over `F2`,

```text
T^K+1=(T^m+1)^(2^s).
```

Because `m` is odd,

```text
T^m+1=(1+T) S_m(T).
```

Therefore

```text
S_K(T)
  =(T^K+1)/(T+1)
  =(1+T)^(2^s-1) S_m(T)^(2^s).
```

Since

```text
S_m(1)=m mod 2=1,
```

the exact multiplicity of the finite-difference factor `partial=1+T` is

```text
nu(K)=2^(v2(K))-1.
```

This is an exact factorization theorem, not a sampled pattern.

## 2. Consequences of the 2-adic factor

The derivative hierarchy contained in a Connect-K window is controlled exactly by `v2(K)`.

```text
K odd               -> no partial factor
K = 2 mod 4         -> exactly partial^1
K = 0 mod 4, not 8  -> exactly partial^3
K = 0 mod 8, not 16 -> exactly partial^7
...
```

In particular:

```text
partial divides S_K      iff K is even
partial^2 divides S_K    iff 4 divides K
partial^3 divides S_K    iff 4 divides K.
```

Thus a two-cell adjacent response factor is intrinsic to every even-K window, while the second-difference/Laplacian layer first becomes intrinsic at K=4.

## 3. Pure derivative windows occur exactly at powers of two

The residual factor `S_m(T)^(2^s)` disappears exactly when `m=1`.

Therefore

```text
S_K(T)=(1+T)^(K-1)
```

iff

```text
K is a power of two.
```

Connect-4 is therefore the smallest nontrivial Connect-K game whose complete one-dimensional winning-window incidence is a pure higher derivative beyond the adjacent-pair case:

```text
S_4(T)=(1+T)^3=partial^3.
```

There is no hidden odd/cyclotomic factor in the one-dimensional geometry.

## 4. Universal window-space dimension and periodic quotient

Let `E_n=F2^n` and let `A_(n,K)` be the span of all generated length-K interval vectors.

There are

```text
a=(n-K+1)_+
```

such vectors. They are linearly independent by their leftmost pivot, hence

```text
dim A_(n,K)=(n-K+1)_+.
```

Therefore

```text
dim(E_n/A_(n,K))=min(n,K-1).
```

For `n>=K`, consecutive window relations give

```text
[e_(j+K)]=[e_j].
```

So the residual coordinate quotient is K-periodic for every K.

Periodicity is therefore universal; pure derivative structure is the power-of-two specialization.

## 5. Two-dimensional horizontal/vertical tensor decomposition for arbitrary K

For a `W x H` board define

```text
a=(W-K+1)_+
b=(H-K+1)_+.
```

The total generated line count is

```text
L_K(W,H)=H*a + W*b + 2ab.
```

The horizontal and vertical incidence spans are

```text
A_(W,K) tensor F2^H
+
F2^W tensor A_(H,K).
```

Their quotient inside the cell space is

```text
Q_(W,K) tensor Q_(H,K)
```

with dimension

```text
min(W,K-1) * min(H,K-1).
```

Thus for every K the diagonal direction classes can change incidence rank only inside this small tensor residue.

The check-product/tensor-code isomorphism is therefore not peculiar to K=4; the unusually small derivative description of the diagonal residue is.

## 6. Power-of-two diagonal derivative formula

Assume

```text
K=2^s,
r=K-1.
```

Write

```text
X=partial_x=1+T_x
Y=partial_y=1+T_y.
```

After horizontal/vertical reduction,

```text
X^r=0
Y^r=0.
```

For the rising diagonal,

```text
partial_+ = X+Y+XY.
```

Since

```text
r=1+2+4+...+2^(s-1),
```

Frobenius gives

```text
partial_+^r
 = product_(i=0..s-1)
   (X^(2^i)+Y^(2^i)+X^(2^i)Y^(2^i)).
```

Equivalently, before the nilpotent terms are removed,

```text
partial_+^r
 = sum_(a OR b = r) X^a Y^b,
```

where `OR` is bitwise OR on the binary exponents.

After `X^r=Y^r=0`, the surviving mixed terms have

```text
0<=a,b<r,
a OR b=r.
```

Their count is

```text
3^s - 2^(s+1) + 1.
```

For K=4 (`s=2,r=3`) this number is exactly `2`, giving

```text
partial_+^3 = X Y^2 + X^2 Y.
```

For K=8 the corresponding rising-diagonal residue already contains 12 mixed monomials.

Therefore Connect-4 is not only a pure derivative game; it is the smallest nontrivial power-of-two case and has an exceptionally small mixed-diagonal residue.

## 7. The previously missing middle derivative

For K=4:

```text
S_4(T)=partial^3=partial * partial^2
```

and

```text
partial^2=(1+T)^2=1+T^2.
```

The second derivative is a distance-two incidence relation.

On the bi-infinite one-dimensional lattice let

```text
partial*=1+T^-1.
```

Then the mod-2 graph Laplacian is

```text
Delta=partial* partial
     =(1+T^-1)(1+T)
     =T^-1+T.
```

Multiplying by the unit translation `T` gives

```text
T Delta = 1+T^2 = partial^2.
```

Thus, away from finite-path boundary corrections,

```text
second derivative
~= translated F2 path Laplacian.
```

This identifies three structures that had previously been derived separately:

```text
partial
  = adjacent ownership disagreement / local response edge

partial^2
  = distance-two parity / path-Laplacian defect transport

partial^3
  = Connect-4 winning-window incidence.
```

## 8. Implication for the Connect-4 axiom search

The K-classification sharply limits where a missing Connect-4 axiom can still hide.

For K=4:

1. the complete one-dimensional window is already the pure derivative `partial^3`;
2. the adjacent response operator `partial` is an exact factor;
3. the path-Laplacian / distance-two operator `partial^2` is the unique intermediate derivative factor;
4. diagonal third derivatives are already derived from the axis derivative algebra.

Therefore the current structural calculus should explicitly promote `partial^2` to a first-class **derived** operator, but there is no evidence for another missing *linear geometric* primitive between response edges and winning windows.

Any remaining missing law is more likely to belong to one of:

```text
nonlinear blocker clauses
support/resource causality
deadline / race semantics
response-capacity / Hall deficiency
first-win / stopping semantics.
```

## 9. Research consequence

The Connect-K detour should not become a new solver program. Its useful result for Connect-4 is the derivative hierarchy

```text
partial -> partial^2 -> partial^3
```

and the proof that this hierarchy is algebraically complete for the one-dimensional K=4 window.

The next Connect-4 organization pass should therefore index predicates and certificate rules against these derivative orders, rather than introducing more ad hoc geometric rule names.

## Proof boundary

Sections 1-6 are exact polynomial/Frobenius algebra over `F2` plus generated interval spaces. Section 7 is exact on the infinite/interior path and requires ordinary endpoint corrections on a finite path. Sections 8-9 are structural consequences/research guidance, not game-value theorems.
