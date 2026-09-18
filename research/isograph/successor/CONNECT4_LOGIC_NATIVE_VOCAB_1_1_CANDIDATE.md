# Connect4 IsoGraph Logic Vocabulary 1.1 Candidate

**Status:** successor-authority candidate. Authority 1.0 remains immutable current/historical authority until 1.1 is independently qualified and promoted.

This vocabulary extends the qualified 1.0 representation with dependency-closed corpus roles and first-class evidence-lineage semantics.

## Corpus/object roles

| Label | Role |
|---|---|
| `^97400` | authority 1.1 candidate/profile record |
| `^97401` | dependency-closed corpus object |
| `^97402` | frozen path bytes |
| `^97403` | frozen Git object SHA bytes |
| `^97404` | frozen byte length |
| `^97405` | object primary role |
| `^97406` | current_logic |
| `^97407` | current_policy_or_routing |
| `^97408` | source_native_unresolved_logic |
| `^97409` | normalized_evidence |
| `^97410` | raw_evidence_or_provenance |
| `^97411` | historical_only |
| `^97412` | implementation_qualification |
| `^97413` | non_logic_implementation |
| `^97414` | classification_unresolved |
| `^97415` | exact native source image |
| `^97416` | exact UTF-8 source bytes |
| `^97417` | dependency edge |
| `^97418` | dependency target |
| `^97419` | dependency closure certificate |
| `^97420` | source semantic item |
| `^97421` | item owning object |
| `^97422` | item ordinal |
| `^97423` | item UTF-8 byte span |
| `^97424` | item lexical class |
| `^97425` | item claim link |
| `^97426` | item unresolved-state link |
| `^97427` | native-image inclusion set |
| `^97428` | content-addressed-only inclusion set |
| `^97429` | dependency-closed object count |
| `^97430` | native-image object count |
| `^97431` | semantic-item count |

## Evidence identity and independence

| Label | Role |
|---|---|
| `^97440` | citation occurrence |
| `^97441` | immutable evidence artifact |
| `^97442` | evidence event |
| `^97443` | evidence lineage |
| `^97444` | independence group |
| `^97445` | reproduction event |
| `^97446` | claim-evidence relation |
| `^97447` | artifact summarizes/derives-from relation |
| `^97448` | event kind bytes |
| `^97449` | evidence direction bytes |
| `^97450` | workload/condition bytes |
| `^97451` | provenance identity bytes |
| `^97452` | citation-count measurement |
| `^97453` | distinct-artifact-count measurement |
| `^97454` | independent-lineage-count measurement |
| `^97455` | correlated-evidence relation |
| `^97456` | independent-evidence relation |

## Invariants

```text
citation occurrence != artifact identity
artifact identity != evidence event
evidence event != evidence lineage
artifact count != independent evidence count
```

No Bayesian/confidence composition may infer independence from file count, citation count, repetition count, or geometry count alone.
