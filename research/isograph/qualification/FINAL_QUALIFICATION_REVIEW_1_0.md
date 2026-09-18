# Connect4 IsoGraph logic authority — final qualification review 1.0

**Result:** QUALIFIES FOR AUTHORITY PROMOTION  
**Date:** 2026-09-18  
**Frozen source corpus:** `iteathen/Connect4@aea692af800f524569ea1c2fda722087cd9bca39`  
**Frozen IsoGraph candidate:** `iteathen/Connect4@82366fbf406dcab11f7926ee5a9487e538003cd3`  
**IsoGraph Core:** Draft 0.17, blob `fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04`  
**Local uncertainty bridge:** `CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md`

## Qualification claim

The frozen IsoGraph candidate is a complete and accurate representation of the frozen current Connect4 logic corpus within its declared source boundary. Source-native unresolved material is represented rather than omitted.

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| Complete source coverage | PASS | 125/125 exact source/evidence objects |
| Current-logic native image | PASS | 77/77 documents embedded |
| Exact source round trip | PASS | 77/77 byte-identical; 0 mismatches |
| Canonical claim coverage | PASS | 74/74 unique claims |
| Full claim-field fidelity | PASS | exact canonical JSON 74/74 |
| Epistemic status fidelity | PASS | 74/74 |
| Semantic item accounting | PASS | 8,517/8,517 non-empty source occurrences; 0 missing/extra/span mismatch |
| Source-native uncertainty | PASS | 8 unresolved canonical claims + 19 unresolved documents |
| Rendering-gap uncertainty | PASS | 0 rendering uncertainty; 0 rendering-created limitations |
| Native syntax/scanner | PASS | 818,748 tokens; 0 failures in deterministic pass |
| Cold reconstruction | PASS for semantic obligation | one frozen isolated semantic call |
| Adversarial semantic differential | PASS | all five near-neighbor distinctions preserved |
| Material omission/strengthening/weakening | PASS | cold reviewer reported none |
| Narrow uncertainty semantics | PASS | verifier run 35367102877 / job 105672105515 |
| Authority switch | OWNER AUTHORIZED | separate decision after this review |

## Exactness and semantic accounting

The candidate binds every included source/evidence object to immutable Git identity and embeds every current-logic document natively. The deterministic claim differential established 74/74 exact full records with zero native mismatches.

An earlier renderer defect collapsed claim identity by parsing the `4` in `C4-R####`; the independent audit detected and corrected it before qualification. That failed intermediate state is retained as qualification provenance.

The six item shards account for every non-empty occurrence in all 77 current-logic documents:

```text
expected source occurrences  8,517
native semantic items        8,517
missing                      0
extra                        0
span mismatch                0
```

Each item is a native source-semantic occurrence bound to its owning document, exact UTF-8 span, section topology and source role, with canonical-claim and source-native-uncertainty links where applicable. Exact source-image content remains in the native representation, so undecomposed source/model leaves retain their source semantics rather than becoming rendering gaps.

## Cold semantic reconstruction

Packet SHA-256: `32664a052c815c5c5aa6b534d5576a83edeb711d472916d1ef3ca4ffa896b4b7`

- workflow run: `35366098631`
- job: `105668829610`
- model: `gemini-3.5-flash`
- HTTP: 200
- API attempts: 1
- frozen report SHA-256: `e38b5e5d3c81c3fcf0d53352ebe81636e4cf4c40d87ea293cca4c93f5ee0626d`

The report was frozen and not rerun for a more favorable answer.

The decoder returned `DOES_NOT_QUALIFY` because two promotion obligations were still open at run time: the narrow QU dependency had not yet been qualified, and the owner authority-switch decision had not yet been enacted. It did not identify a semantic rendering defect.

It reported:

```text
material omissions       []
material strengthenings  []
material weakenings      []
```

It independently reconstructed the ownership model, corpus counts, all 74 claim identities/statuses, all 8 unresolved canonical claims, all 5 disproven/rejected claims, and all requested adversarial distinctions.

### Cold-output transcription discrepancy

The mechanical scorer found one decoder transcription error: `C4-R0044.source_count` was written as 1 instead of 2.

Direct adjudication proved that the frozen source and frozen IsoGraph claim both contain the same two sources and that complete C4-R0044 canonical JSON is identical. This is a decoder-output error, not a corpus defect. The frozen report and failed mechanical score are retained unchanged; the decoder was not rerun.

## Uncertainty qualification

The corpus uses only the semantics qualified by `CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md`.

Deterministic bridge verifier run `35367102877`, job `105672105515`, passed:

```text
QU states                         27
INCOMPLETE_SCOPE                  27
source-native uncertainty         27
source-native limitations         27
claim-level records                8
document-level records            19
rendering uncertainty              0
rendering limitations              0
broader QU roles                  []
result                            QUALIFIED_LOCAL_BRIDGE
```

The cold reviewer independently found `incomplete_scope_usage_sound = true` and `claims_complete_realization_universe = false`. Connect4 therefore does not depend on global qualification of QU 0.1.

## Final disposition

Gates 1–9 of `CONNECT4_LOGIC_PROFILE_0_1.md` are discharged for the frozen candidate. The representation is complete because every current logic object, byte, canonical claim, and non-empty source occurrence is represented, and source-native uncertainty is explicit. It is accurate because exact source/claim differentials are zero-mismatch and isolated semantic reconstruction preserved the tested load-bearing distinctions.

Authority promotion may proceed under the owner-authorized decision. The old prose/JSON corpus remains provenance and reconstruction/bridge material and is not deleted.
