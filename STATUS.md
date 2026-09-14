# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router, not a historical ledger. Detailed evidence remains under `docs/research/**`; executable controls remain under `research/semantic-quotient/**`.

## Authority / hard boundaries

- C4-0001 through C4-0005 remain protected baseline authority in their scopes.
- C4-0006 and C4-0007 remain **Candidate** structural/proof specifications.
- C4-0010 remains an accepted **research** consumer specification and does not promote Candidate dependencies.
- Unknown != loss; theorem failure != opposite game outcome; resource failure != logical rejection.
- Same dimension != natural isomorphism; vector-space splitting != natural splitting.
- Connect-4 residual cofactor != Connect-3 incidence without an explicit map.
- No solved/external W/D/L labels are premises of the structural-logic controls.

## Active structural theorem

From only

```text
GF(2), K=4, H=6, W=7
```

the target-free incidence controls derive

```text
L = 69
rank(B) = 35
dim ker(B) = 34
rank(B)-W = dim ker(B)-H = 28.
```

Neither 28 nor 69 is a primitive input to the strongest theorem controls.

The original one-axis projections are exact falsifiers:

```text
rank(column parity | im(B)) = 4, not 7
rank(horizontal-row line parity | ker(B)) = 5, not 6.
```

Corrected cores are

```text
Y_cell = ker((row+column parity) | im(B)), dim 28
Y_line = ker(vertical-line parity | ker(B)), dim 28.
```

Bare incidence alone does not identify them naturally: top-bottom fixed dimensions differ, while left-right fixed dimensions agree. This is correctly scoped because gravity breaks top-bottom symmetry.

## Residual / CPC bridge

Let `D = partial_4` be the exact residual boundary from 4-cell lines to unique 3-cell cofactors. The residual complex satisfies

```text
partial_4 injective
partial_3 * partial_4 = 0
J_3 * partial_4 = B.
```

The naive residual `28 -> 21 = W*(K-1)` claim is falsified: `rank(J_3)=42`.

For a degree-3 residual fragment `S`, define

```text
C(S) = size of minimal gravity support closure
r(S) = highest row
q(S) = C(S) + r(S) mod 2.
```

If a highest residual cell is the final event after the rest of the minimal support closure, CPC gives

```text
q(S) = N(t) mod 2.
```

So `q` is native zero-reservation **event-rank parity**. It is not the eventual-owner bit `(N-1) mod 2`; that distinction is load-bearing.

## Natural direct middle isomorphism — qualified locally

Define on `Y_line`

```text
gamma(y,z) = (D y)^T Q (D z),
```

where `Q=diag(q)`. The executable control derives

```text
rank(gamma) = 28.
```

Using owner parity `q XOR 1` instead gives rank 16.

For incident cell `c` of line `l`, let `S=l\\{c}` and let `connected(S)=1` exactly when the 3-cell residual remains contiguous along the original line. Define

```text
w(c,l) = q(S) XOR connected(S).
```

The induced cross pairing

```text
beta : Y_cell x Y_line -> GF(2)
```

has

```text
q only                 rank 20
connectedness only     rank 16
q XOR connectedness    rank 28.
```

Therefore both CPC/event order and residual topology are load-bearing.

Define `T` basis-independently by

```text
beta(T(y), z) = gamma(y, z)  for every z in Y_line,
```

equivalently

```text
T = beta_flat^{-1} o gamma_flat.
```

The control proves

```text
rank(T) = 28
T(Y_line) = Y_cell
beta_flat o T = gamma_flat
T commutes with left-right reflection.
```

It also changes both arbitrary Gaussian execution bases independently and reconstructs the same ambient map. Gaussian elimination is therefore an execution representation, not the definition of `T`.

**Strongest current statement:** the emergent 28-dimensional equality is **not merely a rank coincidence**. There is an explicit Connect4-defined natural isomorphism

```text
Y_line ~= Y_cell.
```

This establishes existence and construction. It does **not** claim that this `T` is uniquely characterized among every conceivable natural isomorphism under every possible naturality axiom.

### Durable theorem evidence

- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-emergent-middle-dimension-isomorph.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-canonical-projection-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-support-graded-middle-duality-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-cpc-self-duality-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-cpc-residual-middle-isomorph-control.mjs`
- `docs/research/2026-09-14-cpc-residual-middle-isomorph.md`

Current theorem checkpoint:

```text
5a7ded1666cf55e701c5b22f828cf69f0e89f643
```

The direct-isomorphism control executes locally with `proved:true`. GitHub Actions run `34908549249` failed at `Set up job` before checkout, so it supplies no payload evidence either way.

## Remaining structural seam

The existence question for `T` is closed for the standard board. The next work is to determine how the identified common `Y` participates in the rest of the calculus:

1. construct natural sections, or preserve exact non-splitting boundaries, for the corrected 7-dimensional cell quotient and 6-dimensional line quotient;
2. type `P` correctly through the quotient/core decomposition instead of treating phase vectors as arbitrary cell vectors;
3. transport residual degree descent through the identified `Y` and determine whether any genuine 21-dimensional next core emerges after the correct support/CPC quotient;
4. test whether the direct theorem has a principled extension beyond K=4; current finite `W=2K-1,H=2K-2` tests have K=2 as the smallest counterexample and only K=4 succeeding through K=8.

## Preserved solver seam

The earlier forward structural W/D/L work remains valid unfinished work. The rank-7 P1 horizon at exact state `4665655` is paused, not falsified or deleted. Resume only by explicit owner selection.

## Resource / proof hygiene

- Five-minute outer/inner execution wall remains 300 seconds where applicable.
- Preserve proof-state and quotient/search-storage bounds.
- Do not raise limits merely to obtain a passing theorem.
- No deadline regeneration, implicit frame rule, silent player/column symmetry, or q-equality from claim-relative signatures.
