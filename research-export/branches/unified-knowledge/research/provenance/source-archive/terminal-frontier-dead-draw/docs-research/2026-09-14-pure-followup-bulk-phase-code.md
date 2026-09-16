# Pure-follow-up bulk as a one-dimensional phase code

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Decompose the repeated `follow-up` strategy used in infinite-height Connect-Four into the repository's support/phase language.

External strategy literature uses a follow-up play to mean: after the opponent plays in column `c`, respond immediately in the same column. Yamaguchi and Neller's cylinder-infinite constructions explicitly enter regions in which play is pure follow-up above a finite setup boundary.

The result below identifies the exact bulk invariant of such a tail. The named paving pattern disappears; the infinite two-dimensional tail is classified by a one-dimensional binary phase word.

## 1. Follow-up is the zero-transport bulk fragment

For one opponent/controller follow-up pair in column `c`, the two-move fragment consumes

```text
n_c=2
n_d=0 for d!=c.
```

Therefore

```text
|F|=2,
|F| mod 2=0,
tau(F)=0,
h'_c=h_c+2.
```

Thus pure follow-up is simultaneously:

- CPC-parity neutral;
- line-phase neutral;
- a two-row support advance in exactly the trigger column.

This is the identity bulk transfer already isolated in the elementary response ladder.

## 2. Column phase determines the entire pure-follow-up tail

Fix a support frontier with column heights

```text
h=(h_0,...,h_(W-1)).
```

Assume that above this frontier the controller always responds to an opponent play with a follow-up in the same column.

In each column, future ownership therefore alternates by row. Up to one global player-complement bit, the entire ownership coloring of the tail is determined by

```text
phi_c = h_c mod 2.
```

Equivalently, for a fixed choice of owner-bit convention,

```text
owner(c,r) = r + phi_c + constant  mod 2.
```

The global constant changes which color is called controller but cannot change whether a monochromatic Connect-4 exists.

So the infinite-height bulk has collapsed from a 2-D colored grid to the width word

```text
phi in F2^W.
```

## 3. Horizontal and diagonal Connect-4 conditions

Vertical Connect-4 is impossible in a pure-follow-up tail because ownership alternates every row in each column.

Consider four consecutive columns `c,c+1,c+2,c+3`.

### Horizontal

At fixed row `r`, the owner bits differ only by `phi`. Therefore the four cells are monochromatic exactly when

```text
phi_c = phi_(c+1) = phi_(c+2) = phi_(c+3).
```

So a horizontal Connect-4 occurs exactly on a length-4 constant factor `0000` or `1111` of `phi`.

### Rising or falling diagonal

Moving one column along either diagonal also changes row parity by one. Thus the four owner bits are monochromatic exactly when

```text
phi_(c+i) + i
```

is constant for `i=0,1,2,3`.

Equivalently `phi` alternates across those four columns:

```text
0101 or 1010.
```

The same criterion holds for both diagonal orientations because `+i` and `-i` have the same parity over `F2`.

## 4. Edge-derivative form

Define the width path derivative

```text
d_i = phi_i + phi_(i+1).
```

This is the same first-derivative/path-edge object already present in the phase-path construction.

A constant length-4 factor of `phi` gives

```text
d_i d_(i+1) d_(i+2) = 000.
```

An alternating length-4 factor gives

```text
111.
```

Therefore:

> **Pure-follow-up bulk safety theorem.**  A pure-follow-up tail contains no horizontal, vertical, rising-diagonal, or falling-diagonal Connect-4 for either player iff its width-edge derivative `d=partial_x phi` contains no length-3 factor `000` or `111` over every geometric four-column window.

For a cylindrical board the same condition is imposed cyclically, including wraparound windows. Since `d` is a cyclic derivative, its total XOR is automatically zero.

Thus the safe bulk language is the binary run-length-limited code

```text
no run of equal derivative bits has length >=3.
```

No paving-pattern name is required.

## 5. Width-6 published bulk pattern

The published width-6 cylinder figures enter a pure-follow-up region above a finite bold-line setup. The visible eventual coloring has three columns in one phase followed by three in the opposite phase, i.e. up to complement/rotation

```text
phi = 000111.
```

Its cyclic derivative is

```text
d = 001001,
```

which contains neither `000` nor `111` cyclically. The phase-code theorem therefore explains the safety of the repeated tail independently of the figure-specific case analysis.

The finite setup is still strategically essential: it establishes a safe phase word and handles threats before the pure-follow-up invariant becomes valid.

## 6. Relationship to existing Connect-4 algebra

The phase code uses no new primitive:

```text
support frontier h
  -> column parity phi=h mod 2
  -> path derivative d=partial_x phi
  -> local forbidden derivative triples.
```

It combines exactly the previously isolated objects:

- first derivative / path boundary;
- support height parity;
- same-column response consumption `n_c=2`;
- zero phase transport of follow-up;
- length-four winning geometry.

The named infinite-board paving has therefore exposed a nonlinear **safety constraint on the existing phase boundary**, not a new geometric object.

## 7. Bulk versus finite-boundary interpretation

A pure-follow-up tail can continue indefinitely on an infinite-height board once a safe `phi` has been established.

A finite board differs in two ways:

1. the bottom/side setup must reach a safe bulk phase word before an opponent win;
2. the top boundary terminates the response flow after finitely many layers.

Hence the signed finite-board value cannot be the bulk safety word alone. The remaining problem is a boundary-reachability/deadline problem:

```text
bottom/side boundary certificate
  -> reach safe phase-code class or fail
  -> repeated zero-transport bulk
  -> finite top closure
  -> signed W/D/L consequence.
```

This is exactly the type of finite NDC transfer problem sought in the response-ladder program.

## 8. New transfer target

For each width, the dynamic boundary state should at minimum record

```text
support phase word phi or its derivative d
active residual/window obligations
conditional response resources
completion-before-deadline facts.
```

The pure-follow-up safe subset has an extremely small local description: `d` avoids `000` and `111`.

A decisive next question is whether the other published paving templates are simply local transition rules that drive the boundary derivative into this safe subshift, and whether finite-board winners are exactly obstructions to doing so before the top deadline.

## External provenance

Yoshiaki Yamaguchi and Todd W. Neller, *First Player's Cannot-Lose Strategies for Cylinder-Infinite-Connect-Four with Widths 2 and 6*, ACG 2015. The paper defines follow-up as same-column response and shows width-2/width-6 cannot-lose strategies which, after finite setup cases, use pure follow-up regions. Its figures are external strategy evidence; the phase-code reduction above is the present project's structural derivation.

## Proof boundary

Sections 1-4 are exact consequences of gravity, alternating follow-up ownership, and Connect-4 geometry. Section 5 checks the published width-6 bulk pattern against the theorem. Sections 7-8 are research direction, not a complete finite-board value theorem.
