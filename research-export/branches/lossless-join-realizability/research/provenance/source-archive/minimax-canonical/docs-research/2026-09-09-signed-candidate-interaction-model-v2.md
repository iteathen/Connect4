# Signed all-candidate interaction model v2 — terminalization-aware

**Date:** 2026-09-09  
**Status:** current research interaction model; maintained source and `main` unchanged.

## Governing relation

For every ordered candidate pair `(A,B)`:

```text
I[A -> B]
```

records the effect of adopting A on B's usefulness, cost, applicability or viability.

The graph is directional and signed. It does not replace intrinsic candidate categories.

## Ordinal interaction scale

- `+4` transformative amplification
- `+3` strong material synergy
- `+2` clear positive synergy
- `+1` mild positive interaction
- `0` explicitly assessed neutral/additive
- `-1` mild saturation/exclusion pressure
- `-2` material displacement/interference
- `-3` likely substitution/exclusion
- `-4` incompatible contracts/forms
- `null` unassessed

The values are ordinal, not additive utilities.

## New graph correction: terminalization creates scoped negative edges

Future-terminal detectors are not ordinary search-structure candidates.

A terminal detector can prove the eventual result of an unresolved state without traversing the intervening game. When it fires, every search optimization below that state loses its opportunity to act because the subtree is gone.

This creates legitimate negative graph edges such as:

```text
ZPAR -> move ordering
ZPAR -> TT retention
ZPAR -> residual automorphism search
ZPAR -> proof-cost ordering
ZPAR -> YBWC
```

but these edges generally mean:

> `subtree-erasure-saturation in certificate-hit states`

not:

> `the two candidates are incompatible globally`.

Therefore every interaction edge now carries **scope** as a first-class field.

## Required edge fields

Each assessed edge records:

```text
source
target
projected_value
projected_confidence
observed_value
observed_confidence
scope
regime
relation_kind
mechanism
evidence_basis
```

### Scope examples

- `global` — expected across the candidate's whole operating regime;
- `certificate-hit-states` — only states where a future-terminal certificate succeeds;
- `tight-TT`;
- `roomy-TT`;
- `decision-states`;
- `tactical-states`;
- `strategic-midlate`;
- `parallel-overlap-heavy`.

A candidate can therefore have several edges to the same target under different scopes.

## New terminalization relation kinds

Positive:

- `terminalization-enabling`
- `semantic-horizon-extension`
- `certificate-supply`
- `certificate-hit-rate`

Existing positive tags remain valid:

- `cost-sharing`
- `state-simplification`
- `applicability-increase`
- `proof-order`
- `cache-retention`
- `shared-metadata`
- `validity-enabling`
- `parallel-duplication-reduction`

Negative:

- `subtree-erasure-saturation`
- `bound-subsumption`
- `search-structure-saturation`

Existing negative tags remain valid:

- `saturation`
- `overlap`
- `subsumption`
- `substitution`
- `resource-interference`
- `cache-interference`
- `state-identity-conflict`
- `support-semantics-conflict`
- `proof-authority-conflict`
- `hot-path-cost-conflict`
- `architectural-lock-in`

## Terminalization nodes

The graph now explicitly distinguishes these roles.

### `IWIN`

Exact immediate-terminal detector. One-ply semantic reach.

### `DTH`

Exact bounded-forced-terminal detector: opponent double threat proves inevitable loss before playing the final move.

### `EXH`

One-sided exhaustion is a partial future-terminal certificate; both-side exhaustion is an exact strategic draw terminalization.

### `A10`

Compatible Allis rule-cover proof. Strategic/unbounded future certificate when the full controller/compatibility proposition is satisfied. Individual Allis rules A1-A9 are primarily certificate components unless one instance alone proves the whole required proposition.

### `ZPAR`

**Exact parity/Zugzwang future-terminal detector.** New explicit candidate node, distinct from `E2` heuristic parity metadata.

Intended role:

- use exact remaining move/event parity and Zugzwang ownership;
- infer eventual terminal outcome/class without searching all intervening moves;
- strategic/unbounded semantic reach;
- exact authority only after formalization and differential qualification.

Current evidence status: projected candidate, low/medium confidence. It is a high-priority survival target because the upside per successful hit may be very large.

## Important distinction: `E2` vs `ZPAR`

`E2` is residual parity/future-threat metadata used as ordering, proof-cost or rule-generation information.

`ZPAR` is an exact future-terminal certificate.

They can interact positively:

```text
E2 -> ZPAR
```

if the same maintained parity/event facts make the certificate cheap.

But where `ZPAR` fires, it can negatively saturate `E2`'s ordering role because no move ordering is needed below the terminalized state.

Those are two different directional edges in different scopes.

## Terminalization edge interpretation

### Enabling side

The strongest projected enabling relationships are:

```text
SUP-event -> ZPAR
RWS -> ZPAR
RID -> ZPAR
INC -> ZPAR
E2 -> ZPAR
```

Reason: exact support/event state, residual obligations, fixed requirement identities and incremental parity metadata are plausible ingredients of a cheap exact Zugzwang certificate.

The support-event confidence increase from exhaustive small-game equivalence materially raises confidence in `SUP-event -> ZPAR`, but does **not** prove ZPAR itself.

### Saturation side

Where `ZPAR` successfully terminalizes a state, it can reduce the marginal opportunity for:

```text
CARD / SEWB
FMAC
AUTO
IMPL
E1 evaluator ordering
P1 proof-cost ordering
RANK
CTT
STT
YBWC
MHINT
```

This is usually negative `subtree-erasure-saturation`, not incompatibility.

The global net edge remains unknown until the following are measured:

```text
certificate hit rate
check cost
avoided subtree size per hit
stage at which the check runs
interaction with already-cheap tactical/forced normalization
```

## Interaction with Allis rules

Parity/Zugzwang is especially important because Allis strategic rules are themselves about future ownership under Zugzwang.

Projected graph shape:

```text
SUP-event -> A1..A10          positive cost/validity enabling
E2 -> A1/A4/A5/A8/A9/A10     positive parity metadata
ZPAR -> A10                   potentially strong terminalization/validity enabling
A1..A9 -> A10                 certificate supply
A10 -> downstream search      negative saturation in rule-cover hit states
```

Do not assume `ZPAR` and `A10` are substitutes. ZPAR may become a controller/outcome certificate that makes some Allis cover propositions easier to close; broader rule covers may also prove positions where simple parity counting cannot.

## Terminalization changes experimental economics

For ordinary search optimizations, node reduction and NPS are often sufficient first-order evidence.

For future-terminal detectors, each graph node/edge should preserve:

```text
checks
hits
hit rate
cost per check
avoided nodes/proof obligations per hit
avoided wall time per hit
terminal proposition proved
semantic horizon skipped
false positive count
```

A low-frequency detector can still be strategically dominant if each hit erases a huge subtree.

## Compatibility remains separate

A `-2 subtree-erasure-saturation` edge does not imply incompatibility.

Example:

```text
ZPAR -> AUTO = -2
scope = certificate-hit-states
relation_kind = subtree-erasure-saturation
```

AUTO remains completely compatible and valuable on states ZPAR cannot settle.

Only explicit compatibility metadata can say the implementations cannot coexist.

## Current graph data

The first structured terminalization-aware edge slice is preserved in:

`docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization.json`

It is intentionally sparse. Absence means unassessed, never zero.

## Research priority consequence

Low-confidence survival testing should now prioritize not only candidates with high projected standalone effectiveness, but also candidates with:

- high projected **semantic reach**;
- high expected avoided work per successful certificate;
- strong incoming enabling edges from already-likely substrates;
- low/medium confidence in soundness, hit rate, or cost.

`ZPAR` is therefore promoted to the high-information test queue even before its eventual effectiveness is known.