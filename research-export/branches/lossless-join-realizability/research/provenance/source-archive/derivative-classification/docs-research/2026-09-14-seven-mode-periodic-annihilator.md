# Seven-mode periodic annihilator code for regular Connect-4 incidence

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Give a compact structural meaning to the constant codimension `7` in the regular-board theorem

```text
rank(B)=WH-7.
```

For sufficiently regular boards, the seven-dimensional cokernel is the restriction of one fixed 4-periodic binary tile code. It is not a collection of unrelated global exceptions.

## 1. One-axis annihilator is a repeated [4,3] parity code

A cell labeling `f(n)` annihilates every length-4 interval iff

```text
f(n)+f(n+1)+f(n+2)+f(n+3)=0.
```

Subtracting the equation shifted by one gives

```text
f(n+4)=f(n).
```

Thus every annihilator sequence is 4-periodic.

Its four-symbol fundamental block has even parity, so the one-axis annihilator is the repeated binary single-parity-check code

```text
P = Even(F2^4)
```

with dimension `3`.

A convenient basis is

```text
b0(n)=1
b1(n)=C(n,1) mod 2
b2(n)=C(n,2) mod 2.
```

On one period `n=0,1,2,3`, these are

```text
b0 = 1111
b1 = 0101
b2 = 0011.
```

They span `P`.

## 2. Horizontal/vertical annihilator is a product code

Before diagonal constraints, a two-dimensional labeling annihilating every horizontal and vertical Connect-4 window lies in

```text
P tensor P.
```

Therefore it is determined by one 4x4 tile and has dimension

```text
3*3=9.
```

Equivalently,

```text
f(x,y)
 = sum_(0<=i,j<=2) a_ij b_i(x)b_j(y).
```

This is the dual/cokernel counterpart of the previously proved `Q_W tensor Q_H` axis residue.

## 3. Diagonal constraints remove exactly two modes

Substitution into the two diagonal length-4 conditions gives

```text
a_22 = 0
a_12 = a_21.
```

Hence the diagonal-compatible periodic tile code is the seven-dimensional subcode

```text
C4_ann <= P tensor P.
```

A canonical basis is

```text
J0  = b0(x)b0(y)
Jx  = b1(x)b0(y)
Jy  = b0(x)b1(y)
Jxx = b2(x)b0(y)
Jxy = b1(x)b1(y)
Jyy = b0(x)b2(y)
J3  = b1(x)b2(y) + b2(x)b1(y).
```

Thus

```text
dim C4_ann = 1+2+3+1 = 7.
```

The grading can be read as

```text
1 constant mode
2 first-difference coordinate modes
3 second-difference / curvature modes
1 symmetric mixed higher mode.
```

This grading is descriptive; the exact basis above is the theorem.

## 4. Regular-board incidence rank

For `W,H` large enough for the four-window constraints and both independent diagonal relations to be realized, every cokernel labeling is the restriction of one tile in `C4_ann`, and every tile in `C4_ann` extends periodically to such a labeling.

Therefore

```text
dim coker(B)=7
```

and

```text
rank(B)=WH-7.
```

This is the periodic-code interpretation of the existing regular incidence theorem.

Finite boundary degeneracies remain governed by the total-domain residue theorem; this note does not replace it.

## 5. Relation to the derivative hierarchy

The tile basis exposes the derivative orders found in the Connect-K classification:

```text
order 0: J0
order 1: Jx,Jy
order 2: Jxx,Jxy,Jyy
mixed higher residue: J3.
```

The discarded mode

```text
b2(x)b2(y)
```

is exactly the `a22=0` diagonal constraint, while the two naive mixed cubic modes collapse to the single symmetric combination `J3` through `a12=a21`.

Thus the seven-mode code is another representation of the same derived diagonal algebra, not a new invariant family.

## 6. Coding-theory isomorphism

The horizontal/vertical annihilator is exactly the product code

```text
[4,3] SPC tensor [4,3] SPC
```

of dimension 9.

Connect-4 diagonal geometry selects a codimension-2 subcode of dimension 7.

This is an exact coding-theory structural isomorphism for the regular incidence cokernel. It does not encode gravity, turn order, blockers or game value.

## 7. Research consequence

The constant `7` in the regular incidence rank is now structurally accounted for by a fixed local periodic code.

Therefore it should not be treated as another candidate game-value parameter. Its role is to measure the seven annihilator modes left invisible by Connect-4 line incidence.

The standard-board structural `28` arises only after the separate axis/core quotient acts on the 35-dimensional incidence image; it is not the same object as this seven-dimensional cokernel code.

## Proof boundary

The period-four and product-code statements follow directly from the length-4 recurrence. The two diagonal coefficient relations are the previously proved symbolic diagonal constraints. No solved-game data is used.
