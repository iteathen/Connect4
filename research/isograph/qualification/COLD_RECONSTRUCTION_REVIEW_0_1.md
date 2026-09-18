# Connect4 IsoGraph cold reconstruction review 0.1

**Status:** frozen post-run review  
**Candidate:** `iteathen/Connect4@82366fbf406dcab11f7926ee5a9487e538003cd3`  
**Frozen source corpus:** `aea692af800f524569ea1c2fda722087cd9bca39`  
**Packet SHA-256:** `32664a052c815c5c5aa6b534d5576a83edeb711d472916d1ef3ca4ffa896b4b7`  
**Cold run:** IsoGraph Actions `35366098631`, job `105668829610`  
**Model:** `gemini-3.5-flash`  
**Frozen report SHA-256:** `e38b5e5d3c81c3fcf0d53352ebe81636e4cf4c40d87ea293cca4c93f5ee0626d`

## Isolation and execution

The exact frozen packet hash was independently reconstructed in the IsoGraph repository before the semantic call. The model received the pinned IsoGraph Core/QU authority mirrors, the Connect4 IsoGraph candidate/profile, and a deterministic view decoded from that native corpus. It did not receive the hidden scorer assertions.

The semantic call completed once with HTTP 200. There was no semantic retry. The earlier Connect4 run and first IsoGraph bridge run both stopped before a model call for infrastructure reasons and are not semantic observations.

## Cold reconstruction result

The frozen decoder returned `DOES_NOT_QUALIFY`, while reconstructing:

- source revision exactly;
- authority state `AUTHORITY_CANDIDATE`;
- 77 current-logic documents;
- 125 source objects;
- 74 canonical claims;
- 8,517 semantic items;
- `research/semantic-quotient` as the sole research owner;
- solver branches as implementation consumers rather than research owners;
- all 74 canonical claim identities and epistemic statuses;
- all 8 explicitly unresolved canonical claims;
- all 5 disproven/rejected canonical claims.

The decoder reported:

- **material omissions:** none;
- **material strengthenings:** none;
- **material weakenings:** none.

It also correctly recovered all requested adversarial distinctions:

1. multiple distinct opponent immediate completions force loss, while one unique completion forces a reply rather than final value;
2. race-free nested ownership inference is disproven, while NDC requires temporal precedence;
3. an exact/supported representation result survives rejection of a particular implementation form;
4. C4-R0073 is deductive while C4-R0074 is bounded empirical qualification;
5. source-native uncertainty may survive authority migration, while rendering-created uncertainty may not.

## One mechanical scorer discrepancy

The post-freeze scorer found exactly one discrepancy:

`C4-R0044.source_count`

- hidden frozen source assertion: **2**;
- decoder transcription: **1**.

This is **not** a corpus defect. Direct post-run adjudication against the frozen source and frozen native claim record established:

- frozen source has exactly 2 sources;
- frozen IsoGraph claim has exactly the same 2 sources;
- complete canonical JSON for C4-R0044 is identical between source and native rendering.

The discrepancy is therefore a cold-output transcription error. The frozen report and failing mechanical score are retained unchanged; the decoder is not rerun to obtain a cleaner answer.

Exact-field fidelity remains established by the independent deterministic 74/74 full-record differential.

## QU assessment

The cold reviewer independently concluded:

- current `INCOMPLETE_SCOPE` usage is semantically sound;
- the represented unresolved items do **not** claim a complete realization universe.

A deterministic native audit additionally found:

- 27 QU states total;
- 27/27 `INCOMPLETE_SCOPE`;
- 27/27 source-native uncertainty;
- 27/27 source-native qualification limitation;
- 8 claim-level QU links;
- 19 document-level QU states;
- 0 `OPEN`;
- 0 `DETERMINATE`;
- 0 `INCONSISTENT`;
- 0 QU `NECESSARY/POSSIBLE/UNRESOLVED/IMPOSSIBLE` claims;
- 0 rendering-uncertainty records;
- 0 rendering-created qualification limitations.

Thus the Connect4 corpus relies on only one narrow QU semantic distinction: **the source itself does not provide enough possibility-universe/constraint/closure authority to establish an exact realization family for this unresolved item**.

## Qualification interpretation

The cold run discharges the semantic reconstruction and adversarial-differential obligations for the frozen candidate. The single source-count transcription error does not weaken that conclusion because exact claim-field recovery is already independently and exhaustively verified deterministically.

The decoder's overall `DOES_NOT_QUALIFY` disposition identified two remaining blockers rather than a semantic defect in the rendering:

1. QU 0.1 is globally unqualified, so the narrow Connect4 uncertainty usage needs an exact qualified local bridge or a globally qualified QU dependency.
2. The owner-authorized authority-switch decision must occur only after the bridge/evidence is frozen.

No authority switch is performed by this review.
