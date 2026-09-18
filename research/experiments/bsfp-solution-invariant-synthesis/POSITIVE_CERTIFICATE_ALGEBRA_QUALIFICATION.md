# Solution-to-solution synthesis: positive-certificate algebra qualification

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **promoted within qualified scope**

## Qualified synthesis

The captured BSFP clause and ownership representations qualify a compositional relation stronger than a shared antichain shape:

> **Guarded Positive-Certificate Product Homomorphism.** Under a fixed positive-monotone exact-cardinality admissibility context, the minimal-admissible-completion map carries positive clause conjunction into the maintained ownership upward-antichain product.

For completion map `C_k`:

`C_k(A union B) = min_subset { x union y | x in C_k(A), y in C_k(B), |x union y| <= k }`

The certificate-side product is the actual maintained ownership operation: pairwise ownership-mask OR followed by `normalizeMinimalOwnershipAntichain`, with the exact-count guard retained.

This does not identify the original clause and ownership representations globally. It qualifies a guarded semantic morphism for the admissibility observation.

## Experimental authority

Qualifier:

`research/experiments/cuda-bsfp-clause-coverage/qualify-positive-certificate-algebra.mjs`

Qualified experimental head:

`a420af04443b09cd8a30acaf23d5377a19c09abe`

Workflow evidence:

- `bsfp-clause-coverage-experimental`
- run `35055915045`
- job `104665958624`
- result: green

Bounds:

- 9 captured real merge segments
- 4,176 raw pair occurrences
- 1,500,000 certificate-product hard cap
- 30-second wall leash
- no new solver descent

Observed wall time: **3,747 ms**.

## Exact cross-representation composition

Observed:

- input coverage records: **391**
- input coverage-to-clause inversion mismatches: **0**
- raw left/right record pairs: **4,176**
- exact merged coverage classes: **2,098**
- feasible merged completion identities: **464**
- direct merged-completion versus ownership-product mismatches: **0**
- representative reuse mismatches: **0**
- certificate union products evaluated: **45,198**

Thus the declared semantic observation genuinely commutes across representations on every captured pair.

## Exact pre-product rejection

Empty child completion certificates reject entire Cartesian rows/columns before the downstream pair operation.

Observed:

- raw pairs: **4,176**
- raw pairs eliminated because at least one input completion antichain is empty: **1,047**
- feasible certificate-class pairs remaining: **3,129**
- reduction: **25.07183908045977%**

This gives Isometric a concrete example of a semantic certificate doing more than proving equivalence: it can expose a stage boundary at which work is impossible before the normal product begins.

## Same-context input quotient result

The captured input frontiers had:

- feasible input completion classes: **332**
- feasible input coverage records collapsed by completion identity: **0**

Therefore no same-context feasible-input quotient saving is claimed for this sample. The new pre-product saving is emptiness-based pruning.

This is an important negative result for Isometric: the existence of a stronger semantic identity does not imply that every stage contains profitable collisions under that identity.

## Guard/context negative controls

Two controls demonstrate why certificate identity must remain typed and guarded.

### Exact-count guard

Removing the capacity cap produced:

- **2,368 uncapped capacity counterexamples**

The unguarded antichain product therefore does not preserve bounded admissibility. Exact cardinality is part of the operation identity, not optional validation metadata.

### Context scoping

Raw completion-antichain keys appeared in multiple distinct contexts:

- **23 cross-context completion-key collisions**

A completion key by itself is consequently not a globally valid Isometric semantic ID. Its context fingerprint must be part of the reuse contract.

## Independent anchor

Support `3,1,1,3,3`:

- raw pairs: 608
- exact merged coverage classes: 245
- exact-cardinality assignments: 462
- clause-vs-certificate exact-slice mismatches: **0**

The certificate algebra therefore preserves the actual exact-cardinality legal slice on the authority anchor.

## Isometric interpretation

This supplies a concrete compositional refinement of the framework's identity hierarchy.

### Structural discovery identity `S`

A structural/WSL signature may nominate candidates for shared work.

### Guarded semantic identity `Q`

For bounded admissibility, the certificate identity is:

`Q_adm = (context fingerprint, minimal completion antichain)`

The raw antichain without its context is insufficient.

### Compositional operation law

The newly qualified relation means `Q_adm` can be propagated through positive conjunction using the same upward-antichain algebra already present in the ownership representation, provided the capacity guard is part of the operation.

This is stronger than saying two representations encode the same proposition: the semantic map respects a concrete product operation.

## Connection to the Guarded Commuting Transporter Law

The previous transporter synthesis required:

1. exact operation-relative identity;
2. explicit transport/reconstruction where outputs remain occurrence-sensitive;
3. preservation of guards/context.

The positive-certificate result is compatible with that law, but has a different form. Here the semantic map itself is compositional:

`clause conjunction -> completion map -> ownership-antichain product`

No geometric transporter is needed for the certificate payload, but the guard/context remains mandatory. The 2,368 uncapped counterexamples and 23 context collisions are direct negative controls against weakening that requirement.

## Performance boundary

Do not interpret this as permission to replace packed clause coverage with ownership certificates wholesale.

The qualifier evaluated **45,198 certificate union products** while validating only 4,176 raw left/right record pairs. These are not identical cost units, so they do not establish a slowdown either, but they rule out an unsupported claim of automatic computational superiority.

The presently justified architecture is staged:

`cheap/bounded certificate`
`-> empty? prune row/column`
`-> otherwise use the representation best qualified for the remaining hot operation`
`-> optionally quotient outputs by guarded completion identity where collisions actually occur`

## Interaction with existing product reductions

Core/envelope absorption on the same 4,176-pair fixture independently reduces the residual Cartesian pair set to 330 pairs. Therefore the new 1,047-pair certificate pre-prune cannot simply be counted as additive performance gain.

The next required synthesis question is overlap/ordering:

- which empty-certificate pairs are already eliminated by core/envelope absorption;
- whether certificate emptiness can eliminate absorbed record emits or residual pair products that absorption still performs;
- whether exact-result quotienting changes the economically correct placement of the admissibility certificate.

This is the next bounded seam before recommending a production pipeline order.

## Architectural consequence

The result supports shared infrastructure for positive semantic certificates across representations:

- minimal ownership/completion antichains
- guarded pairwise union/OR composition
- subset-minimal normalization
- exact-count/capacity context
- empty-certificate impossibility
- context fingerprints
- observation-specific canonical IDs
- provenance/evidence scope

It does not support one universal solver representation or one unconditional identity key.

## Boundaries retained

- positive monotonicity is required;
- exact cardinality is part of the operation;
- context-scoped identity is mandatory;
- bounded completion is non-injective and is not a global blocker involution;
- no feasible input identity collapse was observed on these 391 input records;
- certificate-side runtime economics are not yet qualified;
- the 25.07% pre-prune may overlap with already-qualified core absorption;
- no broader transition/proof identity follows without its own observation and guard.

## Disposition

**PROMOTE the Guarded Positive-Certificate Product Homomorphism as an Isometric observation-specific compositional law.**

**PROMOTE empty completion certificates as exact pre-product impossibility certificates, while reserving placement until overlap with core/envelope absorption is measured.**

**RETAIN capacity and context as mandatory typed guards.**

**REJECT any inference that certificate composition should replace packed coverage composition wholesale without native cost evidence.**
