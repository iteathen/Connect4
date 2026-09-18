# IsoGraph Quantifiable Unknown Extension — 0.1 Candidate

**Status:** unqualified normative extension candidate  
**Short name:** QU 0.1  
**Core dependency:** `CORE_SPEC_DRAFT_0_17_CONSOLIDATED_QUALIFIED.md` or an exact qualified bridge  
**Native vocabulary:** `extensions/qu/QU_VOCAB_0_1.isg`  
**Growth rule:** adds no core syntax or irreducible IsoGraph primitive; QU terms are extension-owned semantic constructions represented using ordinary IsoGraph structure

---

# 0. Interpretation barriers

Do not collapse these distinctions:

```text
Quantifiable Unknown (QU)
    != opaque UNKNOWN token

QU
    != probability distribution

QU
    != entropy scalar

QU admissible realization
    != arbitrary conceivable world

open structure
    != unbounded imagination

unrepresented fact
    != false
    != automatically possible

semantic unresolvedness
    != incomplete computation / RESOURCE_LIMIT

same QU denotation
    != necessarily same serialization/factorization

Quantifiable Unknown Isomorph (QUI)
    != equality of actual resolutions
    != Natural Entropic Identity SAME

Semantic Identity (SI)
    != natural identity
```

The constitutional rule is:

> QU represents exactly the unresolved alternatives licensed by qualified structure and authority: it preserves every possibility not excluded and excludes every possibility already excluded.

---

# 1. Mission

A Quantifiable Unknown is the maximally constrained, information-preserving structural representation of what remains unresolved within a declared scope.

QU exists so that unknown information remains usable as IsoGraph structure rather than collapsing into a generic missing-value marker.

The principal design target is:

> independently represented systems with the same structural pattern of unresolved information should be able to expose that correspondence through ordinary IsoGraph comparison, factorization, common-core, and isomorphism machinery.

QU therefore represents uncertainty as **open relational structure**: unresolved carriers, unresolved relation occurrences, their known structural roles, constraints, dependencies, interfaces to fixed structure, and the authority defining which realizations remain admissible.

QU does not discover facts, measure reality, choose experiments, run Bayesian inference, maximize entropy, or solve constraint systems. It specifies what a qualified unresolved-information artifact means.

---

# 2. Dependency architecture

The dependency direction is one-way:

```text
IsoGraph Core
    -> QU
        -> optional downstream extensions such as NEI
```

Core supplies SI-addressable structure, incidence, scopes, dependencies, claims, witnesses, provenance, comparison, factorization, and qualification machinery.

QU supplies semantics for unresolved structural information and admissible realizations.

Core does not depend on QU. A core artifact with no QU dependency is interpreted exactly as ordinary IsoGraph.

QU does not depend on NEI or any other downstream consumer. NEI may require QU when an identity result depends on unresolved identity-relevant structure, but QU itself contains no natural-identity rule.

---

# 3. QU semantic state

A QU state `Q` MUST determine, directly or through pinned dependencies, enough structure to recover the following where applicable:

```text
scope / subject domain
fixed represented structure F
open structural region O
possibility universe / admissible domain Ω
constraints C
interfaces/boundaries B between open and fixed structure
scope and closure authority A
provenance + immutable revision dependencies
admissible-realization semantics R(Q)
optional information-measure reference M
```

This list names semantic roles, not a required serialization layout.

The open region `O` may contain, as applicable:

- unresolved value carriers;
- unresolved nodes/objects;
- unresolved relation or edge occurrences;
- unresolved membership/incidence;
- unresolved topology;
- unresolved multiplicity/cardinality;
- unresolved temporal or state alternatives;
- unresolved interpretation/formalization alternatives;
- other extension-defined structural roles.

An implementation or profile MAY use compact symbolic, generative, constraint-based, enumerative, or hybrid representations, provided the QU semantics remain recoverable and qualified.

---

# 4. Unknown is relational structure

A QU MUST preserve known relationships among unresolved elements.

For example, these are not equivalent information states:

```text
A.x -> u1
B.x -> u2
```

and:

```text
A.x -> u
B.x -> u
```

The second representation shares one SI-addressable unresolved referent. The first contains two represented referents and requires any equality or other relation between them to be represented separately.

Likewise:

```text
u1 = u2
u1 + u2 = 10
exactly_one(r1, r2, r3)
```

carry structural information even though the participating values/relations remain unresolved.

A QU MUST NOT replace such relational information with independent opaque `UNKNOWN` markers.

An unresolved relation occurrence may itself be represented structurally. For example, uncertainty about whether relation `R(a,b)` exists may be represented as an open relation occurrence with an admissible presence/absence domain and applicable constraints rather than being forced into an unrelated scalar Boolean encoding.

---

# 5. Possibility universe and authority

Every QU claim is bounded by a declared or derivable possibility universe `Ω` and governing authority.

`Ω` need not be finite or enumerated. It may be described intensionally, for example:

```text
all integers satisfying schema S
all graph completions satisfying constraints C
all parser trees admitted by grammar G
all state transitions admitted by machine model M
all formalizations admitted by source authority A
```

QU does not quantify over arbitrary hidden properties merely because they are conceivable.

Conversely, absence of a represented fact does not create a closed-world negation unless the governing scope/closure authority licenses that conclusion.

A QU therefore requires enough scope authority to distinguish:

```text
allowed unresolved alternative
excluded alternative
fixed fact
out-of-scope possibility
insufficiently specified scope
```

If the artifact does not determine enough authority to know which alternatives are admissible, a complete QU realization-family claim is unqualified/incomplete rather than silently widened to “anything imaginable.”

---

# 6. Admissible realization semantics

Let:

```text
R(Q)
```

denote the exact family of realizations admitted by the pinned QU state.

A realization `r` belongs to `R(Q)` iff, under the governing QU authority, it:

1. preserves every fixed fact in `F`;
2. resolves or instantiates the open region only within `Ω`;
3. satisfies every applicable constraint in `C`;
4. preserves required interfaces/boundaries `B`;
5. satisfies all pinned dependency and side-condition obligations;
6. introduces no out-of-scope hidden structure as if it were licensed uncertainty;
7. violates no qualified exclusion already represented by `Q`.

Semantically:

```text
R(Q) = every realization still permitted by the qualified information state,
       and no realization already excluded by that information state.
```

This is the meaning of **maximally constrained** in QU.

It does not mean an implementation must produce a syntactically minimal constraint set or prove a canonical normal form.

---

# 7. Semantic maximality is not solver strength

The denotation `R(Q)` is determined by the qualified QU state, not by whichever consequences one implementation happened to derive.

If a constraint is logically entailed by the qualified QU authority, realizations violating that constraint are not semantically admissible merely because a particular solver failed to derive it.

Therefore:

```text
semantic QU denotation
    != currently enumerated/derived realization subset
```

An implementation unable to establish the exact property needed for a claim reports the applicable incomplete/resource status. It MUST NOT weaken or enlarge `R(Q)` merely to match its computational capability.

QU follows IsoGraph Core proof-method neutrality: exact theorem/certificate, symbolic proof, exhaustive enumeration, or another qualified method may discharge the same semantic obligation when the governing claim permits it.

---

# 8. Open, determinate, inconsistent, and incomplete states

A QU may describe more than one kind of information state.

## 8.1 OPEN

`R(Q)` contains multiple admissible realizations relevant to the declared scope.

## 8.2 DETERMINATE

The declared scope is fully resolved under the governing authority. Semantically, this may correspond to one admissible realization for the relevant scope.

A consumer is not required to materialize a QU artifact merely to encode zero unresolvedness when its own semantics permit direct determinate evidence.

A qualified information measure associated with a determinate QU may evaluate to zero uncertainty under that measure, but QU does not require Bayesian or entropy semantics to define determinacy.

## 8.3 INCONSISTENT

`R(Q)` is empty because the represented fixed facts, constraints, or dependencies cannot be jointly satisfied under the governing authority.

Empty `R(Q)` MUST NOT make universal claims vacuously true in downstream extensions unless that extension explicitly defines such logic. QU exposes the inconsistency as a distinct semantic condition.

## 8.4 INCOMPLETE_SCOPE

The artifact lacks enough qualified possibility-universe, constraint, or closure authority to establish an exact `R(Q)` for the claim being made.

`INCOMPLETE_SCOPE` is not an admissible realization and is not equivalent to semantic unresolvedness. It is a qualification/completeness limitation.

---

# 9. Structural interfaces and open regions

An unresolved region SHOULD retain explicit interfaces to surrounding fixed structure wherever those interfaces are load-bearing.

For example:

```text
fixed A
   |
   | role R
   v
open u
```

is different from an unattached unknown `u`.

QU SHOULD reuse ordinary IsoGraph ports, incidence, containment, scope, dependency, and boundary machinery rather than inventing a parallel attachment system.

This allows open regions to participate naturally in:

- structural comparison;
- factorization;
- composition;
- common-core extraction;
- provenance/reconstruction;
- downstream identity or invariant reasoning.

---

# 10. Representation independence and factorization

QU defines semantics, not one canonical unknown representation.

Two QU artifacts may denote the same or equivalent realization family while using different lawful factorizations or symbolic descriptions.

For example, a coupled relation:

```text
x + y = 10
x > 0
y > 0
```

and a lawful derived factorization such as:

```text
y = 10 - x
0 < x < 10
```

may be semantically equivalent under a qualified bridge while remaining different represented structures.

QU MUST NOT silently identify such representations without the same factorization/equivalence/provenance discipline used elsewhere in IsoGraph.

There is no mandatory canonical constraint language, canonical factorization, canonical variable naming, or canonical realization enumeration.

---

# 11. Alpha-renaming and Semantic Identity

Open carriers and relation occurrences may use ordinary SI for representation-level addressability.

Lawful alpha-renaming or local namespace changes preserve QU semantics exactly where IsoGraph Core permits them.

SI spelling has no evidential role in determining whether two independently represented unknown structures correspond.

At the same time, sharing one SI within an applicable namespace is not interchangeable with two SIs related by an object-theory equality or other relation. QU preserves that distinction because it may be structurally load-bearing.

QU never upgrades SI equality/inequality into natural/ontological identity evidence.

---

# 12. Claims over a QU realization family

For a proposition/structural claim `φ` with meaning fixed across `R(Q)`:

## NECESSARY

```text
for every r in R(Q): φ(r)
```

## POSSIBLE

```text
there exists r in R(Q): φ(r)
```

## UNRESOLVED

For a binary claim whose positive and negative forms are both meaningful:

```text
there exists r1 in R(Q): φ(r1)
and
there exists r2 in R(Q): not φ(r2)
```

## IMPOSSIBLE

```text
for every r in R(Q): not φ(r)
```

These statuses describe the represented realization family, not computational progress.

`UNRESOLVED` is a positive semantic statement that admissible realizations disagree. Failure to prove `NECESSARY` or `IMPOSSIBLE` is not automatically `UNRESOLVED`.

`INCONSISTENT` remains separate because an empty `R(Q)` cannot establish these statuses by vacuous quantification for QU qualification purposes.

---

# 13. Refinement

A qualified QU state `Q2` is a semantic refinement of `Q1` over a declared common scope when:

```text
R(Q2) ⊆ R(Q1)
```

and the retained realizations preserve the governing meaning/authority required by the refinement claim.

A strict refinement removes at least one previously admissible realization.

Refinement represents learning or adding constraint without rewriting the meaning of retained alternatives.

Changing an assumption, replacing the possibility universe, correcting an erroneous source, or adopting a new incompatible interpretation may be a **revision** rather than a refinement even if the resulting realization family is smaller.

Refinement claims MUST therefore carry the authority needed to distinguish genuine information gain from semantic revision.

---

# 14. Quantification is optional but structurally grounded

A QU is **quantifiable** because its possibility space, constraints, and scope are represented precisely enough that a qualified information measure can be attached when an appropriate measure exists.

QU does not require one universal scalar measure of unknown.

A quantitative information record MAY identify, as required by its measure/profile:

```text
measure/profile authority + immutable revision
QU state / realization family being measured
probability distribution or weighting, if required
reference/prior/base measure, if required
encoding/reference machine, if required
logarithm base / units
measured quantity
value or symbolic bound
proof/certificate/provenance
```

Possible external measures include, without being mandated by QU:

- finite state-count / Hartley-style measures;
- Shannon entropy;
- relative entropy / maximum-relative-entropy outputs;
- physical entropy measures under an applicable physical profile;
- description length;
- algorithmic-information approximations;
- domain-specific uncertainty measures.

A scalar information value is a characterization of the QU state, not a replacement for its relational structure.

Two structurally different QUs may share the same numerical information value.

---

# 15. No mandatory inference or measurement procedure

QU specifies representation semantics only.

It does not prescribe:

- Bayesian updating;
- maximum entropy inference;
- Dempster-Shafer inference;
- imprecise probability;
- symbolic execution;
- SAT/SMT solving;
- theorem proving;
- probabilistic programming;
- experimental design;
- sensor models;
- measurement procedures;
- active information acquisition;
- canonicalization or exhaustive realization search.

Any such method may produce or qualify QU inputs/results under a separately pinned authority. QU records the resulting structure and provenance without making the generating algorithm part of base QU semantics.

---

# 16. Quantifiable Unknown Isomorph (QUI)

A **Quantifiable Unknown Isomorph (QUI)** is a qualified IsoGraph structural isomorphism between declared QU regions under a pinned comparison/view authority.

A QUI may demonstrate that independently represented systems have the same structural shape of unresolved information, including corresponding:

- open carriers/relations;
- structural roles;
- constraints;
- dependency shape;
- interfaces to fixed structure;
- closure/scope structure;
- admissible-domain structure where included by the comparison.

A QUI does not assert that the actual unresolved values are equal, that both systems will resolve the same way, or that corresponding subjects share natural identity.

```text
QUI
    != same actual realization
    != object-theory equality
    != NEI SAME
```

A partial/common-core correspondence between QUs may be valuable without constituting a full QUI. The exact claim type and coverage must remain explicit under ordinary IsoGraph comparison rules.

---

# 17. Unknown-structure discovery objective

The principal interoperability criterion for QU is:

> If two unrelated domains contain the same pattern of unresolved structure, IsoGraph should be able to expose that correspondence without relying on domain names, SI spellings, or human gloss when the governing comparison view makes those features non-load-bearing.

Therefore a QU representation SHOULD expose load-bearing uncertainty structure natively rather than hiding it in opaque formula text or scalar metadata when the structure can be represented relationally.

Opaque source expressions may still be retained for provenance/reconstruction, but a claim that relies on their internal unknown structure requires an appropriate structural representation or qualified bridge.

---

# 18. Cross-realization correspondence

Some downstream claims compare one subject or structural role across multiple realizations in `R(Q)`.

QU does not assume that same SI spelling across realizations proves natural identity or trans-world identity.

Where a downstream claim needs stable subjects across realizations, the QU state/profile MUST provide a lawful correspondence mechanism such as:

- rigid role/carrier mapping;
- explicit realization-local anchor;
- interface/port correspondence;
- qualified counterpart relation;
- another profile-defined mapping.

The correspondence itself has only the semantics its authority grants. Downstream extensions such as NEI may impose stronger conditions.

---

# 19. Temporal and domain-specific unknowns

QU supplies no universal temporal, physical, computational, or mathematical ontology.

A temporal profile may use QU to represent unresolved events, trajectories, manifestations, or transition alternatives.

A programming profile may use QU for unresolved machine states, heap relations, outputs, or execution paths.

A mathematical profile may use QU for unresolved model choices, witness families, interpretation alternatives, or constrained values.

A physical profile may use QU for unresolved states or parameters.

The domain profile owns the domain semantics. QU owns the general structure of qualified unresolved alternatives.

---

# 20. Provenance and reconstruction

QU does not destroy or replace source information.

A QU artifact MUST preserve enough provenance and dependency structure to determine:

- which source/revision supplied each fixed fact or constraint when load-bearing;
- which authority defines the possibility universe and closure scope;
- which transformations/factorizations produced a derived QU representation;
- which bridge establishes equivalence between alternate QU representations when claimed;
- which information measure/profile produced any attached quantitative characterization.

Derived realization-family or QUI claims do not silently replace their source structures.

Existing IsoGraph residual/reconstruction obligations apply where transformations change representation.

---

# 21. Anti-circularity

A downstream target claim MUST NOT choose or restrict the QU state solely to make that target claim true.

Forbidden examples include:

```text
choose Ω only from worlds where desired identity holds
-> use resulting QU as evidence for that identity
```

```text
remove an admissible realization because it breaks a desired QUI
-> claim the remaining QUs are isomorphic
```

```text
choose a probability/entropy measure because it produces the desired ranking
-> treat that ranking as proof that the underlying QU was correctly scoped
```

A QU possibility universe, constraint, closure declaration, or refinement may be used as evidence only when independently authorized relative to the target claim.

Exploratory restricted QUs may be recorded as hypotheses/scenarios but MUST NOT be silently promoted into qualified base uncertainty.

---

# 22. Native representation and no new syntax

QU uses ordinary IsoGraph scopes, SIs, ordered incidences, stable labels, dependencies, profiles, claims, witnesses, certificates, ports, and reconstruction machinery.

The extension-owned numeric vocabulary in `QU_VOCAB_0_1.isg` supplies stable native roles for QU records. Those labels are namespaced to the QU extension revision and are not core-reserved tokens.

QU introduces no dedicated parser token, wildcard literal, probability syntax, unknown scalar type, mandatory constraint language, canonical solver, or realization enumerator.

A profile may expose convenient syntax externally, but qualification depends on recoverable native QU semantics rather than surface notation.

---

# 23. Claim and evidence records

A qualified QU claim records enough structure to recover, where applicable:

```text
QU extension/profile immutable revision
subject/scope
fixed structure reference
open-region reference
possibility-universe/domain authority
constraint set / dependencies
interface/boundary structure
closure/scope authority
realization-family claim
claim type (NECESSARY/POSSIBLE/UNRESOLVED/IMPOSSIBLE/etc.)
witness/certificate references
coverage/completeness status
provenance
verification status
resource/computation status
optional information-measure reference
```

Proof burden is claim-typed.

A universal claim over `R(Q)` requires sufficient coverage/universality evidence. An existential claim requires a verified admissible witness. `UNRESOLVED` requires both a verified positive and negative admissible realization (or an exact certificate proving both exist). `INCONSISTENT` requires proof that no admissible realization exists.

A stronger complete-family enumeration is not required when an exact qualified certificate discharges the stated obligation.

---

# 24. Failure classification

Before revising QU semantics, classify a failure as one of:

```text
core/SI misunderstanding
possibility-universe/scope defect
closure-authority defect
open-region representation defect
constraint/admissibility defect
interface/boundary defect
realization-family defect
cross-realization correspondence defect
refinement-vs-revision defect
QUI/comparison defect
information-measure/profile defect
proof-coverage defect
circular-evidence defect
provenance/reconstruction defect
implementation/search defect
non-defect / reviewer misunderstanding
```

Do not repair a failed case by silently widening or narrowing `R(Q)` to obtain the desired downstream result.

---

# 25. Minimum future qualification targets

QU 0.1 remains unqualified. Before promotion, adversarial qualification should demonstrate at least that:

1. ordinary core artifacts decode without QU semantics;
2. independent opaque `UNKNOWN` markers cannot substitute for represented relational constraints when those constraints are load-bearing;
3. shared unresolved referent and two distinct constrained-equal referents remain distinguishable;
4. lawful alpha-renaming preserves QU semantics;
5. an intensional QU can denote a large/infinite realization family without eager enumeration;
6. excluded realizations cannot reappear merely because an implementation did not derive a constraint;
7. unrepresented facts do not become false by default and do not become arbitrary admissible hidden facts without authority;
8. `OPEN`, `DETERMINATE`, `INCONSISTENT`, and `INCOMPLETE_SCOPE` remain distinct;
9. semantic `UNRESOLVED` is distinguishable from incomplete computation;
10. a valid refinement narrows `R(Q)` while an incompatible assumption change is classified as revision rather than refinement;
11. two differently named but structurally corresponding open regions can expose a QUI under an appropriate comparison authority;
12. equal entropy/information scalars do not imply QU structural isomorphism;
13. a QUI does not imply equal actual resolutions or NEI `SAME`;
14. cross-realization subject correspondence is explicit when required by a downstream claim;
15. a downstream desired result cannot circularly determine the QU possibility universe or constraints used to prove it.

These are future qualification obligations, not prescribed algorithms.

---

# 26. Working constitutional summary

QU 0.1 is governed by four rules:

1. **Preserve all known structure of the unknown.** Unknowns remain relational, constrained, and connected to their fixed context.
2. **Admit exactly what remains possible under qualified authority.** Do not retain excluded realizations and do not invent unlicensed hidden possibilities.
3. **Keep the structure searchable.** The unknown itself must remain available to IsoGraph comparison, factorization, common-core, and isomorphism reasoning.
4. **Quantification is optional and subordinate to structure.** Information measures may characterize a QU, but they do not replace its realization semantics or relational form.

The resulting object is not a placeholder for missing knowledge. It is a first-class structural representation of the remaining information space.
