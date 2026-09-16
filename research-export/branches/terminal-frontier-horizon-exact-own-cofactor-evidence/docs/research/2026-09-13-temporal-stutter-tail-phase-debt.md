# Temporal stutter, target-tail factorization, and phase-debt transport

**Date:** 2026-09-13  
**Status:** exact bounded controls + cross-layer factorization; not a complete safety proof  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Continue the temporal-contract automaton work at the fixed hinge state without expanding the q frontier.

The controls establish three compact facts:

1. the currently available non-C/G vertical response pairs are exact stutters for the C3/G3 latent-target automaton;
2. after either target is consumed, the newly exposed three-cell upper tail factors as one two-ply stutter pair plus one unmatched P0 event;
3. that unmatched event creates a one-slot phase-debt interface whose local repair neighborhood is identical in all four target/lower-ownership cases.

Together these connect the latent-target scheduler to the previously established GF(2) collapse/transport/re-expansion calculus.

No solved W/D/L label is used.

---

## 1. Fixed state and latent contract

Use:

```text
466565554644
```

with exact live P0 singleton targets:

```text
C3
G3
```

The local temporal contract is:

```text
P0:C1 -> P1:G1
P0:G1 -> P1:C1

P0:C2 -> P1:C3
P0:G2 -> P1:G3
```

The direct old vertical responses are poisoned:

```text
P0:C1 -> P1:C2  // permits P0:C3 terminal
P0:G1 -> P1:G2  // permits P0:G3 terminal
```

---

## 2. Initial exact stutter macros

Prototype:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-temporal-stutter-tail-control.mjs
```

Workflow run:

```text
34801299360
```

The five currently available non-C/G vertical pairs are:

```text
A1 -> A2
B1 -> B2
D5 -> D6
E5 -> E6
F5 -> F6
```

For each pair, exact C4-0010 transitions establish:

```text
support rank delta = +2
column-phase displacement mod 2 = 0
C3 singleton remains live
G3 singleton remains live
no P0 terminal occurs on the trigger
```

Therefore, relative to the latent-target observation, each is an exact two-ply stutter macro at this state.

This is an exact local use of the previously derived same-column phase law:

```text
same-column P0/P1 pair -> phi unchanged.
```

---

## 3. Post-target upper-tail factorization

After P1 consumes one target at row 3, that column exposes:

```text
row4 < row5 < row6
```

Four cases were checked:

```text
C target resolved, C1 was P0-owned
C target resolved, C1 was P1-owned
G target resolved, G1 was P1-owned
G target resolved, G1 was P0-owned
```

In every case the same factorization holds:

```text
P0 row4
P1 row5
-------------
two-ply stutter pair

P0 row6
-------------
one unmatched event
```

The row4/row5 pair:

- has rank delta +2;
- has phase displacement 0;
- preserves the other live singleton target.

The row6 P0 event:

- is legal;
- is nonterminal for P0 in all four controls;
- leaves the other singleton live.

Thus the immediate tail normal form is:

```text
Tail3
  = StutterPair2 + OddEvent1
```

for both C and G and for both lower-cell ownership cases tested.

This is a structural normal form, not yet a theorem for arbitrary target columns/geometries.

---

## 4. One-slot phase-debt interface

Prototype:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-tail-phase-debt-control.mjs
```

Workflow run:

```text
34801394490
```

After the unmatched row6 P0 event:

```text
P1 is to move
```

while the other target remains a live P0 singleton.

The remaining target's middle support move is poisoned for P1:

```text
remaining G3 -> P1:G2 is poisoned
remaining C3 -> P1:C2 is poisoned
```

In all four cases, exactly the same five column classes are local one-slot repair candidates:

```text
A
B
D
E
F
```

A repair candidate means only:

- the P1 move is legal and nonterminal at this step;
- it does not touch the remaining target column;
- the remaining singleton stays live;
- the move spends the P1 turn and returns P0 to move.

It is **not** automatically compatible with every other active WSL/CPC/NDC obligation.

The identical repair neighborhood across the four cases is:

```text
N(PhaseDebt1) = {A,B,D,E,F}.
```

This is the exact interface required by the existing response-capacity/matroid layer.

---

## 5. Hidden isomorphism: phase debt is defect transport

The earlier exact column-phase law is:

```text
phi' = phi + e_a + e_b  over GF(2)
```

with the qualitative cases:

```text
(1,1)->(0,0)  collapse
(1,0)->(0,1)  transport
(0,0)->(1,1)  re-expansion
```

The tail/repair sequence fits the same algebra.

Conceptually:

1. consuming a target exposes an odd three-event tail;
2. the row4/row5 pair contributes no net phase displacement;
3. P0 consumes row6, removing/toggling the tail's odd coordinate and leaving P1 with one turn-phase debt relative to the remaining target;
4. P1 spends one move in an otherwise even external column;
5. that external column's phase bit toggles.

Thus the repair does not destroy phase defect information. It moves it:

```text
old odd coordinate -> chosen repair column.
```

This is exactly the previously observed **transport** operation, now derived as a temporal-contract resource transition.

The strategic vocabulary and the phase-vector vocabulary are therefore two views of the same transition:

```text
TemporalContract: spend one skip/repair resource
GF(2):            transport one defect bit
```

---

## 6. Shared reservoir isomorphism

A second self-isomorphism appears.

Before either target is engaged, the available exact stutter columns are:

```text
{A,B,D,E,F}
```

After one target tail generates phase debt, the one-slot local repair neighborhood is again:

```text
{A,B,D,E,F}.
```

So at this boundary the same resource reservoir appears in two roles:

```text
pre-target:
  stutter reservoir

post-tail:
  phase-debt repair reservoir
```

This does not mean the individual contracts are interchangeable; using a repair move changes that column's phase/resource state. It means one resource owner can represent both roles.

The next exact question is therefore resource evolution, not resource discovery.

---

## 7. Connection to response matroid

The phase-debt interface generates one active obligation:

```text
PhaseDebt1
```

with current local response neighborhood:

```text
A(PhaseDebt1) = {A,B,D,E,F}.
```

At this snapshot the response-matroid view is trivial: one obligation has rank one whenever at least one admissible resource survives all stronger guards.

The nontrivial behavior occurs after a resource is selected because the selected column's temporal contract state changes.

Therefore:

```text
TemporalContract automaton
  owns resource-state evolution

Response matroid
  owns simultaneous feasibility at each snapshot.
```

This is further evidence that the two layers should remain composed rather than collapsed.

---

## 8. New finite state candidate

The hinge no longer needs to be represented as arbitrary move history.

A candidate C-layer state is now approximately:

```text
LatentTargets:
  which of {C3,G3} remain live

SupportPhase:
  target support stage for each live target

ExternalReservoir:
  phase/resource state for A,B,D,E,F

PhaseDebt:
  0 | 1

ActiveDeadlines:
  currently triggered response obligations
```

The exact representation is not yet accepted. In particular, `ExternalReservoir` must preserve any WSL/NDC facts made relevant by choosing a repair column.

But this is already much smaller than one state per legal continuation.

---

## 9. What is established

Established at the fixed control:

- five exact initial stutter macros;
- target-tail factorization `StutterPair2 + OddEvent1` in all four tested cases;
- the odd event is nonterminal and preserves the remaining singleton;
- the remaining target middle response is poisoned for P1;
- the same five-column local repair neighborhood `{A,B,D,E,F}` appears in every case;
- the phase-debt repair transition is an instance of the exact GF(2) defect-transport law.

No oracle W/D/L premise or recursive q solve is used.

---

## 10. What is not established

Not established:

- that every local repair candidate is globally compatible with the other active safety fragments;
- that the external reservoir can always continue to absorb/transport phase debt;
- that repeated transport terminates favorably for P1;
- that the bottom/row5 defect subsystem remains covered after each selected repair;
- a full P1 safety certificate for `466565554644`;
- a positive or negative root W/D/L conclusion.

---

## 11. Next bounded seam

The next object is a **resource-state transition table** for the five-column reservoir, not a q tree.

For each repair class in:

```text
{A,B,D,E,F}
```

compute only:

```text
pre-contract state
repair event
GF(2) phase displacement
new playable response relation
private WSL coverage changed
active NDC guards/deadlines changed
resulting resource class
```

Then ask whether these five transitions are isomorphic under a smaller set of typed resource classes.

The strongest candidate theorem is:

```text
phase debt cannot be eliminated;
it can only collapse with another odd resource or transport to another resource class.
```

That statement is not yet promoted globally. The exact GF(2) transition is known; the missing part is whether all load-bearing C/N semantics follow the same quotient.

Every experiment remains hard-capped at five minutes.
