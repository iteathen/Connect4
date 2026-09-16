# Admissibility completion synthesis

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **promoted within qualified scope**

## Research question

Can the existing exact legal-slice rejection rules and direct realizability/completion machinery be expressed by one exact positive-monotone boundary object that both explains rejection and exposes new reusable semantic identity?

The candidate was accepted only if it did more than rename the existing budget-0/1 guard. It had to preserve exact legal-slice semantics, agree with an independent brute-force authority on the anchor workload, and either reject additional impossible work or expose a new exact semantic quotient.

## Promoted law

> **Minimal Admissible Completion Antichain Law.** For a positive monotone constraint record under a bounded ownership/cardinality context, the exact admissible boundary is the antichain of minimal admissible completions. Exact rejection is equivalent to this antichain being empty. Bounded-depth legal-slice guards are exact emptiness certificates within their declared remaining-budget depth. Direct realizability/completion uses the nonempty antichain itself.

Conceptually:

`positive constraint record`
`-> minimal admissible completion antichain Comp(A,k,C)`
`-> empty: exact impossible/reject`
`-> nonempty: exact boundary of realizable completions`

Two records may therefore be distinct as raw coverage records yet semantically identical for the declared legal-slice observation when their guarded minimal-completion antichains are identical.

## Bounded falsifier

Executable qualifier:

`research/experiments/cuda-bsfp-clause-coverage/qualify-admissibility-completion-synthesis.mjs`

Qualified experimental head:

`916e59f3ceeeb7340a927e25646a7b1455e1658d`

Workflow evidence:

- workflow: `bsfp-clause-coverage-experimental`
- run: `35054793394`
- job: `104662576644`
- step: `Qualify admissibility completion synthesis`
- result: green

Hard leashes:

- captured real merge segments: 9
- raw product pairs: at most 4,176
- brute-force anchor subset checks: at most 1,500,000
- wall clock: 30 seconds
- no new solver descent
- no timeout extension

Observed qualifier wall time: **4,954 ms**.

## Exact workload reconstruction

Across the nine captured hot merges:

- raw pair occurrences: **4,176**
- exact raw coverage classes after deduplication: **2,098**
- coverage-to-clause inversion mismatches: **0**

This unit operates on the existing captured real workloads only. It does not widen the search horizon or regenerate a new game-space sample.

## Exact completion result

Across all 2,098 exact coverage classes:

- exact infeasible classes: **1,593**
- exact infeasible occurrences: **3,415**
- feasible coverage classes: **505**
- exact feasible completion-identity classes: **464**
- completion-identity collision classes: **27**
- feasible raw coverage classes collapsed by completion identity: **41**

The completion boundary therefore provides two independently useful outcomes:

1. an exact infeasibility predicate through antichain emptiness;
2. a stricter semantic identity quotient over feasible records.

The second point matters: **505 feasible coverage classes collapse to 464 exact completion identities**. Raw coverage equality is therefore not the strongest exact identity available for the legal-slice observation.

## Existing cheap guard

The current bounded-capacity guard produced:

- rejected classes: **1,528**
- rejected occurrences: **3,325**
- false rejects: **0**
- exact infeasible classes missed: **65**
- exact infeasible occurrences missed: **90**
- cases with remaining budget <= 1: **935**
- mismatches within remaining budget <= 1: **0**

Interpretation:

The existing budget-0/1 rules are not merely heuristic on their declared depth. On this captured workload they are exact bounded-depth emptiness certificates. Their incompleteness begins beyond that declared remaining-budget depth.

## Budget-2 extension

Extending the same completion criterion to remaining budget 2 produced:

- additional rejected classes beyond the current cheap guard: **59**
- additional rejected occurrences: **84**
- false rejects: **0**
- exact infeasible classes still missed afterward: **6**
- exact infeasible occurrences still missed afterward: **6**
- cases with remaining budget <= 2: **1,064**
- mismatches within remaining budget <= 2: **0**

Thus the bounded budget-2 extension removes **59 / 65 = 90.7692%** of the exact infeasible classes missed by the current cheap guard while preserving zero false rejection on the qualified workload.

The additional budget-2 eliminations occur in the captured segments as follows:

- `4x5c4-job0`: 2 classes
- `4x4c3-job0`: 22 classes
- `4x4c3-job1`: 35 classes

Total: **59**.

The other six captured segments add no new rejection beyond the current guard at remaining budget 2.

## Independent anchor authority

Anchor support:

`3,1,1,3,3`

Anchor workload:

- raw pairs: **608**
- exact coverage classes: **245**
- exact-cardinality ownership assignments: **462**
- brute subset checks: **503,808**

Independent checks:

- minimal-completion antichain mismatches: **0**
- feasibility mismatches: **0**
- exact legal-slice mismatches: **0**
- completion-identity legal-slice mismatches: **0**
- completion-identity classes on the anchor: **83**

This is the critical falsification boundary: minimal transversals/completions were not accepted by algebraic analogy alone. They were checked against brute-force exact-cardinality ownership assignments on the 608-pair anchor.

## Exact relationship between rejection and completion

The synthesis does **not** say that legal-slice rejection and realizability completion are the same operation.

They are two observations of the same exact boundary object:

- **rejection observation:** `Comp(A,k,C) = empty`
- **completion observation:** return `Comp(A,k,C)`

This distinction remains load-bearing. A rejection-only implementation may stop at an emptiness certificate; a construction/proof implementation needs the actual completion antichain.

## New semantic quotient

For the declared legal-slice observation and fixed guard/context, define:

`A ~ B iff Comp(A,k,C) = Comp(B,k,C)`

The qualified workload contains distinct feasible coverage classes in the same completion-equivalence class:

- 505 feasible coverage classes
- 464 completion identities
- 41 coverage classes removed by quotienting
- 27 completion identities receive multiple raw feasible coverage classes

This quotient is stronger than exact coverage equality for the legal-slice observation, but narrower than global state identity.

It is context-relative: exact count/cardinality, support/cell domain, beneficiary/constraint interpretation, and admissibility guard are part of the identity contract.

## Architectural consequence

Promote a typed admissibility boundary contract rather than separate ad-hoc notions of rejection and completion.

Conceptually useful fields include:

- `constraintContext` / guard fingerprint
- exact cardinality / remaining budget
- positive unsatisfied-clause family
- minimal completion antichain
- emptiness certificate class
- completion identity / canonical antichain ID
- provenance / authority scope

A staged implementation may then use the cheapest exact certificate justified by the remaining budget:

`forced overflow / budget 0`
`-> budget 1 exact certificate`
`-> budget 2 exact certificate`
`-> fuller completion antichain only when economically justified`

The experiment does **not** justify computing the full completion antichain for every hot-path occurrence. It justifies the boundary abstraction and the exact bounded-depth specializations.

## Relationship to prior synthesis results

This result composes naturally with the already-qualified exact-result quotient:

1. collapse exact duplicate generated results;
2. apply admissibility/completion logic once per exact result class;
3. where feasible, optionally quotient further by guarded completion identity for subsequent legal-slice-only work.

It also fits the Guarded Commuting Transporter Law: completion identity is an operation-relative semantic identity, not a claim that the original records are globally identical.

## Isometric interpretation

The result supplies another concrete example of why Isometric must distinguish structural discovery identity from observation-specific semantic identity.

A raw structural or coverage signature can point to candidates, but legal-slice reuse may be justified by the stronger guarded completion identity:

`S candidate`
`-> exact admissibility context`
`-> completion antichain identity`
`-> legal-slice semantic reuse`

No claim is made that completion identity is sufficient for unrelated transition, proof, or game-state observations.

## Boundaries retained

- positive monotonicity is load-bearing;
- the completion antichain is guarded by the declared exact-cardinality/admissibility context;
- empty completion means impossible only inside that context;
- equal completion antichains do not imply equal original records or global state identity;
- budget-2 exactness is qualified only for the declared remaining-budget-2 rule and captured real controls;
- six exact infeasible classes remain beyond the budget-2 certificate on this workload;
- no claim is made that full completion computation is cheaper than all specialized guards;
- no new CUDA-JS primitive is implied by this research result alone;
- no solver horizon or descent was expanded.

## Disposition

**PROMOTE the Minimal Admissible Completion Antichain Law within positive-monotone bounded-admissibility scope.**

**PROMOTE the budget-2 exact emptiness certificate as a qualified next legal-slice guard candidate: 59 additional infeasible classes / 84 occurrences, zero false rejects, zero mismatches within remaining budget <= 2.**

**PROMOTE guarded completion-antichain equality as an exact legal-slice semantic quotient: 505 feasible coverage classes -> 464 completion identities on the captured workload.**

**RETAIN the six residual exact-infeasible classes as evidence that budget-2 is still a bounded certificate, not full admissibility completion.**
