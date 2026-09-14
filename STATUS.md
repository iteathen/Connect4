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
Suspected output cardinalities are not premises or tuning targets.

## Governing exact semantics

Value identity remains C4-0010:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Winning region remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

Output identity remains `q + exact P0 residual/origin provenance Pi0`.
Certificate/action reuse is not state equality.

Current canonical proof layers are:

```text
E  causal event poset / support ideals
R  residual winning-requirement antichains
P  CPC / GF(2) phase / precedence / deadlines
C  typed temporal policy contracts and resources
N  guarded monotone dependency closure
G  alternating predecessor fixed point
Q  observation-sensitive value/provenance quotients
```

## Root boundary

All six non-center first moves are internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The remaining root-value task is the positive proof after opening column 4.

Broad exact-q recursion is not the active method. The retained depth/frontier controls
showed genuine expand/collapse behavior but also showed that increasing depth/caps
without a new theorem grows state count without supplying the missing proof class.

## Current structural seam

The current work has isolated a standard-7x6 temporal-contract boundary around the
fixed prefix:

```text
466565554644
```

where P0 has two live latent singleton targets:

```text
C3
G3.
```

The ordinary same-column lower responses are poisoned:

```text
P0:C1, P1:C2 -> P0:C3 terminal
P0:G1, P1:G2 -> P0:G3 terminal.
```

Nevertheless the pair is locally jointly defensible through a support-level
cross-pair:

```text
P0:C1 -> P1:G1
P0:G1 -> P1:C1

P0:C2 -> P1:C3
P0:G2 -> P1:G3.
```

The resulting target-only scheduler has only five P0-decision states and all four
complete target-only attacker orders embed exactly under C4-0010 transitions.

Authority:
`docs/research/2026-09-13-temporal-contract-automata-and-latent-cross-pair.md`.

## Temporal contract model

The C-layer is now represented as guarded finite temporal contracts rather than only
static blockers or one-step response pairs:

```text
TemporalContract {
  states,
  eventGuards,
  requiredActions,
  forbiddenActions,
  resourceClaims,
  phaseEffects,
  deadlines,
  consequences,
  ndcGuards
}
```

The existing response-matroid calculus is a snapshot view of currently active
obligations emitted by those automata. It owns simultaneous response feasibility;
the automata own activation, contingent deadlines, resource evolution and forbidden
responses.

## Phase / stutter / tail normal forms

Use the exact column phase vector:

```text
phi_c = h_c mod 2
phi' = phi + e_a + e_b  over GF(2)
```

for a two-ply P0/P1 macro.

The qualitative cases are:

```text
(1,1)->(0,0) collapse
(1,0)->(0,1) transport
(0,0)->(1,1) re-expansion.
```

At the latent-target state, the five external vertical pairs:

```text
A1->A2
B1->B2
D5->D6
E5->E6
F5->F6
```

are exact two-ply stutters for the C3/G3 contract.

After either target is consumed, its three-event upper tail has the qualified local
normal form:

```text
Tail3 = StutterPair2 + OddEvent1.
```

The odd P0 event leaves one turn/phase debt. The remaining target-column middle move
is poisoned for P1, while the same five columns `{A,B,D,E,F}` form the local one-slot
repair neighborhood. Spending such a repair transports the phase defect into the
chosen external resource rather than deleting it.

Authority:
`docs/research/2026-09-13-temporal-stutter-tail-phase-debt.md`.

## New dependency-cone result

Pure E/P support geometry initially predicts two repair classes:

```text
A,B   -> odd remaining chain length 5
D,E,F -> odd remaining tail length 1.
```

This is too coarse once residual incidence is observed.

A bounded exact control over four post-tail contexts and five repair events produced:

```text
20 physical/local repair transitions
-> 12 exact local semantic-effect signatures
   8 nontrivial reused classes
   4 singleton classes.
```

The signature included:

```text
support-tail type
phase effect
remaining-target effect
same-column follow mode
exact P0 incident residuals
exact P1 incident residuals
exact mover cofactors.
```

This establishes useful **local theorem reuse across distinct global contexts** without
coarsening q. In particular, ownership differences outside a repair event's residual
incidence/dependency cone can be irrelevant to that local event transformer, while the
same difference becomes load-bearing as soon as a live incident residual depends on it.

Authority:
`docs/research/2026-09-13-event-dependency-cone-product-calculus.md`.

## Typed event product

One legal move is now treated as one typed event with simultaneous projections:

```text
E: add enabled support event
P: toggle rank/column phase and update CPC context
R: apply monotone Boolean cofactor/kill and antichain normalization
C: advance active temporal-contract state/resources/deadlines
N: close newly enabled guarded consequences.
```

The candidate reusable proof object is therefore a `TypedEventSignature` describing
only the load-bearing dependency cone. Nonincident global facts remain opaque context
parameters; they are not erased.

This gives a precise mechanism for proof-level compression where q-state compression
is absent.

## Immediate execution seam

Do **not** raise q/frontier caps or run generic deeper recursion.

Build one generic `TypedEventSignature` prototype and compile already-qualified event
families into it:

```text
same-column stutter pair
latent cross-support pair
latent target response
phase-debt repair
center response-serialization collision.
```

For each event preserve:

```text
support/tail effect
phase/CPC effect
R incidence/cofactor effect
C automaton/resource/deadline effect
N guards/consequences
terminal guard
provenance guard when observable.
```

The immediate success criterion is at least one exact cross-family operator
isomorphism plus explicit smallest counterexamples for tempting false merges.

## Hygiene

- Bayesian confidence is a research-priority mask only and is invisible to exact logic.
- Exact solvers/oracles are discovery/falsification controls only.
- Local event-effect equivalence is not q equality.
- Static blocker coverage is not policy realizability.
- Nonplayable singleton residuals are future obligations, not immediate threats.
- Unresolved frontiers remain unknown, not losses.
- Every experiment has a hard five-minute wall-clock limit.
