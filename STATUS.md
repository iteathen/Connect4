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
- No solved/external W/D/L labels are structural premises here.

## Standard-board GF(2) theorem state

From only

```text
GF(2), K=4, H=6, W=7
```

the target-free controls derive

```text
L = 69
rank(B) = 35
dim ker(B) = 34
rank(B)-W = dim ker(B)-H = 28.
```

Neither 28 nor 69 is a primitive input to the strongest controls.

The original one-axis projection proposals are falsified:

```text
rank(column parity | im(B)) = 4, not 7
rank(horizontal-row line parity | ker(B)) = 5, not 6.
```

Corrected cores are

```text
Y_cell = ker((row+column parity)|im(B)), dim 28
Y_line = ker(vertical-line parity|ker(B)), dim 28.
```

Top-bottom reflection mismatch only falsifies a bare-incidence identification; gravity/support order intentionally breaks that symmetry. Left-right reflection remains respected.

## Natural middle isomorphism

Let `D=partial_4` be the formal residual boundary from winning lines to unique 3-cell cofactors. For degree-3 fragment `S`, define

```text
C(S) = minimal gravity-support closure size
r(S) = highest row
q(S) = C(S)+r(S) mod 2.
```

For a highest residual event after the rest of the minimal support closure,

```text
q(S) = CPC zero-reservation event-count parity N(t) mod 2.
```

This is event-rank parity, not eventual-owner parity `(N-1) mod 2`.

The line self-pairing

```text
gamma(y,z)=(D y)^T diag(q)(D z)
```

has rank 28 on `Y_line`. Owner-parity weighting instead has rank 16.

For incident cell `c` of line `l`, with `S=l\\{c}`, define

```text
w(c,l)=q(S) XOR connected(S),
```

where `connected(S)=1` exactly when the 3-cell cofactor remains contiguous along the original line. The resulting cross pairing `beta:Y_cell x Y_line -> GF(2)` has

```text
q only              rank 20
connectedness only  rank 16
combined beta       rank 28.
```

Define the direct map basis-independently by

```text
beta(Ty,z)=gamma(y,z) for every z in Y_line,
```

equivalently

```text
beta_flat o T = gamma_flat.
```

The finite control proves

```text
rank(T)=28
T(Y_line)=Y_cell
left-right equivariance
basis-change invariance.
```

Therefore the emergent 28-dimensional equality is **not merely a rank coincidence**. An explicit Connect4-defined natural isomorphism `Y_line ~= Y_cell` exists. Uniqueness among every conceivable natural construction is not claimed.

## Natural boundary splittings and P

The corrected exact sequences also admit explicit geometric sections.

Cell side:

```text
im(B)=Y_cell direct-sum C_axis
35   =28     +7.
```

`C_axis` is lifted by four bottom-row horizontal winning lines and three center-column vertical winning lines. Its quotient is structurally

```text
I_4(columns) direct-sum I_4(rows), dimensions 4+3.
```

Line side:

```text
ker(B)=Y_line direct-sum C_phase
34    =28     +6.
```

`C_phase` is lifted by six explicit center-star geometric dependency cycles, and its quotient is exactly

```text
Even(F2^7), dim 6.
```

This is the correctly typed home of CPC two-ply displacement

```text
delta_phi=e_a+e_b.
```

All 7 same-column cases are zero. All 42 ordered distinct-column cases are nonzero even-weight quotient coordinates. Under the section lift, `P` changes only the line boundary factor and fixes the common `Y` coordinate. This is a representation statement, not a claim that adding a dependency vector is a legal game transition.

Thus the structural content behind the dimension law is now

```text
im(B)  ~= Y + Q_axis       = 28+7
ker(B) ~= Y + Even(F2^7)   = 28+6
L      = (28+7)+(28+6)     = 69.
```

## Residual degree-3 core

The naive claim that cofactor arity alone makes `28 -> 21` is false: `D|Y` is injective and ordinary degree-3 residual incidence has rank 42.

However a natural first formal residual quotient does expose 21 dimensions. For degree-3 residual `S`, let

```text
phi(S) = minimal-support height parity by column
u(S)   = columns containing a globally highest residual cell
pi_3(S)=u(S) XOR q(S)*phi(S).
```

On `D(Y_line)`:

```text
ordinary residual incidence   rank 0
raw support phase             rank 0
u                             rank 5
q*phi                         rank 5
pi_3                          rank 7.
```

Therefore

```text
Y_3=ker(pi_3|D(Y_line))
dim Y_3=28-7=21=7*(4-1).
```

This 21-space is left-right equivariant and basis-independent.

## Sequential residual ladder falsifier

Do **not** promote the first `28 -> 21` into an automatic

```text
28 -> 21 -> 14 -> 7 -> 0
```

ladder.

Two marked sequentializations were tested with the same fragment frontier rule:

```text
formal marked:
  28 --7--> 21
  21 --0--> 21
  21 --0--> 21

support-ordered marked:
  28 --6--> 22
  22 --7--> 15
  15 --0--> 15.
```

The aggregate boundary also satisfies `partial_3*partial_4=0`, so it cannot represent sequential cofactor descent by simple iteration.

The 21-space is therefore a qualified **first formal residual-boundary core**, not yet a legal-play derivative ladder. Further descent must carry event/support history explicitly.

## Nearby-family falsification

For `W=2K-1, H=2K-2`, finite tests through `K=8` find equal image-over-width and kernel-over-height excess only at `K=4`; `K=2` is the smallest counterexample. No generic family theorem is claimed.

## Durable controls / notes

- `quotient-standard7x6-emergent-middle-dimension-isomorph.mjs`
- `quotient-standard7x6-canonical-projection-audit.mjs`
- `quotient-standard7x6-support-graded-middle-duality-control.mjs`
- `quotient-standard7x6-cpc-residual-middle-isomorph-control.mjs`
- `quotient-standard7x6-natural-boundary-splittings-control.mjs`
- `quotient-standard7x6-residual-degree3-core-control.mjs`
- `quotient-standard7x6-residual-sequential-ladder-falsifier.mjs`
- `docs/research/2026-09-14-cpc-residual-middle-isomorph.md`
- `docs/research/2026-09-14-natural-boundary-splittings-and-P.md`
- `docs/research/2026-09-14-residual-degree3-core.md`
- `docs/research/2026-09-14-residual-sequential-ladder-falsifier.md`

Current structural checkpoint before this router update:

```text
ee950ece036f04cf917c53901bb54a4db7b03fc2
```

Recent dedicated GitHub Actions jobs have repeatedly failed during `Set up job` before checkout; those runs provide no payload evidence. The new controls pass locally with `proved:true`.

## Active next seam

Construct a **history-aware marked cofactor calculus** that transports the CPC event reservoir/support contribution of consumed events instead of recomputing parity from the smaller residual fragment as though history vanished. The first target is to explain or falsify a sequential graded core after the qualified 21-space without presupposing dimensions 14 or 7.

`AGENT_LOCAL.md` was audited and remains structurally correct; no theorem-history expansion is needed there.

## Preserved solver seam

The earlier forward W/D/L rank-7 P1 horizon at exact state `4665655` remains valid unfinished work, paused rather than falsified. Resume only by explicit owner selection.
