# Connect-4 board invariant family

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Objective

The standard 7x6 result should not be generalized by treating `28` as a reusable constant. The reusable object is the structural construction that produced it.

This note lifts the standard-board incidence/axis/phase decomposition to varying Connect-4 board shapes and records which parts are universal definitions, which have closed forms in the regular regime, and which standard-board properties are genuinely exceptional.

No solved W/D/L label, opening move, terminal distance, or optimal terminal-line census is used below.

## Universal definitions

For any width `W`, height `H`, and connect length `K=4`, generate the geometric winning-line space `L` and its GF(2) line-to-cell incidence operator

```text
B : F2^L -> F2^(WH).
```

Define the cell-axis map by row and column parity and the gravity-oriented line-phase map by parity of vertical winning-line coefficients in each column:

```text
A : im(B) -> row/column parity space
V : ker(B) -> F2^W.
```

Then define

```text
Y_cell = ker(A | im(B))
Y_line = ker(V | ker(B))
Delta  = dim(Y_line) - dim(Y_cell).
```

These definitions remain valid on thin or degenerate boards even when the regular closed forms below do not. The implementation derives the ranks from generated geometry rather than substituting formulas.

A player-specific maximal-delay support envelope is also defined without a solved outcome. For player `p`, choose the latest board-capacity ply with the correct turn parity, derive the number `q` of empty cells immediately before that event, and retain only winning lines touching a gravity-legal final-landing row. This is a capacity envelope, not a theorem that optimal play attains that horizon.

## Regular K=4 closed forms

For ordinary boards with both dimensions at least four, the generated geometric line count is

```text
L = 4WH - 9W - 9H + 18.
```

Except for the 4x4 incidence degeneracy,

```text
rank(B) = WH - 7.
```

The row+column axis quotient has the exact rank

```text
rank(A | im(B)) = W + H - 6.
```

In the regular phase regime, and in particular for every `W,H >= 5`,

```text
rank(V | ker(B)) = W - 1.
```

The only additional phase degeneracy found in the `W,H >= 4` family is 4x5, where the phase rank is 2 rather than 3. The transpose 5x4 does not share that defect because `V` is gravity/width oriented.

Consequently, away from those explicit narrow degeneracies,

```text
Y_cell = WH - W - H - 1
Y_line = 3WH - 10W - 9H + 26.
```

The first expression is symmetric in width and height; the second is not. That asymmetry is structural gravity orientation rather than an implementation artifact.

## Why rank(B)=WH-7

The symbolic proof is clearest in the `W,H >= 5` regime.

A cell labeling `f(x,y)` lies in the cokernel of `B` exactly when every geometric four-cell winning line has even `f`-sum. Along one axis this condition is

```text
f(n)+f(n+1)+f(n+2)+f(n+3)=0.
```

Over GF(2) this is the third finite-difference equation

```text
Delta^3 f = 0,
```

because `(1+T)^3 = 1+T+T^2+T^3` in characteristic two. Therefore horizontal and vertical constraints put every cokernel labeling in the 9-dimensional tensor span

```text
sum_{0<=i,j<=2} a_ij * C(x,i) * C(y,j) mod 2.
```

Substitution into the diagonal four-line constraints gives two independent conditions

```text
a_22 = 0
a_12 = a_21,
```

leaving seven cell-side annihilators. Hence the incidence image has codimension seven:

```text
rank(B)=WH-7.
```

On 4x4 only one of the two diagonal conditions is independent, leaving cokernel dimension eight and `rank(B)=8`. The executable family control also qualifies the dimension-four edge cases directly.

## Why the axis quotient is W+H-6

A horizontal winning line contributes a length-four interval in column parity and zero row parity. A vertical line contributes a length-four interval in row parity and zero column parity. A diagonal contributes one interval in each axis.

The `n-3` length-four interval vectors in an axis of length `n` are independent by their leftmost pivot. Horizontal and vertical lines therefore already span

```text
I4(W) direct-sum I4(H)
```

with dimension

```text
(W-3)+(H-3)=W+H-6.
```

Diagonals remain inside that same direct sum, so they do not increase the axis-quotient rank.

## Why the phase quotient is W-1

For `W,H >= 5`, the vertical-line parity image of a line dependency is exactly the even-weight subspace of `F2^W`.

For the upper bound, let

```text
g(n)=C(n,3) mod 2.
```

Pairing the zero row-axis relation of a dependency against `g` shows that vertical-line count parity equals diagonal-line count parity. Pairing the zero column-axis relation shows horizontal-line count parity equals diagonal-line count parity.

The cell functional

```text
F(x,y)=C(x,3)+C(y,3)+C(x,1)C(y,2) mod 2
```

has odd intersection with every geometric length-four winning line. Since a line dependency has zero cell incidence, its total selected-line parity is therefore zero. The three orientation parities are equal, so their common parity must be zero. Thus the vertical phase vector has even total weight and

```text
rank phase <= W-1.
```

For the lower bound, the executable control contains explicit 5x5 geometric dependency cycles whose vertical parities are adjacent-pair vectors `e_0+e_1` and `e_1+e_2`. Translation and horizontal reflection embed these local cycles to generate every adjacent pair on any `W,H >= 5` board. Adjacent pairs span `Even(F2^W)`, proving

```text
rank phase = W-1.
```

This is the board-family version of the standard-board `Even(F2^7)` phase quotient.

## Oriented core imbalance

Subtracting the two regular core dimensions gives

```text
Delta(W,H)
  = Y_line - Y_cell
  = 2WH - 9W - 8H + 27
  = (W-4)(2H-9) - 9.
```

Under width/height transposition,

```text
Delta(W,H)-Delta(H,W)=H-W.
```

So bare incidence can be transpose-isomorphic while the gravity-oriented core balance changes by exactly the orientation difference.

For 7x6 and 6x7:

```text
7x6: Y_cell=28, Y_line=28, Delta=0
6x7: Y_cell=28, Y_line=29, Delta=1.
```

This explains why the cell-side `28` survives transpose while the natural common-middle theorem does not.

## Exact classification of balanced K=4 shapes

A regular board is dimension-balanced exactly when

```text
Delta=0
```

or equivalently

```text
(W-4)(2H-9)=9.
```

For positive integer `W,H >= 5`, `W-4` is a positive divisor of 9. The only solutions are therefore

| board | common core dimension |
|---|---:|
| 5x9 | 30 |
| 7x6 | 28 |
| 13x5 | 46 |

Thus 7x6 is not the only balanced Connect-4 shape, but it is the **only balanced shape with at most 42 cells**.

This also separates two claims that were previously easy to conflate:

- `Y_cell=28` is not unique to 7x6; for example 6x7 has the same cell-core dimension.
- simultaneous line/cell balance is much rarer and is orientation sensitive.

## General CPC residual parity

The standard-board residual control used the shorthand

```text
q(S)=C(S)+r_max(S) mod 2.
```

That simplification is valid on 7x6 because `(W-1)H=36` is even. It is **not** the board-family invariant.

From the CPC zero-reservation target-event count

```text
N(t)=(W-1)H-ply+r+1,
```

and a residual fragment whose minimal support closure has size `C(S)`, so that `prePly=C(S)-1`, the invariant parity is

```text
q_(W,H)(S)
  = (W-1)H + C(S) + r_max(S) mod 2.
```

For the transpose 6x7, the omitted constant is odd. Any cross-board residual calculus must carry it.

## Balance is not enough: pairing audit

The existing natural standard-board construction uses

```text
gamma(y,z) = <D y, q D z>
beta(c,y)  = CPC/residual cross pairing
```

and obtains perfect rank 28 forms on 7x6.

The pairing was re-run on all three analytically balanced shapes using the corrected board-dependent CPC parity:

| board | Y_cell | Y_line | rank beta | rank gamma | perfect |
|---|---:|---:|---:|---:|---|
| 5x9 | 30 | 30 | 28 | 26 | no |
| 7x6 | 28 | 28 | 28 | 28 | yes |
| 13x5 | 46 | 46 | 42 | 34 | no |

Therefore

```text
Y_cell dimension = Y_line dimension
```

does **not** imply that the current CPC/residual forms are nondegenerate. Among the three balanced K=4 shapes, the standard board is the unique perfect-pairing case for this construction.

The 6x7 transpose is an even stronger control:

```text
Y_cell=28
Y_line=29
rank beta=23
rank gamma=14.
```

So neither the number 28 nor transpose-isomorphic bare incidence predicts the natural-pairing structure.

## Maximal-delay support remains a separate invariant

For either player, board capacity and turn parity alone define a latest *possible* terminal horizon. If `q` cells are empty immediately before that horizon, gravity gives the target-free support envelope

```text
E_max = G(W,H)-G(W,H-q)
```

with the lower-height argument clipped at zero when necessary.

On 7x6:

```text
P0 latest parity-compatible horizon: ply 41, q=2, support envelope 38
P1 latest parity-compatible horizon: ply 42, q=1, support envelope 19.
```

The searchless standard-board bridge then uses the canonical rank-5 center structure to refine the P0 envelope from 38 to 28. Other boards must derive their own control/prefix refinement; the family theory must not hard-code `38->28`.

## Current invariant vector

The reusable K=4 object is therefore not one scalar. It is at least

```text
I(W,H) = (
  L,
  rank(B),
  rank(Q_axis),
  rank(Q_phase),
  dim(Y_cell),
  dim(Y_line),
  Delta,
  q_(W,H),
  player-specific maximal-delay support,
  beta/gamma pairing ranks
).
```

For 7x6 this vector collapses unusually strongly:

```text
Delta=0
Y_cell=Y_line=28
rank beta=rank gamma=28.
```

That is a stronger characterization of the standard structural `28` than cardinality alone.

## What this changes in the searchless program

The next derivation should not seek a formula `f(W,H)=28-like-count`. It should seek a board-parameterized **selection law over the invariant vector**:

1. derive the relevant player-specific support horizon from parity/capacity;
2. derive the control/blocker refinement from CPC/NDC/support structure;
3. measure how that refinement acts on `Y_cell`, `Y_line`, phase and pairing defects;
4. only then read off the board-specific terminal envelope.

The standard 7x6 theorem is the zero-imbalance, perfect-pairing special case that the general law must reproduce.

## Executable controls

- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-board-invariant-family-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-balanced-pairing-family-audit.mjs`

## Proof boundary

- No solved W/D/L or optimal-move premise is used.
- The incidence/axis derivations have symbolic regular-regime proofs; the executable control additionally qualifies `4<=W,H<=13` and records narrow degeneracies.
- The local phase cycles make the `W,H>=5` phase-rank formula constructive; dimension-four edge cases are separately qualified by the executable control.
- The balanced-shape classification follows algebraically from the regular closed forms.
- The beta/gamma comparison is a finite exact audit of the existing pairing construction, not an assertion that no alternative natural pairing exists on 5x9 or 13x5.
- Thin boards remain covered by the universal generated-rank definitions, not by the regular closed forms.
