# Connect4 current research status

**Updated:** 2026-09-18  
**Branch:** `research/semantic-quotient`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is the current-state router, not a theorem ledger. This branch owns **all durable Connect4 research**, regardless of which solver produced it. Research artifacts live across `research/**` and `docs/research/**` on this branch; the executable research continuation lives in `next_step.yaml`.

## Research ownership

`research/semantic-quotient` is the single durable research owner. Minimax, CUDA-BSFP, Hybrid Confluence, Isometric, and SUT are implementation consumers, not alternate research authorities. Temporary experiments may carry in-progress research only until durable results are integrated here.

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
  -> NDC certificate closure
  -> solver-specific exact proof procedure.
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
