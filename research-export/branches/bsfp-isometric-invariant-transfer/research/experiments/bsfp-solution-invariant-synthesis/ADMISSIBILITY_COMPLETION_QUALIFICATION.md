# Solution-to-solution synthesis: admissibility completion qualification

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **promoted within qualified scope**

## Qualified synthesis

The bounded BSFP experiment qualifies a useful parent relation between legal-slice rejection, realizability completion, and Isometric observation-specific identity:

> **Minimal Admissible Completion Antichain Law.** For a positive monotone constraint record under a fixed bounded admissibility/cardinality context, the exact semantic boundary is the antichain of minimal admissible completions. Empty antichain means exact impossibility in that context; a nonempty antichain is the exact minimal realization boundary. Equality of these guarded antichains is therefore a valid semantic identity for observations that depend only on admissible realization.

This does **not** identify rejection and completion as the same operation. They are different observations of the same boundary object.

## Experimental authority

Executable qualifier on `experiment/bsfp-clause-coverage`:

`research/experiments/cuda-bsfp-clause-coverage/qualify-admissibility-completion-synthesis.mjs`

Qualified experimental head:

`916e59f3ceeeb7340a927e25646a7b1455e1658d`

Workflow:

- `bsfp-clause-coverage-experimental`
- run `35054793394`
- job `104662576644`
- result: green

Hard bounds:

- 9 captured real hot-merge segments
- 4,176 raw pair occurrences
- 1,500,000 maximum brute-force anchor subset checks
- 30-second wall-clock leash
- no new solver descent
- no timeout extension

Observed qualifier wall time: 4,954 ms.

## Core result

Across the captured workload:

- exact raw coverage classes: **2,098**
- exact infeasible classes: **1,593**
- exact infeasible occurrences: **3,415**
- feasible raw coverage classes: **505**
- exact guarded completion identities: **464**
- completion identities receiving multiple feasible raw coverage classes: **27**
- feasible coverage classes collapsed by completion identity: **41**
- coverage-to-clause inversion mismatches: **0**

Thus completion identity is strictly stronger than raw coverage equality for the legal-slice observation on this workload.

## Guard hierarchy

Current cheap legal-slice guard:

- rejected classes: 1,528
- rejected occurrences: 3,325
- false rejects: 0
- missed exact infeasible classes: 65
- missed exact infeasible occurrences: 90
- remaining-budget <= 1 cases: 935
- mismatches inside remaining-budget <= 1: 0

Budget-2 completion certificate:

- additional rejected classes: **59**
- additional rejected occurrences: **84**
- false rejects: **0**
- exact infeasible classes still missed: **6**
- exact infeasible occurrences still missed: **6**
- remaining-budget <= 2 cases: 1,064
- mismatches inside remaining-budget <= 2: 0

The budget-2 rule therefore eliminates **59 of the 65** infeasible classes missed by the current cheap guard (90.7692%) without false rejection on the qualified controls.

The 59 additional classes are concentrated in three captured segments:

- `4x5c4-job0`: 2
- `4x4c3-job0`: 22
- `4x4c3-job1`: 35

## Independent anchor

Anchor support: `3,1,1,3,3`

- raw pairs: 608
- exact coverage classes: 245
- exact-cardinality ownership assignments: 462
- brute subset checks: 503,808
- minimal-completion mismatches: 0
- feasibility mismatches: 0
- exact legal-slice mismatches: 0
- completion-identity legal-slice mismatches: 0
- completion-identity classes: 83

This independent brute-force cross-check is what upgrades the relation from analogy to qualified semantic identity.

## Isometric consequence

This result sharpens the `S / Q / P` distinction already used by Isometric.

### Structural identity `S`

A WSL/structural signature may identify candidate matches, but it is not automatically an admissibility or proof reuse key.

### Observation-specific semantic identity `Q_adm`

For the admissibility observation, a stronger exact identity is available:

`Q_adm(A,B) := same guarded minimal-completion antichain`

with the admissibility context treated as part of the key.

This identity can merge records that are structurally or coverage-distinct while preserving the exact legal-slice observation.

### Proof/certificate identity `P`

The completion antichain can also act as an exact positive certificate of minimal realizability, but that does not by itself prove equivalence for unrelated solver transitions or game-state claims. Promotion to broader `P` reuse still requires the declared proof observation and guard.

## Typed-guard implication

The experiment supports treating admissibility guards as a hierarchy of exact certificate strengths rather than unrelated predicates:

`budget-0 exact emptiness certificate`
`-> budget-1 exact emptiness certificate`
`-> budget-2 exact emptiness certificate`
`-> fuller minimal-completion antichain`

This gives the Isometric framework a concrete example of **guard refinement by preservation strength**: the representation can carry a cheap exact guard at the hot boundary and promote to a richer certificate only where the operation needs it.

The six residual infeasible classes after budget 2 are load-bearing evidence that this hierarchy must stay explicit; budget-2 identity is not full completion identity.

## Relationship to guarded representative reuse

The previously qualified Guarded Commuting Transporter Law says representative work may be reused only under an operation-relative exact identity and guard.

Completion identity supplies one such operation-relative identity:

`many raw coverage records`
`-> same guarded completion antichain`
`-> one legal-slice semantic class`

For legal-slice-only work, occurrence multiplicity can be erased after the guarded identity has been established. For any later operation sensitive to the original record, the original occurrence/context still has to be retained or recoverable.

## Shared infrastructure justified

The synthesis supports reusable infrastructure around:

- positive monotone constraint-family representation
- exact cardinality / remaining-budget context
- minimal completion/transversal antichain
- emptiness certificate strength/depth
- guarded completion identity
- provenance / authority scope
- observation kind for which the identity is valid

It does **not** justify a monolithic solver kernel shared across every representation.

## Boundaries retained

- positive monotonicity is required by this qualified law;
- cardinality/admissibility context is part of semantic identity;
- completion equality is not global state equality;
- structural/WSL equality alone is not completion equality;
- budget-2 is an exact bounded-depth certificate, not full completion;
- six exact infeasible classes remain outside the budget-2 certificate in the captured workload;
- full completion computation is not automatically a hot-path optimization;
- no new CUDA-JS API follows from this result alone;
- no claim is made that unrelated transitions commute under completion identity.

## Disposition

**PROMOTE minimal admissible completion antichains as a typed observation-specific semantic identity/certificate family inside Isometric.**

**PROMOTE budget-depth as an explicit certificate-strength parameter, with budget <= 2 now independently qualified on the captured BSFP controls.**

**REJECT any interpretation that WSL/structural equality, raw coverage equality, and completion identity are interchangeable global equivalence relations.**
