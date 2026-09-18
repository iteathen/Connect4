# IsoGraph Core Specification — Draft 0.17 Consolidated Qualified

**Status:** qualified consolidated authority; narrow Semantic Identity description correction applied  
**Historical lineage:** qualified Draft 0.16 consolidated authority + Draft 0.17 Semantic Identity scope correction  
**Authority:** self-contained current qualified semantic authority for Draft 0.17 artifacts  
**Historical rule:** older artifacts remain evidence under the semantics recorded at their revision  
**Growth rule:** this consolidation adds no surface syntax, domain operator, structural class, comparison relation kind, D/E transformation kind, irreducible primitive, or external identity-extension semantics

This document consolidates the qualified Draft 0.16 authority plus the Draft 0.17 Semantic Identity description correction into one current authority. A Draft 0.17 decoder or verifier does **not** need to replay the amendment chain to determine current semantics.

Draft 0.16 remains immutable historical qualification evidence at its recorded revision. Draft 0.17 does not retroactively reinterpret Draft 0.16, Experiment 005, or earlier evidence. Its only core correction narrows the description of the existing bare-ID mechanism to representation-level Semantic Identity (SI). The operational ID behavior qualified under Draft 0.16 is unchanged.

---

# 0. Interpretation barriers

Do not collapse these distinctions:

```text
surface syntax
    != irreducible substrate

source-faithful representation
    != comparison view

Semantic Identity (SI)
    != member occurrence

factorization
    != normalization

one valid factorization
    != canonical factorization

native representability
    != dedicated syntax

retrieval hint
    != structural evidence

source/D residual
    != pairwise comparison residual

class label
    != class-membership evidence

semantic equivalence
    != structural isomorphism

rule existence
    != rule activation

NAC object existence
    != NAC evaluation

canonical serializer output
    != unique structural witness

evidence obligation
    != discovery algorithm

one verified witness
    != complete witness family

local factorization-node claim
    != factorization-space completeness

witness equivalence in one frozen claim context
    != global witness equivalence
```

These are not informal suggestions. They are constraints on the mental model required to interpret the rest of the specification correctly.

---

# 1. Mission and constitutional constraints

IsoGraph is an agent-native structural knowledge representation intended to maximize:

```text
durable correct synthesis / total lifecycle cost
```

subject to:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- preservation of load-bearing distinctions;
- exact composition constraints;
- required provenance;
- recoverability.

The working substrate hypothesis is:

```text
knowledge = scoped relational structure + lawful structural transformation
```

The native path is:

```text
IsoGraph -> agent -> IsoGraph
```

No mandatory English, JSON, theorem-language, database, tokenizer-specific, or model-specific translation layer belongs to native semantics.

The scoped relational / hypergraph-like rewrite substrate remains experimentally falsifiable.

The target is not a large ontology of familiar names. The target is a small information-preserving substrate plus reusable, versioned structural constructions/classes whose labels help agents recognize structure only after the underlying shape is exposed.

---

# 2. Isomorphism and discovery constitution

IsoGraph succeeds only if independently expressed structures can expose common shape without either:

- missing a real correspondence because labels, IDs, syntax, namespaces, factorization, indexing, extraction, serialization, or source convention differ; or
- manufacturing a false correspondence by deleting, parameterizing, quotienting, projecting, or ignoring a load-bearing distinction.

The governing order is:

```text
source evidence / source interpretations
-> independent qualified factorization and extraction sets
-> representation-only normalization
-> structural-only candidate retrieval path
-> frozen native comparison policy
-> structural search
-> native candidate witness / certificate
-> structural obligation verification
-> witnessed relation / common-core / residual result
-> class recognition or new-class hypothesis
-> retained useful labels with provenance
```

Labels are downstream handles. They are not evidence for their own structural meaning.

Expected analogy, desired class, registry mapping, scorer answer, peer-object decomposition, preferred factorization, or human gloss MUST NOT choose the decomposition/extraction/policy later cited as evidence for the same claim.

For qualification of the representation hypothesis, at least one candidate-generation path MUST operate from discovery-visible native structure without requiring source-domain names, expected analogies, registry mappings, or existing class labels for the unknown instance.

Label-assisted, class-assisted, and learned-semantic retrieval may run in parallel as separately measured acceleration channels.

---

# 3. Semantic authority, revisions, and bundles

Every canonical bundle identifies the applicable semantic revision/profile through explicit native bundle structure or an enclosing native corpus contract supplied with the artifact.

Revision/profile identity is required for decoding but is non-evidential for cross-domain matching unless revision metadata is explicitly included in the comparison view.

A qualified schema, profile, policy, index, source, factorization rule, verification contract, or witness revision MUST resolve to immutable content.

Acceptable bindings include content digests, immutable repository/blob/object revisions, or an equivalent integrity binding represented by the artifact authority.

A mutable navigation label may point to a current revision, but qualification evidence pins the immutable revision actually used.

```text
same navigation label
!=
same qualified semantic revision
```

Old witnesses do not silently qualify changed content.

Manifest/bundle structure is ordinary native structure, not a new primitive merely for convenience.

---

# 4. Representation layers

## 4.1 Candidate irreducible substrate

Strongest current primitive candidates are:

- opaque Semantic Identity (SI);
- ordered incidence / hyperedge;
- structural scope / boundary;
- binding ownership needed for structural matching;
- structural rewrite;
- negative structural match condition, still subject to elimination testing;
- transparent references as non-semantic serialization compression.

Even these remain experimentally falsifiable.

## 4.2 Primitive/model leaves

A theory may supply leaves such as:

- object/world/state identities;
- atomic valuation/incidence facts;
- one-step transition/accessibility/reduction edges;
- heap address/value incidence;
- source algebraic operations/relations with explicit axioms;
- observations;
- stipulated source axioms.

A source name does not prove primitive status.

A load-bearing leaf SHOULD identify its authority category, for example:

```text
observational/model input
stipulated source axiom/relation
frozen implementation/environment fact
currently undecomposed candidate primitive
proven irreducible representation primitive
```

Hidden live environment state is not semantic authority.

## 4.3 Derived constructions and structural classes

Known compound semantics expose faithful lower structure where available.

Examples include:

```text
knowledge            -> accessibility + satisfaction
common knowledge     -> group relation + path closure + satisfaction
public announcement  -> predicate-selected restriction + post-update satisfaction
temporal operators   -> trace/position structure + satisfaction
CTL                   -> branching transitions + generated paths + satisfaction
separating *          -> disjoint resource decomposition + satisfaction
Hoare validity        -> transition + pre/post satisfaction
closure               -> explicit path/reduction structure
proof/derivability    -> proof objects + explicit rule authority
function application  -> represented function model
finite fold           -> indexed structure + combiner
```

## 4.4 Candidate compact surfaces

Available parseable surfaces include:

```text
#n
#p/q
^n
A => B
A == B
~A
{ ... }
*?n BODY
+?n BODY
\?n BODY
ABSTRACTION @@ ARGUMENT
```

Parseability means only:

```text
this serialization can be parsed and preserved
```

It does **not** mean:

```text
this constructor is an irreducible substrate primitive
```

A useful surface may be an irreducible primitive, canonical lower-structure surface, exact-value shorthand, profile-owned constructor, structural-class alias, or rejected redundancy. Promotion is evidence-driven.

---

# 5. Surface grammar and deterministic parsing

Conceptual grammar:

```text
id       := integer
literal  := #integer | #integer/integer
label    := ^integer
var      := ?integer
ref      := @integer

edge     := (term ...)
choice   := {term ...}
negmatch := !term
neg      := ~term
forall   := *var term
exists   := +var term
abstract := \var term
eq       := term == term
implies  := term => term
rule     := scope > scope
instantiate := term @@ term

term       := id | literal | label | var | ref
            | edge | scope | choice | negmatch | neg
            | forall | exists | abstract | eq | implies
            | rule | instantiate

scope_item := term | ref_binding
scope      := [scope_item ...]
ref_binding := ref = term
```

A reference binding is a serialization directive, not a generic semantic term.

Whitespace is non-semantic except as token separation.

During the qualification freeze:

- `()` always denotes ordered incidence; it is not transparent parser grouping;
- there is no implicit precedence or associativity among `@@`, `==`, and `=>` beyond one explicitly parsed infix constructor;
- more than one un-delimited infix occurrence at the same serialization level is invalid/ambiguous and MUST be rejected rather than guessed;
- forms such as `A == B == C`, `A @@ B @@ C`, or `A => B == C` are invalid unless intended nesting is explicitly represented by a semantic/native constructor supplied by the profile/schema;
- ordinary scope or ordered-incidence wrappers MUST NOT be used as accidental non-semantic parentheses.

A future transparent grouping surface requires evidence that this conservative rule is materially inadequate.

---

# 6. Semantic Identity, namespaces, literals, and stable labels

## 6.1 Semantic Identities

Bare integers are opaque Semantic Identity (SI) handles.

Within one SI namespace:

```text
same SI = same represented referent
```

Different bare SIs are distinct represented referents for core addressing, sharing, matching, allocation, and reconstruction semantics.

These statements define representation-level reference only. SI equality or inequality is not, merely by existing, independent evidence for any stronger identity relation supplied by an object theory, profile, or external semantic extension.

In particular:

```text
same SI
    != proof of a stronger externally defined identity relation

different SI
    != proof of stronger natural/ontological distinctness
```

A stronger identity authority may use SI-addressable referents as its carrier and may derive additional relations over them, but it does not retroactively change what the SI tokens mean. Any transformation that coalesces, splits, or rerenders SI referents remains an explicit qualified transformation with the applicable provenance/reconstruction obligations.

Bare SI spelling may alpha-map where the frozen comparison policy permits.

Independent top-level documents/bundles do not share SI merely because numeral spellings match.

Cross-document SI continuity requires explicit shared namespace, import/export mapping, port relation, or qualified partition witness.

## 6.2 Nested namespace inheritance

A nested scope inherits its enclosing SI namespace by default.

If inner and outer structure use the same bare SI under one inherited namespace, they refer to the same represented referent.

A nested construct may introduce a distinct local SI namespace only when that fact is explicit/recoverable. Relationships between local and enclosing SIs then require a hygienic import/export/port/renaming bridge.

## 6.3 Exact literals

`#n` and reduced `#p/q` denote exact values and are rigid by default.

Canonical rational rules:

- denominator nonzero;
- reduced to lowest terms;
- denominator positive;
- sign on numerator;
- negative zero canonicalizes to zero;
- floats are not canonical exact literals.

A class may expose a literal position as a predeclared parameter slot. That is parameterization, not alpha-renaming.

Literal-token irreducibility remains open.

## 6.4 Stable labels

`^n` is stable inside its owning namespace.

Semantic label identity is at least:

```text
(namespace, local label id)
```

unless a shared/global namespace is explicitly represented.

Identical numeric labels in independent namespaces are not sameness evidence, and different numeric labels do not block a mapped-signature correspondence under a view that permits mapping.

Stable labels are not N1 alpha-renamable merely because a later VS comparison may map selected labels.

Class/schema labels and revisions obey the same namespace discipline.

---

# 7. Ordered incidence

`(A B C)` is one ordered incidence object.

Tuple position is load-bearing unless a qualified schema/definition says otherwise.

No position is universally privileged merely by being first.

A label-headed edge is a useful relation/application surface, but mathematical predicate/function semantics remain theory/class-owned.

Equivalent source conventions with different argument orders require an explicit role/schema mapping. Arbitrary tuple permutation is not isomorphism.

---

# 8. Scopes, occurrences, and carrier roles

`[ ... ]` is an unordered structural scope/boundary/container.

## 8.1 Occurrence-preserving default

Direct member order is non-semantic, but direct member occurrence multiplicity is semantic by default.

```text
[X X]
```

contains two member occurrences unless an explicit qualified quotient/profile establishes idempotent/set-like semantics.

## 8.2 Semantic Identity is not occurrence identity

A direct scope member is an occurrence referring to a represented term/referent.

```text
[7 7]
```

contains two direct member occurrences referring to SI `7`; it does not create two SIs.

Removing one occurrence removes only that membership occurrence. It does not destroy SI `7`, cascade-delete other incidences mentioning `7`, or imply referent destruction.

Global deletion, cascading incidence removal, garbage collection, ownership destruction, or lifetime semantics require an explicit represented/profile construction.

If an occurrence itself requires persistent SI, ports, provenance, or relations, reify that occurrence explicitly.

## 8.3 Raw scope has no imported domain meaning

Raw scope is not intrinsically:

- conjunction;
- mathematical extensional set;
- ordered list/sequence;
- idempotent collection;
- active execution state.

Those meanings require represented construction/profile structure.

## 8.4 Carrier roles

If two otherwise identical carriers behave differently because of grouping, state, quotation, module, execution, or another role, that role must be recoverable from native structure/profile. Reader intent is not semantic authority.

---

# 9. Boundaries and ports

Crossing SI is a useful interface cue but not a complete component contract.

Where composition matters, interfaces may include:

- exposed SIs;
- port roles;
- direction/variance/mapping rules;
- cardinality constraints;
- ownership/support/timing constraints;
- gluing conditions.

Source/component ports are frozen independently before pairwise comparison. Comparison maps existing ports; it does not invent ports to improve a match.

---

# 10. References and serialization directives

References are non-semantic serialization compression.

## 10.1 Reference-binding placement

A `ref_binding` is legal only in a serialization environment that explicitly permits binding directives; ordinary scope-level serialization environments are the default supported location.

A reference binding is forbidden as:

- an ordered-edge positional child;
- a declarative-formula operand;
- a choice alternative;
- any position where its disappearance after N0 would change semantic arity or member occurrence structure.

After N0 resolution, the binding directive occupies no semantic member occurrence.

## 10.2 Visibility and dependency

Sibling textual order inside an unordered serialization scope does not determine reference meaning.

Visible bindings are unique. Shadowing is invalid. Reference dependency is acyclic unless an explicit recursive-reference construct is separately qualified.

## 10.3 Hygienic structure-preserving resolution

N0 reference resolution preserves:

- SIs inside the referred term;
- lexical ownership/capture status;
- incidence/sharing relationships;
- use-site occurrence multiplicity.

Resolution is graph/DAG substitution, not naïve textual macro copying.

A referred term is closed relative to its binding environment or carries enough environment for capture-avoiding expansion.

Repeated uses of one reference may create multiple use-site occurrences while preserving SIs inside the referred structure. The reference handle does not identify those use-site occurrences.

N0 may remove the binding directive only because valid placement guarantees its removal cannot erase a semantic tuple position or member occurrence.

---

# 11. Variables and binding ownership

Variable numbers are local serialization handles with reconstructable owners/roles.

Possible owners include:

- rewrite patterns;
- explicit quantifiers;
- lexical abstractions;
- schema/pattern parameter interfaces;
- another qualified represented binder/interface.

Rules:

- repeated same variable within one owner requires one binding;
- distinct variables may alias the same SI referent unless explicit disequality/distinctness forbids it;
- disjoint sibling binders may reuse the same number;
- nested rebinding of a still-visible same-number binder remains invalid in this candidate;
- capture-avoiding alpha-renaming preserves structure;
- unowned variables in contexts requiring closed/qualified terms are invalid rather than guessed;
- NAC-only variables must already be positively bound or explicitly scoped by the matching profile.

Declarative constructors do **not** introduce variable ownership by themselves:

```text
A => B
A == B
~A
{A B ...}
```

A standalone object asserted to be a closed declarative proposition is invalid if any variable remains unowned/free.

Open formula/schema terms are legal only when the containing native interface explicitly owns and exposes their free-variable interface.

There is no implicit universal quantification, existential quantification, or wildcard/pattern interpretation merely because `?n` appears in a declarative surface.

---

# 12. Rewrite objects and execution

`[LHS_members] > [RHS_members]` represents a first-class rewrite object. Existence does not imply activation.

## 12.1 Rule-side outer containers

The outermost left and right brackets of a rule are pattern/replacement containers.

They define:

- the multiset/pattern of direct member occurrences selected from the declared application scope; and
- the multiset of instantiated direct member occurrences added to that application scope.

The outer rule-side brackets are not themselves matched or inserted as nested semantic scope members.

To match or construct a literal nested scope member, nest a scope as a member, for example:

```text
[[A B]] > [...]
[...] > [[A B]]
```

This convention applies only to rule-side execution containers. It does not make ordinary nested scopes transparent or flattenable.

## 12.2 Activation profile

Active/inert status is owned by represented execution profile/activation structure.

Historical direct-child activation is a legacy profile only when explicitly selected.

Serialized rule order never implies priority unless the execution profile represents priority/order.

## 12.3 Boundary-respecting matching

A rule matches only within its declared application boundary and does not flatten or cross nested scopes implicitly.

## 12.4 Occurrence-preserving update

A match selects an instantiated LHS submultiset of direct member occurrences.

Default successor:

```text
S' =
  (S multiset-minus instantiated_direct_members(LHS))
  multiset-plus instantiated_direct_members(RHS)
```

with unmatched context retained.

Multiset subtraction/addition operates on selected member occurrences, not object destruction.

Idempotent/set update is a derived profile/quotient.

## 12.5 Variables and freshness

An ordinary RHS-only variable is invalid unless its value is supplied by explicit represented generation/freshness structure.

`+?n` is not overloaded as freshness solely by RHS position.

Any qualified fresh-allocation construction exposes at least:

```text
allocation SI namespace
pre-application occupied-SI set / membership authority
fresh result SI
constraint: result SI was not occupied in that SI namespace before the event
allocation/application event SI when concurrent or independent allocations are load-bearing
```

No dedicated fresh token is required while this can be faithfully represented using ordinary native structure.

Two allocations in independent SI namespaces may serialize with the same local numeral and remain distinct SIs. Later composition may capture-avoidably alpha-rename local fresh SIs under an explicit hygienic namespace bridge. Fresh SI allocation by itself makes no claim about any stronger external identity relation.

Same-SI-namespace concurrent allocation must represent enough event/occupancy structure to prevent two events from silently selecting the same SI.

## 12.6 Negative application conditions

`!X` denotes a first-class negative structural match-condition object, not declarative falsity.

Its mere presence does not execute a query against an ambient scope.

Evaluation requires a matcher/pattern/execution profile that explicitly supplies:

```text
application/match boundary
compatible positive bindings
completeness/open-world assumptions when relevant
condition-consumption role
```

Outside such a consuming matcher context, `!X` is inert represented condition/data structure.

```text
NAC object exists != NAC evaluated
```

A profile may reject NAC placement outside designated pattern positions, but that is explicit profile validation rather than hidden ambient evaluation.

## 12.7 Multiway semantics and application events

Absent explicit strategy/priority, every valid rule/match application is a legitimate successor event.

Distinct applications remain distinct derivation events even when successor states are structurally identical.

An application witness may record rule, match, binding, boundary, allocation event, and successor relation. Event quotienting is explicit profile behavior.

Search/scheduling/pruning order is non-semantic unless represented.

---

# 13. Declarative surfaces

## 13.1 Implication

`A => B` is a declarative implication surface. It does not execute rewrite and does not choose a proof calculus.

## 13.2 Equality

`A == B` is object-theory equality, not Semantic Identity (SI). Pure structural comparison does not coalesce SIs because an object formula asserts equality.

Any equality-induced quotient/collapse is an explicit semantic/projection transformation. A separately defined stronger identity system may admit a qualified equality theory as evidence only under that system's own authority; core equality supplies no such bridge by itself.

## 13.3 Negation

`~A` is declarative negation with profile-owned laws and is distinct from `!A` structural negative match.

## 13.4 Choice

`{A B ...}` is an unordered alternative surface. Alternative occurrence multiplicity is preserved unless the selected profile establishes idempotence. Choice is not operational multiway rewrite.

These constructors add no implicit variable owner.

---

# 14. Quantification, bound bodies, and instantiation

## 14.1 Quantifier completeness

`*?n BODY` and `+?n BODY` preserve binder ownership and quantifier kind but are semantically complete only when their domain/generator is determined.

A qualified quantified construction exposes:

```text
binder ownership
quantifier kind
domain/generator
body
sort/guard constraints if any
```

A profile-wide default domain is valid only when represented in native dependencies.

Same binder/body over different domains is not interchangeable.

## 14.2 Lexical abstraction

`\?n BODY` packages a bound body without asserting quantification. It does not intrinsically mean lambda, Pi, set-builder, or another familiar formal object.

## 14.3 `@@`

`ABSTRACTION @@ ARGUMENT` names capture-avoiding bound-body instantiation.

It is a parseable candidate surface/construction, not a proven irreducible primitive. It remains subject to factorization into lower structural rewrite/binding machinery.

It is not generic mathematical function application.

N0/N1 never silently reduce `@@`. Instantiation reduction is a recorded D/E transformation.

---

# 15. Domain mathematics remains theory structure

Raw scope is not a mathematical set, and core syntax does not hard-code arithmetic, set membership, subset, cardinality, union, type/sort, or mathematical function semantics.

Such structures remain theory/class constructions unless future evidence earns a more general primitive.

---

# 16. Claims, status, and proof authority

A claim body intended for native reasoning resolves to represented formula/structure, not only an opaque proposition ID whose meaning exists in a sidecar.

Research/epistemic status—hypothesis, empirical support, candidate, missing law, disproven, rejected, and similar labels—does not grant proof authority.

Representability is not proof.

---

# 17. Signatures, manifests, and bundle partitioning

## 17.1 Surface declaration closure

For one selected serialized bundle:

- every used local stable label is declared/imported or core-reserved;
- undeclared stable labels are invalid;
- a canonical compact surface signature may require exactly the used local labels;
- unused declarations make such a compact signature non-canonical but do not change body semantics.

Signature order is serialization-only.

## 17.2 Layer-relative signatures

Distinguish:

```text
Sig_surface(T)
Deps(T)
Sig_D(T)
```

`Sig_surface(T)` inventories namespace-local stable labels actually used by the selected serialized surface.

Surface-signature equality is neither necessary nor sufficient evidence of cross-domain isomorphism under a label-mappable view.

Stable labels are not alpha-renamed inside `Sig_surface` merely because VS may later map them.

A VS-compatible retrieval/index policy must use an explicitly qualified structural projection/signature/index rather than raw `Sig_surface` equality unless the frozen view makes those labels rigid.

## 17.3 `^0`

The historical `^0` signature marker remains a supported convention, not a proven primitive.

## 17.4 Multi-document partitioning

Splitting/concatenating is N0-transparent only with a witness preserving:

- stable-label namespace;
- local SI namespace/renaming;
- reference namespace;
- binder ownership/visibility;
- activation boundaries;
- dependencies/imports;
- ports/boundaries;
- semantic ordering constraints.

Otherwise an explicit bridge is required.

Recursive dependency SCCs require explicit recursion/fixed-point authority.

---

# 18. Source fidelity, ambiguity, label provenance, and evidence isolation

## 18.1 Source fidelity

Source-to-native rendering preserves every distinction later required for proof, composition, or comparison. Nontrivial ingest keeps mapping/audit evidence.

Source semantics are not assumed uniquely determined when a source is ambiguous, incomplete, inconsistent, or genuinely admits several faithful readings.

An unresolved source may carry:

```text
source object
interpretation/formalization alternatives
provenance/evidence for each alternative
constraints shared by all alternatives
distinctions on which alternatives disagree
status: resolved / unresolved / conditional
```

A result depending on one alternative is conditional on that alternative unless source authority resolves the ambiguity later.

Qualification MUST NOT silently choose the interpretation that creates the cleanest structural match.

## 18.2 Label attachment provenance

Source-supplied and inferred labels are different roles and must be recoverable as such.

A label attachment records a native role equivalent to categories such as:

```text
SOURCE_SUPPLIED
INFERRED_STRUCTURAL_CLASS
RETRIEVAL_ALIAS
HUMAN_GLOSS
```

The names are explanatory; native payloads may use stable IDs.

An inferred structural-class label additionally records:

```text
schema revision
instance/factorization revision
target layer
view/authority policy
verified witness reference
qualification status
```

An inferred membership is never silently promoted into a source-supplied fact.

## 18.3 Human gloss

Human names may aid review/retrieval but may not supply load-bearing native structure absent from the bundle.

## 18.4 Evidence partitions

Qualification partitions resources as:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

Blind stages use an actual fresh-context/tool-access boundary so excluded material is unavailable until result freeze.

An archival source backup supports recoverability but cannot count as semantic-decomposition evidence.

The audit records exactly which resources were accessible to decomposition, retrieval, comparison, and verification stages.

---

# 19. Normalization and transformation authority

## 19.1 N0 — serialization-transparent normalization

N0 may remove only transport-transparent differences such as whitespace, hygienic reference resolution, deterministic serialization order, and qualified transparent bundle partitioning.

N0 does not apply definitions, theorem/algebraic rules, substitution/beta reduction, class mappings, quotienting, or peer-object information.

Valid reference-binding directives disappear after N0 because they are serialization directives, not semantic occurrences.

## 19.2 N1 — source-local representation normalization

Under frozen source-local role policy, N1 may normalize local alpha IDs, bound-variable numbers, and unordered-member presentation.

It preserves ordered incidence, scope nesting, occurrence multiplicity, binding ownership, namespace-qualified labels, literals, positive/negative constraints, kind/direction, ports, quantifier domains, and model constraints.

Stable source labels are not N1 alpha-renamed merely because a later comparison may map them.

A deterministic canonical graph labeling is a transport/index representation. It does not prove that only one isomorphism witness exists.

## 19.3 D — qualified factorization/decomposition

Every D edge records:

```text
source/target revisions
transform kind
applicability guards
dependency revisions
source-target map
preservation obligations
information loss/abstraction
round-trip/compaction relation if exact
residual/provenance required for reconstruction
```

Kinds include exact definition, conservative refinement, abstraction, projection, quotient, approximation, and unresolved relation.

An exact D edge round-trips modulo N0/N1 and transparent surfaces.

Residual needed for source-local reconstruction is classified, for example, as:

```text
qualified primitive/model leaf
source-domain parameter
boundary/context residual
transparent naming/serialization data
currently undecomposed residual
```

An opaque or re-encoded source backup does not count as exposed semantics. Undecomposed residual preserves recoverability but lowers decomposition coverage.

## 19.4 D-local residuals are not pairwise residuals

Let:

```text
A_source --D_A / extraction_A--> A_cmp
B_source --D_B / extraction_B--> B_cmp
```

The source-local D/extraction records own their own residual, information loss, provenance, discarded boundary/context, transparent reconstruction information, and exact round-trip witness where applicable.

Pairwise comparison operates on the frozen comparison-stage objects:

```text
A_cmp <-> B_cmp
```

and owns a different accounting layer: common core, pair residuals, pair cuts, excluded-by-view structure, pair projection loss, and transparent pairwise material.

Pairwise reconstruction targets `A_cmp` and `B_cmp`.

Full-source reconstruction is a separate obligation through the source-local D/extraction records and is claimed only when those transformations are exact/reconstructable.

A lossy D/projection/quotient never becomes full-source reconstruction merely because the pairwise accounting is complete.

A verifier MUST NOT satisfy source reconstruction by merging D-local residuals with pairwise residuals.

## 19.5 E — theory/profile equivalence

Every E edge records theory/profile revision, theorem/evidence revision, assumptions/context, side conditions, direction, and preservation scope.

The cited evidence must itself be qualified for the claim.

E is not silently used in structural discovery.

---

# 20. Recursive and fixed-point definitions

Recursive native definitions require whichever explicit authority is needed, including where relevant:

- base cases;
- step/recursive constructor;
- monotonicity or another existence condition;
- guardedness/productivity;
- well-foundedness;
- least/greatest/other fixed-point choice;
- uniqueness/admissibility theorem/profile.

Circular aliases alone are not semantic completion.

---

# 21. Factorization and extraction

Decomposition/extraction is a relation, not necessarily a function.

A source may have multiple faithful factorizations linked by exact definition, inverse/compaction, E-equivalence, refinement, projection/quotient, witnessed extraction, or unresolved alternative.

Unique canonical factorization requires convergence/uniqueness evidence.

## 21.1 Independent freeze

For blind discovery:

1. decompose/extract A without B or expected class mapping;
2. freeze A's factorization/extraction set, roles, ports, dependencies;
3. independently decompose/extract/freeze B;
4. only then pair them for comparison.

Pair-conditioned extraction/factorization is exploratory evidence only.

### 21.1.1 Claim-scoped factorization coverage

A relation established on explicitly identified frozen factorization/extraction nodes is a claim about those nodes. It does not by itself claim completeness over every allowed factorization/extraction alternative, and verifying that local relation does not require exploration of unrelated alternatives.

A claim of factorization-space completeness, discovery completeness across allowed D/extraction alternatives, or absence of any correspondence across that space MUST declare the covered factorization/extraction space and either:

- exhaust the declared space under the frozen policy; or
- provide a qualified coverage certificate proving that omitted alternatives cannot change the claimed result.

A negative result at one named factorization node remains local to that node unless such coverage evidence lifts it to the wider factorization space.

Independent-freeze requirements still apply. Claim scoping does not authorize pair-conditioned factorization to become blind qualification evidence.

## 21.2 Extraction kinds

Every extraction states its kind, such as:

```text
induced substructure
boundary-cut component
relation-filtered projection
quotient/projection
other explicitly defined extraction
```

An induced extraction retains every included relation/constraint among retained objects under the frozen relation signature. Dropping one is projection loss.

## 21.3 Extraction universe and coverage

A corpus run freezes eligible extraction rules/universe and states whether enumeration is exhaustive, bounded-depth, bounded-cost, sampled, heuristic, or explicitly selected.

Coverage claims do not extend beyond that universe.

## 21.4 Factorization-set completeness

Every result says whether searched factorizations are complete under the declared D system, all currently qualified, bounded-depth/cost, or an explicit subset.

Incomplete factorization coverage cannot support a global negative.

## 21.5 Simplicity and minimality

A claim that one factorization/class is simpler, minimal, or preferred by simplicity requires a declared metric or partial order including the dimensions measured.

Without such a measure:

- preserve competing exact qualified factorizations/classes;
- use verified factorization/equivalence witnesses to expose redundancy where possible;
- do not reject a candidate merely because a reviewer or implementation informally regards another construction as simpler.

Non-vacuity/selectivity and exact factorability are structural claims and do not require an undefined global simplicity ranking.

---

# 22. Comparison policy: independent axes

Before blind search, freeze:

```text
target layer
view policy
included/excluded relation signature/dimensions
role-assignment rules
N0/N1 policy
allowed D factorizations
allowed E equivalences
factorization/extraction bounds
relation kinds sought
common-core objective if any
resource budget
```

## 22.1 Target layer

A target layer may be:

```text
serialized/native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A result at one layer does not imply another without a qualified D/E bridge.

## 22.2 View policy

```text
V0  closed structural view
VB  boundary/port-preserving view
VS  signature-mappable structural view
VC  class-schema/parameterized view
```

## 22.3 Transformation authority

Allowed N0/N1/D/E sets are explicit and frozen.

## 22.4 Relation kind

```text
ISOMORPHISM
STRONG_EMBEDDING
WEAK_EMBEDDING
SPECIALIZATION
HOMOMORPHISM
SIMULATION
BISIMULATION
QUOTIENT_OR_PROJECTION
COMMON_CORE
CERTIFIED_NON_ISOMORPHIC
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

View, transformation authority, target layer, relation signature, and relation kind are independent dimensions.

---

# 23. Comparison-role provenance

Role declarations record provenance:

```text
source-semantic role
pre-existing qualified-schema role
generic frozen comparison-policy role
pair-specific exploratory hypothesis
```

Only the first three are blind-qualification authority unless a supplied hypothesis is explicitly what the experiment tests.

Ports, mappability, parameter slots, excluded dimensions, or reflected relation kinds cannot be added post-hoc merely to improve a match.

---

# 24. View semantics

## V0

Local alpha SIs may bijectively rename. Namespace-qualified stable labels and literals are rigid.

## VB

V0 plus witnessed mapping of independently frozen ports preserving roles/constraints.

## VS

Selected stable labels may map explicitly. Mapping injectivity/surjectivity/bijectivity is recorded. `ISOMORPHISM` requires relevant mapped-label correspondence to be bijective.

## VC

A specific immutable/versioned class schema supplies parameter slots, ports, rigid/mappable roles, allowed abstractions, relation signature, and residual policy.

Non-evidential label identities may be anonymized/mapped while their incidence remains intact. A relation node is not deleted merely because its human name is metadata.

Literal positions become parameters only if predeclared by the frozen schema revision.

---

# 25. Relation semantics

## Isomorphism

Bijective preservation **and reflection** of every included load-bearing structure/constraint under the frozen view/relation signature.

## Strong embedding

Injective preservation and reflection among mapped objects for the frozen included relation/scope/constraint signature.

## Weak embedding

Injective preservation of source structure while extra target relations remain explicit residual.

## Homomorphism

May identify source objects; collapsed distinctions are explicit.

## Simulation / bisimulation

Profile-defined relational correspondences; not isomorphism without separate structural bijection.

## Quotient / projection

Many-to-one abstraction with explicit information loss.

## Specialization

Schema/class relation plus explicit added constraints/residual; direction stated.

## Parametric structural correspondence

Mapping independent primitive/model leaves into common schema slots establishes structural correspondence parameterized by those leaves, not source-theory semantic equivalence without additional E evidence.

## Certified non-isomorphic

Requires complete search for the declared finite problem or a verified separating invariant/certificate.

Failure under incomplete search is `NO_WITNESS_FOUND`, `UNKNOWN`, or `RESOURCE_LIMIT`.

---

# 26. Structural classes

A structural class is an immutable/versioned, namespaced schema graph plus constraints, not a name bucket.

A qualified schema records, where applicable:

```text
schema namespace/identity/revision
labels
internal schema graph
structured parameter slots
ports/boundaries
rigid/mappable roles
positive constraints
negative constraints / NACs / disequalities
absence/completeness conditions
slot/port mapping modes
invariants
admissible target layers/views/relation kinds
required D/E dependencies + revisions
specialization conditions
composition/gluing rules
residual policy
known factorizations
falsifiers
qualification evidence
```

Material changes create a new schema revision. Old witnesses do not silently transfer.

## 26.1 Structured parameters

Parameters may be SI-, literal-, relation-, predicate/formula-, rule/profile-, substructure-, or port-valued. A witness maps their actual structure/interface, not merely a numeric handle.

## 26.2 No post-hoc parameterization

Schema graph, parameters, ports, mapping modes, constraints, and residual policy are frozen before instance scoring. Changes create a new candidate revision.

## 26.3 Non-vacuity and selectivity

A reusable class contributes nontrivial shared structural constraints/invariants outside arbitrary pass-through parameter handles and rejects meaningful held-out near misses.

Parameter size alone neither proves nor disproves non-vacuity.

## 26.4 Class-family claims

Specialization, factorization, composition, embedding, quotient, or equivalence between classes requires its own verified schema witness.

---

# 27. Class recognition versus class induction

Recognition tests a new instance against an already frozen qualified schema revision under VC.

A new class cannot be evidence for its own discovery.

New-class workflow:

```text
verified common structure across independent instances
or independently specified construction law
-> candidate schema induction
-> freeze schema revision
-> held-out positive/negative validation
-> possible promotion
```

Motivating examples alone do not qualify the class.

---

# 28. Class promotion and membership provenance

A reusable class requires either:

1. at least two independently sourced verified instances plus adversarial negatives; or
2. an independently specified construction schema/theorem tested on held-out positive/negative instances.

Cross-domain classes require independent domains.

Promotion additionally requires:

- non-vacuity/selectivity;
- structural-only discovery evidence where relevant;
- independent witness verification;
- factorization/boundary audits;
- policy generalization;
- declared simplicity/minimality measure if promotion depends on a simplicity/minimality claim.

A candidate may be rejected because it fails non-vacuity/selectivity or because a verified factorization establishes redundancy. It may not be rejected merely by an undefined intuition of simplicity.

Multiple verified memberships may coexist. IsoGraph imposes no single inheritance or forced canonical class.

---

# 29. Native policy, witness, certificate, and result authority

No load-bearing isomorphism/discovery semantics may live only in English, JSON, database, host-language, or evaluator sidecars.

For qualification, the following are representable as ordinary native IsoGraph structure or explicitly included qualified native dependencies:

```text
comparison policy
role / namespace declaration
factorization / extraction edge
structural index declaration
mapping / correspondence witness
common-core / residual accounting witness
negative / separating certificate
optimality certificate when claimed
class schema revision
class-membership witness
class-class witness
discovery result record
verification result record
```

Human-readable reports may mirror these objects but are non-authoritative where they contain information not reconstructable from the native bundle.

A native comparison policy exposes enough structure to recover all load-bearing choices, including as applicable:

```text
target layer
included/excluded relation signature
view policy
rigid/mappable/parameterized roles
ports/boundaries
N0/N1 rules
allowed D/E authorities and immutable revisions
factorization/extraction bounds
relation kinds sought
objective / optimization criterion
resource budget
```

A positive/partial witness records at least:

```text
object A/revision/factorization/extraction
object B/revision/factorization/extraction
target layer
view policy
included relation signature
N0/N1 policy
D/E authorities + revisions
relation kind
node/object correspondence
edge/incidence mapping
binding mapping
positive/negative constraint mapping
boundary/port mapping
semantic-label map if any
structured parameter map if any
rigid SIs/literals held fixed
constraints/invariants checked
common core(s)
pair residuals
boundary-cut/gluing data
excluded-by-view structure
collapsed/projected distinctions
source-local D/extraction records where relevant
factorization/extraction completeness
search budget/completeness
optimality status
```

## 29.1 Verification is structural obligation checking

Independent verification is not merely a second agent agreeing with the first.

A verifier checks explicit local obligations induced by the frozen policy and claimed relation, including as applicable:

```text
revision/content bindings
namespace ownership
mapping domain/codomain
bijection/injection/relation-kind conditions
ordered-incidence preservation/reflection
scope and occurrence preservation
binding ownership / capture conditions
positive constraints
negative constraints / NACs / disequalities
quantifier domains / guards
port/boundary compatibility
parameter assignments
pair residual/cut/excluded/projected accounting
source-local D/extraction applicability and reconstruction
factorization/extraction provenance
search/optimality/negative-certificate obligations
```

Where feasible, these checks SHOULD be deterministic/mechanical over native structure.

Only verified witnesses/certificates become qualification evidence.

## 29.2 Claim-bounded obligation closure

For a result under a frozen target layer, view, relation signature, transformation authority, and proof profile, verification MUST discharge the complete dependency-closed obligation set induced by the claim.

Verification MUST NOT require a stronger relation, stronger reconstruction layer, stronger completeness/optimality property, or unrelated qualification gate unless that stronger obligation is itself a dependency of the stated claim or is explicitly required by the frozen proof profile.

Once the dependency-closed obligations of the claim are discharged by qualified evidence, no additional search, canonicalization, enumeration, or proof is semantically required for that claim.

Claim-bounded verification does not permit omission of hidden prerequisites. Dependency closure includes every revision, policy, transformation, provenance, accounting, side condition, and subordinate witness on which the claim actually depends.

## 29.3 Proof-method neutrality

Semantic result requirements are evidence obligations, not mandatory discovery algorithms.

Within the frozen admissible proof profile, any qualified witness/certificate method may establish a claim if it discharges the same complete structural obligations. Canonicalization, exhaustive search, a particular refinement procedure, or another stronger proof method is mandatory only when:

- the claim explicitly concerns that method or its output;
- the frozen proof/qualification profile requires it for a load-bearing reason; or
- no weaker qualified evidence discharges the required obligations.

Method neutrality does not weaken isolation, independence, provenance, or non-circularity requirements. A qualification protocol may constrain evidence acquisition even when the underlying structural relation is method-independent.

---

# 30. Common cores and complete accounting

For each comparison-stage source, every load-bearing item under the applicable accounting universe is assigned exactly one role such as:

```text
mapped common structure
source-only pair residual
boundary-cut incidence
explicitly excluded-by-view source structure
explicit pair projection/quotient loss
transparent serialization-only material
```

This includes occurrences, positive edges, negative constraints, disequalities, guards, ports, quantifier/domain constraints, and activation/execution constraints.

Pairwise reconstruction is conceptually:

```text
A_cmp = reconstruct_pair(C, residual_A, cut_A,
                         excluded_A, projected_A, transparent_A)
B_cmp = reconstruct_pair(C, residual_B, cut_B,
                         excluded_B, projected_B, transparent_B)
```

Only genuinely serialization-transparent material may disappear under N0 without semantic accounting.

A reconstruction under a frozen comparison view may omit dimensions explicitly excluded by the view, but the evidence record still preserves their existence and exclusion reason.

Projected/collapsed information is never relabeled as ordinary residual merely to strengthen the common-core claim.

A common-core result states whether its map is strong/induced or weak.

## 30.1 Maximum claims

“Maximum” requires a declared objective/partial order and optimality certificate or complete-search justification. Otherwise report maximal/non-dominated cores found and search bounds.

## 30.2 Claim-typed witness sufficiency and multiple mappings

Distinct verified mappings remain separate by default. A deterministic canonical graph representative does not prove uniqueness of mapping.

The required amount of witness evidence is determined by the claim:

- an existential mapping/isomorphism claim requires one verified witness;
- a claim of at least `k` materially distinct witness classes requires `k` verified witnesses shown pairwise inequivalent under the frozen qualified witness equivalence, if any;
- a uniqueness claim modulo a frozen witness equivalence requires one verified witness plus a coverage proof that every valid witness is equivalent to it;
- a claim of exactly `k` witness-equivalence classes requires complete enumeration of those classes or an exact generative/classification certificate with verified coverage;
- a claim describing the complete witness family requires complete enumeration or an exact verified family representation with verified coverage;
- maximum/optimal claims remain governed by Section 30.1.

Nothing in witness preservation requires eager enumeration when the stated claim is weaker and its complete obligations are already discharged.

## 30.3 Context-scoped witness quotients

Let `C` denote the frozen claim context, including the target layer, view, relation signature, transformation authority, applicable downstream observation/operation set, and proof profile.

A witness equivalence `Q_C` may quotient-collapse verified witnesses only when it is independently qualified as an equivalence relation and shown to preserve every load-bearing distinction, observation, and obligation exposed by `C`.

Absent such a qualified `Q_C`, distinct verified mappings remain distinct.

A quotient qualified for one claim context is not globally reusable merely because the underlying structures are unchanged. A later context that exposes a previously irrelevant port, role, provenance item, boundary, identity, or other distinction may invalidate the quotient.

If `Q_C` affects search pruning, witness coverage, or completeness, it MUST be frozen/qualified before the affected search. A quotient introduced only after verification to compact an already established witness family is a new derived result with its own revision and proof; it does not rewrite or erase the underlying evidence.

## 30.4 Exact witness-family certificates

A complete witness family may be represented by an exact finite description rather than by explicit enumeration when the description and its coverage are independently verified under the same frozen claim context.

For structural isomorphism specifically, if `f : A -> B` is one verified isomorphism and `Aut_C(A)` is the exact automorphism group of `A` under the same frozen context, then:

~~~text
Iso_C(A,B) = { f ∘ a | a in Aut_C(A) }
~~~

because every other isomorphism `g : A -> B` yields `f^-1 ∘ g in Aut_C(A)`. Therefore one verified isomorphism plus an exact verified generating description of `Aut_C(A)` may serve as a compact complete-family certificate.

This group/coset fact is specific to isomorphism (and separately proved analogous cases). Arbitrary embeddings, common-core mappings, simulations, or other witness families MUST NOT be compressed by this rule unless an exact family theorem/certificate is independently established for that relation.

---

# 31. Composition and joint realizability

Composition requires:

```text
component verified witnesses
overlap/gluing map
shared ports/SIs
compatibility constraints
joint-realizability evidence
composition residual
```

Shared SI alone is insufficient.

Correlation, support, timing, ownership, provenance, trust, and dependency remain represented whenever load-bearing.

---

# 32. Candidate retrieval, fingerprints, and canonical indexing

Finding the correct pair is part of discovery correctness.

Qualification separates candidate retrieval, pairwise comparison, and witness verification.

## 32.1 Structural-only path

A general representation/discovery qualification MUST include at least one candidate-generation path limited to:

- discovery-visible native IsoGraph structure;
- qualified N0/N1 normalization;
- qualified structural D factorizations/extractions allowed by the frozen policy;
- structural indexes/fingerprints whose inputs and invariance claims are native/qualified;
- resource/search policy.

That path must not require source-domain names, human gloss, expected analogies, scorer answers, registry mappings, or existing class labels for the unknown instance as semantic authority.

A learned structural retriever may participate only when training/supervision contamination is controlled through genuinely novel/synthetic held-out structures and its retrieval semantics do not depend on source/class labels.

## 32.2 Index declaration

Every structural/learned index records:

```text
index/model revision
target layer/view/relation target
input representation/factorization stage
N0/N1 policy
D/E policy
factorization/extraction depth
included/excluded roles
boundary/parameter/namespace treatment
collision behavior
false-positive risk
false-negative/pruning risk
training-data provenance if learned
supervision/objective if learned
known evaluation-corpus overlap
algorithm identity/revision when canonical labeling/serialization is involved
symmetry/tie handling relevant to output identity
qualified invariance/completeness claims
```

## 32.3 Stage-specific fingerprint invariance

A fingerprint mismatch can certify separation only if an independently qualified necessary invariant is known for the exact frozen relation/view/layer/representation stage/D policy:

```text
A R B => f(A) = f(B)
```

Consequences:

- a raw-stage invariant may be used on the raw stage for the qualified relation;
- it is not automatically valid after topology-changing D factorization;
- an invariant qualified on one factorization node may not prune another factorization node by default;
- cross-factorization discovery may index multiple qualified factorization nodes;
- alternatively, it may use a separately proved factorization-invariant fingerprint/projection;
- otherwise the index is heuristic and its misses cannot support completeness or negative claims.

Equal fingerprints ordinarily prove nothing.

IsoGraph does not require one canonical post-D factorization merely to simplify indexing.

## 32.4 Canonical serializer/index algorithm scope

A deterministic canonical serialization, canonical graph labeling, or hash/index derived from such labeling records:

```text
algorithm identity/revision
input representation stage
N0/N1 policy
view/relation target if used for pruning
symmetry/tie handling relevant to output identity
qualified invariance/completeness claims, if any
```

IsoGraph does not require one global canonical-labeling algorithm.

Different sound serializers may emit different canonical-looking representatives unless an explicit compatibility/equivalence contract relates the algorithms.

Comparison correctness and preservation of materially distinct automorphism witnesses MUST NOT depend on incidental serializer tie-breaks.

## 32.5 Approximate scores

Learned similarity/confidence/rank is retrieval metadata only and is excluded from structural witness semantics unless the score itself belongs to the modeled domain.

---

# 33. Corpus discovery coverage

A corpus run freezes and reports:

```text
corpus revision
eligible object/component extraction universe
extraction enumeration mode/completeness
factorization bounds
index policy revisions
candidate thresholds
objects/components eligible/indexed
candidate pairs generated
pairs structurally searched
pairs independently verified
known-positive recall controls
known-negative precision controls
resource/time limits
unindexed/unsearched regions
```

Discovery result states remain distinct:

```text
VERIFIED_RELATION_FOUND
CANDIDATE_RETRIEVED_NO_VERIFIED_RELATION
PAIR_SEARCHED_NO_WITNESS
PAIR_CERTIFIED_NEGATIVE
PAIR_NOT_GENERATED
OBJECT_OR_COMPONENT_NOT_INDEXED
FACTORIZATION_NOT_AVAILABLE
UNKNOWN_RESOURCE_LIMIT
```

Absence of a reported relation outside complete coverage is `UNKNOWN`.

---

# 34. Information isolation and anti-cheating

Before blind discovery:

1. independently freeze each source factorization/extraction/role/port set;
2. withhold expected mappings, registry hypotheses, human analogy text, expected cores/residuals, scorer material, and archival source backups excluded from semantic evidence;
3. anonymize/permute non-evidential labels while preserving incidence;
4. randomize local SI/reference/presentation choices allowed by N0/N1.

The fresh discovery context/tool boundary cannot access excluded material until result freeze.

For learned indexes, training/supervision provenance is separately audited; hidden labels at inference do not erase training leakage.

Mandatory controls include:

- cross-domain positive;
- alpha/serialization positive;
- near-isomorphic negative;
- same-label/different-structure negative;
- same-interior/different-boundary negative;
- partial common-core pair;
- alternative-factorization pair;
- misleading/swapped-label pair;
- symmetry/automorphism pair;
- namespace-collision pair;
- post-hoc-policy-leak pair;
- certified-negative versus resource-limited no-witness;
- novel synthetic structures;
- modified familiar structures defeating pretrained prototype completion;
- legacy/current bridge pair;
- vacuous-parameter class negative;
- retrieval false-negative/coverage control;
- structurally novel class absent from the registry.

---

# 35. Held-out generalization

A policy family can overfit a benchmark set even when each pair policy is frozen.

Qualification separates development cases from sealed final holdouts and may generate fresh synthetic/adversarial cases after policy/schema design is frozen.

A repeatedly inspected holdout becomes development evidence and is replaced for final generalization scoring.

---

# 36. Search completeness and honesty

Every engine/run records:

```text
soundness status
completeness status
heuristic/probabilistic behavior
random seed if relevant
resource bound
factorization/extraction coverage
mapping-search coverage
optimality status
witness/certificate verification status
```

Heuristics may retrieve/prioritize and propose candidate witnesses, but only independently verified witnesses support positive claims.

Unknown remains unknown.

---

# 37. Circular evidence prohibition

The target class/mapping hypothesis cannot justify the decomposition/extraction later cited as evidence for that same claim.

Qualification dependencies are acyclic with respect to the claim being established.

Allowed authority includes:

- already-qualified generic lower libraries;
- source axioms/model leaves;
- independently qualified schema definitions.

Forbidden target-claim authority includes:

- target registry mapping;
- target class-membership hypothesis;
- expected analogy;
- decomposition/extraction rule whose validity depends on target membership.

---

# 38. Proof systems and meta-theory

IsoGraph does not select one global proof calculus.

Surface implication, negation, equality, quantification, and related syntax do not grant classicality, explosion, modal rules, temporal induction, deontic distribution, frame rules, higher-order extensionality, choice, or other profile laws.

Proof-capable profiles represent premises, axioms, local inference rules, proof objects/dependencies, and required semantic foundations.

A cached `derivable` relation is acceptable only when tied to validated proof objects or explicit primitive proof authority.

Representability is not proof.

---

# 39. Qualification gates

Current gate set:

```text
E0     source fidelity
E1     native statement expressibility
E1P    primitive semantic decomposition
E1A    alias/factorization expansion
E1C    structural-class classification after witness
E1E    class/instance expansion
E1N    N0/N1 versus D/E audit
E1F    alternative-factorization audit
E1W    witnessed comparison audit
E1B    boundary/port/joint-realizability audit
E1L    label-blind/anti-cheating audit
E1M    multiple-mapping/maximal-core audit
E1Q    comparison-policy/relation-signature freeze audit
E1D    decomposition exactness/recursion/residual audit
E1S    namespace/bundle/manifest audit
E1H    reference/binder hygiene + occurrence/rewrite audit
E1V    independent witness/negative/optimality verification
E1T    target-layer/conclusion-scope audit
E1R    retrieval/discovery coverage audit
E1U    class non-vacuity/selectivity audit
E1X    extraction/context audit
E1G    held-out discovery-policy generalization audit
E1I    SI/variable-owner/namespace edge-case audit
E1K    index-invariant/search-engine audit
E1COV  decomposition/common-core item coverage audit
E1ISO  enforceable information-flow isolation audit
E1NR   native-record authority audit
E1AMB  source-ambiguity audit
E1REV  immutable-revision audit
E1FR   fresh-allocation namespace audit
E2     isolated cold reconstruction
E3     proof-profile completeness
E4     proof execution
E5     independent proof review
```

A downstream claim may rely only on gates relevant to the relation it uses.

### E1NR

Every load-bearing policy/schema/witness/certificate/result used by qualification is native/reconstructable rather than sidecar-authoritative.

### E1AMB

Unresolved source interpretations remain explicit, and results are conditional rather than silently repaired.

### E1REV

Every qualified dependency/witness pins immutable content identity.

### E1FR

Freshness is relative to an explicit allocation namespace/occupancy state, and concurrent/independent allocations cannot collide silently.

---

# 40. Historical compatibility

Frozen earlier artifacts retain their recorded historical semantics and do not silently become Draft 0.15-qualified.

To participate in current qualification, a historical artifact requires current-semantics rerendering or an exact verified legacy-to-current bridge.

Potentially changed historical conventions include:

- formula-scope conjunction;
- set-like versus occurrence-preserving membership;
- set-like versus multiset rewrite update;
- existential/freshness overloading;
- direct-child rule activation;
- reference visibility/order/hygiene;
- reference-binding placement;
- rule-side outer-container semantics;
- Semantic Identity / label namespaces;
- signature/document context;
- candidate surface versus primitive status;
- optional `@@` reduction;
- declarative variable ownership;
- D-local versus pairwise residual accounting;
- factorization-stage index validity;
- infix parsing;
- NAC evaluation context;
- evidence-partition/discovery isolation rules;
- claim-bounded dependency-closed verification obligations;
- claim-typed witness-family sufficiency and context-scoped witness quotients;
- local factorization-node claims versus factorization-space completeness;
- proof-method neutrality within frozen qualification constraints.

Older foundations/profiles/proof candidates remain historical author-side candidates until rerendered or bridged.

---

# 41. Core-admission rule

Before permanently promoting new syntax/operation to the irreducible substrate:

```text
candidate distinction
-> attempt faithful construction from existing primitives
-> test exactness / round trip / residual burden
-> test canonical identity and ambiguity
-> test isomorphism/discovery behavior
-> test qualified-agent reconstruction/reasoning cost
-> retain stable label/surface if useful
-> promote to core only if lower construction fails or is materially worse
```

Convenience, familiarity, repeated use, parseability, or a standard logical name does not prove irreducibility.

The absence of dedicated syntax is not an expressiveness defect when the distinction is faithfully representable by qualified lower structure.

---

# 42. Specification-growth freeze and focused qualification

Specification growth remains frozen until the current representation is exercised.

Do not:

- add a structural class merely because another named domain object appears;
- add a core token merely because a test is awkward;
- introduce a comparison relation kind merely to make a failing case pass;
- repair a failing case by post-hoc parameterization or view changes.

A test may justify a spec change only after the failure is classified and evidence shows an existing representation rule is insufficient, ambiguous, or materially worse than a proposed correction.

## 42.1 Original frozen twenty targets

The qualification suite includes at least:

1. scope occurrence multiplicity;
2. rewrite occurrence/multiset addition and removal;
3. identical successor state produced by distinct rewrite events;
4. nested-boundary non-flattening;
5. variable ownership, legal aliasing, and NAC binding;
6. reference hygiene and repeated-use occurrence multiplicity;
7. SI and stable-label namespace collisions;
8. identical quantified body with different domains/generators;
9. exact semantic D round trip versus opaque-source/residual cheating;
10. independent factorization/extraction freeze before pairing;
11. strong versus weak embedding under a frozen relation signature;
12. complete common-core/residual/cut/excluded/projected accounting;
13. multiple automorphism/mapping witnesses;
14. certified negative versus incomplete-search no-witness;
15. fingerprint/invariant pruning under multiple views;
16. vacuous-class negative and large structured-parameter positive;
17. native self-representation of policy/witness/result structures;
18. unresolved source-interpretation alternatives;
19. structurally novel candidate-class induction with no registry label;
20. structural-only retrieval versus label-assisted retrieval.

## 42.2 Supplemental Draft 0.15 controls

Additionally test:

1. legal reference binding versus illegal ordered-edge/formula placement, including N0 arity preservation;
2. rule-side direct-member splice versus literal nested-scope match/construction;
3. closed declarative object with unowned variable rejection versus explicitly owned open formula acceptance;
4. source-local D residual versus pairwise residual two-stage reconstruction;
5. fingerprint/index reuse across distinct qualified factorization stages;
6. infix parse determinism and rejection of mixed/chained un-delimited forms;
7. first-class NAC object versus explicit matcher evaluation context;
8. canonical serializer/index algorithm scoping without collapsing automorphism witnesses.

Expected answers and scorer mappings remain withheld from blind discovery/verification stages.

No new structural class is promoted from these cases until its independent class/schema promotion burden is met.

## 42.3 Draft 0.16 obligation-sufficiency controls

Before Draft 0.16 may supersede Draft 0.15 as qualified authority, focused adversarial qualification MUST exercise at least:

1. an existential isomorphism with a large automorphism family, establishing that one witness suffices for existence while complete-family claims require exact family coverage;
2. a witness quotient that is safe for one frozen downstream context but invalid when a later context exposes a previously ignored port/role/distinction;
3. a correspondence exposed only by an alternative independently frozen D/factorization node, distinguishing a valid local node claim from an invalid factorization-space completeness claim;
4. a direct verified isomorphism with no canonical form produced, establishing that canonicalization is not a semantic prerequisite;
5. a certified negative discharged by a separating invariant without exhaustive mapping search;
6. a weak relation whose corresponding stronger relation fails, establishing that verification does not silently demand the stronger relation;
7. successful pairwise comparison-stage reconstruction with failed/unavailable full-source reconstruction, establishing claim-layer separation;
8. a malicious or incomplete proof profile that attempts to omit a real dependency, establishing dependency-closure rejection.

These controls add no new primitive or comparison relation. Their purpose is to falsify the obligation-sufficiency clarifications before qualification promotion.

---

# 43. Failure classification and falsifiers

Before specification repair, classify a failure as one of:

```text
parser/serialization defect
semantic ambiguity
representation expressiveness defect
comparison/discovery defect
fixture/protocol defect
decoder/search implementation error
non-defect / reviewer misunderstanding
```

Revise or reject current rules if controlled evidence shows that their safeguards add material lifecycle/reasoning cost without preventing real false/missed correspondences, or if a simpler exact mechanism preserves the same semantic fidelity and discovery safety.

Specific falsification targets include:

- occurrence-preserving scope/rewrite semantics;
- SI-versus-occurrence distinction;
- rule-side container semantics;
- independent factorization/extraction freeze;
- policy/relation-signature freeze;
- namespacing and fresh allocation;
- exact semantic D round trips and residual separation;
- fixed-point contracts;
- explicit quantifier domains;
- schema/dependency versioning;
- native first-class policy/witness authority;
- source-ambiguity preservation;
- independent witness verification;
- certified-negative discipline;
- factorization/retrieval coverage reporting;
- embedding-strength/target-layer distinction;
- circular-evidence prohibition;
- multiple-witness preservation;
- non-vacuity/selectivity controls;
- held-out discovery testing;
- stage-specific index invariance;
- enforceable evidence isolation.

A simpler mechanism is preferred whenever it preserves the same correctness and discovery safety.

---

# 44. Constitutional discipline

```text
preserve source semantics and unresolved ambiguity
-> independently decompose/extract as far as justified
-> preserve alternative exact factorizations
-> freeze roles/ports/relation signature/policy before pairing
-> normalize representation only
-> retrieve candidates through a structural-only path
-> compare under explicit target layer + view + transformation authority
-> state relation kind independently
-> emit native independently verifiable mapping/core/residual/gluing witness(es)
-> keep source-local D accounting separate from pairwise accounting
-> preserve negative constraints, multiplicity, and materially distinct mappings
-> recognize or induce classes only from verified witnessed structure
-> validate reusable classes on held-out/adversarial cases
-> retain useful labels afterward with provenance
```

Until qualification says otherwise:

```text
surface != primitive
occurrence != Semantic Identity
rule-side container != nested scope
formula constructor != binder
D residual != pair residual
index invariance is stage-specific
surface signatures remain source-faithful
ambiguous infix is rejected
NAC evaluation requires matcher authority
minimality requires a metric
policies and witnesses are native structure too
ambiguity stays ambiguous
revisions are immutable evidence
freshness is namespace-relative
unknown remains unknown
```


---

# 45. Draft 0.16 qualification status

Draft 0.16 is a **qualified consolidated authority** for the obligation-sufficiency clarification layer. The focused controls in Section 42.3 completed under Experiment 005 using isolated cold reconstruction, post-freeze scoring, scorer-blind independent verification, and final review.

Qualification provenance:

- frozen semantic candidate/corpus commit: `fa733d533cd683c5064c4f31fa6c083fa3aed21d`;
- tested candidate Git blob: `0cc6d2e3e08606a99324ee36b6ff5a6a5067efb8`;
- cold workflow: `35252295888`, frozen cold report SHA-256 `9078e33a7ae9f75eca75e2f9327a3f3e4e76e77c3223df5f03c5ce96dcbc5d9d`;
- post-freeze scoring: 8 PASS / 0 PARTIAL / 0 FAIL / 0 UNKNOWN;
- scorer-blind verifier workflow: `35252625515`, verifier disposition `VERIFIED`, verifier report SHA-256 `da45f19397f842eb08c9cea57cf77b108ee8dcf808c0c1f1989e72ca3d7b8eb3`;
- final review: `experiments/005/EXPERIMENT_005_FINAL_QUALIFICATION_REVIEW.md`.

This promotion changes qualification status/provenance only. The normative clarification rules are identical to the tested candidate blob above.

Draft 0.16 does not authorize retroactive reinterpretation of Draft 0.15 artifacts or Experiment 004 evidence.

The following were deliberately **not** introduced as normative performance shortcuts:

- no requirement to choose a globally smallest/minimal comparison view;
- no prescribed cheap-to-expensive progressive search algorithm;
- no mandatory post-D fingerprint stage;
- no global canonical factorization or canonical-labeling prerequisite;
- no weakening of source-local versus pairwise reconstruction obligations;
- no heuristic fingerprint or incomplete search upgraded into a structural proof;
- no automatic witness quotient without a frozen qualified context and coverage proof.


---

# 46. Draft 0.17 correction status

Draft 0.17 is the current qualified authority for the narrow Semantic Identity description correction. The correction changes no operational bare-ID behavior from Draft 0.16 and introduces no Natural Entropic Identity or other stronger identity semantics into core.
