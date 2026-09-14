# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router. Retained history and controls remain under
`docs/research/**` and `reference/research-prototypes/**`.

## Objective

Derive a complete structural proof of standard 7x6 Connect Four perfect-play W/D/L,
then derive the exact P0 perfect-play terminal winning-line set with provenance.
Suspected output cardinalities are outputs only, never premises or tuning targets.

## Canonical unified logic

Current one-statement synthesis:

`docs/research/2026-09-13-unified-structural-logic-statement.md`

The exact layers remain distinct:

```text
E  causal event poset / support ideals
R  residual winning-requirement antichains
P  CPC / GF(2) phase / precedence / deadlines
C  typed temporal policy contracts and resources
N  guarded monotone dependency closure
G  alternating predecessor fixed point
Q  observation-sensitive value/provenance quotients
```

One legal placement is treated as one typed event with simultaneous E/R/P/C/N
projections. Proof reuse is claim-relative: only the dependency cone required by the
exact claim may be canonicalized and reused.

Governing projection rule:

```text
Erase a distinction only when it is a congruence for every downstream transition and
the exact claim/observation being proved.
```

## Exact value/output boundaries

Ordinary forward value identity remains C4-0010:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Winning region remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

Output identity remains:

```text
q + exact P0 residual/origin provenance Pi0
```

Certificate/action theorem reuse is not state equality.

## Root boundary

All six non-center first moves are internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The unresolved root-value task is the positive structural proof after opening column 4.
This repository therefore does **not** yet claim a complete internal standard-7x6 solve.

## Current typed-event results

### Temporal contracts

At fixed prefix `466565554644`, P0 has latent singleton targets `C3` and `G3`.
The naive same-column lower responses are poisoned, but a Baseinverse-shaped support
cross-pair yields an exact five-state local scheduler:

```text
P0:C1 -> P1:G1
P0:G1 -> P1:C1
P0:C2 -> P1:C3
P0:G2 -> P1:G3
```

All four target-only attacker orders embed exactly under C4-0010 transitions without
solved W/D/L premises.

Authority:
`docs/research/2026-09-13-temporal-contract-automata-and-latent-cross-pair.md`.

### Phase / stutter / tail

Exact two-ply phase law:

```text
phi' = phi + e_a + e_b over GF(2)
```

with support-phase forms:

```text
(1,1)->(0,0) collapse
(1,0)->(0,1) transport
(0,0)->(1,1) re-expansion
```

Five external vertical pairs are exact latent-contract stutters, and a consumed target's
three-event upper tail has local normal form:

```text
Tail3 = StutterPair2 + OddEvent1.
```

The odd event produces one unit of phase debt; a local repair transports rather than
destroys the GF(2) defect.

Authority:
`docs/research/2026-09-13-temporal-stutter-tail-phase-debt.md`.

### Event dependency cones

A bounded exact control over 20 repair transitions produced:

```text
20 physical/local transitions
-> 12 exact local semantic-effect signatures
   8 nontrivial reused classes
   4 singleton classes.
```

This demonstrates local theorem reuse across distinct global q contexts without
coarsening q.

Authority:
`docs/research/2026-09-13-event-dependency-cone-product-calculus.md`.

### Claim-relative theorem isomorphism

Three physically different singleton-block contexts:

```text
center serialization target C1
latent target response C3
latent target response G3
```

collapse to one exact theorem class for the claim:

```text
EnabledLiveP0Singleton(x)
AND SideToMove=P1
=> claiming x now discharges that singleton obligation
```

subject to the terminal guard that P1's move may itself already terminate the game.

Authority:
`docs/research/2026-09-13-claim-relative-event-isomorphism.md`.

This is the current strongest evidence that useful compression belongs at the
**claim-relative theorem layer**, not by inventing a smaller global state identity.

## Bayesian mask

Bayesian confidence and expected information gain remain external research-priority
metadata only. They may choose what to test next but never enter CPC/WSL/NDC/G proof
semantics. Exact promotion discards probability metadata.

## Immediate execution seam

Do **not** raise q/frontier caps or run generic deeper recursion.

Build and qualify the generic proof-theorem interface:

```text
TypedEventSignature(claim, context, event)
```

using existing exact controls. Initial claims include:

```text
enabled singleton discharge
same-column stutter preservation
cross-support pair establishment
phase-defect transport
size-two response-capacity circuit
universal hinge -> two latent singletons
```

For each candidate theorem class:

1. derive the smallest sufficient E/R/P/C/N dependency cone;
2. canonicalize only under structure-preserving renaming;
3. retain nonincident global facts as opaque parameters;
4. reuse the theorem only for its declared claim;
5. retain the smallest separating invariant for every rejected merge.

Current router: `next_step.yaml`.

## Hygiene

- Exact solvers/oracles are discovery and falsification controls only.
- Claim-relative equivalence is not q equality.
- Static blocker coverage is not policy realizability.
- Nonplayable singleton residuals are future obligations, not immediate threats.
- Provenance-sensitive output remains stricter than value-only observation.
- Unresolved frontiers remain unknown, not losses.
- Every experiment has a hard five-minute wall-clock limit.
