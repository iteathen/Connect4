# Connect4 IsoGraph INCOMPLETE_SCOPE bridge 0.1

**Status:** qualified local semantic bridge candidate pending deterministic verifier  
**Scope:** frozen Connect4 IsoGraph candidate `82366fbf406dcab11f7926ee5a9487e538003cd3` only  
**Frozen source:** `aea692af800f524569ea1c2fda722087cd9bca39`  
**IsoGraph Core authority:** Draft 0.17 blob `fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04`  
**QU provenance:** QU 0.1 candidate blob `745173425a647609db99ddb11530c28cc279ada8`

## Purpose

The Connect4 corpus uses a very small subset of the QU 0.1 vocabulary to preserve source-native unresolved information. Global QU 0.1 remains an unqualified candidate. This bridge supplies a self-contained, qualified interpretation for the exact subset used by the frozen Connect4 corpus so Connect4 authority does not depend on unqualified QU semantics.

## Bridged meaning

For this frozen Connect4 corpus only, a record carrying the native role `^95014` means:

> The pinned source authority identifies this subject as unresolved/open research, but does not provide enough possibility-universe, constraint, and closure authority to establish an exact complete family of admissible resolutions for that subject.

This is a **qualification/scope statement**, not a realized uncertainty calculus.

It means all of the following:

- the source has intentionally not established the subject as a settled theorem/result;
- the source does not license a complete `R(Q)` realization-family claim;
- absence of a proof is not converted into falsehood;
- absence of a disproof is not converted into truth;
- the unresolved subject remains represented and addressable;
- the incompleteness is source-native, not a rendering omission.

It does **not** mean or imply:

- QU `OPEN`, `DETERMINATE`, or `INCONSISTENT`;
- `NECESSARY`, `POSSIBLE`, `UNRESOLVED`, or `IMPOSSIBLE` over a realization family;
- a probability distribution or entropy measure;
- existence of two concrete admissible resolutions;
- resource-limited computation;
- object-theory truth or falsity;
- any NEI identity conclusion;
- any semantic authority for QU refinement, QUI, information measures, or other QU 0.1 constructions.

## Native record contract

A bridged record must satisfy all of these in the frozen native corpus:

1. it is a QU-state occurrence (`^95001`);
2. it carries `^95014` and no stronger QU semantic-state/result role;
3. it carries `^97068` source-native uncertainty;
4. it carries `^97081` source-native qualification limitation;
5. it does not carry `^97069` rendering uncertainty or `^97082` rendering-created limitation;
6. it has exact source/claim provenance through the native corpus;
7. claim-level records point only to canonical claims whose source status is one of `hypothesis`, `candidate_rule`, `open_question`, `missing_law`, or `untriaged`;
8. document-level records point only to frozen hypothesis/open-question research documents.

If any record violates this contract, this bridge does not qualify that record.

## Why this is an exact bridge rather than QU promotion

The bridge does not assert QU's realization-family semantics. It uses ordinary IsoGraph Core structure to preserve one negative qualification fact: **the source authority is insufficient to close the unresolved subject into an exact realization family**.

The QU labels are retained as pinned vocabulary/provenance so the representation can later interoperate with a qualified QU revision. Their broader candidate semantics are not imported.

Therefore:

```text
Connect4 INCOMPLETE_SCOPE bridge
    != qualification of QU 0.1
    != qualification of OPEN/realization-family semantics
    != qualification of QUI/refinement/information measures
```

## Evidence

Deterministic audit of the frozen candidate:

- 27 QU-state records;
- 27/27 `INCOMPLETE_SCOPE`;
- 27/27 source-native uncertainty;
- 27/27 source-native qualification limitation;
- 8 claim-level unresolved links;
- 19 document-level unresolved states;
- 0 `OPEN`;
- 0 `DETERMINATE`;
- 0 `INCONSISTENT`;
- 0 `NECESSARY/POSSIBLE/UNRESOLVED/IMPOSSIBLE` result roles;
- 0 rendering-uncertainty records;
- 0 rendering-created qualification limitations.

Independent frozen cold reconstruction run `35366098631` additionally concluded:

- `incomplete_scope_usage_sound = true`;
- `claims_complete_realization_universe = false`;
- no material omission, strengthening, or weakening was found.

The cold decoder's separate C4-R0044 source-count transcription error is unrelated to this bridge and was independently adjudicated as a decoder-output error; the native C4-R0044 record is exact.

## Qualification boundary

This bridge is valid only for the exact frozen Connect4 candidate and exact 27 records verified by the companion deterministic verifier.

A later corpus revision must requalify or explicitly inherit this bridge through exact unchanged records.

No global IsoGraph or QU authority is changed by this bridge.
