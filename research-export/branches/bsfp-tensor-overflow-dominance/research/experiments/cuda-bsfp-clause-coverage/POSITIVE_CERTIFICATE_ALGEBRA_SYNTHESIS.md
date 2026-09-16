# Positive-certificate algebra synthesis

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **promoted within qualified scope**

## Research question

Does the exact minimal-admissible-completion boundary qualified for positive clause records compose under the same upward-antichain product already used by the maintained ownership representation, and does that composition expose useful work elimination before the captured clause product?

The candidate was accepted only if:

1. direct completion of the merged positive-clause record exactly matched certificate-side composition on every captured pair;
2. completion-equivalent representatives produced identical composed certificates;
3. an independent exact-cardinality anchor preserved the same legal slice;
4. the experiment exposed operationally useful work elimination rather than only a common data shape;
5. negative controls demonstrated which guards/context fields were load-bearing.

## Qualified law

For a fixed positive-monotone admissibility context with exact ownership cardinality `k`, let `C_k(A)` be the subset-minimal antichain of admissible ownership completions of positive clause family `A`.

The captured workloads qualify:

`C_k(A union B) = min_subset { x union y | x in C_k(A), y in C_k(B), |x union y| <= k }`

The right-hand side is exactly the maintained ownership-side upward-antichain product: pairwise ownership-mask OR followed by `normalizeMinimalOwnershipAntichain`, with the exact-count capacity guard retained.

This is a **guarded positive-certificate product homomorphism** for the declared admissibility observation. It is not global state identity and it is not an unguarded blocker involution.

## Experimental authority

Executable qualifier:

`research/experiments/cuda-bsfp-clause-coverage/qualify-positive-certificate-algebra.mjs`

Qualified head:

`a420af04443b09cd8a30acaf23d5377a19c09abe`

Workflow evidence:

- workflow: `bsfp-clause-coverage-experimental`
- run: `35055915045`
- job: `104665958624`
- step: `Qualify positive-certificate algebra synthesis`
- result: green

Hard leashes:

- captured merge segments: 9
- raw pair occurrences: 4,176
- certificate union-product budget: 1,500,000
- wall-clock leash: 30 seconds
- no new solver descent
- no timeout extension

Observed wall time: **3,747 ms**.

## Exact composition result

Across the nine captured real hot merges:

- raw pair occurrences: **4,176**
- input coverage records: **391**
- input coverage-to-clause inversion mismatches: **0**
- exact merged coverage classes: **2,098**
- feasible merged completion identities: **464**
- direct-vs-composed certificate mismatches: **0**
- completion-representative reuse mismatches: **0**
- certificate-side ownership union products evaluated by the qualifier: **45,198**

The cross-representation equality is therefore operational, not cosmetic: the clause-side conjunction/normalized union and ownership-side OR/minimal-antichain product commute through the guarded completion map on every captured pair.

## New pre-product work elimination

Empty child completion certificates make an entire row or column of the Cartesian product impossible before the pair operation is evaluated.

Observed across the captured workload:

- raw pairs: **4,176**
- pairs eliminated from an empty input completion certificate: **1,047**
- remaining feasible certificate-class pairs: **3,129**
- pair-count reduction before the product: **25.07183908045977%**

This is exact within the qualified context: an empty child certificate means there is no admissible exact-cardinality ownership assignment satisfying that child positive-clause record, so conjoining it with any partner cannot restore feasibility.

Per captured segment:

| segment | raw pairs | pre-rejected pairs |
| --- | ---: | ---: |
| `5x4c4-job0` | 608 | 38 |
| `5x4c4-job1` | 580 | 60 |
| `5x4c4-job2` | 560 | 128 |
| `5x4c4-job3` | 551 | 211 |
| `5x4c4-job4` | 550 | 130 |
| `4x5c4-job0` | 234 | 65 |
| `4x5c4-job1` | 190 | 40 |
| `4x4c3-job0` | 462 | 190 |
| `4x4c3-job1` | 441 | 185 |

Total: **1,047 / 4,176 pairs removed before composition**.

## Input identity result

The same captured inputs produced:

- feasible input completion classes: **332**
- feasible input coverage records collapsed by completion identity inside the same qualified context: **0**

Therefore this particular workload does **not** support a claim that completion identity further quotients the feasible *input* frontiers before the product. The qualified pre-product reduction comes from exact infeasibility/empty certificates, not from same-context feasible-input deduplication.

This contrasts with the previously qualified merged-output observation, where 505 feasible coverage classes collapsed to 464 completion identities. Completion identity is useful, but where it produces quotient savings is workload/stage dependent.

## Capacity guard is load-bearing

The qualifier deliberately recomputed certificate products without the exact-count capacity guard.

Result:

- **2,368 uncapped capacity counterexamples**

These are merged cases where an unguarded ownership-antichain product remains nonempty even though the bounded direct completion is empty. Therefore pairwise OR + minimal normalization alone is not the qualified algebra. The cardinality guard is part of the operation.

The exact reusable operation is:

`pairwise OR -> exact-count cap -> subset-minimal normalization`

not merely:

`pairwise OR -> subset-minimal normalization`.

## Context fingerprint is load-bearing

The qualifier also looked for the same raw completion-antichain key appearing under distinct admissibility contexts.

Result:

- **23 completion-key collisions across multiple contexts**

Thus a raw completion key is not a globally safe semantic ID. At minimum, the identity contract must scope the certificate by the operation/admissibility context, including the support/universe and exact-count semantics; beneficiary/observation semantics must also remain explicit where they affect the interpreted proposition.

## Independent anchor

Anchor support:

`3,1,1,3,3`

Anchor evidence:

- raw pairs: **608**
- exact merged coverage classes: **245**
- exact-cardinality ownership assignments: **462**
- clause-semantics versus certificate-semantics slice mismatches: **0**

This independently verifies that the certificate antichain preserves the exact-cardinality upward legal slice on the anchor, not merely that two implementations happen to emit the same canonical strings.

## Performance boundary

The semantic algebra is qualified; wholesale replacement economics are **not**.

The qualifier performed **45,198 certificate union products** to validate the composition across a workload containing only 4,176 raw left/right record pairs. Those counts are different work units, so they are not a direct runtime comparison, but they are sufficient to reject any unsupported claim that full certificate composition is intrinsically cheaper than the existing packed coverage product.

The currently justified operational use is narrower:

1. cheaply obtain or reuse a bounded completion/emptiness certificate where available;
2. prune an impossible input row/column before downstream pair work;
3. retain packed coverage or another qualified representation for the remaining product unless native evidence proves certificate-side composition is cheaper;
4. use exact completion identity as a later semantic quotient only where the relevant stage actually exhibits collisions.

## Relationship to existing absorption/result-identity pipeline

The captured packed pipeline already has strong independent reductions:

- core-relative absorption eliminates most raw pair work;
- exact generated-result identity removes additional duplicate results;
- legal-slice guards then reject inadmissible results.

The new 25.07% pre-product certificate pruning must **not** simply be added numerically to those reductions. Its overlap with core/envelope absorption has not yet been measured.

The next meaningful optimization question is therefore an ordering/overlap question:

`empty child certificate pruning`
`vs`
`core/envelope absorption`
`vs`
`exact result quotient`

Only the incremental work eliminated after accounting for overlap should motivate production placement.

## Architectural consequence

Promote a shared positive-certificate algebra interface with explicit guard/context, not a single universal representation.

The reusable pieces are:

- positive-clause antichain input
- minimal admissible completion/ownership antichain
- pairwise union/OR product
- subset-minimal normalization
- exact-count/capacity guard
- empty-certificate infeasibility
- context fingerprint
- observation-specific certificate identity
- provenance / evidence scope

Clause coverage and ownership antichains are therefore qualified as two guarded views connected by a compositional semantic map for this observation.

## Boundaries retained

- positive monotonicity is load-bearing;
- exact cardinality/capacity is part of the operation;
- completion identity is context-relative;
- the bounded completion transform is non-injective and is not promoted as a global blocker involution;
- no same-context feasible-input quotient saving was observed on these 391 captured inputs;
- the 25.07% pair reduction may overlap substantially with already-qualified core absorption;
- no native runtime superiority of certificate-side composition has been shown;
- no new CUDA-JS primitive is implied by this result alone;
- no solver horizon or descent was expanded.

## Disposition

**PROMOTE the Guarded Positive-Certificate Product Homomorphism within fixed positive-monotone exact-cardinality admissibility scope.**

**PROMOTE empty input completion certificates as an exact pre-product row/column rejection mechanism: 1,047 / 4,176 captured pairs eliminated before product evaluation.**

**RETAIN the exact-count guard and context fingerprint as mandatory parts of the certificate identity/operation: 2,368 uncapped counterexamples and 23 cross-context raw-key collisions demonstrate both are load-bearing.**

**DO NOT promote wholesale certificate-side replacement of packed coverage composition on performance grounds; 45,198 certificate union products were required by the qualifier and native economics remain unmeasured.**
