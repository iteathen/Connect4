# Guarded commuting transporter synthesis

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **qualified on horizontal reflection and O3 residual-reuse controls**

## Purpose

This is the second bounded solution-to-solution invariant-synthesis unit. It tests whether three superficially similar mechanisms — horizontal reflection quotienting, O3 residual semantic reuse, and Isometric structural identity — share a useful exact parent law.

The target is not a single state representation or a monolithic kernel. The question is whether they can share a guarded representative/occurrence/transport contract without weakening their different authority levels.

## Candidate law

> **Guarded Commuting Transporter Law.** A computation on a representative may be reused for a concrete occurrence only when the declared reuse identity is exact for the operation being reused, an explicit transporter exists, the operation commutes under that transporter, and all load-bearing guard/context is preserved. If concrete output remains occurrence-sensitive, the occurrence sidecar must be retained and used during lift.

In schematic form, for occurrence transporter `T_o`, representative operation `F_r`, concrete operation `F_o`, and output lift `T'_o`:

`F_o ∘ T_o = T'_o ∘ F_r`

subject to explicit guard/context equivariance.

A structural signature alone does not establish this square.

## Preservation strengths kept distinct

### Horizontal reflection

- identity strength: geometric automorphism;
- representative: one support from each horizontal-reflection orbit;
- occurrence sidecar: reflected/original orientation;
- preserved structure: support geometry, dictionary bijection, subset order, coverage signatures, capacity metadata, cofactor kind/term image, kill behavior, legal-count semantics;
- authority: exact reflection qualification plus full reflected recurrence differential;
- lift: reflect the representative frontier/output back into concrete coordinates.

### O3 residual reuse

- identity strength: operation-specific semantic transform identity;
- representative: residual semantic pair ID inside a specific transition context;
- additional operation context: input ordinal/table entry and transition-local context;
- occurrence sidecar: crossing `xMask` information;
- preserved result: transformed residual pair payload;
- lift: restore concrete crossing bits and pair payload for every logical occurrence.

### Isometric

- structural `S`: candidate-discovery/canonical structural signature only;
- transition `Q`: stronger identity required to claim identical behavior;
- proof `P`: certificate plus explicit guard required to claim proof/work reuse;
- structural equality alone is therefore not reuse authority.

## Bounded falsifier

Qualifier:

`research/experiments/cuda-bsfp-clause-coverage/qualify-guarded-transporter-synthesis.mjs`

Hard leashes:

- wall clock: 30,000 ms;
- executable O3 transitions: 10;
- captured O3 transitions including retained native 7x6: 11;
- captured logical O3 candidates: at most 12,000;
- no new solver descent;
- no timeout extension.

The falsifier combines:

1. the existing variable-width reflection commuting/equivariance authority;
2. all ten self-contained 4x4 O3 transitions, recomputing exact residual IDs and concrete occurrence lifts;
3. retained native O3 qualification evidence for 4x4 and the real 7x6 cut-5 workload;
4. deliberately coarsened negative controls.

The positive O3 key under test is transition-local:

`(context, residual semantic pair identity, input ordinal)`

The concrete occurrence output additionally uses its occurrence sidecar.

The qualifier fails if two occurrences with the same guarded operation signature produce different canonical pair payloads, if the transporter fails to reconstruct the exact concrete candidate, or if the intentionally coarser keys do not expose a difference.

## First attempt and provenance correction

The first version tried to rebuild the captured 7x6 O3 fixture. It failed immediately because the historical helper expected:

`docs/research/evidence/2026-09-11-oqs-residual-cofactor-reuse.json`

Repository history contains no commit for that path; the file was never committed. The failure was therefore an evidence-dependency failure, not a semantic counterexample.

The leash was not extended and no replacement 7x6 descent was generated.

The repaired qualifier:

- executes reflection and all ten self-contained 4x4 O3 transitions directly;
- parses the already-retained native 4x4 and 7x6 O3 result artifacts as captured evidence;
- records `executable7x6Reconstruction: false` and the reason explicitly.

Repair commit:

`a34ec5b684bd87f536f3adac27d66a0be71889c4`

message:

`research: use retained O3 native evidence in transporter falsifier`

Successful workflow:

- workflow: `bsfp-clause-coverage-experimental`
- run: `35054249965`
- job: `104660954928`
- exact head: `a34ec5b684bd87f536f3adac27d66a0be71889c4`
- result: green

## Qualification result

### Reflection positive control

| Metric | Result |
| --- | ---: |
| Mismatches | **0** |
| Supports checked | **1,913** |
| Edges checked | **6,632** |
| Poset comparisons | **413,931** |
| Capacity/guard cases | **84** |
| Cofactor term cases | **175,332** |
| Standard 7x6 supports | 823,543 |
| Standard 7x6 support orbits | 412,972 |
| Asymmetric support occurrences requiring orientation transport | **821,142** |

The reflection result is stronger than key equality: the existing authority checks the actual dictionary/order/signature/cofactor/guard commuting relations.

### Executable O3 4x4 control

| Metric | Result |
| --- | ---: |
| Transitions | **10** |
| Logical candidates | **1,409** |
| Residual transform candidates | **326** |
| Transform work eliminated | **1,083 / 76.8630%** |
| Exact payload mismatches | **0** |
| Transporter mismatches | **0** |
| Wall time | 129 ms |

The result therefore reconstructs every executable concrete logical candidate from one residual computation per guarded residual/input class plus its occurrence sidecar.

### Negative controls

The coarsened identities all failed as intended:

| Coarsening | Observed counterexample classes |
| --- | ---: |
| Drop occurrence sidecar | **124** |
| Drop input ordinal/context | **63** |
| Treat transition-local residual IDs as global IDs | **15** |

Interpretation:

- 124 guarded representative/input classes map to multiple concrete crossing assignments; representative identity alone cannot recover concrete orientation/occurrence output.
- 63 residual identities produce different transform outputs for different input entries; residual pair identity alone is too coarse for the declared operation.
- 15 numeric residual IDs refer to different residual pairs across transition contexts; local dense IDs are not global semantic identity.

These are constructive falsifiers of weaker transporter contracts.

### Retained native O3 evidence

The qualifier also validates and records retained native O3 evidence rather than regenerating it.

#### 4x4 c4

- transitions checked: 10;
- logical candidates: 1,409;
- residual transform candidates: 326;
- transform elimination: 76.8630%;
- native passes per transition: 8;
- mismatches: 0;
- target coverage: 1.

Retained controls include the explicit `shared-pair-distinct-crossing-bits-31-32-40-41` case, confirming that same residual pair can require different concrete occurrence sidecars.

#### 7x6 c4

- transitions checked: 1;
- logical candidates: 8,192;
- residual transform candidates: 128;
- transform elimination: **98.4375%**;
- native passes: 8;
- mismatches: 0;
- target coverage: 1;
- executable reconstruction in this new synthesis run: **false**.

The retained 7x6 native result is corroborating qualification evidence only. No missing historical digest was fabricated and no new descent was substituted for it.

Across the retained 4x4 + 7x6 O3 evidence there are 9,601 logical candidates and 454 residual transform candidates, a 95.2713% aggregate reduction. This aggregate is descriptive across two different controls, not a single homogeneous benchmark.

## Deconstructed common invariant

Across reflection and O3, the useful stripped mechanism is:

`concrete occurrences`
`-> exact operation-relative equivalence classes`
`-> one representative computation per class`
`-> explicit occurrence transporter / sidecar`
`-> exact concrete reconstruction`

with a separate guard proving that the operation really commutes.

Objects acted upon differ:

- reflection acts on geometric supports/dictionaries/frontiers;
- O3 acts on residual semantic pairs under a selected transition input;
- future Isometric reuse may act on structural, transition, or proof identities depending on the claimed layer.

The shared law is therefore about **reuse authority and transport**, not about a shared semantic state.

## Promoted architecture target

The qualification justifies shared infrastructure shaped around fields such as:

- `contextId`;
- `representativeId`;
- `occurrenceId`;
- `preservationStrength`;
- `guardFingerprint`;
- `transportInput` / occurrence sidecar;
- `transportOutput`;
- provenance / exact-authority metadata.

A reusable validator can demand and test the commuting square before a quotient/reuse path is admitted.

This is compatible with Isometric's intended hierarchy:

`S = structural/canonical signature`
`Q = semantic/transition identity`
`P = proof certificate + explicit guard`

`S` can find candidate reuse classes. `Q` or `P` plus the relevant guard decides whether a particular operation may actually be reused.

## What this does not establish

- Reflection identity is not O3 semantic identity.
- Structural equality is not transition equality or proof equality.
- WSL/Isometric `S` alone is not reuse authority.
- A numeric dense ID is not portable/global semantic identity without its context.
- Occurrence sidecars may not be discarded when the lifted concrete result depends on them.
- The qualified parent law does not imply one state layout or one monolithic kernel.
- The synthesis qualifier is CPU semantic validation. The native numbers above are retained native O3 evidence, not a new native benchmark of the generic transporter machinery.
- No new CUDA-JS API is implied by this result.

## Relationship to earlier synthesis

The earlier Extensional Exact Result-Identity Quotient Law handles the special case where occurrence multiplicity is semantically discardable.

The Guarded Commuting Transporter Law handles the more general occurrence-sensitive case:

- if occurrence-specific information is irrelevant after exact equality, erase multiplicity;
- if occurrence-specific information affects concrete reconstruction, compute once per exact operation class but retain a sidecar and lift.

Thus exact-result collapse and O3-style reuse become two guarded specializations of representative-class computation rather than competing mechanisms.

## Disposition

**PROMOTE the Guarded Commuting Transporter Law within the qualified scope.**

Promote shared representative/class/transporter/guard/provenance validation infrastructure.

**DO NOT promote structural Isometric identity alone to transition or proof reuse authority, and do not collapse the different identity strengths into one semantic equivalence.**
