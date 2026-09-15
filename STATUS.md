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
- External solved W/D/L, terminal distance, opening-book, witness and varying-board census data are validation/falsification evidence only.
- Unknown != loss; theorem failure != opposite outcome; upper bound != exact census; equal dimension != natural isomorphism.
- No solved label, predefined 28 or predefined 69 is a premise of the strongest structural controls.

## Standard 7x6 theorem state

Generated GF(2) incidence from only `K=4,H=6,W=7` gives

```text
L=69
rank(B)=35
dim ker(B)=34
Y_cell=28
Y_line=28.
```

The qualified CPC/residual beta/gamma forms are perfect rank 28 and define the natural isomorphism `T:Y_line->Y_cell`. Natural splittings remain `im(B)=28+7`, `ker(B)=28+6`, with `C_phase ~= Even(F2^7)`.

The target-free empty-board canonical bridge also derives the oracle-matching 28-line geometry without reading solved data: odd-width symmetry gives one center column, preterminal rank is `2K-3=5`, same-column two-ply pairs are phase stutters, the P0 parity-capacity horizon is ply 41, and the unique five-event center stack maximizes maximal-delay candidate exclusion `38-10=28`.

The remaining gap is **semantic selection**: prove why exact distance-optimal CPC/NDC closure selects the corresponding control/deadline structure.

## Board-parameterized K=4 invariant family

Universal generated definitions:

```text
B       : line-to-cell incidence
Q_axis  : row+column parity on im(B)
Q_phase : vertical-line parity on ker(B)
Y_cell  = ker(Q_axis|im(B))
Y_line  = ker(Q_phase|ker(B))
Delta   = dim(Y_line)-dim(Y_cell).
```

Regular closed forms, with explicit narrow degeneracies handled separately:

```text
L                    = 4WH-9W-9H+18
rank(B)              = WH-7
rank(Q_axis)         = W+H-6
rank(Q_phase)        = W-1
dim(Y_cell)          = WH-W-H-1
dim(Y_line)          = 3WH-10W-9H+26
Delta                = (W-4)(2H-9)-9
Delta(W,H)-Delta(H,W)=H-W.
```

`4x4` is an incidence degeneracy; `4x5` is an additional phase degeneracy. Generated-rank definitions remain authoritative there and on thin boards.

Balanced regular shapes satisfy

```text
(W-4)(2H-9)=9
```

and are exactly

```text
5x9  -> common core 30
7x6  -> common core 28
13x5 -> common core 46.
```

7x6 is the only balanced K=4 shape with at most 42 cells.

## Correct cross-board CPC parity

The standard shorthand `q(S)=C(S)+r_max(S)` silently used an even board constant. The board-family invariant is

```text
q_(W,H)(S)=(W-1)H+C(S)+r_max(S) mod 2.
```

This correction is mandatory off standard 7x6; for example the omitted constant is odd on 6x7.

## Balance is not enough

Using the corrected CPC parity, the existing natural pairings on the three balanced boards have ranks

```text
board   Y_cell  Y_line  beta  gamma
5x9       30      30     28    26
7x6       28      28     28    28
13x5      46      46     42    34.
```

Thus equal core dimensions do not generically imply a perfect natural pairing. Standard 7x6 is the unique perfect-pairing member of this balanced family for the current beta/gamma construction. No impossibility claim is made for alternative pairings.

Transpose control:

```text
7x6: Y_cell=28,Y_line=28,beta=28,gamma=28
6x7: Y_cell=28,Y_line=29,beta=23,gamma=14.
```

## Canonical phase-path transport

`C_phase` has a board-family realization as the edge space of the width-`W` column path:

```text
0--1--2--...--W-1
partial(edge_i)=e_i+e_(i+1).
```

The path boundary is an isomorphism onto `Even(F2^W)`. Every two-ply displacement `e_a+e_b` has a unique interval lift and exact structural transport length

```text
lambda(a,b)=|a-b|.
```

Same-column play has zero lift. The path center(s) minimize worst-case transport; for odd width the center is unique. This is structural phase distance, not yet a game-theoretic strong-distance metric.

## Initial-event requirement-impact centrality

For an empty K=4 board, the bottom event in column `c` touches

```text
d_W(c)=1+h4_W(c)+I(c<=W-4)+I(c>=3)
```

winning predicates. A first move advances that many mover requirements and blocks that many opponent requirements.

The maximum-impact columns are

```text
W=4:  {0,3}
W=5:  {1,3}
W=6:  {2,3}
W=7:  {3}
W>=8: {3,...,W-4}.
```

Therefore **W=7 is the unique Connect-4 width with one unique maximum-impact initially legal event**. Its exact profile is `[3,4,5,7,5,4,3]`. At W=7 the unique impact maximum is also the unique phase-path center.

Combining this with `Delta=0` forces

```text
W=7
(W-4)(2H-9)=9
=> H=6
=> Y=WH-W-H-1=28.
```

So 7x6 and its 28-dimensional common core are uniquely characterized inside the regular K=4 family by **core balance + unique maximum initial-event impact**. This is a structural classification, not yet an optimal-move theorem.

## Preterminal exclusion capacity and falsifier

At P0's natural preterminal rank 5, define `X5(W,H)` as the maximum number of P0 maximal-delay support-envelope predicates that any legal five-ply prefix has already excluded.

Exact finite controls:

```text
board  envelope  X5  min survivors  Y_cell
5x9       11      0       11           30
6x7       30      5       25           28
7x5       19      7       12           22
7x6       38     10       28           28
8x5       46     14       32           26
8x7       46      6       40           40
13x5      43      7       36           46.
```

On 7x6 the maximum is uniquely realized by the five-high center stack. But 8x7 also satisfies `min survivors=Y_cell`; therefore that scalar equality is **not** the universal selector. Terminal-envelope cardinality and exclusion capacity are inputs, not the early-game objective.

## Active next seam: deadline-valued NDC selection

The missing invariant is temporal. CPC/NDC distinguishes

```text
eventual ownership
```

from

```text
ownership/blocker completion before an opponent requirement deadline.
```

The next target is a board-parameterized exact **deadline-valued NDC closure** carrying:

```text
residual requirements
support/event precedence
CPC board parity
phase-path transport
response resources
blocker certification
completion horizons.
```

A certificate should carry prerequisites/guards plus an exact rank or horizon. Conjunctive prerequisites combine by latest prerequisite; alternative exact witnesses combine by earliest certified witness; blocker coverage is valid only when the blocker horizon beats the opponent completion horizon. Opponent universality must remain explicit in response/resource certificates rather than being hidden in recursive child-value comparison.

Success means deriving a selector/quotient law from the board invariant vector that:

1. reproduces standard 7x6's canonical 28 envelope without special-casing 28;
2. remains meaningful for nonzero `Delta` and beta/gamma radicals;
3. uses no recursive legal-move-tree solving;
4. can be falsified by incoming exact varying-board evidence without changing its definition.

## Durable evidence

- `docs/research/2026-09-14-empty-board-canonical-28-bridge.md`
- `docs/research/2026-09-14-k4-board-invariant-family.md`
- `docs/research/2026-09-14-k4-selection-invariant-frontier.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-board-invariant-family-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-balanced-pairing-family-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-phase-path-transport-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-initial-event-centrality-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-preterminal-exclusion-capacity-audit.mjs`

Prior common-Y, natural splitting, residual-21, sequential-ladder, oracle-incidence and cross-board support controls remain valid.

## Paused / secondary seams

- history-aware marked residual calculus after the qualified 21-space: valid, paused;
- exact varying-board censuses: validation/falsification lane only;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: valid unfinished work, paused.
