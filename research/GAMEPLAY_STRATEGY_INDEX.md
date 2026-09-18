# Gameplay Strategy & Implementation Index

**Status:** living research index  
**Owner:** `research/semantic-quotient`  
**Purpose:** track where IsoGraph-derived semantics meet executable Connect4 gameplay, solver strategy, and implementation design.

This index is intentionally top-level and persistent. New gameplay-facing strategies, solver ideas, implementation sketches, and exact-state proposals should be registered here rather than left only in dated notes, issues, or experiment folders.

The index does **not** promote proposals into semantic authority. It tracks what should be tried, why it is plausible, what exact research it consumes, and what evidence would be required before adoption.

---

## Human-facing entrypoint

For the gameplay idea in ordinary language, including a classical logic proof and its IsoGraph/NEI interpretation, start with:

- `GAMEPLAY_DESCRIPTION_FOR_HUMANS.md`

Human-facing gameplay proposals should normally expose three aligned views when correctness is involved:

~~~text
1. novice gameplay language
2. classical logic / mathematical argument
3. IsoGraph / NEI structural representation
~~~

The novice view explains what a player or implementer should imagine happening.
The classical proof makes the correctness claim independently checkable without IsoGraph.
The IsoGraph view owns typed identity, scope, provenance, uncertainty, and structural composition.

If the three views disagree, the disagreement is a research defect to investigate rather than wording to smooth over.

## Why this exists

The current research has crossed an architectural seam:

~~~text
IsoGraph structural semantics
    -> exact gameplay description
    -> runtime state / transition kernel
    -> solver strategy
    -> proof/value production
~~~

Recent Discovery Protocol + NEI work established that:

- q is directly maintainable from legal gameplay;
- equal q appears to determine ordinary future behavior deductively;
- q is not the same thing as physical state, proof state, or provenance identity;
- some identity projections require explicit context/anchors;
- a searchless structural route remains possible through guarded obligation closure;
- a nonrecursive exact route already exists conceptually through symbolic fixed-point solving.

This index owns the **proposal surface** for acting on those findings.

---

## Proposal status vocabulary

~~~text
ROUGH_PROPOSAL
    idea is concrete enough to discuss and design, but not yet qualified

ACTIVE_INVESTIGATION
    implementation/proof/experiment is currently being worked

CANDIDATE_FOR_IMPLEMENTATION
    semantics and guards are sufficiently clear to justify a bounded implementation

IMPLEMENTED_EXPERIMENTALLY
    code exists in an experiment/research lane; production adoption not implied

QUALIFIED_FOR_SCOPE
    passed the declared correctness/behavior/performance burden for a stated scope

DEFERRED
    retained but not currently worth execution cost

REJECTED
    investigated and intentionally not pursued under current evidence

SUPERSEDED
    replaced by a better proposal; lineage must remain visible
~~~

---

## Current proposals

| ID | Proposal | Current status | What it changes | Primary implementation seam | Proof/qualification burden | Next action |
|---|---|---|---|---|---|---|
| GSP-001 | [Quotient-native gameplay description](gameplay-strategy/GSP-001-QUOTIENT_NATIVE_GAMEPLAY_DESCRIPTION.md) | ROUGH_PROPOSAL | Makes q the explicit exact internal gameplay description | Connect4 domain/gameplay adapter | independent q-vs-physical transition replay; first-win controls | define the gameplay interface and exact record ownership |
| GSP-002 | [Packed q transition compiler](gameplay-strategy/GSP-002-PACKED_Q_TRANSITION_COMPILER.md) | ROUGH_PROPOSAL | Turns q + column into a low-cost exact runtime kernel | state compiler / transition layer | exact equality; transition equivalence; economics | prototype transparent packed q before aggressive compression |
| GSP-003 | [Symbolic q fixed-point solver](gameplay-strategy/GSP-003-SYMBOLIC_Q_FIXED_POINT_SOLVER.md) | ROUGH_PROPOSAL | Uses q in BSFP-style nonrecursive solving | BSFP / symbolic predecessor layer | exact predecessor semantics; frontier/memory economics | derive symbolic Pre_a over q/frontier representation |
| GSP-004 | [Guarded obligation closure](gameplay-strategy/GSP-004-GUARDED_OBLIGATION_CLOSURE.md) | ROUGH_PROPOSAL | Attempts fully structural value derivation without q-graph traversal | NDC / obligation proof engine | guarded quantifier-lift completeness on meaningful controls | continue mixed-cofactor obligation-birth work on A/B witness |
| GSP-005 | [Second-stage behavioral quotient after q](gameplay-strategy/GSP-005-BEHAVIORAL_QUOTIENT_AFTER_Q.md) | ROUGH_PROPOSAL | Tries to shrink q further while remaining executable | semantic-state minimization / automaton layer | exact behavior equivalence + maintainable update law | classify bounded q distinctions erased by MQ2 |
| GSP-006 | [Profile-safe proof and cache keys](gameplay-strategy/GSP-006-PROFILE_SAFE_PROOF_AND_CACHE_KEYS.md) | ROUGH_PROPOSAL | Prevents q identity from over-authorizing proof/context reuse | TT/proof-store/cache contracts | negative controls with equal q but different proof context | define QKey/ProofKey/HintKey contracts |
| GSP-007 | [Generic finite-gravity Connect-K q congruence](gameplay-strategy/GSP-007-GENERIC_CONNECT_K_Q_CONGRUENCE.md) | ROUGH_PROPOSAL | Tests whether q gameplay semantics generalize beyond 7x6 K=4 | generic Connect-K domain/profile | symbolic proof review + nonstandard-board controls | build qualification matrix and independent theorem review |

---

## Strategy families

### A. Gameplay description

The fundamental transition from research to runtime is:

~~~text
physical/external position
    -> q gameplay description
    -> exact local action transition
~~~

Tracked by:

- GSP-001;
- GSP-002;
- GSP-007.

### B. Exact solving without ordinary recursive search

Two different paths must remain separate:

~~~text
symbolic q fixed point
    -> solve regions of q

guarded obligation closure
    -> prove consequences without enumerating the entire q graph
~~~

Tracked by:

- GSP-003;
- GSP-004.

The first is a nonrecursive solver formulation.

The second is the stronger searchless-deduction research program.

### C. Further semantic compression

~~~text
physical states
    -> q
    -> possible exact behavioral quotient
~~~

Tracked by:

- GSP-005.

A smaller partition is useful only if it remains constructible and exact.

### D. Identity-safe runtime composition

q equality is powerful but scoped.

Runtime systems must keep separate:

~~~text
gameplay identity
proof/certificate identity
advisory/hint identity
provenance identity
~~~

Tracked by:

- GSP-006.

---

## Implementation sequence to test

This is a rough execution sequence, not authority:

~~~text
1. GSP-001
   make q an explicit gameplay interface

2. GSP-002
   prove q can be carried cheaply

3. in parallel:
   GSP-003
       practical nonrecursive exact solver path

   GSP-004
       stronger structural/searchless proof path

4. GSP-006
   make proof/cache reuse profile-safe before aggressive shared-state use

5. GSP-005
   only after q runtime economics are understood, try to compress beyond q

6. GSP-007
   qualify the gameplay abstraction beyond the standard board
~~~

The sequence may change when experiments expose a better ownership boundary.

---

## New-idea intake rule

When a new IsoGraph/discovery result suggests a gameplay or solver strategy:

1. determine whether it changes gameplay description, transition, proof state, solver control, compression, or implementation only;
2. search this index for an existing proposal that already owns the idea;
3. extend that proposal when the truth condition/implementation objective is the same;
4. create a new `GSP-###` only for a genuinely distinct strategy or implementation path;
5. record:
   - exact research premise;
   - intended runtime owner;
   - implementation sketch;
   - falsifier;
   - proof/qualification burden;
   - current status;
   - novice gameplay explanation when the idea changes gameplay description;
   - classical logic/mathematical justification when correctness is claimed;
   - IsoGraph/NEI mapping when identity, scope, or structural collapse is involved;
6. add it to this index in the same change.

Do not leave a durable gameplay strategy discoverable only from a dated research note, issue, chat summary, or solver branch.

---

## Research inputs

Current proposal generation is primarily informed by:

- `isograph/discovery/2026-09-18-high-value-leads/CAMPAIGN.md`;
- `isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md`;
- `isograph/discovery/2026-09-18-high-value-leads/CONTEXTUAL_IDENTITY_SPANS.md`;
- `isograph/identity/CONNECT4_NEI_APPLICATION_0_1.md`;
- `semantic-quotient/state-identity-unification/README.md`;
- MQ2/MQ3/MQ4 semantic quotient results;
- the active guarded mixed-cofactor/NDC research seam.

---

## What this index is not

This is not:

- the current logic authority;
- a production roadmap commitment;
- a claim that all listed ideas are compatible;
- permission to implement hypotheses as correctness authority;
- a substitute for `STATUS.md` or `next_step.yaml`.

It is the persistent **strategy and implementation idea index** for turning qualified/qualified-candidate research into gameplay-facing experiments and solver architecture.
