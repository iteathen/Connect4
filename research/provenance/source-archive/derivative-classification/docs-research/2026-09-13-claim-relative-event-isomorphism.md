# Claim-relative event isomorphism

**Date:** 2026-09-13  
**Status:** exact cross-family control + proof-reuse principle; not a state quotient  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Refine the event dependency-cone calculus after observing that a full local event
signature can be unnecessarily strong for a particular theorem.

The key principle is:

```text
isomorphism is relative to the claim being proved.
```

A pair of events may have different complete successor states and different unrelated
residual side-effects while being exactly isomorphic for a narrower structural claim.

This does not weaken C4-0010 state identity. It gives a smaller proof-reuse interface.

---

## 1. Claim-relative signature

Let `O` be an exact observable/conclusion to be proved about event `x` in context `X`.

Define conceptually:

```text
Sigma_O(X,x)
```

as the smallest proved dependency cone containing every fact needed to establish `O`
after/through `x`.

The cone may contain projections from:

```text
E support/accessibility
P CPC/phase/precedence
R residual incidence/cofactor
C temporal-contract state/resources/deadlines
N guarded prerequisites/consequences
terminal semantics
Q provenance when O observes provenance.
```

Two event instances are **claim-relative isomorphic** when their `Sigma_O` cones are
isomorphic under a structure-preserving relabeling.

This licenses reuse of the theorem for `O` only.

It does not license reuse of facts outside `O`'s dependency cone.

---

## 2. Observation lattice

Different conclusions induce different cone sizes.

Examples:

### Singleton-discharge observation

```text
O = LiveP0Singleton(x) is discharged now.
```

The cone is very small:

```text
P1 to move
x is enabled/playable
{x} is a live P0 residual
P1 can legally claim x now
terminal stopping semantics.
```

Unrelated residual families need not be equal merely to prove this conclusion.

### Latent-contract stutter observation

```text
O = C3/G3 temporal-contract state is unchanged by a two-ply external macro.
```

The cone is larger. It must preserve:

```text
C/G support coordinates
live singleton facts
turn phase
terminal safety
relevant CPC/resource/deadline guards.
```

### Exact value-state observation

```text
O = exact q successor identity.
```

The cone expands to the complete C4-0010 value identity:

```text
support + exact P0 residual antichain + exact P1 residual antichain.
```

### Terminal-line provenance observation

The cone is larger still because exact P0 residual/origin provenance `Pi0` must be
preserved.

Thus proof compression naturally grows or shrinks with the observation being claimed.

---

## 3. Exact cross-family singleton-discharge control

Prototype:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-claim-relative-event-signatures.mjs
```

Workflow:

```text
.github/workflows/frontier-claim-relative-event-signatures.yml
```

Workflow run:

```text
34802078920
```

Three physically different contexts were qualified.

### Historical center response-serialization branch

Prefix:

```text
45112
= D1 E1 A1 A2 B1
```

P0 has the enabled singleton:

```text
C1.
```

P1 claims `C1` immediately.

### Latent target C

Prefix:

```text
466565554644373
```

P0 has the enabled singleton:

```text
C3.
```

P1 claims `C3` immediately.

### Latent target G

Prefix:

```text
466565554644377
```

P0 has the enabled singleton:

```text
G3.
```

P1 claims `G3` immediately.

All three are exact nonterminal P1 responses and remove the distinguished P0 singleton.

They normalize to one claim-relative signature:

```text
observation:
  DISCHARGE_ENABLED_LIVE_P0_SINGLETON

mover:
  P1

precondition:
  TARGET_IS_ENABLED_AND_LIVE_P0_SINGLETON

required action:
  CLAIM_TARGET_ON_CURRENT_P1_TURN

deadline:
  CURRENT_P1_TURN

conclusion:
  P0 singleton no longer live
  OR P1 has already terminally won by the response.
```

Result:

```text
3 physical contexts
-> 1 claim-relative theorem class.
```

No solved W/D/L label is used.

---

## 4. Exact theorem schema

The reusable theorem is elementary but important as a proof-interface example:

```text
Enabled(x)
AND SideToMove = P1
AND LiveP0Singleton(x)
--------------------------------
P1ClaimsNow(x) discharges LiveP0Singleton(x)
```

subject to standard legal/terminal semantics.

If the P1 move itself is terminal, P1 has already achieved a stronger safety
conclusion.

The theorem does **not** specify the complete successor residual field.

---

## 5. Why full event signatures were too strong

The center C1 response and latent C3/G3 responses can have different:

- support heights elsewhere;
- P1 residual incidence unrelated to the singleton;
- future resource reservoirs;
- later strategic value;
- terminal-line provenance.

Those differences prevent full state equivalence and may prevent broader local-effect
isomorphism.

But none is required to prove the singleton-discharge claim.

Therefore requiring equality of the complete event signature would reject a valid
cross-family theorem reuse.

The correct rule is:

```text
include every load-bearing dependency for the chosen conclusion;
do not include unrelated context merely because it exists.
```

This is the exact proof-level form of observation-sensitive projection congruence.

---

## 6. Relation to NDC

NDC already supplies the natural implementation model.

A proof claim is a consequence node. Its backwards dependency cone consists of the
premises/guards that can reach that node through accepted implication hyperedges.

Thus a future `TypedEventSignature(O,X,x)` need not guess its fields globally.

Conceptually it can be produced by:

```text
claim O
-> backwards guarded NDC slice
-> retain E/P/R/C facts referenced by that slice
-> canonicalize the resulting typed cone.
```

This would make theorem reuse structurally derived rather than hand-classified.

No implementation completeness is claimed yet.

---

## 7. Hidden isomorphism with earlier response circuits

The same claim-relative principle also clarifies two previously separate capacity
proofs.

The center phase-response fork and center response-serialization collision both reduce,
for the claim `NoCompleteResponseSchedule`, to:

```text
two distinct mandatory response actions
one admissible defender turn
```

which is exactly a size-two circuit in the response transversal matroid.

Their board geometry and triggering events differ, but the response-capacity theorem
class is the same once the claim-relative dependency cone is selected.

This is a second cross-family isomorphism already supported by the retained response
matroid and serialization theorems.

---

## 8. Implication for proof compression

The relevant hierarchy is now:

```text
physical histories
  -> exact q states for value transitions
  -> local event-effect signatures for action theorem reuse
  -> claim-relative signatures for individual proof conclusions.
```

These are not competing quotients.

They answer different questions:

```text
q:
  are the complete future value-transition states identical?

local event signature:
  can the same local event transformer be reused?

claim-relative signature:
  can the same theorem proving this particular conclusion be reused?
```

This explains how substantial proof compression can exist even where q-state
compression is absent.

---

## 9. What is established

Established:

- claim-relative event isomorphism is strictly weaker than full event/state identity;
- three previously separate singleton-blocking contexts collapse to one exact theorem
  class under the singleton-discharge observation;
- unrelated residual side effects remain context and are not erased;
- the same idea retrospectively unifies the two size-two response-capacity collisions
  as one matroid-circuit theorem class.

---

## 10. Next bounded seam

Build a generic claim-relative signature interface on top of NDC:

```text
TypedEventSignature(claim, context, event)
```

with two operations:

```text
DependencyCone(claim)
Canonicalize(cone)
```

Use already-qualified theorems as the first corpus:

```text
singleton discharge
same-column stutter preservation
cross-support response pairing
phase-defect transport
response-capacity size-two circuit
universal hinge singleton generation.
```

The immediate research question is how many apparently separate proof rules collapse
when signatures are canonicalized relative to their actual conclusion.

Do not infer q equality from those collapses.

Every experiment remains hard-capped at five minutes.
