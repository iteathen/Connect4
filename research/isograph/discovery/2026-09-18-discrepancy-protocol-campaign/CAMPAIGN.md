# Connect4 IsoGraph Discovery Protocol Campaign — 2026-09-18

**Purpose:** execute the IsoGraph Discovery Protocols against the frozen authority-1.1 discrepancy leads and preserve the complete reasoning trail.  
**Canonical research owner:** `research/semantic-quotient`  
**Connect4 starting head for discovery execution:** `99b41db8613bef1d1f9dd8dbf54e8033446ed881`  
**Connect4 representation authority:** IsoGraph authority 1.1  
**IsoGraph discovery guidance:** cumulative DP 0.1-0.5, with DP 0.5 and Core 0.18 used as unqualified successor research guidance  
**Authority promotion by this campaign:** none

## Frozen discovery inputs

The campaign begins from:

- `research/isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`;
- frozen authority-1.1 claim graph;
- frozen authority-1.1 evidence-lineage graph;
- frozen cold report and score;
- original adjudication and final qualification review;
- current legacy claim bridge only as a readability/index surface for already-authoritative `C4-R####` identities.

No frozen 1.1 authority artifact is edited by this campaign.

## Discovery discipline

Every branch follows:

~~~text
observe
-> align semantic quantity / scope / layer / authority
-> select high-information protocols
-> generate a bounded candidate explanation
-> inspect immediate neighborhood
-> seek a falsifier
-> preserve residual
-> assign discovery lifecycle/disposition
~~~

A candidate explanation is not authority.

A failed candidate is a successful discovery outcome when it removes an attractive but unsupported interpretation.

---

# Campaign leads

## Lead A — explicit scope metadata vs derived semantic scope

### Observation

The cold decoder reported `scope_present=true` for:

- C4-R0010;
- C4-R0034;
- C4-R0054.

The canonical records have no explicit `scope` field for those claims.

### Protocol routing

Primary:

- DP-08 residual-structure discovery;
- DP-10 role-equivalent elements under different labels;
- DP-23 reconstruction-structure discovery;
- DP-36 representation-redundancy discovery;
- DP 0.5 derived-versus-explicit structure.

Secondary falsifier:

- inspect other guarded/bounded claims where decoder still returned `scope_present=false`.

### Local structural inspection

C4-R0010 statement is explicitly workload-bounded in prose:

~~~text
"The investigated incremental live-counter detector..."
"the measured campaign..."
"current hot path"
~~~

C4-R0034 statement is likewise bounded:

~~~text
"the tested forms remained slower..."
"current implementations are deferred..."
~~~

C4-R0054 is explicitly conditional:

~~~text
"For a decisive W x H Connect-4 root with distance-optimal terminal move T..."
~~~

Therefore at least two predicates exist:

~~~text
explicit_scope_field_present(claim)
semantic_validity_restriction_present(claim)
~~~

They are not equivalent.

### Falsification of an over-broad decoder rule

The stronger hypothesis:

~~~text
decoder sets scope_present=true whenever a claim is semantically bounded
~~~

does not survive.

Other guarded/bounded records in the same cold inventory, including guarded-exact claims with explicit guards, were reconstructed with `scope_present=false`.

Therefore this campaign does **not** infer a general decoder rule.

### Result

~~~text
STRUCTURE_ESTABLISHED:
    explicit metadata scope
    !=
    semantic validity restriction

OPEN:
    exact derivation/normalization rule relating them
~~~

The correct future representation question is not whether one value should replace the other.

It is whether a successor schema should represent both layers explicitly or provide a qualified derivation relation between them.

---

## Lead B — explicit relation set vs possible minimal generating basis

### Observation

The decoder undercounted explicit relations:

~~~text
C4-R0015    canonical 2   decoder 1
C4-R0016    canonical 2   decoder 1
C4-R0052    canonical 6   decoder 5
~~~

### Protocol routing

Primary:

- DP-07 alternative factorization;
- DP-08 residual discovery;
- DP-24 proof/dependency topology;
- DP-36 representation redundancy;
- DP 0.5 minimal generating structure.

### Candidate quotients tested

#### H1 — omit `supports`

Fits:

- C4-R0015;
- C4-R0016.

Fails:

- C4-R0052 has no `supports` edge, yet is also undercounted by one.

**Disposition:** falsified.

#### H2 — count unique relation types rather than occurrences

Predictions:

~~~text
R0015 -> 2
R0016 -> 2
R0052 -> 3
~~~

Does not reproduce decoder counts.

**Disposition:** falsified.

#### H3 — count only relations whose target is a C4 claim ID

R0015 would become 1 because `defines -> winspace-basis` is a non-claim conceptual target.

But:

- R0016 would remain 2;
- R0052 would remain 6.

**Disposition:** falsified.

#### H4 — collapse reciprocal dependency/support edges

R0015 `supports R0016` and R0016 `derived_from R0015` expose one reciprocal pair across claims.

This can explain at most part of R0015's local neighborhood.

It does not explain:

- R0016's missing count;
- R0052's missing count.

**Disposition:** falsified as common explanation.

### Residual

No common exact factorization currently explains all three deficits.

The explicit relation edges have distinct semantics and remain authoritative.

### Result

~~~text
shared minimal-generating-basis hypothesis:
    STRUCTURAL_LEAD_FALSIFIED

remaining explanation:
    ordinary decoder omission/counting error
    unless new edge-specific evidence appears
~~~

This branch is intentionally closed rather than kept alive merely because all three errors equal `actual - 1`.

---

## Lead C — C4-R0045 4 -> 3 -> 2 evidence-layer structure

### Observation

The cold claim inventory returned:

~~~text
C4-R0045 source_count = 3
~~~

The canonical claim has four explicit source citations.

The evidence-lineage graph was inspected independently.

### Protocol routing

Primary:

- DP-08 residual discovery;
- DP-23 reconstruction-structure discovery;
- DP-24 proof/witness topology;
- DP-25 refinement relation;
- DP-36 representation redundancy;
- DP 0.5 semantic quantity alignment.

### Exact represented structure

C4-R0045 has four claim source citations / four distinct source artifacts:

1. normalized `research/evidence/bsfp/representation-algebra.json`;
2. rolling-rank detailed report;
3. compact-CUDA vertical-slice report;
4. saturation/winspace inference review.

The evidence graph contains three evidence events relevant to R0045:

1. rolling-rank scaling event;
2. compact-CUDA Q1 qualification/scaling event;
3. saturation/winspace inference review event derived from event 2.

Those three events are grouped into two evidence lineages:

1. rolling-rank lineage;
2. compact-CUDA lineage.

The relationship is therefore:

~~~text
claim citation occurrences     4
distinct source artifacts      4
evidence events                3
evidence lineages              2
cross-lineage independence     UNKNOWN
~~~

### Discovery

The decoder's incorrect value `3` is **exactly the represented evidence-event count**.

This supplies a concrete alternate semantic layer that explains the otherwise unexplained intermediate number.

The campaign cannot observe the model's hidden internal reasoning, so it does not assert:

~~~text
the decoder definitely counted events
~~~

It establishes only:

~~~text
decoder source_count = 3
represented event_count = 3
~~~

with a structurally meaningful layer mapping available in the packet.

### Neighborhood expansion

The normalized evidence artifact is shared across the two lineages.

The saturation review is represented as a distinct derived event within the compact-CUDA lineage.

Thus neither raw file count nor lineage count alone explains the value 3.

The event layer does.

### Falsifier sought

A direct breaker would be any authoritative R0045 evidence graph with event count other than 3.

None exists in authority 1.1.

### Result

~~~text
STRUCTURE_ESTABLISHED:
    R0045 has a 4-artifact / 3-event / 2-lineage hierarchy

SUPPORTED_CANDIDATE:
    the decoder's 3 is a semantic-layer substitution from source/artifact count to event count

NOT ESTABLISHED:
    causal claim about the decoder's hidden reasoning
~~~

This is the strongest new discovery of the campaign.

---

## Lead D — explicit deductive-independence tags vs derived inapplicability

### Observation

The cold prompt requested exactly five claims represented by two evidence lineages with:

~~~text
independence_status = not_applicable_deductive
~~~

The decoder generalized the result to many other claims and included duplicates.

### Protocol routing

Primary:

- DP-08 residual discovery;
- DP-24 proof/witness topology;
- DP-36 representation redundancy;
- DP-37 constraint/semantic closure;
- DP 0.5 derived-vs-explicit structure.

### Structural inspection

Authority 1.1 places `independence_status` on **evidence lineages**, not on claim-status labels.

The two explicit deductive lineages cover exactly:

~~~text
C4-R0060
C4-R0062
C4-R0063
C4-R0070
C4-R0071
~~~

The decoder generalized beyond that lineage set.

It even included C4-R0016, whose claim status is `empirically_supported`.

### Falsifier

A proposed rule such as:

~~~text
deductive-looking claim status
-> empirical independence is not applicable
~~~

is falsified by the mismatch between claim status and actual lineage-level authority.

Claim epistemic status and evidence-lineage independence applicability are different dimensions.

### Result

~~~text
STRUCTURE_ESTABLISHED:
    empirical-independence applicability is lineage/evidence-topology scoped
    != claim-status scoped

STRUCTURAL_LEAD_FALSIFIED:
    claim-status-only derivation rule

OPEN:
    whether a safe derived lineage predicate can be constructed from proof/evidence topology
~~~

The explicit lineage field remains authority.

---

## Lead E — 10 lineages / 13 events prose substitution

### Observation

The cold prose said "13 evidence lineages."

Authority 1.1 says:

~~~text
10 lineages
13 events
~~~

### Protocol routing

- DP-08 residual check;
- DP-36 representation redundancy;
- DP 0.5 quantity alignment.

### Result

The event/lineage distinction is already first-class and unambiguous.

The structured report recovers the relevant distinctions elsewhere.

No missing semantic layer is needed.

~~~text
discovery disposition:
    NO_STRUCTURAL_LEAD

qualification disposition:
    decoder prose substitution
~~~

The branch closes.

---

# Cross-lead synthesis

## Discovery 1 — semantic-layer substitution is a recurring failure mode

Three independently shaped discrepancies exhibit the same higher-order pattern:

### Scope

~~~text
requested:
    explicit metadata field presence

decoder:
    appears to substitute an inferred semantic restriction in some cases
~~~

### R0045

~~~text
requested:
    source/citation count

decoder:
    value exactly equal to event count
~~~

### Deductive independence

~~~text
requested:
    explicit lineage-level applicability control

decoder:
    generalizes toward claim-level semantic classification
~~~

And the prose slip moves in the opposite direction:

~~~text
event count 13
-> lineage label
~~~

The common structure is:

~~~text
typed observation at layer L
    ->
adjacent semantic projection / aggregation / inferred layer L'
    ->
plausible but contract-wrong answer
~~~

This is a **supported cross-case discovery**, not merely a wording issue.

### Candidate invariant

An observation should be treated as a typed coordinate:

~~~text
Observation =
    subject
    + predicate/quantity
    + representation layer
    + aggregation level
    + scope/view
    + authority revision
    + closure assumptions
    + value
~~~

Two values should not be directly compared until these coordinates align or an explicit transformation between them is supplied.

Core 0.18 already anticipates this shape. The Connect4 campaign provides concrete evidence for why it matters.

---

## Discovery 2 — R0045 reveals the full evidence identity staircase

R0044 originally established:

~~~text
citation occurrence
!= artifact
!= event
!= lineage
!= independence group
~~~

R0045 now supplies a nontrivial count staircase:

~~~text
4 citations/artifacts
-> 3 events
-> 2 lineages
-> cross-lineage independence UNKNOWN
~~~

This is stronger than a conceptual distinction because multiple adjacent layers have different cardinalities in one live claim.

It provides a useful adversarial fixture for future IsoGraph qualification.

---

## Discovery 3 — property ownership matters as much as property value

The deductive-independence anomaly shows that even a semantically sensible property can be wrong when attached to the wrong owner:

~~~text
independence applicability
    belongs to evidence lineage/topology
    not automatically to claim status
~~~

The scope anomaly shows the analogous distinction:

~~~text
explicit scope metadata
    belongs to representation record

semantic validity restriction
    belongs to proposition/guard/evidence meaning
~~~

This suggests a broader rule:

> Before comparing property values, compare the semantic owner/layer of the property.

---

# Protocol effectiveness

The campaign generated all three desirable discovery outcomes:

## Structure established

- explicit scope metadata != semantic validity restriction;
- R0045 4-artifact / 3-event / 2-lineage hierarchy;
- independence applicability is lineage/evidence-topology scoped.

## Supported candidate

- R0045 decoder value 3 is consistent with substitution of the evidence-event layer for the requested source layer;
- semantic-layer substitution is a recurring cold-reconstruction failure mode.

## Falsified attractive hypothesis

- the repeated relation-count deficits do not currently support one exact minimal generating relation basis.

## Ordinary error correctly closed

- 10-lineage / 13-event prose substitution requires no new ontology.

This is the desired behavior of the Discovery Protocols: they neither discard anomalies as errors nor force every anomaly into a new isomorphism.

---

# Authority / next-step consequences

No current authority-1.1 semantic artifact changes.

The following discoveries should be inputs to the next successor-authority design/qualification cycle:

1. retain explicit scope metadata separately from any derived semantic-scope representation;
2. add an adversarial R0045 fixture that requires reconstruction of 4 artifacts / 3 events / 2 lineages / UNKNOWN cross-lineage independence;
3. keep independence applicability lineage-scoped;
4. type qualification observations by semantic layer/aggregation/scope;
5. preserve the rejected relation-basis hypothesis as negative discovery evidence rather than reopening it without new information.

The machine-readable campaign ledger is stored beside this document.
