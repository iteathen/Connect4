# Connect4 current research status

**Updated:** 2026-09-19  
**Branch:** `research/semantic-quotient`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is the current-state router, not a theorem ledger. This branch owns **all durable Connect4 research**, regardless of which solver produced it. Research artifacts live across `research/**` and `docs/research/**` on this branch; the executable research continuation lives in `next_step.yaml`.

## Research ownership

`research/semantic-quotient` is the single durable research owner. Active implementation consumers are IsoMax/Isometric, CUDA-BSFP, and SUT. Minimax/Negamax/alpha-beta and Hybrid Confluence are historical solver lineages, not current implementation owners. Temporary experiments may carry in-progress research only until durable results are integrated here.

See `docs/decisions/2026-09-17-single-research-owner.md`.

## Current logic representation authority

Connect4 logic authority is now IsoGraph authority 1.1:

- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.md`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.isg`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json`

Qualification and promotion are recorded in `research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_1.md` and `docs/decisions/2026-09-18-isograph-logic-authority-1-1.md`. Authority 1.0 remains immutable historical qualification evidence.

The prior Markdown/JSON/spec/claim corpus is retained as a provenance/readability bridge. The exact qualified frozen source is embedded in the native IsoGraph source-image layer. Unknown and unresolved material remains explicitly represented; it is not treated as absent or false.

The Core-0.18 sanity correction has been applied operationally without changing authority 1.1 semantics. Material discrepancies now carry separate qualification and discovery dispositions. The frozen 1.1 cold evidence remains unchanged; surviving structural leads are tracked in `research/isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`.

The first full Discovery Protocol campaign has now executed against those anomalies:

- campaign narrative: `research/isograph/discovery/2026-09-18-discrepancy-protocol-campaign/CAMPAIGN.md`;
- machine ledger: `research/isograph/discovery/2026-09-18-discrepancy-protocol-campaign/DISCOVERY_LEDGER.json`.

Key results:

```text
ESTABLISHED:
    explicit scope metadata != semantic validity restriction
    R0045 = 4 citations/artifacts -> 3 events -> 2 lineages
    evidence-independence applicability is lineage/proof-topology scoped

SUPPORTED:
    semantic-layer substitution is a recurring cold-reconstruction failure mode

FALSIFIED:
    one shared minimal relation-basis explanation for R0015/R0016/R0052 deficits

CLOSED AS ORDINARY ERROR:
    10-lineage / 13-event prose substitution
```

No authority-1.1 semantic artifact changed.

## Current RBA successor frontier — 2026-09-19

The post-1.1 successor graph is current through the complete selected rank-29 boundary and one exact rank-28 draw-threshold predecessor:

- `research/isograph/successor/CONNECT4_POST_1_1_RBA_OVERLAY_0_3.*`
- `research/isograph/successor/CONNECT4_RBA_QU_0_10.*`
- `research/isograph/successor/CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_3.*`

Current semantic disposition:

```text
C4-R0077  board-fiber residual/cofactor algebra                 deductive_exact
C4-R0078  board-fiber ordinary-value invariance                 guarded_exact
C4-R0079  terminal-extended cofactor adjunction/composition      deductive_exact
C4-R0080  four-front partial-WDL block carrier                   deductive_exact
C4-R0081  Bellman antichain-semiring lattice polynomial         deductive_exact
C4-R0082  local-skyline semiring multiplication factorization   deductive_exact
C4-R0083  rank31/rank30 + complete selected rank29 + rank28 draw empirically_supported
C4-R0084  root-scale frontier-width/economics                    open_question
```

Selected rank29 is fully closed:

```text
support [3,5,2,1,6,6,6]
draw13 final product:
    131,121 x 41,133
    = 5,393,400,093 implicit opportunities
    -> 4,393,899 local candidates
    -> 140,454 exact generators

complete strong boundary:
    Upper 1,6,26,223,2262,18399,47472,66024,30923,9120,537,44,7,3
    Lower 4,16,160,2114,16787,44864,140454,68522,11917,779,84,8,1,1
```

A direct maximal replay of all 4,393,899 local candidates returns the same 140,454-generator draw13 boundary.

The first structurally selected rank28 predecessor is:

```text
support [3,5,2,0,6,6,6]
residual shapes 35
transformed bits 70
Upper(draw14) 144,462
Lower(draw14)  78,546
```

This one-step result rejects a simple monotone cost law based only on rank, residual-shape count, transformed bit width, or raw pair count. It does not establish a general earlier-rank scaling law.

C4-R0076 remains open on the proof/certificate clause-to-value bridge and remains a side seam rather than the primary ordinary-value execution route.

Authority 1.1 and its frozen qualification evidence remain unchanged.

## Applied Natural Entropic Identity layer

NEI is now applied over the Connect4 IsoGraph as a derived identity overlay:

- `research/isograph/identity/CONNECT4_NEI_APPLICATION_0_1.md`;
- `research/isograph/identity/CONNECT4_NEI_APPLICATION_MANIFEST_0_1.json`;
- `research/isograph/identity/CONNECT4_NEI_PROFILES_0_1.json`;
- `research/isograph/identity/CONNECT4_NEI_RESULTS_0_1.json`;
- `research/isograph/identity/CONNECT4_NEI_RESULTS_0_1.isg`.

Current NEI results:

```text
SAME:
    R0044 artifact projections -> same lineage
    R0074 event projections -> same lineage
    same-q states -> same future-behavior state on exhausted SIU-1 controls

DISTINCT:
    R0044 artifacts under artifact identity
    R0074 historical/canonical events under event identity
    R0045 rolling/compact lineages under lineage identity

INCOMPLETE:
    standard 7x6 same-q future-behavior identity

semantic NEI UNKNOWN:
    none
```

The 7x6 result is deliberately incomplete/unqualified rather than semantic UNKNOWN because no qualified QU-mediated identity model family exists for that question.

### Discovery Protocol rerun with NEI

The original discrepancy campaign was rerun against the same authority evidence with the applied NEI layer enabled:

- `research/isograph/discovery/2026-09-18-nei-enabled-rerun/CAMPAIGN.md`;
- `research/isograph/discovery/2026-09-18-nei-enabled-rerun/DISCOVERY_LEDGER.json`;
- `research/isograph/discovery/2026-09-18-nei-enabled-rerun/BEFORE_AFTER.json`.

Measured effect:

~~~text
original branches materially changed     1
original branches precision improved     1
original branches unchanged / NEI N/A    3
new NEI-enabled discovery branches       2
~~~

The material change was R0045: NEI showed that the 4/3/2 evidence hierarchy is **not** a global artifact->event->lineage quotient staircase. Artifact `3000222` participates in five lineages, so evidence identity projection must be context/anchor scoped.

The new cross-domain structural candidate is:

~~~text
fine identity DISTINCT
-> context/profile-specific projection
-> scoped semantic identity SAME
-> fine residual/provenance preserved
~~~

observed across R0044 artifact/lineage, R0074 event/lineage, and SIU physical/future-behavior identity.

The standard-7x6 state-identity gap was then investigated directly in the high-value-lead campaign.

### High-value lead investigation

Primary record:

- `research/isograph/discovery/2026-09-18-high-value-leads/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-high-value-leads/LEAD_LEDGER.json`

Results:

~~~text
semantic scope:
    current structured fields are insufficient for exact derivation;
    successor needs typed claim-domain / guards / evidence-coverage / exclusions

evidence independence:
    current graph cleanly separates deductive-only vs empirical lineages;
    successor should type evidence_mode

identity projection:
    artifact identity != artifact-lineage occurrence
    contextual correspondence span replaces global quotient assumption

standard 7x6 q identity:
    direct future-behavior congruence proof candidate derived

same-q breaker search:
    reclassified as adversarial theorem/implementation qualification
~~~

The q-congruence proof shows that equal support + equal normalized P0/P1 residual antichains determines legal actions, immediate terminal results, and every nonterminal successor q; finite induction then determines the entire ordinary future game. An exhaustive abstract antichain/cofactor control passed 32,906 set families / 131,474 cofactor cases.

The historical NEI-C4-0007 result remains `INCOMPLETE_UNQUALIFIED` under its pinned evidence revision. New post-application research now supports candidate `SAME` for standard-7x6 future-behavior identity pending independent qualification and successor authority ingestion.

## Operational-layer method emergence

A new Discovery Protocol campaign tested whether active solving methodology had been mapped at the wrong semantic layer:

- `research/isograph/discovery/2026-09-18-method-emergence/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-method-emergence/OPERATIONAL_LAYER_METHOD_EMERGENCE.md`
- `research/isograph/discovery/2026-09-18-method-emergence/DISCOVERY_LEDGER.json`

The campaign erased solver `consumed_by` labels from the claim graph before interpretation. The operational/proof core remained connected.

Current discovery disposition:

~~~text
ordinary exact game semantics:
    behavior state + legal transition + terminal boundary
    + alternating player quantification + finite rank
    -> unique ranked W/D/L recurrence

state-evolution edge:
    q_r -> q_(r+1)

value-dependency edge:
    V(q_(r+1)) -> V(q_r)

IsoMax:
    demand-driven materialization/evaluation of that dependency

CUDA-BSFP:
    supply-driven symbolic predecessor/evaluation of that dependency

NDC / guarded certificates:
    shortcut proof edges over the same exact game semantics
~~~

This strongly supports the hypothesis that solver multiplicity was partly a representation-layer/control-flow distinction. It does **not** establish complete structural shortcut closure, standard-7x6 q as frozen authority, or a final SUT architecture.

The active guarded mixed-cofactor obligation seam remains valid; it is now interpreted as compact derivation of shortcut controllable-predecessor facts rather than creation of a separate solver semantics.

## Exact best-move frontier discovery

The follow-up campaign targeted the actual decision problem rather than solver recurrence:

- `research/isograph/discovery/2026-09-18-policy-frontier/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/RESULTS.json`

Current strongest result:

~~~text
fix support S and side p

qA >=_p qB
    when mover residual completion is no harder
    and opponent residual completion is no easier

candidate consequence:
    exact state value and every fixed-action strong score are isotone
~~~

Complete-control adversarial evidence:

~~~text
comparable q pairs              6,300,753
state W/D/L violations                  0
state strong-distance violations         0

comparable fixed-action pairs  18,076,405
action W/D/L violations                 0
action strong-distance violations        0
~~~

This yields exact support-local antichain frontiers for action-score thresholds. The direct predicate `column c is optimal` is not monotone and is rejected as the frontier object.

Policy-collapse headroom is large: q/support-policy collapse ranges from 3.646x to 32.671x on the four controls, while transition-closed policy automata collapse only about 1.16x-1.34x. The useful object is therefore a decision/value relation evaluated on current structure, not a smaller q state machine.

This is a derived theorem candidate and implementation lead; authority 1.1 remains unchanged.

The standard-7x6 bounded constructive follow-up is now complete through sampled ranks 26-40.

Key cross-rank result:

~~~text
independent child-rank frontiers
+ one exact legal transition
-> held-out parent action intervals
-> exact best-move proof when intervals separate

20k child frontier budget:
    rank 26 best-move coverage   15.40%
    rank 30                      54.62%
    rank 34                      81.63%
    rank 36                      88.39%
    rank 38                      97.44%
    rank 39                     100.00%

aggregate ranks 26-39:
    held-out q states        64,644
    held-out actions        257,007
    false action claims           0
    false best-move claims        0
~~~

Scaling the child frontier from 20k to 100k states raised rank-28 best-move coverage from 30.44% to 73.36% and rank-26 coverage from 15.40% to 61.36%, again with zero false claims.

This shifts the open engineering question from whether the relation can select moves to how to construct/propagate enough frontier coverage toward the root.


## Confirmed direct-propagation representation wall

The direct rank-propagation follow-up advanced beyond the sampled frontier work and has now been independently reviewed.

Evidence:

- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_CLAUSE_Q_BRIDGE.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_RESULTS.json`
- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_CONFIRMATION.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_CONFIRMATION.json`

Recorded post-authority IsoGraph claims:

~~~text
C4-R0075  empirically_supported
    observed standard-7x6 rank-35 wall is a scoped
    representation/composition explosion at distributed
    universal proof conjunction before semantic/value collapse

C4-R0076  missing_law
    derive a compact realizability-preserving clause/proof
    -> residual/q-value controllable predecessor before
    universal alternatives are fully distributed
~~~

Confirmation boundaries:

- rank 35 has exactly 1,709 supports;
- recorded pathological move-width products recompute exactly to 573,270,600 and 58,748,277;
- maintained BSFP host/CUDA semantics independently confirm Cartesian candidate generation before antichain normalization;
- C4-R0073/R0074 already qualify the predecessor-closed clause carrier;
- the large residual-shaped projection gap is real, but the recorded 626/192 rank-39 projection objects are **not** legal-q classes because exact cardinality and alternating-history realizability were not enforced.

Frozen authority 1.1 remains unchanged. The claims live in:

`research/isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.*`

This now supersedes generic reducer tuning as the primary scaling seam.

## Gameplay strategy / implementation proposal lane

The persistent index for turning IsoGraph findings into gameplay descriptions, solver strategies, and implementation experiments is:

- `research/GAMEPLAY_STRATEGY_INDEX.md`

Current rough proposals cover:

~~~text
q-native gameplay description
packed q transition compiler
symbolic q fixed-point solving
guarded obligation/searchless closure
behavioral quotienting beyond q
profile-safe proof/cache keys
generic Connect-K q congruence
~~~

This is a proposal/implementation surface, not semantic authority. New durable gameplay-facing ideas should enter through that index so they remain visible and trackable.

## Consolidated research-lane state

On 2026-09-17, the canonical research lane was fast-forwarded through `research/structural-calculus-handoff-20260916`, the exact unified-knowledge trees were attached under `research/`, and the later BSFP/Isometric transfer packet was consolidated from `research/bsfp-isometric-invariant-transfer`. This branch now preserves the active structural-calculus lineage, BSFP/Isometric transfer research, and the normalized cross-lineage research knowledge base.

The consolidation changes branch ownership/provenance only. It does not promote research claims, alter theorem dispositions, or make this branch a solver implementation head. Non-research solver/product branches remain outside this cleanup.

Use `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.md` as the logic entrypoint. `research/canonical/CLAIM_INDEX.json` is now a legacy claim-ID/readability bridge, while `research/provenance/SOURCE_MANIFEST.json` remains source provenance.

## Authority and proof boundary

- Domain target: every positive finite rectangle `W x H`, Connect-4 (`K=4`).
- C4-0006 and C4-0007 remain Candidate structural/proof specifications. C4-0010 is an accepted research consumer and does not promote imported Candidate clauses.
- Finite sweeps, solved W/D/L tables, strong-distance data, and varying-board censuses are discovery/validation/falsification evidence only.
- Unknown is not loss; theorem failure is not theorem negation; equal dimension is not a natural isomorphism; absence of a forcing certificate is not a draw certificate.
- No recursive minimax/Negamax/MCTS/PNS result or solved database label is a premise of an asserted structural theorem.
- First-win stopping remains authoritative over partial structural observations.

## Closed structural foundation currently in use

The current research stack is:

```text
geometric winning-line axioms
  -> support / future placement-event frontier
  -> CPC control potential / event precedence
  -> positive residual antichains and blocker clauses
  -> guarded response/resource/deadline consequences
  -> NDC certificate closure / shortcut proof dependencies
  -> solver-neutral ranked exact value dependency
  -> solver-specific evaluation/materialization policy.
```

The following September 14 results are retained as the active foundation rather than repeated here in full:

- **total-domain static geometry and third-difference calculus** — symbolic formulas for line count, incidence rank/kernel, axis/phase quotients, and their board-family boundary cases;
- **A4/quiver decomposition** — canonical static decomposition of the principal empty-board maps; standard 7x6 yields `69 = 28 + 6 + 28 + 7`;
- **thin-board theorem** — `min(W,H)<4` implies empty-board draw by quantified legal response proof;
- **binary control potential** — CPC, phase, seams, and ownership correction are views of one parity/control potential rather than duplicated player-color state;
- **domain-wall / gravity normal form** — terminal four-lines are zero-edge predicates; ownership fields admit an anchor-plus-seam representation;
- **safe pure-followup / seam reservoir** — exact defensive geometry, including the standard width-7 center-safe affine seam cube;
- **anchored zero-edge residuals** — both players share one zero-edge terminal geometry with player identity supplied by the ownership anchor;
- **affine/clause separation** — blocker sets are positive monotone clauses, not XOR unless split ownership is separately certified.

Primary routing for these results is in `docs/research/RESEARCH_INDEX.md` and the `required_authority` / `qualified_premises` sections of `next_step.yaml`.

## Current strategic interpretation

The smallest preserved common strategic shape is:

```text
binary control potential
+ full positive residual incidence
+ affine ownership/parity relations
+ monotone blocker clauses
+ support / response-resource / deadline guards
+ NDC composition
-> exact terminal or proof consequence where qualified.
```

Pure-followup/domain-wall safety is a defensive/no-loss substrate, not a signed value theorem. Hall/resource deficiency is a sufficient forcing/stopping certificate only under its exact guards; absence of Hall deficiency is not draw evidence.

## Active seam — guarded mixed-owner cofactor obligation birth

The solved-database collision audit changed the classification of the missing mechanism.

For player `p`, the positive residual antichain is a monotone Boolean completion formula. Owner-labelled events are exact cofactors. On distinct cells, owner-`p` and owner-`1-p` substitutions commute algebraically. Therefore the missing noncommuting game content is not another residual-algebra primitive; it enters through legality/admissibility, support, response resources, deadlines, opponent-universal intervention, and first-win stopping.

Current classification:

```text
new primitive enabling predicate        not warranted
owner-labelled enabling                derived certificate relation
cofactor degree drop                   exact algebra, not yet obligation birth
intervening-choice stability           missing guard
cofactor -> obligation quantifier lift primary missing composition rule
winner/sign lift                       downstream of decisive terminal certificate
```

Target rule shape:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation.
```

Apply this first to the documented shared d-column continuation of the minimal six-ply collision. Stop at the first required guard not derivable from existing support, blocker, control-potential, response-resource, deadline, or first-win coordinates. Only that residue is a candidate new predicate.

### Bounded collision control

Zero-based paths:

```text
A = [6,6,6,6,2,2] -> database draw
B = [2,6,6,2,6,6] -> database P0 win
```

They share support `[0,0,2,0,0,0,4]`, degree-2 structural signatures, and all first-P0-event degree-2 jets. Independent structural replay reproduced exactly 13 differing degree-2 signatures among 49 common two-event column pairs. `P0 a1, P1 d1` exposes a B-only P1 residual `{e1,f1}`.

That residual is a discriminator, not a proof of the database outcome. Degree contraction alone does not establish an active defensive obligation.

Primary notes:

- `docs/research/2026-09-14-solved-db-structural-discovery.md`
- `docs/research/2026-09-14-solved-db-structural-assessment.md`

Finite database results currently falsify value-completeness of boundary-capacity, degree-2, GF(2)-span, and current-owner degree-2-jet projections. Exact residual identity and the ownerJet signature have no sampled value collision, but this is finite validation only and gives no theorem or compact-selector proof.

## Immediate execution target

`next_step.yaml` owns the executable continuation:

`derive_guarded_mixed_cofactor_obligation_birth`

The first construction must:

1. preserve exact support and full positive residual identity;
2. separate commuting Boolean cofactor algebra from game-time admissibility;
3. quantify opponent interventions over the post-cofactor consequence/antichain, not survival of one named residual;
4. reuse existing singleton/fork, blocker, response-capacity, deadline, and NDC consequence types before inventing new state;
5. use solved labels only to falsify proposed rules;
6. preserve first-win stopping and absolute player/sign lift only after an exact terminal certificate.

## Solver / ordering side seam

GitHub issue **#43 — `Design-only: theorem-tiered packed structural key for frontier-native Negamax ordering`** records the move-order/advisory-evaluation design. It remains **design only**: no implementation, pruning authority, branch, or PR is implied by that issue.

Conventional fixed-center, reversed-worker, history/killer, or scalar heuristic policies have no default structural authority. They may remain explicit controls or survive only through measured evidence.

## Paused / preserved work

- post-center strong-distance selector — paused inside the broader guarded value-closure problem;
- history-aware marked residual calculus after the qualified 21-space — preserved;
- forward W/D/L rank-7 P1 horizon at exact state `4665655` — unfinished but preserved;
- varying-board census — validation/falsification only;
- former `research/connect-k-derivative-classification` work — retired from live topology; its durable predicate/axiom results are integrated into the canonical derivative claim registry and retained provenance, and they do not solve the temporal guard seam.

## Retention and cleanup rule

Keep durable theorem derivations, exact qualification evidence, useful falsifiers, and historically important performance/provenance records. Git history is the archive for superseded handoffs, chat summaries, temporary publication checkpoints, and obsolete executable/scaffolding state.

Do not create another chronological status ledger. Update this file only when the current proof boundary, active seam, or routing materially changes.
