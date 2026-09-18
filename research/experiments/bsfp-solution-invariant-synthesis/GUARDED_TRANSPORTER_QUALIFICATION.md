# Solution-to-solution synthesis: guarded commuting transporter qualification

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **promoted within qualified scope**

## Research question

Do horizontal reflection quotienting, O3 residual semantic reuse, and Isometric candidate identity share a useful parent law, or is their common shape — many occurrences mapped to one representative — only analogy?

The candidate was accepted only if it survived actual commuting/guard checks, exposed concrete counterexamples to weaker identities, and yielded reusable infrastructure without collapsing distinct semantic authorities.

## Promoted law

> **Guarded Commuting Transporter Law.** Representative reuse is exact only when the declared operation-relative identity is authoritative, an explicit occurrence transporter exists, the relevant operation commutes under transport, and all load-bearing guard/context is preserved. If concrete output remains occurrence-sensitive, retain an occurrence sidecar and lift the representative result through it.

For representative operation `F_r`, concrete operation `F_o`, occurrence transporter `T_o`, and output lift `T'_o`:

`F_o ∘ T_o = T'_o ∘ F_r`

with guard/context equivariance as an explicit premise.

A canonical or structural key that does not establish this commuting square remains candidate discovery only.

## Exact mapping between solutions

### Reflection quotient

- **objects:** support-local geometries, dictionaries, proof coverage frontiers and support edges;
- **equivalence:** horizontal reflection automorphism;
- **information discarded at representative level:** duplicate reflected support computation;
- **information retained per occurrence:** concrete orientation/reflection sidecar;
- **operation commuting with transport:** dictionary/signature transport, subset relation, cofactor image/kill semantics, recurrence reconstruction;
- **exactness guard:** reflected geometry/dictionary bijection plus legal-count/capacity equivariance and matching cofactor kind/term relation;
- **eliminated work:** one computation per reflection orbit rather than one per concrete support/edge.

### O3 residual reuse

- **objects:** residual semantic pairs occurring under a specific transition context and selected input;
- **equivalence:** exact residual pair identity inside that context for that operation;
- **information discarded at representative computation:** repeated transform of the same residual pair/input class;
- **information retained per occurrence:** crossing `xMask` sidecar and occurrence mapping;
- **operation commuting with transport:** selected residual transform and reconstruction of the full concrete candidate;
- **exactness guard:** transition-local residual semantic identity + input ordinal/table context + occurrence extent/mapping validity;
- **eliminated work:** repeated residual transform evaluations across concrete occurrences.

### Isometric

- `S`: structural/canonical signature — candidate locator;
- `Q`: semantic/transition identity — required for transition reuse;
- `P`: proof certificate plus guard — required for proof/work reuse.

The synthesis therefore does **not** promote `S` to `Q` or `P`. It gives Isometric an explicit test for when a structural match can be upgraded for a particular operation: provide the stronger operation identity, transporter, and guard, then prove/qualify the commuting square.

## Bounded falsifier

Executable qualifier on `experiment/bsfp-clause-coverage`:

`research/experiments/cuda-bsfp-clause-coverage/qualify-guarded-transporter-synthesis.mjs`

Hard leashes:

- wall clock: 30 seconds;
- executable O3 transitions: 10;
- total captured O3 transitions including retained native 7x6: 11;
- logical candidates: at most 12,000;
- no new solver descent;
- no timeout extension.

Exact successful experimental head:

`a34ec5b684bd87f536f3adac27d66a0be71889c4`

Workflow qualification:

- `bsfp-clause-coverage-experimental`
- run `35054249965`
- job `104660954928`
- result: green.

## Provenance interruption and correction

The first qualifier version attempted to reconstruct the historical 7x6 O3 fixture and failed because this file was absent:

`docs/research/evidence/2026-09-11-oqs-residual-cofactor-reuse.json`

Repository history showed no commit for that path. It was never an authoritative committed artifact.

Disposition:

- no timeout increase;
- no synthetic replacement file;
- no new 7x6 solver descent;
- no claim that the semantic law failed.

The repaired falsifier executes the self-contained reflection and 4x4 O3 controls and parses the retained native 7x6 O3 result as prior captured qualification evidence. It records that the new synthesis run did **not** reconstruct 7x6.

This provenance boundary is part of the promoted law: a transporter/reuse framework must carry the authority context, not silently reconstruct it from unavailable evidence.

## Qualification results

### Reflection

The actual reflection commuting/equivariance authority returned:

- mismatches: **0**;
- supports checked: **1,913**;
- edges checked: **6,632**;
- subset/poset comparisons: **413,931**;
- capacity/guard cases: **84**;
- cofactor-term transport cases: **175,332**.

Standard 7x6 structural count retained by the qualifier:

- supports: 823,543;
- support orbits: 412,972;
- asymmetric support occurrences requiring orientation transport: **821,142**.

The last figure is deliberately evidence that representative identity alone is insufficient to reconstruct concrete orientation on non-fixed occurrences.

### Executable O3 4x4

Across all ten self-contained transitions:

- logical candidates: **1,409**;
- representative residual transform candidates: **326**;
- transform work eliminated: **1,083 / 76.8630%**;
- exact canonical-payload mismatches: **0**;
- transporter reconstruction mismatches: **0**;
- executable worker wall time: 129 ms.

### Deliberately weakened identity controls

The candidate was required to falsify three unsafe simplifications:

1. **Drop occurrence sidecar.**
   - 124 guarded representative/input classes mapped to multiple concrete crossing assignments.
   - Therefore representative transform identity does not imply concrete occurrence identity.

2. **Drop selected input/context.**
   - 63 residual classes produced distinct transform payloads under different inputs.
   - Therefore residual semantic identity alone is too coarse for the transition operation.

3. **Treat local dense residual ID as global semantic identity.**
   - 15 numeric IDs collided across transition contexts with different residual pairs.
   - Therefore `id` requires an explicit context or canonical global identity contract.

All three negative controls found counterexamples as required.

### Retained native O3 corroboration

The qualifier validates already-committed native result artifacts:

#### 4x4 c4

- transitions: 10;
- logical candidates: 1,409;
- residual candidates: 326;
- mismatches: 0;
- target coverage: 1;
- native passes per transition: 8.

Its control set includes `shared-pair-distinct-crossing-bits-31-32-40-41`, independently reinforcing the occurrence-sidecar requirement.

#### 7x6 c4

- transitions: 1;
- logical candidates: **8,192**;
- residual candidates: **128**;
- transform work eliminated: **8,064 / 98.4375%**;
- mismatches: 0;
- target coverage: 1;
- native passes: 8.

The 7x6 result remains retained native evidence only in this synthesis unit; its historical reconstruction dependency was unavailable and was not fabricated.

## Reassessment: what is actually common

The surviving common mechanism is not “canonicalization” in the abstract. It is:

`occurrence space`
`-> operation-relative exact equivalence class`
`-> representative computation`
`-> guarded transporter / sidecar lift`
`-> exact concrete output`

This mechanism parameterizes **preservation strength**.

Reflection has a strong geometric automorphism that also preserves the relevant transition and guard structure.

O3 has a narrower operation-specific semantic equivalence, so it must carry transition-local context and occurrence sidecars.

Isometric may expose structural `S` classes much earlier, but `S` only tells the system where to test for a stronger `Q`/`P` reuse relation.

That preservation-strength parameter is load-bearing, not documentation decoration.

## Shared infrastructure justified by the synthesis

The experiment supports a generic identity/transport contract with fields conceptually like:

- `contextId` — namespace in which representative identity is authoritative;
- `representativeId` — exact class representative;
- `occurrenceId` — concrete source occurrence;
- `preservationStrength` — structural / transition-semantic / proof-certificate level;
- `guardFingerprint` — exact assumptions under which the relation is valid;
- `transportInput` — occurrence sidecar or coordinate map;
- `transportOutput` — lift from representative result to concrete result;
- `provenance` — authority/evidence source.

A generic qualifier can then require:

1. same representative class implies identical representative-operation result;
2. transporter reconstructs every concrete authoritative result;
3. guard commutes/is invariant under transport;
4. deliberately weakened keys are tested as counterexamples where appropriate.

This is a reusable validation/cache/identity substrate. The domain-specific operations remain owned by their representations.

## Relationship to the Extensional Exact Result-Identity Quotient Law

The previous synthesis unit qualified the occurrence-insensitive specialization:

`many generated occurrences -> exact result class -> perform extensional work once -> erase multiplicity`

This transporter unit qualifies the occurrence-sensitive specialization:

`many occurrences -> exact operation class -> perform representative work once -> retain occurrence sidecar -> lift`

They share a stronger parent pattern:

**guarded representative-class computation**.

Two outcomes are now explicit:

- **idempotent/extensional output:** discard occurrence multiplicity;
- **occurrence-sensitive output:** preserve sidecar and transport representative result back.

The difference is determined by the target operation, not by the shape of the source representation.

## Relationship to cofactor image and other maps

Cofactor image, reflection transport, and occurrence remapping may all be represented by common finite-relation/transporter infrastructure **only when** each supplies its own operation law and exact guard. The present qualification therefore partially subsumes the earlier candidate “cofactor image ↔ reflection transport ↔ occurrence remapping” at the infrastructure level.

It does not prove their semantic equivalence and does not by itself provide a new fused kernel. A separate experiment on that candidate is unnecessary unless it predicts additional work elimination or a genuinely shared executable primitive beyond the transporter contract.

## Supersession / architecture relationship

Promote the following hierarchy:

`candidate structural class (S)`
`-> operation-relative exact identity / guard`
`-> representative computation`
`-> extensional erase OR occurrence-aware transporter lift`

This supersedes loose “same signature means reuse” language.

It also refines the Isometric relation:

`WSL/S equality tells Isometric where to look`
`guard + Q/P determine what transfers`
`transporter/provenance determine how representative work returns to concrete occurrences`

## Boundaries retained

- same dimension != natural isomorphism;
- structural equality != transition equality != proof equality;
- WSL equality alone is not reuse authority;
- fixture-local dense ID != global semantic ID;
- hash != equality authority;
- provenance/context may be part of exact identity;
- occurrence information may be discardable for one operation and load-bearing for another;
- this result does not force BSFP and Isometric to share internal state;
- no new CUDA-JS API follows from this qualification;
- retained native O3 results are not a new benchmark of the generic transporter layer.

## Disposition

**PROMOTE the Guarded Commuting Transporter Law and shared representative/class/guard/transporter/provenance infrastructure.**

**REJECT the stronger synthesis that reflection identity, O3 residual identity, and Isometric structural identity are the same equivalence relation.**

**KEEP Isometric structural signatures as discovery keys until a declared operation supplies the stronger exact identity, guard, and transporter required by the commuting law.**
