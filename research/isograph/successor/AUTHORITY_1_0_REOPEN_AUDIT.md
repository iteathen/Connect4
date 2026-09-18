# Connect4 IsoGraph authority 1.0 — material-omission reopen audit

**Date:** 2026-09-18  
**Status:** successor-authority audit; authority 1.0 remains immutable historical qualification evidence  
**Current authority 1.0 merge:** `d8968ddf8637c99dc959b768f8384f66de2fbe6f`  
**Frozen 1.0 source:** `aea692af800f524569ea1c2fda722087cd9bca39`  
**Trigger:** cold-reconstruction discrepancy for `C4-R0044.source_count`

## Finding

The C4-R0044 cold decoder wrote `source_count = 1` while the exact claim record contains two entries in `sources[]`.

The original 1.0 review adjudicated this as a decoder transcription error because source bytes and native claim JSON are exact. That exactness finding remains true.

The discrepancy nevertheless exposed two deeper modeling defects.

### 1. Citation occurrence is not evidence-lineage identity

C4-R0044 cites two artifacts:

1. `research/evidence/bsfp/representation-algebra.json`;
2. `research/provenance/source-archive/bsfp/docs-research/2026-09-11-oqs-cuda-residual-reuse.md`.

They are distinct Git artifacts, but both describe the same underlying residual-reuse qualification lineage:

- native source: `5dfe1312a357c48eee53168e82fd6eba27814a06`;
- Q1 run: `20260911T050640911Z-b3554293`;
- evidence commit: `e99680503aae6e3d56e168437e4b1ffc5708b6c3`.

Therefore all three statements can simultaneously be true:

```text
citation occurrences = 2
distinct artifacts    = 2
independent evidence lineages = 1
```

The existing claim `sources[]` field does not distinguish those concepts.

This distinction is already required by the frozen Connect4 confidence/evidence policy:

- `research/confidence/README.md` requires an `independence_group` for each empirical evidence event;
- `research/confidence/SCHEMA.json` has a first-class `independence_group`;
- `research/evidence/README.md` requires normalized evidence to state whether it is independent of prior evidence.

At the frozen source revision, none of the five normalized JSON evidence records populated an `independence_group`.

The R0044 mismatch is therefore evidence of an unfinished evidence-lineage normalization layer, not evidence that one of the two artifact references is missing.

### 2. Authority 1.0's corpus boundary was not dependency-closed

Authority 1.0 declared 77 current-logic documents. Its boundary was hand-selected by directory/path rules.

However, included current routers explicitly point to load-bearing files outside that boundary.

Most decisively, root `README.md` and `STATUS.md` route durable research through `docs/research/RESEARCH_INDEX.md`. That index identifies the current active seam, active foundations, corrections, retained specialized lanes, and negative controls.

The index contains 58 local document links.

Against frozen authority 1.0:

```text
RESEARCH_INDEX local linked documents        58
classified current_logic by authority 1.0     0
present only as source/evidence dependency    1
absent from authority source universe         57
```

The one content-addressed-only document is:

- `docs/research/2026-09-14-total-domain-incidence-decomposition.md`.

The remaining 57 routed documents are absent from the 1.0 source universe.

Additional frozen current policy/routing surfaces omitted from the 77-document boundary include, at minimum:

- root `AGENTS.md` and `README.md`;
- `docs/decisions/2026-09-17-closed-durable-lane-topology.md`;
- `docs/decisions/2026-09-17-solver-namespace-normalization.md`;
- `docs/research/RESEARCH_INDEX.md`;
- `research/evidence/README.md`;
- `research/experiments/README.md`;
- research-history classification READMEs;
- `research/provenance/README.md` and `SOURCE_MANIFEST.json`;
- `research/untriaged/README.md` and `SOURCE_QUEUE.md`;
- the active `research/semantic-quotient/` routing surface and its state-identity-unification research packet.

The exact source-image fidelity of authority 1.0 is therefore valid **for its declared boundary**, but that boundary is under-complete relative to the owner requirement to render the entire current Connect4 logic corpus.

## Consequence

This meets the explicit reopen condition in `docs/decisions/2026-09-18-isograph-logic-authority.md`:

> evidence of a material omission/strengthening/weakening/reconstruction mismatch

Authority 1.0 must not be edited in place. It remains immutable historical qualification evidence.

A successor authority must be built and qualified.

## Successor requirements

### Corpus-boundary rule

The successor corpus boundary must be **dependency-closed and role-accounted**, not just directory-selected.

Every reachable repository object must receive an explicit role such as:

- current logic;
- current routing/policy;
- unresolved current research;
- normalized evidence;
- raw provenance/evidence;
- historical-only;
- implementation qualification;
- explicitly excluded non-logic implementation material.

Unknown classification is represented explicitly and blocks promotion only when it is migration-created rather than source-native.

### Evidence identity rule

The successor graph must distinguish:

```text
citation occurrence
artifact identity
evidence event
evidence lineage / independence group
reproduction event
claim-support relation
```

Artifact multiplicity must never be used as a proxy for independent evidence.

### Qualification

The successor must rerun:

1. exact source/object coverage over the expanded boundary;
2. dependency-closure audit;
3. semantic item accounting;
4. evidence-lineage/independence audit;
5. cold reconstruction with lineage questions included;
6. adversarial omission review against files excluded by 1.0;
7. explicit successor promotion decision.

## Current disposition

**AUTHORITY_1_0_REOPENED_FOR_SUCCESSOR_REBUILD**

This audit does not mutate authority 1.0's frozen files or erase its qualification evidence. It establishes that authority 1.0 is insufficient as the final representation of the **entire** Connect4 logic corpus.
