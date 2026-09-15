# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is the current-state router. Detailed evidence is under `docs/research/**`; executable controls are under `research/semantic-quotient/**`.

## Authority / proof boundaries

- C4-0001 through C4-0005 remain protected baseline authority in their scopes.
- C4-0006 and C4-0007 remain **Candidate** structural/proof specifications.
- C4-0010 remains an accepted **research** consumer specification and does not promote Candidate dependencies.
- Unknown != loss; theorem failure != opposite outcome; resource failure != logical rejection.
- External solved W/D/L, terminal-distance, opening-book, witness, and varying-board census data are validation/falsification evidence only.
- No solved/external label, predefined 28, or predefined 69 is a premise of the strongest structural controls.
- Equal dimension != natural isomorphism; a support upper bound != an exact terminal census.

## Standard 7x6 structural theorem

From only

```text
GF(2), K=4, H=6, W=7
```

the generated incidence operator derives

```text
L=69
rank(B)=35
dim ker(B)=34.
```

The corrected cores are

```text
Y_cell=ker((row+column parity)|im(B)), dim 28
Y_line=ker(vertical-line parity|ker(B)), dim 28.
```

The CPC/residual pairings are perfect on this board and define the qualified natural isomorphism

```text
T:Y_line -> Y_cell
beta(Ty,z)=gamma(y,z).
```

Natural splittings remain

```text
im(B)=Y_cell direct-sum C_axis      =28+7
ker(B)=Y_line direct-sum C_phase    =28+6
C_phase ~= Even(F2^7).
```

## Empty-board canonical 28 bridge

A second target-free construction starts from only turn modulus, `K=4`, `H=6`, `W=7`.

- odd width gives one reflection-fixed column;
- the natural P0 preterminal rank is `2K-3=5`;
- same-column two-ply `P` pairs are zero phase displacement;
- P0's latest parity-compatible board-capacity terminal is ply 41, leaving two cells empty and restricting a maximal-delay landing to the top two rows;
- the unique five-event stack maximizing blocker/final-landing exclusion is the reflection-fixed center stack.

The maximal-delay support envelope has 38 predicates. Five-event stack exclusions are

```text
4,6,8,10,8,6,4,
```

so the unique extremal center stack leaves the emergent canonical cardinality. The generated geometry is exactly the 28-line geometry later observed by the solved oracle, but no oracle fact is used by this construction.

The remaining standard-board theorem gap is semantic selection: prove from CPC/NDC/support structure that distance-optimal play selects an invariant implying this canonical envelope. Do not import the oracle five-center prefix or ply-41 result as premises.

## Board-parameterized K=4 invariant family

The reusable object is now a board invariant vector, not the scalar 28.

For generated Connect-4 geometry define

```text
B       : line-to-cell incidence
Q_axis  : row+column parity on im(B)
Q_phase : vertical-line parity on ker(B)
Y_cell  = ker(Q_axis|im(B))
Y_line  = ker(Q_phase|ker(B))
Delta   = dim(Y_line)-dim(Y_cell).
```

These definitions work for every board shape, including thin boards. In the regular regime the closed forms are:

```text
L                    = 4WH-9W-9H+18
rank(B)              = WH-7
rank(Q_axis)         = W+H-6
rank(Q_phase)        = W-1
dim(Y_cell)          = WH-W-H-1
dim(Y_line)          = 3WH-10W-9H+26
Delta                = (W-4)(2H-9)-9.
```

`4x4` is an incidence degeneracy and `4x5` is an additional phase degeneracy; the universal generated-rank definitions remain authoritative there. The executable family control qualifies all `4<=W,H<=13`, while the research note gives symbolic proofs in the regular regime.

The transpose defect is exact:

```text
Delta(W,H)-Delta(H,W)=H-W.
```

Thus the cell core is transpose symmetric while the line core retains gravity orientation.

## Exact balanced-shape classification

Regular line/cell core balance requires

```text
Delta=0
<=> (W-4)(2H-9)=9.
```

The only positive integer solutions with `W,H>=5` are

```text
5x9  -> common core 30
7x6  -> common core 28
13x5 -> common core 46.
```

Standard 7x6 is the only balanced shape with at most 42 cells.

This also falsifies treating the cell-side 28 as sufficient: 6x7 has

```text
Y_cell=28
Y_line=29
Delta=1.
```

## Correct board-family CPC residual parity

The standard shorthand

```text
q(S)=C(S)+r_max(S) mod 2
```

used the fact that `(W-1)H` is even on 7x6. The actual board-family invariant is

```text
q_(W,H)(S)=(W-1)H + C(S)+r_max(S) mod 2.
```

This correction matters immediately on 6x7, where the omitted constant is odd.

## Balance does not imply perfect pairing

The existing CPC/residual pairings were recomputed on all three balanced shapes with the corrected parity:

```text
board   Y_cell  Y_line  rank(beta)  rank(gamma)
5x9       30      30       28           26
7x6       28      28       28           28
13x5      46      46       42           34
```

Therefore equal core dimensions alone do not produce the standard natural isomorphism. Among the three balanced K=4 shapes, 7x6 is the unique perfect-pairing case for the current beta/gamma construction.

The transpose control is stronger:

```text
7x6: beta=28, gamma=28
6x7: beta=23, gamma=14.
```

No claim is made that alternative natural pairings cannot exist on other boards.

## Player-specific maximal-delay support invariant

Board capacity and turn parity define a latest *possible* terminal horizon independently for each player. Let `q` be the number of empty cells immediately before that parity-compatible horizon. Gravity gives

```text
E_max(W,H,p)=G(W,H)-G(W,H-q)
```

with clipped geometry for small heights.

For standard 7x6:

```text
P0: latest possible ply 41, q=2, E_max=38
P1: latest possible ply 42, q=1, E_max=19.
```

This is a support-capacity invariant, not a claim that optimal play reaches the horizon.

## Active next seam

Derive a **board-parameterized searchless selection law** over the invariant vector

```text
I(W,H)=(
  L, rank(B), Q_axis, Q_phase,
  Y_cell, Y_line, Delta,
  q_(W,H), player support horizon,
  beta/gamma pairing defects
).
```

The law must:

1. derive the relevant player/control refinement from CPC/NDC/support semantics without recursive child-value comparison;
2. reproduce the standard 7x6 canonical 28 envelope as the zero-imbalance, perfect-pairing case;
3. remain well-defined when `Delta != 0` and when beta/gamma are degenerate;
4. use incoming exact varying-board evidence only as falsification/validation after the structural law is proposed;
5. preserve the smallest counterexample to every attempted scalar reduction.

The immediate mathematical question is what additional invariant distinguishes a board's **selected terminal/control envelope** from its raw core dimensions and maximal-delay support capacity.

## Durable evidence

- `docs/research/2026-09-14-empty-board-canonical-28-bridge.md`
- `docs/research/2026-09-14-k4-board-invariant-family.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-empty-board-canonical-28-bridge.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-board-invariant-family-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-balanced-pairing-family-audit.mjs`

The prior common-Y, natural-splitting, residual-21, sequential-ladder-falsifier, optimal-oracle, and cross-board support controls remain valid in their existing notes.

## Paused / secondary seams

- history-aware marked residual calculus after the qualified 21-space: valid, paused;
- varying-board exact census qualification: secondary validation/falsification lane;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: valid unfinished work, paused.
