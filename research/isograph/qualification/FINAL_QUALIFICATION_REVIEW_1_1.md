# Connect4 IsoGraph logic authority — final qualification review 1.1

**Result:** QUALIFIES FOR AUTHORITY PROMOTION  
**Date:** 2026-09-18  
**Frozen source corpus:** `iteathen/Connect4@aea692af800f524569ea1c2fda722087cd9bca39`  
**Frozen semantic candidate manifest:** blob `0b3c54f193b084e2e5dd2eb7f4fb641b1052491a`  
**IsoGraph Core:** Draft 0.17, blob `fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04`  
**Local uncertainty bridge:** `CONNECT4_INCOMPLETE_SCOPE_BRIDGE_1_1.md`

## Qualification claim

The frozen IsoGraph 1.1 candidate is a complete and accurate representation of the frozen current Connect4 logic corpus under the successor's role- and dependency-closed boundary. Source-native unresolved material remains represented as unresolved structure. Rendering-created uncertainty is zero.

Authority 1.0 remains immutable historical qualification evidence. This review does not patch or reinterpret authority 1.0.

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| Dependency-closed boundary | PASS | 432 objects, 568 dependency edges, 0 missing targets |
| Corpus role accounting | PASS | 432/432 classified; 0 unresolved migration classifications |
| Native source-image coverage | PASS | 234 native images |
| Content-addressed-only coverage | PASS | 198 objects |
| Exact source round trip | PASS | 0 source mismatches |
| Semantic-item accounting | PASS | 29,650/29,650; 0 span mismatches |
| Canonical claim preservation | PASS | 74 canonical records; pinned claim blob unchanged from qualified 1.0 |
| Evidence-lineage model | PASS | 10 lineages, 13 events, 26 artifact relations |
| R0044 negative control | PASS | 2 citation occurrences / 2 artifacts / 1 independently countable lineage |
| R0045 independence handling | PASS | 2 lineages; cross-lineage independence explicitly UNKNOWN |
| Correlation/reproduction controls | PASS | R0037/R0038 correlated group preserved; R0074 2-event reproduction preserved |
| Deductive independence control | PASS | R0060/R0062/R0063 and R0070/R0071 are explicitly not_applicable_deductive |
| Source-native uncertainty | PASS | 27 inherited + 4 added = 31 |
| Rendering-created uncertainty | PASS | 0 |
| INCOMPLETE_SCOPE bridge 1.1 | PASS | deterministic + cold obligations discharged |
| Cold semantic reconstruction | PASS for representation obligation | frozen report says `semantic_candidate_qualifies = true` |
| Cold mechanical transcription fidelity | FAIL, adjudicated | two scorer families are decoder-output errors; candidate unchanged |
| Material representation omission/strengthening/weakening | PASS after adjudication | alleged omissions are qualification obligations, represented unknown/correlation facts, or intentionally absent stronger claims |
| Fresh semantic freeze required | NO | no manifest-pinned semantic file changed |
| Fresh cold model run required | NO | semantic packet unchanged; frozen output retained |

## Deterministic qualification

Workflow run `35371183917`, job `105685262773`, completed successfully.

It verified:

```text
corpus objects                       432
native source images                 234
content-addressed-only               198
semantic items                    29,650
expected semantic items           29,650
source roundtrip mismatches            0
item-span mismatches                   0
evidence lineages                     10
evidence events                       13
evidence artifact relations           26
inherited INCOMPLETE_SCOPE            27
added INCOMPLETE_SCOPE                 4
total INCOMPLETE_SCOPE                31
rendering uncertainty added            0
R0044 citation/artifact/lineage      2/2/1
result                               PASS
```

Dependency closure independently converged at run `35369868624`, job `105681035330`, with 432 objects, 568 edges and zero missing targets.

Candidate-freeze run `35371341565` completed successfully and produced the immutable semantic candidate manifest blob `0b3c54f193b084e2e5dd2eb7f4fb641b1052491a`.

## Cold semantic reconstruction

Strict-cold OpenRouter run `35372607670` used:

```text
provider/model   OpenRouter / nvidia/nemotron-3-ultra-550b-a55b:free
HTTP             200
API attempts     1
packet SHA-256   197391d6c5df8455e749bf9001157d483780d5e874f699bc1b8dd099629ec300
packet bytes     2,241,310
report SHA-256   4ae5a67327cfec05f0ab8d94ed4e6f06f009d918321729a672dd8c689952bb7f
```

The provider response was successfully frozen before scoring. The decoder returned `PARTIAL` while independently setting `semantic_candidate_qualifies = true`. It reconstructed the dependency-closed corpus counts, all omission-control surfaces, uncertainty counts, and the load-bearing R0044/R0045/R0037-R0038/R0074 evidence distinctions.

The workflow is red only because the post-freeze mechanical scorer found two output-fidelity discrepancy families. The frozen report and score remain unchanged.

### Claim-inventory discrepancies

Direct four-way adjudication against the literal canonical JSON supplied in the cold packet and the native claim record found seven decoder extraction/count errors:

- R0010: inferred scope where the canonical record has no `scope` field;
- R0015: counted 1 relation instead of 2;
- R0016: counted 1 relation instead of 2;
- R0034: inferred scope where the canonical record has no `scope` field;
- R0045: counted 3 claim sources instead of 4;
- R0052: counted 5 relations instead of 6;
- R0054: inferred scope from a conditional statement although the canonical record has no explicit `scope` field.

The hidden assertion packet is correct for these fields. In particular, R0045 demonstrates why claim citation count must remain distinct from evidence lineage/artifact semantics: the claim has four explicit source entries even though those sources participate in two evidence lineages and share a normalized evidence artifact.

No semantic candidate change is justified.

### Deductive-independence discrepancy

The hidden control expected exactly the five claims explicitly requested by the cold prompt:

```text
R0060 R0062 R0063 R0070 R0071
```

The evidence graph contains exactly two `not_applicable_deductive` lineages covering exactly those five claims.

The decoder generalized the category to many other deductive/guarded records, duplicated R0057/R0058/R0059, and included R0016 despite its `empirically_supported` status. This is decoder overreach, not an under-specified candidate or overconstrained scorer.

### 10 lineages / 13 events discrepancy

The deterministic manifest, lineage graph and cold dry-run independently agree on:

```text
evidence lineages   10
evidence events     13
```

The cold report's prose statement that the candidate contains “13 evidence lineages” substituted the event count for the lineage count. Its structured R0044/R0045/R0074 controls otherwise preserve the event/lineage distinctions. This is frozen decoder prose slippage and is not copied into authority.

## INCOMPLETE_SCOPE bridge 1.1

The successor bridge candidate said the four added records required deterministic verification and cold semantic reconstruction. Both obligations are now discharged.

The deterministic verifier explicitly checks the exact four added subject objects, the source-native/limitation roles, zero rendering uncertainty and full frozen-source/role fidelity. The cold report independently reconstructs 27 inherited + 4 added records, names the four state-identity documents, reports zero rendering-created uncertainty, and preserves their narrow unresolved meaning.

The qualified bridge is `research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_1_1.md`.

Missing laws and other unresolved research do not block representation authority when represented exactly as unresolved. Authority promotion does not solve or strengthen C4-R0011, C4-R0043, C4-R0052, C4-R0069, or any other open source-native content.

## Cold “material omissions” classification

The cold report's list was audited item by item:

- four added `INCOMPLETE_SCOPE` records — qualification obligation, now discharged;
- R0045 independence UNKNOWN — correctly represented unresolved evidence fact;
- R0037/R0038 correlation — correctly represented evidence relation;
- R0074 reproduction — correctly represented evidence relation;
- no factorization-space completeness claim — intentionally absent stronger claim; IsoGraph Core forbids lifting local factorization claims without coverage;
- no global canonical factorization/canonical-labeling prerequisite — intentionally absent stronger claim; IsoGraph Core explicitly says no such global prerequisite exists.

None is an actual representation omission.

## Final disposition

Authority 1.1 satisfies the successor profile's promotion additions over 1.0:

1. dependency-closure completeness — PASS;
2. omitted-router/adversarial controls — PASS;
3. evidence-lineage identity/independence audit — PASS;
4. zero unresolved migration classifications — PASS;
5. cold reconstruction separating citations/artifacts/lineages — PASS;
6. negative control preventing two artifacts from becoming two independent evidence events — PASS.

The frozen semantic candidate is sound. The mechanical cold score remains a useful record of decoder-output fidelity errors and is not rewritten into success.

No manifest-pinned semantic file changed during adjudication, so a new candidate freeze is neither required nor permitted under the same candidate identity. A fresh cold call would only seek cleaner model output against an unchanged packet and is therefore not required.

**Final result: QUALIFIES FOR AUTHORITY 1.1 PROMOTION.**
