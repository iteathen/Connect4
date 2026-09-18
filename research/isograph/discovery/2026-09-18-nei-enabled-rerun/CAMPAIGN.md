# Connect4 Discovery Protocol Campaign — NEI-enabled rerun

**Date:** 2026-09-18  
**Purpose:** rerun the first Connect4 discrepancy campaign after applying Natural Entropic Identity and measure what changes.  
**Canonical owner:** `research/semantic-quotient`  
**Starting head:** `31e276d7f8ebf451f0e53718f840e1ab98eb7538`  
**Base representation authority:** Connect4 IsoGraph 1.1  
**Identity layer:** `connect4-nei-application-0.1`  
**Authority mutation:** none

## Experimental design

The original campaign is the control.

This rerun uses the same frozen discrepancy evidence and the same Discovery Protocol family, with one new capability:

~~~text
when a branch becomes identity-shaped
    -> route through the applied NEI profile layer
~~~

The purpose is not to force NEI into every branch.

The comparison asks:

1. does NEI change any disposition?
2. does it expose hidden structure DP alone left ambiguous?
3. does it close any branch earlier?
4. does it prevent an over-broad quotient?
5. does it add enough value to justify the extra identity machinery?

---

# Lead A — explicit scope metadata vs semantic validity scope

## DP-only result

~~~text
explicit scope metadata
    !=
semantic validity restriction
~~~

with an open question about a possible derivation relation.

## NEI applicability gate

This is not a natural-identity question.

The compared objects are two predicates/properties of a claim representation:

~~~text
explicit_scope_field_present
semantic_validity_restriction_present
~~~

No referent-merging or natural-distinctness conclusion is required.

## NEI-enabled result

**UNCHANGED.**

NEI is explicitly `NOT_APPLICABLE`.

This is useful negative evidence: NEI does not become mandatory overhead merely because the word "same" or "different" could be used informally.

---

# Lead B — repeated relation-count deficits

## DP-only result

The common minimal-generating-basis hypothesis was falsified.

## NEI applicability gate

This is a representation/dependency-factorization question, not an identity question.

The branch asks whether explicit relations are derivable/redundant, not whether two referents are naturally the same.

## NEI-enabled result

**UNCHANGED.**

NEI is `NOT_APPLICABLE`.

The falsified relation-basis branch stays closed.

---

# Lead C — R0045 evidence layers

## DP-only result

The first campaign established:

~~~text
4 citations/artifacts
3 events
2 lineages
cross-lineage independence UNKNOWN
~~~

and retained a supported candidate that the decoder substituted the event layer for the requested source layer.

It informally described this as an evidence "staircase."

## NEI routing

NEI now makes the identity questions explicit:

~~~text
artifact identity
event identity
lineage identity
statistical independence
~~~

These are different profiles/properties.

Applied NEI establishes for the two R0045 lineages:

~~~text
NEI_lineage(
  L-BSFP-ROLLING-SCALING-20260910,
  L-BSFP-COMPACT-CUDA-SCALING-20260910
) = DISTINCT
~~~

while:

~~~text
cross-lineage statistical independence = UNKNOWN
~~~

Therefore:

~~~text
unknown independence
    !=
unknown identity
~~~

## New falsifier — is artifact -> lineage a global quotient function?

The DP-only "staircase" wording suggests a tempting interpretation:

~~~text
artifact
-> event
-> lineage
~~~

as successive global quotient maps.

NEI requires lawful query anchors/projections, so that interpretation was tested.

The authority graph shows artifact `3000222` participates in **five distinct lineages**:

~~~text
L-BSFP-ANTICHAIN-MTBDD-20260910
L-BSFP-LINE-HIT-PRODUCT-20260910
L-BSFP-OQS-RESIDUAL-REUSE-20260911
L-BSFP-ROLLING-SCALING-20260910
L-BSFP-COMPACT-CUDA-SCALING-20260910
~~~

Artifact `3000283` also participates in two lineages.

Therefore:

~~~text
lineage_of(artifact)
~~~

is not a globally single-valued projection.

The valid NEI queries in the applied overlay pin the intended lineage projection explicitly.

## Refined result

The hierarchy is not a global quotient staircase.

It is:

> **a context-scoped typed evidence incidence hierarchy whose identity relation changes by profile.**

The correct shape is closer to:

~~~text
artifact instance
    -- participates-in under claim/evidence context -->
event / lineage structure
~~~

with identity evaluated separately on each carrier.

### Discovery change

~~~text
DP-only:
    4 / 3 / 2 hierarchy established

DP + NEI:
    4 / 3 / 2 hierarchy established
    + lineage identity DISTINCT
    + independence UNKNOWN is non-identity uncertainty
    + global artifact->lineage quotient interpretation FALSIFIED
    + lineage projection must be context-scoped
~~~

This is a material improvement.

---

# Lead D — deductive independence applicability

## DP-only result

~~~text
independence applicability
belongs to evidence-lineage/proof topology
!= claim status
~~~

Claim-status-only derivation was falsified.

## NEI applicability gate

The property being classified is statistical/evidentiary independence applicability, not identity.

NEI is not required to determine whether empirical-independence reasoning applies.

However, NEI supplies one useful guard:

~~~text
different lineage identity
    !=
known statistical independence
~~~

and:

~~~text
same lineage identity
    !=
independent evidence events
~~~

## NEI-enabled result

The original structural result remains unchanged, but the allowed inference space is tighter.

The branch now explicitly prohibits both invalid lifts:

~~~text
NEI DISTINCT lineages
    -> independent evidence        [invalid]

NEI SAME lineage
    -> events are same event       [invalid]
~~~

The evidence model's own independence relation remains authoritative.

### Discovery change

**Precision improved; disposition unchanged.**

---

# Lead E — 10 lineages / 13 events prose slip

No identity hypothesis is required.

NEI is `NOT_APPLICABLE`.

Result remains ordinary prose-level semantic-layer substitution.

**UNCHANGED.**

---

# New Lead F — profile-mediated identity collapse motif

This branch did not exist in the DP-only campaign because there was no applied NEI relation to compare across domains.

## Instances

### F1 — R0044 evidence artifacts

Under artifact identity:

~~~text
artifact A DISTINCT artifact B
~~~

Under explicitly pinned lineage projection:

~~~text
lineage_projection(A) SAME lineage_projection(B)
~~~

### F2 — R0074 reproduction events

Under event identity:

~~~text
historical event DISTINCT canonical reproduction event
~~~

Under lineage projection:

~~~text
lineage_projection(event A) SAME lineage_projection(event B)
~~~

### F3 — SIU-1 physical vs future-behavior state

The exhausted controls contain multiple physical states per relational `q`.

Under physical-state identity:

~~~text
x DISTINCT y
~~~

for distinct physical states.

Under bounded future-behavior identity:

~~~text
q(x)=q(y)
    ->
x SAME y
~~~

## Protocol routing

- DP-10 role-equivalent elements;
- DP-13 multi-scale common structure;
- DP-14 transformation-invariant discovery;
- DP-23 reconstruction structure;
- DP-25 refinement/relation discovery;
- DP-38 semantic-identity candidate discovery;
- NEI profile evaluation.

## Candidate common structure

~~~text
fine carrier F
context/profile C
lawful projection/abstraction pi_C
x,y DISTINCT under fine identity
pi_C(x),pi_C(y) SAME under scoped semantic identity
residual fine distinctions preserved
~~~

## Falsifier 1 — require a global projection

Fails.

Evidence artifacts may participate in multiple lineages, so the evidence-side projection requires context.

Therefore the common structure must permit:

~~~text
pi_C
~~~

rather than one global `pi`.

## Falsifier 2 — require the coarse identity to erase provenance

Fails.

All three cases preserve fine-grained referents/provenance after coarse SAME is established.

## Falsifier 3 — require every profile transition to be a simple carrier quotient

Too strong.

The evidence examples involve context-scoped incidence/projection into a lineage carrier; SIU uses a semantic state projection `q`.

The common invariant is **profile-mediated safe collapse**, not one implementation mechanism.

## Result

~~~text
SUPPORTED_STRUCTURAL_CORRESPONDENCE:

context-scoped identity quotient motif
~~~

Formal working shape:

~~~text
NEI_F(x,y) = DISTINCT

pi_C(x), pi_C(y) defined

NEI_C(pi_C(x), pi_C(y)) = SAME

fine residual/provenance remains represented
~~~

This is now observed in three independent Connect4 structures:

- artifact -> lineage;
- event -> lineage;
- physical state -> future-behavior state.

The correspondence is structural; it does not claim those domains have identical semantics.

---

# New Lead G — 7x6 identity obstruction becomes a discovery target

Before NEI, the state-identity packet said standard 7x6 sufficiency was unproved.

With NEI, the missing obligation is more precise.

The target claim would be:

~~~text
for standard 7x6:
q(x)=q(y)
    ->
NEI_future-behavior(x,y)=SAME
~~~

The applied NEI result is:

~~~text
INCOMPLETE_UNQUALIFIED
~~~

not semantic UNKNOWN.

## Discovery routing

- DP-08 residual discovery;
- DP-11 invariant across admissible variation;
- DP-23 reconstruction structure;
- DP-24 proof topology;
- DP-38 identity candidate.

## Exact missing closure

A future qualification must provide either:

1. a complete/exact coverage proof that same-`q` states have identical declared future behavior on 7x6; or
2. a counterexample pair with same `q` but a differing load-bearing future behavior.

Useful breaker shape:

~~~text
q(x)=q(y)

but one of:
    legal action set differs
    terminal behavior differs
    successor q differs for same action
    strong score differs
    action score differs
    exact W/D/L differs
~~~

## Result

The old vague gap:

~~~text
7x6 remains unproved
~~~

has become a typed identity obligation with a concrete falsifier family.

~~~text
DISCOVERY TARGET REFINED
~~~

No new 7x6 SAME claim is introduced.

---

# Before / after comparison

| Branch | DP-only | DP + NEI |
|---|---|---|
| Scope metadata | distinction established | unchanged; NEI correctly not applicable |
| Relation deficits | common quotient falsified | unchanged; NEI correctly not applicable |
| R0045 evidence layers | 4/3/2 hierarchy + layer-substitution candidate | **stronger:** lineage DISTINCT, independence UNKNOWN separated, global quotient interpretation falsified, context-scoped projection discovered |
| Deductive independence | owner layer established | same disposition, stronger guard against identity→independence inference |
| 10/13 prose slip | ordinary error | unchanged; NEI not applicable |
| Cross-domain identity motif | not available | **new:** profile-mediated safe-collapse correspondence |
| Standard 7x6 state identity | generic unresolved sufficiency | **refined:** exact NEI closure obligation + concrete counterexample shape |

---

# Did NEI make a difference?

Yes, but selectively.

It did **not** improve branches that were not identity questions.

That is a positive result: NEI did not become general-purpose conceptual overhead.

Where identity was load-bearing, it materially improved discovery in three ways:

1. **prevented false collapse**
   - R0045's evidence hierarchy is not a global artifact->lineage quotient;

2. **separated unknown property from unknown identity**
   - unknown statistical independence does not become NEI UNKNOWN;

3. **enabled a new cross-domain structural correspondence**
   - distinct fine-grained referents can become SAME under an explicitly scoped semantic identity profile while their residual/provenance remains preserved.

It also converted standard-7x6 state identity from a vague research gap into a precise falsifiable identity-closure obligation.

## Final disposition

~~~text
NEI_EFFECT_ON_DISCOVERY = MATERIAL_BUT_SCOPED

old branches changed materially         1
old branches precision-improved         1
old branches unchanged / NEI N/A       3
new structural correspondences          1
new refined identity targets            1
false global quotient interpretations   1 falsified
new authority claims                     0
~~~
