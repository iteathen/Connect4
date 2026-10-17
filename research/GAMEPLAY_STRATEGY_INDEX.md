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

## Cross-cutting method-emergence correction

The latest IsoGraph discovery changes how the solver proposals should be interpreted.

Do **not** treat IsoMax, BSFP, or SUT as separate semantic ontologies.

The existing Connect4 topology already yields the ordinary exact recurrence:

~~~text
exact behavior carrier
+ legal actions / successor relation
+ terminal boundary
+ alternating existential/universal choice
+ finite occupied-cell rank
-> exact W/D/L dependency
~~~

Current solver families are primarily different evaluation/materialization policies over that relation:

~~~text
IsoMax
    demand-driven

BSFP
    supply-driven / symbolic predecessor

SUT candidate
    coordinated meeting of demand and supply fronts
~~~

Accordingly:

- GSP-003 should be read as a symbolic evaluation policy over the common recurrence, not creation of different game semantics;
- GSP-004 should be read as adding qualified shortcut proof edges, not replacing the underlying game relation;
- GSP-006 remains load-bearing because q-level gameplay identity does not automatically authorize stronger proof reuse;
- new proposals should first ask whether the required operation already exists as Connect4 topology at another layer before inventing solver-specific state.

Source: `isograph/discovery/2026-09-18-method-emergence/`.

## Canonical action cofactor quotient and source output-cone reduction — 2026-10-16

GSP-003/004 now have a source-only exact ROBDD alternative to the
syntactic AND/NOT QBF projector. Its threshold-specific deterministic
source gate *ancestor cone* discards unrelated Tseitin definitions,
and reduced ordered complemented-edge BDD nodes canonically share
IDENTICAL Boolean future cofactor functions under a fixed action-bit
variable order. Quantifier blocks preserve their original adaptive
P0 existential / P1 universal order; the initial literal action
remains FREE, so the eventual result is a complete action vector.

Small-board full termination controls: **24/24** exact WDL and
complete optimal sets (13 unique and 11 tied). Fresh independent
7x6 `44444` k8 physical control: 3,567,031 move transitions,
all seven bounded action intervals exactly [-1,+1].
K8 lower/upper action threshold vectors COMPLETE using
75,392/40,220 counted BDD Boolean ops and 19,354/15,988
peak BDD slots, respectively. K9 LOWER all seven actions
completes FALSE (121,999 ops / 39,142 slots) and matches
independent prior source-owner BDD k9. K9 UPPER still
cannot compile its deterministic output cone under the 60k
node budget on eight fixed source-only action-bit orders.
The older reflected SOURCE-OWNER BDD still reaches k11;
none of these bounded calculations solve unrestricted
`44444` values or equivalence.

**Next genuine mathematical target:** compile quantified
structured factors and discharge guarded alternating
choice dependencies WHILE source functions are constructed,
rather than materialize one complete large source threshold
function first. Measure source gates, Boolean APPLY,
cofactor-function widths, GC/sweep work, full tied action masks
and reference agreement. Do not reopen the already solved
historic move7/move8 column transition.

Research/controls:
`docs/research/2026-10-16-action-robd-output-cone-functional-quotient.md`.

## New k7 exact guarded inner-quantifier projection; k8 semantic-width frontier — 2026-10-16

A proof-backed local Boolean factor operator now performs
**quantifier elimination before unnecessary full-function
cofactor products**. FORALL distributes through conjunction,
EXISTS through disjunction, either localizes past genuinely
variable-independent factors, and all correlated mixed cases
retain exact Shannon fallback. The first action stays FREE to
report every literal optimal action and tie when full bounds close.

**Independent tests:** 24 small-game complete optimum masks PASS
(13 unique, 11 ties); `44444` k7 28 labelled bounded thresholds
pass 2,799,124 physical reference transitions. k7 lower 63,757
Boolean ops/6,298 nodes; upper 166,807/16,517. All seven
unrestricted action intervals remain [-1,+1] and complete best
move set UNKNOWN. At k8 upper completes; lower reaches
60,000-node cap. The earlier source-owner reflected BDD
continues to reach deeper at k11; neither method proves
global branch elimination.

Sound same-direction *common-witness* unateness is too weak
under current syntactic sign certificates (k8 lower: one
shortcut and 85,612 extra polarity-cache misses, no width gain),
so keep as negative evidence, not a default implementation.

**Next:** source guard-conditioned essential-cofactor
equivalence/conditional separator that reduces correlated
adaptive obligations without lost `223` dependency order or
hidden future-policy traversal.
Theorem: `docs/research/2026-10-16-guard-qualified-quantifier-localization-and-action-vectors.md`;
negative: `docs/research/2026-10-16-common-witness-unateness-negative-width.md`.

## Owner correction — ZERO strategic branching, not partial pruning (2026-10-17)

**Primary open mathematical goal for GSP-003 and GSP-004:** compute exact unrestricted WDL and the **entire** set of equally optimal legal action labels by ONE structurally derived, **nonforking game-semantic algorithm** from original residual q. There must be NO independent evaluation of two inequivalent future strategic possibilities: not through minimax recursion, not repeated action-specific values, not a QBF/BDD materializing hidden game alternatives, and not symbolic response graphs later explored independently. A proven value-equivalent SET of moves is one acceptable output; a single continued quotient state additionally requires full future-game equivalence, not only tied WDL.

**The key correction:** eliminating 7 to 4 branches, 5,554 root-value queries, or some fraction of universal obligations **does not eliminate branching**. Those are qualified supporting lemmas, not successful completion of the target. Runtime, search solve time, peak BDD width, percentage pruning and depth solved are NOT ranking metrics for this goal. The exact recursive core remains sound and complete but fails this stronger zero-fanout property. If more than one inequivalent continuation must be explored, flag **INCOMPLETE / FAIL_ZERO_BRANCH**, even if the result is correct.

**Next proof:** find a rank-local exact structural optimality/value invariant `Z(q)=(V(q),M*(q))` whose evaluation trace never forks into alternative strategic futures. Prove the chosen move-set equivalence, excluded-move inferiority, first-win/legality/terminal guards and original ∀/∃ adaptation without consulting solved policies or materializing a game tree. Validation against qualified small-board and `44444` data occurs only after proof derivation. Old experiment budgets remain safety envelopes, not criteria for mathematical success.

[Overriding success contract](../docs/research/2026-10-17-zero-strategic-branching-objective.md). Historical results and negative controls are retained, but earlier words like *root branch elimination* must be read as **partial scalar obligation pruning**, not achievement of this zero-branch objective.

## 2026-10-17 — first root-value branches removed by full-future nongeometric simulation

**Primary strategy result:** source-only q cofactor/upset comparison
plus a source-certified bijection of all FUTURE legal column
moves is an exact full-game WIN/DRAW/LOSS preorder between
DIFFERENT P1 first choices, even when resulting h supports
are not identical by literal column and permutation is
not a raw-board horizontal reflection. Opposite favorable
inclusions under one π prove whole future-program
isomorphism with every best action transported.
A sound generator-constraint partial assignment algorithm
finds the proof before any descendant values are known.

Complete independently qualified distinct legal P1-q corpora
show **86+2280 nonreflection full-future isomorphisms** and
**320+3760 weak one-way full WDL orders** on 4x3/4x4.
A proven SCC source-component quotient on the resulting
certified action-value order safely removes **370 of 4872**
and **5554 of 50034** otherwise independent root P1
scalar VALUE queries, ALL beyond the geometric reflection
baseline, with zero incorrect root minimum or equality
in the exhaustive physical/q reference. No recursive game
states are visited by the structural producer; complete
optimal-move literal labels remain preserved as possible
ties. These are *value obligations* eliminated, not a
measured solver walltime improvement.

Canonical 7x6 `44444` still yields only three geometric
mirror pairs, requiring four scalar action representatives;
root WDL and full best move set remain UNKNOWN.
**Next:** exact first-win/capacity guarded NONBIJECTIVE
alternating response simulation for unlike support profiles,
plus a strict full-WDL/tie classifier. Do not resume
deeper action-BDD/QBF production as primary work.
Proof: `docs/research/2026-10-17-cross-support-root-branch-elimination.md`.

## 2026-10-17 — mathematical branch-elimination refocus, not another BDD depth chase

**Dominant continuing research goal:** source-q algebra that discharges
ENTIRE future opponent-response obligations while retaining exact
P0-relative W/D/L and **all tied-optimal literal action labels**.
The exact recursive core remains constructively complete and the
historic move7/move8 transition/short-horizon tactical masks are
already verified. Do not treat higher BDD/QBF horizons, gate GC
or a smaller symbolic expression as evidence of branch elimination.

**Two fundamentally different structural quotients must remain separate:**

- **Genuine full-game symmetry equivalence:** from symmetric
  canonical `44444`, seven P1 move6 alternatives form
  **four** horizontal-reflection action classes:
  {1,7}, {2,6}, {3,5}, {4}. The value of each pair is
  equal under exact game-rule automorphism, so only four
  distinct classes need independent WDL certificates.
  This alone does NOT classify their WDL values or prove
  classes equal to one another.
- **New exact but bounded universal-obligation quotient:** for
  an ORIGINAL source-only P1-reply/P0-answer success matrix,
  transpose the action response covers into reply signatures
  `S_b` and retain only their inclusion-MINIMAL antichain,
  storing ALL original labels. This preserves both fixed-layer
  `forall b exists a` and `exists a forall b` predicates.
  All 65,536×16 generic matrix scopes and COMPLETE legal P1
  source sets 2,208 (4x3) / 67,992 (4x4) PASS.
  Minimal universal proof obligations are 54.47%/52.94% fewer
  overall and 39.60%/20.77% fewer on positive bounded-winning
  source cases. Source response-mask construction is NOT
  eliminated; no end-to-end solver speedup was proved.

**Essential unsound shortcut falsifier:** legal 4x3 `111`
P1 replies 2/3 have equal bounded P0-answer signature 0x0,
yet full P0-relative WDL differs +1/0. Exhaustive 4x3/4x4
P1 states contain 220/22,380 equal-short-signature reply
pairs with unequal unrestricted WDL. On canonical `44444`
all seven replies also have bounded empty signatures:
this is ONE bounded predicate class, NOT one full-game
value class. `223` remains the quantified-order test.

**Selected proof gate:** construct a future-stable, FIRST-WIN/
gravity/response/terminal-guarded source-cofactor simulation
or a pointwise Boolean payoff implication for ALL future
action contexts. Original ∀/∃ adaptive scopes must be
preserved; each eliminated universal branch needs a
structural certificate of at least weak dominance,
and ALL WDL-tied move labels must survive unless strict
value or full functional equality is proved. Compute
and report **downstream strategic alternatives not
constructed**, plus proof construction cost. A mere
bounded signature reduction is not this achievement.
Supportive symbolic BDD/structured circuit consumers
should be used only after the new theorem is frozen.

Research and falsifier:
`docs/research/2026-10-17-branch-elimination-dual-obligation-and-future-separation.md`.

## Owner priority: eliminate strategic branching, preserve every tied-optimal action — 2026-10-16

**The leading continuing research objective for GSP-003 and GSP-004 is
EXACT STRATEGIC BRANCH ELIMINATION**, not simply representing the
recursive minimax game with a smaller circuit. For each legal source q,
derive directly the exact W/D/L value and **all literal legal columns
whose W/D/L equals the mover-optimal value**. A singleton answer is
correct only when no other legal move ties. Count actual construction,
quantifier/projection, intermediate obligation expansion, and solver
work; a closed QBF, compressed BDD, or hidden enumeration is not
enough. Prove source residual/terminal/legality and adaptive-response
scope preservation first.

The completed recursive/branching residual-q core remains
**constructively complete**. Branch elimination is not a missing
correctness primitive retroactively imposed on that core, but it
**is the primary goal of further research**, not merely an incidental
optimization. Falsify against independent complete small-board
action vectors, `223` quantified-order scope, `44444`, and the
same original 60k/300k/10k/15s resource envelope. Preserve
unresolved outcomes and genuine lower bounds.

[Owner-directed objective and mathematical output contract](../docs/research/2026-10-16-branch-elimination-primary-objective.md).

## Constructive core vs optional branch reduction — 2026-10-16

The ordinary residual-q, terminal and alternating-value core is now
**constructively complete for exact W/D/L and the complete W/D/L-optimal
action set**, even though its reference evaluator branches recursively.
See `docs/research/2026-10-16-constructive-algorithmic-core-completeness.md`.
Its research evaluator is **not** a production implementation of GSP-003
or GSP-004.

GSP-003 (symbolic predecessor) and GSP-004 (guarded shortcut proof) are
**the primary continuing research efforts to eliminate strategic branching**.
This stronger goal is not required for correctness of the already complete core. Evaluate
their results against the qualified recursive reference and count underlying
subproblems/materialized frontiers, not merely number of returned values.
Recursion elimination and formal minimality may be pursued later if useful.

## 2026-10-16 — quantified live compaction recovers k6, isolates new k7 wall

An exact, charged post-quantifier AND-DAG compactor now proves the
earlier 60k `44444` k6 lower projector failure was due in large
part to dead allocations (17,990 live AND gates versus 53,025
assigned IDs at the prior last completed bit). The new evaluator
completes all **four** k6 threshold truths with independent
finite-horizon physical agreement; the unrestricted interval
remains UNKNOWN. A bounded k7 lower/upper evaluation still hits
60k *inside a single unfinished cofactor*, after 12/21 bits,
even with between-bit compaction. Exact root truth has NOT been
derived after `44444`.

The next GSP-003/004 intervention is **mathematical**: reduce
actual quantified cofactor work using support-proved factor
independence, structured-DNNF/OBDD projection, sound action dependency
scope, or an explicit essential-width quotient; do not mistake
GC for strategic composition closure or increase budgets.
Research/evidence:
`docs/research/2026-10-16-exact-qbf-live-compaction-transient-width.md`.

## 2026-10-16 — first actual action-QBF projector finds k6 retained-width wall

The source-only action-bit QBF is not merely represented now: an
exact Shannon cofactor quantifier eliminator computes all four threshold
truth values through k5 for canonical `44444` with independent
physical bounded-control agreement, but returns UNKNOWN [-1,+1].
For k6 the lower thresholds hit 60,000 retained hash-consed gates after
12/18 action bits; upper thresholds complete TRUE. This is a concrete
representation-resource wall, not a minimum semantic width proof.
The older reflected source-owner BDD still completes k11 and is better
for current bounded-value calculations.

Next GSP-003/004 experiment: instrument truly reachable quantified
Boolean cofactors and transition-safe factor structure, then consider
garbage-collected or structured DNNF / bilateral strategies; count
construction AND projection, not just final constant. Record:
`docs/research/2026-10-16-guarded-qbf-shannon-projection-depth6-obstruction.md`.

## 2026-10-16 — full quantified source game representation; value closure OPEN

The guard-complete, all-horizon source-residual action QBF translation
now constructs a 37-ply `44444` CNF with 12,436 variables and
36,976 clauses, no materialized histories/supports, and an explicit
trunk-aligned path-width upper bound 232 (trivial prefix poset).
It is formula EQUIVALENCE, NOT an evaluated WIN/NONLOSS QBF. The
existing recursive exact q core and `44444` UNKNOWN remain unchanged.

This is shared mathematics for both GSP-003 (quantified symbolic
predecessor) and GSP-004 (adaptive response-cover certificate).
Both now prioritize **actual quantified truth elimination** under
original budgets, including source-guarded Skolem dependencies and
intermediate Boolean cofactor width. No new GSP ID is required.
Primary proof/Node22 control:
`docs/research/2026-10-16-guarded-action-qbf-full-depth-width.md`.

## 2026-10-16 — GSP-003/004 exact bounded response algebra and next mathematical proof

[Primary theorem/falsifier note](../docs/research/2026-10-16-bilateral-treewidth-and-galois-response-closures.md)
adds one exact finite action/reply Galois-recovery law and independently
reproduced Node22 exhaustive Boolean-relation controls. The family of ALL
maximal rectangles expands more often than it compresses (32,916 / 65,536
4x4 matrices), so it is not a suitable general recursive normal form.
Legal `223` remains a quantifier-order counterexample and has Boolean rank
three versus four maximal concepts.

GSP-004 continues sound action-labelled obligation factoring; GSP-003
continues structured quantified predecessor/threshold computation.
The next high-priority *conditional* hybrid is source-residual-derived,
terminal/legality-complete alternating QBF plus verified sound dependency
poset and trunk-aligned decomposition, using the Ganian/Gründel bilateral
width theorem and Capelli/Mengel structured quantifier projection.
A raw source residual min-fill width-15 result is NOT a QBF bilateral-width
bound. No unrestricted `44444` value or deep branch-elimination proof.

## Current proposals

| ID | Proposal | Current status | What it changes | Primary implementation seam | Proof/qualification burden | Next action |
|---|---|---|---|---|---|---|
| GSP-001 | [Quotient-native gameplay description](gameplay-strategy/GSP-001-QUOTIENT_NATIVE_GAMEPLAY_DESCRIPTION.md) | ROUGH_PROPOSAL | Makes q the explicit exact internal gameplay description | Connect4 domain/gameplay adapter | independent q-vs-physical transition replay; first-win controls | define the gameplay interface and exact record ownership |
| GSP-002 | [Packed q transition compiler](gameplay-strategy/GSP-002-PACKED_Q_TRANSITION_COMPILER.md) | ROUGH_PROPOSAL | Turns q + column into a low-cost exact runtime kernel | state compiler / transition layer | exact equality; transition equivalence; economics | prototype transparent packed q before aggressive compression |
| GSP-003 | [Symbolic q fixed-point solver](gameplay-strategy/GSP-003-SYMBOLIC_Q_FIXED_POINT_SOLVER.md) | ACTIVE_INVESTIGATION | Exact source-q bounded WIN/NLOSS interval BDD; now testing mathematically sound quantified factorization instead of growing support cones | dependency-localized structured Boolean factor circuit; exact distinct-cofactor width instrumentation | quantify interface width and action-label preservation after each QBF-style projection | PRIMARY OPEN criterion ZERO strategic fanout: exact source-q -> unrestricted WDL + ALL tied-optimal labels in one nonforking evaluation. Partial BDD/QBF sharing, reduction in scalar queries or improved solve time FAIL the goal; derive direct structural invariant. |
| GSP-004 | [Guarded obligation closure](gameplay-strategy/GSP-004-GUARDED_OBLIGATION_CLOSURE.md) | ACTIVE_INVESTIGATION | Exact action-labelled adaptive response obligation algebra, no search-derived policy generation | Boolean-rank rectangle factorization and sound dependency-localized quantifier composition over source residuals | preserve forall/exists order, first-win guards, action transport and sound factor supports; use fooling-set lower bounds | PRIMARY OPEN criterion ZERO strategic branching: a provably equivalent action SET is ONE logical decision; any two inequivalent strategic future evaluations FAIL. Existing response antichains/transports are supporting lemmas only, not achieved branch elimination. |
| GSP-005 | [Second-stage behavioral quotient after q](gameplay-strategy/GSP-005-BEHAVIORAL_QUOTIENT_AFTER_Q.md) | ROUGH_PROPOSAL | Tries to shrink q further while remaining executable | semantic-state minimization / automaton layer | exact behavior equivalence + maintainable update law | classify bounded q distinctions erased by MQ2 |
| GSP-006 | [Profile-safe proof and cache keys](gameplay-strategy/GSP-006-PROFILE_SAFE_PROOF_AND_CACHE_KEYS.md) | ROUGH_PROPOSAL | Prevents q identity from over-authorizing proof/context reuse | TT/proof-store/cache contracts | negative controls with equal q but different proof context | define QKey/ProofKey/HintKey contracts |
| GSP-007 | [Generic finite-gravity Connect-K q congruence](gameplay-strategy/GSP-007-GENERIC_CONNECT_K_Q_CONGRUENCE.md) | ROUGH_PROPOSAL | Tests whether q gameplay semantics generalize beyond 7x6 K=4 | generic Connect-K domain/profile | symbolic proof review + nonstandard-board controls | build qualification matrix and independent theorem review |
| GSP-008 | [Support-local exact action-value frontier](gameplay-strategy/GSP-008-SUPPORT_LOCAL_ACTION_VALUE_FRONTIER.md) | ACTIVE_INVESTIGATION | Collapses exact move choice into support-local score-threshold antichain frontiers | shared Connect4 decision/value layer; consumed by IsoMax and BSFP | independent isotony proof + bounded 7x6 frontier construction toward root | replace uniform sampling with support/demand-aware frontier generation and measure rank-by-rank generator economics |

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

### D. Exact decision frontier

The current best-move collapse candidate is:

~~~text
support-local residual favorable order
    -> exact isotone action values
    -> nested antichain score frontiers
    -> exact argmax move
~~~

Tracked by:

- GSP-008.

Direct best-action regions are not monotone under the tested order; action-value frontiers are the exact object.

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
- `isograph/discovery/2026-09-18-method-emergence/CAMPAIGN.md`;
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
