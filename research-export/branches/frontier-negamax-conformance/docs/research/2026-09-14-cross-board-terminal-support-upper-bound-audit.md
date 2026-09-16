# Cross-board terminal-support upper-bound audit

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Scope

Repository issues #41 and #42 supply external solved-oracle evidence for terminal move counts and, on standard 7x6, an exact distance-optimal 28-line terminal census. The issue text is evidence, not authority. This audit re-derives the geometry, gravity support envelope, standard forced-prefix filtering, and GF(2) incidence fingerprints independently.

The target-free common-`Y` theorem remains independent. No solved W/D/L or terminal-distance label below is fed back into that theorem.

## Source semantics independently checked

Issue #42 pins Christophe Steininger's `c4` revision `fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c`.

At that revision:

- `STRONG_SOLVES_ENABLED = true` in `src/solver/settings.h`;
- `score_win_at(num_moves)` assigns larger scores to earlier wins in `src/solver/position.h`;
- negamax maximization therefore also prefers a later loss over an earlier loss;
- the published `Last Move` table is consequently compatible with the distance-sensitive convention used by issues #41/#42: earliest forced win / longest resistance.

This confirms the interpretation of the published terminal move as a strong-solve distance premise. It does not independently re-solve those boards.

## Geometry and gravity upper bound

For Connect-4, with

```text
a = max(W-3,0)
b = max(H-3,0),
```

the geometric line count is

```text
G(W,H) = H*a + W*b + 2*a*b.
```

For a decisive root whose distance-optimal terminal move is `T`, let

```text
N = W*H
q = N-T+1
```

be the number of empty cells immediately before the terminal move. Gravity implies that a zero-based final landing row `r` satisfies `H-r <= q`, hence

```text
t = max(0,H-q)
r >= t.
```

Every newly completed terminal winning line contains the final stone, so it cannot lie entirely in the lower `t` rows. Therefore

```text
U_support(W,H,T) = G(W,H)-G(W,t)
```

is a sound support upper bound.

This is the global form to retain. In the unclipped regime used by the eight decisive source boards (`W>=4`, `t>=3`) it simplifies to

```text
U_support = q*(4W-9).
```

Do not use the compact form outside that regime without rechecking the clipped geometry.

## Independent decisive-board reproduction

The executable control regenerates every geometric line and every gravity-consistent deficit distribution for the eight decisive published boards with `W*H<=42`. It reproduces issue #42's support caps exactly:

| board | winner | terminal move | geometric lines | q | support upper |
|---|---|---:|---:|---:|---:|
| 6x4 | P1 | 24 | 24 | 1 | 15 |
| 6x6 | P1 | 36 | 54 | 1 | 15 |
| 6x7 | P0 | 41 | 69 | 2 | 30 |
| 7x6 | P0 | 41 | 69 | 2 | 38 |
| 8x4 | P1 | 32 | 38 | 1 | 23 |
| 8x5 | P0 | 39 | 61 | 2 | 46 |
| 9x4 | P1 | 36 | 45 | 1 | 27 |
| 10x4 | P1 | 40 | 52 | 1 | 31 |

No arithmetic inconsistency was found in these eight support caps under the supplied source premises.

Only 7x6 currently has a qualified exact nonzero terminal-line census in this research packet. In particular, **6x7 = 30 remains an upper bound until the announced matching proof/witness evidence is qualified.**

## GF(2) fingerprints of the support envelopes

For each support-envelope coordinate subspace `E`, decompose rank-nullity relative to the already used structural projections:

```text
dim E
 = line-core dependency dimension
 + phase-boundary dependency rank
 + cell-core image dimension
 + axis-boundary image rank.
```

The decisive `q=2` cases are

```text
6x7: 30 = 4 + 3 + 18 + 5
7x6: 38 = 6 + 4 + 22 + 6
8x5: 46 = 8 + 5 + 26 + 7.
```

A finite width-family control (`W=4..30`, `H=5`, `q=2`) reproduces the sector pattern

```text
coordinate count        = 8W-18
line-core dependencies  = 2W-8
phase-boundary rank     = W-3
cell-core image         = 4W-6
axis-boundary image     = W-1
incidence image rank    = 5W-7.
```

The phase sector is contained in, and by dimension equals, the even-weight subspace on the `W-2` interior columns. This is finite family evidence, not an unbounded symbolic proof for every width.

An important consequence is that the raw 7x6 support envelope's incidence rank `28` is not by itself a special standard-board theorem. It is the width-7 value of the observed q=2 support-family formula `5W-7`. Do not conflate this occurrence of 28 with the independently target-free common-`Y` dimension.

## Standard 7x6 refinement: 38 -> 30 -> 28

For the standard board, terminal move 41 first gives

```text
38 = 8 horizontal + 14 vertical + 16 diagonal.
```

Issue #41 independently supplies the first-five-center premise:

```text
P0 center cells: rows 1,3,5 one-based
P1 center cells: rows 2,4 one-based.
```

Filtering by the fixed opponent center cells removes eight lines:

```text
38 -> 30
orientation: 8H + 12V + 10D.
```

Those two P1 center cells remove exactly two vertical and six diagonal support candidates.

The P0 center cell on row 5 one-based was already occupied on ply 5, so it cannot itself be the move-41 landing. Two remaining diagonal candidates have no other legal top-two-row landing cell, giving

```text
30 -> 28
orientation: 8H + 12V + 8D.
```

The resulting 28 line IDs exactly match issue #41's witnessed census.

## The more informative structural filtration

Cardinality alone hides what the prefix removes. The independently recomputed GF(2) sectors are

```text
support envelope:
  38 = 6 line-core + 4 phase + 22 cell-core + 6 axis

fixed P1 center prefix:
  30 = 4 line-core + 0 phase + 20 cell-core + 6 axis

final exact candidate set:
  28 = 2 line-core + 0 phase + 20 cell-core + 6 axis.
```

Therefore the ten-coordinate reduction `38 -> 28` does **not** remove ten independent cell-incidence directions:

- the incidence image falls only `28 -> 26`;
- the axis-boundary image remains rank 6 throughout;
- the fixed P1 center cells eliminate the entire rank-4 phase-boundary dependency sector of the terminal envelope;
- they also remove two line-core dependency dimensions and two cell-core image dimensions;
- the final two own-cell landing exclusions remove two additional line-core dependencies but do not lower the incidence image rank.

This is consistent with the separate optimal-28 audit:

```text
28 exact terminal coordinates
 -> 2 line-core dependencies
  + 20 cell-core image dimensions
  + 6 axis-boundary image dimensions.
```

The repeated number 28 therefore remains structurally interesting, but the simplest identifications are falsified.

## Transpose control: 6x7 versus 7x6

The two boards have the same bare geometric incidence invariants:

```text
L = 69
rank(B) = 35
dim ker(B) = 34.
```

But gravity changes the terminal-support envelope:

```text
6x7 terminal support upper = 30
7x6 terminal support upper = 38 before prefix refinement.
```

Their full corrected core dimensions also differ on the line side:

```text
6x7: Y_cell dimension 28, gravity-oriented Y_line dimension 29
7x6: Y_cell dimension 28, gravity-oriented Y_line dimension 28.
```

Thus neither bare incidence nor the cell-side 28 alone predicts the external terminal-line upper bound. If the incoming 6x7 evidence proves all 30 candidates attainable under the same distance-optimal convention, that will be a strong falsifier of any interpretation equating the optimal terminal-line count with the standard common-`Y` dimension across orientations.

## Current assessment

The safest current hierarchy is

```text
geometric lines
  -> terminal-support envelope from (W,H,T)
  -> fixed-prefix/color/control refinement when independently proved
  -> exact optimal terminal-line census only after matching lower-bound witnesses.
```

For 7x6:

```text
69 -> 38 -> 30 -> 28 exact.
```

For 6x7, currently:

```text
69 -> 30 upper bound -> exact count pending evidence.
```

This gives a rigorous framework for incoming varying-board evidence without allowing issue conclusions to become premises merely because their numbers are suggestive.

## Proof boundary

- External solved outcomes and terminal moves are validation premises only.
- Only 7x6 has a qualified exact nonzero terminal-line count in the current packet.
- An upper bound is not an exact census.
- Equal cardinality is not a canonical isomorphism.
- The target-free common-`Y` theorem remains independent of all external solved data.
- Use `G(W,H)-G(W,t)` globally; the compact `q(4W-9)` form is conditional.
