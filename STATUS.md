# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router. Detailed evidence is under `docs/research/**`; executable controls are under `research/semantic-quotient/**`.

## Authority / proof boundaries

- C4-0001 through C4-0005 remain protected baseline authority in their scopes.
- C4-0006 and C4-0007 remain **Candidate** structural/proof specifications.
- C4-0010 remains an accepted **research** consumer specification; it does not promote Candidate dependencies.
- Unknown != loss; theorem failure != opposite outcome; resource failure != logical rejection.
- Same dimension != natural isomorphism; vector-space splitting != natural splitting.
- Connect-4 residual cofactor != Connect-3 game incidence without an explicit map.
- External solved W/D/L, terminal-distance, and witness data are validation/falsification evidence only; they are not premises of the target-free structural theorem.
- An upper bound is not an exact optimal-play census.

## Target-free standard-board GF(2) theorem

From only

```text
GF(2), K=4, H=6, W=7
```

the strongest controls derive

```text
L = 69
rank(B) = 35
dim ker(B) = 34
rank(B)-W = dim ker(B)-H = 28.
```

Neither 28 nor 69 is a primitive input.

Corrected cores are

```text
Y_cell = ker((row+column parity)|im(B)), dim 28
Y_line = ker(vertical-line parity|ker(B)), dim 28.
```

A Connect4-defined natural isomorphism exists:

```text
T : Y_line -> Y_cell
beta(Ty,z) = gamma(y,z)
```

where `gamma` is the CPC-event-rank-parity-weighted residual cofactor pairing and `beta` combines that parity with residual connectedness. The control proves rank 28, left-right equivariance, and basis-change invariance.

Natural splittings are also qualified:

```text
im(B)  = Y_cell direct-sum C_axis   = 28+7
ker(B) = Y_line direct-sum C_phase  = 28+6
C_phase ~= Even(F2^7).
```

CPC two-ply displacement `e_a+e_b` is correctly typed in the six-dimensional line-side phase quotient; same-column stutter is zero.

## Residual calculus checkpoint

The first formal residual boundary exposes a natural 21-dimensional core after a rank-7 support/CPC frontier quotient:

```text
28 -> 21
```

but repeated fragment-only descent is falsified. Formal marked repetition gives ranks `7,0,0`; a support-ordered marked version gives `6,7,0`. Further sequential descent requires consumed-event history. This seam remains valid but is currently paused by explicit owner direction to stay on the 28 / varying-board investigation.

## External optimal-play 28 evidence

Issue #41 supplies a qualified external solved-oracle result for distance-sensitive optimal play on standard 7x6:

```text
28 distinct terminal winning lines
terminal move 41
first five moves forced to the center
orientation count: 12 vertical + 8 horizontal + 8 diagonal.
```

The independent branch audit proves that these 28 line coordinates are **not** a basis of the common `Y`:

```text
dim coordinate space               = 28
rank of its cell incidence image    = 26
line dependencies inside Y_line     = 2
cell-image intersection with Y_cell = 20
axis-boundary image rank             = 6.
```

Thus the exact optimal set has the structural fingerprint

```text
28 = 2 line-core + 20 cell-core + 6 axis.
```

Equal cardinality remains insufficient to identify the oracle line set with `Y`.

## Cross-board terminal-support audit

Issue #42 was re-audited rather than trusted directly. Its pinned source revision is Christophe Steininger's `c4` commit `fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c`. The source has strong solves enabled and scores earlier wins higher; by negamax the losing side prefers longer resistance. The published `Last Move` table is therefore compatible with the distance-sensitive convention used by #41/#42.

For Connect-4 geometry define

```text
a=max(W-3,0)
b=max(H-3,0)
G(W,H)=H*a + W*b + 2*a*b.
```

For externally supplied decisive terminal move `T`, let

```text
q = W*H-T+1
t = max(0,H-q).
```

Gravity gives the sound terminal-support upper bound

```text
U_support(W,H,T)=G(W,H)-G(W,t).
```

The compact form `q*(4W-9)` is valid only in the unclipped regime used by the eight decisive source boards (`W>=4`, retained lower height `t>=3`); do not use it globally.

Independent coordinate enumeration and deficit-distribution enumeration reproduce the eight decisive support caps exactly:

```text
6x4  -> 15
6x6  -> 15
6x7  -> 30
7x6  -> 38 before forced-prefix refinement
8x4  -> 23
8x5  -> 46
9x4  -> 27
10x4 -> 31.
```

No arithmetic inconsistency was found in those support caps under the stated source premises. Only 7x6 currently has a qualified exact nonzero census. In particular, **6x7=30 is still an upper bound until the announced matching proof/witness evidence is qualified.**

## Standard 7x6 support/prefix filtration

The generic move-41 support envelope is

```text
38 = 8 horizontal + 14 vertical + 16 diagonal.
```

Applying the issue-#41 five-center prefix as an external validation premise gives

```text
38 -> 30
```

because the two fixed P1 center cells eliminate two vertical and six diagonal candidates. The already occupied P0 center row-5 cell cannot be the final landing, eliminating two further diagonal candidates:

```text
30 -> 28 exact.
```

The more informative GF(2) sector filtration is

```text
support envelope:
  38 = 6 line-core + 4 phase + 22 cell-core + 6 axis

fixed P1 center prefix:
  30 = 4 line-core + 0 phase + 20 cell-core + 6 axis

exact 28 candidates:
  28 = 2 line-core + 0 phase + 20 cell-core + 6 axis.
```

Therefore the `38 -> 28` coordinate reduction removes ten line coordinates but only two cell-incidence image dimensions. Most of the reduction removes dependency freedom. Notably, the fixed opponent center prefix annihilates the entire rank-4 phase-boundary dependency sector of the move-41 support envelope while the six-dimensional cell-axis sector survives unchanged.

## q=2 width-family control

A finite control over `W=4..30`, `H=5`, with two empty cells immediately before terminal (`q=2`) finds the stable support-envelope sector pattern

```text
coordinate count        = 8W-18
line-core dependencies  = 2W-8
phase-boundary rank     = W-3
cell-core image         = 4W-6
axis-boundary image     = W-1
incidence image rank    = 5W-7.
```

The phase sector equals the even-weight subspace on the `W-2` interior columns in every tested width. This is finite family evidence, not an unbounded symbolic theorem.

Consequently the raw 7x6 support-envelope incidence rank `28` is the width-7 value `5W-7`; it must not be treated as an independent identification with the common `Y`.

## Transpose control

Bare 7x6 and 6x7 incidence geometry is isomorphic:

```text
L=69, rank(B)=35, dim ker(B)=34
```

but gravity/support orientation changes the relevant structures:

```text
7x6: support upper 38, Y_cell 28, Y_line 28
6x7: support upper 30, Y_cell 28, Y_line 29.
```

If incoming evidence proves all 30 support candidates attainable on 6x7 under the same distance-optimal convention, that will strongly falsify any cross-orientation claim that the optimal terminal-line count is simply the common-`Y` dimension.

## Active next seam

Stay on the 28 / varying-board evidence.

For each new board proof submitted in issues:

1. inspect source/witness premises directly rather than trusting the issue conclusion;
2. regenerate `G`, terminal-support envelope, and any fixed-prefix/color refinement independently;
3. distinguish upper bound from exact witnessed census;
4. compute the seven-part fingerprint needed for comparison: coordinate count, incidence image rank, dependency dimension, axis rank, cell-core image, phase rank, line-core dependency dimension;
5. compare transpose/orientation controls before proposing a general law;
6. preserve the target-free common-`Y` theorem independently.

The immediate high-value case is the announced 6x7 proof for 30.

## Durable evidence

- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-optimal-28-incidence-oracle-audit.mjs`
- `docs/research/2026-09-14-optimal-28-oracle-incidence-audit.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-terminal-support-bound-audit.mjs`
- `docs/research/2026-09-14-cross-board-terminal-support-upper-bound-audit.md`

The prior structural/residual controls remain valid and are preserved in their existing notes.

## Paused seams

- history-aware marked residual calculus after the qualified 21-space: valid, paused by owner direction;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: valid unfinished work, paused.
