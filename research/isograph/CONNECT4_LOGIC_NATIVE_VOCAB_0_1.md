# Connect4 Logic Native Vocabulary 0.1

**Status:** authority-candidate vocabulary for the Connect4→IsoGraph migration; not yet authoritative.
**Connect4 source revision:** `aea692af800f524569ea1c2fda722087cd9bca39`
**IsoGraph Core dependency:** Draft 0.17 blob `fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04`
**QU dependency:** QU 0.1 candidate blob `745173425a647609db99ddb11530c28cc279ada8`; native vocabulary blob `714fc68b5a264c90749bc94a8efd2a9c2d17b22d`

This companion documents the stable-label roles used by the native `.isg` corpus. Numeric spelling has no meaning outside this profile/revision.

| Label | Role |
|---|---|
| ^97000 | Connect4 logic profile authority record |
| ^97001 | corpus bundle |
| ^97002 | pinned Connect4 source revision |
| ^97003 | pinned IsoGraph Core revision |
| ^97004 | pinned QU revision |
| ^97005 | source artifact |
| ^97006 | source-artifact role |
| ^97007 | current logic surface |
| ^97008 | evidence/dependency surface |
| ^97009 | provenance-only surface |
| ^97010 | source path as ordered UTF-8 byte literals |
| ^97011 | Git object SHA as ordered UTF-8 byte literals |
| ^97012 | source byte length |
| ^97013 | canonical claim |
| ^97014 | claim ID bytes |
| ^97015 | title bytes |
| ^97016 | statement bytes |
| ^97017 | scope bytes |
| ^97018 | guard bytes |
| ^97019 | epistemic status |
| ^97020 | research_model |
| ^97021 | deductive_exact |
| ^97022 | guarded_exact |
| ^97023 | accepted_contract |
| ^97024 | empirically_supported |
| ^97025 | hypothesis |
| ^97026 | candidate_rule |
| ^97027 | open_question |
| ^97028 | missing_law |
| ^97029 | disproven |
| ^97030 | rejected |
| ^97031 | deferred |
| ^97032 | superseded |
| ^97033 | historical_only |
| ^97034 | untriaged |
| ^97035 | claim source |
| ^97036 | claim relation |
| ^97037 | relation type bytes |
| ^97038 | relation target |
| ^97039 | consumer bytes |
| ^97040 | research-direction bytes |
| ^97041 | registry-shard bytes |
| ^97042 | exact source binding |
| ^97043 | semantic-image coverage |
| ^97044 | structurally normalized claim image |
| ^97045 | source-faithful exact binding only |
| ^97046 | QU/uncertainty mapping |
| ^97047 | profile requirement |
| ^97048 | authority state |
| ^97049 | authority candidate |
| ^97050 | qualified authority |
| ^97051 | qualification obligation |
| ^97052 | complete source coverage |
| ^97053 | complete normalized-claim coverage |
| ^97054 | no unaccounted load-bearing logic |
| ^97055 | exact round-trip/source reconstruction |
| ^97056 | isolated cold semantic reconstruction |
| ^97057 | differential equivalence |
| ^97058 | rendering-gap closure |
| ^97059 | authority promotion |
| ^97060 | provenance relation |
| ^97061 | source-object count |
| ^97062 | canonical-claim count |
| ^97063 | explicit unresolved-claim count |
| ^97064 | exact canonical claim JSON bytes |
| ^97065 | source object kind: blob |
| ^97066 | source object kind: tree |
| ^97067 | unresolved reason bytes |
| ^97068 | source-native uncertainty |
| ^97069 | migration/rendering uncertainty |
| ^97070 | source dependency object |
| ^97071 | exact target bytes for non-claim relation target |
| ^97072 | canonical registry root |
| ^97073 | corpus inclusion rule |
| ^97074 | current-logic source set |
| ^97075 | canonical-claim source dependency set |
| ^97076 | generic claim property record |
| ^97077 | property-name bytes |
| ^97078 | property-value canonical JSON bytes |
| ^97079 | relation target canonical-claim SI |
| ^97080 | source URL/external reference bytes |
| ^97081 | source-native QU qualification limitation |
| ^97082 | rendering-created QU qualification limitation |
| ^97083 | document-level uncertainty state |
| ^97084 | hypothesis-document role |
| ^97085 | open-question-document role |
| ^97086 | fixed source authority within document QU |
| ^97087 | open research region within document QU |
| ^97088 | source-native unresolved document |
| ^97089 | native source-document image |
| ^97090 | exact source content as ordered UTF-8 byte literals |
| ^97091 | exact source-image inclusion relation |
| ^97092 | exact source-content reconstruction obligation/witness |
| ^97093 | qualification result record |
| ^97094 | qualification status PASS |
| ^97095 | qualification status BLOCKED |
| ^97096 | qualification status NOT_YET_PROVED |
| ^97097 | qualification measurement/count |
| ^97098 | zero-mismatch result |
| ^97099 | deterministic verifier/audit |
| ^97100 | exact source round-trip result |
| ^97101 | canonical claim exactness result |
| ^97102 | uncertainty fidelity result |
| ^97103 | native syntax result |
| ^97104 | semantic item-accounting obligation |
| ^97105 | isolated cold-reconstruction obligation |
| ^97106 | adversarial semantic differential obligation |
| ^97107 | QU dependency/bridge qualification obligation |

Text-bearing fields are encoded as ordered incidences of exact UTF-8 byte literals. They are source-faithful payloads, not alpha-renamable labels.

The QU roles ^95000…^95035 retain exactly the semantics defined by the pinned QU 0.1 dependency. This profile does not redefine QU.
