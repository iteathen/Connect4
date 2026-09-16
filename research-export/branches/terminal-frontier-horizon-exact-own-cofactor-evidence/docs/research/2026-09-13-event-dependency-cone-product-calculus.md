# Event dependency-cone product calculus

**Date:** 2026-09-13  
**Status:** exact C4-0010 local-transition factorization + bounded standard-7x6 control; candidate theorem-reuse interface, not a new state quotient  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Resolve the phase-debt resource-classification result without inventing column-specific rule classes.

The key correction is:

```text
same support shape != same complete semantic effect
```

but also:

```text
different global states can admit the same local event theorem.
```

The correct reusable object is therefore a **contextual event-effect signature**, not a coarser q state.

---

## 1. One move is a product update across the canonical layers

For one legal event `x` by mover `p`, the already-accepted semantics can be read as a synchronous product update.

### E — causal support

The lowest available event in one column is added to the support ideal:

```text
I' = I union {x}.
```

This changes column height and exposes the next event in that chain when one exists.

### P — parity / CPC phase

Support rank increments by one and the column phase bit toggles:

```text
rho' = rho + 1
phi' = phi + e_column(x)  over GF(2).
```

CPC ownership/reservation calculations are then recomputed from the exact event context required by C4-0006.

### R — residual winning requirements

The event is a Boolean cofactor of the two residual monotone functions.

For the mover:

```text
x = 1
```

so every mover residual containing `x` shrinks by removing `x`; an emptied term is an immediate win.

For the opponent:

```text
x = 0
```

so every opponent residual containing `x` dies.

The result is antichain-normalized.

Thus the C4-0010 residual transition is exactly the familiar monotone-function restriction/cofactor operator.

### C — temporal policy contracts

The same physical event is consumed by active `TemporalContract` automata. It may:

- trigger a required response;
- discharge an obligation;
- violate a forbidden response;
- consume/release a resource;
- create a contingent deadline;
- transport a phase/resource token;
- enter a new contract state.

### N — dependency closure

New exact consequences are closed under the guarded NDC implication relation.

So conceptually one event has the form:

```text
(E,P,R,C) --x--> (E',P',R',C')
                  |
                  v
                Cl_N
```

This is a product transition followed by guarded closure, not five unrelated calculi.

---

## 2. Why support classes alone failed

At the post-tail phase-debt interface, the five legal local P1 repair columns were:

```text
A B D E F
```

Pure support geometry predicted two classes:

```text
A,B   -> ODD_CHAIN_5
D,E,F -> ODD_TAIL_1
```

This prediction is exact at E/P.

However the bounded resource classification showed that R immediately refines these classes. Different repair cells occur in different live P0/P1 residual requirements.

Therefore a resource type cannot be identified only by:

```text
remaining column capacity
phase bit
```

when residual incidence is load-bearing.

This is another application of observation-sensitive projection congruence.

---

## 3. Event dependency cone

For an event `x` in proof context `X`, define its local R incidence neighborhood:

```text
Inc_0(X,x) = live P0 residual terms containing x
Inc_1(X,x) = live P1 residual terms containing x.
```

For a P1 repair event, its exact immediate R action is:

```text
kill Inc_0(X,x)
shrink every term in Inc_1(X,x) by removing x
normalize.
```

The **event dependency cone** must also include every C/N fact that can change the meaning of the event:

```text
support-tail type
phase/CPC effect
active contract guards
response/deadline obligations
resource sharing/exclusivity
terminal/race guards
NDC prerequisites/consequences
observable provenance when relevant.
```

Facts outside this cone are not automatically deleted from the global proof state. They are merely irrelevant to this local event theorem until a dependency edge brings them back into the cone.

---

## 4. Contextual event-effect signature

A candidate generic signature is:

```text
EventEffectSignature(X,x) = {
  supportTailType,
  phaseEffect,
  targetOrContractEffect,
  followMode,
  opponentIncidentResiduals,
  moverIncidentResiduals,
  moverLocalCofactors,
  activeResourceGuards,
  activeDeadlines,
  relevantNDCGuards
}
```

The fixed control used the exact E/P/R subset of this signature because no additional C/N distinction was active in the measured local step.

Two events with matching signatures under a proved label-preserving renaming may reuse the same local theorem.

This does **not** imply:

```text
q(X) = q(Y)
```

or even that their successor q states are equal.

It means only that the local semantic transformer acting on the dependency cone is isomorphic.

This is **certificate/action reuse without state equality**, which is exactly the boundary required by C4-0010.

---

## 5. Bounded standard-7x6 qualification

Prototype:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-phase-debt-local-effect-signatures.mjs
```

Workflow:

```text
.github/workflows/frontier-phase-debt-local-effect-signatures.yml
```

Workflow run:

```text
34801815328
```

The control covered:

```text
4 qualified post-tail contexts
x 5 repair events {A,B,D,E,F}
= 20 local transitions.
```

Signature fields checked:

- exact support-tail class;
- remaining capacity;
- GF(2) phase role;
- remaining singleton preservation;
- same-column follow mode;
- exact P0 residuals incident to the repair event;
- exact P1 residuals incident to the repair event;
- exact local P1 cofactors after removing the event.

Result:

```text
20 physical/local transitions
-> 12 semantic local-effect classes
```

with:

```text
8 nontrivial classes
4 singleton classes.
```

This is nontrivial theorem reuse without a state quotient.

---

## 6. Exact locality pattern exposed by the control

The four post-tail contexts differ partly in who owned the lower cell of the already-resolved target chain.

### Upper repair events D/E/F

For a fixed remaining target side, D/E/F each have the same exact local signature across both lower-ownership histories.

Examples:

```text
C-resolved, remaining G3:
  D(P0-owned-C1 context) == D(P1-owned-C1 context)
  E(P0-owned-C1 context) == E(P1-owned-C1 context)
  F(P0-owned-C1 context) == F(P1-owned-C1 context)

G-resolved, remaining C3:
  same three pairwise equalities.
```

The forgotten lower-owner distinction is outside those events' measured R incidence cones.

### Bottom repair events A/B

A/B can distinguish the lower-owner histories because bottom residuals such as:

```text
A1-B1
```

may be live in one context and absent in another.

When that residual contains the repair event, the forgotten ownership fact re-enters the dependency cone and the local signature splits.

### Cross-context B reuse

B additionally produces two cross-context reused signatures:

```text
C-resolved/P0-owned-C1:B
== G-resolved/P1-owned-G1:B
```

when the same bottom residual is live, and another shared signature when it is absent.

Thus event reuse follows semantic incidence, not prefix similarity or column naming.

---

## 7. Conditional forgetting theorem schema

The control motivates the following exact theorem schema.

Let contexts `X` and `Y` differ in some fact family `D`.

For events `x` and `y`, suppose there is a structure-preserving map between their dependency cones such that:

```text
support-tail structure matches
phase/CPC action matches
R incidence and cofactors match
C resource/deadline guards match
NDC prerequisites/consequences match
terminal/provenance observation requirements match.
```

Then the same local event transformer/certificate may be used in both contexts.

Differences in `D` outside the mapped dependency cone remain as untouched context.

This is contextual theorem reuse, not global state merging.

In categorical/programming terms the event behaves parametrically in the untouched context; no such terminology is required by the runtime proof language.

---

## 8. Hidden self-isomorphism

The same event participates simultaneously in several structures we previously studied separately:

```text
E: add one enabled poset event
P: toggle one GF(2) coordinate
R: take one monotone Boolean cofactor
C: advance one guarded temporal automaton/product component
N: fire newly enabled implication hyperedges.
```

So the natural primitive may not be any individual layer object.

It may be the **typed event operator**:

```text
TypedEvent(X,x)
```

whose projections are exactly E/P/R/C/N views.

This explains why repeatedly examining one projection in isolation found partial but incomplete structure.

---

## 9. Relation to earlier discoveries

This unifies several retained results without changing their authority:

- C4-0010 residual move semantics = R cofactor projection;
- column phase transport/collapse/re-expansion = P projection;
- gravity/event-poset transition = E projection;
- latent-target / Baseinverse-shaped scheduler = C projection;
- NDC alternative consequence closure = N projection;
- exact-q state identity remains a full value-transition state relation and is not replaced by local effect signatures.

It also explains why proof-level compression can exist where q-state compression does not.

---

## 10. What is established

Established:

- support-only repair classes are too coarse once R incidence is observed;
- exact local incidence signatures produce nontrivial reuse: 20 transitions -> 12 local-effect classes;
- some global history/ownership distinctions are irrelevant to a local event effect and can be kept outside that event's proof cone;
- the same physical event has compatible E/P/R/C/N projections that naturally form a product transition;
- local theorem reuse need not imply state equality.

---

## 11. What remains unproved

Not yet established:

- a complete generic canonicalizer for C/N dependency cones;
- that the measured E/P/R signature is sufficient when richer active temporal contracts overlap the event;
- a global decomposition of the 7x6 proof into independent/local cones;
- commutation of arbitrary event operators;
- a complete center-positive proof.

---

## 12. Next bounded seam

The next useful task is not another q-depth experiment.

Build a generic `TypedEventSignature` prototype that derives, for one legal event:

```text
E support effect
P phase/CPC effect
R exact incidence/cofactor effect
C active temporal-contract transition/resource effect
N local dependency guards/consequences
```

Then apply it first to already-qualified certificate families:

```text
same-column stutter pair
cross-support pair
latent target response
phase-debt repair
center response-serialization collision.
```

The target is to identify repeated event-operator classes across formerly separate rule families.

Every experiment remains hard-capped at five minutes.
