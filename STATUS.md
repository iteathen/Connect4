# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router, not a historical ledger. Detailed evidence remains under `docs/research/**`; executable theorem controls remain under `research/semantic-quotient/**`.

## Authority and proof boundary

- C4-0001 through C4-0005 remain protected baseline authority in their scopes.
- C4-0006 and C4-0007 remain **Candidate** structural/proof research specifications.
- C4-0010 remains an accepted **research** consumer specification; it does not silently promote imported Candidate clauses.
- Qualified executable controls establish finite theorem instances inside the research calculus; they do not change specification acceptance status.
- Unknown != loss; theorem failure != opposite game outcome; resource failure != logical rejection.
- Same dimension != canonical isomorphism; vector-space splitting != natural splitting.
- Connect-4 residual cofactor != Connect-3 incidence unless an explicit map proves it.
- No solved/external W/D/L labels are proof premises in the structural-logic controls.

## Active seam: GF(2) incidence / support-graded middle duality

From primitives

```text
field = GF(2)
K = 4
H = 6
W = 7
```

the target-free incidence controls derive the standard winning-line geometry and

```text
L = 69
rank(B) = 35
dim ker(B) = 34
```

with the emergent equality

```text
rank(B) - W = dim ker(B) - H = 28.
```

Neither 28 nor 69 is a primitive input to the strongest controls.

### Projection audit

The originally proposed one-axis projections are exact falsifiers:

```text
column parity on im(B):            rank 4, not 7
horizontal-line row parity on ker: rank 5, not 6
```

Corrected natural quotients are:

```text
cell side: row + column parity on im(B), rank 7
line side: vertical-line parity per column on ker(B), rank 6
```

Their explicit kernels both have derived dimension 28:

```text
Y_cell = ker(axis parity | im(B))
Y_line = ker(vertical-line parity | ker(B)).
```

### Symmetry correction

Bare geometric incidence has top-bottom reflection symmetry, but Connect4 gravity/support order does not. The corrected cores have equal left-right fixed dimensions (14 and 14) but unequal top-bottom fixed dimensions (16 and 14).

Therefore the top-bottom mismatch falsifies a **B-only** equivariant identification. It does **not** falsify a Connect4-natural identification that uses support/event order. Early low winning structure and later high spatial redundancy are intentionally not treated as vertically symmetric.

### Residual complex

The residual cofactor operator is now represented as a genuine GF(2) graded boundary over unique residual subsets. For the standard board the residual-level cardinalities are:

```text
arity 1: 42
arity 2: 282
arity 3: 232
arity 4: 69
```

The executable control proves:

```text
partial_4 is injective
partial_3 * partial_4 = 0
J_3 * partial_4 = B
```

where `J_3` is ordinary cell incidence of degree-3 residual fragments.

The naive `28 -> 21 = W*(K-1)` residual contraction is falsified in this category:

```text
rank(J_3) = 42, not 21.
```

### Strongest current result: natural perfect dual pairing

For a residual fragment `S = line \\ {cell}`, define

```text
g(S) = supportClosureSize(S)
     + componentCountAlongOriginalLine(S)
     + maxRow(S)
     mod 2.
```

This gravity/residual-defined functional induces a basis-independent bilinear pairing between the corrected cores. Its restricted matrix has full rank 28 and is left-right reflection equivariant while intentionally breaking top-bottom reflection.

Current strongest theorem:

```text
Y_line ~= Y_cell^*
```

as a natural perfect dual pair under the explicit residual/support functional.

A canonical direct map

```text
T : Y_line -> Y_cell
```

is **not yet proved**. The ambient dot products restrict with rank 24 on both cores, so perfect duality does not create a canonical self-duality for free.

### P / CPC compatibility boundary

Same-column two-ply stutter remains exact zero phase displacement over GF(2).

For distinct columns, `e_a + e_b` lies in the corrected cell quotient's length-4 column-interval sector only for one-based pairs

```text
(1,5), (2,6), (3,7).
```

Therefore generic CPC phase transport cannot yet be described as acting only on the boundary factor while fixing the 28-core.

### Nearby-family falsification

For the finite neighborhood `W=2K-1, H=2K-2`, `K=2..8`, only `K=4` satisfies

```text
rank(B_K) - W = dim ker(B_K) - H.
```

The smallest tested counterexample is `K=2`. No all-K formula is claimed from this finite computation.

### Durable evidence

- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-emergent-middle-dimension-isomorph.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-canonical-projection-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-axis-interval-quotient-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-support-graded-middle-duality-control.mjs`
- `docs/research/2026-09-14-support-graded-middle-duality.md`

Current structural checkpoint commit:

```text
6dd91db38392cef03e499b6e526eea9ba8dc4eaf
```

The new support-graded control executes locally with `proved:true`. GitHub Actions run `34907472035` failed during `Set up job` before checkout or Node execution; that run is infrastructure failure and provides no theorem evidence either way.

## Current next question

Determine whether the natural perfect duality can be upgraded to a natural direct intertwiner, or whether the correct Connect4 theorem is fundamentally a dual pair rather than a self-identification.

The next admissible candidates must be defined from Connect4 structure before basis selection, preserve left-right symmetry, respect gravity/support/event order, and commute with the proven residual structure. CPC/event-order self-pairings and residual-induced forms should be tested before any arbitrary complement or Gaussian basis matching.

## Preserved solver seam

The earlier forward structural W/D/L work is not invalidated. In particular the qualified rank-9 and rank-8 predecessor closures remain evidence, and the prior rank-7 P1 horizon at exact state `4665655` remains an unfinished solver seam.

That solver seam is currently **paused**, not superseded as false. Resume it only when explicitly selected; do not let stale router text silently pull an agent away from the active structural-logic investigation.

## Resource and proof hygiene

- Five-minute outer/inner execution wall remains 300 seconds where applicable.
- Preserve current proof-state and quotient/search-storage bounds.
- Execution sharding is hygiene only, never semantic identity.
- Do not raise limits merely to obtain a passing theorem.
- No deadline regeneration, implicit frame rule, silent player/column symmetry, or q-equality from claim-relative signatures.
