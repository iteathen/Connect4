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
- No recursive minimax/Negamax/MCTS/PNS result is a premise of the structural theorems below.

## Total-domain static geometry — symbolically closed

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
L             = H*a + W*b + 2ab
rank(B)       = WH-pq+d
dim ker(B)    = 3ab-d
rank(Q_axis)  = a+b
rank(Q_phase) = min(a,ab) + min(2,ab,a+floor((b-1)_+/2))
Y_cell        = rank(B)-rank(Q_axis)
Y_line        = dim ker(B)-rank(Q_phase).
```

The one-dimensional length-4 window polynomial is

```text
1+x+x^2+x^3=(1+x)^3 over F2,
```

so Connect-4 geometry is a third finite-difference system. With `X=partial_x`, `Y=partial_y`, diagonal four-window relations are derived:

```text
partial_+^3 = XY^2 + X^2Y
partial_-^3 = XY^2 + X^2Y + X^2Y^2.
```

The old `4x4` incidence and `4x4/4x5` phase anomalies are boundary realizations of the same residue maps, not extra laws.

Primary notes:
- `docs/research/2026-09-14-total-domain-incidence-decomposition.md`
- `docs/research/2026-09-14-connect4-derived-difference-axioms.md`

## Static A4/quiver classification

The principal empty-board linear maps form the type-A4 zigzag

```text
P_phase <- L_lines -> C_cells -> U_axis.
```

Its interval decomposition canonically contains the line core, phase quotient, cell core and axis quotient. In particular,

```text
L = Y_line + rank(Q_phase) + Y_cell + rank(Q_axis)
```

for every board.

Standard `7x6` gives

```text
69 = 28 + 6 + 28 + 7.
```

This is the current exact static isomorphism/classification language. Toric/CSS homology is only an analogy because the Connect-4 composite is not a chain complex; check-product coding algebra is an exact subsystem isomorphism for the horizontal/vertical tensor span.

Primary notes:
- `docs/research/2026-09-14-a4-quiver-structural-decomposition.md`
- `docs/research/2026-09-14-external-structural-isomorph-audit.md`

## Standard structural corollary

For `W=7,H=6`:

```text
L=69
rank(B)=35
ker(B)=34
rank(Q_axis)=7
rank(Q_phase)=6
Y_cell=28
Y_line=28.
```

The common structural `28` is therefore a corollary of the total-domain calculus, not a fitted constant.

The existing beta/gamma pairing remains perfect rank 28 on standard 7x6. Equal dimensions alone do not imply the same natural pairing on other boards.

## Total-domain draw theorem for thin boards

A quantified response proof now gives

```text
min(W,H)<4  =>  empty-board value is draw.
```

- `W<4`: vertical support-pair response matching.
- `H<4`: paired-column equal-height response matching hits every horizontal requirement.

This subsumes the earlier `H=1` result.

Primary note:
`docs/research/2026-09-14-thin-board-draw-theorem.md`

## Ownership as one binary control potential

Use binary owner convention

```text
q=0 -> first player / repository P0
q=1 -> second player / repository P1.
```

CPC gives

```text
N(t)=(W-1)H-ply+r+1.
```

The absolute side-to-move bit is `ply mod 2`, so the zero-reservation absolute target owner is

```text
q0(c,r)=((W-1)H+r) mod 2.
```

The current ply cancels exactly.

If a certified strategic fragment changes relevant prior-event parity by `rho(c,r)`, then

```text
q(c,r)=kappa+r+rho(c,r)
kappa=(W-1)H mod 2.
```

Thus CPC, phase and seams are views of one scalar correction potential `rho`:

```text
horizontal disagreement H = delta_x rho
vertical disagreement   V = 1 + delta_y rho
seam field              S = delta_y rho.
```

Plaquette flatness / seam transport is simply commutation of mixed differences.

Primary notes:
- `docs/research/2026-09-14-cpc-control-potential-unification.md`
- `docs/research/2026-09-14-z2-domain-wall-causal-field.md`

## Domain-wall terminal geometry

For neighboring assigned cells define disagreement bit `0` for same owner and `1` for opposite owners.

Every Connect-4 terminal line, in every direction, is exactly the same local predicate:

```text
three consecutive disagreement edges = 000.
```

Diagonal disagreement is derived from horizontal/vertical edge fields via plaquette path sums; it is not independent state.

On a rectangle the flat edge field has exactly two ownership lifts, differing by global player complement. One anchor bit selects the absolute player labeling.

The conceptual signed outcome encoding is therefore

```text
[sign/player, win]
00 = draw
01 = first-player win  = +1
11 = second-player win = -1
10 = reserved/noncanonical.
```

The win bit is the exact terminal proposition; the sign bit is the ownership lift of the certified zero-edge line. Player exchange leaves the edge field invariant and toggles only the decisive sign bit.

## Gravity-adapted normal form

A complete assigned ownership field is losslessly equivalent to

```text
one owner anchor bit
+ bottom horizontal disagreement word
+ one vertical seam mask per row boundary.
```

This contains exactly `WH` bits and reconstructs every owner by path integration.

Pure followup is the zero-seam sector. A free move inserts a sparse seam; the exact row transfer is

```text
H_y = H_(y-1) + delta S_y.
```

Geometric terminal detection needs only three edge layers because a Connect-4 contains three inter-cell edges.

Primary note:
`docs/research/2026-09-14-gravity-adapted-domain-wall-normal-form.md`

## Pure-followup bulk and finite top boundary

For pure followup, `d=delta phi` is safe exactly when it contains neither `000` nor `111`. The safe width language is recognized by a fixed four-state automaton.

One-move safe entry from the empty frontier is exact:

```text
S1(W)={c : max(0,W-4) <= c <= min(W-1,3)}
N1(W)=min(W,(8-W)_+).
```

Width 7 is the unique nontrivial width with one one-move safe entry: center column `c=3`.

For finite height, remaining capacity decomposes as

```text
R_c=H-h_c=2k_c+u_c.
```

- `k_c`: neutral opponent/controller pair depth;
- `u_c`: unmatched top-defect bit.

Neutral pair macro-steps only decrement `k_c` and leave all current mod-2 bulk coordinates unchanged. They commute across columns.

A top defect fires exactly at `k_c=0,u_c=1`; the subsequent free move is the non-neutral boundary generator.

The top-defect redistribution acts through the same even-weight width-path phase module already found statically.

Primary notes:
- `docs/research/2026-09-14-safe-phase-transfer-automaton.md`
- `docs/research/2026-09-14-safe-bulk-boundary-entry.md`
- `docs/research/2026-09-14-top-defect-transport-module.md`
- `docs/research/2026-09-14-gravity-adapted-domain-wall-normal-form.md`

## Safe affine seam reservoir

If `c` is a one-move safe setup column, it lies in every four-column horizontal window.

Let

```text
J_c={j : j mod 2 != c mod 2}.
```

Then the affine coordinate cube

```text
C_c=e_c + span{e_j : j in J_c}
```

is entirely pure-followup-safe.

If each coordinate column receives at most one seam, arbitrary independent seam heights are also globally geometry-safe because each nonvertical four-line agrees with one vertex of the safe cube.

For standard width 7:

```text
C_3=e_3+span(e_0,e_2,e_4,e_6)
```

is a four-dimensional, 16-state safe seam reservoir.

Primary notes:
- `docs/research/2026-09-14-single-seam-safety.md`
- `docs/research/2026-09-14-safe-affine-seam-cube.md`

## Residual win targets in ownership coordinates

For a geometric line `(v0,v1,v2,v3)`, the invertible path transform

```text
(q0,q1,q2,q3)
 ->
(anchor=q0,
 e0=q0+q1,
 e1=q1+q2,
 e2=q2+q3)
```

makes either player's terminal target

```text
anchor=player bit
(e0,e1,e2)=000.
```

Thus both players use the same zero-edge geometry; player identity is one affine anchor shift.

Singleton threat ownership becomes one control-potential equation.

Primary note:
`docs/research/2026-09-14-anchored-zero-edge-residuals.md`

## Affine versus nonlinear blocker logic — important correction

A pair blocker is **not automatically XOR**.

For an opponent/player bit `p`, define relative ownership

```text
x_v=q(v)+p.
```

A certified blocker set `B` means

```text
OR_(v in B) x_v = 1.
```

A residual requirement `R` demands `x_v=0` for every `v in R`, so blocker coverage is exactly

```text
B subset_of R.
```

This is the existing WSL upward closure in Boolean clause form.

The current exact logical layers are:

```text
AFFINE
  fixed ownership anchors
  exact XOR/split relations
  control-potential differences
  path/domain-wall parity

MONOTONE CLAUSES
  blocker sets: OR_(v in B)(q(v)+p)=1
  minimal blocker antichains / WSL upward closure

TEMPORAL/SUPPORT
  playability
  response resources
  precedence
  rank/horizon
  completion-before-deadline
  first-win semantics.
```

Only an explicitly qualified split relation may be treated as XOR. Historical rule names do not promote a pair blocker into an affine equation.

Primary note:
`docs/research/2026-09-14-affine-clause-blocker-decomposition.md`

## Current strategic interpretation

The preserved U1/U2/NDC work now has a smaller common shape:

```text
binary control potential
+ affine parity/ownership constraints
+ monotone blocker clauses
+ support/resource/deadline guards
-> residual elimination / terminal proof.
```

Named Allis-style rules are certificate generators into these relation types. No fourth Boolean consequence type is currently required by the preserved decomposition, but completeness of certificate generation is not yet proved.

Pure-followup/domain-wall work is a strong defensive/no-loss substrate. It is **not** promoted to a signed value theorem by itself.

## Active seam: guarded mixed-owner cofactor closure and obligation birth

The solved-database work has been independently assessed. The minimal six-ply collision does not currently justify adding a new primitive board-state predicate.

For player `p`, the positive residual antichain is a monotone Boolean completion formula. Owner-labelled events are exact cofactors. For distinct cells, an owner-`p` cofactor and an owner-`1-p` cofactor commute algebraically: they are ordinary Boolean substitutions followed by canonical minimal-antichain reduction.

This identifies the missing connection more sharply:

```text
full positive residual incidence
+ mixed owner-labelled cofactor
+ support / side-to-move admissibility
+ opponent-universal intervention stability
+ shared response/resource accounting
+ completion-before-deadline / first-win stopping
-> certified NDC obligation
-> response-capacity / terminal consequence.
```

Classification:

```text
new primitive enabling predicate       not warranted
owner-labelled enabling               derived certificate relation
cofactor degree drop                  exact algebra, not yet an obligation
intervening-choice stability          missing guard
cofactor -> obligation quantifier lift primary missing composition rule
Hall deficiency                       sufficient stopping certificate only where guarded/proved
winner/sign lift                      downstream of a decisive terminal certificate
```

The documented collision remains the bounded falsifier/control:

```text
A = [6,6,6,6,2,2] -> database 00
B = [2,6,6,2,6,6] -> database 01
```

Both have support `[0,0,2,0,0,0,4]`, equal degree-2 structural signatures, and equal one-event current-owner degree-2 jets. An independent structural replay reproduced equality after every first P0 event and exactly 13 differing degree-2 signatures among the 49 common two-event column pairs. For `P0 a1, P1 d1`, B exposes the P1 residual `{e1,f1}` and A does not.

That pair is a discriminator, not a value proof. A contracted pair is not automatically a defensive obligation; support, response capacity, competing residuals, deadlines and first-win stopping still decide whether it becomes forcing.

Immediate target: derive the smallest guarded quantifier-lift rule that turns an exact mixed-cofactor consequence into an NDC obligation before a deadline, then apply it to the shared d-column continuation. Quantify intervening opponent choices over the resulting antichain/certificate consequence, not survival of one named residual. Stop at the first guard not derivable from existing support, blocker, control-potential, response-resource, deadline or first-win coordinates; only that residue is a candidate new predicate.

Finite evidence remains validation/falsification only: 30,254 source queries falsify boundary-capacity, degree-2, GF(2)-span and current-owner degree-2-jet value completeness. Exact identity and ownerJet have no sampled value collision but this is not theorem evidence and gives no compression proof.

Primary notes:
- `docs/research/2026-09-14-solved-db-structural-discovery.md`
- `docs/research/2026-09-14-solved-db-structural-assessment.md`

The isolated `research/connect-k-derivative-classification` branch was inspected and remains isolated. Its predicate/axiom ledger is consistent with this classification; its newer binary-selector file is only a small research placeholder and does not solve this temporal seam. No merge/cherry-pick is currently warranted.

Do not infer draw from absence of Hall/fork pressure. Do not infer the signed outcome from static rank/core data, residual degree, or pure-followup defect charge alone.

## Validation-only lanes

May falsify candidates but never prove an unbounded formula:

- published finite W/D/L tables;
- standard 7x6 strong-distance/oracle data;
- finite rank/barcode controls;
- constrained strategy solves;
- varying-board censuses.

## Paused seams

- post-center strong-distance selector: valid but paused inside the broader signed-value closure problem;
- history-aware marked residual calculus after the qualified 21-space: preserved;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: unfinished but preserved;
- exact varying-board census: validation/falsification only.
