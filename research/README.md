# Connect4 research knowledge base

Research lives here.

This directory is the canonical knowledge home for Connect4 research across solver families. Isometric, Negamax/Minimax, BSFP, hybrid solvers, benchmarks, and future implementations consume this knowledge; they do not independently own the truth of shared claims.

Research direction: Josh Oshiro.

## Read this first

Agents should normally read in this order:

1. `canonical/CORE_MODEL.md` — the common conceptual model.
2. `canonical/CLAIMS.md` — the complete human-readable claim ledger.
3. `canonical/CLAIM_INDEX.json` — the authoritative machine-readable entrypoint. Read **every registry shard listed there**; no individual shard is complete by itself.
4. `canonical/CROSS_LINEAGE_SYNTHESIS.md` and `maps/CORE_LOGIC_MAP.md` — how the historical campaigns connect into one research program.
5. `maps/SOLVER_CONSUMPTION.md` — how solver families consume the shared research.
6. `open-questions/README.md` and `hypotheses/README.md` — what is not yet established.
7. `confidence/README.md` — evidence/confidence policy.
8. `evidence/` — normalized claim-level evidence records.
9. `provenance/` — exact historical source packets when an audit is needed.

Do not begin by reading provenance branch dumps unless auditing a claim. The canonical layer exists so an agent can absorb the related idea as a coherent whole rather than reconstruct it from branch history.

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

- `canonical/` — current normalized model and claim registry.
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

The previous branch-first research ownership model is retired. Shared research claims are normalized here first. Solver-family branches may keep implementation notes, but a semantic claim used across families must point back to a stable research claim ID.

Code should reference stable claim IDs such as `C4-R0004` where practical. A solver-specific optimization can consume a claim without changing its epistemic status.

## Claim-registry rule

`CLAIM_INDEX.json` is the registry root. Registry shards exist only to keep files bounded and reviewable. Claim identity is global across all shards, and agents must not treat `CLAIM_REGISTRY.json` or any extension shard as a complete database in isolation.

## Cleanup rule

Never delete or merge away a research statement merely because it looks duplicated. First establish semantic equivalence, choose the canonical claim, record `supersedes`/`derived_from`/provenance relations, and only then move duplicate prose to history or leave it solely in the provenance archive.

The source archive was created before cleanup specifically so classification can be aggressive without losing the original record.
