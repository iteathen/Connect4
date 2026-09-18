# Connect4 research knowledge base

Research lives here, and all durable Connect4 research belongs here.

The branch `research/semantic-quotient` is the single canonical research owner for Connect4 across Isometric, Negamax/Minimax, BSFP, Hybrid Confluence, SUT, benchmarks, oracle work, and future solver families. Solver branches own implementation; they do not own separate research truth, research notes, hypotheses, experiment results, counterexamples, or research evidence.

Research direction: Josh Oshiro.

## Read this first

The qualified logic authority is IsoGraph. Read in this order:

1. `isograph/CONNECT4_LOGIC_AUTHORITY_1_0.md` — current authority root.
2. `isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_0.json` — immutable authority/evidence identities.
3. `isograph/CONNECT4_LOGIC_PROFILE_0_1.md` and `isograph/CONNECT4_LOGIC_BUNDLE_0_1.isg` — corpus scope and native bundle.
4. `isograph/CONNECT4_LOGIC_CLAIMS_0_1.isg` and `isograph/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg` — normalized claims/status/guards/relations and unresolved structure.
5. relevant native source/item shards when exact source reconstruction or occurrence topology is required.
6. legacy `canonical/`, `maps/`, `hypotheses/`, `open-questions/`, `confidence/`, and `evidence/` views only for readability, compatibility, or provenance checks.
7. `provenance/` when an audit or exact historical reconstruction requires it.

The exact pre-IsoGraph corpus is preserved inside the native source-image layer. Do not treat a newer legacy Markdown/JSON edit as authoritative; durable logic changes require a newly qualified IsoGraph authority revision.

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

- `isograph/` — qualified current logic representation, authority manifests, native corpus, and qualification evidence.
- `canonical/` — legacy normalized model/claim-registry bridge retained for readability and reconstruction.
- `maps/` — relationships among claims and solver consumers.
- `hypotheses/` — live unproved ideas worth testing.
- `open-questions/` — missing laws and unresolved seams.
- `evidence/` — normalized evidence records keyed to stable claim IDs.
- `experiments/` — experiment design/result normalization.
- `confidence/` — confidence/Bayesian update model.
- `history/` — disproven, rejected, deferred/superseded, and historical-only knowledge.
- `untriaged/` — explicit queue of source material still awaiting semantic normalization.
- `provenance/` — lossless historical source archive. Evidence, not current authority.

## Ownership rule

The previous branch-first and solver-specific research ownership models are retired. All durable research material is integrated here: claims, derivations, hypotheses, experiment results, falsifiers, negative results, open questions, research evidence, maps, and provenance. Solver-family branches may keep implementation contracts, implementation status, qualification/reproduction artifacts, and code-local operational notes, but they are not research owners.

Temporary `experiment/*`, `work/*`, or other explicitly temporary branches may carry in-progress research while an experiment is active. Their research output must be integrated into this branch before the temporary ref is retired; a temporary branch never becomes a second research authority.

Code should reference stable claim IDs such as `C4-R0004` where practical. A solver-specific optimization can consume a claim without changing its epistemic status.

## Claim-registry bridge rule

The legacy `CLAIM_INDEX.json` and its shards preserve the pre-IsoGraph normalized claim database and remain useful bridge views. They are no longer the logical authority root. Stable `C4-R####` identities remain preserved in IsoGraph authority 1.0, and any authoritative change to a claim requires a successor qualified IsoGraph authority revision.

## Cleanup rule

Never delete or merge away a research statement merely because it looks duplicated. First establish semantic equivalence, choose the canonical claim, record `supersedes`/`derived_from`/provenance relations, and only then move duplicate prose to history or leave it solely in the provenance archive.

The source archive was created before cleanup specifically so classification can be aggressive without losing the original record.
