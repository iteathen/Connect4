# Temporal contract automata and the latent-target cross-pair

**Date:** 2026-09-13  
**Status:** exact local scheduler theorem + generic C/N representation proposal; not a complete 7x6 safety proof  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Formalize the current latent-singleton scheduling seam without creating another independent logic.

The result is twofold:

1. the existing typed C-layer resource contract is lifted to a small guarded temporal automaton so that conditional activation, forbidden responses, contingent deadlines and resource release are represented explicitly;
2. the fixed `466565554644` C3/G3 hinge has an exact local composite defense that was invisible to direct blocker-subset candidate generation.

No solved W/D/L label is used below.

---

## 1. Temporal contract automaton

A typed response/resource contract may have internal temporal state.

Use the generic form:

```text
TemporalContract T = {
  states,
  initialState,
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

This extends, rather than replaces, the existing typed resource-contract interface.

The previous one-step form:

```text
trigger -> required response before deadline
```

is a two/three-state specialization.

The automaton layer is needed when a certificate says things such as:

```text
wait while target is inaccessible
forbid one tempting response because it loses immediately
activate a response obligation only after a later support event
release a new support/resource region after the response
```

Those distinctions are temporal policy state and cannot be recovered from blocker coverage alone.

---

## 2. Relationship to existing response-matroid machinery

The response matroid remains valid as a **snapshot view**.

For automaton state `q`, derive the currently active response obligations:

```text
Active(q) = { o_1, ..., o_n }
```

with legal response-slot/action neighborhoods:

```text
A_q(o) subset_of available defender response slots/actions.
```

Then the existing matching/rank/circuit calculus applies to `Active(q)`.

The automaton owns:

```text
when an obligation becomes active
when it becomes discharged
which responses are forbidden
which resources are released/consumed
which later obligations are generated
```

The response matroid owns simultaneous feasibility of the currently active obligation family.

Thus:

```text
TemporalContract automaton
  -> active-obligation snapshot
  -> response-matroid rank/circuits
```

is composition, not competing semantics.

---

## 3. Existing rule shapes as automata

Several previously separate-looking structures compile into this representation.

### Immediate response pair

A Claimeven-like or generic response-pair fragment has the shape:

```text
Idle
  -- opponent trigger -->
Pending(response, next defender turn)
  -- required response -->
Satisfied
```

Missing the deadline enters `Failed`.

### Cross support pair

A Baseinverse-shaped directly playable pair `{x,y}` has:

```text
Idle
  -- P0:x --> require P1:y next
  -- P0:y --> require P1:x next
```

This contract need not directly be a blocker subset of the eventual residual it helps defend. It can instead control the support schedule of a later target.

### Before-like contingent response

A Before-style certificate is naturally a composite/disjunctive temporal automaton:

```text
lower-group completion mode
OR
opponent lower-event trigger -> successor response mode
```

This note does not promote a complete generic Before compiler; it identifies the correct owning representation.

### Latent singleton watcher

For support chain:

```text
x1 < x2 < x3
```

with live opponent singleton target `x3`, an ordinary vertical response:

```text
P0:x1 -> P1:x2
```

may be forbidden when it makes `x3` immediately playable to P0.

The useful contract may instead wait for P0 to supply the middle support event and then require:

```text
P0:x2 -> P1:x3 on the next defender turn.
```

This has a contingent deadline: the deadline does not exist until `x2` occurs.

---

## 4. Fixed hinge context

Use exact state:

```text
466565554644
```

Previously established:

```text
LiveSingleton(C3)
LiveSingleton(G3)
```

and the old direct vertical responses are poisoned:

```text
P0:C1, P1:C2 -> P0:C3 terminal
P0:G1, P1:G2 -> P0:G3 terminal
```

The earlier direct-blocker A1-A9 fragment census found zero candidate instances touching the two precursor requirements:

```text
{C3,D3}
{D3,G3}
```

That result remains correct for the candidate generator it tested.

The new theorem explains its blind spot.

---

## 5. Hidden support-pair isomorphism

At `466565554644`, both base support cells are directly playable:

```text
C1
G1
```

Pair them as a cross-support response contract:

```text
P0:C1 -> P1:G1
P0:G1 -> P1:C1
```

After either response, the support state is:

```text
height(C)=1
height(G)=1
P0 to move
```

Now each live singleton target becomes an ordinary delayed response obligation:

```text
P0:C2 -> P1:C3
P0:G2 -> P1:G3
```

Therefore the pair of latent target contracts composes as:

```text
cross-pair the two lower support events
then answer each attacker middle advance at its target
```

This is structurally Baseinverse-shaped at the support layer even though no direct Baseinverse blocker is a subset of `{C3}` or `{G3}`.

The same mathematical fragment was hidden by a change in observation:

```text
legacy view: blocker coverage of winning requirements
new view:   temporal control of support events that later expose a winning requirement
```

---

## 6. Finite abstract scheduler theorem

Restrict temporarily to the two support chains:

```text
C1 < C2 < C3
G1 < G2 < G3
```

with P0 choosing which unresolved chain to advance and P1 following the contract above.

The complete P0-decision-state set is exactly:

```text
(0,0)
(1,1)
(3,1)
(1,3)
(3,3)
```

where each coordinate is the number of consumed events in that support chain.

Policy:

```text
(0,0):
  P0 C1 -> P1 G1 -> (1,1)
  P0 G1 -> P1 C1 -> (1,1)

(1,1):
  P0 C2 -> P1 C3 -> (3,1)
  P0 G2 -> P1 G3 -> (1,3)

(3,1):
  P0 G2 -> P1 G3 -> (3,3)

(1,3):
  P0 C2 -> P1 C3 -> (3,3)
```

P0 is never presented a target cell on its turn.

There are four complete target-only attacker schedules, corresponding to the two choices at `(0,0)` and the two choices at `(1,1)`.

---

## 7. Exact standard-7x6 embedding

Prototype:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-latent-target-contract-automaton.mjs
```

Workflow:

```text
.github/workflows/frontier-latent-target-contract-automaton.yml
```

Workflow run:

```text
34801047093
```

The workflow has both:

```text
timeout-minutes: 5
inner timeout: 270 seconds
```

Actual control execution completed in well under one second.

For all four abstract target-only schedules, exact C4-0010 transitions establish:

- every prescribed event is legal;
- no P0 event is terminal before its prescribed response;
- each target is still a live P0 singleton immediately before P1 occupies it;
- P1 occupation of the target removes that singleton;
- all four schedules end with both C3 and G3 singleton obligations discharged;
- no solved W/D/L label is used.

Representative traces include:

```text
P0 C1, P1 G1, P0 C2, P1 C3, P0 G2, P1 G3
P0 C1, P1 G1, P0 G2, P1 G3, P0 C2, P1 C3
```

plus the two C/G-reflected starts.

---

## 8. Consequence for the earlier fragment census

The earlier statement:

```text
historical A1-A9 direct blocker vocabulary has a blind spot at the D3 hinge
```

must now be sharpened.

The **direct blocker projection** has the blind spot.

A Baseinverse-shaped support pair is in fact relevant, but its consequence appears only after composing:

```text
support pairing
-> future support exposure
-> contingent target response
-> singleton discharge
```

Therefore candidate generation based only on:

```text
blocker subset_of current residual
```

is incomplete for temporal composite certificates.

This is another instance of observation-sensitive projection congruence.

---

## 9. New exact/structural architecture

The C/N interface should therefore be:

```text
primitive structural facts
  -> TemporalContract instances
  -> guarded automaton transitions
  -> active response-obligation snapshot
  -> response rank/circuit/compatibility
  -> consequences emitted back into NDC
  -> WSL/blocker/residual updates
```

Named historical rules may be used as credited generators/regression witnesses, but the compiled proof object should retain only generic temporal semantics.

A candidate compiled object is:

```text
TemporalContractCertificate {
  automatonState,
  eventGuards,
  requiredActions,
  forbiddenActions,
  resourceClaims,
  phaseEffects,
  activeDeadlines,
  consequences,
  ndcGuards,
  rankOrHorizon,
  provenance
}
```

---

## 10. What this resolves

Established:

- one-step typed resource contracts are a strict specialization of temporal contract automata;
- response-matroid logic is a snapshot feasibility view of active temporal-contract obligations;
- the C3/G3 hinge is not locally an unavoidable two-target scheduling contradiction;
- the two targets admit an exact finite local scheduler;
- its first operation is isomorphic to a Baseinverse-style directly playable pair at the **support** layer;
- direct WSL-blocker coverage failed to reveal that isomorphism because it observed the wrong consequence layer.

This lowers the Bayesian research priority of `two latent targets are intrinsically incompatible` and raises the usefulness of `temporal contract composition`, but those epistemic changes remain outside exact logic.

---

## 11. What remains unresolved

The local theorem intentionally does **not** claim a full P1 policy from `466565554644`.

P0 may play outside C/G while a latent target is pending.

Also, after P1 takes C3 or G3, the upper tail of that column becomes newly relevant:

```text
C4 < C5 < C6
or
G4 < G5 < G6
```

Those released events can change parity/resource obligations and may interact with the remaining target and with the bottom/row5 residual subsystem.

Therefore the next missing operation is temporal-contract **stutter/product composition**:

```text
external two-ply response macro
+ proof that it preserves the latent-contract state
=> stutter transition
```

followed by explicit accounting for the odd upper-tail reservoir released when a target is consumed.

A stutter transition is sound only if it preserves every load-bearing downstream observation:

- target support/accessibility;
- live singleton status;
- CPC reservoir effect;
- active resource/deadline obligations;
- terminal safety;
- relevant NDC guards.

This is exactly the repository's observation-sensitive projection-congruence rule applied to temporal automata.

---

## 12. Next bounded seam

Do not expand the q frontier.

At the fixed state, classify only:

1. off-target two-ply macros that are exact stutters for the C3/G3 automaton;
2. the resource/phase effect emitted when C3 or G3 is consumed;
3. whether the upper-tail release can itself be normalized into a small temporal-contract state rather than a physical-history branch.

Success would give a compositional product theorem:

```text
latent-target scheduler
x
stutter-safe external response policy
x
post-target tail contract
```

with response-matroid/NDC checks only at the interfaces.

Stop if the representation starts carrying one state per physical continuation.
