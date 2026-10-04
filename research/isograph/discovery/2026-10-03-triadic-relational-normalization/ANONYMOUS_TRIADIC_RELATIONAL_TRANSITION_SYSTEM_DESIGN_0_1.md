# Anonymous triadic relational transition system 0.1 — frozen design

**Date:** 2026-10-03  
**Branch:** `experiment/triadic-relational-normalization-20261003`  
**Status:** frozen before conformance execution  
**Research direction:** Joshua Oshiro  
**Scope:** internal UC4A / historical-CPC / CPCX normalization only; no three-body claim

## Purpose

Freeze the anonymous object that the current evidence is allowed to support before any external three-body/Faddeev comparison.

This document deliberately separates:

1. an exact **relational state kernel** shared by the historical three-channel work and current CPCX support transactions;
2. stronger **transport/rearrangement enrichments** observed only in some qualified cohorts;
3. still-unproved requirements that must remain falsifiable.

The object is not H/V/D and is not defined by physical channel names.

## 1. Anonymous carrier

Let

```
V = {0,1,2}
E = {{0,1},{0,2},{1,2}}
```

where the members of `V` are anonymous role sites and the members of `E` are the three pair-relation channels.

A concrete system conforms only through a declared mapping from its own structural roles to `V`. Physical coordinates, orientation names, carrier names, and certificate names are not part of the anonymous object.

## 2. Relative-state axiom K0

For a qualified state there exists an ambient abelian coordinate group `G` and role potentials

```
v0, v1, v2 in G
```

with pair differences

```
d01 = v1 - v0
d02 = v2 - v0
d12 = v2 - v1.
```

Therefore

```
d01 + d12 - d02 = 0.
```

The visible triangle has three pair channels and one exact circuit dependency, hence at most two independent relative degrees of freedom.

For non-scalar role values the subtraction is componentwise in the frozen ambient abelian coordinate group.

**Important:** circuit closure by itself is not evidence for the research hypothesis. It is an algebraic compatibility condition. Evidentiary weight comes from qualified transitions that act on the relation channels.

## 3. S3 quotient axiom K0-S

Any simultaneous permutation of the three role sites and induced permutation of the three pair channels denotes the same anonymous state/transition.

A claimed law must survive all six elements of `S3`.

## 4. Off-diagonal transaction axiom K1

A qualified single-role intervention changes exactly one role potential.

If role `i` changes while the other two do not, then exactly the two pair channels incident to `i` change and the opposite pair channel is invariant.

Anonymous signature:

```
changed roles = 1
changed incident pair relations = 2
changed opposite pair relation = 0
```

A stutter is:

```
changed roles = 0
changed pair relations = 0.
```

The conformance checker must test incidence identity, not merely the counts `1/2`.

## 5. Coupled transaction class K1+

A concrete cohort may contain exact multi-role events. They are recorded separately rather than used to weaken K1.

For the current historical pilot, the already-observed two-role rows changed all three pair relations. That finite observation is not promoted to a universal algebraic axiom, because equal two-role increments could leave one relation invariant in a general potential system.

## 6. Interaction-order witness K2

A concrete finite machine may supply a response law that cannot be decoded by independent/affine terms but closes when pairwise interaction terms are admitted.

K2 is qualified only when the frozen decoder reports:

```
degree 1 contradictions > 0
degree 2 contradictions = 0
```

or an independently specified equivalent interaction-order test.

K2 is evidence that the three-channel representation is not merely three independent scalar tracks.

## 7. Re-coordination event K3

A concrete carrier may be destroyed while the unresolved relational condition is represented on a replacement carrier.

A qualified re-coordination record must contain only predeclared structural facts such as:

- source carrier destroyed;
- replacement candidate count;
- nonempty inherited/overlap relation;
- progress under an already-frozen well-founded structural order.

Carrier identity itself is erased from the anonymous object.

## 8. Pair-channel transport word K4

Some concrete diagnostics expose an execution-ordered sequence of active pair-channel roles.

For CPCX the frozen semantic alphabet is:

```
KS, KR, SR
```

with `KSR` reserved for a genuinely three-way coupled event.

A pair-channel word is admitted only when each token is mechanically supported by current-state fields under the frozen 0.2 classification.

Consecutive repeats are collapsed.

A **re-entry witness** has the form

```
... e ... f ... e ...
```

for distinct pair channels `e != f`.

A **three-channel visit** contains all three members of `E`.

K4 is an enrichment of the state kernel. A system can satisfy K0/K1 without a long enough qualified trace to establish K4.

## 9. Operational-ablation obligation K5

The phrase “dropping one relation destroys transition determinacy” must not be tested by merely deleting one coordinate `dij`.

That would be mathematically invalid here because K0 makes any one pair difference reconstructible from the other two.

K5 therefore means **dynamical relation ablation**:

> remove the transition/coupling information carried specifically by one pair channel while retaining the other qualified observables, and test whether the exact finite transition law remains closed/determinate without reconstructing the removed dynamics from its forbidden channel.

A valid K5 test must freeze, before execution:

1. the transition target being predicted;
2. the retained antecedent observables;
3. exactly what information is removed with one pair channel;
4. the collision/contradiction criterion.

Coordinate omission alone cannot qualify K5.

K5 is currently **UNPROVED** for the shared object and remains a required falsifier before any exact UC4A↔CPCX isomorphism claim.

## 10. Conformance levels

The checker will report these levels independently.

### Historical UC4A / exchange-phase bridge

Inputs:

- `CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json`
- `CPC_FORMULA_COUPLED_GAUGE_EQUATION_BRIDGE_0_1.json`
- `UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json`

Tests:

- H-K0: exact pair-delta circuit closure;
- H-K1: exact off-diagonal incidence on every transition and on persistent transitions;
- H-K0-S: S3 invariance;
- H-K2: degree-1 contradiction with degree-2 closure;
- H-REGIME: recurring UC4A defect survives width/height parity regimes and WIDTH2/HEIGHT2 families;
- H-K4: report only if an exact ordered pair-channel re-entry trace is actually present; do not infer it from “bidirectional” wording.

### Current CPCX

Inputs are generated from current structural diagnostics only.

Tests:

- C-K0: exact circuit closure on the anonymous three-role support vectors;
- C-K1: every non-stutter support transaction changes exactly the two incident pair differences;
- C-K0-S: S3 invariance;
- C-K3: exact carrier-destruction/re-coordination witness;
- C-K4: mechanically reconstructed 0.2 pair-channel words, including three-channel visit and re-entry where present;
- C-K5: not claimed unless a separately frozen operational-ablation experiment passes.

## 11. Shared-kernel decision

The conformance checker may report:

- `SHARED_KERNEL` only if both systems pass K0, K1, and S3 invariance;
- `SHARED_ENRICHMENT_PARTIAL` when stronger K2/K3/K4 properties are present but not independently qualified on both sides;
- `EXACT_ISOMORPHISM_NOT_ESTABLISHED` unless all claimed topology requirements are independently witnessed, including a valid K5 if it is required by the theorem statement.

The existing evidence is expected to be tested, not assumed.

## 12. External comparison gate

No three-body/Faddeev comparison is permitted by this experiment until the internal checker has frozen:

1. the exact shared kernel;
2. which enrichments are common versus one-sided;
3. which obligations remain open.

Only that anonymous object may be compared externally.

## Falsifiers

Preserve a negative or partial result if:

- the circuit fails on a qualified source;
- off-diagonal incidence has any exact failure;
- S3 invariance fails;
- historical K2 disappears under the frozen source artifacts;
- the CPCX re-coordination witness is absent;
- the 0.2 seam does not actually visit all three pair channels or re-enter one;
- historical ordered re-entry is not present;
- K5 cannot be made meaningful without violating K0.

## Boundary

This design uses no W/D/L oracle, solved labels, best-move information, minimax values, remoteness values, or three-body premise.

It does not modify production CPC, JSMinSys, the active CPCX branch, or any solver.
