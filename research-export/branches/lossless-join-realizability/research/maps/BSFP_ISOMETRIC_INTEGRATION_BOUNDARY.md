# BSFP ↔ Isometric integration boundary

**Status:** integration map / compatibility target. Not a canonical theorem and not a production API specification.

**Research direction:** Josh Oshiro.

## Purpose

Keep CUDA-BSFP independently exact while ensuring that structural/proof results produced by Isometric can later enter BSFP without either solver adopting the other's internal state representation.

The integration target is:

```text
shared geometry + shared structural IDs + guarded certificates + exact transforms
```

not:

```text
one universal composite state key
```

and not:

```text
packed42 as universal semantics
```

The engine is variable-size. Every boundary below is parameterized by board geometry.

## 1. Geometry descriptor

Every exchanged object is scoped to an exact geometry descriptor:

```text
columns W
rows H
connect target K
geometry/version ID
```

Derived geometry tables may include:

```text
cell count N = W*H
winning-line IDs
cell -> incident-line map
horizontal-reflection permutation
other explicitly supported automorphisms
support encoding profile
residual vocabulary IDs
```

Representation width is selected from geometry/profile requirements.

Do not encode semantic authority in assumptions such as:

```text
N == 42
winning lines == 69
global WSL terms == 625
local residuals fit one u64
```

Those are profile-specific observations only.

## 2. Distinguish four identities

The integration must never silently equate:

```text
physical occurrence identity
structural retrieval signature
semantic/transition identity
proof/certificate identity
```

A coarse Isometric/WSL structural signature may locate reusable knowledge without proving that two BSFP states are transition-equivalent.

A proof certificate may transfer across multiple semantic states when its explicit guard holds.

BSFP internal frontier IDs remain implementation identities unless an exact equivalence criterion promotes them to semantic identity.

## 3. Preferred proof boundary

The preferred completed proof object entering BSFP is beneficiary-relative and positive:

```text
Certificate {
    geometryId
    beneficiaryPlayer
    claimKind
    prerequisiteRegion
    guardDescriptor
    transformDescriptor
    provenanceClass
    optional dependencyCone
    optional proofId
}
```

Initial claim kinds should remain small and semantically explicit, for example:

```text
Win
Safe          // opponent cannot force Win
NoWin         // beneficiary cannot force Win, if separately useful
TransitionFact
TerminalFact
```

Do not overload one claim kind with stronger semantics than its proof establishes.

## 4. Positive prerequisite region

Where possible, completed Win/Safe consequences should be exported as minimal positive certificate families relative to the beneficiary player's ownership.

The exact current Win/Loss BSFP boundary admits the dual form:

```text
W0 = minimal P0-owned winning certificates
W1 = minimal P1-owned winning certificates
```

because each maximal P0 Loss cap `c` at support `U` maps exactly to:

```text
U \ c
```

as a minimal P1-owned winner certificate.

This representation is geometry-generic set duality; packed storage is not part of the semantic contract.

Primitive Isometric blocker clauses, parity equations, timing obligations and resource constraints do **not** automatically become positive ownership conjunctions. They remain proof-side guards/constraints until closure establishes a completed positive region.

## 5. Typed guard boundary

Each certificate carries only the minimum semantic conditions required for its truth.

The guard language may include compact forms such as:

```text
literal/fixed-owner masks
support predicates
accessibility predicates
exact rank/cardinality class
affine same/opposite-owner relations
monotone blocker clauses
NAE/mixed-ownership constraints
relative timing/deadline constraints
response/resource capacity constraints
first-win/nonterminal conditions
realizability conditions
compositions of the above
```

Cheap mask guards should remain cheap.

Do not force rare nonlinear/realizability information into every state or every certificate.

Unknown guard satisfaction is:

```text
ambiguous / needs refinement
```

not false, draw, loss, or equivalent.

## 6. Provenance / authority

Every exchanged fact is tagged by authority class:

```text
static-rule-derived
static-algebra-derived
runtime-exact-certificate
runtime-exact-search
qualification-oracle-only
```

Only solver-authoritative classes may affect the current solve.

External/precomputed solved information may qualify/falsify but must not silently become a runtime premise.

Runtime exact search is admissible because its cost/proof is part of the current computation.

## 7. Structural signature versus transition authority

Isometric may use a coarse canonical WSL/structural signature for:

```text
candidate retrieval
transformation reuse
shared implication metadata
theorem indexing
shared structural calculations
```

BSFP must treat that signature as retrieval authority only unless a stronger equivalence has been proved.

Exact transition/value reuse requires the minimum proven transition identity for that operation.

Thus the intended path is:

```text
BSFP state
    -> structural signature
    -> candidate certificate(s)
    -> transform certificate/guards
    -> validate guard
    -> consume completed exact consequence
```

not:

```text
same WSL -> same BSFP state/value
```

## 8. Support-local residual boundary

For geometry with winning-line set `Lambda` and occupied support `S`, define:

```text
B(S) = unique { lambda \ S | lambda in Lambda, lambda \ S != empty }.
```

Then:

```text
|B(S)| <= |Lambda|.
```

This is the preferred fixed-support hot vocabulary for proof-side interaction because BSFP already knows `S`.

Use:

```text
global/canonical residual IDs
```

where cross-support structural persistence is useful, but allow:

```text
support-local dense residual IDs
```

for hot blocker coverage, implication, cofactor mapping and proof checks.

The local word count is geometry/support selected:

```text
ceil(|B(S)| / machineWordBits)
```

not hardcoded to one u64 or global WSL-625 width.

## 9. Exact rank/cardinality guard

At support rank `r` in ordinary alternating play:

```text
P0 stones = ceil(r/2)
P1 stones = floor(r/2)
```

This exact invariant is useful to BSFP as a semantic work-elimination boundary and may be useful to Isometric as a claim guard.

It should not automatically become part of Isometric's universal structural key.

In P0-oriented BSFP ownership coordinates:

```text
minimal upward generator g impossible if |g| > ceil(r/2)
maximal downward cap c impossible if |c| < ceil(r/2)
```

The current complete small-control qualification found zero W/D/L mismatches over the legal rank slices.

## 10. Symmetry/orientation boundary

Horizontal reflection is geometry-generic for rectangular Connect-K.

Exchange/store enough metadata to distinguish:

```text
canonical structural object
physical occurrence orientation
```

A transformed certificate is reusable only after transforming every claim-relevant guard.

For support schedules, canonical support + orientation is sufficient for exact lifting under reflection.

Do not duplicate mirrored semantic work merely because physical output/action coordinates differ.

Do not assume an asymmetric support has internal mirror symmetry; the quotient is generally between separate support occurrences.

## 11. Runtime certificate consumption

BSFP should eventually offer a narrow operation conceptually equivalent to:

```text
consumeCertificate(currentContext, certificate)
    -> accepted exact consequence
     | rejected guard
     | ambiguous needs refinement
```

Consumption should be monotone in authority:

```text
certificate may remove impossible work
certificate may seed/strengthen an exact frontier
certificate may establish one-sided Win/Safe information
certificate must not weaken exact BSFP semantics
```

If the guard does not hold, ordinary BSFP recurrence remains authoritative.

## 12. BSFP output useful to Isometric

BSFP can return more than root W/D/L without exporting its full operational state.

Useful future proof-mining output includes:

```text
minimal winner certificates
support-local residual prerequisite sets
exact terminal certificates
exact predecessor proof edges
which child/action discharged existential/universal obligations
constraint-relative infeasibility witnesses
symmetry/orientation mapping
runtime counterexamples to proposed Isometric equivalences
```

These should be emitted as optional research/proof records, not forced into the production hot path.

## 13. Shared equality rule

Hashes, compact IDs and canonical class IDs may accelerate lookup.

They are not semantic equality authority unless the mapping is collision-free by construction or an exact equality check resolves collisions.

This applies equally to:

```text
BSFP residual IDs
frontier grouping
Isometric structural signatures
certificate caches
support-local class IDs
```

## 14. Variable-size representation policy

Semantic code should consume abstract exact bitset/ID operations sized from geometry.

Backend profiles may specialize:

```text
<=32 cells      -> one u32
<=64 cells      -> one u64 / two u32
selected <=42   -> current packed42 profile
larger boards   -> multiword arrays / generated fixed-width layout
```

Likewise residual membership width is derived from the active vocabulary.

A backend limit must be reported as a profile limit, never silently promoted to a game/domain limit.

## 15. Integration readiness checklist

Before physical BSFP↔Isometric wiring, require:

```text
[ ] geometry/version identity shared
[ ] cell/line transform maps shared
[ ] structural-signature semantics documented
[ ] certificate claim kinds documented
[ ] typed guard semantics documented
[ ] provenance/authority classes documented
[ ] beneficiary-relative positive region encoding documented
[ ] variable-width bitset contract documented
[ ] support-local/global residual ID mapping documented
[ ] ambiguity/refinement outcome documented
[ ] exact equality authority documented
[ ] reflection/orientation lifting documented
[ ] first-win/terminal boundary documented
[ ] independent fallback BSFP path retained
```

## 16. Current qualified BSFP-side pieces

On the active research branch:

```text
rank-slice recurrence reduction:
    complete small-control differential qualification

horizontal-reflection support quotient:
    complete small-control frontier qualification

dual-positive W0/W1 representation:
    complete small-control frontier qualification

support-local residual basis:
    exact structural theorem + geometry census;
    transition/performance qualification still pending

constraint-relative implication:
    broad hypothesis qualified downward;
    cheap infeasibility is first target, general implication is not yet justified
```

These pieces are deliberately separable so Isometric can consume their semantics without inheriting an unqualified BSFP representation experiment.

## Working rule

```text
Share calculus and guarded proofs.
Do not force shared operational state.

Let Isometric remain broad where a theorem permits broad reuse.
Let BSFP remain exact where backward composition requires finer state.
Meet at explicit invariants, transforms, guards and certificates.
```
