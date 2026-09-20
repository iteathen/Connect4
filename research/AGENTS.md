# Connect4 research knowledge-base agent contract

This file specializes the account-global `iteathen/.github/AGENTS.md` and repository `AGENT_LOCAL.md` for all work under `research/`.

The purpose of this tree is not to accumulate notes. The branch `research/semantic-quotient` is the **single canonical research ownership surface and normalized knowledge graph** for Connect4. Active solver consumers are IsoMax/Isometric, CUDA-BSFP, and SUT. Minimax/Negamax/alpha-beta and Hybrid Confluence are historical solver lineages. No solver branch or long-lived side branch owns a separate research corpus. Historical branches and temporary experiments may generate evidence, but all durable research meaning and research artifacts are integrated here.

Research direction: Josh Oshiro.

## Mandatory read order

Before changing research meaning, begin with the current qualified IsoGraph authority rather than reconstructing authority from legacy branch/file topology:

1. `isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md` — sole current game-theory / logic authority root.
2. `isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json` — immutable promoted semantic package/evidence identities.
3. `isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.md`, `.json`, `.isg`, and the 1.2 claim-coverage artifact — frozen promoted semantic package.
4. `isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_2.md` and current q_o/q_r / NEI qualification evidence when identity is load-bearing.
5. `isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md` for the separately qualified IsoMax hot-loop performance graph; it has no gameplay-authority effect.
6. `isograph/optimization/ISOMAX_HOT_LOOP_NEES_REALIZATION_AUTHORITY_0_1.md` when implementing or reasoning about hot-loop realization; it binds the performance graph to pinned NEES without changing gameplay semantics.
7. legacy `canonical/`, `maps/`, `hypotheses/`, `open-questions/`, `confidence/`, and `evidence/` views only for readability, compatibility, or provenance checks.
8. authorities 1.1 and 1.0 only as immutable historical qualified evidence, and `provenance/` when exact historical reconstruction is required.

A direct edit to a legacy bridge view does not change authoritative logic. New durable game-theory logic must be represented and qualified in a successor IsoGraph authority revision. A performance-realization binding such as NEES remains separate non-gameplay authority.

## Core invariants

Maintain these invariants on every research mutation:

- **One claim, one stable identity.** Semantically identical statements do not get parallel IDs because wording, branch, solver, or source differs.
- **Global ID uniqueness.** `C4-R####` IDs are unique across every registry shard. Never renumber, recycle, or silently repurpose an existing ID.
- **One authoritative logic graph.** IsoGraph authority is the current root. Legacy claim-registry shards are compatibility/readability views of the frozen pre-IsoGraph graph, not a second authority.
- **Status is claim-specific.** Solver adoption, benchmark speed, branch age, issue labels, repeated model agreement, or implementation success do not promote a research claim.
- **Guards are part of truth.** A guarded theorem without its guards is a different and usually false claim.
- **Scope is part of truth.** A bounded control, one board size, one tie convention, or one solver workload may not be silently widened.
- **Sources are evidence, not authority by filename.** Historical conclusions, handoffs, PR descriptions, issues, solved labels, database outputs, and old agent statements must be reclassified against the authoritative IsoGraph graph.
- **Negative knowledge is first-class.** Counterexamples, failed selectors, rejected implementations, deferred mechanisms, and scope limits must remain discoverable.
- **Shared truth is solver-neutral.** IsoMax/Isometric, CUDA-BSFP, SUT, historical Minimax controls, and other consumers may use the same claim differently without forking its epistemic status.

## Required epistemic separations

Do not collapse these distinctions:

```text
exact geometry != game semantics
static invariant != game value
same scalar/cardinality != same mathematical object
oracle/database agreement != proof
finite exhaustive control != unbounded theorem
exact terminal predicate != advisory move ordering/evaluation
mechanism != implementation form
mechanism != workload fit
mechanism != stage order
mechanism != synergy with neighboring mechanisms
mechanism != adoption status
source archive != current IsoGraph authority
```

When two artifacts appear to disagree, first determine whether they actually assert different semantics, scopes, guards, tie conventions, representations, or workloads.

## Observation-first discrepancy rule

A discrepancy is initially an observation, not a defect classification.

Before repair or semantic normalization, establish as applicable:

```text
same referent/anchor?
same predicate or count?
same scope/guard?
same representation layer?
same aggregation level?
same authority/revision?
same closure/completeness assumptions?
```

Every material discrepancy gets two independent dispositions:

```text
qualification_disposition
discovery_disposition
```

Examples:

```text
qualification: decoder count wrong
discovery: OPEN_STRUCTURAL_LEAD
```

or:

```text
qualification: decoder prose slip
discovery: NO_STRUCTURAL_LEAD
```

Closing qualification never silently closes discovery. Conversely, an interesting anomaly never excuses an actual qualification defect and never becomes a theorem merely by being interesting.

For the authority-1.1 cold anomalies, use:
`isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`.

## Historical solver-lineage rule

The retired Minimax/Negamax/alpha-beta and Hybrid Confluence branches are historical only. Their durable knowledge lives under `history/historical-only/solver-lineages/`.

Do not recreate or treat those branch names as implementation owners. A useful historical mechanism must be reassessed against current canonical research and implemented, if appropriate, in IsoMax, CUDA-BSFP, or SUT according to current ownership.

## Gameplay strategy proposal routing

When qualified or candidate research suggests a gameplay description, solver strategy, runtime representation, proof/cache design, or implementation path:

1. consult `GAMEPLAY_STRATEGY_INDEX.md`;
2. extend an existing `GSP-###` proposal when it owns the same strategy;
3. create a new proposal under `gameplay-strategy/` only for a genuinely distinct implementation/research path;
4. add the proposal to `GAMEPLAY_STRATEGY_INDEX.md` in the same change;
5. keep proposal status separate from semantic claim status and implementation adoption.

Do not strand durable gameplay/implementation ideas only in dated notes, issues, chat summaries, experiments, or solver branches.

## Classification and routing

Classify meaning before choosing a directory.

- `GAMEPLAY_STRATEGY_INDEX.md` / `gameplay-strategy/` — gameplay-facing strategy and implementation proposals derived from research; never semantic authority by themselves.
- `isograph/` — current qualified logic authority, native corpus, immutable manifests and qualification evidence.
- `canonical/` — legacy normalized-claim/shared-model bridge. Its stable IDs remain useful, but authoritative semantics/status/relations are resolved through IsoGraph.
- `maps/` — connective structure among claims, logical roles, and solver consumers. Maps do not independently promote claims.
- `hypotheses/` — coherent falsifiable ideas worth testing that are not established.
- `open-questions/` — unresolved seams and missing laws. Prefer refining an existing gap over creating a parallel gap taxonomy.
- `evidence/` — normalized evidence attached to stable claims, with exact scope and evidence identity.
- `experiments/` — experiment design/results before or alongside claim-level normalization.
- `confidence/` — confidence/update policy and records.
- `history/` — disproven, rejected, deferred, superseded, and historical-only knowledge with disposition preserved.
- `untriaged/` — explicit semantic-normalization queue, not a dumping ground.
- `provenance/` — lossless historical source archive. Preserve source bytes and lineage; do not rewrite provenance to make current theory look cleaner.

Use the status vocabulary already established by the research README and registries: `research_model`, `deductive_exact`, `guarded_exact`, `accepted_contract`, `empirically_supported`, `hypothesis`, `candidate_rule`, `open_question`, `missing_law`, `disproven`, `rejected`, `deferred`, `superseded`, `historical_only`, and `untriaged`.

## Claim normalization procedure

When a source packet, experiment, branch, issue, paper, implementation result, or new derivation contains research meaning:

1. **Extract atomic propositions.** Separate theorem, guard, counterexample, empirical result, implementation observation, conjecture, and open question instead of promoting an entire document as one claim.
2. **Search the complete authoritative graph.** Read the current IsoGraph authority claim/uncertainty graph. Use the legacy registry shards only as bridge indexes for existing `C4-R####` identities. Determine whether each proposition is identical to, refines, constrains, contradicts, supports, derives from, or is genuinely distinct from an existing claim.
3. **Reuse identity when semantics are the same.** Add source/evidence/relations/scope to the existing claim rather than minting a duplicate.
4. **Create a new ID only for a distinct truth condition or research object.** Allocate the next unused global `C4-R####` after checking the authoritative IsoGraph graph and legacy bridge IDs; publish it only through a newly qualified IsoGraph authority revision.
5. **Record the full proposition.** Include status/confidence mode, precise statement, scope and/or guards where material, source links, intended solver consumers if known, and graph relations.
6. **Preserve attribution.** Keep explicit source attribution such as Josh Oshiro’s research direction where the source carries it. Do not invent authorship or erase contributor provenance during normalization.
7. **Route unresolved residue.** If the normalized claim exposes a missing law or hypothesis, connect it to the existing open-question/hypothesis structure instead of leaving the gap only in prose.
8. **Dispose of source-queue state.** An untriaged item leaves the queue only after its unique claims, counterexamples, evidence, hypotheses, and open questions have stable canonical dispositions.

A historical packet may yield zero new claims if all of its semantic content is already represented. In that case, record the provenance/normalization disposition rather than manufacturing IDs for activity.

## Legacy registry bridge and index rules

`canonical/CLAIM_INDEX.json` is a hard **compatibility/integrity** boundary for the retained pre-IsoGraph claim bridge. It is not the current logic authority root.

- Every active registry shard must be listed there.
- Every specialized human ledger intended as part of canonical reading must be listed there.
- Never add a shard without adding it to the index in the same change.
- Never delete or rename a shard without updating the index and every dependent map/reference in the same change.
- Registry shards should remain coherent review units; do not create a new shard merely because one file is becoming mildly long.
- Claim IDs must remain globally unique across shards.
- Relation targets must resolve to an existing stable claim or an explicitly named non-claim conceptual target already used by the graph.
- Prefer an existing relation term when it expresses the semantics. If a genuinely new relation type is required, document its meaning rather than using a near-synonym casually.
- A human ledger and machine registry describing the same claim family must agree on ID, status, scope, and central statement.

## Research mutation is an IsoGraph authority transaction

A semantic change is not authoritative until it is represented in a successor IsoGraph authority revision and that revision is qualified/promoted. Legacy machine registries, human ledgers and maps are derived/readability bridges after the 2026-09-18 authority decision.

After the authoritative IsoGraph change is defined, synchronize all **affected** bridge views that are still maintained. Do not mechanically touch every file; do update every bridge file whose displayed meaning changed.

For each claim-level mutation, assess at least:

- the owning machine-readable registry shard;
- the corresponding human-readable claim ledger;
- `canonical/CLAIM_INDEX.json` if a shard/ledger was added, removed, or renamed;
- `canonical/CORE_MODEL.md` or `CROSS_LINEAGE_SYNTHESIS.md` if the shared conceptual model changed;
- `maps/CORE_LOGIC_MAP.md` when graph position/dependency changed;
- `maps/RESEARCH_TO_CORE_LOGIC.md` when logical consumption role changed;
- `maps/SOLVER_CONSUMPTION.md` when a solver begins, stops, or changes how it may consume the claim;
- `hypotheses/` and `open-questions/` when a candidate is promoted, falsified, narrowed, split, or a missing law is resolved/refined;
- `evidence/` / `experiments/` when empirical evidence is added or invalidated;
- `history/` when a claim/approach becomes disproven, rejected, deferred, superseded, or historical-only;
- `untriaged/SOURCE_QUEUE.md` when a source packet is normalized or a new untriaged source appears;
- `provenance/` and retirement records when source preservation/branch disposition changes.

Do not leave a new claim discoverable only from one shard, a new shard absent from the index, a resolved missing law still advertised as open, or a retired hypothesis still presented to solvers as current.

## Evidence and status discipline

Use the strongest honest status, not the most optimistic one.

- `deductive_exact` requires an actual derivation/proof under stated premises.
- `guarded_exact` requires explicit guards sufficient for exactness.
- `empirically_supported` must name the measured scope; finite or sampled agreement remains empirical.
- `accepted_contract` is an accepted consumption/engineering rule, not proof that every related research proposition is mathematically true.
- `hypothesis` and `candidate_rule` may guide experiments, ordering, or advisory evaluation only when that use cannot silently become correctness authority.
- `disproven` requires a decisive contradiction/counterexample to the scoped claim.
- `rejected` means an approach is not being pursued under current evidence/constraints; it does not imply every embedded proposition is false.
- `deferred` keeps viable work out of the active path without converting it into a negative result.
- `superseded` preserves lineage to the replacement; do not erase the older identity.

If new evidence changes status, update the claim, human ledger, evidence record, maps/consumers, and any hypothesis/open-question/history entry whose interpretation changes.

## Solver-consumption rule

Solvers consume claims; they do not own shared truth.

Any solver-facing use should preserve:

- stable research claim ID;
- exact implementation/contract location where practical;
- consumption mode: correctness-critical, terminalization, reduction, proof certificate, move constraint, ordering-only, evaluation-only, qualification-only, or performance-only;
- equivalence between implementation guards and research guards;
- qualification evidence appropriate to that implementation.

If code implements a weaker guard, stronger assertion, different target semantics, or approximate form, give the implementation its own qualification record rather than pretending it implements the canonical theorem unchanged.

## Source normalization and cleanup gates

The provenance archive exists so semantic cleanup can be aggressive without destroying history.

- Do not delete original source material merely because bytes were copied elsewhere.
- Do not retire a source branch merely because its files are archived.
- Retirement is safe only after unique semantic claims, counterexamples, evidence, open questions, attribution, and unresolved work have canonical or explicit historical dispositions and the retirement proof/manifest reflects that state.
- Do not remove an item from `untriaged/SOURCE_QUEUE.md` until this semantic gate is satisfied.
- When later work falsifies an earlier claim, preserve both the old claim/disposition and the evidence that changed it.

## Mutation boundaries

Research and solver implementation are separate ownership units. Research belongs on this branch; implementation belongs on the owning `solver/*` branch. Prefer a research-only commit when classifying or reorganizing knowledge. Do not leave durable research notes, hypotheses, experiment conclusions, falsifiers, or research evidence stranded on a solver branch merely because that solver produced them. Do not mutate solver code merely to make a research claim look adopted, and do not rewrite research status merely because code happened to implement a candidate.

When the task explicitly spans both research and implementation, preserve the separation in the diff and qualification: first establish the claim/contract and guards, then record the implementation’s exact consumption of it.

## Completion checklist

Before claiming a research-space task complete, verify:

- live branch/head was re-fetched and newer valid work preserved;
- relevant canonical claims and all registry shards were read;
- no duplicate semantic claim or ID was introduced;
- statuses, scopes, guards, sources, relations, and solver consumers are honest;
- affected human and machine ledgers agree;
- affected maps/indexes/open questions/hypotheses/history/evidence are synchronized;
- source queue and provenance/retirement state are correct;
- no hypothesis or empirical result was accidentally promoted to correctness authority;
- the final diff stays within the intended ownership boundary;
- the resulting branch state was re-read after mutation.

Report the commit SHA, claims added/changed, status changes, remaining gaps, and any intentionally untouched adjacent work in the handoff.