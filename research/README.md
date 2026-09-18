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

1. `isograph/CONNECT4_LOGIC_AUTHORITY_1_1.md` — current authority root.
2. `isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json` — immutable authority/evidence identities.
3. `isograph/successor/CONNECT4_LOGIC_PROFILE_1_1_CANDIDATE.md` and `isograph/successor/CONNECT4_LOGIC_NATIVE_VOCAB_1_1_CANDIDATE.md` — frozen promoted corpus profile/vocabulary.
4. `isograph/successor/generated/CONNECT4_LOGIC_CORPUS_1_1_CANDIDATE.isg`, `isograph/CONNECT4_LOGIC_CLAIMS_0_1.isg`, `isograph/successor/CONNECT4_LOGIC_UNCERTAINTY_1_1_CANDIDATE.isg`, and `isograph/successor/EVIDENCE_LINEAGE_GRAPH_1_1_CANDIDATE.isg` — corpus/claim/uncertainty/evidence structure.
5. `isograph/identity/CONNECT4_NEI_APPLICATION_0_1.md` plus its manifest/profiles/results when the research question concerns identity or safe quotient collapse.
6. relevant 1.1 native source/item shards when exact source reconstruction or occurrence topology is required.
7. legacy `canonical/`, `maps/`, `hypotheses/`, `open-questions/`, `confidence/`, and `evidence/` views only for readability, compatibility, or provenance checks.
8. authority 1.0 only as immutable historical qualification evidence, and `provenance/` when an audit or exact historical reconstruction requires it.

The exact pre-IsoGraph corpus is preserved inside the native source-image layer. Do not treat a newer legacy Markdown/JSON edit as authoritative; durable logic changes require a newly qualified IsoGraph authority revision.
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

## Claim-registry bridge rule

The legacy `CLAIM_INDEX.json` and its shards preserve the pre-IsoGraph normalized claim database and remain useful bridge views. They are no longer the logical authority root. Stable `C4-R####` identities remain preserved in current IsoGraph authority 1.1; authority 1.0 remains immutable historical evidence. Any authoritative change to a claim requires a successor qualified IsoGraph authority revision.

## Cleanup rule

Never delete or merge away a research statement merely because it looks duplicated. First establish semantic equivalence, choose the canonical claim, record `supersedes`/`derived_from`/provenance relations, and only then move duplicate prose to history or leave it solely in the provenance archive.

The source archive was created before cleanup specifically so classification can be aggressive without losing the original record.
