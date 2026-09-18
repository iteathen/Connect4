# Decision: IsoGraph authority 1.1 supersedes Connect4 logic authority 1.0

**Date:** 2026-09-18  
**Status:** owner-authorized successor representation-authority decision  
**Effective target:** integration into `research/semantic-quotient`  
**Qualification:** `research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_1.md`

## Decision

Connect4 IsoGraph logic authority 1.1 supersedes authority 1.0 as the current representation authority once this promotion record is integrated into the canonical research owner.

The promoted semantic candidate is the exact file set pinned by:

- candidate manifest blob `0b3c54f193b084e2e5dd2eb7f4fb641b1052491a`;
- candidate freeze commit `f1afedf6900c3c5590a3e1210aa30210801f8d4e`;
- frozen source revision `aea692af800f524569ea1c2fda722087cd9bca39`.

Authority 1.0 is not edited in place. Its authority root, manifest, qualification evidence and promotion decision remain immutable historical evidence of the earlier declared boundary and of the material-omission condition that caused reopening.

## Why 1.1 supersedes 1.0

Authority 1.0 was exact inside its declared boundary, but the C4-R0044 source-count discrepancy triggered a deeper audit that exposed two missing representational distinctions:

1. citation occurrence, artifact identity, evidence event, evidence lineage and independence group were not modeled separately;
2. the 1.0 manually selected corpus boundary was not dependency-closed.

Authority 1.1 rebuilds the boundary from role plus dependency closure and makes evidence identity/independence first-class.

The qualified frozen boundary is:

```text
corpus objects                       432
dependency edges                     568
missing dependency targets             0
native source images                 234
content-addressed-only objects       198
semantic items                    29,650
canonical claims                      74
unresolved migration classifications   0
```

## Evidence identity

Authority 1.1 preserves the load-bearing distinction:

```text
citation occurrence
    != artifact identity
    != evidence event
    != evidence lineage
    != independence group
```

The frozen evidence graph contains 10 evidence lineages and 13 evidence events.

Controls include:

- C4-R0044: 2 claim citation occurrences, 2 distinct artifacts, 1 independently countable lineage;
- C4-R0045: 2 lineages with cross-lineage independence explicitly `UNKNOWN`;
- C4-R0037/R0038: shared correlated independence group;
- C4-R0074: 2 events with an explicit reproduction relation and 1 independently countable lineage;
- R0060/R0062/R0063 and R0070/R0071: empirical independence is not applicable to their represented deductive derivation lineages.

Artifact count, citation count, repetition count, workflow count and normalized/raw duplication do not become proxies for Bayesian independence.

## Uncertainty authority

Authority 1.1 uses:

`research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_1_1.md`

The qualified uncertainty set is:

```text
inherited source-native INCOMPLETE_SCOPE   27
added source-native INCOMPLETE_SCOPE        4
total                                       31
rendering-created uncertainty                0
```

The four added records preserve the unresolved state-identity-unification research packet. They do not promote open hypotheses/candidates into theorems and do not import broader QU realization-family semantics.

Missing laws and other unresolved source material remain authoritative **as unresolved structure**. Promotion does not require solving them.

## Cold qualification adjudication

The strict-cold provider response from workflow run `35372607670` is preserved unchanged.

The decoder independently concluded `semantic_candidate_qualifies = true`, but its mechanical output contained two discrepancy families:

- seven explicit claim-field count/presence extraction errors;
- an over-broad list for the specifically requested deductive-independence control.

It also used “13 evidence lineages” in prose where the deterministic manifest and evidence graph establish 10 lineages / 13 events.

Direct adjudication against the literal canonical JSON and evidence-lineage graph establishes that these are decoder-output errors, not semantic candidate defects. The failed mechanical score remains frozen; the model was not rerun to obtain a more favorable answer.

See:

`research/isograph/successor/qualification/COLD_RECONSTRUCTION_ADJUDICATION_1_1.json`

## Material-omission disposition

The cold report's alleged omissions were individually classified.

- the four new uncertainty records were a qualification obligation and are now qualified;
- R0045 unknown independence is correctly represented unknown evidence meaning;
- R0037/R0038 correlation and R0074 reproduction are represented evidence relations;
- factorization-space completeness was never established and is not silently claimed;
- global canonical factorization/canonical labeling is not an IsoGraph prerequisite.

No stronger claim is introduced merely to make promotion possible.

## Ownership

Representation authority does not transfer research ownership.

- `research/semantic-quotient` remains the single durable owner of Connect4 research;
- solver branches remain implementation owners;
- legacy Markdown/JSON/provenance remains available for reconstruction and human inspection but does not override the promoted IsoGraph authority for the frozen logic it supplied.

## Successor rule

A future authority revision must preserve 1.0 and 1.1 immutably, use a dependency-closed corpus boundary, preserve evidence-lineage and uncertainty distinctions, run applicable deterministic integrity checks, rerun semantic qualification when semantic content materially changes, and publish a new explicit promotion decision.
