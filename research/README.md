# Connect4 research knowledge base

Research lives here, and all durable Connect4 research belongs here.

The branch `research/semantic-quotient` is the single canonical research owner for Connect4. Active solver consumers are IsoMax/Isometric, CUDA-BSFP, and SUT. Minimax/Negamax/alpha-beta and Hybrid Confluence are historical solver lineages whose useful knowledge remains preserved here. Solver branches own implementation; they do not own separate research truth, research notes, hypotheses, experiment results, counterexamples, or research evidence.

Research direction: Josh Oshiro.

## Gameplay strategy and implementation proposals

The living bridge from IsoGraph research into gameplay description, solver strategy, and implementation ideas is:

- `GAMEPLAY_DESCRIPTION_FOR_HUMANS.md` — novice-level gameplay description, classical q-congruence proof, and IsoGraph/NEI interpretation.
- `GAMEPLAY_STRATEGY_INDEX.md`

New durable gameplay-facing strategies must be registered there rather than left only in dated notes, issues, experiments, or solver branches. Proposal documents live under `gameplay-strategy/`.

The strategy index is not semantic authority. It tracks what to try, how it could be implemented, what exact research it consumes, and what must be proved or measured before adoption.

## Read this first

The qualified logic authority is IsoGraph. Read in this order:

1. `isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md` — sole current game-theory / logic authority root.
2. `isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json` — immutable promoted semantic package/evidence identities.
3. `isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.*` plus the 1.2 claim-coverage artifact — frozen promoted semantic package.
4. `isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_2.md` and q_o/q_r / NEI qualification evidence when identity is material.
5. `isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md` — separately qualified hot-loop performance graph, no gameplay-authority effect.
6. `isograph/optimization/ISOMAX_HOT_LOOP_NEES_REALIZATION_AUTHORITY_0_2.md` — current NEES realization binding for promoted IsoMax hot execution.
7. legacy `canonical/`, `maps/`, `hypotheses/`, `open-questions/`, `confidence/`, and `evidence/` only for readability, compatibility, or provenance checks.
8. authorities 1.1 and 1.0 only as immutable historical qualification evidence.

The exact pre-IsoGraph corpus remains preserved in the historical authority layers. Direct edits to legacy Markdown/JSON bridge files do not change current logic authority.


### Current IsoMax work-distribution result

The complete decentralized worker-pull candidate from issue #102 has been implemented and qualified as a bounded experiment.

Current result:

- `isograph/optimization/ISOMAX_DECENTRALIZED_PULL_102_RESULT_0_1.md`

Disposition: **rejected for promotion in the current Node 26 / V8 14.6 IsoMax profile**.

Key distinction preserved by that result:

```text
global semantic visibility / canonical q reconciliation / worker pull
    feasible and semantically useful

every genuine decision frontier as a shared execution unit
    economically rejected
```

The result strengthens the case for coarser shared exact-reuse mechanisms (#78) rather than invalidating q convergence or dependency-leverage priority as concepts.



### Post-1.1 derived successor claims

Confirmed research that occurred after the frozen 1.1 authority is recorded without mutating that authority.

Current successor overlay:

- `isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.md`
- `isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.json`
- `isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.isg`

It records:

- `C4-R0075` — confirmed scoped distributed-universal-composition wall before semantic collapse;
- `C4-R0076` — missing compact realizability-preserving clause-to-value controllable predecessor.

These are successor-overlay claims, not authority-1.1 mutations. A later authority revision must independently qualify and ingest them.


### Structured post-1.1 unknown — Residual Boundary Algebra (RBA)

The currently unknown complete/minimal algebra behind the Connect4 residual-boundary value work is represented as a qualified-IsoGraph-QU **OPEN** information state rather than an opaque unknown:

- `isograph/successor/CONNECT4_RBA_QU_0_1.md`
- `isograph/successor/CONNECT4_RBA_QU_0_1.json`
- `isograph/successor/CONNECT4_RBA_QU_0_1.isg`

Topology placement of that QU inside the Connect4 graph:

- `isograph/successor/CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_1.md`
- `isograph/successor/CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_1.json`
- `isograph/successor/CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_1.isg`

The placement fixes the participating semantic regions/endpoints while keeping the unresolved relation occurrences themselves as nested OPEN QU states. This is specifically how the graph records “we know these structures are connected, but do not yet know the exact relation kind/direction.” No typed authority edge is promoted by the placement.

Stable research identity:

`RBA-QU-0001 — Residual Boundary Algebra completion space`

Latest strict research refinement after assertion-collapse tests:

- `isograph/successor/CONNECT4_RBA_QU_0_2.md`
- `isograph/successor/CONNECT4_RBA_QU_0_2.json`


Latest board-fiber refinement:

- `isograph/successor/CONNECT4_RBA_QU_0_3.md`
- `isograph/successor/CONNECT4_RBA_QU_0_3.json`


Value-information refinements:

- `isograph/successor/CONNECT4_RBA_QU_0_4.md`
- `isograph/successor/CONNECT4_RBA_QU_0_4.json`
- `isograph/successor/CONNECT4_RBA_QU_0_5.json`

- `isograph/successor/CONNECT4_RBA_QU_0_6.md`
- `isograph/successor/CONNECT4_RBA_QU_0_6.json`

RBA-QU-0006 records that six-valued partial information is exactly represented by four nested endpoint fronts and that those fronts remain closed through tested 2/4/6-ply symbolic block composition, including action-specific fronts. The remaining core unknown is compact/output-sensitive normalization of mixed opponent-reply cover terms and possible fusion of those front transformers across the board-fiber graph.

RBA-QU-0004 records that the raw-transition complete shell is too fine and that a four-valued UNKNOWN/WIN/DRAW/LOSS Bellman refinement exactly reconstructs strong outcome+distance on complete controls. RBA-QU-0005 further records that the six contiguous WDL partial-information bounds compose exactly through fixed-depth alternating blocks. The remaining core unknown is symbolic boundary composition/normalization of those exact block transformers over the board-fiber graph.

RBA-QU-0003 records that exact board-fiber isomorphism transports the abstract ordinary-value algebra, while raw transformer typing adds only modest compression beyond the fiber quotient. The remaining core unknown is compact value-boundary transformer composition over the board-fiber graph.

RBA-QU-0002 narrows the rank-collapse unknown: fixed action-word transitions and two-ply alternating max/min composition are no longer broadly open; compact value-boundary block composition and compact root normal form remain open. It is a research refinement, not a new qualified authority revision.

Its open region separately represents the unknown minimal operator basis, compactness law, rank-collapse law, direct-root expression, minimal observation, proof/value correspondence, family scope, and canonical factorization. It pins exact constraints, interfaces, exclusions, evidence and refinement semantics under qualified IsoGraph QU 0.1.

`OPEN` applies to the RBA realization family. Individual propositions such as “rank propagation can be eliminated” are **not** automatically semantic QU `UNRESOLVED`; they retain their own witness/coverage burden.

The RBA QU is post-1.1 research structure only. It does not mutate frozen authority 1.1, close C4-R0076, assert root compactness, solve the empty 7x6 root, or promote any unproved relation edge.
### Current RBA IsoGraph successor state

Current post-1.1 RBA successor:

- `isograph/successor/CONNECT4_POST_1_1_RBA_OVERLAY_0_8.*`
- `isograph/successor/CONNECT4_RBA_QU_0_15.*`
- `isograph/successor/CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_8.*`

Progression:

```text
rank29 [3,5,2,1,6,6,6]   complete
rank28 [3,5,2,0,6,6,6]   complete
rank27 [3,4,2,0,6,6,6]   loss14/draw15/win15 closed; staged evaluator qualified
rank26 [3,3,2,0,6,6,6]   selected; draw16 children being cached
```

New exact evaluation laws:

- C4-R0091 — core-relative envelope absorption removes dominated rows/columns before product materialization using real product witnesses;
- C4-R0092 — principal-cover coordinate preimages share an exact uncovered-target dynamic program across many queries on one cofactor edge.

The staged rank27 qualification is preserved in:

- `isograph/discovery/2026-09-18-policy-frontier/RBA_RANK27_STAGED_PLANNER_QUALIFICATION_0_2.md`;
- `isograph/discovery/2026-09-18-policy-frontier/RBA_SHARED_TARGET_COVER_DP_RANK26_CHECKPOINT_0_1.md`.

The selected rank26 central target is `draw16`. Three rank27 `draw15` children remain to be cached before root composition.

The proof/value bridge remains OPEN. Authority 1.1 remains frozen.

### Current derived method-emergence result

The current operational-layer discovery is:

- `isograph/discovery/2026-09-18-method-emergence/CAMPAIGN.md`
- `isograph/discovery/2026-09-18-method-emergence/OPERATIONAL_LAYER_METHOD_EMERGENCE.md`

It does **not** add solver ontology to IsoGraph. It strips solver labels and shows that exact ordinary W/D/L already follows from existing Connect4 topology:

~~~text
exact behavior carrier
+ legal transition
+ terminal boundary
+ alternating player quantification
+ finite rank
-> ranked exact value dependency
~~~

IsoMax and BSFP are then observed as different evaluation/materialization policies over that relation. Frozen authority 1.1 is unchanged.

## Observation-first discrepancy handling

Research discrepancies are preserved as evidence before they are normalized.

For count/scope/identity/relation/provenance/uncertainty disagreements, first ask whether both sides actually measure the same semantic quantity under the same scope, representation layer, aggregation level, authority, and closure assumptions.

Record two independent outcomes:

```text
qualification_disposition
discovery_disposition
```

A decoder/output error may be closed for qualification while leaving a structural lead open. An interesting structural lead does not excuse a qualification error and does not become authority without its own evidence.

Authority-1.1 post-hoc dispositions are in:

- `isograph/qualification/CORE_0_18_SANITY_AUDIT_1_1.md`;
- `isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`.

## Epistemic categories

A statement must be classified before it is used as authority:

- `deductive_exact` — established by derivation/proof within stated premises.
- `guarded_exact` — exact only when explicit guard conditions hold.
- `accepted_contract` — accepted semantic/engineering rule for consuming exact research.
- `empirically_supported` — supported by measured evidence but not deductively established.
- `hypothesis` — plausible claim awaiting adequate evidence or proof.
- `candidate_rule` — proposed calculus/composition rule not yet accepted.
- `open_question` — unresolved question.
- `missing_law` — a specifically identified law/closure condition needed for the calculus.
- `disproven` — contradicted by decisive counterexample or proof.
- `rejected` — investigated approach intentionally not pursued under current evidence/constraints; this does not imply every proposition inside it is false.
- `deferred` — valid or plausible work whose implementation/qualification is postponed.
- `superseded` — replaced by a later formulation/evidence packet.
- `historical_only` — retained to explain lineage, not current reasoning.
- `untriaged` — preserved but not yet normalized into the claim graph.

## Directory roles

- `GAMEPLAY_STRATEGY_INDEX.md` / `gameplay-strategy/` — living gameplay/implementation proposal surface where IsoGraph findings are translated into candidate runtime and solver strategies.
- `isograph/` — qualified current logic representation, authority manifests, native corpus, and qualification evidence.
- `canonical/` — legacy normalized model/claim-registry bridge retained for readability and reconstruction.
- `maps/` — relationships among claims and solver consumers.
- `hypotheses/` — live unproved ideas worth testing.
- `open-questions/` — missing laws and unresolved seams.
- `evidence/` — normalized evidence records keyed to stable claim IDs.
- `experiments/` — experiment design/result normalization.
- `confidence/` — confidence/Bayesian update model.
- `history/` — disproven, rejected, deferred/superseded, and historical-only knowledge.
  - `history/historical-only/solver-lineages/` — retired Minimax and Hybrid Confluence knowledge; active solver topology remains outside history.
- `untriaged/` — explicit queue of source material still awaiting semantic normalization.
- `provenance/` — lossless historical source archive. Evidence, not current authority.

## Ownership rule

The previous branch-first and solver-specific research ownership models are retired. All durable research material is integrated here: claims, derivations, hypotheses, experiment results, falsifiers, negative results, open questions, research evidence, maps, and provenance. Solver-family branches may keep implementation contracts, implementation status, qualification/reproduction artifacts, and code-local operational notes, but they are not research owners.

Temporary `experiment/*`, `work/*`, or other explicitly temporary branches may carry in-progress research while an experiment is active. Their research output must be integrated into this branch before the temporary ref is retired; a temporary branch never becomes a second research authority.

Code should reference stable claim IDs such as `C4-R0004` where practical. A solver-specific optimization can consume a claim without changing its epistemic status.

## New-relation rule

Newly discovered relations follow a stricter promotion rule than ordinary empirical findings.

~~~text
candidate relation
    -> claim/hypothesis only

deductive or guarded-exact proof
    -> IsoGraph relation edge
~~~

Empirical confirmation can support the claim that a relation may exist, but does not by itself make that relation part of authoritative graph topology. Until proof, keep the source/target/type/scope as claim metadata and prevent downstream reasoning from consuming it as an established edge.

Once proved, the relation must be recorded explicitly in the next qualified IsoGraph successor representation.

## Claim-registry bridge rule

The legacy `CLAIM_INDEX.json` and its shards preserve the pre-IsoGraph normalized claim database and remain useful bridge views. They are no longer the logical authority root. Stable `C4-R####` identities remain preserved in current IsoGraph authority 1.1; authority 1.0 remains immutable historical evidence. Any authoritative change to a claim requires a successor qualified IsoGraph authority revision.

## Cleanup rule

Never delete or merge away a research statement merely because it looks duplicated. First establish semantic equivalence, choose the canonical claim, record `supersedes`/`derived_from`/provenance relations, and only then move duplicate prose to history or leave it solely in the provenance archive.

The source archive was created before cleanup specifically so classification can be aggressive without losing the original record.
