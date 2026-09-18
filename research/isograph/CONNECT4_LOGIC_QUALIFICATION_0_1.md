# Connect4 IsoGraph corpus qualification — deterministic pass 0.1

**Status:** authority candidate; deterministic source/claim fidelity passed; semantic authority promotion remains blocked.
**Frozen Connect4 source:** `aea692af800f524569ea1c2fda722087cd9bca39`
**IsoGraph Core:** Draft 0.17 blob `fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04`
**QU:** 0.1 candidate blob `745173425a647609db99ddb11530c28cc279ada8`

## Results

| Obligation | Result |
|---|---|
| Current logic source universe | 77 objects |
| Additional canonical claim dependencies | 48 objects |
| Exact source universe | 125 unique objects, 0 Git-object mismatches |
| Native current-logic source image | 77/77 files embedded |
| Source-image round trip | 77/77 byte-identical, 0 mismatches |
| Canonical claims | 74/74 unique claim SIs |
| Claim full-field preservation | 74/74 exact canonical JSON, 0 mismatches |
| Epistemic status preservation | 74/74, 0 mismatches |
| Generic top-level claim-property preservation | 74/74, 0 property-count mismatches |
| Explicit unresolved canonical claims | 8/8 QU-mapped |
| Hypothesis/open-question documents | 19/19 document-level source-native QU states |
| Rendering-created QU gaps | 0 explicitly introduced |
| Native surface syntax audit | 11 .isg files, 818,748 tokens, 0 scanner failures |

## Defect found and corrected

The first claim renderer incorrectly extracted the first digit sequence in `C4-R####`, which is the `4` in `C4`. That caused all 74 claim records to collide on one SI. The independent claim audit detected the collision before qualification.

The renderer was corrected to allocate claim SI from the terminal `R####` component. The repeated independent audit then reported:

```text
claims checked=74
exact-records=74
unique-status=74
mismatches=0
```

This failure is retained as evidence that the differential audit is capable of detecting a real identity-collapse defect rather than merely replaying renderer assumptions.

## What these passes prove

The current candidate is complete at the **frozen source-fidelity layer**:

- every current logic source object is represented;
- every current logic byte is recoverable from native IsoGraph exact literals;
- every canonical claim is represented exactly and uniquely;
- every top-level canonical claim field is preserved;
- canonical unresolved statuses are not collapsed into false/absent/established;
- hypothesis and open-question documents remain explicitly unresolved rather than being omitted;
- every claim evidence/provenance dependency is content-addressed exactly.

## What is not proved yet

These deterministic passes do **not** yet prove that the higher-level structural decomposition exposes every load-bearing logical distinction without relying on reconstruction of legacy prose.

Authority promotion remains blocked on:

1. **semantic item accounting:** every load-bearing statement/rule/guard in the 77 current-logic source files must be assigned to native structural content, a canonical claim, or a source-native uncertainty record;
2. **isolated cold reconstruction:** a decoder that receives the pinned IsoGraph authorities and native corpus, but not the legacy sources, must reconstruct the current logic without material omission or strengthening;
3. **adversarial differential review:** guard/scope/status/relation-direction near-neighbors must remain distinguishable;
4. **QU dependency qualification:** the narrow QU 0.1 usage must be qualified or bridged exactly for Connect4;
5. **authority-switch decision:** only after the above evidence is frozen may IsoGraph replace the current prose/JSON corpus as authority.

No authority switch has occurred.
