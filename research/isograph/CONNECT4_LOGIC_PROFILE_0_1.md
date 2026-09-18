# Connect4 Logic Corpus — IsoGraph authority-candidate profile 0.1

## Purpose

Render the entire current Connect4 logic corpus into IsoGraph without dropping unresolved or uncertain material. This migration is **not** an authority switch. The existing Connect4 corpus remains authoritative until the native rendering passes the qualification obligations below.

## Frozen source

- repository: `iteathen/Connect4`
- canonical research branch at freeze: `research/semantic-quotient`
- exact source revision: `aea692af800f524569ea1c2fda722087cd9bca39`
- normalized claims at freeze: 74
- explicit unresolved normalized claims at freeze: 8

IsoGraph dependencies:

- Core Draft 0.17: blob `fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04`
- QU 0.1 candidate: blob `745173425a647609db99ddb11530c28cc279ada8`
- QU native vocabulary: blob `714fc68b5a264c90749bc94a8efd2a9c2d17b22d`

QU remains a candidate extension. Connect4 authority promotion therefore requires either qualification of the QU usage needed by this corpus or an exact qualified bridge proving the same unresolved-information semantics.

## Complete corpus boundary

The current logic set is defined mechanically at the frozen source revision as:

- `AGENT_LOCAL.md`, `STATUS.md`, `next_step.yaml`;
- `docs/decisions/2026-09-17-single-research-owner.md`;
- every file under `docs/specs/**`;
- `research/AGENTS.md`, `research/README.md`;
- every file under `research/canonical/**`, `research/maps/**`, `research/hypotheses/**`, `research/open-questions/**`, and `research/confidence/**`.

Every non-HTTP source object referenced by every canonical claim is additionally included as an exact evidence/dependency object, even when it is historical provenance or code.

At the frozen revision this is 77 current-logic source objects plus 48 additional claim-source dependencies, for 125 unique exact source objects.

No file is ignored because it is awkward, historical, unresolved, contradictory, negative, or not yet normalized.

## Dual representation

The corpus has two simultaneous layers.

1. **Exact source layer.** Every included source object is bound to its exact Git blob/tree identity, path and byte length. This is the E0/source-fidelity anchor and permits exact recovery without copying 44+ MB of historical/evidence material into generated native text.
2. **Semantic layer.** Canonical claims are rendered as native claim nodes with exact status, statement, scope, guards, sources, relations, consumers, shard provenance and exact claim JSON. Explicitly unresolved claims receive native QU records. Further source-level semantic decomposition is added without changing the exact source binding.

The exact source layer prevents omission. The semantic layer prevents a content-addressed archive from being mistaken for a structural logic representation.

## Unknown and uncertainty rule

Unknown material is never silently discarded.

- A source statement that is itself unresolved is represented as source-native uncertainty.
- A migration/decomposition gap is represented separately as migration/rendering uncertainty and blocks authority promotion.
- QU `OPEN` may be used only when the source authority determines an admissible unresolved realization family.
- QU `INCOMPLETE_SCOPE` is used when the source or migration does not determine enough authority to state an exact realization family.
- `INCOMPLETE_SCOPE` caused by the **source itself** may survive the migration if reconstructed exactly.
- `INCOMPLETE_SCOPE` caused by the **rendering process** blocks authority promotion.

This distinction is load-bearing.

## Authority-promotion obligations

IsoGraph becomes Connect4 logic authority only after all of the following are independently verified:

1. **Complete source coverage:** every object in the frozen corpus boundary appears exactly once in the native source accounting universe.
2. **Complete normalized-claim coverage:** every canonical C4-R claim appears exactly once with all load-bearing fields preserved.
3. **No unaccounted logic:** every load-bearing statement in the 77 current-logic surfaces is mapped to native structure, an exact canonical claim, or an explicit source-native QU state. A file-level source reference alone is insufficient for this gate.
4. **Exact source round trip:** native source bindings reconstruct the exact frozen objects.
5. **Semantic differential:** reconstructed claims/guards/scopes/relations/statuses match the frozen source corpus with no strengthening, weakening, hidden promotion or dropped negative result.
6. **Uncertainty fidelity:** hypothesis/open-question/missing-law/candidate content reconstructs as uncertainty rather than false, absent or established.
7. **Cold reconstruction:** isolated agents given only the pinned IsoGraph semantics/profile and native corpus recover the same logical distinctions and explicitly identify the same unknowns/guards.
8. **Adversarial review:** near-equivalent claims with different guards, statuses, scopes or relation directions remain distinguishable.
9. **No rendering-gap uncertainty:** all migration-created `INCOMPLETE_SCOPE`/unmapped semantic regions are eliminated or resolved; source-native uncertainty is permitted.
10. **Authority-switch decision:** only after the preceding evidence is frozen does a separate owner-authorized decision mark the IsoGraph bundle authoritative and demote the old prose/JSON corpus to provenance/bridge status.

Until step 10, this directory is an authority candidate only.
