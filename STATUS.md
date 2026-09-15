# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is the current-state router. Detailed evidence is under `docs/research/**`; executable controls are under `research/semantic-quotient/**`.

## Proof boundary

- Target domain: every positive finite rectangle `W x H`, Connect-4 (`K=4`).
- Small boards must collapse from the same generated objects as regular boards; there is no small-board mode.
- Finite sweeps, solved W/D/L tables, strong-distance data and varying-board censuses are validation/falsification evidence only. No unbounded theorem may be justified by a finite run.
- C4-0006/C4-0007 remain Candidate structural/proof specifications; C4-0010 is an accepted research consumer and does not promote them.
- Unknown != loss; theorem failure != opposite result; equal rank != natural isomorphism.
- Strongest structural derivations contain no predefined `28` or `69` and no recursive minimax/Negamax/MCTS/PNS proof step.

## Total-domain geometry

Let

```text
a=(W-3)_+
b=(H-3)_+
p=min(W,3)
q=min(H,3)
d=min(2,ab).
```

For all positive `W,H`:

```text
L = Ha + Wb + 2ab.
```

This is an exact counting theorem over arbitrary integers.

## Total-domain incidence decomposition — proved symbolically

For the one-dimensional length-4 window space `A_n`:

```text
dim A_n=(n-3)_+
dim(F2^n/A_n)=min(n,3).
```

Over `F2`:

```text
1+x+x^2+x^3=(1+x)^3,
```

so the residual axis module is a third finite-difference quotient with period-four coordinate recurrence.

For the board cell space:

```text
Hspan=A_W tensor F2^H
Vspan=F2^W tensor A_H
C/(Hspan+Vspan) ~= Q_W tensor Q_H.
```

The diagonal start residue has exact rank `d=min(2,ab)`. Therefore, for every positive `W,H`:

```text
rank(B)      = WH-pq+d
dim ker(B)   = 3ab-d
rank(Q_axis) = a+b
Y_cell       = WH-pq+d-a-b.
```

The gravity-oriented phase quotient also decomposes. Its exact total-domain rank is

```text
rank(Q_phase)
  = min(a,ab)
    + min(2,ab,a+floor((b-1)_+/2)).
```

Hence

```text
Y_line
  = 3ab-d
    - min(a,ab)
    - min(2,ab,a+floor((b-1)_+/2)).
```

The old `4x4` incidence defect and `4x4/4x5` phase defects are not separate laws; they are boundary degeneracies where the diagonal-start neighborhood cannot realize both residue generators.

Primary note:
`docs/research/2026-09-14-total-domain-incidence-decomposition.md`

Validation-only control:
`research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-total-domain-incidence-decomposition-control.mjs`

## Derived difference axioms

Write `X=partial_x=1+T_x`, `Y=partial_y=1+T_y`. After horizontal/vertical reduction:

```text
X^3=0
Y^3=0
XY=YX.
```

The two diagonal four-window operators are derived rather than primitive:

```text
partial_+^3 = XY^2 + X^2Y
partial_-^3 = XY^2 + X^2Y + X^2Y^2.
```

Thus the previous regular diagonal conditions are exactly

```text
XY^2 = X^2Y
X^2Y^2 = 0.
```

A two-cell mate-response pair has incidence `partial_d`, so the geometric response relation shares the same derivative algebra:

```text
Connect4 window = partial_d^3
response pair   = partial_d.
```

Primary note:
`docs/research/2026-09-14-connect4-derived-difference-axioms.md`

## Standard 7x6 corollary

For `W=7,H=6`:

```text
a=4,b=3,p=q=3,d=2
L=69
rank(B)=35
ker(B)=34
rank(Q_axis)=7
rank(Q_phase)=6
Y_cell=28
Y_line=28.
```

So the standard common `28` is now a corollary of one total-domain decomposition, not a regular-board shortcut.

The qualified CPC/residual beta/gamma forms remain perfect rank 28 on standard 7x6 and define the natural standard-board middle isomorphism. Equal dimensions alone remain insufficient on other boards.

## Total-domain response facts already proved

- Universal mate-response lemma: a legal disjoint response matching hitting every opponent requirement is a no-loss certificate.
- Every `W<4`, arbitrary positive `H`, is a draw by the vertical support-response matching.
- Every `H=1`, arbitrary positive `W`, is a draw by initial-frontier response matching.
- The exact elementary unresolved frontier is

```text
R1(W,H)=(W-3)_+ * floor((H-1)/2).
```

- On width 7 and every even `H>=4`, every non-center P0 opening has a constructive P1 draw certificate; therefore any P0 forced win must open center.

## Structural reinterpretation

The row/column parity map is the ordinary boundary map obtained by treating each board cell `(x,y)` as an edge joining column-node `x` to row-node `y`. Therefore

```text
Y_cell = im(B) intersect ker(boundary)
```

is a genuine cycle sector of the Connect-4 incidence image.

The line-side phase map is likewise a boundary into the column path. This strengthens the hypothesis that the standard common middle is homological/relational structure rather than a rank coincidence.

## Active seam: decompose response/control before isomorphism search

Do **not** canonicalize whole boards first.

Next work:

1. decompose U1/U2/NDC response programs into first-derivative/path-boundary resources plus support/deadline guards;
2. identify any strategic rule that cannot be represented by those derived relations — that is a candidate missing axiom;
3. decompose the published infinite/semi-infinite non-losing paving strategies into the same primitives;
4. separate periodic bulk response invariants from finite top/side boundary defects;
5. only then perform neighborhood-preserving isomorphism search across boards.

A valid isomorphism must preserve derivative modules, mixed coupling, start-neighborhood adjacency/checkerboard class, gravity support direction, response-resource relations, and event-rank/deadline labels. Ordinary grid adjacency or equal scalar dimensions is insufficient.

## Paused seams

- post-center strong-distance selector: valid but paused;
- history-aware marked residual calculus after the qualified 21-space: valid but paused;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: valid unfinished work, paused;
- exact varying-board census: validation/falsification only.
